import { DropDownMenuContent } from '../DropDownMenu/types';
import { FaFileAlt } from 'react-icons/fa';
import { FaFolderOpen } from 'react-icons/fa';
import { FaShareAlt } from 'react-icons/fa';
import { FaUndo } from 'react-icons/fa';
import { FaRedo } from 'react-icons/fa';
import Logo from '../../assets/logo.svg';
import DropDownMenuButton from '../DropDownMenu/Button';
import './main.scss';
import React, { useMemo, useState } from 'react';
import { debounce } from 'arias';
import { useNavigate } from 'react-router-dom';
import { useShortcutsContext } from '../../context/ShortcutsContext';

export interface DocumentNavbarProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
}

const DocumentNavbar: React.FC<DocumentNavbarProps> = ({
  documentTitle,
  onTitleChange,
}) => {
  const { shortcuts } = useShortcutsContext();
  const [title, setTitle] = useState<string>(documentTitle);
  const navigate = useNavigate();

  const menuBarContent: Record<string, DropDownMenuContent[]> = {
    File: [
      {
        title: 'New',
        icon: FaFileAlt,
        action: () => {},
        rightContent: shortcuts
          .find((shortcut) => shortcut.label === 'New')
          ?.keys.join(' + ')
      },
      {
        title: 'Open',
        icon: FaFolderOpen,
        action: () => {},
        rightContent: shortcuts
          .find((shortcut) => shortcut.label === 'Open')
          ?.keys.join(' + ')
      },
      {
        title: 'Share',
        icon: FaShareAlt,
        action: () => {},
        rightContent: shortcuts
          .find((shortcut) => shortcut.label === 'Share')
          ?.keys.join(' + '),
      },
    ],
    Edit: [
      {
        title: 'Undo',
        icon: FaUndo,
        action: () => {},
        rightContent: shortcuts
          .find((shortcut) => shortcut.label === 'Undo')
          ?.keys.join(' + '),
      },
      {
        title: 'Redo',
        icon: FaRedo,
        action: () => {},
        rightContent: shortcuts
          .find((shortcut) => shortcut.label === 'Redo')
          ?.keys.join(' + '),
      },
    ],
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.length === 0 ? 'Untitled' : e.target.value;
    setTitle(newTitle);
    // Call the throttled onTitleChange function
    debouncedOnTitleChange(newTitle);
  };

  const debouncedOnTitleChange = useMemo(
    () => debounce((newTitle: string) => onTitleChange(newTitle), 1000),
    [onTitleChange]
  );

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate('/documents')}>
        <img src={Logo} alt="logo" />
      </div>
      <div className="title-n-menubar">
        <input
          type="text"
          value={title}
          placeholder="Untitled"
          onChange={(e) => handleTitleChange(e)}
        />
        <ul className="document-menubar">
          <DropDownMenuButton title="File" items={menuBarContent['File']} />
          <DropDownMenuButton title="Edit" items={menuBarContent['Edit']} />
        </ul>
      </div>
      <div className="document-toolbar"></div>
    </div>
  );
};

export default DocumentNavbar;
