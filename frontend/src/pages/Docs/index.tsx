import './main.scss';
import DocumentsNavbar from '../../components/Navbar/DocumentsNavbar';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/Loading';
import { CREATE_DOCUMENT, GET_DOCUMENTS } from '../../api/queries';
import { useMutation, useQuery } from '@apollo/client';
import toast from 'react-hot-toast';

const Documents = () => {
	const [docs, setDocs] = useState<Doc[]>([]);
	const [documentsType, setDocumentsType] = useState<'ALL' | 'SHARED' | 'OWN'>('ALL');
	const navigate = useNavigate();
	const gqlGetDocsRes = useQuery(GET_DOCUMENTS, { variables: { type: documentsType } });
	const [newDoc] = useMutation(CREATE_DOCUMENT);

	useEffect(() => {
		if (gqlGetDocsRes.error) {
			toast.error(gqlGetDocsRes.error.message);
			navigate('/documents');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gqlGetDocsRes.error]);

	useEffect(() => {
		if (!gqlGetDocsRes.data || !gqlGetDocsRes.data.getDocuments) return;

		setDocs(gqlGetDocsRes.data.getDocuments);
	}, [gqlGetDocsRes.data]);

	const handleNewDocCreation = async () => {
		const gqlNewDocRes = await newDoc({ variables: { title: 'Untitled' } });

		if (gqlNewDocRes.data) {
			navigate(`/documents/${gqlNewDocRes.data.createDocument.id}`);
		}
	};

	if (gqlGetDocsRes.loading) return <LoadingSpinner floating />;

	return (
		<div className="documents-page">
			<DocumentsNavbar />
			<div className="doc-filter-btns">
				<button
					className={`primary-button ${documentsType === 'ALL' ? 'active' : ''}`}
					onClick={() => setDocumentsType('ALL')}
				>
					All
				</button>
				<button
					className={`primary-button ${documentsType === 'SHARED' ? 'active' : ''}`}
					onClick={() => setDocumentsType('SHARED')}
				>
					Shared
				</button>
				<button
					className={`primary-button ${documentsType === 'OWN' ? 'active' : ''}`}
					onClick={() => setDocumentsType('OWN')}
				>
					Own
				</button>
			</div>
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
									{documentOwner?.user.name}
									{totalUsersWithAccess > 0
										? ` + ${totalUsersWithAccess} Other`
										: ''}
								</p>
							</div>
						</div>
					);
				})}
			</div>

			<div className="new-document-btn" onClick={handleNewDocCreation}>
				<FaPlus />
			</div>
		</div>
	);
};

export default Documents;
