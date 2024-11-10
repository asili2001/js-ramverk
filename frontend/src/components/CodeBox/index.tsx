
import React, { useState, useRef, useEffect } from 'react';
import './main.scss';
import { EditorView, basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { defaultKeymap } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
//import { lint } from "@codemirror/lint";


export interface TextBoxProps {
    editable?: boolean;
    className?: string;
}

// keybinds

// fixa cmd + s -> för att spara document



const CodeBox: React.FC<TextBoxProps> = ({
    editable,
    }) => {
    const codeEditorRef = useRef<EditorView | any>(null);

    // config codeMirror
    useEffect(() => {
        const defaultContent = 'console.log("Hello World");' + '\n'.repeat(20);
        let startState = EditorState.create({
            doc: defaultContent,
            extensions: [
                basicSetup,
                keymap.of(defaultKeymap),
                javascript(),
                //lint()
                //lineNumbers(), // Add this line
            ]
        });

        const codeMirrorDiv: HTMLElement | null = document.getElementById('code-mirror');

        if (codeMirrorDiv) {
            let view = new EditorView({
                state: startState,
                parent: codeMirrorDiv
            });
            codeEditorRef.current = view;
            return () => {
                view.destroy();
            };
        } else {
                console.log("code-setup-fail");
        }
    }, []);


    const handleInput: any = () => {
        console.log("input detected!");
    };

    // Send code to execJS API
    const sendCode = async () => {
        console.log("sending code to execjs api!");
        if (codeEditorRef.current) {
            const code = codeEditorRef.current.state.doc.toString(); // Get the content as a string

            console.log("Code to send:", code);
            var data = {
                code: btoa(code)
            };

            await fetch("https://execjs.emilfolino.se/code", {
                body: JSON.stringify(data),
                headers: {
                'content-type': 'application/json'
                },
                method: 'POST'
            }).then(function (response) {
                return response.json();
            }).then(function(result) {
                let decodedOutput = atob(result.data);

                console.log("OUTPUT FROM API RESPONSE: ", decodedOutput); // outputs: hej
                const outputDiv = document.getElementsByClassName("code-output")[0];

                outputDiv.innerHTML = decodedOutput.replace(/\n/g, "<br>");
                //outputDiv.textContent = decodedOutput;
            });
        }
    };



    return (
        <div>
            <div className="execute-code-btn" onClick={sendCode}>Run</div>

            <div ref={codeEditorRef}
                // style={{ minHeight: `${1 * 1000}px` }}
                contentEditable={editable}
                onInput={()=>handleInput()}
                id={`code-mirror`}
            />

            <div className="code-output"></div>
        </div>
    );
};


export default CodeBox;
