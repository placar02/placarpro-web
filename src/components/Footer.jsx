import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div>
          <strong>PlacarPro</strong>
          <p>Inteligencia esportiva baseada em dados, estatistica e IA.</p>
        </div>
        <nav>
          <a href="/#recursos">Recursos</a>
          <a href="/#tecnologia">Tecnologia</a>
          <Link href="/login">Entrar</Link>
        </nav>
        <span>&copy; {new Date().getFullYear()} PlacarPro. Todos os direitos reservados.</span>
      </div>
    </footer>
  );
};

export default Footer;
