import React from 'react';
import { SearchX } from 'lucide-react';
import styles from './ui.module.css';

const EmptyState = ({ title = 'Nada encontrado', description = 'Quando houver dados disponiveis, eles aparecem aqui.', icon: Icon = SearchX }) => (
  <div className={styles.empty}>
    <div>
      <div className={styles.emptyIcon}><Icon size={23} /></div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

export default EmptyState;
