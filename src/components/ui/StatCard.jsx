import React from 'react';
import styles from './ui.module.css';

const StatCard = ({ label, value, hint, icon }) => (
  <article className={styles.statCard}>
    <div className={styles.statTop}>
      <span>{label}</span>
      {icon ? <span className={styles.statIcon}>{icon}</span> : null}
    </div>
    <div className={styles.statValue}>{value}</div>
    {hint ? <div className={styles.statHint}>{hint}</div> : null}
  </article>
);

export default StatCard;
