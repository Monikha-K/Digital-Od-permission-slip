import React from 'react';
import '../styles/Button.css';

const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false }) => {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
