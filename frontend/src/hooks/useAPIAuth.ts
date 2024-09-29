import { useState } from 'react';
import toast from 'react-hot-toast';

const useAPIAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
	const signIn = async (email: string, password: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/signin?`;

		const fetchPromise = fetch(endPoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
            body: JSON.stringify({
                email,
                password
            })
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
                toast.error("Something went wrong :(");
			} else if (error instanceof Error) {
                // Generic error handling
				console.error(`Error: ${error.message}`);
                toast.error(error.message);
			} else {
                console.error('Unknown error occurred.');
                toast.error("Something went wrong :(");
			}
			return [];
		}
	};

	return { signIn, isLoading };
};
export default useAPIAuth;
