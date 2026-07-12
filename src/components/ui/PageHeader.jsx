import React from 'react';
import Badge from './Badge';
import styles from './ui.module.css';

const PageHeader = ({ eyebrow, icon, title, description, actions }) => (
  <header className={styles.pageHeader}>
    <div>
      {eyebrow ? <Badge tone="default">{icon}{eyebrow}</Badge> : null}
      <h1>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className={styles.headerActions}>{actions}</div> : null}
  </header>
);

export default PageHeader;
