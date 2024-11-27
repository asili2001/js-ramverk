import { useNavigate, useParams } from 'react-router-dom';
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import './main.scss';
import { useEffect, useState } from 'react';
import useAPIDocs from '../../hooks/useAPIDocs';
import LoadingSpinner from '../../components/Loading';
import useDocSocket, { RChange, RChangeData } from '../../hooks/useDocSocket';
import TextBox from '../../components/TextBox';
import { RawDraftContentState } from 'draft-js';
import LZString from 'lz-string';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_DOCUMENT, GET_DOCUMENT } from '../../api/queries';
import { DropDownMenuContent } from '../../components/DropDownMenu/types';
import { FaShare, FaTrash } from 'react-icons/fa';
import DocShare from './DocShare';
import toast from 'react-hot-toast';

function isRawDraftContentState(data: unknown): data is RawDraftContentState {
	// Check if data is an object and has 'blocks' and 'entityMap' properties
	return (
		typeof data === 'object' &&
		data !== null &&
		'blocks' in data &&
		Array.isArray(data.blocks) &&
		'entityMap' in data &&
		typeof data.entityMap === 'object' &&
		data.entityMap !== null
	);
}

const Document = () => {
	const { documentId } = useParams();
	const [title, setTitle] = useState('');
	const emptyRawContentState: RawDraftContentState = {
		blocks: [],
		entityMap: {},
	};
	const { loading, error, data } = useQuery(GET_DOCUMENT, { variables: { docId: documentId } });
	const navigate = useNavigate();

	useEffect(() => {
		if (error) {
			toast.error(error.message);
			navigate('/documents');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [error]);

	const documentData: Doc | null = data ? data.getDocument : null;
	const [deleteDoc] = useMutation(DELETE_DOCUMENT);
	const [content, setContent] = useState<RawDraftContentState>(emptyRawContentState);
	const [docShareModal, setDocShareModal] = useState<boolean>(false);
	const [recivedUpdate, setRecivedUpdate] = useState<{
		changes: RawDraftContentState[];
		currentBlockKeys: string[];
	} | null>(null);
	const { updateDoc } = useAPIDocs();

	const loadDoc = async () => {
		if (!documentId || !documentData) return;
		if (!documentData) {
			navigate('/documents');
			return;
		}
		const receivedDoc = JSON.parse(
			LZString.decompress(documentData.content)
		) as RawDraftContentState;

		if (isRawDraftContentState(receivedDoc)) {
			setContent(receivedDoc);
		} else {
			setContent(emptyRawContentState);
		}

		setTitle(data.getDocument.title);
	};

	useEffect(() => {
		loadDoc();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [documentId, data]);

	const handleSocketUpdate = (recived: RChange[]) => {
		const recivedItemsNotOwned: RawDraftContentState[] = [];
		let currentBlockKeys: string[] = [];
		recived.forEach((recivedItem) => {
			const receivedChange = JSON.parse(LZString.decompress(recivedItem.data)) as RChangeData;
			if (recivedItem.owner !== socket.current?.id) {
				recivedItemsNotOwned.push(receivedChange.content);
				currentBlockKeys = receivedChange.currentBlockKeys ?? [];
			}
		});

		if (recivedItemsNotOwned.length > 0 && currentBlockKeys)
			setRecivedUpdate({ changes: recivedItemsNotOwned, currentBlockKeys: currentBlockKeys });
	};

	const { socket, submitChange, updateDocument } = useDocSocket(documentId, handleSocketUpdate);

	const handleTitleChange = async (newTitle: string) => {
		setTitle(newTitle);
		if (documentId) {
			updateDocument({ title: newTitle });
		}
	};

	const handleDocumentDelete = async () => {
		if (!documentId) return;
		const { data } = await deleteDoc({ variables: { docId: documentId } });
		if (data.deleteDocument) {
			navigate('/documents');
			return;
		}
	};

	const menuBarItems: Record<string, DropDownMenuContent[]> = {
		File: [
			{
				title: 'Share',
				icon: FaShare,
				action: () => setDocShareModal(true),
				shortCutKeys: ['Alt', 's'],
				disabled:
					documentData?.usersWithAccess.some(
						(item) => item.isRequester && item.accessLevel !== 'owner'
					) ?? false,
			},
		],
		Edit: [
			{
				title: 'Delete',
				icon: FaTrash,
				action: handleDocumentDelete,
				shortCutKeys: ['Ctrl', 'd'],
				disabled:
					documentData?.usersWithAccess.some(
						(item) => item.isRequester && item.accessLevel !== 'owner'
					) ?? false,
			},
		],
	};

	if (loading) return <LoadingSpinner floating />;

	return (
		!loading &&
		documentId && (
			<>
				{docShareModal && (
					<DocShare onClose={() => setDocShareModal(false)} document={documentData} />
				)}
				<div className="document-page">
					<DocumentNavbar
						documentTitle={title}
						onTitleChange={handleTitleChange}
						menuBarItems={menuBarItems}
					/>
					<TextBox
						initialContent={content}
						onChange={submitChange}
						recivedChanges={recivedUpdate}
						editable={
							documentData?.usersWithAccess.some(
								(item) =>
									item.isRequester &&
									['owner', 'editor'].includes(item.accessLevel)
							) ?? false
						}
					/>
				</div>
			</>
		)
	);
};

export default Document;
