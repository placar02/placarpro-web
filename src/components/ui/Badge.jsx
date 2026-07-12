import React from 'react';
import styles from './ui.module.css';

const Badge = ({ children, tone = 'default', className = '', ...props }) => (
  <span className={`${styles.badge} ${styles[tone] || ''} ${className}`} {...props}>
    {children}
  </span>
);

export default Badge;
