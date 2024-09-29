import { useState } from 'react';
import Input from '../../components/Input';
import './main.scss';
import { MdNavigateNext, MdNavigateBefore } from 'react-icons/md';

const Signup = () => {
	const [tabIndex, setTabIndex] = useState<number>(0);

	const Tabs = [
		<div className="signup-tab">
			<Input
				id="email"
				type="email"
				title="Email"
				placeholder=" "
				required
			/>
			<button
				className="primary-button active"
				onClick={() => setTabIndex(1)}
			>
				Next <MdNavigateNext />
			</button>
		</div>,
		<div className="signup-tab">
			<Input
				id="verify"
				type="text"
				title="Verification Code"
				placeholder=" "
				required
			/>
			<div className="signup-tab-action-btns">
				<button
					className="primary-button"
					style={{ width: '5rem' }}
					onClick={() => setTabIndex(0)}
				>
					<MdNavigateBefore />
					Back
				</button>
				<button
					className="primary-button active"
					style={{ width: '7rem' }}
					onClick={() => setTabIndex(2)}
				>
					Next <MdNavigateNext />
				</button>
			</div>
		</div>,
	];
	return (
		<div className="auth-page">
			<div className="auth-box">
				<div className="header">
					<h1>Inker</h1>
					<p>Sign Up</p>
				</div>
				{Tabs[tabIndex]}

				<div className="footer">
					<span>Already a Member?</span>
					<a href="/">Sign In</a>
				</div>
			</div>
		</div>
	);
};
export default Signup;
