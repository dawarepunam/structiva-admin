'use client';

import React from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackType?: 'project' | 'worker' | 'machine' | 'receipt';
}

const localFallbacks = {
  project: '/images/project1.jpg',
  machine: '/images/jcb.jpg',
  worker: '/images/worker1.jpg',
  receipt: '/images/receipt.jpg'
};

export default function SafeImage({ 
  src, 
  alt = 'Visual asset', 
  fallbackType = 'project', 
  className, 
  style, 
  ...props 
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = React.useState<string>(src || localFallbacks[fallbackType]);

  React.useEffect(() => {
    if (src) {
      setImgSrc(src);
    }
  }, [src]);

  const handleError = () => {
    // If remote fails, fallback to verified local high-res photo
    setImgSrc(localFallbacks[fallbackType]);
  };

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className={className} 
      style={style} 
      onError={handleError}
      loading="eager"
      {...props} 
    />
  );
}
