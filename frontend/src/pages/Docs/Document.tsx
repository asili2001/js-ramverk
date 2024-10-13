import { useNavigate, useParams } from 'react-router-dom';
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import TextBox from '../../components/TextBox';
import './main.scss';
import { useEffect, useState } from 'react';
import useAPIDocs from '../../hooks/useAPIDocs';
import LoadingSpinner from '../../components/Loading';
import useDocSocket, { RTextUpdateGeneral, TextDelete, TextInsert, TextReplace, TextUpdateGeneral } from '../../hooks/useDocSocket';

const Document = () => {
	const { documentId } = useParams();
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [recivedUpdate, setRecivedUpdate] = useState<RTextUpdateGeneral|null>(null);
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
		setContent(data.content);
		setTitle(data.title);
	};

	useEffect(() => {
		loadDoc();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [documentId]);

	const handleSocketUpdate = (recived: RTextUpdateGeneral) => {
		if (recived.owner !== socket.current.id) {
			setRecivedUpdate(recived);
		}
	};

	// Use the WebSocket hook for handling document updates
	if (!documentId) return;
	const { socket, insertText, deleteText, replaceText } = useDocSocket(documentId, handleSocketUpdate);
	

	const handleDocumentChange = async (data: TextUpdateGeneral) => {
		if (data.changeType === "replace") {
			const replaceChange = data as TextReplace;
			if (!replaceChange.changedText) return;
			replaceText({
				content: replaceChange.changedText,
				startIndex: replaceChange.startIndex,
				endIndex: replaceChange.endIndex
			})
		}
		else if (data.changeType === "insert") {
			const insertChange = data as TextInsert;
			if (!insertChange.changedText) return;
			insertText({
				content: insertChange.changedText,
				startIndex: insertChange.startIndex,
				endIndex: insertChange.endIndex
			})
		}
		else if (data.changeType === "delete") {
			const deleteChange = data as TextDelete;
			deleteText({
				startIndex: deleteChange.startIndex,
				endIndex: deleteChange.endIndex
			})
		}
	};
	const handleTitleChange = async (newTitle: string) => {
		setTitle(newTitle);
		if (documentId) {
			await updateDoc(documentId, newTitle);
		}
	};

	return (
		loadedDoc && documentId && (
			<div className="document-page">
				<DocumentNavbar
					documentTitle={title}
					onTitleChange={handleTitleChange}
				/>
				<TextBox
					content={content}
					className="main-textbox"
					onChange={handleDocumentChange}
					recivedUpdate={recivedUpdate}
					editable
				/>
				{isLoading && <LoadingSpinner floating />}
			</div>
		)
	);
};

export default Document;
