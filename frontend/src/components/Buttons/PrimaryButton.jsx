// PrimaryButton.jsx
import React from 'react';
import './styles/primary.css';

const PrimaryButton = ({ 
  onClick, 
  children, 
  disabled = false, 
  type = 'button', 
  className = '',
  size = 'default', // 'small', 'default', 'large'
  loading = false,
  icon = null,
  iconPosition = 'left' // 'left', 'right', 'only'
}) => {
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return '';
    }
  };

  const getLoadingClass = () => loading ? 'loading' : '';

  const renderContent = () => {
    if (loading) {
      return 'Loading...';
    }

    if (iconPosition === 'only' && icon) {
      return <span className="icon icon-only">{icon}</span>;
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span className="icon">{icon}</span>
        )}
        {children}
        {icon && iconPosition === 'right' && (
          <span className="icon">{icon}</span>
        )}
      </>
    );
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`primary-button ${getSizeClass()} ${getLoadingClass()} ${className}`.trim()}
      aria-disabled={disabled || loading}
    >
      {renderContent()}
    </button>
  );
};

export default PrimaryButton;