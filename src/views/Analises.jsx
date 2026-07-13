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
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
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

  return (
    <article className={`${styles.resultCard} ${featured && !rejected ? styles.featuredResult : ''} ${rejected ? styles.rejectedResult : ''}`}>
      <div className={styles.resultHeader}>
        <div className={styles.resultIdentity}>
          <div className={styles.resultEyebrow}>
            {rejected
              ? <><AlertTriangle size={14} /> Partida rejeitada</>
              : featured ? <><Sparkles size={14} /> Melhor oportunidade</> : `Analise ${index + 1}`}
          </div>
          {entry.homeTeam?.name && entry.awayTeam?.name ? (
            <div className={styles.matchup}>
              <TeamBadge team={entry.homeTeam} />
              <span className={styles.versus}>x</span>
              <TeamBadge team={entry.awayTeam} />
            </div>
          ) : null}
          <h2>{entry.recommendation || 'Sem entrada confiavel'}</h2>
          <div className={styles.resultMeta}>
            <span>Evento {entry.eventId || 'nao informado'}</span>
            {entry.riskLevel ? <span>Risco {entry.riskLevel}</span> : null}
          </div>
        </div>
        <div className={`${styles.confidence} ${confidenceTone(confidence)}`} aria-label={`Confianca ${confidence}%`}>
          <strong>{confidence}%</strong>
          <span>confianca</span>
        </div>
      </div>

      <div className={styles.marketLine}>
        <Target size={18} />
        <span>Mercado</span>
        <strong>{entry.market || 'Nenhum'}</strong>
      </div>

      <div className={styles.rationale}>
        <BrainCircuit size={20} />
        <div>
          <strong>Leitura da IA</strong>
          <p>{entry.rationale || analysis.matchAnalysis || 'A IA nao encontrou sustentacao suficiente nos dados disponiveis.'}</p>
          {analysis.meta?.llmError ? (
            <small className={styles.aiWarning}>IA indisponivel nesta consulta: {compactAiError(analysis.meta.llmError)}</small>
          ) : null}
        </div>
      </div>

      <details className={styles.details} open={featured}>
        <summary>
          <span>Analise completa</span>
          <ChevronDown size={18} />
        </summary>
        <div className={styles.detailsBody}>
          {analysis.matchAnalysis ? (
            <section className={styles.textSection}>
              <h3>Contexto da partida</h3>
              <p>{analysis.matchAnalysis}</p>
            </section>
          ) : null}

          <div className={styles.teamGrid}>
            <TeamReading title="Mandante" data={analysis.homeAnalysis} />
            <TeamReading title="Visitante" data={analysis.awayAnalysis} />
          </div>

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
                decisao: decisionAudit.decision === 'approved' ? 'aprovada' : 'rejeitada',
                qualidadeDosDados: `${Number(decisionAudit.dataQuality || 0)}/100`,
                confiancaMinima: `${Number(decisionAudit.threshold || 0)}%`,
                dadosAusentes: asArray(decisionAudit.missingData),
              }} />
            </section>
          ) : null}

          {analysis.riskAnalysis ? (
            <section className={styles.textSection}>
              <h3>Risco da entrada</h3>
              <p>{analysis.riskAnalysis}</p>
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
  const [limit, setLimit] = useState('5');
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
