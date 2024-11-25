import './main.scss';
import DocumentsNavbar from '../../components/Navbar/DocumentsNavbar';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaCode } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import useAPIDocs from '../../hooks/useAPIDocs';
import LoadingSpinner from '../../components/Loading';

const Documents = () => {
	const [docs, setDocs] = useState<Doc[]>([]);
	const navigate = useNavigate();
	const { getDocs, newDoc, isLoading } = useAPIDocs();
    const [chooseDoc, setChooseDoc] = useState(false);

	const loadDocs = async () => {
		const result = await getDocs();
		setDocs(result);
	};

	const handleNewDocCreation = async () => {
		const newDocument = await newDoc('Untitled', "text");
		if (newDocument) {
			navigate(`/documents/${newDocument.id}`);
		}
	};

	const handleNewCodeDocCreation = async () => {
        const newDocument = await newDoc('Untitled', "code");

        if (newDocument) {
            navigate(`/documents/${newDocument.id}`);
        }
    };

	const toggleDocBox = async () => {
        setChooseDoc(chooseDoc => !chooseDoc);
    };

	useEffect(() => {
		loadDocs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className="documents-page">
			<DocumentsNavbar />
			{isLoading && <LoadingSpinner floating />}
			<div className="document-list">
				{docs.map((document, index) => {
					const documentOwner = document.usersWithAccess.find(
						(user) => user.accessLevel === 'owner'
					);
					const totalUsersWithAccess = document.usersWithAccess.length - 1;
					return (
						<div
							key={index}
							className="document-card"
							onClick={() => navigate(`/documents/${document.id}`)}
						>
							<img className="preview" src={document.previewImage} alt="" />
							<div className="detailes">
								<h3>{document.title}</h3>
								<p>
									{documentOwner?.name}
									{totalUsersWithAccess > 0
										? ` + ${totalUsersWithAccess} Other`
										: ''}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="new-document-btn" onClick={toggleDocBox}>
				<FaPlus />
			</div>

			{ chooseDoc &&
				<div className="new-doc-box">
					<div className="create-doc-btn" onClick={handleNewDocCreation}>
						<FaPlus className="new-doc-icon"/><p className="new-doc-text">New Doc</p>
					</div>
					<div className="create-doc-btn" onClick={handleNewCodeDocCreation}>
						<FaCode className="new-doc-icon"/><p className="new-doc-text">New Code</p>
					</div>
				</div>
			}
			
		</div>
	);
};

export default Documents;
