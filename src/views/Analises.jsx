'use client';

import React, { useContext, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
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
const asArray = (value) => Array.isArray(value) ? value.filter(Boolean) : [];
const cleanText = (value) => String(value ?? '').trim();

const modeOptions = [
  { id: 'eventos', label: 'Por ID', icon: Target },
  { id: 'equipes', label: 'Equipes', icon: Users },
  { id: 'dia', label: 'Melhores do dia', icon: CalendarDays },
  { id: 'campeonato', label: 'Campeonato', icon: Trophy },
];

const sourceLabel = (source) => ({
  'azure-openai': 'Azure OpenAI',
  heuristic: 'Modelo local',
  odds: 'Odds',
  'odds-fallback': 'Fallback de odds',
}[source] || source || 'IA');

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
  if (!data || typeof data !== 'object') return null;
  const facts = Object.entries(data)
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

const AnalysisCard = ({ analysis, index, featured }) => {
  const entry = getMainEntry(analysis);
  const confidence = Math.max(0, Math.min(100, Number(entry.confidence || 0)));
  const recommendations = asArray(analysis.recommendations);

  return (
    <article className={`${styles.resultCard} ${featured ? styles.featuredResult : ''}`}>
      <div className={styles.resultHeader}>
        <div className={styles.resultIdentity}>
          <div className={styles.resultEyebrow}>
            {featured ? <><Sparkles size={14} /> Melhor oportunidade</> : `Analise ${index + 1}`}
          </div>
          <h2>{entry.recommendation || 'Sem entrada confiavel'}</h2>
          <div className={styles.resultMeta}>
            <span>Evento {entry.eventId || 'nao informado'}</span>
            <span>{sourceLabel(analysis.analysisSource)}</span>
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
          </div>

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
  const { api } = useContext(AuthContext);
  const [activeMode, setActiveMode] = useState('eventos');
  const [eventIds, setEventIds] = useState('');
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [date, setDate] = useState(today());
  const [matchMode, setMatchMode] = useState('prelive');
  const [limit, setLimit] = useState('5');
  const [tournamentId, setTournamentId] = useState('');
  const [daysAhead, setDaysAhead] = useState('2');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState(null);

  const entries = useMemo(() => getEntries(payload), [payload]);
  const result = payload?.result || payload;
  const bestEventId = String(result?.bestEventId || result?.bestEntry?.eventId || entries[0]?.eventId || '');

  const runAnalysis = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setPayload(null);

    try {
      let response;
      if (activeMode === 'eventos') {
        const ids = eventIds.split(/[\s,;]+/).map((id) => id.trim()).filter(Boolean);
        if (![1, 3].includes(ids.length) || ids.some((id) => !/^\d+$/.test(id))) {
          throw new Error('Informe um ID ou exatamente tres IDs numericos.');
        }
        response = await api.get(`/analysis/events/${ids.join(',')}`);
      } else if (activeMode === 'equipes') {
        if (!home.trim() || !away.trim()) throw new Error('Informe os dois times.');
        response = await api.get('/analysis/by-teams', { params: { home, away, date, mode: matchMode } });
      } else if (activeMode === 'dia') {
        response = await api.get('/analysis/daily', {
          params: { date, limit, maxCandidates: Math.max(10, Number(limit) * 3), mode: matchMode },
        });
      } else {
        if (!/^\d+$/.test(tournamentId.trim())) throw new Error('Informe o ID numerico do campeonato.');
        response = await api.get(`/analysis/tournament/${tournamentId.trim()}`, {
          params: { date, limit, daysAhead, mode: matchMode },
        });
      }
      setPayload(response.data);
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
          <div className={styles.pageEyebrow}><ShieldCheck size={16} /> OGOL + Azure OpenAI</div>
          <h1>Central de analises</h1>
          <p>Investigue uma partida, compare tres jogos ou encontre as melhores oportunidades de uma rodada.</p>
        </div>
        <div className={styles.sourceStatus}>
          <span />
          Dados esportivos do OGOL
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
              {activeMode === 'eventos' && 'Use o numero no final da URL do jogo no OGOL. Para comparar, informe exatamente tres IDs.'}
              {activeMode === 'equipes' && 'A partida sera localizada na agenda pela data e pelos nomes informados.'}
              {activeMode === 'dia' && 'A IA avalia os jogos com dados mais completos e ordena as entradas por confianca.'}
              {activeMode === 'campeonato' && 'Analise os proximos jogos de uma competicao especifica.'}
            </p>
          </div>

          <div className={styles.fields}>
            {activeMode === 'eventos' ? (
              <label className={styles.fieldWide}>
                <span>ID do jogo ou tres IDs</span>
                <input value={eventIds} onChange={(event) => setEventIds(event.target.value)} placeholder="11832328 ou 11832328, 11832329, 12043362" inputMode="numeric" />
              </label>
            ) : null}

            {activeMode === 'equipes' ? (
              <>
                <label><span>Time mandante</span><input value={home} onChange={(event) => setHome(event.target.value)} placeholder="Turquia" /></label>
                <label><span>Time visitante</span><input value={away} onChange={(event) => setAway(event.target.value)} placeholder="Estados Unidos" /></label>
              </>
            ) : null}

            {activeMode === 'campeonato' ? (
              <label><span>ID do campeonato</span><input value={tournamentId} onChange={(event) => setTournamentId(event.target.value)} placeholder="ID numerico" inputMode="numeric" /></label>
            ) : null}

            {activeMode !== 'eventos' ? (
              <label><span>Data inicial</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label>
            ) : null}

            {['dia', 'campeonato'].includes(activeMode) ? (
              <label><span>Quantidade</span><select value={limit} onChange={(event) => setLimit(event.target.value)}><option value="3">3 jogos</option><option value="5">5 jogos</option><option value="8">8 jogos</option></select></label>
            ) : null}

            {activeMode === 'campeonato' ? (
              <label><span>Buscar por</span><select value={daysAhead} onChange={(event) => setDaysAhead(event.target.value)}><option value="0">Somente no dia</option><option value="2">3 dias</option><option value="6">7 dias</option><option value="13">14 dias</option></select></label>
            ) : null}

            {activeMode !== 'eventos' ? (
              <div className={styles.modeField}>
                <span>Momento</span>
                <div className={styles.segmented}>
                  <button type="button" className={matchMode === 'prelive' ? styles.segmentActive : ''} onClick={() => setMatchMode('prelive')}><Clock3 size={16} /> Pre-jogo</button>
                  <button type="button" className={matchMode === 'all' ? styles.segmentActive : ''} onClick={() => setMatchMode('all')}><Activity size={16} /> Todos</button>
                </div>
              </div>
            ) : null}
          </div>

          <div className={styles.formFooter}>
            <div><CheckCircle2 size={16} /> Sem uso de odds na decisao da IA</div>
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
          <div><strong>A IA esta cruzando os dados da partida</strong><span>O OGOL pode levar alguns instantes para responder.</span></div>
        </section>
      ) : null}

      {error ? <div className={styles.errorState}><AlertTriangle size={20} /><span>{error}</span></div> : null}

      {payload && !loading ? (
        <section className={styles.resultsSection}>
          <div className={styles.resultsHeading}>
            <div>
              <span>Resultado</span>
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
