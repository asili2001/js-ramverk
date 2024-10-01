import { useEffect, useState } from 'react';
import Input from '../../components/Input';
import './main.scss';
import useAPIAuth from '../../hooks/useAPIAuth';
import { useNavigate } from 'react-router-dom';
import { useRoleContext } from '../../context/RoleContext';
import LoadingSpinner from '../../components/Loading';
import toast from 'react-hot-toast';

const Signup = () => {
	const [name, setName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [responseMessage, setResponseMessage] = useState<string>("");
	const { signUp, isLoading } = useAPIAuth();
	const navigate = useNavigate();
	const { role } = useRoleContext();

	const checkRole = () => {
		if (role !== "guest") {
			navigate("/documents");
		}
	}
	useEffect(()=> checkRole(), []);

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setEmail(value);
	};
	const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.currentTarget.value;
		setName(value);
	};

	const handleUserRegisteration = async () => {
		const signUpResponseMessage = await signUp(name, email);
		setResponseMessage(signUpResponseMessage);
		console.log(signUpResponseMessage);
		
		if (signUpResponseMessage === "success") {
			toast.success("We've sent an activation link to your email. Please check your inbox.", {duration: 5000})
			navigate("/");
		}
	}


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
						errorMsg={responseMessage.includes("name") ? responseMessage : ""}
						required
					/>
					<Input
						id="email"
						type="email"
						title="Email"
						placeholder=" "
						onChange={handleEmailChange}
						errorMsg={responseMessage.includes("email") ? responseMessage : ""}
						required
					/>
					<button
						className="primary-button active"
						onClick={handleUserRegisteration}
						disabled={isLoading}
					>
						Sign Up {isLoading && <LoadingSpinner size={20} />}
					</button>
				</div>

				<div className="footer">
					<span>Already a Member?</span>
					<a href="/">Sign In</a>
				</div>
			</div>
		</div>
	);
};
export default Signup;
