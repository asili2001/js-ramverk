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
				if (result.message === 'Unauthorized') {
					Cookies.remove('role');
					navigate('/');
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
	const getDoc = async (id: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/documents/${id}`;

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
				if (result.message === 'Unauthorized') {
					Cookies.remove('role');
					navigate('/');
				}
				toast.error(result.message);
				return null;
			}

			return result.data as Doc;
		} catch (error: unknown) {
			console.error('Something went wrong: ', error);
			toast.error('Something went wrong :(');
			return null;
		}
	};
	const newDoc = async (title: string = 'Untitled') => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/documents`;

		const fetchPromise = fetch(endPoint, {
			method: 'POST',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				title,
			}),
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === 'Unauthorized') {
					Cookies.remove('role');
					navigate('/');
				}
				toast.error(result.message);
				return null;
			}

			return result.data as Doc;
		} catch (error: unknown) {
			console.error('Something went wrong: ', error);
			toast.error('Something went wrong :(');
			return null;
		}
	};
	const updateDoc = async (id: string, title?: string, content?: string) => {
		const endPoint = `${import.meta.env.VITE_MAIN_API_URL}/documents/${id}`;

		const reqData: { title?: string; content?: string } = {};
		if (title !== undefined) reqData.title = title;
		if (content !== undefined) reqData.content = content;
		const fetchPromise = fetch(endPoint, {
			method: 'PUT',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(reqData),
		});

		try {
			setIsLoading(true);
			const response = await fetchPromise.finally(() =>
				setIsLoading(false)
			);
			const result: APIResponse = await response.json();
			if (!response.ok) {
				if (result.message === 'Unauthorized') {
					Cookies.remove('role');
					navigate('/');
				}
				toast.error(result.message);
				return null;
			}

			return result.data as Doc;
		} catch (error: unknown) {
			console.error('Something went wrong: ', error);
			toast.error('Something went wrong :(');
			return null;
		}
	};

	return { getDocs, getDoc, updateDoc, newDoc, isLoading };
};
export default useAPIDocs;
