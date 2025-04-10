import React from 'react';
import Image from 'next/image';

interface BorderedImageProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg';
  width?: number;
  height?: number;
  className?: string;
}

const sizeClasses = {
  sm: {
    container: "w-16 h-16", // 64px
    image: 64
  },
  md: {
    container: "w-[75px] h-[75px]",
    image: 75
  },
  lg: {
    container: "w-32 h-32", // 128px
    image: 128
  },
} as const;

const BorderedImage: React.FC<BorderedImageProps> = ({ 
  src, 
  alt, 
  size = 'md',
  width,
  height,
  className = '' 
}) => {
  // Si se proporcionan width y height, úsalos; de lo contrario, usa el tamaño predefinido
  const useCustomSize = width !== undefined && height !== undefined;
  
  const containerStyle = useCustomSize 
    ? { width: `${width}px`, height: `${height}px` } 
    : undefined;
  
  const imageSize = useCustomSize 
    ? { width, height } 
    : { width: sizeClasses[size].image, height: sizeClasses[size].image };

  return (
    <div 
      className={`relative ${!useCustomSize ? sizeClasses[size].container : ''} rounded-full border-2 border-white p-1 overflow-hidden ${className}`}
      style={containerStyle}
    >
      <Image 
        src={src} 
        alt={alt} 
        width={imageSize.width}
        height={imageSize.height}
        className="rounded-full object-cover w-full h-full"
      />
    </div>
  );
};

export default BorderedImage;