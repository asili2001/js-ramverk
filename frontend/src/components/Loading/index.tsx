import React from 'react';
import { CgSpinnerTwo } from "react-icons/cg";

import './main.scss'; // Optional CSS for styling

const LoadingSpinner: React.FC<{ size?: number; color?: string; floating?: boolean }> = ({
  size = 40,
  color = '#BCC1FF',
  floating
}) => {
  return (
    <div className={`loading-spinner ${floating !== undefined && floating !== false ? "floating": ""}`} style={{ fontSize: size, color }}>
      <CgSpinnerTwo className="spinner" />
    </div>
  );
};

export default LoadingSpinner;
