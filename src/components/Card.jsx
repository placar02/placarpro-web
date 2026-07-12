'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import styles from './Card.module.css';

const Card = ({ children, className = '', animated = false, ...props }) => {
  const reduceMotion = useReducedMotion();
  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={`${styles.card} ${className}`}
      initial={animated && !reduceMotion ? { opacity: 0, y: 14, scale: 0.99 } : undefined}
      whileInView={animated && !reduceMotion ? { opacity: 1, y: 0, scale: 1 } : undefined}
      whileHover={animated && !reduceMotion ? { y: -4 } : undefined}
      viewport={animated ? { once: true, amount: 0.2 } : undefined}
      transition={animated ? { duration: 0.42, ease: [0.22, 1, 0.36, 1] } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
};

export default Card;
