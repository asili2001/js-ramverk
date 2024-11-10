import './main.scss';
import React, { useState, useEffect, useCallback } from 'react';
import { Editor, EditorState, convertFromRaw, RawDraftContentState, convertToRaw } from 'draft-js';
import 'draft-js/dist/Draft.css';
import Toolbar from './Toolbar';
import { debounce } from 'arias';

export interface TextBoxProps {
	initialContent: RawDraftContentState;
	onChange: (changes: RawDraftContentState, currentBlockKeys: string[]) => void;
	recivedChanges: { changes: RawDraftContentState[]; currentBlockKeys: string[] } | null;
	editable: boolean;
}

const TextBox: React.FC<TextBoxProps> = ({
	initialContent,
	onChange,
	recivedChanges,
	editable,
}) => {
	const [editorState, setEditorState] = useState<EditorState | null>(null);

	const [previousRecivedChanges, setPreviousRecivedChanges] = useState<RawDraftContentState[]>(
		[]
	);
	const [prevContent, setPrevContent] = useState<RawDraftContentState | null>(initialContent);

	useEffect(() => {
		if (!initialContent) return;
		setEditorState(EditorState.createWithContent(convertFromRaw(initialContent)));
	}, [initialContent]);

	useEffect(() => {
		if (
			editorState &&
			recivedChanges &&
			JSON.stringify(recivedChanges) !== JSON.stringify(previousRecivedChanges)
		) {
			// Store current selection before applying changes
			const currentSelection = editorState.getSelection();
			const currentContent = convertToRaw(editorState.getCurrentContent());

			const recivedBlockKeys = recivedChanges.currentBlockKeys;

			const receivedBlockChanges = recivedChanges.changes;

			const updatedContent: RawDraftContentState = {
				blocks: [],
				entityMap: {},
			};

			receivedBlockChanges.forEach((change) => {
				recivedBlockKeys.forEach((rBlockKey) => {
					const foundBlockInCurrent = currentContent.blocks.find(
						(cblock) => cblock.key === rBlockKey
					);
					const foundBlockInRecived = change.blocks.find(
						(fblock) => fblock.key === rBlockKey
					);

					if (foundBlockInRecived) {
						updatedContent.blocks.push(foundBlockInRecived);
					} else if (foundBlockInCurrent) {
						updatedContent.blocks.push(foundBlockInCurrent);
					}
				});
			});

			updatedContent.entityMap =
				receivedBlockChanges[receivedBlockChanges.length - 1].entityMap;

			const newContentState = convertFromRaw(updatedContent);
			const newEditorState = EditorState.createWithContent(newContentState);
			setPreviousRecivedChanges(recivedChanges.changes);
			setEditorState(EditorState.forceSelection(newEditorState, currentSelection));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [recivedChanges]);

	const debounceHandleEditorStateChange = debounce(
		(
			currentRawContent: RawDraftContentState,
			prevContent: RawDraftContentState,
			onChange: (changedContentState: RawDraftContentState, currentBlockKeys: string[]) => void
		) => {
			if (prevContent) {
				const changedContentState = getChangedContentState(currentRawContent, prevContent);
				const currentBlockKeys = currentRawContent.blocks.map((block) => block.key);

				onChange(changedContentState, currentBlockKeys);
			}
		},
		50
	);

	const handleEditorStateChange = useCallback(
		(state: EditorState) => {
			setEditorState(state);

			const currentContent = state.getCurrentContent();
			const currentRawContent = convertToRaw(currentContent);

			if (prevContent) {
				debounceHandleEditorStateChange(currentRawContent, prevContent, onChange);
			}

			// Update previous content directly here if necessary
			setPrevContent(currentRawContent);
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[onChange, setEditorState, setPrevContent]
	);

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

	return (
		editorState && (
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
				/>
			</div>
		)
	);
};

export default TextBox;
