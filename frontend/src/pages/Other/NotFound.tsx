import React from 'react';
import { useNavigate } from 'react-router-dom';


const NotFound: React.FC = () => {

	const navigate = useNavigate();
	
	return (
		<div>
			<h1>404 - Page Not Found</h1>
			<p>Sorry, the page you are looking for does not exist.</p>
			<button onClick={()=>navigate("/")}>
				Go to homepage
			</button>
		</div>
	);
};

export default NotFound;
