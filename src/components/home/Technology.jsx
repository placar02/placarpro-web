'use client';

import React from 'react';
import { Cpu, DatabaseZap, RadioTower, Shield } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const techItems = [
  { icon: DatabaseZap, title: 'Pipeline de dados', text: 'Coleta, enriquecimento e padronizacao de eventos esportivos.' },
  { icon: Cpu, title: 'Modelos analiticos', text: 'Camadas estatisticas combinadas com interpretacao assistida por IA.' },
  { icon: RadioTower, title: 'Sincronizacao continua', text: 'Atualizacoes frequentes para manter a plataforma alinhada ao calendario.' },
  { icon: Shield, title: 'Base segura', text: 'Acesso protegido, controle de planos e separacao clara de dados sensiveis.' }
];

const Technology = () => {
  return (
    <MotionSection id="tecnologia" className={`${styles.section} ${styles.darkSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Tecnologia utilizada</span>
          <h2>Uma camada de inteligencia sobre dados esportivos.</h2>
          <p>O PlacarPro combina automacao, estatistica e IA para entregar uma experiencia consistente de analise.</p>
        </div>
        <div className={styles.techGrid}>
          {techItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <AnimatedCard key={item.title} className={styles.techCard} delay={index * 0.07}>
                <Icon size={23} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};

export default Technology;
