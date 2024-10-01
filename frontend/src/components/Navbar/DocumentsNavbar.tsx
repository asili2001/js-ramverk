import Logo from '../../assets/logo.svg';
import './main.scss';
import { useNavigate } from 'react-router-dom';

const DocumentsNavbar: React.FC = () => {
	const navigate = useNavigate();

	return (
		<div className="navbar">
			<div className="logo" onClick={() => navigate('/documents')}>
				<img src={Logo} alt="logo" /> <h1>Inker</h1>
			</div>
		</div>
	);
};

export default DocumentsNavbar;