'use client';

import React from 'react';
import { BrainCircuit } from 'lucide-react';
import styles from './ui.module.css';
import Skeleton from './Skeleton';

const LoadingState = ({ title = 'Preparando dados', description = 'Estamos organizando as informacoes mais recentes para esta tela.' }) => (
  <div className={styles.loading} aria-live="polite">
    <div>
      <div className={styles.loadingIcon}><BrainCircuit size={24} /></div>
      <strong>{title}</strong>
      <span>{description}</span>
      <div className={styles.skeletonStack} style={{ marginTop: 18 }}>
        <Skeleton height={12} />
        <Skeleton width="82%" height={12} />
        <Skeleton width="64%" height={12} />
      </div>
    </div>
  </div>
);

export default LoadingState;
