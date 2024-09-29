import { useState } from 'react';
import toast from 'react-hot-toast';

const useAPIDocs = () => {
	const [isLoading, setIsLoading] = useState(false);
	const getDocs = async (type?: 'all' | 'own' | 'shared') => {
		if (!type) {
			type = 'all';
		}
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/documents?type=${type}`;

		const fetchPromise = fetch(endPoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(()=> setIsLoading(false));
			const result: APIResponse = await response.json();
			if (!response.ok) {
				result.messages.forEach((message) => {
					toast.error(message.title);
				});

				return [];
			}

			return result.data as Doc[];
		} catch (error: unknown) {
			if (error instanceof TypeError) {
				console.error('Network error or invalid JSON.');
				toast.error("Network Error");
			} else if (error instanceof SyntaxError) {
				console.error('JSON parsing error.');
				toast.error("Unknown Error");
			} else if (error instanceof Error) {
				// Generic error handling
				console.error(`Error: ${error.message}`);
				toast.error(error.message);
			} else {
				console.error('Unknown error occurred.');
				toast.error("Unknown Error");
			}
			return [];
		}
	};

	return { getDocs, isLoading };
};
export default useAPIDocs;
