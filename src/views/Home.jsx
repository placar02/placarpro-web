'use client';

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Hero from '../components/home/Hero';
import HowItWorks from '../components/home/HowItWorks';
import Features from '../components/home/Features';
import Technology from '../components/home/Technology';
import Differentials from '../components/home/Differentials';
import FAQ from '../components/home/FAQ';
import FinalCTA from '../components/home/FinalCTA';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.page}>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Technology />
        <Differentials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
