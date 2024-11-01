import { useNavigate, useParams } from 'react-router-dom';
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import CodeBox from '../../components/CodeBox';
import './main.scss';
import { useEffect, useState } from 'react';
import useAPIDocs from '../../hooks/useAPIDocs';
import LoadingSpinner from '../../components/Loading';

const Document = () => {
	const { documentId } = useParams();
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
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


	// Use the WebSocket hook for handling document updates
	if (!documentId) return;


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
				<CodeBox
					editable
				/>
				{isLoading && <LoadingSpinner floating />}
			</div>
		)
	);
};

export default Document;
