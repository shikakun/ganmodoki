import * as React from 'react';
import { IconProps } from '../types';

export const ArrowLeft = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color = 'currentColor', ...props }, forwardedRef) => {
    return (
      <svg
        {...props}
        ref={forwardedRef}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path
          fill={color}
          d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"
        />
      </svg>
    );
  },
);
ArrowLeft.displayName = 'ArrowLeft';

export default ArrowLeft;
