'use client';

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, CartesianGrid, LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Plus, Search, Pencil, Trash2, Lock, Unlock, KeyRound, X, RefreshCw, Eye } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminSettings from '@/components/admin/AdminSettings';
import styles from './AdminPanel.module.css';

const money = (cents) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(cents || 0) / 100);
const date = (value) => value ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
const labels = { admin: 'Admin', premium: 'Premium', free: 'Gratuito', active: 'Ativo', blocked: 'Bloqueado' };
const blank = { plans: { name: '', price_cents: 0, description: '', benefits: [], color: '#00E676', badge: '', display_order: 0, billing_period: 'monthly', active: true }, entries: { league: '', championship: '', market: '', odd: 1.5, confidence: 70, ai_analysis: '', event_time: '', image_url: '', status: 'draft', pinned: false, hidden: false, publish_at: '' }, news: { title: '', image_url: '', content: '', author: '', category: '', published: false, featured: false } };

const fields = {
  plans: [['name','Nome'],['price_cents','Valor em centavos','number'],['description','Descrição','textarea'],['benefits','Benefícios (um por linha)','textarea'],['color','Cor','color'],['badge','Badge'],['display_order','Ordem','number'],['billing_period','Período'],['active','Ativo','checkbox']],
  entries: [['league','Liga'],['championship','Campeonato'],['market','Mercado'],['odd','Odd','number'],['confidence','Confiança (%)','number'],['ai_analysis','Análise IA','textarea'],['event_time','Horário','datetime-local'],['image_url','Imagem (URL)'],['status','Status'],['pinned','Fixado','checkbox'],['hidden','Oculto','checkbox'],['publish_at','Agendar publicação','datetime-local']],
  news: [['title','Título'],['image_url','Imagem (URL)'],['content','Texto','textarea'],['author','Autor'],['category','Categoria'],['published','Publicado','checkbox'],['featured','Destaque','checkbox']],
};

function Toast({ toast, close }) { if (!toast) return null; return <div className={`${styles.toast} ${styles[toast.type]}`}><span>{toast.message}</span><button onClick={close}>×</button></div>; }
function Empty() { return <div className={styles.empty}>Nenhum registro encontrado.</div>; }

function Dashboard({ data, primaryColor }) {
  if (!data) return null;
  const m = data.metrics || {};
  const cards = [
    ['Total de usuários', m.total_users], ['Usuários premium', m.premium_users], ['Usuários gratuitos', m.free_users], ['Novos hoje', m.new_users_today],
    ['Receita do mês', money(m.revenue_month_cents)], ['Receita total', money(m.revenue_total_cents)], ['Assinaturas ativas', m.active_subscriptions], ['Canceladas', m.cancelled_subscriptions],
    ['Status da API', data.status?.api?.label], ['Status do scraper', data.status?.scraper?.label],
  ];
  return <><div className={styles.cards}>{cards.map(([label,value], i) => <article key={label} className={i > 9 ? (String(value).includes('Operacional') ? styles.healthy : styles.unhealthy) : ''}><span>{label}</span><strong>{value ?? 0}</strong>{label === 'Usuários premium' && <small>{m.conversion_percent || 0}% de conversão</small>}</article>)}</div><div className={styles.charts}>
    <Chart title="Crescimento de usuários" data={data.charts?.users} kind="area" primaryColor={primaryColor} />
    <Chart title="Receita mensal" data={(data.charts?.revenue || []).map(v => ({ ...v, value: Number(v.value) / 100 }))} kind="bar" moneyAxis primaryColor={primaryColor} />
    <Chart title="Novas assinaturas" data={data.charts?.subscriptions} kind="line" primaryColor={primaryColor} />
    <Chart title="Cancelamentos" data={data.charts?.cancellations} kind="bar" danger />
  </div></>;
}

function Chart({ title, data = [], kind, danger, moneyAxis, primaryColor }) {
  const color = danger ? '#ef4444' : (primaryColor || '#00b85c');
  return <article className={styles.chart}><h3>{title}</h3><ResponsiveContainer width="100%" height={245}>{kind === 'area' ? <AreaChart data={data}><defs><linearGradient id="green" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={color} stopOpacity={.35}/><stop offset="95%" stopColor={color} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip/><Area type="monotone" dataKey="value" stroke={color} fill="url(#green)"/></AreaChart> : kind === 'line' ? <LineChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label"/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" stroke={color} strokeWidth={3}/></LineChart> : <BarChart data={data}><CartesianGrid strokeDasharray="3 3" vertical={false}/><XAxis dataKey="label"/><YAxis tickFormatter={moneyAxis ? v => `R$${v}` : undefined}/><Tooltip formatter={moneyAxis ? v => money(v * 100) : undefined}/><Bar dataKey="value" fill={color} radius={[6,6,0,0]}/></BarChart>}</ResponsiveContainer></article>;
}

function Pagination({ meta, setPage }) { if (!meta || meta.pages <= 1) return null; return <div className={styles.pagination}><button disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>Anterior</button><span>Página {meta.page} de {meta.pages}</span><button disabled={meta.page >= meta.pages} onClick={() => setPage(meta.page + 1)}>Próxima</button></div>; }

export default function AdminPanel() {
  const { api, settings, updateSettingsTheme } = useContext(AuthContext);
  const [section, setSection] = useState('dashboard');
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});

  const notify = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };
  const endpoint = section === 'audit-logs' ? '/admin/audit-logs' : `/admin/${section}`;
  const load = async () => {
    setLoading(true);
    try {
      const params = ['users','plans','entries','news','audit-logs'].includes(section) ? { page, limit: 20, search: search || undefined, role: section === 'users' ? role || undefined : undefined, status: section === 'users' ? status || undefined : undefined, date_from: section === 'users' ? dateFrom || undefined : undefined, date_to: section === 'users' ? dateTo || undefined : undefined } : undefined;
      const res = await api.get(endpoint, { params }); setPayload(res.data);
    } catch (err) { notify(err.response?.data?.error || 'Não foi possível carregar os dados.', 'error'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [section, page, role, status, dateFrom, dateTo]);
  useEffect(() => { const timer = setTimeout(() => { if (['users','plans','entries','news'].includes(section)) { setPage(1); load(); } }, 350); return () => clearTimeout(timer); }, [search]);
  const changeSection = (next) => { setSection(next); setPage(1); setSearch(''); setRole(''); setStatus(''); setDateFrom(''); setDateTo(''); setPayload(null); };
  const rows = payload?.data || [];

  const openEditor = (type, item = null, readOnly = false) => {
    const value = item ? { ...item } : { ...blank[type] };
    if (type === 'plans' && Array.isArray(value.benefits)) value.benefits = value.benefits.join('\n');
    setForm(value); setModal({ type, item, readOnly });
  };
  const saveResource = async (event) => {
    event.preventDefault(); const body = { ...form };
    if (modal.type === 'plans') body.benefits = String(body.benefits || '').split('\n').map(v => v.trim()).filter(Boolean);
    try { modal.item ? await api.put(`/admin/${modal.type}/${modal.item.id}`, body) : await api.post(`/admin/${modal.type}`, body); setModal(null); notify('Registro salvo com sucesso.'); load(); }
    catch (err) { notify(err.response?.data?.details?.join(' ') || err.response?.data?.error || 'Erro ao salvar.', 'error'); }
  };
  const removeResource = async (type, item) => { if (!confirm(`Excluir "${item.name || item.title || item.market}"? Esta ação não pode ser desfeita.`)) return; try { await api.delete(`/admin/${type}/${item.id}`); notify('Registro excluído.'); load(); } catch (err) { notify(err.response?.data?.error || 'Erro ao excluir.', 'error'); } };

  const updateUser = async (item, changes, message) => { try { await api.patch(`/admin/users/${item.id}`, changes); notify(message); load(); } catch (err) { notify(err.response?.data?.error || 'Erro ao atualizar usuário.', 'error'); } };
  const saveUser = async (event) => { event.preventDefault(); await updateUser(modal.item, form, 'Usuário atualizado.'); setModal(null); };
  const deleteUser = async (item) => { if (!confirm(`Excluir permanentemente ${item.nome}? As apostas e o histórico também serão removidos.`)) return; try { await api.delete(`/admin/users/${item.id}`); notify('Usuário excluído.'); load(); } catch (err) { notify(err.response?.data?.error || 'Erro ao excluir usuário.', 'error'); } };
  const passwordUser = async (item) => { const password = prompt(`Nova senha para ${item.nome} (mínimo 8 caracteres):`); if (!password) return; try { await api.patch(`/admin/users/${item.id}/password`, { password }); notify('Senha alterada.'); } catch (err) { notify(err.response?.data?.error || 'Erro ao alterar senha.', 'error'); } };

  return <AdminLayout section={section} onSection={changeSection}><Toast toast={toast} close={() => setToast(null)} />
    <div className={styles.heading}><div><h1>{section === 'dashboard' ? 'Dashboard Admin' : section === 'audit-logs' ? 'Logs de auditoria' : { users:'Gerenciamento de usuários',plans:'Gerenciamento de planos',payments:'Pagamentos',settings:'Configurações gerais' }[section]}</h1><p>Controle central do PlacarPro</p></div><button className={styles.refresh} onClick={load}><RefreshCw size={17}/>Atualizar</button></div>
    {loading ? <div className={styles.loading}><RefreshCw className={styles.spin}/>Carregando...</div> : <>
      {section === 'dashboard' && <Dashboard data={payload} primaryColor={settings?.primary_color}/>} 
      {section === 'users' && <><div className={styles.dateFilters}><label>Cadastro de<input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/></label><label>Cadastro até<input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/></label></div><UsersSection rows={rows} meta={payload?.pagination} {...{search,setSearch,role,setRole,status,setStatus,setPage,openEditor,updateUser,deleteUser,passwordUser}} /></>}
      {section === 'plans' && <ResourceSection type={section} rows={rows} meta={payload?.pagination} search={search} setSearch={setSearch} setPage={setPage} openEditor={openEditor} remove={removeResource}/>} 
      {section === 'payments' && <Payments data={payload} api={api} load={load} notify={notify}/>} 
      {section === 'settings' && <AdminSettings data={payload} api={api} load={load} notify={notify} updateSettingsTheme={updateSettingsTheme}/>} 
      {section === 'audit-logs' && <Audit rows={rows} meta={payload?.pagination} setPage={setPage}/>} 
    </>}
    {modal && <EditorModal modal={modal} form={form} setForm={setForm} close={() => setModal(null)} save={modal.type === 'users' ? saveUser : saveResource}/>} 
  </AdminLayout>;
}

function Toolbar({ search, setSearch, children, add }) { return <div className={styles.toolbar}><label><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..."/></label>{children}{add && <button className={styles.primary} onClick={add}><Plus size={17}/>Novo</button>}</div>; }
function UsersSection({ rows, meta, search, setSearch, role, setRole, status, setStatus, setPage, openEditor, updateUser, deleteUser, passwordUser }) { return <section className={styles.panel}><Toolbar search={search} setSearch={setSearch}><select value={role} onChange={e=>{setRole(e.target.value);setPage(1)}}><option value="">Todos os papéis</option><option value="premium">Premium</option><option value="free">Gratuito</option><option value="admin">Admin</option></select><select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">Todos os status</option><option value="active">Ativo</option><option value="blocked">Bloqueado</option></select></Toolbar><div className={styles.tableWrap}><table><thead><tr><th>Nome</th><th>Email</th><th>Plano</th><th>Status</th><th>Cadastro</th><th>Último login</th><th>Ações</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><td><strong>{item.nome}</strong><small>{labels[item.role]}</small></td><td>{item.email}</td><td><span className={`${styles.badge} ${styles[item.role]}`}>{item.plan_name || labels[item.role]}</span></td><td><span className={`${styles.status} ${styles[item.status]}`}>{labels[item.status]}</span></td><td>{date(item.data_cadastro)}</td><td>{date(item.last_login_at)}</td><td><div className={styles.actions}><button title="Visualizar" onClick={()=>openEditor('users',item,true)}><Eye size={16}/></button><button title="Editar" onClick={()=>openEditor('users',item)}><Pencil size={16}/></button><button title={item.status==='blocked'?'Desbloquear':'Bloquear'} onClick={()=>updateUser(item,{status:item.status==='blocked'?'active':'blocked'},item.status==='blocked'?'Usuário desbloqueado.':'Usuário bloqueado.')}>{item.status==='blocked'?<Unlock size={16}/>:<Lock size={16}/>}</button><button title="Alterar senha" onClick={()=>passwordUser(item)}><KeyRound size={16}/></button><button className={styles.dangerButton} title="Excluir" onClick={()=>deleteUser(item)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>{!rows.length&&<Empty/>}<Pagination meta={meta} setPage={setPage}/></section>; }
function ResourceSection({ type, rows, meta, search, setSearch, setPage, openEditor, remove }) { const columns = type==='plans'?['Nome','Valor','Badge','Ordem','Ativo']:type==='entries'?['Liga','Mercado','Odd','Confiança','Status','Publicação']:['Título','Autor','Categoria','Publicado','Destaque']; return <section className={styles.panel}><Toolbar search={search} setSearch={setSearch} add={()=>openEditor(type)}/><div className={styles.tableWrap}><table><thead><tr>{columns.map(c=><th key={c}>{c}</th>)}<th>Ações</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}>{type==='plans'?<><td><strong>{item.name}</strong><small>{item.description}</small></td><td>{money(item.price_cents)}</td><td>{item.badge||'—'}</td><td>{item.display_order}</td><td>{item.active?'Sim':'Não'}</td></>:type==='entries'?<><td><strong>{item.league}</strong><small>{item.championship}</small></td><td>{item.market}</td><td>{item.odd}</td><td>{item.confidence}%</td><td><span className={styles.badge}>{item.status}</span></td><td>{date(item.publish_at)}</td></>:<><td><strong>{item.title}</strong></td><td>{item.author||'—'}</td><td>{item.category||'—'}</td><td>{item.published?'Sim':'Não'}</td><td>{item.featured?'Sim':'Não'}</td></>}<td><div className={styles.actions}><button onClick={()=>openEditor(type,item)}><Pencil size={16}/></button><button className={styles.dangerButton} onClick={()=>remove(type,item)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>{!rows.length&&<Empty/>}<Pagination meta={meta} setPage={setPage}/></section>; }

function EditorModal({ modal, form, setForm, close, save }) { const userFields = [['nome','Nome'],['email','Email','email'],['role','Papel','select-role'],['status','Status','select-status'],['plan_id','ID do plano','number']]; const list = modal.type==='users'?userFields:fields[modal.type]; return <div className={styles.overlay} onMouseDown={e=>e.target===e.currentTarget&&close()}><div className={styles.modal}><header><div><h2>{modal.readOnly?'Detalhes':modal.item?'Editar':'Novo registro'}</h2><p>{modal.type}</p></div><button onClick={close}><X/></button></header><form onSubmit={save}>{list.map(([key,label,type='text'])=><label key={key} className={type==='textarea'?styles.wide:''}><span>{label}</span>{type==='textarea'?<textarea value={form[key]??''} disabled={modal.readOnly} onChange={e=>setForm({...form,[key]:e.target.value})}/>:type==='checkbox'?<input type="checkbox" checked={Boolean(form[key])} disabled={modal.readOnly} onChange={e=>setForm({...form,[key]:e.target.checked})}/>:type==='select-role'?<select value={form[key]||'free'} disabled={modal.readOnly} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="free">Gratuito</option><option value="premium">Premium</option><option value="admin">Administrador</option></select>:type==='select-status'?<select value={form[key]||'active'} disabled={modal.readOnly} onChange={e=>setForm({...form,[key]:e.target.value})}><option value="active">Ativo</option><option value="blocked">Bloqueado</option></select>:<input type={type} step={type==='number'?'any':undefined} value={form[key]??''} disabled={modal.readOnly} onChange={e=>setForm({...form,[key]:type==='number'?Number(e.target.value):e.target.value})}/>}</label>)}<footer><button type="button" onClick={close}>Cancelar</button>{!modal.readOnly&&<button className={styles.primary} type="submit">Salvar alterações</button>}</footer></form></div></div>; }

function Payments({ data, api, load, notify }) { const [form,setForm]=useState(data?.settings||{}); const [coupon,setCoupon]=useState({code:'',discount_type:'percentage',discount_value:10,active:true}); const save=async e=>{e.preventDefault();try{await api.put('/admin/payments',form);notify('Configurações de pagamento salvas.');load()}catch(err){notify(err.response?.data?.error||'Erro ao salvar.','error')}}; const add=async e=>{e.preventDefault();try{await api.post('/admin/payments/coupons',coupon);setCoupon({...coupon,code:''});notify('Cupom criado.');load()}catch(err){notify(err.response?.data?.error||'Erro ao criar cupom.','error')}}; const remove=async id=>{if(!confirm('Excluir este cupom?'))return;await api.delete(`/admin/payments/coupons/${id}`);load()}; return <div className={styles.settingsGrid}><form className={styles.formCard} onSubmit={save}><h2>Assinatura e Mercado Pago</h2><label>Período de teste (dias)<input type="number" value={form.trial_days||0} onChange={e=>setForm({...form,trial_days:Number(e.target.value)})}/></label><label>Máximo de acessos<input type="number" value={form.max_accesses||1} onChange={e=>setForm({...form,max_accesses:Number(e.target.value)})}/></label><label>Desconto padrão (%)<input type="number" value={form.default_discount_percent||0} onChange={e=>setForm({...form,default_discount_percent:Number(e.target.value)})}/></label><label>Status<select value={form.subscription_status||'active'} onChange={e=>setForm({...form,subscription_status:e.target.value})}><option value="active">Ativa</option><option value="paused">Pausada</option></select></label><label className={styles.check}><input type="checkbox" checked={Boolean(form.mercado_pago_enabled)} onChange={e=>setForm({...form,mercado_pago_enabled:e.target.checked})}/>Integração Mercado Pago ativa</label><button className={styles.primary}>Salvar</button></form><div className={styles.formCard}><h2>Cupons</h2><form className={styles.coupon} onSubmit={add}><input placeholder="CÓDIGO" value={coupon.code} onChange={e=>setCoupon({...coupon,code:e.target.value.toUpperCase()})}/><input type="number" value={coupon.discount_value} onChange={e=>setCoupon({...coupon,discount_value:Number(e.target.value)})}/><button className={styles.primary}><Plus size={16}/>Criar</button></form>{data?.coupons?.map(c=><div className={styles.couponRow} key={c.id}><strong>{c.code}</strong><span>{c.discount_value}{c.discount_type==='percentage'?'%':' centavos'}</span><button onClick={()=>remove(c.id)}><Trash2 size={15}/></button></div>)}</div></div>; }
function Settings({ data, api, load, notify }) { const [form,setForm]=useState(data||{}); const save=async e=>{e.preventDefault();try{await api.put('/admin/settings',form);notify('Configurações salvas.');load()}catch(err){notify(err.response?.data?.error||'Erro ao salvar.','error')}}; return <form className={`${styles.formCard} ${styles.general}`} onSubmit={save}><h2>Identidade e comunicação</h2>{[['system_name','Nome do sistema'],['logo_url','Logo (URL)'],['favicon_url','Favicon (URL)'],['contact_email','Email de contato'],['contact_phone','Telefone'],['home_text','Texto da home'],['user_message','Mensagem para usuários']].map(([key,label])=><label key={key}>{label}{key.includes('text')||key.includes('message')?<textarea value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/>:<input value={form[key]||''} onChange={e=>setForm({...form,[key]:e.target.value})}/>}</label>)}<label>Cor principal<input type="color" value={form.primary_color||'#00E676'} onChange={e=>setForm({...form,primary_color:e.target.value})}/></label><label>Cor secundária<input type="color" value={form.secondary_color||'#1A1A1A'} onChange={e=>setForm({...form,secondary_color:e.target.value})}/></label><label className={styles.check}><input type="checkbox" checked={Boolean(form.maintenance_mode)} onChange={e=>setForm({...form,maintenance_mode:e.target.checked})}/>Modo manutenção</label><button className={styles.primary}>Salvar configurações</button></form>; }
function Audit({ rows, meta, setPage }) { return <section className={styles.panel}><div className={styles.tableWrap}><table><thead><tr><th>Data</th><th>Administrador</th><th>Ação</th><th>Entidade</th><th>ID</th><th>IP</th></tr></thead><tbody>{rows.map(item=><tr key={item.id}><td>{date(item.created_at)}</td><td><strong>{item.actor_name||'Sistema'}</strong><small>{item.actor_email}</small></td><td><span className={styles.badge}>{item.action}</span></td><td>{item.entity_type}</td><td>{item.entity_id||'—'}</td><td>{item.ip_address||'—'}</td></tr>)}</tbody></table></div>{!rows.length&&<Empty/>}<Pagination meta={meta} setPage={setPage}/></section>; }
