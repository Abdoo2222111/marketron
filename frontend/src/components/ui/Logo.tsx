import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  showText?: boolean;
  textClassName?: string;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  width,
  height,
  showText = false,
  textClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="MARKETRON"
        className="object-contain transition-all duration-300 ease-in-out"
        style={{
          width: width || 'auto',
          height: height || 'auto',
          maxWidth: '100%',
        }}
      />
      {showText && (
        <span className={`font-black text-lg gradient-brand-text whitespace-nowrap tracking-tight ${textClassName}`}>
          MARKETRON
        </span>
      )}
    </div>
  );
};

export default Logo;
