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
	const [content, setContent] = useState<RawDraftContentState>(emptyRawContentState);
	const [recivedUpdate, setRecivedUpdate] = useState<{changes: RawDraftContentState[], currentBlockKeys: string[]}|null>(null);
	const [user, setUser] = useState<any>('');
	const [recivedCommentUpdate, setRecivedCommentUpdate] = useState<any>(null);
	const [loadedDoc, setLoadedDoc] = useState(false);
	const { getDoc, updateDoc, isLoading } = useAPIDocs();
	const navigate = useNavigate();

	const loadDoc = async () => {
		if (!documentId) return;
		const data = await getDoc(documentId).finally(() => setLoadedDoc(true));
		if (!data) {
			navigate('/documents');
			return;
		}
		// let docContent = emptyRawContentState;
		const receivedDoc = JSON.parse(LZString.decompress(data.content)) as RawDraftContentState;
		console.log("LOADED DOC: ", receivedDoc);
		if (isRawDraftContentState(receivedDoc)) {
			setContent(receivedDoc);
		} else {
			setContent(emptyRawContentState);
		}

		setTitle(data.title);
		setUser(data.usersWithAccess);
		console.log("DATA USERRS WITH ACCESS NAME: ", user)
	};

	useEffect(() => {
		loadDoc();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [documentId]);

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
		
		if (recivedItemsNotOwned.length > 0 && currentBlockKeys) setRecivedUpdate({changes: recivedItemsNotOwned, currentBlockKeys: currentBlockKeys});
	};

	
	// const handleCommentUpdate = (recived: any) => {
	// 	// if (recived.owner !== socket.current.id) {
	// 	// 	setRecivedCommentUpdate(recived);
	// 	// }
	// 	console.log("updating comment. Document.tsx");
	// 	setRecivedCommentUpdate(recived);

	// };

	// Use the WebSocket hook for handling document updates
	if (!documentId) return;
	const { socket, submitChange, submitComment } = useDocSocket(documentId, handleSocketUpdate);

	const handleTitleChange = async (newTitle: string) => {
		setTitle(newTitle);
		if (documentId) {
			await updateDoc(documentId, newTitle);
		}
	};

	return (
		loadedDoc &&
		documentId && (
			<div className="document-page">
				<DocumentNavbar documentTitle={title} onTitleChange={handleTitleChange} />
				<TextBox
					initialContent={content}
					onChange={submitChange}
					onComment={submitComment}
					recivedChanges={recivedUpdate}
					editable={true}
					socketCommentUpdate={recivedCommentUpdate}
				/>
				{isLoading && <LoadingSpinner floating />}
			</div>
		)
	);
};

export default Document;
