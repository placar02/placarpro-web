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
  const cardFormRef = React.useRef(null);
  const cardSetupStartedRef = React.useRef(false);

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

  React.useEffect(() => {
    api.get('/payments/config')
      .then((res) => setAllowTestApproval(Boolean(res.data.allowTestApproval)))
      .catch(() => setAllowTestApproval(false));
  }, [api]);

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

        const mp = new window.MercadoPago(publicKey, { locale: 'pt-BR' });
        cardFormRef.current = mp.cardForm({
          amount: String(configRes.data.amount || 49.9),
          iframe: true,
          form: {
            id: 'card-payment-form',
            cardholderName: { id: 'cardholderName', placeholder: 'Nome impresso no cartao' },
            cardholderEmail: { id: 'cardholderEmail', placeholder: 'email@exemplo.com' },
            cardNumber: { id: 'cardNumber', placeholder: 'Numero do cartao' },
            expirationDate: { id: 'expirationDate', placeholder: 'MM/AA' },
            securityCode: { id: 'securityCode', placeholder: 'CVV' },
            installments: { id: 'installments', placeholder: 'Parcelas' },
            identificationType: { id: 'identificationType', placeholder: 'Tipo de documento' },
            identificationNumber: { id: 'identificationNumber', placeholder: 'Numero do documento' },
            issuer: { id: 'issuer', placeholder: 'Banco emissor' },
          },
          callbacks: {
            onFormMounted: (error) => {
              if (error) setCardError('Nao foi possivel carregar o formulario de cartao.');
            },
            onSubmit: async (event) => {
              event.preventDefault();
              setCardLoading(true);
              setCardError('');

              try {
                const data = cardFormRef.current.getCardFormData();
                const res = await api.post('/payments/card', {
                  token: data.token,
                  issuerId: data.issuerId,
                  paymentMethodId: data.paymentMethodId,
                  installments: Number(data.installments),
                  identificationType: data.identificationType,
                  identificationNumber: data.identificationNumber,
                  cardholderEmail: data.cardholderEmail,
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
                setCardError(err.response?.data?.error || 'Erro ao processar pagamento no cartao.');
              } finally {
                setCardLoading(false);
              }
            },
            onFetching: () => {
              setCardLoading(true);
              return () => setCardLoading(false);
            },
          },
        });

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
    };
  }, [api, cardReady, paymentMode, setUser, showPaymentOptions, user?.plano]);

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
            <form id="card-payment-form" className={styles.cardForm}>
              <input id="cardholderName" className={styles.cardInput} type="text" />
              <input id="cardholderEmail" className={styles.cardInput} type="email" defaultValue={user?.email || ''} />
              <div id="cardNumber" className={styles.cardField}></div>
              <div className={styles.cardRow}>
                <div id="expirationDate" className={styles.cardField}></div>
                <div id="securityCode" className={styles.cardField}></div>
              </div>
              <select id="issuer" className={styles.cardInput}></select>
              <select id="installments" className={styles.cardInput}></select>
              <div className={styles.cardRow}>
                <select id="identificationType" className={styles.cardInput}></select>
                <input id="identificationNumber" className={styles.cardInput} type="text" placeholder="CPF" />
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

      {allowTestApproval && lastPayment?.externalId && !pixPayment?.pix && user?.plano !== 'premium' && (
        <Card className={styles.testApprovalCard}>
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
        </Card>
      )}
    </DashboardLayout>
  );
};

export default Planos;
