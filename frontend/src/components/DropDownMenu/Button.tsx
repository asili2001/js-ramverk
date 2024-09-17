import { useState, useRef, useEffect } from 'react';
import Menu from './Menu';
import { DropDownMenuContent } from './types';

export interface DropDownMenuButtonProps {
  title?: string;
  items: DropDownMenuContent[];
  className?: string;
}

const Button = ({ title, items, className }: DropDownMenuButtonProps) => {
  const [active, setActive] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      buttonRef.current &&
      menuRef.current &&
      !buttonRef.current.contains(event.target as Node) &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setActive(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuActivate = (isActive: boolean) => {
    setActive(isActive);
  };

  return (
    <div className="dropdown-menu-btn-container">
      <button
        className={className}
        ref={buttonRef}
        onClick={() => handleMenuActivate(!active)}
      >
        {title}
      </button>
      {active && (
        <div ref={menuRef}>
          <Menu items={items} />
        </div>
      )}
    </div>
  );
};

export default Button;
