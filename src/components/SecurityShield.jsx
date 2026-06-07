'use client';

import { useEffect, useState } from 'react';

const SecurityShield = () => {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const prevent = (event) => event.preventDefault();
    const onKeyDown = (event) => {
      const key = String(event.key || '').toLowerCase();
      const isPrint = key === 'printscreen';
      const isSave = (event.ctrlKey || event.metaKey) && ['s', 'p', 'u'].includes(key);
      const isDevTools = key === 'f12' || ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'j', 'c'].includes(key));

      if (isPrint || isSave || isDevTools) {
        event.preventDefault();
        setBlocked(true);
        setTimeout(() => setBlocked(false), 1800);
      }
    };

    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('dragstart', prevent);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('dragstart', prevent);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  if (!blocked) return null;

  return (
    <div className="securityOverlay" role="status">
      Acao bloqueada por seguranca.
    </div>
  );
};

export default SecurityShield;
