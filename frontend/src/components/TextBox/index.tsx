import React, { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';

export interface TextBoxProps {
  content: string;
  onChange?: (draftContent: string) => void;
  className?: string;
  style?: React.CSSProperties;
  editable?: boolean;
  useHTML?: boolean;
  maxLines?: number;
}

const TextBox: React.FC<TextBoxProps> = ({
  content,
  onChange,
  className,
  style,
  editable,
  useHTML,
  maxLines,
}) => {
  const allowedTags = ['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
  const sanitizeConfig =
    useHTML && allowedTags ? { ALLOWED_TAGS: allowedTags } : {};
  const sanitizedContent = DOMPurify.sanitize(content, sanitizeConfig);
  const [draftContent, setDraftContent] = useState(sanitizedContent);
  const editableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onChange) onChange(draftContent);
  }, [draftContent, onChange]);

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    const text = e.clipboardData.getData('text');

    if (editableRef.current) {
      const selection = window.getSelection();
      if (selection) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
      }
    }
  };

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

      // Sanitize the content before updating the state
      setDraftContent(
        DOMPurify.sanitize(editableRef.current.innerHTML, sanitizeConfig)
      );
    }
  };

  return (
    <div
      ref={editableRef}
      contentEditable={editable}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      className={className}
      style={{ ...style, overflowY: 'auto', whiteSpace: 'pre-wrap' }}
      onPaste={handlePaste}
    />
  );
};

export default TextBox;
