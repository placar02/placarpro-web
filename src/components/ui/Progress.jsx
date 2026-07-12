import React from 'react';
import styles from './ui.module.css';

const Progress = ({ value = 0 }) => (
  <div className={styles.progressTrack}>
    <div className={styles.progressFill} style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }} />
  </div>
);

export default Progress;
