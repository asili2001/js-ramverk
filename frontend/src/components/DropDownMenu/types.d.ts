import { IconType } from 'react-icons';
type DropDownMenuContent = {
	icon: IconType;
	title: string;
	action: () => void;
	rightContent?: string;
	children?: DropDownMenuContent[];
};
