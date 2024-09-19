// import { useParams } from "react-router-dom";
import DocumentNavbar from '../../components/Navbar/DocumentNavbar';
import TextBox from '../../components/TextBox';
import './main.scss';

const Document = () => {
	//   let { documentId } = useParams();
	const handleDraftChange = (draftContent: string) => {
		console.log(draftContent);
	};
	const handleTitleChange = (newTitle: string) => {
		console.log(newTitle);
	};

	return (
		<div className="document-page">
			<DocumentNavbar
				documentTitle={'Untitled'}
				onTitleChange={handleTitleChange}
			/>
			<TextBox
				content=""
				className="main-textbox"
				onChange={handleDraftChange}
				editable
			/>
		</div>
	);
};

export default Document;
