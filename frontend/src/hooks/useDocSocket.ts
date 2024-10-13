import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

export type TextInsert = {
    content: string;
    startIndex: number;
    endIndex: number;
    changeType?: string;
    changedText?: string;
};

export type TextDelete = {
    startIndex: number;
    endIndex: number;
    changeType?: string;
    changedText?: string;
};
export type TextReplace = {
    content: string;
    startIndex: number;
    endIndex: number;
    changeType?: string;
    changedText?: string;
};

export type TextUpdate = {
    docId: string;
    owner: string;
};
export type TextInsertUpdate = (TextInsert & TextUpdate) & {
    changeType: "insert";
}
export type TextDeleteUpdate = (TextDelete & TextUpdate) & {
    changeType: "delete";
}
export type TextReplaceUpdate = (TextReplace & TextUpdate) & {
    changeType: "replace";
}

export type TextUpdateGeneral = TextInsert | TextDelete | TextReplace;

// recieved
export type RTextUpdateGeneral = TextInsertUpdate | TextDeleteUpdate | TextReplaceUpdate;


const useDocSocket = (docId: string, handleSocketUpdate: (updatedText: RTextUpdateGeneral) => void) => {
    const [isConnected, setIsConnected] = useState(false);
    const socket = useRef<any>(null);

    useEffect(() => {
        socket.current = io(import.meta.env.VITE_MAIN_SOCKET_URL, {
            transports: ['websocket'],
            upgrade: true,
            query: {
                documentId: docId
            },
            withCredentials: true
        });

        socket.current.on("connect", () => {
            setIsConnected(true);
        });

        socket.current.on("disconnect", () => {
            setIsConnected(false);
        });

        socket.current.on("updateDocument", (updatedContent: RTextUpdateGeneral) => {
            handleSocketUpdate(updatedContent);
        });

        return () => {
            socket.current.disconnect();
        };
    }, [socket]);

    const insertText = ({ content, startIndex, endIndex }: TextInsert) => {
        socket.current?.emit("doc insertText", { docId, content, startIndex, endIndex });
    };

    const deleteText = ({ startIndex, endIndex }: TextDelete) => {
        socket.current?.emit("doc deleteText", { docId, startIndex, endIndex });
    };

    const replaceText = ({ content, startIndex, endIndex }: TextReplace) => {
        socket.current?.emit("doc replaceText", { docId, content, startIndex, endIndex });
    };

    return { isConnected, insertText, deleteText, replaceText, socket: socket };
};

export default useDocSocket;
