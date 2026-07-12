'use client';

import React from 'react';
import { Eye, FileText, GaugeCircle, RefreshCcw } from 'lucide-react';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const items = [
  { icon: Eye, title: 'Transparencia analitica', text: 'Cada leitura vem acompanhada dos sinais que sustentam a interpretacao.' },
  { icon: GaugeCircle, title: 'Menos ruido operacional', text: 'O painel concentra o que importa para consultar, filtrar e comparar rapidamente.' },
  { icon: RefreshCcw, title: 'Rotina sempre atualizada', text: 'A plataforma acompanha novas partidas e reorganiza dados conforme o calendario muda.' },
  { icon: FileText, title: 'Historico consultavel', text: 'Analises anteriores ajudam a observar tendencias e revisar criterios com calma.' }
];

const Differentials = () => {
  return (
    <MotionSection id="diferenciais" className={styles.section}>
      <div className="container">
        <div className={styles.splitHeader}>
          <div>
            <span className={styles.kicker}>Diferenciais</span>
            <h2>Projetado para quem leva analise esportiva a serio.</h2>
          </div>
          <p>
            A experiencia evita promessas vazias e foca em clareza, metodo e consistencia visual para transformar informacao em criterio.
          </p>
        </div>
        <div className={styles.diffList}>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={styles.diffItem}>
                <Icon size={22} />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
};

export default Differentials;
