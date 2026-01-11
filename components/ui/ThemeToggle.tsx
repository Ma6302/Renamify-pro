import React from 'react';

interface ThemeToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ checked, onChange }) => {
  return (
    <div className="toggle-switch">
      <label className="switch-label">
        <input 
          type="checkbox" 
          className="checkbox" 
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="slider"></span>
      </label>
    </div>  
  );
};