'use client';

import React, { useEffect, useState, useContext } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import { LoadingState, PageHeader, Progress, StatCard } from '../components/ui';
import { TrendingUp, DollarSign, Target, Activity, Wallet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import styles from './Dashboard.module.css';
import { AuthContext } from '../contexts/AuthContext';

const currency = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

const getRealOdd = (entry) => {
  const odd = Number(entry?.odd);
  return Number.isFinite(odd) && odd > 1 ? odd : null;
};

const getEntryKey = (entry, index = null) => {
  const parts = [entry?.eventId, entry?.market, entry?.recommendation].filter(Boolean);
  if (parts.length >= 2) return parts.map(String).join('::');
  return `${entry?.eventId || 'entry'}::${entry?.market || 'market'}::${index ?? 'unknown'}`;
};

const formatMatchDate = (timestamp) => {
  if (!timestamp) return null;

  return new Date(Number(timestamp) * 1000).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getMatchMeta = (entry) => {
  const statusType = String(entry.status?.type || '').toLowerCase();
  const isLive = ['inprogress', 'live'].includes(statusType);
  const dateText = formatMatchDate(entry.startTimestamp);
  const scoreHome = entry.score?.home;
  const scoreAway = entry.score?.away;
  const hasScore = scoreHome !== null && scoreHome !== undefined && scoreAway !== null && scoreAway !== undefined;

  if (isLive) {
    return [
      'Ao vivo',
      entry.liveMinute ? `${entry.liveMinute}'` : entry.status?.description,
      hasScore ? `${scoreHome} x ${scoreAway}` : null,
    ].filter(Boolean).join(' - ');
  }

  return dateText || entry.status?.description || 'Data a confirmar';
};

const asList = (value) => Array.isArray(value) ? value.filter(Boolean) : [];

const hasAdvancedAnalysis = (entry) => {
  const analysis = entry.advancedAnalysis || {};
  return Boolean(
    asList(analysis.keyFactors).length ||
    asList(analysis.confidenceDrivers).length ||
    asList(analysis.dataSupport).length ||
    asList(analysis.warningSigns).length ||
    asList(analysis.avoidMarkets).length ||
    analysis.playerAnalysis ||
    analysis.refereeAnalysis ||
    analysis.marketBreakdown ||
    analysis.riskAnalysis ||
    entry.fullRationale
  );
};

const renderBulletList = (items) => {
  const cleanItems = asList(items);
  if (!cleanItems.length) return null;

  return (
    <ul className={styles.analysisList}>
      {cleanItems.slice(0, 5).map((item, index) => (
        <li key={`${String(item)}-${index}`}>{typeof item === 'string' ? item : item.reason || item.market || JSON.stringify(item)}</li>
      ))}
    </ul>
  );
};

const normalizeText = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

const isUnavailableText = (value) => {
  const text = normalizeText(typeof value === 'object' ? JSON.stringify(value) : value);
  return [
    'sem dados',
    'indisponivel',
    'nao identificado',
    'nao foi possivel',
    'nao e possivel',
    'bloqueado',
    'premium',
    'falta de dados',
    'dados ausentes',
  ].some((pattern) => text.includes(pattern));
};

const renderTextMap = (data, options = {}) => {
  if (!data || typeof data !== 'object') return null;

  return Object.entries(data)
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0))
    .filter(([key]) => !asList(options.hiddenKeys).includes(normalizeText(key)))
    .slice(0, 6)
    .map(([key, value]) => (
      <div className={styles.analysisFact} key={key}>
        <span>{key}</span>
        <strong>{isUnavailableText(value) ? 'sem dados' : Array.isArray(value) ? value.join(', ') : typeof value === 'object' ? JSON.stringify(value) : String(value)}</strong>
      </div>
    ));
};

const AnalysisDetails = ({ entry }) => {
  if (!hasAdvancedAnalysis(entry)) return null;

  const analysis = entry.advancedAnalysis || {};
  const playerMain = asList(analysis.playerAnalysis?.mainPlayers);
  const unsupportedPlayerMarkets = asList(analysis.playerAnalysis?.unsupportedPlayerMarkets);
  const marketFacts = renderTextMap(analysis.marketBreakdown);
  const refereeFacts = analysis.refereeAnalysis
    ? renderTextMap(analysis.refereeAnalysis, {
      hiddenKeys: ['available'],
    })
    : null;

  return (
    <details className={styles.analysisDetails}>
      <summary>Ver analise completa</summary>
      <div className={styles.analysisDetailsBody}>
        {entry.fullRationale ? (
          <section className={styles.analysisSection}>
            <h4>Leitura da entrada</h4>
            <p>{entry.fullRationale}</p>
          </section>
        ) : null}

        {asList(analysis.keyFactors).length ? (
          <section className={styles.analysisSection}>
            <h4>Fatores principais</h4>
            {renderBulletList(analysis.keyFactors)}
          </section>
        ) : null}

        {marketFacts?.length ? (
          <section className={styles.analysisSection}>
            <h4>Mercados</h4>
            <div className={styles.analysisFactsGrid}>{marketFacts}</div>
          </section>
        ) : null}

        {playerMain.length || unsupportedPlayerMarkets.length ? (
          <section className={styles.analysisSection}>
            <h4>Jogadores</h4>
            {playerMain.length ? (
              <div className={styles.playerGrid}>
                {playerMain.slice(0, 4).map((player, index) => (
                  <div className={styles.playerInsight} key={`${player.player || index}-${index}`}>
                    <strong>{player.player || 'Jogador'}</strong>
                    <span>{[player.team, player.role].filter(Boolean).join(' - ')}</span>
                    <p>{player.whyRelevant || 'Relevancia indicada pela IA.'}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {unsupportedPlayerMarkets.length ? (
              <div className={styles.analysisMuted}>
                Evitar sem dados: {unsupportedPlayerMarkets.slice(0, 3).join(', ')}
              </div>
            ) : null}
          </section>
        ) : null}

        {refereeFacts?.length ? (
          <section className={styles.analysisSection}>
            <h4>Arbitro e cartoes</h4>
            <div className={styles.analysisFactsGrid}>{refereeFacts}</div>
          </section>
        ) : null}

        {asList(analysis.dataSupport).length || asList(analysis.warningSigns).length || analysis.riskAnalysis ? (
          <section className={styles.analysisSection}>
            <h4>Suporte e riscos</h4>
            {analysis.riskLevel ? <span className={styles.riskPill}>Risco {analysis.riskLevel}</span> : null}
            {renderBulletList(analysis.dataSupport)}
            {renderBulletList(analysis.warningSigns)}
            {analysis.riskAnalysis ? <p>{analysis.riskAnalysis}</p> : null}
          </section>
        ) : null}

        {asList(analysis.confidenceDrivers).length || asList(analysis.avoidMarkets).length ? (
          <section className={styles.analysisSection}>
            <h4>Confianca</h4>
            {renderBulletList(analysis.confidenceDrivers)}
            {renderBulletList(analysis.avoidMarkets)}
          </section>
        ) : null}
      </div>
    </details>
  );
};

const Dashboard = () => {
  const { api, setUser } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [bankrollValue, setBankrollValue] = useState('');
  const [savingBankroll, setSavingBankroll] = useState(false);
  const [entryStakes, setEntryStakes] = useState({});
  const [placingEntry, setPlacingEntry] = useState(null);
  const [resolvingBet, setResolvingBet] = useState(null);
  const [placedEntries, setPlacedEntries] = useState({});
  const matchMode = 'prelive';

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard', { params: { matchMode } });
      setData(res.data);
      setBankrollValue(String(Number(res.data.banca_inicial || 0).toFixed(2)));
      setDashboardError('');
    } catch (err) {
      console.error(err);
      setDashboardError(err.response?.data?.error || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [matchMode]);

  useEffect(() => {
    if (!data?.aposta_do_dia_atualizando) return undefined;
    const timer = setTimeout(fetchDashboard, 15000);
    return () => clearTimeout(timer);
  }, [data?.aposta_do_dia_atualizando, data?.aposta_do_dia_atualizada_em]);

  useEffect(() => {
    setChartReady(true);
  }, []);

  const handleSaveBankroll = async (event) => {
    event.preventDefault();
    setSavingBankroll(true);

    try {
      const valor = Number(String(bankrollValue).replace(',', '.'));
      const res = await api.put('/bankroll', { valor });
      setUser((current) => current ? { ...current, saldo: res.data.saldo, banca_inicial: res.data.banca_inicial } : current);
      await fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao atualizar banca');
    } finally {
      setSavingBankroll(false);
    }
  };

  useEffect(() => {
    if (!data?.apostas_recentes?.length) return;

    const pendingEntries = data.apostas_recentes
      .filter((aposta) => aposta.status === 'Pendente' && (aposta.eventId || aposta.market || aposta.recommendation))
      .reduce((acc, aposta) => {
        acc[getEntryKey({
          eventId: aposta.eventId,
          market: aposta.market,
          recommendation: aposta.recommendation,
        })] = true;
        return acc;
      }, {});

    setPlacedEntries((current) => ({ ...current, ...pendingEntries }));
  }, [data?.apostas_recentes]);

  const handlePlaceEntry = async (event, entry, index, gameName, odd) => {
    event.preventDefault();
    if (!odd) {
      alert('Odd real indisponivel para esta entrada.');
      return;
    }

    const key = getEntryKey(entry, index);
    const valorApostado = Number(String(entryStakes[key] || data.stake_sugerida || 0).replace(',', '.'));
    setPlacingEntry(key);

    try {
      const res = await api.post('/bets/place', { entry, odd, gameName, valorApostado });
      setEntryStakes((current) => ({ ...current, [key]: '' }));
      setPlacedEntries((current) => ({ ...current, [key]: true }));
      if (res.data?.bet) {
        setData((current) => current ? {
          ...current,
          saldo: Number(res.data.novoSaldo ?? current.saldo),
          lucro: Number(res.data.novoSaldo ?? current.saldo) - Number(current.banca_inicial || 0),
          stake_sugerida: Number(res.data.stake_sugerida ?? current.stake_sugerida),
          history: res.data.novoSaldo !== undefined
            ? [...(current.history || []), { day: String((current.history || []).length + 1).padStart(2, '0'), value: Number(res.data.novoSaldo) }]
            : current.history,
          apostas_recentes: [res.data.bet, ...(current.apostas_recentes || [])].slice(0, 10),
        } : current);
        setUser((current) => current ? { ...current, saldo: Number(res.data.novoSaldo ?? current.saldo) } : current);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao registrar entrada');
    } finally {
      setPlacingEntry(null);
    }
  };

  const handleResolveBet = async (aposta, resultado) => {
    setResolvingBet(`${aposta.id}-${resultado}`);

    try {
      const res = await api.post('/bets/resolve', { betId: aposta.id, resultado });
      const resolvedBet = res.data?.bet;

      setData((current) => current ? {
        ...current,
        saldo: Number(res.data.novoSaldo ?? current.saldo),
        lucro: Number(res.data.novoSaldo ?? current.saldo) - Number(current.banca_inicial || 0),
        stake_sugerida: Number(res.data.stake_sugerida ?? current.stake_sugerida),
        assertividade: resolvedBet ? (() => {
          const bets = (current.apostas_recentes || []).map((item) => item.id === resolvedBet.id ? resolvedBet : item);
          const resolved = bets.filter((item) => ['Ganha', 'Perdida'].includes(item.status));
          if (resolved.length === 0) return current.assertividade;
          const greens = resolved.filter((item) => item.status === 'Ganha').length;
          return Math.round((greens / resolved.length) * 100);
        })() : current.assertividade,
        history: res.data.novoSaldo !== undefined
          ? [...(current.history || []), { day: String((current.history || []).length + 1).padStart(2, '0'), value: Number(res.data.novoSaldo) }]
          : current.history,
        apostas_recentes: resolvedBet
          ? (current.apostas_recentes || []).map((item) => item.id === resolvedBet.id ? resolvedBet : item)
          : current.apostas_recentes,
      } : current);
      setUser((current) => current ? { ...current, saldo: Number(res.data.novoSaldo ?? current.saldo) } : current);
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao resolver aposta');
    } finally {
      setResolvingBet(null);
    }
  };

  if (loading || !data) {
    return <DashboardLayout><LoadingState title="Montando seu dashboard" description="Buscando banca, entradas e historico para compor sua visao." /></DashboardLayout>;
  }

  const monthlyGoal = data.banca_inicial > 0 ? data.banca_inicial * 1.25 : 0;
  const progress = monthlyGoal > 0 ? Math.min(100, Math.round((data.saldo / monthlyGoal) * 100)) : 0;
  const planIsPremium = data.plano === 'premium';
  const entries = planIsPremium && data.entradas_premium?.length ? data.entradas_premium : [data.aposta_do_dia].filter(Boolean);

  return (
    <DashboardLayout>
      <PageHeader
        title="Dashboard"
        description="Acompanhe banca, entradas, assertividade e oportunidades em um unico painel."
      />

      {dashboardError ? <div className={styles.dashboardError}>{dashboardError}</div> : null}

      <Card className={styles.bankrollCard}>
        <div>
          <div className={styles.bankrollTitle}>
            <Wallet size={20} className="text-primary" />
            Banca inicial
          </div>
          <p className={styles.bankrollHint}>Defina o valor real da sua banca para calcular lucro, stake sugerida e evolucao.</p>
        </div>
        <form className={styles.bankrollForm} onSubmit={handleSaveBankroll}>
          <span>R$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={bankrollValue}
            onChange={(event) => setBankrollValue(event.target.value)}
          />
          <Button variant="primary" disabled={savingBankroll}>{savingBankroll ? 'Salvando...' : 'Salvar'}</Button>
        </form>
      </Card>

      <Card className={styles.progressCard}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progresso da meta mensal</span>
          <span className={styles.progressValue}>{progress}%</span>
        </div>
        <Progress value={progress} />
      </Card>

      <div className={styles.statsGrid}>
        <StatCard label="Saldo Total" value={currency(data.saldo)} hint="Banca atual" icon={<DollarSign size={20} />} />
        <StatCard label="Lucro Total" value={`${data.lucro >= 0 ? '+' : '-'} ${currency(Math.abs(data.lucro))}`} hint={`Banca inicial: ${currency(data.banca_inicial)}`} icon={<TrendingUp size={20} />} />
        <StatCard label="Assertividade" value={`${data.assertividade}%`} hint="Media da IA" icon={<Target size={20} />} />
        <StatCard label="Stake Sugerida" value={currency(data.stake_sugerida)} hint="2% da banca atual" icon={<Activity size={20} />} />
      </div>

      <div className={styles.middleSection}>
        <Card className={styles.chartCard}>
          <h3 className={styles.cardTitle}>Evolucao da banca</h3>
          <div className={styles.chartContainer}>
            {chartReady && data.history && data.history.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} dx={-10} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [currency(value), 'Banca']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#00E676" strokeWidth={3} dot={{ r: 4, fill: '#00E676', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyState}>Configure sua banca para iniciar o acompanhamento.</div>
            )}
          </div>
        </Card>

        <Card className={styles.betOfDayCard}>
          <div className={styles.betOfDayHeader}>
            <h3 className={styles.cardTitle}>{planIsPremium ? 'Entradas Premium' : 'Aposta do dia'}</h3>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>{planIsPremium ? 'Odds reais' : 'Odd real'}</span>
          </div>

          {entries.length > 0 ? (
            <div className={styles.entriesList}>
              {entries.map((entry, index) => {
                const entryKey = getEntryKey(entry, index);
                const gameName = `${entry.homeTeamName} vs ${entry.awayTeamName}`;
                const odd = getRealOdd(entry);
                const isLive = ['inprogress', 'live'].includes(String(entry.status?.type || '').toLowerCase());
                const alreadyPlaced = Boolean(placedEntries[entryKey]);

                return (
                  <div className={styles.entryItem} key={`${entry.eventId}-${entry.market}-${index}`}>
                    <div className={styles.matchHeader}>
                      <div className={styles.teamBlock}>
                        <span className={styles.teamName}>{entry.homeTeamName}</span>
                        <span className={styles.versus}>vs</span>
                        <span className={styles.teamName}>{entry.awayTeamName}</span>
                      </div>
                      <span className={`${styles.matchStatus} ${isLive ? styles.liveStatus : ''}`}>
                        {getMatchMeta(entry)}
                      </span>
                    </div>
                    <div className={styles.betOfDayLeague}>{entry.tournamentName}</div>
                    <div className={styles.betOfDayOddWrapper}>
                      <span className={styles.betOfDayOddLabel}>Entrada:</span>
                      <span className={styles.betOfDayOddValue}>{entry.recommendation}</span>
                      <span className={styles.marketPill}>{entry.market}</span>
                      <span className={odd ? styles.oddPill : styles.oddMissing}>
                        {odd ? `Odd ${odd.toFixed(2)}` : 'Odd indisponivel'}
                      </span>
                    </div>
                    <div className={styles.betOfDayAnalysis}>
                      <strong>Analise da IA ({entry.confidence || 0}% de confianca):</strong>
                      <p>{entry.analysisSummary || entry.rationale || 'Analise resumida indisponivel no momento.'}</p>
                    </div>
                    <AnalysisDetails entry={entry} />
                    <form className={styles.entryForm} onSubmit={(event) => handlePlaceEntry(event, entry, index, gameName, odd)}>
                      <label className={styles.entryStakeField}>
                        <span>Valor da entrada</span>
                        <div>
                          <strong>R$</strong>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            disabled={!odd || alreadyPlaced}
                            value={entryStakes[entryKey] ?? ''}
                            placeholder={String(Number(data.stake_sugerida || 0).toFixed(2))}
                            onChange={(event) => setEntryStakes((current) => ({ ...current, [entryKey]: event.target.value }))}
                          />
                        </div>
                      </label>
                      <Button variant="primary" type="submit" disabled={placingEntry === entryKey || alreadyPlaced || !odd}>
                        {placingEntry === entryKey ? 'Registrando...' : alreadyPlaced ? 'Registrada' : odd ? 'Registrar entrada' : 'Sem odd real'}
                      </Button>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              {data.aposta_do_dia_atualizando
                ? 'A IA esta processando as melhores oportunidades de hoje.'
                : data.aposta_do_dia_erro || 'Nenhuma oportunidade encontrada para hoje.'}
            </div>
          )}
        </Card>
      </div>

      <div className={styles.betsSection}>
        <h3 className={styles.sectionTitle}>Ultimas apostas</h3>
        <div className={styles.betsList}>
          {data.apostas_recentes && data.apostas_recentes.length > 0 ? data.apostas_recentes.map((aposta) => (
            <Card key={aposta.id} className={styles.betCard}>
              <div className={styles.betInfo}>
                <h4 className={styles.betGame}>{aposta.jogo}</h4>
                <span className={styles.betDate}>{new Date(aposta.date).toLocaleString()}</span>
              </div>
              <div className={styles.betOdd}>
                <span>Odd</span>
                <strong>{aposta.odd.toFixed(2)}</strong>
              </div>
              <div className={styles.betResult}>
                <span className={`${styles.badge} ${aposta.status === 'Ganha' ? styles.badgeSuccess : aposta.status === 'Pendente' ? styles.badgePending : styles.badgeDanger}`}>
                  {aposta.status}
                </span>
                <strong className={aposta.status === 'Ganha' ? 'text-primary' : aposta.status === 'Pendente' ? styles.textMuted : styles.textDanger}>
                  {aposta.valor}
                </strong>
                {aposta.status === 'Pendente' && (
                  <div className={styles.betActions}>
                    <button
                      type="button"
                      className={styles.greenAction}
                      onClick={() => handleResolveBet(aposta, 'green')}
                      disabled={Boolean(resolvingBet)}
                    >
                      Green
                    </button>
                    <button
                      type="button"
                      className={styles.redAction}
                      onClick={() => handleResolveBet(aposta, 'red')}
                      disabled={Boolean(resolvingBet)}
                    >
                      Red
                    </button>
                  </div>
                )}
              </div>
            </Card>
          )) : (
            <p style={{ color: '#666' }}>Nenhuma aposta realizada ainda.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
