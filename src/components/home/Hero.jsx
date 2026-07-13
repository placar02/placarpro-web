'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ArrowRight, Brain, CheckCircle2, Database, ShieldCheck, Sparkles, Target } from 'lucide-react';
import Button from '../Button';
import styles from '../../views/Home.module.css';

const analysisFactors = [
  'Forma recente das equipes nos ultimos jogos',
  'Media de gols, mando de campo e calendario',
  'Sinais de risco antes de sugerir entrada'
];

const Hero = () => {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.heroBackdrop} />
      <div className={`container ${styles.heroGrid}`}>
        <motion.div
          className={styles.heroCopy}
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.eyebrow}>
            <Sparkles size={15} />
            Plataforma de inteligencia esportiva 
          </div>
          <h1 className={styles.heroTitle}>
           Aposte com Inteligência, Não com Sorte
          </h1>
          <p className={styles.heroSubtitle}>
            O PlacarPro transforma dados de partidas, campeonatos e historico recente em leituras objetivas para apoiar decisoes com mais contexto.
          </p>
          <div className={styles.heroActions}>
            <Link href="/cadastro">
              <Button variant="primary">Explorar plataforma <ArrowRight size={18} /></Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary">Acessar minha conta</Button>
            </Link>
          </div>
          <div className={styles.trustStrip}>
            <span><Brain size={16} /> IA explicavel</span>
            <span><Database size={16} /> Dados atualizados</span>
            <span><ShieldCheck size={16} /> Ambiente seguro</span>
          </div>
        </motion.div>

        
      </div>
    </section>
  );
};

export default Hero;
