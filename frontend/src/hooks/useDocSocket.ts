import { RawDraftContentState } from 'draft-js';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import LZString from 'lz-string';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export type Change = {
	content: RawDraftContentState;
};

export type RChange = {
	owner: string;
	data: string;
	currentBlockKeys?: string[];
};

export type RChangeData = {
	content: RawDraftContentState;
	docId: string;
	currentBlockKeys?: string[];
};

const useDocSocket = (
	docId: string | undefined,
	handleSocketUpdate: (updatedText: RChange[]) => void
) => {
	const [isConnected, setIsConnected] = useState(false);
	const socket = useRef<null | Socket>(null);
	const navigate = useNavigate();

	// Function to initialize the socket connection
	const initializeSocket = () => {
		if (!docId) {
			console.error('Document id not found');
			return;
		}
		socket.current = io(import.meta.env.VITE_MAIN_SOCKET_URL, {
			query: { documentId: docId },
			withCredentials: true,
			transports: ['websocket'],
			upgrade: false,
		});

		// Handle socket connection events
		socket.current.on('connect', () => setIsConnected(true));
		socket.current.on('disconnect', () => setIsConnected(false));
		socket.current.on('updateDocument', handleSocketUpdate);
		socket.current.on('updateDocument', handleSocketUpdate);
		socket.current.on('documentNotFound', () => {
			toast.error('Document Not Found');
			navigate('/documents');
			cleanupSocket();
			return;
		});
	};

	// Function to clean up the socket connection
	const cleanupSocket = () => {
		if (socket.current) {
			socket.current.off('connect');
			socket.current.off('disconnect');
			socket.current.off('updateDocument');
			socket.current.disconnect();
			socket.current = null; // Reset socket reference
		}
	};

	useEffect(() => {
		initializeSocket();

		// Cleanup function when component unmounts or docId changes
		return cleanupSocket;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [docId]);

	const submitChange = (changes: RawDraftContentState, currentBlockKeys: string[]) => {
		const data = LZString.compress(
			JSON.stringify({ content: changes, currentBlockKeys, docId })
		);

		socket.current?.emit('doc change', data);
	};

	return { isConnected, submitChange, socket: socket };
};

export default useDocSocket;
