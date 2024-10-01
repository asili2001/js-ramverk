import { useState } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useRoleContext } from '../context/RoleContext';

const useAPIAuth = () => {
	const [isLoading, setIsLoading] = useState(false);
	const { setRole } = useRoleContext();
	const signIn = async (email: string, password: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/users/login`;

		const fetchPromise = fetch(endPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				email,
				password,
			}),
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === "Unauthorized") {
					Cookies.remove("role");
				}
				toast.error(result.message);

				return result.message;
			}

			const roleCookie = Cookies.get('role') as Role;
			setRole(roleCookie ?? "guest");
			return result.data as User;
		} catch (error) {
			console.error('Network error or invalid JSON.', error);
			toast.error('Something went wrong :(');
			return "Error Signing in";
		}
	};

	const signUp = async (name: string, email: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/users`;

		const fetchPromise = fetch(endPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				name,
				email,
			}),
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === "Unauthorized") {
					Cookies.remove("role");
				}
				toast.error(result.message);

				return result.message;
			}

			const roleCookie = Cookies.get('role') as Role;
			setRole(roleCookie ?? "guest");
			return "success";
		} catch (error) {
			console.error('Network error or invalid JSON.', error);
			toast.error('Something went wrong :(');
			return "Error Signing up";
		}
	};

	const activate = async (token: string, password: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/users/activate`;

		const fetchPromise = fetch(endPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify({
				token,
				password,
			}),
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === "Unauthorized") {
					Cookies.remove("role");
				}
				toast.error(result.message);

				return result.message;
			}

			return result.data as User;
		} catch (error) {
			console.error('Network error or invalid JSON.', error);
			toast.error('Something went wrong :(');
			return "Error Activating User";
		}
	};

	const validateToken = async (token: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/users/validate`;

		const fetchPromise = fetch(endPoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: "include",
			body: JSON.stringify({
				token
			})
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === "Unauthorized") {
					Cookies.remove("role");
				}
				toast.error(result.message);

				return false;
			}

			return true;
		} catch (error) {
			console.error('Something went wrong: ', error);
			toast.error('Something went wrong :(');
			return false;
		}
	}

	return { signIn, signUp, activate, validateToken, isLoading };
};
export default useAPIAuth;
