import { useState, useEffect, useCallback } from 'react';

// Define the type for a single shortcut
interface Shortcut {
  keys: string[];
  action: () => void;
  label: string;
}

// Hook to manage shortcuts
const useShortCuts = () => {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);

  // Register a new shortcut
  const registerShortcut = useCallback(
    (keys: string[], action: () => void, label: string) => {
      setShortcuts((prevShortcuts) => [
        ...prevShortcuts,
        { keys, action, label },
      ]);
    },
    []
  );

  // Unregister a shortcut by key combination
  const unregisterShortcut = useCallback((keys: string[]) => {
    setShortcuts((prevShortcuts) =>
      prevShortcuts.filter((s) => !arraysEqual(s.keys, keys))
    );
  }, []);

  // Change the key combination of an existing shortcut
  const changeShortcutKeys = useCallback(
    (oldKeys: string[], newKeys: string[]) => {
      setShortcuts((prevShortcuts) => {
        const updatedShortcuts = prevShortcuts.map((s) =>
          arraysEqual(s.keys, oldKeys) ? { ...s, keys: newKeys } : s
        );
        return updatedShortcuts;
      });
    },
    []
  );

  // Utility function to compare arrays
  const arraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  };

  // Execute shortcut action based on the pressed keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = [
        event.ctrlKey ? 'Ctrl' : '',
        event.altKey ? 'Alt' : '',
        event.shiftKey ? 'Shift' : '',
        event.key,
      ].filter(Boolean);

      const shortcut = shortcuts.find((s) => arraysEqual(s.keys, pressedKeys));
      if (shortcut) {
        event.preventDefault();
        shortcut.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);

  return {
    registerShortcut,
    unregisterShortcut,
    changeShortcutKeys,
    shortcuts,
  };
};

export default useShortCuts;
