import React from 'react';

interface SpinnerProps {
  tag?: keyof React.JSX.IntrinsicElements
  type?: 'bordered' | 'grow'
  className?: string
  color?: string
  size?: string
  children?: React.ReactNode
}

const Spinner = ({
  tag = 'div',
  type = 'bordered',
  className,
  color,
  size,
  children
}: SpinnerProps) => {
  const Tag = (tag || 'div') as keyof React.JSX.IntrinsicElements;
  return <Tag role="status" className={`${type === 'bordered' ? 'spinner-border' : type === 'grow' ? 'spinner-grow' : ''} ${color ? `text-${color}` : 'text-dark'} ${size ? 'avatar-' + size : ''} ${className}`}>
      {children}
    </Tag>;
};

export default Spinner;