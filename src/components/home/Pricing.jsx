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
    name: 'Premium Mensal',
    price: 'R$ 20',
    description: 'Acesso mensal completo para acompanhar entradas, dashboard e explicacoes da IA.',
    features: ['Analises completas', 'Entradas premium', 'Explicacoes da IA', 'Dashboard principal'],
    highlighted: true
  }
];

const Pricing = () => {
  return (
    <MotionSection id="planos" className={`${styles.section} ${styles.softSection}`}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>Planos</span>
          <h2>Um unico plano mensal para acessar o PlacarPro.</h2>
          <p>Acesso imediato aos recursos premium por R$ 20,00 por mes.</p>
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
