import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Placar Pro. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;
