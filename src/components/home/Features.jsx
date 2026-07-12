'use client';

import React from 'react';
import { Bot, CalendarDays, Clock3, Gauge, History, LayoutDashboard, LockKeyhole, Trophy } from 'lucide-react';
import AnimatedCard from './AnimatedCard';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const features = [
  { icon: Bot, title: 'Analise por IA', text: 'Explicacoes claras sobre os fatores que influenciam cada leitura.' },
  { icon: Gauge, title: 'Motor estatistico', text: 'Indicadores calibrados para comparar desempenho, volume e consistencia.' },
  { icon: Trophy, title: 'Por campeonato', text: 'Recortes por liga para entender contexto competitivo e padroes locais.' },
  { icon: CalendarDays, title: 'Analise diaria', text: 'Uma rotina objetiva para consultar oportunidades e jogos relevantes.' },
  { icon: LayoutDashboard, title: 'Dashboard', text: 'Visao centralizada com filtros, sinais, status e comparativos.' },
  { icon: History, title: 'Historico', text: 'Registro das analises para acompanhar comportamento ao longo do tempo.' },
  { icon: Clock3, title: 'Atualizacao automatica', text: 'Dados sincronizados para reduzir trabalho manual e manter o contexto fresco.' },
  { icon: LockKeyhole, title: 'Seguranca', text: 'Arquitetura com acesso autenticado e gestao de planos integrada.' }
];

const Features = () => {
  return (
    <MotionSection id="recursos" className={`${styles.section} ${styles.softSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Recursos principais</span>
          <h2>Ferramentas para analisar futebol com mais precisao.</h2>
          <p>Menos ruido, mais leitura tecnica. Cada modulo foi pensado para acelerar comparacao, acompanhamento e decisao.</p>
        </div>
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimatedCard key={feature.title} className={styles.featureCard} delay={(index % 4) * 0.05}>
                <Icon size={21} />
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};

export default Features;
