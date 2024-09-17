import { DropDownMenuContent } from './types';
import './main.scss';

const Menu: React.FC<{ items: DropDownMenuContent[] }> = ({ items }) => {
  return (
    <ul className="dropdown-menu-list">
      {items.map((item, index) => (
        <MenuItem key={index} item={item} />
      ))}
    </ul>
  );
};

export const MenuItem: React.FC<{ item: DropDownMenuContent }> = ({ item }) => {
  return (
    <>
      <li>
        <item.icon />
        {item.title}
        {item.rightContent}
      </li>
      {item.children && <Menu items={item.children} />}
    </>
  );
};

export default Menu;
