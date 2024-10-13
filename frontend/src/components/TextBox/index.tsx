import React, { useState, useRef, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import './main.scss';
import { TextDelete, TextInsert, TextReplace, TextUpdateGeneral } from '../../hooks/useDocSocket';
import { debounce } from 'arias';

export interface TextBoxProps {
	content: string;
	onChange: (data: TextUpdateGeneral) => void;
	className?: string;
	editable?: boolean;
	recivedUpdate: TextUpdateGeneral | null;
}

const TextBox: React.FC<TextBoxProps> = ({
	content,
	onChange,
	className,
	editable,
	recivedUpdate
}) => {
	const allowedTags = [
		'a',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'p',
		'span',
		'br',
		'div',
		'img',
	];
	const sanitizeConfig = { ALLOWED_TAGS: allowedTags };
	const sanitizedContent = DOMPurify.sanitize(content, sanitizeConfig);
	const editableRef = useRef<HTMLDivElement>(null);
	const [totalPages, setTotalPages] = useState<number>(1);
	const PAGE_HEIGHT = 1056 - 32; // the 32px is the padding
	const [prevContent, setPrevContent] = useState(sanitizedContent);

	// Helper function to normalize content (e.g., handle &nbsp;)
	const normalizeContent = (content: string) => content.replace(/&nbsp;/g, ' ');

	// Function to compare content and detect the exact change
	const detectChanges = (oldContent: string, newContent: string): TextUpdateGeneral | null => {
		let startIndex = 0;
		const normalizedOld = normalizeContent(oldContent);
		const normalizedNew = normalizeContent(newContent);

		// Find where the content starts to differ
		while (
			startIndex < normalizedOld.length &&
			startIndex < normalizedNew.length &&
			normalizedOld[startIndex] === normalizedNew[startIndex]
		) {
			startIndex++;
		}

		// Now check how much of the trailing text is the same from the end
		let endOld = normalizedOld.length - 1;
		let endNew = normalizedNew.length - 1;

		while (
			endOld >= startIndex &&
			endNew >= startIndex &&
			normalizedOld[endOld] === normalizedNew[endNew]
		) {
			endOld--;
			endNew--;
		}

		const changedOld = normalizedOld.slice(startIndex, endOld + 1);
		const changedNew = normalizedNew.slice(startIndex, endNew + 1);

		if (changedNew.length !== 0 && changedOld.length !== 0) {
			// replace detected
			const highestEndIndex = changedNew.length > changedOld.length ? changedNew.length : changedOld.length;
			return {
				changeType: 'replace',
				changedText: changedNew,
				startIndex,
				endIndex: startIndex + highestEndIndex,
			} as TextReplace;
		} else if (changedNew.length > changedOld.length) {
			// Insertion detected
			return {
				changeType: 'insert',
				changedText: changedNew,
				startIndex,
				endIndex: startIndex + changedNew.length,
			} as TextInsert;
		} else if (changedNew.length < changedOld.length) {
			// Deletion detected
			return {
				changeType: 'delete',
				changedText: changedOld,
				startIndex,
				endIndex: startIndex + changedOld.length,
			} as TextDelete;
		}

		return null;
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
		e.preventDefault();

		// Access clipboard data using the ClipboardEvent interface
		const clipboardData = e.clipboardData;
		const htmlContent = clipboardData.getData('text/html');
		const textContent = clipboardData.getData('text/plain');

		let sanitizedContent;

		if (htmlContent) {
			// Sanitize the HTML content to allow only specified tags
			sanitizedContent = DOMPurify.sanitize(htmlContent, sanitizeConfig);
		} else {
			// Fallback to sanitizing plain text
			sanitizedContent = DOMPurify.sanitize(textContent, sanitizeConfig);
		}

		if (editableRef.current) {
			const selection = window.getSelection();

			if (selection) {
				const range = selection.getRangeAt(0);
				range.deleteContents();

				// Create a temporary div to convert sanitized HTML back to DOM elements
				const tempDiv = document.createElement('div');
				tempDiv.innerHTML = sanitizedContent;

				// Use a document fragment to insert sanitized content
				const fragment = document.createDocumentFragment();
				let child;
				while ((child = tempDiv.firstChild)) {
					fragment.appendChild(child);
				}

				const lastChild = fragment.lastChild; // Get the last child of the fragment

				range.insertNode(fragment);

				// Move the caret to the end of the inserted content
				if (lastChild) {
					range.setStartAfter(lastChild);
					range.setEndAfter(lastChild);
					selection.removeAllRanges();
					selection.addRange(range);
				}

				handleInput();
			}
		}
	};

	function getTotalHeight(element: HTMLElement | null): number {
		if (!element) return 0; // Return 0 if the element is not provided

		const children = element.children; // Get all child elements
		let totalHeight = 0;

		// Loop through each child element and accumulate their heights
		for (let i = 0; i < children.length; i++) {
			totalHeight += (children[i] as HTMLElement).offsetHeight; // Add the offsetHeight of each child
		}

		return totalHeight; // Return the total height
	}

	const handleInput = useCallback(debounce(() => {
        if (editableRef.current) {
            const newDraftContent = DOMPurify.sanitize(editableRef.current.innerHTML, sanitizeConfig);

            // Detect changes between previous and new content
            const changes = detectChanges(prevContent, newDraftContent);

            if (changes && onChange) {
                onChange(changes);
            }

            // Update the previous content state
            setPrevContent(newDraftContent);
            getTotalPages(getTotalHeight(editableRef.current));
        }
    }, 200), [prevContent, onChange]);

	const getTotalPages = (height: number) => {
		if (height <= 0) {
			setTotalPages(1);
			return;
		}

		const pages = Math.ceil(height / PAGE_HEIGHT);
		setTotalPages(pages);
	};

	const applyUpdate = (currentContent: string, update: TextUpdateGeneral) => {
		let normalizedContent = normalizeContent(currentContent);
		let newContent = normalizedContent;

		if (update.changeType === 'insert') {
			const insertChange = update as TextInsert;
			// Insert the new text at the specified start index
			newContent = normalizedContent.slice(0, insertChange.startIndex) + insertChange.content + normalizedContent.slice(insertChange.startIndex);
		} else if (update.changeType === 'delete') {
			const deleteChange = update as TextDelete;
			// Remove text from startIndex to endIndex
			newContent = normalizedContent.slice(0, deleteChange.startIndex) + normalizedContent.slice(deleteChange.endIndex);
		} else if (update.changeType === 'replace') {
			const replaceChange = update as TextReplace;
			// Replace text from startIndex to endIndex
			newContent = normalizedContent.slice(0, replaceChange.startIndex) + replaceChange.content + normalizedContent.slice(replaceChange.endIndex);
		}

		setPrevContent(normalizeContent(newContent));
		if (editableRef.current) editableRef.current.innerHTML = normalizeContent(newContent);
	};

	useEffect(() => {

		if (editableRef.current && recivedUpdate) {
			const newDraftContent = DOMPurify.sanitize(editableRef.current.innerHTML, sanitizeConfig);
			applyUpdate(newDraftContent, recivedUpdate);
		}
	}, [JSON.stringify(recivedUpdate)]);

	return (
		<div
			ref={editableRef}
			style={{ minHeight: `${PAGE_HEIGHT * totalPages}px` }}
			contentEditable={editable}
			onInput={()=>handleInput()}
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
			className={`page ${className}`}
			onPaste={handlePaste}
		/>
	);
};

export default TextBox;
