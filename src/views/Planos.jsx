'use client';

import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { Check, Copy, CreditCard, QrCode } from 'lucide-react';
import styles from './Planos.module.css';
import { AuthContext } from '../contexts/AuthContext';

const loadMercadoPagoSdk = () => new Promise((resolve, reject) => {
  if (window.MercadoPago) return resolve();

  const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
  if (existingScript) {
    existingScript.addEventListener('load', resolve, { once: true });
    existingScript.addEventListener('error', reject, { once: true });
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.async = true;
  script.onload = resolve;
  script.onerror = reject;
  document.body.appendChild(script);
});

const cleanDigits = (value) => String(value || '').replace(/\D/g, '');

const inferPaymentMethodId = (cardNumber) => {
  const digits = cleanDigits(cardNumber);
  if (/^4/.test(digits)) return 'visa';
  if (/^3[47]/.test(digits)) return 'amex';
  if (/^(5[1-5]|2[2-7]|5031)/.test(digits)) return 'master';
  if (/^(4011|4312|4389|4514|4573|5041|5066|5067|509|6277|6362|6363|650|6516|6550)/.test(digits)) return 'elo';
  return '';
};

const parseExpiration = (value) => {
  const digits = cleanDigits(value);
  const month = digits.slice(0, 2);
  const rawYear = digits.slice(2, 6);
  const year = rawYear.length === 2 ? `20${rawYear}` : rawYear;
  return { month, year };
};

const Planos = () => {
  const { api, user, setUser } = React.useContext(AuthContext);
  const [loadingCheckout, setLoadingCheckout] = React.useState(false);
  const [pixPayment, setPixPayment] = React.useState(null);
  const [lastPayment, setLastPayment] = React.useState(null);
  const [checkingPayment, setCheckingPayment] = React.useState(false);
  const [simulatingPayment, setSimulatingPayment] = React.useState(false);
  const [paymentMode, setPaymentMode] = React.useState('pix');
  const [showPaymentOptions, setShowPaymentOptions] = React.useState(false);
  const [allowTestApproval, setAllowTestApproval] = React.useState(false);
  const [cardReady, setCardReady] = React.useState(false);
  const [cardLoading, setCardLoading] = React.useState(false);
  const [cardError, setCardError] = React.useState('');
  const [cardFormKey, setCardFormKey] = React.useState(0);
  const [cardData, setCardData] = React.useState({
    cardholderName: '',
    cardholderEmail: '',
    cardNumber: '',
    expirationDate: '',
    securityCode: '',
    identificationType: 'CPF',
    identificationNumber: '',
  });
  const mercadoPagoRef = React.useRef(null);
  const cardSetupStartedRef = React.useRef(false);

  const resetCardForm = React.useCallback(() => {
    mercadoPagoRef.current = null;
    cardSetupStartedRef.current = false;
    setCardReady(false);
    setCardFormKey((current) => current + 1);
  }, []);

  const updateCardData = (field) => (event) => {
    setCardData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleAssinarPremium = async () => {
    setLoadingCheckout(true);

    try {
      const res = await api.post('/payments/checkout');
      setPixPayment(res.data);
      setLastPayment(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao processar checkout');
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleCopyPix = async () => {
    if (!pixPayment?.pix?.qrCode) return;

    try {
      await navigator.clipboard.writeText(pixPayment.pix.qrCode);
      alert('Codigo Pix copiado.');
    } catch (_err) {
      alert('Nao foi possivel copiar automaticamente. Selecione o codigo e copie manualmente.');
    }
  };

  const handleConfirmPix = async () => {
    if (!pixPayment?.externalId) return;

    setCheckingPayment(true);
    try {
      const res = await api.get(`/payments/session/${pixPayment.externalId}/confirm?payment_id=${pixPayment.paymentId}`);

      if (res.data.premium) {
        setUser((current) => current ? { ...current, plano: 'premium' } : current);
        setPixPayment(null);
        setShowPaymentOptions(false);
        alert('Pagamento aprovado via Pix. Seu plano Premium foi liberado.');
      } else {
        alert(`Pagamento ainda nao confirmado. Status: ${res.data.status}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Nao foi possivel confirmar o pagamento agora.');
    } finally {
      setCheckingPayment(false);
    }
  };

  const handleSimulateApproval = async () => {
    if (!lastPayment?.externalId) return;

    setSimulatingPayment(true);
    try {
      const res = await api.post(`/payments/session/${lastPayment.externalId}/simulate-approval`);

      if (res.data.premium) {
        setUser((current) => current ? { ...current, plano: 'premium' } : current);
        setPixPayment(null);
        setLastPayment(null);
        setShowPaymentOptions(false);
        alert('Pagamento aprovado em modo de teste. Premium liberado.');
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Nao foi possivel simular a aprovacao.');
    } finally {
      setSimulatingPayment(false);
    }
  };

  const handleConfirmLastPayment = async () => {
    if (!lastPayment?.externalId) return;

    setCheckingPayment(true);
    try {
      const paymentQuery = lastPayment.paymentId ? `?payment_id=${lastPayment.paymentId}` : '';
      const res = await api.get(`/payments/session/${lastPayment.externalId}/confirm${paymentQuery}`);

      setLastPayment((current) => current ? {
        ...current,
        status: res.data.status,
        premium: res.data.premium,
      } : current);

      if (res.data.premium) {
        setUser((current) => current ? { ...current, plano: 'premium' } : current);
        setPixPayment(null);
        setLastPayment(null);
        setShowPaymentOptions(false);
        alert('Pagamento aprovado. Seu plano Premium foi liberado.');
      } else {
        alert(`Pagamento ainda nao aprovado. Status: ${res.data.status}`);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Nao foi possivel confirmar o pagamento agora.');
    } finally {
      setCheckingPayment(false);
    }
  };

  React.useEffect(() => {
    api.get('/payments/config')
      .then((res) => {
        setAllowTestApproval(Boolean(res.data.allowTestApproval));
      })
      .catch(() => {
        setAllowTestApproval(false);
      });
  }, [api]);

  React.useEffect(() => {
    setCardData((current) => ({
      ...current,
      cardholderName: current.cardholderName || user?.nome || '',
      cardholderEmail: current.cardholderEmail || user?.email || '',
    }));
  }, [user?.email, user?.nome]);

  React.useEffect(() => {
    if (showPaymentOptions && paymentMode === 'card') return;

    mercadoPagoRef.current = null;
    cardSetupStartedRef.current = false;
    setCardReady(false);
  }, [paymentMode, showPaymentOptions]);

  React.useEffect(() => {
    if (
      !showPaymentOptions
      || paymentMode !== 'card'
      || cardReady
      || cardSetupStartedRef.current
      || user?.plano === 'premium'
    ) {
      return;
    }

    let cancelled = false;
    cardSetupStartedRef.current = true;
    setCardLoading(true);
    setCardError('');

    const setupCard = async () => {
      try {
        const configRes = await api.get('/payments/config');
        const publicKey = configRes.data.publicKey;

        if (!publicKey || publicKey.includes('coloque_')) {
          throw new Error('Configure MERCADOPAGO_PUBLIC_KEY no backend/.env para habilitar cartao.');
        }

        await loadMercadoPagoSdk();
        if (cancelled) return;

        mercadoPagoRef.current = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        setCardReady(true);
      } catch (err) {
        setCardError(err.message || 'Erro ao carregar Mercado Pago.');
        cardSetupStartedRef.current = false;
      } finally {
        setCardLoading(false);
      }
    };

    setupCard();

    return () => {
      cancelled = true;
      cardSetupStartedRef.current = false;
    };
  }, [api, cardReady, paymentMode, showPaymentOptions, user?.plano]);

  const handleCardSubmit = async (event) => {
    event.preventDefault();
    setCardLoading(true);
    setCardError('');

    try {
      const { month, year } = parseExpiration(cardData.expirationDate);
      const paymentMethodId = inferPaymentMethodId(cardData.cardNumber);

      if (!paymentMethodId) {
        throw new Error('Bandeira do cartao nao reconhecida. Confira o numero informado.');
      }

      if (!mercadoPagoRef.current?.createCardToken) {
        throw new Error('Mercado Pago nao carregou a tokenizacao do cartao. Atualize a pagina e tente novamente.');
      }

      const tokenResponse = await mercadoPagoRef.current.createCardToken({
        cardNumber: cleanDigits(cardData.cardNumber),
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: month,
        cardExpirationYear: year,
        securityCode: cleanDigits(cardData.securityCode),
        identificationType: cardData.identificationType,
        identificationNumber: cleanDigits(cardData.identificationNumber),
      });
      const token = tokenResponse?.id || tokenResponse?.token || tokenResponse;

      if (!token || typeof token !== 'string') {
        throw new Error('Nao foi possivel gerar o token do cartao.');
      }

      const res = await api.post('/payments/card', {
        token,
        paymentMethodId,
        installments: 1,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber,
        cardholderEmail: cardData.cardholderEmail,
      });
      setLastPayment(res.data);

      if (res.data.premium) {
        setUser((current) => current ? { ...current, plano: 'premium' } : current);
        setShowPaymentOptions(false);
        alert('Pagamento aprovado no cartao. Seu plano Premium foi liberado.');
      } else {
        const detail = res.data.statusDetail ? ` (${res.data.statusDetail})` : '';
        alert(`Pagamento criado. Status: ${res.data.status}${detail}`);
      }
    } catch (err) {
      const apiError = err.response?.data;
      const causes = Array.isArray(apiError?.mercadoPago?.cause)
        ? apiError.mercadoPago.cause.join(' | ')
        : '';
      const invalidToken = JSON.stringify(apiError || {}).includes('Invalid card_token_id');
      setCardError([
        apiError?.error || err.message || 'Erro ao processar pagamento no cartao.',
        invalidToken ? 'Token do cartao expirou ou ja foi usado. Preencha os dados novamente e tente outra vez.' : causes,
      ].filter(Boolean).join(' - '));
      if (invalidToken) resetCardForm();
    } finally {
      setCardLoading(false);
    }
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutId = params.get('checkout_id');
    const externalId = params.get('external_id');
    const paymentId = params.get('payment_id') || params.get('collection_id');
    const status = params.get('status') || params.get('collection_status');

    if (!checkoutId && !externalId) return;

    const confirmUrl = checkoutId
      ? `/payments/checkout/${checkoutId}/confirm`
      : `/payments/session/${externalId}/confirm`;
    const confirmParams = new URLSearchParams();

    if (paymentId) confirmParams.set('payment_id', paymentId);
    if (status) confirmParams.set('status', status);

    api.get(`${confirmUrl}${confirmParams.toString() ? `?${confirmParams}` : ''}`).then((res) => {
      if (res.data.premium) {
        setUser((current) => current ? { ...current, plano: 'premium' } : current);
        alert('Pagamento aprovado via Mercado Pago. Seu plano Premium foi liberado.');
      } else {
        alert(`Pagamento ainda nao confirmado. Status: ${res.data.status}`);
      }
      window.history.replaceState({}, document.title, '/planos');
    }).catch(() => {
      alert('Nao foi possivel confirmar o pagamento agora.');
      window.history.replaceState({}, document.title, '/planos');
    });
  }, [api, setUser]);

  return (
    <DashboardLayout>
      <div className={styles.header}>
        <h1 className={styles.title}>Escolha seu <span className="text-primary">plano</span></h1>
        <p className={styles.subtitle}>Acesso completo a nossa Inteligencia Artificial para alavancar sua banca.</p>
      </div>

      <div className={styles.plansGrid}>
        <Card className={styles.planCard}>
          <div className={styles.planHeader}>
            <div className={styles.planIcon}></div>
            <h3 className={styles.planName}>Basico</h3>
          </div>
          <div className={styles.planPrice}>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>0,00</span>
            <span className={styles.period}>/mes</span>
          </div>
          <ul className={styles.featuresList}>
            <li><Check size={16} className="text-primary" /> 1 aposta diaria da IA</li>
            <li><Check size={16} className="text-primary" /> Odd limitada a 1.50</li>
            <li><Check size={16} className="text-primary" /> Dashboard com banca personalizada</li>
            <li className={styles.disabledFeature}><Check size={16} /> Multiplas entradas por jogo</li>
          </ul>
          <Button variant="outline" className={styles.planBtn} style={{ border: '1px solid #EAEAEC' }}>
            {user?.plano === 'premium' ? 'Disponivel' : 'Plano Atual'}
          </Button>
        </Card>

        <Card className={`${styles.planCard} ${styles.premiumCard}`}>
          <div className={styles.popularBadge}>Mais popular</div>
          <div className={styles.planHeader}>
            <div className={styles.planIconPremium}></div>
            <h3 className={styles.planName}>Premium</h3>
          </div>
          <div className={styles.planPrice}>
            <div className={styles.pricePromo}>
              <span>De R$ 80,00</span>
              <strong>por</strong>
            </div>
            <span className={styles.currency}>R$</span>
            <span className={styles.amount}>49,90</span>
            <span className={styles.period}>/mes</span>
          </div>
          <ul className={styles.featuresList}>
            <li><Check size={16} className="text-primary" /> Mais analises da IA</li>
            <li><Check size={16} className="text-primary" /> Varias entradas com odds diferentes</li>
            <li><Check size={16} className="text-primary" /> Sinais ao vivo</li>
            <li><Check size={16} className="text-primary" /> Gestao de banca personalizada</li>
            <li><Check size={16} className="text-primary" /> Suporte prioritario</li>
          </ul>
          <Button
            variant="primary"
            className={styles.planBtn}
            onClick={() => {
              setShowPaymentOptions(true);
              setPaymentMode('pix');
            }}
            disabled={user?.plano === 'premium'}
          >
            {user?.plano === 'premium' ? 'Premium Ativo' : 'Escolher forma de pagamento'}
          </Button>
        </Card>
      </div>

      {user?.plano !== 'premium' && showPaymentOptions && (
        <Card className={styles.paymentCard}>
          <div className={styles.paymentTabs}>
            <button
              type="button"
              className={`${styles.paymentTab} ${paymentMode === 'pix' ? styles.activeTab : ''}`}
              onClick={() => setPaymentMode('pix')}
            >
              <QrCode size={18} /> Pix
            </button>
            <button
              type="button"
              className={`${styles.paymentTab} ${paymentMode === 'card' ? styles.activeTab : ''}`}
              onClick={() => setPaymentMode('card')}
            >
              <CreditCard size={18} /> Cartao
            </button>
          </div>

          {paymentMode === 'pix' && (
            <Button
              variant="primary"
              className={styles.planBtn}
              onClick={handleAssinarPremium}
              disabled={loadingCheckout}
            >
              {loadingCheckout ? 'Gerando Pix...' : 'Gerar Pix'}
            </Button>
          )}

          {paymentMode === 'card' && (
            <form id="card-payment-form" className={styles.cardForm} key={cardFormKey} onSubmit={handleCardSubmit}>
              <label className={styles.cardLabel} htmlFor="cardholderName">
                <span>Nome impresso no cartao</span>
                <input id="cardholderName" className={styles.cardInput} type="text" value={cardData.cardholderName} onChange={updateCardData('cardholderName')} placeholder="Nome do titular" autoComplete="cc-name" />
              </label>
              <label className={styles.cardLabel} htmlFor="cardholderEmail">
                <span>Email</span>
                <input id="cardholderEmail" className={styles.cardInput} type="email" value={cardData.cardholderEmail} onChange={updateCardData('cardholderEmail')} placeholder="email@exemplo.com" autoComplete="email" />
              </label>
              <label className={styles.cardLabel} htmlFor="cardNumber">
                <span>Numero do cartao</span>
                <input
                  id="cardNumber"
                  className={styles.cardInput}
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  value={cardData.cardNumber}
                  onChange={(event) => {
                    const digits = cleanDigits(event.target.value).slice(0, 19);
                    setCardData((current) => ({ ...current, cardNumber: digits.replace(/(\d{4})(?=\d)/g, '$1 ') }));
                  }}
                  placeholder="5031 4332 1540 6351"
                />
              </label>
              <div className={styles.cardRow}>
                <label className={styles.cardLabel} htmlFor="expirationDate">
                  <span>Validade</span>
                  <input
                    id="expirationDate"
                    className={styles.cardInput}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    value={cardData.expirationDate}
                    onChange={(event) => {
                      const digits = cleanDigits(event.target.value).slice(0, 6);
                      const value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
                      setCardData((current) => ({ ...current, expirationDate: value }));
                    }}
                    placeholder="11/30"
                  />
                </label>
                <label className={styles.cardLabel} htmlFor="securityCode">
                  <span>CVV</span>
                  <input
                    id="securityCode"
                    className={styles.cardInput}
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={cardData.securityCode}
                    onChange={(event) => setCardData((current) => ({ ...current, securityCode: cleanDigits(event.target.value).slice(0, 4) }))}
                    placeholder="123"
                  />
                </label>
              </div>
              <label className={styles.cardLabel} htmlFor="paymentMethod">
                <span>Banco emissor</span>
                <input id="paymentMethod" className={styles.cardInput} type="text" value={inferPaymentMethodId(cardData.cardNumber) || 'Informe o cartao primeiro'} readOnly />
              </label>
              <label className={styles.cardLabel} htmlFor="installments">
                <span>Parcelas</span>
                <input id="installments" className={styles.cardInput} type="text" value="1 parcela de R$ 49,90" readOnly />
              </label>
              <div className={styles.cardRow}>
                <label className={styles.cardLabel} htmlFor="identificationType">
                  <span>Documento</span>
                  <select id="identificationType" className={styles.cardInput} value={cardData.identificationType} onChange={updateCardData('identificationType')}>
                    <option value="CPF">CPF</option>
                  </select>
                </label>
                <label className={styles.cardLabel} htmlFor="identificationNumber">
                  <span>Numero do documento</span>
                  <input id="identificationNumber" className={styles.cardInput} type="text" value={cardData.identificationNumber} onChange={(event) => setCardData((current) => ({ ...current, identificationNumber: cleanDigits(event.target.value).slice(0, 14) }))} placeholder="12345678909" inputMode="numeric" />
                </label>
              </div>
              {cardError && <p className={styles.paymentError}>{cardError}</p>}
              <Button variant="primary" className={styles.planBtn} type="submit" disabled={cardLoading || !cardReady}>
                {cardLoading ? 'Processando...' : 'Pagar com cartao'}
              </Button>
            </form>
          )}
        </Card>
      )}

      {pixPayment?.pix && (
        <Card className={styles.pixCard}>
          <div className={styles.pixHeader}>
            <QrCode size={22} className="text-primary" />
            <div>
              <h2>Pagamento Pix</h2>
              <p>Escaneie o QR Code ou use o copia e cola para liberar o Premium.</p>
            </div>
          </div>

          {pixPayment.pix.qrCodeBase64 && (
            <img
              className={styles.pixQr}
              src={`data:image/png;base64,${pixPayment.pix.qrCodeBase64}`}
              alt="QR Code Pix"
            />
          )}

          <textarea
            className={styles.pixCode}
            value={pixPayment.pix.qrCode || ''}
            readOnly
            aria-label="Codigo Pix copia e cola"
          />

          <div className={styles.pixActions}>
            <Button variant="outline" type="button" onClick={handleCopyPix}>
              <Copy size={18} /> Copiar Pix
            </Button>
            <Button variant="primary" type="button" onClick={handleConfirmPix} disabled={checkingPayment}>
              {checkingPayment ? 'Verificando...' : 'Ja paguei'}
            </Button>
          </div>

          {allowTestApproval && lastPayment?.externalId && (
            <Button
              variant="outline"
              type="button"
              className={styles.testApprovalBtn}
              onClick={handleSimulateApproval}
              disabled={simulatingPayment}
            >
              {simulatingPayment ? 'Simulando...' : 'Simular aprovacao'}
            </Button>
          )}

          {pixPayment.pix.ticketUrl && (
            <a className={styles.pixLink} href={pixPayment.pix.ticketUrl} target="_blank" rel="noreferrer">
              Abrir instrucoes do Mercado Pago
            </a>
          )}
        </Card>
      )}

      {lastPayment?.externalId && !pixPayment?.pix && user?.plano !== 'premium' && (
        <Card className={styles.testApprovalCard}>
          <p>
            {lastPayment?.status
              ? `Pagamento aguardando confirmacao. Status: ${lastPayment.status}${lastPayment.statusDetail ? ` (${lastPayment.statusDetail})` : ''}.`
              : 'Pagamento aguardando confirmacao.'}
          </p>
          <Button
            variant="primary"
            type="button"
            className={styles.testApprovalBtn}
            onClick={handleConfirmLastPayment}
            disabled={checkingPayment}
          >
            {checkingPayment ? 'Verificando...' : 'Verificar pagamento'}
          </Button>
          {allowTestApproval && (
            <>
              <p>Modo de teste ativo para pagamentos.</p>
              <Button
                variant="outline"
                type="button"
                className={styles.testApprovalBtn}
                onClick={handleSimulateApproval}
                disabled={simulatingPayment}
              >
                {simulatingPayment ? 'Simulando...' : 'Simular aprovacao'}
              </Button>
            </>
          )}
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Planos;
