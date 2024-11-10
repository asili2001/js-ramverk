// ThemeToggle.tsx
import React, { useState, useEffect } from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import './ThemeToggle.scss';

const ThemeToggle: React.FC = () => {
	const [theme, setTheme] = useState<'light' | 'dark'>('light');

	// Load saved theme or default to light
	useEffect(() => {
		const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
		setTheme(savedTheme);
		document.body.setAttribute('data-theme', savedTheme);
	}, []);

	// Toggle theme and save it to localStorage
	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light';
		setTheme(newTheme);
		document.body.setAttribute('data-theme', newTheme);
		localStorage.setItem('theme', newTheme);
	};

	return (
		<div className="theme-toggle">
			<button onClick={toggleTheme} className="theme-toggle-button">
				{theme === 'dark' ? (
					<FaSun className="icon sun-icon" />
				) : (
					<FaMoon className="icon moon-icon" />
				)}
			</button>
		</div>
	);
};

export default ThemeToggle;
