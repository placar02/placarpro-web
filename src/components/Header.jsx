'use client';

import React from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import Button from './Button';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerContainer}`}>
        <Link href="/" className={styles.logo}>
          <img src="/placarpro-logo.png" alt="PlacarPro" width="70" height="70"/>
          {/* <span>PlacarPro</span> */}
        </Link>

        <nav className={styles.nav}>
          <a href="/#como-funciona" className={styles.navLink}>Como funciona</a>
          <a href="/#recursos" className={styles.navLink}>Recursos</a>
          <a href="/#tecnologia" className={styles.navLink}>Tecnologia</a>
        </nav>

        <div className={styles.actions}>
          <Link href="/login" className={styles.loginLink}>Entrar</Link>
          <Link href="/cadastro">
            <Button variant="primary">Comecar</Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
