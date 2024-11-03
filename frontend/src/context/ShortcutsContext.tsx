import { createContext, useContext, ReactNode } from 'react';
import useShortCuts, { Shortcut } from '../hooks/useShortCuts';

interface ShortcutsContextType {
	shortcuts: Shortcut[];
	registerShortcut: (keys: string[], action: () => void, label: string) => void;
	unregisterShortcut: (keys: string[]) => void;
}

// Create a context for shortcuts
const ShortcutsContext = createContext<ShortcutsContextType | undefined>(undefined);

export const ShortcutsProvider = ({ children }: { children: ReactNode }) => {
	const { shortcuts, registerShortcut, unregisterShortcut } = useShortCuts();

	return (
		<ShortcutsContext.Provider value={{ shortcuts, registerShortcut, unregisterShortcut }}>
			{children}
		</ShortcutsContext.Provider>
	);
};

/* eslint-disable react-refresh/only-export-components */
export const useShortcutsContext = (): ShortcutsContextType => {
	const context = useContext(ShortcutsContext);
	if (!context) {
		throw new Error('useShortcutsContext must be used within a ShortcutsProvider');
	}
	return context;
};
