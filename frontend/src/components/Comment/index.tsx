import './main.scss';

import React, { useState, useEffect } from 'react';
import { CommentData } from '../../hooks/useDocSocket';
import { Comment } from '../TextBox';


export interface CommentProps {
    position: string;
    selection: string;
    onClick: () => void;
    onComment: (data: CommentData) => void;
    comments: Comment[];
    setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
    setShowCommentBox: React.Dispatch<React.SetStateAction<boolean>>;
}


const CommentBox: React.FC<CommentProps> = ({
    position,
    selection,
    onClick,
    onComment,
    comments,
    setComments,
    setShowCommentBox
}) => {
	const [commentContent, setCommentContent] = useState('');


    // Create Comment
    const sendComment = () => {
        console.log("sending socket comment!");
        console.log("fields: ", commentContent, selection, position);

        // console.log("selection: ", selection);
        // console.log("position: ", position);
        // console.log("comment: ", commentContent);
        //createComment(selection, )
        const data: Comment = {
            commentContent: commentContent,
            selectedText: selection,
            position: position
        };

        if(commentContent && selection && position) {
            onComment(data);
            const updatedComments = [...comments, data];
            setComments(updatedComments);
        }
        setShowCommentBox(false);
	};

    useEffect(() => {

        // expand textarea when text overflows
        const textArea: HTMLDivElement | any = document.getElementById("comment-textarea");
        textArea.addEventListener('input', function() {
            textArea.style.height = `${textArea.scrollHeight}px`;
            setCommentContent(textArea.value);
        });
    }, []);

	return (
		<div className="comment-container" style={{ margin: `${position}px 50px 0` }}>
			<div className="user">
                <h2>User: Axel Jönsson</h2>
                <h3>Email: 41.52@hotmail.com</h3>
			</div>
            <div className="box">
                <textarea id="comment-textarea" placeholder="Write your comment here...">
                </textarea>
            </div>
            <div className="buttons">
            <div className="button cancel" onClick={onClick}>
                    <p>Cancel</p>
                </div>
                <div className="button submit" onClick={sendComment}>
                    <p>Comment</p>
                </div>
            </div>
		</div>
	);
};

export default CommentBox;
