'use client';

import React from 'react';
import { LoaderCircle } from 'lucide-react';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', size = 'md', loading = false, className = '', disabled, ...props }) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size] || ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <LoaderCircle className={styles.spinner} size={17} /> : null}
      {children}
    </button>
  );
};

export default Button;
