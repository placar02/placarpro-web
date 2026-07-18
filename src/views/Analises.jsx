'use client';

import React, { useContext, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Gauge,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import { AuthContext } from '../contexts/AuthContext';
import styles from './Analises.module.css';

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const cleanText = (value) => String(value ?? '').trim();
const jobMessage = (payload) => {
  if (payload?.statusMessage) return payload.statusMessage;
  if (payload?.status === 'queued') return 'Na fila de analise';
  if (payload?.status === 'processing') return 'Cruzando dados da partida';
  return 'Buscando melhor entrada';
};

const modeOptions = [
  { id: 'equipes', label: 'Equipes', icon: Users },
  { id: 'dia', label: 'Melhores do dia', icon: CalendarDays },
  { id: 'campeonato', label: 'Campeonato', icon: Trophy },
];

const Paywall = ({ user }) => (
  <DashboardLayout>
    <section className={styles.paywall}>
      <div className={styles.paywallBackdrop} />
      <div className={styles.paywallContent}>
        <div className={styles.paywallBadge}><ShieldCheck size={16} /> Recurso premium</div>
        <h1>Analises avancadas liberadas para assinantes.</h1>
        <p>
          A Central de Analises cruza forma recente, contexto da partida, mercado, risco e sinais de confianca da IA.
          Para manter esse processamento com qualidade e dados atualizados, este modulo faz parte dos planos premium.
        </p>

        <div className={styles.paywallGrid}>
          <div>
            <BrainCircuit size={20} />
            <strong>Leitura explicavel da IA</strong>
            <span>Resumo dos fatores que sustentam ou rejeitam uma entrada.</span>
          </div>
          <div>
            <Target size={20} />
            <strong>Mercados e confianca</strong>
            <span>Classificacao por oportunidade, risco e consistencia dos dados.</span>
          </div>
          <div>
            <Sparkles size={20} />
            <strong>Melhores jogos do dia</strong>
            <span>Triagem automatizada para encontrar partidas com melhor contexto.</span>
          </div>
        </div>

        <div className={styles.paywallActions}>
          <Link href="/planos">
            <Button variant="primary">Assinar um plano <ArrowRight size={18} /></Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">Voltar ao dashboard</Button>
          </Link>
        </div>

        <span className={styles.paywallNote}>
          Plano atual: {user?.plano === 'premium' ? 'Premium' : 'Basico'}
        </span>
      </div>
    </section>
  </DashboardLayout>
);

const humanize = (value) => String(value || '')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/_/g, ' ')
  .replace(/^./, (letter) => letter.toUpperCase());

const displayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'Sem dados';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Nao';
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .map(([key, item]) => `${humanize(key)}: ${displayValue(item)}`)
      .join(' | ');
  }
  return String(value);
};

const getEntries = (payload) => {
  const result = payload?.result || payload;
  if (!result) return [];
  if (asArray(result.entries).length) return result.entries;
  if (asArray(result.analyses).length) return result.analyses;
  return [result];
};

const getMainEntry = (analysis) => ({
  ...analysis,
  ...(analysis?.bestEntry || {}),
  eventId: analysis?.bestEntry?.eventId || analysis?.eventId,
});

const compactAiError = (value) => {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  return text.length > 180 ? `${text.slice(0, 177)}...` : text;
};

const confidenceTone = (confidence) => {
  if (confidence >= 75) return styles.confidenceHigh;
  if (confidence >= 55) return styles.confidenceMedium;
  return styles.confidenceLow;
};

const marketLabel = (market) => {
  const value = String(market || '').trim();
  if (!value || ['none', 'pending'].includes(value.toLowerCase())) return 'Sem entrada recomendada';
  return value;
};

const formatKickoff = (timestamp) => {
  const numeric = Number(timestamp);
  if (!Number.isFinite(numeric) || numeric <= 0) return { date: 'Data não informada', time: 'Horário não informado' };
  const date = new Date(numeric < 1e12 ? numeric * 1000 : numeric);
  return {
    date: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric' }).format(date),
    time: new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', hour12: false }).format(date),
  };
};

const formatOdd = (entry) => {
  const odd = Number(entry?.odd ?? entry?.meta?.decimal_odds);
  return Number.isFinite(odd) && odd > 1 ? odd.toFixed(2) : 'Aguardando odd';
};

const formatExpectedValue = (entry) => {
  const value = Number(entry?.meta?.expectedValue ?? entry?.expectedValue);
  if (!Number.isFinite(value)) return 'Aguardando odd';
  const percentage = Math.abs(value) <= 1 ? value * 100 : value;
  return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(1)}%`;
};

const sentence = (value) => {
  const text = cleanText(value).replace(/\s+/g, ' ');
  if (!text) return '';
  const normalized = text
    .replace(/^over 2\.5:\s*(\d+(?:[.,]\d+)?)%$/i, 'O mercado Over 2.5 ocorreu em $1% da amostra analisada')
    .replace(/^btts:\s*(\d+(?:[.,]\d+)?)%$/i, 'Ambas as equipes marcaram em $1% da amostra analisada')
    .replace(/^m[eé]dia ofensiva combinada\s*([\d.,]+)$/i, 'A média ofensiva combinada foi de $1 gol por equipe')
    .replace(/^m[eé]dia defensiva combinada\s*([\d.,]+)$/i, 'A média combinada de gols sofridos foi de $1 por equipe')
    .replace(/^m[eé]dia do mandante:\s*([\d.,]+)\s*(.*)$/i, 'O mandante registra média de $1 $2')
    .replace(/^m[eé]dia do visitante:\s*([\d.,]+)\s*(.*)$/i, 'O visitante registra média de $1 $2')
    .replace(/^forma geral:\s*([\d.,]+)%?\s*x\s*([\d.,]+)%?$/i, 'A forma recente apresenta comparação de $1% contra $2%')
    .replace(/^casa\/?fora:\s*([\d.,]+)%?\s*x\s*([\d.,]+)%?$/i, 'O recorte de desempenho como mandante e visitante aponta $1% contra $2%')
    .replace(/^(\d+(?:[.,]\d+)?)%$/, 'Um dos indicadores considerados atingiu $1% na amostra analisada');
  const readable = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  return /[.!?]$/.test(readable) ? readable : `${readable}.`;
};

const uniqueSentences = (...groups) => [...new Set(groups.flatMap(asArray).map((item) => sentence(displayValue(item))).filter(Boolean))];

const marketReason = (analysis, entry, rejected) => {
  const breakdown = analysis?.marketBreakdown;
  const values = breakdown && typeof breakdown === 'object' ? Object.values(breakdown) : [];
  const explanation = values.find((value) => typeof value === 'string' && cleanText(value));
  if (explanation) return sentence(explanation);
  if (rejected) return 'Os mercados avaliados não atingiram, ao mesmo tempo, os critérios mínimos de confiança, qualidade dos dados e segurança exigidos pelo PlacarPro.';
  return `O mercado ${entry.recommendation || marketLabel(entry.market)} apresentou a melhor combinação disponível entre evidência estatística, qualidade dos dados e valor esperado.`;
};

const PresentationSection = ({ icon: Icon, title, children, tone = 'default' }) => (
  <section className={`${styles.presentationSection} ${tone === 'warning' ? styles.presentationWarning : ''}`}>
    <div className={styles.sectionHeading}><Icon size={18} /><h3>{title}</h3></div>
    {children}
  </section>
);

const NarrativeList = ({ items, tone = 'positive' }) => {
  const values = asArray(items);
  if (!values.length) return null;
  return (
    <ul className={`${styles.narrativeList} ${tone === 'warning' ? styles.narrativeWarning : ''}`}>
      {values.slice(0, 6).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
    </ul>
  );
};

const InsightList = ({ title, items, tone = 'default' }) => {
  const values = asArray(items);
  if (!values.length) return null;

  return (
    <section className={styles.insightSection}>
      <h4>{title}</h4>
      <ul className={`${styles.insightList} ${tone === 'warning' ? styles.warningList : ''}`}>
        {values.slice(0, 8).map((item, index) => (
          <li key={`${displayValue(item)}-${index}`}>{displayValue(item)}</li>
        ))}
      </ul>
    </section>
  );
};

const Facts = ({ data, limit = 10 }) => {
  if (data === null || data === undefined || data === '') return null;
  const normalizedData = Array.isArray(data)
    ? {
      resumo: data.every((item) => typeof item === 'string' && item.length <= 2)
        ? data.join('')
        : data,
    }
    : typeof data === 'object'
      ? data
      : { resumo: data };
  const facts = Object.entries(normalizedData)
    .filter(([, value]) => value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && !value.length))
    .slice(0, limit);
  if (!facts.length) return null;

  return (
    <div className={styles.factsGrid}>
      {facts.map(([key, value]) => (
        <div className={styles.fact} key={key}>
          <span>{humanize(key)}</span>
          <strong>{displayValue(value)}</strong>
        </div>
      ))}
    </div>
  );
};

const TeamReading = ({ title, data }) => {
  if (!data || typeof data !== 'object') return null;

  return (
    <section className={styles.teamReading}>
      <div className={styles.teamReadingTitle}>{title}</div>
      <h4>{data.team || 'Equipe'}</h4>
      {data.tacticalReading ? <p>{data.tacticalReading}</p> : null}
      {data.bettingImpact ? <p className={styles.impact}>{data.bettingImpact}</p> : null}
      <InsightList title="Pontos fortes" items={data.strengths} />
      <InsightList title="Pontos de atencao" items={data.weaknesses} tone="warning" />
    </section>
  );
};

const TeamBadge = ({ team }) => {
  if (!team?.name) return null;
  return (
    <div className={styles.teamBadge}>
      <div className={styles.teamLogo}>
        <span>{team.name.trim().charAt(0).toUpperCase()}</span>
        {team.imageUrl ? (
          <img
            src={team.imageUrl}
            alt={`Escudo ${team.name}`}
            onError={(event) => { event.currentTarget.style.display = 'none'; }}
          />
        ) : null}
      </div>
      <strong>{team.name}</strong>
    </div>
  );
};

const AnalysisCard = ({ analysis, index, featured }) => {
  const entry = getMainEntry(analysis);
  const confidence = Math.max(0, Math.min(100, Number(entry.confidence || 0)));
  const recommendations = asArray(analysis.recommendations);
  const decisionAudit = analysis.meta?.decisionAudit;
  const rejected = decisionAudit?.decision === 'rejected' || confidence === 0;
  const waitingOdds = analysis.analysisStatus === 'waiting_odds' || decisionAudit?.decision === 'waiting_odds';
  const kickoff = formatKickoff(entry.startTimestamp || analysis.startTimestamp);
  const round = entry.round ?? entry.roundInfo?.round ?? analysis.round ?? analysis.roundInfo?.round;
  const venueValue = entry.venue ?? analysis.venue;
  const venue = cleanText(typeof venueValue === 'object' ? venueValue?.name : venueValue);
  const evidence = uniqueSentences(analysis.keyFactors, entry.dataSupport, analysis.dataSupport);
  const positivePoints = uniqueSentences(analysis.confidenceDrivers, analysis.keyFactors, entry.dataSupport).slice(0, 5);
  const attentionPoints = uniqueSentences(entry.warningSigns, analysis.warningSigns, decisionAudit?.missingData?.map((item) => `Cobertura limitada para ${humanize(item).toLowerCase()}`));
  const risks = attentionPoints.length ? attentionPoints : ['Escalações, contexto pré-jogo e mudanças em relação à amostra histórica podem alterar o cenário esperado.'];
  const summary = sentence(entry.rationale || analysis.matchAnalysis || (rejected
    ? 'Os dados disponíveis não sustentaram uma recomendação com segurança suficiente.'
    : 'A recomendação foi definida a partir dos indicadores objetivos disponíveis para a partida.'));

  return (
    <article className={`${styles.resultCard} ${featured && !rejected ? styles.featuredResult : ''} ${rejected ? styles.rejectedResult : ''}`}>
      <header className={styles.professionalHeader}>
        <div className={styles.headerTopline}>
          <div className={styles.competition}><Trophy size={17} /><strong>{entry.tournamentName || 'Campeonato não informado'}</strong></div>
          <div className={`${styles.analysisStatus} ${rejected ? styles.statusRejected : waitingOdds ? styles.statusWaiting : styles.statusApproved}`}>
            {rejected ? <><AlertTriangle size={14} /> Não recomendada</> : waitingOdds ? <><Clock3 size={14} /> Aguardando odds</> : featured ? <><Sparkles size={14} /> Melhor oportunidade</> : `Análise ${index + 1}`}
          </div>
        </div>

        <div className={styles.fixtureLine}>
          <div className={styles.fixtureTeams}>
            <TeamBadge team={entry.homeTeam} />
            <span className={styles.versus}>x</span>
            <TeamBadge team={entry.awayTeam} />
          </div>
          <div className={styles.fixtureDetails}>
            <span><CalendarDays size={15} /> {kickoff.date}</span>
            <span><Clock3 size={15} /> {kickoff.time}</span>
            {round ? <span><Activity size={15} /> Rodada {round}</span> : null}
            {venue && !/^unknown$/i.test(venue) ? <span><MapPin size={15} /> {venue}</span> : null}
          </div>
        </div>

        <div className={styles.recommendationBand}>
          <span>Recomendação do PlacarPro</span>
          <strong>{rejected ? 'Nenhuma entrada recomendada' : entry.recommendation || marketLabel(entry.market)}</strong>
          <small>{marketLabel(entry.market)}</small>
        </div>

        <div className={styles.metricsGrid}>
          <div><Target size={18} /><span>Mercado</span><strong>{marketLabel(entry.market)}</strong></div>
          <div><CircleDollarSign size={18} /><span>Odd utilizada</span><strong>{formatOdd(entry)}</strong></div>
          <div><Gauge size={18} /><span>Confiança</span><strong className={confidenceTone(confidence)}>{confidence}%</strong></div>
          <div><TrendingUp size={18} /><span>Expected Value</span><strong>{formatExpectedValue(entry)}</strong></div>
          <div><ShieldCheck size={18} /><span>Nível de risco</span><strong>{entry.riskLevel ? humanize(entry.riskLevel) : rejected ? 'Não aplicável' : 'Não classificado'}</strong></div>
        </div>
      </header>

      <div className={styles.analysisNarrative}>
        <PresentationSection icon={BrainCircuit} title="Resumo da IA">
          <p className={styles.summaryText}>{summary}</p>
          {analysis.meta?.llmError ? <small className={styles.aiWarning}>A explicação detalhada da IA não ficou disponível nesta consulta: {compactAiError(analysis.meta.llmError)}</small> : null}
        </PresentationSection>

        <PresentationSection icon={Info} title="Contexto da partida">
          <p>{sentence(analysis.matchAnalysis || 'O contexto foi avaliado com os dados recentes disponíveis para as duas equipes, considerando mando de campo e características do confronto.')}</p>
          {(analysis.homeAnalysis || analysis.awayAnalysis) ? (
            <div className={styles.teamGrid}>
              <TeamReading title="Mandante" data={analysis.homeAnalysis} />
              <TeamReading title="Visitante" data={analysis.awayAnalysis} />
            </div>
          ) : null}
        </PresentationSection>

        <PresentationSection icon={CheckCircle2} title="Principais evidências">
          <NarrativeList items={evidence.length ? evidence : ['Os indicadores disponíveis foram cruzados antes da recomendação final.']} />
        </PresentationSection>

        <PresentationSection icon={Target} title="Por que esse mercado?">
          <p>{marketReason(analysis, entry, rejected)}</p>
        </PresentationSection>

        <div className={styles.balanceGrid}>
          <PresentationSection icon={TrendingUp} title="Pontos positivos">
            <NarrativeList items={positivePoints.length ? positivePoints : evidence.length ? evidence.slice(0, 3) : ['A decisão foi submetida aos filtros de qualidade e confiança do PlacarPro.']} />
          </PresentationSection>
          <PresentationSection icon={CircleAlert} title="Pontos de atenção" tone="warning">
            <NarrativeList items={risks} tone="warning" />
            {analysis.riskAnalysis ? <p className={styles.riskSummary}>{sentence(analysis.riskAnalysis)}</p> : null}
          </PresentationSection>
        </div>
      </div>

      <details className={styles.details}>
        <summary>
          <span>Ver dados complementares</span>
          <ChevronDown size={18} />
        </summary>
        <div className={styles.detailsBody}>
          {analysis.marketBreakdown ? (
            <section className={styles.dataSection}>
              <h3>Leitura por mercado</h3>
              <Facts data={analysis.marketBreakdown} />
            </section>
          ) : null}

          {analysis.refereeAnalysis ? (
            <section className={styles.dataSection}>
              <h3>Arbitro e disciplina</h3>
              <Facts data={analysis.refereeAnalysis} />
            </section>
          ) : null}

          {analysis.playerAnalysis ? (
            <section className={styles.dataSection}>
              <h3>Jogadores</h3>
              <Facts data={analysis.playerAnalysis} />
            </section>
          ) : null}

          <div className={styles.insightsGrid}>
            <InsightList title="Fatores principais" items={analysis.keyFactors} />
            <InsightList title="Suporte dos dados" items={entry.dataSupport || analysis.dataSupport} />
            <InsightList title="Sinais de alerta" items={entry.warningSigns || analysis.warningSigns} tone="warning" />
            <InsightList title="Motores da confianca" items={analysis.confidenceDrivers} />
            <InsightList title="Mercados a evitar" items={analysis.avoidMarkets} tone="warning" />
            <InsightList title="Motivos da rejeicao" items={decisionAudit?.reasons} tone="warning" />
          </div>

          {decisionAudit ? (
            <section className={styles.dataSection}>
              <h3>Auditoria da decisao</h3>
              <Facts data={{
                decisao: decisionAudit.decision === 'approved' ? 'aprovada' : decisionAudit.decision === 'waiting_odds' ? 'aguardando odds' : 'rejeitada',
                qualidadeDosDados: `${Number(decisionAudit.dataQuality || 0)}/100`,
                confiancaMinima: `${Number(decisionAudit.threshold || 0)}%`,
                dadosAusentes: asArray(decisionAudit.missingData),
              }} />
            </section>
          ) : null}

          {recommendations.length > 1 ? (
            <section className={styles.dataSection}>
              <h3>Outras leituras da IA</h3>
              <div className={styles.recommendations}>
                {recommendations.slice(0, 5).map((item, recommendationIndex) => (
                  <div className={styles.recommendationRow} key={`${item.market}-${item.recommendation}-${recommendationIndex}`}>
                    <div>
                      <span>{item.market}</span>
                      <strong>{item.recommendation}</strong>
                    </div>
                    <b>{Number(item.confidence || 0)}%</b>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </details>
    </article>
  );
};

const Analises = () => {
  const { api, user } = useContext(AuthContext);
  const [activeMode, setActiveMode] = useState('equipes');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [date, setDate] = useState(today());
  const matchMode = 'prelive';
  const [limit, setLimit] = useState('3');
  const [tournamentName, setTournamentName] = useState('');
  const [daysAhead, setDaysAhead] = useState('2');
  const [loading, setLoading] = useState(false);
  const [jobStatus, setJobStatus] = useState('');
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const entries = useMemo(() => getEntries(payload), [payload]);
  const result = payload?.result || payload;
  const bestEventId = String(result?.bestEventId || result?.bestEntry?.eventId || entries[0]?.eventId || '');

  if (user?.plano !== 'premium') {
    return <Paywall user={user} />;
  }

  const runAnalysis = async (event) => {
    event.preventDefault();
    setLoading(true);
    setJobStatus('Buscando melhor entrada');
    setError('');
    setPayload(null);

    try {
      let response;
      if (activeMode === 'equipes') {
        if (!home.trim() || !away.trim()) throw new Error('Informe os dois times.');
        response = await api.get('/analysis/by-teams', {
          params: {
            home,
            away,
            date,
            mode: matchMode,
            wait: 'true',
            useLLM: 'true',
            useLLMExplanation: 'true',
            explainRejected: 'true',
          },
        });
      } else if (activeMode === 'dia') {
        response = await api.get('/analysis/daily', {
          params: { date, limit, maxCandidates: Math.max(7, Number(limit) + 2), mode: matchMode },
        });
      } else {
        if (tournamentName.trim().length < 2) throw new Error('Informe o nome do campeonato.');
        response = await api.get('/analysis/tournament', {
          params: { name: tournamentName.trim(), date, limit, daysAhead, mode: matchMode },
        });
      }
      let responseData = response.data;
      if (responseData?.pending && responseData?.jobId) {
        setPayload(responseData);
        setJobStatus(jobMessage(responseData));
        const deadline = Date.now() + 45 * 60 * 1000;
        while (responseData?.pending && Date.now() < deadline) {
          setJobStatus(jobMessage(responseData));
          await wait(Math.max(1000, Number(responseData.pollAfterMs || 2000)));
          const jobResponse = await api.get(`/analysis/jobs/${responseData.jobId}`);
          responseData = jobResponse.data;
          setJobStatus(jobMessage(responseData));
          setPayload(responseData);
        }
        if (responseData?.pending) throw new Error('A analise continua em processamento. Tente consultar novamente em alguns instantes.');
      }
      if (responseData?.ok === false || responseData?.status === 'failed') {
        throw new Error(responseData.error || 'Nao foi possivel concluir a analise.');
      }
      const responseResult = responseData?.result;
      if (responseResult?.recommendation === 'error') {
        throw new Error(responseResult.rationale || 'Nao foi possivel obter os dados da partida.');
      }
      setPayload(responseData);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || 'Nao foi possivel concluir a analise.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <header className={styles.pageHeader}>
        <div>
          <div className={styles.pageEyebrow}><ShieldCheck size={16} /> Análise inteligente</div>
          <h1>Central de analises</h1>
          <p>Analise equipes, campeonatos ou encontre rapidamente as melhores oportunidades do dia.</p>
        </div>
        <div className={styles.sourceStatus}>
          <span />
          Dados esportivos atualizados
        </div>
      </header>

      <section className={styles.workspace}>
        <div className={styles.modeTabs} role="tablist" aria-label="Tipo de analise">
          {modeOptions.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              role="tab"
              aria-selected={activeMode === id}
              className={activeMode === id ? styles.activeTab : ''}
              onClick={() => { setActiveMode(id); setError(''); setPayload(null); }}
              key={id}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <form className={styles.analysisForm} onSubmit={runAnalysis}>
          <div className={styles.formCopy}>
            <h2>{modeOptions.find((option) => option.id === activeMode)?.label}</h2>
            <p>
              {activeMode === 'equipes' && 'A partida sera localizada na agenda pela data e pelos nomes informados.'}
              {activeMode === 'dia' && 'Escolha a data dos jogos. O sistema compara as partidas desse dia e mostra as melhores oportunidades.'}
              {activeMode === 'campeonato' && 'Digite o nome da competicao para analisar seus proximos jogos.'}
            </p>
          </div>

          <div className={styles.fields}>
            {activeMode === 'equipes' ? (
              <>
                <label><span>Time mandante</span><input value={home} onChange={(event) => setHome(event.target.value)} placeholder="Mandante" /></label>
                <label><span>Time visitante</span><input value={away} onChange={(event) => setAway(event.target.value)} placeholder="Visitante" /></label>
              </>
            ) : null}

            {activeMode === 'campeonato' ? (
              <label><span>Nome do campeonato</span><input value={tournamentName} onChange={(event) => setTournamentName(event.target.value)} placeholder="Ex.: Brasileirão, Libertadores" /></label>
            ) : null}

            <label><span>{activeMode === 'dia' ? 'Data dos jogos' : 'Data da partida ou início'}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>

            {['dia', 'campeonato'].includes(activeMode) ? (
              <label><span>Quantidade</span><select value={limit} onChange={(event) => setLimit(event.target.value)}><option value="3">3 jogos</option></select></label>
            ) : null}

            {activeMode === 'campeonato' ? (
              <label><span>Buscar por</span><select value={daysAhead} onChange={(event) => setDaysAhead(event.target.value)}><option value="0">Somente no dia</option></select></label>
            ) : null}

            <div className={styles.modeField}>
                <span>Momento</span>
                <div className={styles.segmented}>
                  <span className={styles.segmentActive}><Clock3 size={16} /> Pré-jogo</span>
                </div>
              </div>
          </div>

          <div className={styles.formFooter}>
            <div><CheckCircle2 size={16} /> Sem uso de odds na decisão</div>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Activity className={styles.spinner} size={18} /> : <Search size={18} />}
              {loading ? 'Analisando dados...' : 'Executar analise'}
            </Button>
          </div>
        </form>
      </section>

      {loading ? (
        <section className={styles.loadingState} aria-live="polite">
          <BrainCircuit size={28} />
          <div><strong>{jobStatus || 'Buscando melhor entrada'}</strong><span>Analisando os jogos disponíveis. Isso pode levar alguns instantes.</span></div>
        </section>
      ) : null}

      {error ? <div className={styles.errorState}><AlertTriangle size={20} /><span>{error}</span></div> : null}

      {payload && !payload.pending ? (
        <section className={styles.resultsSection}>
          <div className={styles.resultsHeading}>
            <div>
              <span>{payload?.pending ? 'Prévia rápida' : 'Resultado'}</span>
              <h2>{entries.length} {entries.length === 1 ? 'partida analisada' : 'partidas analisadas'}</h2>
            </div>
            {result?.date || result?.datesChecked?.length ? (
              <div className={styles.resultDate}><CalendarDays size={16} /> {result.date || result.datesChecked.join(' a ')}</div>
            ) : null}
          </div>

          {result?.warning ? <div className={styles.warningState}><AlertTriangle size={18} />{result.warning}</div> : null}

          <div className={styles.resultsList}>
            {entries.map((analysis, index) => (
              <AnalysisCard
                analysis={analysis}
                index={index}
                featured={index === 0 || String(analysis.eventId) === bestEventId}
                key={`${analysis.eventId || 'analysis'}-${index}`}
              />
            ))}
          </div>

          {asArray(result?.skipped).length ? (
            <details className={styles.skipped}>
              <summary>Partidas nao analisadas ({result.skipped.length})</summary>
              <InsightList title="Motivos" items={result.skipped.map((item) => item.reason || `Evento ${item.eventId}`)} tone="warning" />
            </details>
          ) : null}
        </section>
      ) : null}
    </DashboardLayout>
  );
};

export default Analises;
