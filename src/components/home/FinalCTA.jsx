'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Button from '../Button';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const FinalCTA = () => {
  return (
    <MotionSection className={styles.ctaSection}>
      <div className={`container ${styles.ctaBox}`}>
        <span className={styles.kicker}>PlacarPro</span>
        <h2>Decisoes mais inteligentes comecam com dados.</h2>
        <p>Entre em uma plataforma feita para transformar informacao esportiva em analise clara, organizada e profissional.</p>
        <div className={styles.ctaActions}>
          <Link href="/cadastro">
            <Button variant="primary">Criar acesso <ArrowRight size={18} /></Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary">Entrar</Button>
          </Link>
        </div>
      </div>
    </MotionSection>
  );
};

export default FinalCTA;
