import React, { useState } from 'react';
import { IconType } from 'react-icons';
import './main.scss';

export type Option = {
	title: string;
	value: string;
	icon?: IconType;
};

interface ISwitch {
	options: Option[];
	defaultOption: Option['value'];
	onChange: (value: Option['value'], id: string) => void;
	id: string;
}

const Switch: React.FC<ISwitch> = ({ options, defaultOption, onChange, id }) => {
	const [activeOption, setActiveOption] = useState<number>(
		options.findIndex((option) => option.value === defaultOption)
	);

	const handleOptionChange = (index: number, id: string) => {
		const activeValue = options[index].value;
		setActiveOption(index);
		onChange(activeValue, id);
	};

	return (
		<div className="switch">
			{options.map((option, index) => (
				<div className="item" key={index} onClick={() => handleOptionChange(index, id)}>
					{option.icon ? <option.icon /> : ''}
					{option.title}
				</div>
			))}
			<div className="indecator" style={{ left: `${activeOption * 50}%` }}></div>
		</div>
	);
};

export default Switch;
