import Input from '../../components/Input';
import './main.scss';
import { useEffect, useState } from 'react';
import useAPIAuth from '../../hooks/useAPIAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Loading';

const ActivateUser = () => {
	const [password, setPassword] = useState<string>('');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const token = queryParams.get('t');
	const [responseMessage, setResponseMessage] = useState<string>('');
	const { signIn, activate, validateToken } = useAPIAuth();
    const isLoading = true;
	const navigate = useNavigate();

	const validToken = async () => {
		const isValid = token !== null && await validateToken(token);
        if (!isValid) {
            navigate("/");
            return false;
        }
        return true;
	}

	useEffect(()=> {validToken()}, []);

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setPassword(value);
	};
	const handleActivate = async () => {
        if (!token) {
            navigate("/");
            return;
        }
		const activateResponse = await activate(token, password);
        if (typeof activateResponse === "string") {
            setResponseMessage(activateResponse);
            return;
        }
		
        toast.success("Your account has been activated!", {duration: 5000});
        // Try to automatically login user
        await signIn(activateResponse.email, password);
        navigate("/documents");
        return;

	};
	return (
		<div className="auth-page">
			<div className="auth-box">
				<div className="header">
					<h1>Inker</h1>
					<p>Account Activation</p>
				</div>
				<Input
					id="password"
					type="password"
					title="New Password"
					placeholder=" "
					onChange={handlePasswordChange}
					errorMsg={responseMessage.includes("password") ? responseMessage : ""}
					required
				/>
				<button
					className="primary-button active"
					onClick={handleActivate}
				>
					Activate {isLoading && <LoadingSpinner size={20} />}
				</button>
			</div>
		</div>
	);
};

export default ActivateUser;
