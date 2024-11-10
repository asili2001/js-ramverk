import { RawDraftContentState } from 'draft-js';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import LZString from 'lz-string';

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

export type CommentData = {
    commentContent: string;
    selectedText: string;
    position: string;
};



export type TextUpdate = {
    docId: string;
    owner: string;
};

const useDocSocket = (
		docId: string|undefined,
		handleSocketUpdate: (updatedText: RChange[]) => void,
		handleSocketComments: (data: any) => void
	)=> {
	const [isConnected, setIsConnected] = useState(false);
	const socket = useRef<null | Socket>(null);


	// Function to initialize the socket connection
	const initializeSocket = () => {
        if (!docId) {
            console.error("Document id not found");
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
        socket.current.on('updateComment', handleSocketComments);
        // Connection Error
        socket.current.on("connect_error", (err:any) => {
            console.log(`connect_error due to ${err.message}`);
            console.log(err.description);
            console.log(err.context);
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
		return cleanupSocket;
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [docId]);


	const submitComment = (data: CommentData) => {
        console.log("DATA FROM useDocSocket: ", data)

		socket.current?.emit('doc comment', data);
	};

	const submitChange = (changes: RawDraftContentState, currentBlockKeys: string[]) => {
		const data = LZString.compress(
			JSON.stringify({ content: changes, currentBlockKeys, docId })
		);

		socket.current?.emit('doc change', data);
	};

	return { isConnected, submitChange, submitComment, socket: socket };

};

export default useDocSocket;
