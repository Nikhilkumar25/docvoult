import React from 'react';

const DocVaultLogo = ({ className = '', size = 32, ...props }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`} {...props}>
      <div className="text-primary" style={{ color: 'var(--accent-primary)' }}>
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 48 48" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <g clipPath="url(#clip0_logo)">
            <path 
              d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" 
              fill="currentColor"
            />
          </g>
          <defs>
            <clipPath id="clip0_logo">
              <rect width="48" height="48" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
      <span style={{ 
        fontSize: size * 0.6 + 'px', 
        fontWeight: '800', 
        letterSpacing: '-0.02em',
        color: 'var(--text-primary)'
      }}>
        DocsVault
      </span>
    </div>
  );
};

export default DocVaultLogo;
