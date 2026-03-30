// SecondaryButton.jsx
import React from 'react';
import './styles/secondary.css';

const SecondaryButton = ({ onClick, children, disabled = false, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`secondary-button ${className}`}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;