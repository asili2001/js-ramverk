import './main.scss';
import DocumentsNavbar from '../../components/Navbar/DocumentsNavbar';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import useAPIDocs from '../../hooks/useAPIDocs';

const Documents = () => {
	const [docs, setDocs] = useState<Doc[]>([]);
	const navigate = useNavigate();
	const { getDocs } = useAPIDocs();

	const loadDocs = async () => {
		const result = await getDocs();
		setDocs(result);
	};

	useEffect(() => {
		loadDocs();
		// eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

	return (
		<div className="documents-page">
			<DocumentsNavbar />
			<div className="document-list">
				{docs.map((document, index) => {
					const documentOwner = document.usersWithAccess.find(
						(user) => user.accessLevel === 'owner'
					);
					const totalUsersWithAccess =
						document.usersWithAccess.length - 1;
					return (
						<div
							key={index}
							className="document-card"
							onClick={() =>
								navigate(`/documents/${document.id}`)
							}
						>
							<img
								className="preview"
								src={document.previewImage}
								alt=""
							/>
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

			<div className="new-document-btn">
				<FaPlus />
			</div>
		</div>
	);
};

export default Documents;
