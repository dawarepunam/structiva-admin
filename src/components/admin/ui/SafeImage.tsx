'use client';

import React from 'react';

interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | any;
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
  const initialSrc = typeof src === 'string' ? src : localFallbacks[fallbackType];
  const [imgSrc, setImgSrc] = React.useState<string>(initialSrc);

  React.useEffect(() => {
    if (typeof src === 'string' && src) {
      setImgSrc(src);
    } else if (!src) {
      setImgSrc(localFallbacks[fallbackType]);
    }
  }, [src, fallbackType]);

  const handleError = () => {
    // If remote or invalid fails, fallback to verified local high-res photo
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
