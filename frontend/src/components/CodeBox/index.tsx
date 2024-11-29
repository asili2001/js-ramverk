import React, { useRef, useEffect, LegacyRef } from 'react';
import './main.scss';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { defaultKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
//import { lint } from "@codemirror/lint";
import useAPIDocs from '../../hooks/useAPIDocs';

export interface TextBoxProps {
	editable?: boolean;
	className?: string;
	documentId: string;
	initialContent: string;
}

const CodeBox: React.FC<TextBoxProps> = ({ editable, documentId, initialContent }) => {
	const codeEditorRef = useRef<null | EditorView>(null);
	const { updateCodeDoc } = useAPIDocs();
    
	// config codeMirror
	useEffect(() => {
		const startState = EditorState.create({
			doc: initialContent,
			extensions: [
				basicSetup,
				keymap.of(defaultKeymap),
				javascript(),
				//lint()
				//lineNumbers(),
			],
		});

		const codeMirrorDiv: HTMLElement | null = document.getElementById('code-mirror');

		if (codeMirrorDiv && codeEditorRef.current !== null) {
			const view = new EditorView({
				state: startState,
				parent: codeMirrorDiv,
			});
			codeEditorRef.current = view;
			return () => {
				view.destroy();
			};
		} else {
			console.error('code-setup-fail');
		}
	}, [initialContent]);

	// Send code to execJS API
	const sendCode = async () => {
		if (codeEditorRef.current) {
			const code = codeEditorRef.current.state.doc.toString();

			const data = {
				code: btoa(code),
			};

			await fetch('https://execjs.emilfolino.se/code', {
				body: JSON.stringify(data),
				headers: {
					'content-type': 'application/json',
				},
				method: 'POST',
			})
				.then(function (response) {
					return response.json();
				})
				.then(function (result) {
					const decodedOutput = atob(result.data);

					const outputDiv = document.getElementsByClassName('code-output')[0];

					outputDiv.innerHTML = decodedOutput.replace(/\n/g, '<br>');
					updateCodeDoc(documentId, undefined, code);
				});
		}
	};

	return (
		<div>
			<div className="execute-code-btn" onClick={sendCode}>
				Run
			</div>

			<div ref={codeEditorRef as unknown as LegacyRef<HTMLDivElement>} contentEditable={editable} id={`code-mirror`} />

			<div className="code-output"></div>
		</div>
	);
};

export default CodeBox;
