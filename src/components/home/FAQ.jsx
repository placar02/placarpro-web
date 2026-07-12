'use client';

import React from 'react';
import MotionSection from './MotionSection';
import styles from '../../views/Home.module.css';

const questions = [
  {
    question: 'O PlacarPro promete resultados?',
    answer: 'Nao. A plataforma entrega analises, indicadores e explicacoes para apoiar tomada de decisao. O foco e inteligencia esportiva, nao promessa financeira.'
  },
  {
    question: 'Como a IA participa da analise?',
    answer: 'A IA interpreta sinais estatisticos, organiza os fatores mais relevantes e gera explicacoes objetivas sobre cada leitura.'
  },
  {
    question: 'Posso analisar campeonatos especificos?',
    answer: 'Sim. Os filtros ajudam a consultar jogos, ligas e recortes de desempenho para comparar contextos com mais precisao.'
  },
  {
    question: 'Os dados sao atualizados automaticamente?',
    answer: 'A plataforma foi projetada para sincronizar informacoes esportivas de forma recorrente, mantendo o painel pronto para consulta.'
  }
];

const FAQ = () => {
  return (
    <MotionSection id="faq" className={styles.section}>
      <div className={`container ${styles.faqWrap}`}>
        <div className={styles.sectionHeader}>
          <span className={styles.kicker}>FAQ</span>
          <h2>Perguntas frequentes.</h2>
          <p>Respostas diretas sobre tecnologia, uso e posicionamento da plataforma.</p>
        </div>
        <div className={styles.faqList}>
          {questions.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </MotionSection>
  );
};

export default FAQ;
