'use client';

import React from 'react';
import { CheckCircle2, Layers3, Search, SlidersHorizontal } from 'lucide-react';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const PlatformDemo = () => {
  return (
    <MotionSection id="demonstracao" className={styles.section}>
      <div className={`container ${styles.demoGrid}`}>
        <div className={styles.demoCopy}>
          <span className={styles.kicker}>Demonstracao da plataforma</span>
          <h2>Um cockpit de analise para acompanhar o calendario esportivo.</h2>
          <p>
            A interface prioriza leitura rapida: filtros por campeonato, ranking de sinais, explicacoes da IA e historico em uma mesma area de trabalho.
          </p>
          <div className={styles.demoPoints}>
            <span><CheckCircle2 size={17} /> Comparacao entre equipes</span>
            <span><CheckCircle2 size={17} /> Justificativa tecnica da IA</span>
            <span><CheckCircle2 size={17} /> Indicadores em tempo real</span>
          </div>
        </div>
        <div className={styles.platformFrame}>
          <div className={styles.platformSidebar}>
            <strong>PlacarPro</strong>
            <span className={styles.activeNav}><Layers3 size={15} /> Analises</span>
            <span><SlidersHorizontal size={15} /> Filtros</span>
            <span><Search size={15} /> Pesquisa</span>
          </div>
          <div className={styles.platformContent}>
            <div className={styles.platformHeader}>
              <div>
                <span>Hoje</span>
                <h3>Mapa de inteligencia</h3>
              </div>
              <button type="button">Premier League</button>
            </div>
            <div className={styles.matchGrid}>
              {['Arsenal x Chelsea', 'Porto x Benfica', 'Milan x Lazio'].map((match, index) => (
                <div key={match} className={index === 0 ? styles.matchCardActive : styles.matchCard}>
                  <span>{match}</span>
                  <strong>{index === 0 ? 'Alta clareza' : 'Em observacao'}</strong>
                  <div><span style={{ width: `${82 - index * 12}%` }} /></div>
                </div>
              ))}
            </div>
            <div className={styles.aiExplanation}>
              <span>Explicacao da IA</span>
              <p>O confronto apresenta assimetria em volume ofensivo, recuperacao alta e consistencia recente do mandante.</p>
            </div>
          </div>
        </div>
      </div>
    </MotionSection>
  );
};

export default PlatformDemo;
