import React from 'react';

const Logo = ({ className = "w-6 h-6", invert = false }) => {
    return (
        <img
            src="logo.svg"
            alt="Ben Lairig Logo"
            className={`${className} object-contain ${invert ? 'brightness-0 invert' : ''}`}
        />
    );
};

export default Logo;
