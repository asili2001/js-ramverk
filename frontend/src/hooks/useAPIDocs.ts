import { useState } from 'react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const useAPIDocs = () => {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();
	const getDocs = async (type?: 'all' | 'own' | 'shared') => {
		if (!type) {
			type = 'all';
		}
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/documents?type=${type}`;

		const fetchPromise = fetch(endPoint, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
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
					navigate("/");
				}
				toast.error(result.message);
				return [];
			}

			return result.data as Doc[];
		} catch (error: unknown) {
			console.error('Something went wrong: ', error);
			toast.error('Something went wrong :(');
			return [];
		}
	};

	return { getDocs, isLoading };
};
export default useAPIDocs;
