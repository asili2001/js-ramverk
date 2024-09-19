import { DropDownMenuContent } from './types';
import './main.scss';
import { useEffect, useRef, useState } from 'react';

const Menu: React.FC<{
	items: DropDownMenuContent[];
	className?: string;
	style?: React.CSSProperties;
}> = ({ items, className, style }) => {
	return (
		<ul className={`dropdown-menu-list ${className}`} style={style}>
			{items.map((item, index) => (
				<MenuItem key={index} item={item} />
			))}
		</ul>
	);
};

export const MenuItem: React.FC<{ item: DropDownMenuContent }> = ({ item }) => {
	const [childMenuActive, setChildManuActive] = useState<boolean>(false);
	const itemRef = useRef<HTMLLIElement>(null);
	const [dimensions, setDimensions] = useState({
		width: 0,
		height: 0,
		top: 0,
	});

	useEffect(() => {
		if (!itemRef.current) return;
		const element = itemRef.current;
		const rect = element.getBoundingClientRect();

		setDimensions({
			width: rect.width,
			height: rect.height,
			top: rect.top,
		});
	}, [itemRef]);

	return (
		<>
			<li
				ref={itemRef}
				onClick={() =>
					item.children ? setChildManuActive(true) : undefined
				}
			>
				<div className="left">
					<item.icon />
					{item.title}
				</div>
				<div className="right">{item.rightContent}</div>
			</li>
			{item.children && childMenuActive && (
				<Menu
					items={item.children}
					style={{
						position: 'absolute',
						left: `${dimensions.width}px`,
					}}
				/>
			)}
		</>
	);
};

export default Menu;
