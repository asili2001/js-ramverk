import Input from '../../components/Input';
import './main.scss';
import { useEffect, useState } from 'react';
import useAPIAuth from '../../hooks/useAPIAuth';
import { useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../context/RoleContext';
import LoadingSpinner from '../../components/Loading';

const Login = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [responseMessage, setResponseMessage] = useState<string>('');
	const { signIn, isLoading } = useAPIAuth();
	const navigate = useNavigate();
	const { role } = useRoleContext();

	const checkRole = () => {
		if (role !== 'guest') {
			navigate('/documents');
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => checkRole(), []);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setEmail(value);
	};
	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setPassword(value);
	};
	const handleSignIn = async () => {
		const signInResponse = await signIn(email, password);
		if (typeof signInResponse === 'string') {
			setResponseMessage(signInResponse);
			return;
		}

		navigate('/documents');
		return;
	};
	return (
		<div className="auth-page">
			<div className="auth-box">
				<div className="header">
					<h1>Inker</h1>
					<p>Sign In</p>
				</div>
				<Input
					id="email"
					type="email"
					title="Email"
					placeholder=" "
					value={email}
					onChange={handleEmailChange}
					errorMsg={
						responseMessage.includes('email') ? responseMessage : ''
					}
					required
				/>
				<Input
					id="password"
					type="password"
					title="Password"
					placeholder=" "
					onChange={handlePasswordChange}
					errorMsg={
						responseMessage.includes('password')
							? responseMessage
							: ''
					}
					required
				/>
				<button
					className="primary-button active"
					onClick={handleSignIn}
				>
					Sign In {isLoading && <LoadingSpinner size={20} />}
				</button>
				<div className="footer">
					<span>Not a Member?</span>
					<a href="/signup">Sign Up</a>
				</div>
			</div>
		</div>
	);
};

export default Login;
