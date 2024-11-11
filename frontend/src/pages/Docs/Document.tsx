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
import CodeBox from '../../components/CodeBox';
import { Comment } from '../../components/TextBox';

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
	const [docType, setDocType] = useState('');
	const [docContent, setDocContent] = useState('');
	const [comments, setComments] = useState<Comment[]>([]);

	const loadDoc = async () => {
		if (!documentId) return;
		const data = await getDoc(documentId).finally(() => setLoadedDoc(true));
		if (!data) {
			navigate('/documents');
			return;
		}
		// @ts-ignore
		setComments(data.comments);
		if (data.docType === "text") {
			const receivedDoc = JSON.parse(LZString.decompress(data.content)) as RawDraftContentState;
			if (isRawDraftContentState(receivedDoc)) {
				setContent(receivedDoc);
			} else {
				setContent(emptyRawContentState);
			}
		} else if (data.docType === "code") {
			const docContent = LZString.decompress(data.content);
			const docContentDone = LZString.decompress(docContent);

			console.log("data.content decompressed: ", docContent);
			console.log("docContent decompressed: ", docContentDone);

			setDocContent(docContentDone);
			setDocType("code");
		}
		setTitle(data.title);
		setUser(data.usersWithAccess);
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

	
	const handleSocketComments = (data: any ) => {
		setTimeout(() => {
			setComments((prevComments) => {
				const foundComment = prevComments.find(comment => comment.position === data.position);
				if (!foundComment) {
					return [...prevComments, data];
				} else {
					return prevComments;
				}
			});
		}, 500)
	};

	// Use the WebSocket hook for handling document updates
	if (!documentId) return;
	const { socket, submitChange, submitComment } = useDocSocket(documentId, handleSocketUpdate, handleSocketComments);

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
				{docType === "code" ? (
					<CodeBox
						documentId={documentId}
						initialContent={docContent}
					/>
				) : (
				<TextBox
					initialContent={content}
					onChange={submitChange}
					onComment={submitComment}
					recivedChanges={recivedUpdate}
					editable={true}
					socketCommentUpdate={recivedCommentUpdate}
					comments={comments}
					setComments={setComments}
				/>
				)}
				{isLoading && <LoadingSpinner floating />}
			</div>
		)
	);
};

export default Document;
