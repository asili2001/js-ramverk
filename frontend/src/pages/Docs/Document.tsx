import { useNavigate, useParams } from 'react-router-dom';
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import TextBox from '../../components/TextBox';
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

	const handleDocumentChange = async (draftContent: string) => {
		if (documentId) {
			await updateDoc(documentId, undefined, draftContent);
		}
	};
	const handleTitleChange = async (newTitle: string) => {
		setTitle(newTitle);
		if (documentId) {
			await updateDoc(documentId, newTitle);
		}
	};

	return (
		loadedDoc && (
			<div className="document-page">
				<DocumentNavbar
					documentTitle={title}
					onTitleChange={handleTitleChange}
				/>
				<TextBox
					content={content}
					className="main-textbox"
					onChange={handleDocumentChange}
					editable
				/>
				{isLoading && <LoadingSpinner floating />}
			</div>
		)
	);
};

export default Document;
