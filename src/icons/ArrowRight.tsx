import * as React from 'react';
import { IconProps } from '../types';

export const ArrowRight = React.forwardRef<SVGSVGElement, IconProps>(
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
          d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
        />
      </svg>
    );
  },
);
ArrowRight.displayName = 'ArrowRight';

export default ArrowRight;
