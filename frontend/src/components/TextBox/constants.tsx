import React from 'react';
import { BiCodeBlock } from 'react-icons/bi';
import { BsBlockquoteLeft, BsTypeH1, BsTypeH2, BsTypeH3, BsTypeH4 } from 'react-icons/bs';
import { FaBold, FaItalic, FaUnderline } from 'react-icons/fa';
import { FaSection } from 'react-icons/fa6';
import { MdOutlineArticle } from 'react-icons/md';

import { GrMonospace } from 'react-icons/gr';
import { RiListOrdered, RiListUnordered } from 'react-icons/ri';
import { GiAtomicSlashes } from 'react-icons/gi';

export type ToolbarStyleItem = {
	label: string;
	style: string;
	icon: React.ReactElement;
};

const inlineStyles: ToolbarStyleItem[] = [
	{
		label: 'bold',
		style: 'BOLD',
		icon: <FaBold />,
	},
	{
		label: 'italic',
		style: 'ITALIC',
		icon: <FaItalic />,
	},
	{
		label: 'Underline',
		style: 'UNDERLINE',
		icon: <FaUnderline />,
	},
	{
		label: 'Monospace',
		style: 'HEADING-ONE',
		icon: <GrMonospace />,
	},
];

const blockStyles: ToolbarStyleItem[] = [
	{
		label: 'H1',
		style: 'header-one',
		icon: <BsTypeH1 />,
	},
	{
		label: 'H2',
		style: 'header-two',
		icon: <BsTypeH2 />,
	},
	{
		label: 'H3',
		style: 'header-three',
		icon: <BsTypeH3 />,
	},
	{
		label: 'H4',
		style: 'header-four',
		icon: <BsTypeH4 />,
	},
	{
		label: 'Section',
		style: 'section',
		icon: <FaSection />,
	},
	{
		label: 'Article',
		style: 'article',
		icon: <MdOutlineArticle />,
	},
	{
		label: 'unordered List Item',
		style: 'unordered-list-item',
		icon: <RiListUnordered />,
	},
	{
		label: 'ordered List Item',
		style: 'ordered-list-item',
		icon: <RiListOrdered />,
	},
	{
		label: 'blockquote',
		style: 'blockquote',
		icon: <BsBlockquoteLeft />,
	},
	{
		label: 'atomic',
		style: 'atomic',
		icon: <GiAtomicSlashes />,
	},
	{
		label: 'code-block',
		style: 'code-block',
		icon: <BiCodeBlock />,
	},
];

export { inlineStyles, blockStyles };
