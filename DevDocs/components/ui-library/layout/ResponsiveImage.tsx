import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export interface ResponsiveImageProps {
  /**
   * Source URL of the image
   */
  src: string;
  /**
   * Alternative text for accessibility
   */
  alt: string;
  /**
   * Make image fill its container
   */
  fill?: boolean;
  /**
   * Width of the image in pixels (not used when fill=true)
   */
  width?: number;
  /**
   * Height of the image in pixels (not used when fill=true)
   */
  height?: number;
  /**
   * Image sizes attribute for responsive loading
   * @example "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
   */
  sizes?: string;
  /**
   * How the image should be resized to fit its container
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  /**
   * Image position within its container
   */
  objectPosition?: string;
  /**
   * Priority loading for LCP (Largest Contentful Paint) images
   */
  priority?: boolean;
  /**
   * Quality of the optimized image (1-100)
   */
  quality?: number;
  /**
   * Apply rounded corners to the image
   */
  rounded?: boolean | 'sm' | 'md' | 'lg' | 'full';
  /**
   * Additional classes
   */
  className?: string;
}

/**
 * Responsive image component built on Next.js Image with additional responsive features
 */
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  sizes = '100vw',
  objectFit = 'cover',
  objectPosition = 'center',
  priority = false,
  quality = 85,
  rounded = false,
  className,
  ...props
}) => {
  // Map objectFit to Tailwind classes
  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
    'scale-down': 'object-scale-down',
  }[objectFit];

  // Map rounded to Tailwind classes
  let roundedClass = '';
  if (rounded === true) roundedClass = 'rounded';
  else if (rounded === 'sm') roundedClass = 'rounded-sm';
  else if (rounded === 'md') roundedClass = 'rounded-md';
  else if (rounded === 'lg') roundedClass = 'rounded-lg';
  else if (rounded === 'full') roundedClass = 'rounded-full';

  return (
    <div 
      className={cn(
        'relative',
        // If fill is false and dimensions are provided, let parent handle dimensions
        !fill && (width || height) ? '' : 'w-full h-full',
        className
      )}
      style={
        !fill && width && height
          ? { width: `${width}px`, height: `${height}px` }
          : undefined
      }
    >
      <Image
        src={src}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        quality={quality}
        priority={priority}
        className={cn(
          objectFitClass,
          roundedClass,
          'transition-opacity duration-300'
        )}
        style={{ objectPosition }}
        {...props}
      />
    </div>
  );
};

export default ResponsiveImage;