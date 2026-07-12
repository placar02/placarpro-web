'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';
import Button from '../Button';
import AnimatedCard from './AnimatedCard';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const plans = [
  {
    name: 'Essencial',
    price: 'R$ 29',
    description: 'Para acompanhar analises e sinais principais com uma rotina simples.',
    features: ['Analises diarias', 'Dashboard principal', 'Historico recente', 'Acesso seguro']
  },
  {
    name: 'Pro',
    price: 'R$ 59',
    description: 'Para quem precisa de mais filtros, explicacoes e profundidade estatistica.',
    features: ['Tudo do Essencial', 'Explicacoes da IA', 'Filtros por campeonato', 'Indicadores avancados'],
    highlighted: true
  },
  {
    name: 'Premium',
    price: 'R$ 99',
    description: 'Para uso intensivo, com recursos completos e acompanhamento ampliado.',
    features: ['Tudo do Pro', 'Dados em tempo real', 'Historico completo', 'Prioridade em atualizacoes']
  }
];

const Pricing = () => {
  return (
    <MotionSection id="planos" className={`${styles.section} ${styles.softSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Planos</span>
          <h2>Escolha o nivel de inteligencia ideal para sua rotina.</h2>
          <p>Planos claros, acesso imediato e foco total em recursos de analise esportiva.</p>
        </div>
        <div className={styles.pricingGrid}>
          {plans.map((plan, index) => (
            <AnimatedCard
              key={plan.name}
              className={`${styles.priceCard} ${plan.highlighted ? styles.priceCardFeatured : ''}`}
              delay={index * 0.08}
            >
              {plan.highlighted ? <div className={styles.planBadge}><Sparkles size={14} /> Mais completo</div> : null}
              <h3>{plan.name}</h3>
              <div className={styles.priceLine}>
                <strong>{plan.price}</strong>
                <span>/mes</span>
              </div>
              <p>{plan.description}</p>
              <ul>
                {plan.features.map((feature) => (
                  <li key={feature}><Check size={16} /> {feature}</li>
                ))}
              </ul>
              <Link href="/cadastro">
                <Button variant={plan.highlighted ? 'primary' : 'secondary'}>Comecar agora</Button>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default Pricing;
