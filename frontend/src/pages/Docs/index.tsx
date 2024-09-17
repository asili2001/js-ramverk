import './main.scss';
import { Document } from './types';
import previewImg from '../../assets/previewImg.png';
import DocumentsNavbar from '../../components/Navbar/DocumentsNavbar';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';

const Documents = () => {
  const navigate = useNavigate();
  const documents: Document[] = [
    {
      id: 1,
      usersWithAccess: [
        {
          id: 1,
          name: 'Ahmad Asili',
          email: 'ahmadasili1928@gmail.com',
          accessLevel: 'owner',
        },
        {
          id: 1,
          name: 'Axel Jönsson',
          email: 'axel@gmail.com',
          accessLevel: 'editor',
        },
      ],
      title: 'Assignment 1',
    },
    {
      id: 2,
      usersWithAccess: [
        {
          id: 1,
          name: 'Ahmad Asili',
          email: 'ahmadasili1928@gmail.com',
          accessLevel: 'owner',
        },
        {
          id: 1,
          name: 'Axel Jönsson',
          email: 'axel@gmail.com',
          accessLevel: 'editor',
        },
      ],
      title: 'Assignment 1',
    },
    {
      id: 3,
      usersWithAccess: [
        {
          id: 1,
          name: 'Ahmad Asili',
          email: 'ahmadasili1928@gmail.com',
          accessLevel: 'owner',
        },
        {
          id: 1,
          name: 'Axel Jönsson',
          email: 'axel@gmail.com',
          accessLevel: 'editor',
        },
      ],
      title: 'Assignment 1',
      previewImage: previewImg,
    },
  ];

  return (
    <div className="documents-page">
      <DocumentsNavbar />
      <div className="document-list">
        {documents.map((document, index) => {
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

      <div className="new-document-btn">
        <FaPlus />
      </div>
    </div>
  );
};

export default Documents;
