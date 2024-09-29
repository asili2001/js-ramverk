import Input from '../../components/Input';
import './main.scss';
import { useState } from 'react';
import useAPIAuth from '../../hooks/useAPIAuth';
import { VscLoading } from 'react-icons/vsc';

const Login = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const { signIn, isLoading } = useAPIAuth();

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setEmail(value);
	};
	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setPassword(value);
	};
	const handleSignIn = async () => {
		await signIn(email, password);
	};
	return (
		<div className="auth-page">
			<div className="auth-box">
				<div className="header">
					<h1>Inker {isLoading ? 'hello' : ''}</h1>
					<p>Sign In</p>
				</div>
				<Input
					id="email"
					type="email"
					title="Email"
					placeholder=" "
					value={email}
					onChange={handleEmailChange}
					successMsg="Hello"
					required
				/>
				<Input
					id="password"
					type="password"
					title="Password"
					placeholder=" "
					onChange={handlePasswordChange}
					required
				/>
				<button
					className="primary-button active"
					onClick={handleSignIn}
				>
					Sign In {isLoading ? <VscLoading className="rotate" /> : ''}
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
