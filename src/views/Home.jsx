'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, Target, UserPlus, Cpu, BarChart3, Star } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import Card from '../components/Card';
import styles from './Home.module.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { day: '01', value: 15 },
  { day: '04', value: 30 },
  { day: '07', value: 65 },
  { day: '10', value: 110 },
  { day: '13', value: 145 },
  { day: '16', value: 190 },
  { day: '19', value: 230 },
  { day: '22', value: 290 },
  { day: '23', value: 380 },
  { day: '24', value: 580 },
  { day: '25', value: 880 },
  { day: '25', value: 1080 }
];

const Home = () => {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    setChartReady(true);
  }, []);

  return (
    <div className={styles.page}>
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className={`section-padding ${styles.hero} green-glow-bg`}>
          <div className="container text-center">
           
            <h1 className={styles.heroTitle}>
              Transforme <span className="text-primary">R$15</span><br/>
              em uma banca <span className="text-primary">lucrativa</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Nossa IA analisa milhares de dados e gera apostas diárias com estratégia de alavancagem. 
              25 dias para multiplicar sua banca.
            </p>
            
            <div className={`flex justify-center ${styles.heroActions}`}>
              <Link href="/cadastro"><Button variant="primary">Comecar agora <ArrowRight size={18}/></Button></Link>
              <Link href="/login"><Button variant="secondary">Ja tenho conta</Button></Link>
            </div>

            <div className={`flex justify-center ${styles.stats}`}>
              <div className={styles.statItem}>
                <div className={styles.statIcon}><Target size={24} className="text-primary"/></div>
                <div className={styles.statValue}>78%</div>
                <div className={styles.statLabel}>Taxa de acerto</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}><TrendingUp size={24} className="text-primary"/></div>
                <div className={styles.statValue}>12k+</div>
                <div className={styles.statLabel}>Apostas geradas</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statIcon}><Users size={24} className="text-primary"/></div>
                <div className={styles.statValue}>3.2k</div>
                <div className={styles.statLabel}>Usuários ativos</div>
              </div>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section id="como-funciona" className={`section-padding ${styles.howItWorks}`}>
          <div className="container text-center">
            <h2 className={styles.sectionTitle}>Como <span className="text-primary">funciona</span></h2>
            <p className={styles.sectionSubtitle}>3 passos simples para começar a alavancar sua banca.</p>
            
            <div className={styles.stepsGrid}>
              <Card className={styles.stepCard}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepIconWrapper}><UserPlus size={32} className="text-primary"/></div>
                <h3 className={styles.stepTitle}>Crie sua conta</h3>
                <p className={styles.stepDesc}>Cadastre-se e escolha seu plano. Em minutos você já terá acesso.</p>
              </Card>
              <Card className={styles.stepCard}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepIconWrapper}><Cpu size={32} className="text-primary"/></div>
                <h3 className={styles.stepTitle}>IA gera apostas</h3>
                <p className={styles.stepDesc}>Todos os dias nossa IA analisa jogos e gera a melhor aposta para alavancar sua banca.</p>
              </Card>
              <Card className={styles.stepCard}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepIconWrapper}><BarChart3 size={32} className="text-primary"/></div>
                <h3 className={styles.stepTitle}>Acompanhe o crescimento</h3>
                <p className={styles.stepDesc}>Acompanhe a evolução da sua banca ao longo de 25 dias com gráficos e relatórios.</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Evolução da Banca Section */}
        <section id="resultados" className={`section-padding bg-primary ${styles.evolution}`}>
          <div className="container">
            <h2 className={`${styles.sectionTitle} ${styles.textWhite}`}>Evolução da <strong>banca</strong></h2>
            <p className={`${styles.sectionSubtitle} ${styles.textWhite}`}>Simulação de alavancagem em 25 dias — de R$15 para mais de R$1080</p>
            
            <div className={styles.chartWrapper}>
              <div className={styles.chartHeader}>
                <div>
                  <span className={styles.chartLabel}>Banca inicial</span>
                  <div className={styles.chartValue}>R$ 15,00</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className={styles.chartLabel}>Banca final</span>
                  <div className={`${styles.chartValue} text-primary`}>R$ 1080,00</div>
                </div>
              </div>
              <div className={styles.chartContainer}>
                {chartReady ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} dx={-10} />
                      <Tooltip
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        formatter={(value) => [`R$ ${value},00`, 'Banca']}
                      />
                      <Line type="monotone" dataKey="value" stroke="#00E676" strokeWidth={4} dot={{r: 4, fill: '#00E676', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos Section */}
        <section className={`section-padding ${styles.testimonials}`}>
          <div className="container">
            <h2 className={styles.sectionTitle}>O que nossos <span className="text-primary">usuários</span> dizem</h2>
            
            <div className={styles.testimonialsGrid}>
              {[
                { name: 'Lucas M.', text: '"Comecei com R$15 e em 25 dias já estava com R$1080. A IA acerta demais!"' },
                { name: 'Ana C.', text: '"Nunca pensei que apostas pudessem ser tão organizadas. O sistema é incrível."' },
                { name: 'Pedro S.', text: '"A estratégia de alavancagem mudou minha visão sobre apostas. Muito profissional."' },
                { name: 'Mariana R.', text: '"Vale há 3 meses e já recuperei o investimento várias vezes. Recomendo!"' }
              ].map((testimonial, idx) => (
                <Card key={idx} className={styles.testimonialCard}>
                  <div className={styles.stars}>
                    {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="#00E676" color="#00E676"/>)}
                  </div>
                  <p className={styles.testimonialText}>{testimonial.text}</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>{testimonial.name.substring(0,2).toUpperCase()}</div>
                    <span className={styles.authorName}>{testimonial.name}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
