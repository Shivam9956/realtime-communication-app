import React from 'react';

export const Card = ({
  children,
  className = '',
  interactive = false,
  glow = false,
  onClick,
  ...props
}) => {
  const classes = [
    'card',
    glow ? 'glass-panel-glow' : '',
    interactive ? 'card-interactive' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;
