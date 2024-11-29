import { EditorState, RichUtils } from 'draft-js';
import React from 'react';
import { blockStyles, inlineStyles } from './constants';
import './main.scss';

interface IToolbar {
	editableState: EditorState;
	setEditableState: React.Dispatch<React.SetStateAction<EditorState | null>>;
	onEditorStateChange: (state: EditorState) => void;
}

const Toolbar: React.FC<IToolbar> = ({ editableState, setEditableState, onEditorStateChange }) => {
	const applyInlineStyle = (style: string) => {
		const newEditableState = RichUtils.toggleInlineStyle(editableState, style);
		setEditableState(newEditableState);
		onEditorStateChange(newEditableState);
	};

	const applyBlockStyle = (style: string) => {
		const newEditableState = RichUtils.toggleBlockType(editableState, style);
		setEditableState(newEditableState);
		onEditorStateChange(newEditableState);
	};

	const isActive = (style: string, type: 'inline' | 'block' = 'inline') => {
		if (!editableState) {
			return false; // Ensure editableState is defined
		}

		const selectionState = editableState.getSelection();

		if (!selectionState || selectionState.isCollapsed()) {
			return false; // No selection or collapsed selection means no active styles
		}

		if (type === 'inline') {
			const currentStyle = editableState.getCurrentInlineStyle();
			return currentStyle.has(style);
		} else if (type === 'block') {
			const contentState = editableState.getCurrentContent();
			const currentBlock = contentState.getBlockForKey(selectionState.getAnchorKey());
			return currentBlock.getType() === style;
		}

		return false; // Default fallback
	};

	return (
		<div className="toolbar">
			{inlineStyles.map((item, index) => (
				<button
					key={`${item.label}-${index}`}
					className={`toolbar-button ${isActive(item.style) ? 'active' : ''}`}
					onClick={() => applyInlineStyle(item.style)}
				>
					{item.icon || item.label}
				</button>
			))}
			{blockStyles.map((item, index) => (
				<button
					key={`${item.label}-${index}`}
					className={`toolbar-button ${isActive(item.style, 'block') ? 'active' : ''}`}
					onClick={() => applyBlockStyle(item.style)}
				>
					{item.icon || item.label}
				</button>
			))}
		</div>
	);
};

export default Toolbar;
