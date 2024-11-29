import { DropDownMenuContent } from '../DropDownMenu/types';
import { FaFileAlt } from 'react-icons/fa';
import { FaFolderOpen } from 'react-icons/fa';
import Logo from '../../assets/logo.svg';
import DropDownMenuButton from '../DropDownMenu/Button';
import './main.scss';
import React, { useEffect, useRef, useState } from 'react';
import { debounce, gatherValuesByPath } from 'arias';
import { useNavigate } from 'react-router-dom';
import useShortCuts from '../../hooks/useShortCuts';
import ThemeToggle from '../theme/ThemeToggle';

export interface DocumentNavbarProps {
	documentTitle: string;
	menuBarItems?: Record<string, DropDownMenuContent[]>;
	onTitleChange: (newTitle: string) => void;
}

const DocumentNavbar: React.FC<DocumentNavbarProps> = ({
	documentTitle,
	onTitleChange,
	menuBarItems,
}) => {
	const { registerShortcut } = useShortCuts();
	const [title, setTitle] = useState<string>('Untitled');
	const [isReady, setIsReady] = useState<boolean>(false);
	const [menuBarContent, setMenuBarContent] = useState<Record<
		string,
		DropDownMenuContent[]
	> | null>(null);
	const navigate = useNavigate();

	useEffect(() => setTitle(documentTitle), [documentTitle]);

	const defaultMenuBarItems: Record<string, DropDownMenuContent[]> = {
		File: [
			{
				title: 'New',
				icon: FaFileAlt,
				action: () => {},
				shortCutKeys: ['Ctrl', 'n'],
				disabled: false,
			},
			{
				title: 'Open',
				icon: FaFolderOpen,
				action: () => {},
				shortCutKeys: ['Ctrl', 'o'],
				disabled: false,
			},
		],
	};

	const assignMenuBarItems = (menuBarItems: Record<string, DropDownMenuContent[]>) => {
		const updatedBarContent = { ...(menuBarContent ?? {}) };

		for (const key in menuBarItems) {
			if (Object.prototype.hasOwnProperty.call(menuBarItems, key)) {
				let existingItems: string[] = [];
				if (updatedBarContent[key]) {
					existingItems = gatherValuesByPath(updatedBarContent[key], 'title') as string[];
				}

				menuBarItems[key].forEach((item) => {
					if (!existingItems.includes(item.title)) {
						if (updatedBarContent[key]) {
							updatedBarContent[key] = [
								...updatedBarContent[key],
								{ ...item, rightContent: item.shortCutKeys?.join(' + ') },
							];
						} else {
							updatedBarContent[key] = [
								{ ...item, rightContent: item.shortCutKeys?.join(' + ') },
							];
						}
						if (item.shortCutKeys) {
							registerShortcut(item.shortCutKeys, item.action, item.title);
						}
					}
				});
			}
		}

		// Update state with the new object reference
		setMenuBarContent(updatedBarContent);
	};

	useEffect(() => {
		assignMenuBarItems(defaultMenuBarItems);
		setIsReady(true);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!menuBarItems || !isReady) return;
		assignMenuBarItems(menuBarItems);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [menuBarItems]);

	const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newTitle = e.target.value.length === 0 ? 'Untitled' : e.target.value;
		setTitle(newTitle);
		// Call the throttled onTitleChange function
		debouncedOnChange(newTitle);
	};

	const debouncedOnChange = useRef(
		debounce((content: string) => {
			onTitleChange(content);
		}, 1000)
	).current;

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
					{menuBarContent &&
						Object.entries(menuBarContent).map(([sectionKey, items], index) => (
							<DropDownMenuButton key={index} title={sectionKey} items={items} />
						))}
				</ul>
			</div>
			<div className="document-toolbar">
				<ThemeToggle />
			</div>
		</div>
	);
};

export default DocumentNavbar;
