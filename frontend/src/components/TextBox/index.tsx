import './main.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { Editor, EditorState, convertFromRaw, RawDraftContentState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Toolbar from './Toolbar';
import { debounce } from 'arias';

export interface TextBoxProps {
	initialContent: RawDraftContentState;
	onChange: (changes: RawDraftContentState, currentBlockKeys: string[]) => void;
	recivedChanges: {changes: RawDraftContentState[], currentBlockKeys: string[]}|null;
	editable: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
	initialContent,
	onChange,
	recivedChanges,
	editable,
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

	// function getBlockPosition(blockKey: string) {
	// 	// Construct the selector using the block key
	// 	const offsetKey = `${blockKey}-0-0`;

	// 	// Use querySelector to find the block's DOM element
	// 	const blockElement = document.querySelector(`[data-offset-key="${offsetKey}"]`);

	// 	if (blockElement) {
	// 		// Get the bounding client rectangle of the element
	// 		const rect = blockElement.getBoundingClientRect();

	// 		// Position in pixels relative to the viewport
	// 		console.log({
	// 			top: rect.top,
	// 			left: rect.left,
	// 			width: rect.width,
	// 			height: rect.height,
	// 		});
	// 	}

	// 	return null; // Block not found
	// }

	return (
		<div className="editor-container page">
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
	);
};

export default TextBox;
