'use client';

import React, { useState } from 'react';
import styles from '@/views/AdminPanel.module.css';

export default function AdminSettings({ data, api, load, notify, updateSettingsTheme }) {
  const social = data?.social_links || {};
  const [form, setForm] = useState({ ...data, instagram: social.instagram || '', facebook: social.facebook || '', youtube: social.youtube || '', x: social.x || '' });
  const save = async (event) => {
    event.preventDefault();
    try {
      const { instagram, facebook, youtube, x, ...settings } = form;
      const response = await api.put('/admin/settings', { ...settings, social_links: { instagram, facebook, youtube, x } });
      updateSettingsTheme(response.data);
      notify('Configurações salvas.'); load();
    } catch (error) { notify(error.response?.data?.error || 'Erro ao salvar.', 'error'); }
  };
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  return <form className={`${styles.formCard} ${styles.general}`} onSubmit={save}>
    <h2>Identidade e comunicação</h2>
    {[['system_name','Nome do sistema'],['logo_url','Logo (URL)'],['favicon_url','Favicon (URL)'],['contact_email','Email de contato'],['contact_phone','Telefone']].map(([key,label]) => <label key={key}>{label}<input required={key === 'system_name'} value={form[key] || ''} onChange={update(key)} /></label>)}
    {[['instagram','Instagram'],['facebook','Facebook'],['youtube','YouTube'],['x','X / Twitter']].map(([key,label]) => <label key={key}>{label}<input placeholder="https://" value={form[key] || ''} onChange={update(key)} /></label>)}
    <label>Texto da home<textarea value={form.home_text || ''} onChange={update('home_text')} /></label>
    <label>Mensagem para usuários<textarea value={form.user_message || ''} onChange={update('user_message')} /></label>
    <label>Cor principal<input type="color" value={form.primary_color || '#00E676'} onChange={update('primary_color')} /></label>
    <label>Cor secundária<input type="color" value={form.secondary_color || '#1A1A1A'} onChange={update('secondary_color')} /></label>
    <label className={styles.check}><input type="checkbox" checked={Boolean(form.maintenance_mode)} onChange={(event) => setForm({ ...form, maintenance_mode: event.target.checked })} />Modo manutenção</label>
    <button className={styles.primary}>Salvar configurações</button>
  </form>;
}
