import { useNavigate, useParams } from 'react-router-dom';
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import './main.scss';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/Loading';
import useDocSocket, { CommentData, RChange, RChangeData } from '../../hooks/useDocSocket';
import TextBox from '../../components/TextBox';
import { RawDraftContentState } from 'draft-js';
import LZString from 'lz-string';
import { useMutation, useQuery } from '@apollo/client';
import { DELETE_DOCUMENT, GET_DOCUMENT } from '../../api/queries';
import { DropDownMenuContent } from '../../components/DropDownMenu/types';
import { FaShare, FaTrash } from 'react-icons/fa';
import DocShare from './DocShare';
import toast from 'react-hot-toast';
import CodeBox from '../../components/CodeBox';

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
	const [comments, setComments] = useState<CommentData[]>([]);
	const [user, setUser] = useState<User | null>(null);
	const [docType, setDocType] = useState('');
	const [docContent, setDocContent] = useState<string>('');

	const loadDoc = async () => {
		if (!documentId || !documentData) return;
		if (!documentData) {
			navigate('/documents');
			return;
		}
		console.log(LZString.decompress(documentData.content));

		if (data.getDocument.docType === 'text') {
			const receivedDoc = JSON.parse(
				LZString.decompress(documentData.content)
			) as RawDraftContentState;

			setDocType('text');
			if (isRawDraftContentState(receivedDoc)) {
				setContent(receivedDoc);
			} else {
				setContent(emptyRawContentState);
			}
		} else {
			setDocType('code');
			const decompressedContent = LZString.decompress(documentData.content);
			// const parsedContent = JSON.parse(decompressedContent);

			setDocContent(decompressedContent);
		}

		const usersWithAccess: UserWithAccess[] = data.getDocument.usersWithAccess;
		const ownerExists = usersWithAccess.filter((user) => user.accessLevel === 'owner');
		if (!ownerExists) return;
		const owner = ownerExists[0].user;

		setTitle(data.getDocument.title);
		setUser(owner);
		setComments(data.getDocument.comments);
	};

	const handleSocketComments = (data: CommentData) => {
		setTimeout(() => {
			setComments((prevComments) => {
				const foundComment = prevComments.find(
					(comment) => comment.position === data.position
				);
				if (!foundComment) {
					return [...prevComments, data];
				} else {
					return prevComments;
				}
			});
		}, 500);
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

	const { socket, submitChange, updateDocument, submitComment } = useDocSocket(
		documentId,
		handleSocketUpdate,
		handleSocketComments
	);

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
		documentId &&
		user && (
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
					{docType === 'code' ? (
						<CodeBox documentId={documentId} initialContent={docContent} />
					) : (
						<TextBox
							initialContent={content}
							onComment={submitComment}
							setComments={setComments}
							comments={comments}
							owner={user}
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
					)}
				</div>
			</>
		)
	);
};

export default Document;
