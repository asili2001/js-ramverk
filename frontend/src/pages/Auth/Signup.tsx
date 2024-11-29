import { useEffect, useState } from 'react';
import Input from '../../components/Input';
import './main.scss';
import { useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../context/RoleContext';
import LoadingSpinner from '../../components/Loading';
import toast from 'react-hot-toast';
import { ApolloError, useMutation } from '@apollo/client';
import { USER_SIGNUP } from '../../api/queries';

const Signup = () => {
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [responseMessage, setResponseMessage] = useState<string>('');
	const [signUp, { loading }] = useMutation(USER_SIGNUP);
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
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setName(value);
	};

	const handleUserRegisteration = async () => {
		try {
			const { data } = await signUp({ variables: { email, name } });
			const signUpResponse = data?.signUp;

			if (signUpResponse.id) {
				toast.success(
					"We've sent an activation link to your email. Please check your inbox."
				);
				navigate('/');
			}
		} catch (err) {
			let errorMessage = '';
			if (err instanceof ApolloError) {
				errorMessage = err.message;
				setResponseMessage(errorMessage);
				toast.error(errorMessage);
			} else {
				toast.error('An unknown error occurred');
			}
		}
	};

	return (
		<div className="auth-page">
			<div className="auth-box">
				<div className="header">
					<h1>Inker</h1>
					<p>Sign Up</p>
				</div>
				<div className="signup-tab">
					<Input
						id="name"
						type="string"
						title="Name"
						placeholder=" "
						onChange={handleNameChange}
						errorMsg={
							responseMessage.toLowerCase().includes('name') ? responseMessage : ''
						}
						required
					/>
					<Input
						id="email"
						type="email"
						title="Email"
						placeholder=" "
						onChange={handleEmailChange}
						errorMsg={
							responseMessage.toLowerCase().includes('email') ? responseMessage : ''
						}
						required
					/>
					<button
						className="primary-button active"
						onClick={handleUserRegisteration}
						disabled={loading}
					>
						Sign Up {loading && <LoadingSpinner size={20} />}
					</button>
				</div>

				<div className="footer">
					<span>Already a Member?</span>
					<a href={`/`}>Sign In</a>
				</div>
			</div>
		</div>
	);
};
export default Signup;
