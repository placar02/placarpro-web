import React from 'react';
import styles from './ui.module.css';

const Skeleton = ({ width = '100%', height = 14, className = '', ...props }) => (
  <span className={`${styles.skeleton} ${className}`} style={{ width, height }} {...props} />
);

export default Skeleton;
