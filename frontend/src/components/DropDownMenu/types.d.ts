import { IconType } from 'react-icons';
import { Shortcut } from '../../hooks/useShortCuts';
type DropDownMenuContent = {
	icon: IconType;
	title: string;
	action: () => void;
	rightContent?: string;
	shortCutKeys?: Shortcut['keys'];
	children?: DropDownMenuContent[];
	disabled: boolean;
};
