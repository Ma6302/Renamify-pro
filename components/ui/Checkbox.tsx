import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  color?: 'blue' | 'green' | 'purple' | 'red';
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, color = 'blue', className = '' }) => {
  return (
    <label className={`ios-checkbox ${color} ${className}`}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <div className="checkbox-wrapper">
        <div className="checkbox-bg"></div>
        <svg fill="none" viewBox="0 0 24 24" className="checkbox-icon">
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="3"
            stroke="currentColor"
            d="M4 12L10 18L20 6"
            className="check-path"
          ></path>
        </svg>
      </div>
    </label>
  );
};