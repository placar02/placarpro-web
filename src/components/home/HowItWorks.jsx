'use client';

import React from 'react';
import { Activity, BrainCircuit, LineChart } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const steps = [
  {
    icon: Activity,
    title: 'Coleta e normalizacao',
    text: 'Partidas, campeonatos, forma recente e indicadores de desempenho sao organizados em uma base unica.'
  },
  {
    icon: BrainCircuit,
    title: 'Leitura por IA',
    text: 'O modelo cruza sinais estatisticos e explica quais fatores pesam na interpretacao de cada confronto.'
  },
  {
    icon: LineChart,
    title: 'Decisao com contexto',
    text: 'Voce acompanha niveis de confianca, historico e justificativas para comparar cenarios com clareza.'
  }
];

const HowItWorks = () => {
  return (
    <MotionSection id="como-funciona" className={styles.section}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Como funciona</span>
          <h2>Da partida ao insight, em um fluxo simples.</h2>
          <p>O PlacarPro organiza dados esportivos em uma experiencia limpa, analitica e pronta para consulta diaria.</p>
        </div>
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <AnimatedCard key={step.title} className={styles.stepCard} delay={index * 0.08}>
                <div className={styles.stepIndex}>0{index + 1}</div>
                <div className={styles.iconBox}><Icon size={22} /></div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};

export default HowItWorks;
