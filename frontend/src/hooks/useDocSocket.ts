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

export type CommentCreate = {
    content: string;
    selectedText: string;
};



export type TextUpdate = {
    docId: string;
    owner: string;
};

const useDocSocket = (docId: string|undefined, handleSocketUpdate: (updatedText: RChange[]) => void, handleCommentUpdate: any) => {
	const [isConnected, setIsConnected] = useState(false);
	const socket = useRef<null | Socket>(null);

    /*
        const useDocSocket = (docId: string, handleSocketUpdate: (updatedText: RTextUpdateGeneral) => void, socketCommentUpdate: any) => {
        const [isConnected, setIsConnected] = useState(false);
        const socket = useRef<any>(null);
    */
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
        socket.current.on('updateComment', handleCommentUpdate);
        socket.current.on("connect_error", (err:any) => {
            console.log(`connect_error due to ${err.message}`);
            // some additional description, for example the status code of the initial HTTP response
            console.log(err.description);
            // some additional context, for example the XMLHttpRequest object
            console.log(err.context);
        });

        // socket.current.on("updateComment", (updatedContent: any) => {
        //     console.log("socket updateComment");
        //     socketCommentUpdate(updatedContent);
        // });
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


    // const insertText = ({ content, startIndex, endIndex }: TextInsert) => {
    //     console.log("SOCKET event!!!!");

    //     socket.current?.emit("doc insertText", { docId, content, startIndex, endIndex });
    // };

    // const deleteText = ({ startIndex, endIndex }: TextDelete) => {
    //     console.log("SOCKET event!!!!");

    //     socket.current?.emit("doc deleteText", { docId, startIndex, endIndex });
    // };

    // const replaceText = ({ content, startIndex, endIndex }: TextReplace) => {
    //     console.log("SOCKET event!!!!");

    //     socket.current?.emit("doc replaceText", { docId, content, startIndex, endIndex });
    // };

    // const createComment = ({ content, selectedText }: CommentCreate) => {
    //     console.log("SOCKET COMMENT event!!!!");

    //     socket.current?.emit("doc createComment", { docId, content, selectedText });
    // };


    // return { isConnected, insertText, deleteText, replaceText, socket: socket, createComment };
};

export default useDocSocket;
