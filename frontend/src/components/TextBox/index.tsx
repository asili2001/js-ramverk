import './main.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { Editor, EditorState, convertFromRaw, RawDraftContentState, convertToRaw, SelectionState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Toolbar from './Toolbar';
import { debounce, throttle } from 'arias';
import CommentBox from '../Comment';
import CommentIcon from '../../assets/comment.png';
import { CommentData } from '../../hooks/useDocSocket';

export interface TextBoxProps {
	initialContent: RawDraftContentState;
	onChange: (changes: RawDraftContentState, currentBlockKeys: string[]) => void;
	onComment: (data: CommentData) => void;
	recivedChanges: {changes: RawDraftContentState[], currentBlockKeys: string[]}|null;
	editable: boolean;
	socketCommentUpdate: any;
	comments: Comment[];
	setComments:  React.Dispatch<React.SetStateAction<Comment[]>>;
}

export interface Comment {
	_id?: string;
	commentContent: string;
	selectedText: string;
	position: string;
}

const TextBox: React.FC<TextBoxProps> = ({
	initialContent,
	onChange,
	onComment,
	recivedChanges,
	editable,
	comments,
	setComments
}) => {
	const contentState = convertFromRaw(initialContent);
	const [editorState, setEditorState] = useState<EditorState>(EditorState.createWithContent(contentState));

	const [previousRecivedChanges, setPreviousRecivedChanges] = useState<RawDraftContentState[]>(
		[]
	);
	const [prevContent, setPrevContent] = useState<RawDraftContentState | null>(initialContent);

	useEffect(() => {
        if (recivedChanges && JSON.stringify(recivedChanges) !== JSON.stringify(previousRecivedChanges)) {
            // Store current selection before applying changes
            const currentSelection = editorState.getSelection();
            const currentContent = convertToRaw(editorState.getCurrentContent());

			const recivedBlockKeys = recivedChanges.currentBlockKeys;
			
			const receivedBlockChanges = recivedChanges.changes;

			const updatedContent: RawDraftContentState = {
				blocks: [],
				entityMap: {}
			};

			receivedBlockChanges.forEach(change => {
				recivedBlockKeys.forEach(rBlockKey => {
					const foundBlockInCurrent = currentContent.blocks.find(cblock => cblock.key === rBlockKey);
					const foundBlockInRecived = change.blocks.find(fblock => fblock.key === rBlockKey);
	
					if (foundBlockInRecived) {
						updatedContent.blocks.push(foundBlockInRecived);
					} else if (foundBlockInCurrent) {
						updatedContent.blocks.push(foundBlockInCurrent);
					}
				})
			});

			updatedContent.entityMap = receivedBlockChanges[receivedBlockChanges.length - 1].entityMap;

			const newContentState = convertFromRaw(updatedContent);
			const newEditorState = EditorState.createWithContent(newContentState);
			setPreviousRecivedChanges(recivedChanges.changes);
			setEditorState(EditorState.forceSelection(newEditorState, currentSelection));

        }
    }, [recivedChanges]);


	const debounceHandleEditorStateChange = debounce(
		(currentRawContent: RawDraftContentState, prevContent: any, onChange: (changedContentState: any, currentBlockKeys: string[]) => void) => {
	
			// Compare with the previous content if it exists
			if (prevContent) {
				const changedContentState = getChangedContentState(currentRawContent, prevContent);
				const currentBlockKeys = currentRawContent.blocks.map((block) => block.key);
	
				onChange(changedContentState, currentBlockKeys);
			}
		},
		200
	);
	
	const handleEditorStateChange = useCallback((state: EditorState) => {
		setEditorState(state);
		
		const currentContent = state.getCurrentContent();
		const currentRawContent = convertToRaw(currentContent);
	
		if (prevContent) {
			debounceHandleEditorStateChange(currentRawContent, prevContent, onChange);
		}
	
		// Update previous content directly here if necessary
		setPrevContent(currentRawContent);
	}, [onChange, setEditorState, setPrevContent]);


	const getChangedContentState = (
		currentRaw: RawDraftContentState,
		prevRaw: RawDraftContentState
	): RawDraftContentState => {
		const changedBlocks: RawDraftContentState['blocks'] = [];

		currentRaw.blocks.forEach((currentBlock) => {
			const prevBlock = prevRaw.blocks.find((prev) => prev.key === currentBlock.key);

			if (!prevBlock || JSON.stringify(currentBlock) !== JSON.stringify(prevBlock)) {
				changedBlocks.push(currentBlock);
			}
		});

		return {
			blocks: changedBlocks,
			entityMap:
				JSON.stringify(currentRaw.entityMap) !== JSON.stringify(prevRaw.entityMap)
					? currentRaw.entityMap
					: {},
		};
	};

	// These functions will be used for comment positions
	// function getCurrentBlock(editorState: EditorState) {
	// 	// Get the selection state
	// 	const selectionState = editorState.getSelection();

	// 	// Get the block key where the selection starts (caret is positioned)
	// 	const anchorKey = selectionState.getAnchorKey();

	// 	// Retrieve the content state
	// 	const contentState = editorState.getCurrentContent();

	// 	// Use the block key to get the actual content block
	// 	const currentBlock = contentState.getBlockForKey(anchorKey);

	// 	getBlockPosition(currentBlock.getKey());
	// }

	const getBlockPosition = function getBlockPosition(blockKey: string) {
		const offsetKey = `${blockKey}-0-0`;
		const blockElement = document.querySelector(`[data-offset-key="${offsetKey}"]`);

		if (blockElement) {
			const rect = blockElement.getBoundingClientRect();

			console.log({
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			});
			return {
				top: rect.top,
				left: rect.left,
				width: rect.width,
				height: rect.height,
			};
		}

		return null;
	}


	const [showCommentBtn, setShowCommentBtn] = useState(false);
	const [showCommentBox, setShowCommentBox] = useState(false);
	const [selectionPosition, setSelectionPosition] = useState(100);
	const [selectedText, setSelectedText] = useState('');
	const [clickTimes, setClickTimes] = useState([0]);
	const [selections, setSelections] = useState(['']);

	const toggleCommentBox = () => {
		setShowCommentBox(true);
		setShowCommentBtn(false);
	};

	const hideCommentBox = () => {
		setShowCommentBox(false);
		setShowCommentBtn(false);
	};

	const handleMouseUp = async()=> {
		await retrieveSelection();
	};

	/*
	* Function for retrieving selection.
	* Keeps track of related clicks;
	* (clicking 3 times within a short time frame counts as a single selection)
	* This function might be hard to understand, there is room for improvement.
	*/
	const retrieveSelection = throttle( ()=> {
		// get and add time for click
		// & get and add content for click
		const currentTime = Date.now();
		const newClickTimes = [...clickTimes, currentTime];
		const winSel: Selection | any = window.getSelection();
		let newSelections = selections;

		if(winSel.anchorNode.data !== undefined) {
			newSelections = [...selections, winSel.anchorNode.data];
		}

		// remove the oldest time and content if more than 3
		if (newClickTimes.length > 3) {
			newClickTimes.shift();
		}
		if (newSelections.length > 3) {
			newSelections.shift();
		}
	
		// set new times and contents
		setClickTimes(newClickTimes);
		setSelections(newSelections);

		// Logic for retrieving correct content.
		let selectedText: any = "";
		const timeDifference = newClickTimes[2] - newClickTimes[0];
		if (timeDifference < 800)  { // 3 clicks
			selectedText = selections.at(-1);
		} else if (!winSel.isCollapsed && showCommentBox == false) { // double click or drag
			selectedText = winSel.anchorNode.data;
		}
		
		// Selection is retrieved.
		// Save selection and show comment divs.
		if (showCommentBox == false && selectedText !== undefined && selectedText.length > 0) {
			setSelectedText(selectedText);
			const selectionState: SelectionState = editorState.getSelection();
			// the position is not working perfectly, due to draft-js editorState, (or how it's updated maybe?)
			const position = getBlockPosition(selectionState.getStartKey());
			position != null && setSelectionPosition(position.top);
			setShowCommentBtn(true);			
		} else {
			setShowCommentBtn(false);
		}
	}, 500);


	return (
		<div>

			<div className="editor-container page" onMouseUp={handleMouseUp}>
				<Toolbar
					editableState={editorState}
					setEditableState={setEditorState}
					onEditorStateChange={handleEditorStateChange}
				/>

				<Editor
					editorState={editorState}
					onChange={handleEditorStateChange}
					placeholder="Start typing here..."
					readOnly={!editable}
				// onUpArrow={() => getCurrentBlock(editorState)}
				/>
			</div>
			{comments.map((comment, index) => (
				<div className="comment-indicator" key={index} style={{margin: `${comment.position}px 50px 0`}}>
					{comment.commentContent}
				</div>
			))}
			{showCommentBtn && (
				<div className="comment-button"
					onClick={toggleCommentBox}
					style={{ margin: `${selectionPosition}px 50px 0` }}
				>
					<img src={CommentIcon} alt="comment logo"/>
				</div>
			)}
			{showCommentBox && (
				<CommentBox
					position={`${selectionPosition}`}
					selection={selectedText}
					onClick={hideCommentBox}
					onComment={onComment}
					comments={comments}
					setComments={setComments}
					setShowCommentBox={setShowCommentBox}
				/>
			)}
		</div>
	);
};

export default TextBox;
