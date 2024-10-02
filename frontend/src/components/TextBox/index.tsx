import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import './main.scss';
import { debounce } from 'arias';

export interface TextBoxProps {
	content: string;
	onChange: (draftContent: string) => void;
	className?: string;
	editable?: boolean;
	maxLines?: number;
}

const TextBox: React.FC<TextBoxProps> = ({
	content,
	onChange,
	className,
	editable,
	maxLines,
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
		'img',
		'br',
		'div',
	];
	const sanitizeConfig = { ALLOWED_TAGS: allowedTags };
	const sanitizedContent = DOMPurify.sanitize(content, sanitizeConfig);
	const [draftContent, setDraftContent] = useState(sanitizedContent);
	const editableRef = useRef<HTMLDivElement>(null);
	const [totalPages, setTotalPages] = useState<number>(1);
	const PAGE_HEIGHT = 1056 - 32; // the 32px is the padding

	const debouncedOnChange = useRef(
		debounce((content: string) => {
			onChange(content);
		}, 1000)
	).current;

	useEffect(() => {
		debouncedOnChange(draftContent);
	}, [draftContent, debouncedOnChange]);

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

				setDraftContent(editableRef.current.innerHTML);
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

	const handleInput = () => {
		if (editableRef.current) {
			if (maxLines) {
				const lineHeight = parseFloat(
					getComputedStyle(editableRef.current).lineHeight || '0'
				);
				const maxAllowedHeight = lineHeight * maxLines;

				if (editableRef.current.scrollHeight > maxAllowedHeight) {
					editableRef.current.innerHTML = draftContent;
					return;
				}
			}

			getTotalPages(getTotalHeight(editableRef.current));

			// Sanitize the content before updating the state
			const content = DOMPurify.sanitize(
				editableRef.current.innerHTML,
				sanitizeConfig
			);

			setDraftContent(content);
		}
	};

	const getTotalPages = (height: number) => {
		if (height <= 0) {
			setTotalPages(1);
			return;
		}

		const pages = Math.ceil(height / PAGE_HEIGHT);
		setTotalPages(pages);
	};

	return (
		<div
			ref={editableRef}
			style={{ minHeight: `${PAGE_HEIGHT * totalPages}px` }}
			contentEditable={editable}
			onInput={handleInput}
			dangerouslySetInnerHTML={{ __html: sanitizedContent }}
			className={`page ${className}`}
			onPaste={handlePaste}
		/>
	);
};

export default TextBox;
