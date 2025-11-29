import React from 'react';

interface CamoBackgroundProps {
  variant?: 'subtle' | 'bold' | 'animated';
  opacity?: number;
  className?: string;
  children?: React.ReactNode;
}

const CamoBackground: React.FC<CamoBackgroundProps> = ({
  variant = 'bold',
  opacity = 1,
  className = '',
  children,
}) => {
  const variantClasses = {
    subtle: 'camo-background-subtle',
    bold: 'camo-background',
    animated: 'camo-background camo-animated',
  };

  const baseClasses = variantClasses[variant];
  const style = {
    opacity,
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`absolute inset-0 ${baseClasses}`}
        style={style}
      />
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  );
};

export default CamoBackground;
