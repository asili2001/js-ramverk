import toast from 'react-hot-toast';

const useAPIDocs = () => {
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

		toast.promise(fetchPromise, {
			loading: 'Loading...',
			success: 'Data fetched successfully!',
			error: 'Error fetching data.',
		});

		try {
			const response = await fetchPromise;
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
			} else if (error instanceof SyntaxError) {
				console.error('JSON parsing error.');
			} else if (error instanceof Error) {
				// Generic error handling
				console.error(`Error: ${error.message}`);
			} else {
				console.error('Unknown error occurred.');
			}
			return [];
		}
	};

	return { getDocs };
};
export default useAPIDocs;
