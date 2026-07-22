import { useEffect, useMemo, useState } from 'react'
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, CircleUserRound, Clock3,
  Home, LogOut, Menu, MessageCircle, Plus, RefreshCcw, Search, Settings, BriefcaseBusiness,
  Sparkles, Trash2, UserRound, UsersRound, X, Pencil, Eye, EyeOff,
} from 'lucide-react'
import { seedData, statusMap, STORAGE_KEY } from './data'

const cloneSeed = () => JSON.parse(JSON.stringify(seedData))
const todayISO = '2026-07-22'

function usePersistentData() {
  const [data, setData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
      if (!stored) return cloneSeed()
      const services = stored.services?.length ? stored.services : cloneSeed().services
      const appointments = (stored.appointments || []).map((appointment) => {
        const service = services.find((item) => item.id === appointment.serviceId || item.name === appointment.service)
        return { ...appointment, serviceId: service?.id || '', service: appointment.service || service?.name || 'Serviço', price: Number(appointment.price ?? service?.price ?? 0), duration: Number(appointment.duration ?? service?.duration ?? 60) }
      })
      return { ...cloneSeed(), ...stored, services, appointments }
    }
    catch { return cloneSeed() }
  })
  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)), [data])
  return [data, setData]
}

const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${date}T12:00:00`))
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
const endTime = (time, duration) => { const [hours, minutes] = time.split(':').map(Number); const total = hours * 60 + minutes + Number(duration || 0); return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}` }
const getPatient = (data, id) => data.patients.find((p) => p.id === id)

function Brand({ compact = false }) {
  return <div className={`brand ${compact ? 'compact' : ''}`}>
    <div className="brand-mark"><span>♭</span><i /></div>
    <div><strong>Fábio Duarte</strong><small>TERAPIAS</small></div>
  </div>
}

function Login({ onEnter }) {
  const [show, setShow] = useState(false)
  return <main className="login-page">
    <section className="login-art" aria-label="Apresentação da marca">
      <div className="energy-lines" />
      <Brand />
      <div className="login-message">
        <p className="eyebrow light">GESTÃO COM PROPÓSITO</p>
        <h1>Cuidado, presença<br />e organização</h1>
        <p>Uma rotina mais leve para você cuidar do que realmente importa.</p>
      </div>
      <div className="sun-symbol"><Sparkles size={24} /></div>
    </section>
    <section className="login-form-wrap">
      <form className="login-card" onSubmit={(e) => { e.preventDefault(); onEnter() }}>
        <div className="mini-symbol">♭</div>
        <p className="eyebrow">BEM-VINDO</p>
        <h2>Acesse sua conta</h2>
        <p className="muted">Gerencie seus atendimentos com tranquilidade.</p>
        <label>E-mail<input type="email" defaultValue="fabio@terapias.com" /></label>
        <label>Senha<div className="password-field"><input type={show ? 'text' : 'password'} defaultValue="demonstracao" /><button type="button" onClick={() => setShow(!show)} aria-label="Mostrar senha">{show ? <EyeOff /> : <Eye />}</button></div></label>
        <div className="login-options"><label className="check"><input type="checkbox" defaultChecked /> Lembrar de mim</label><button type="button" className="link-button">Esqueci minha senha</button></div>
        <button className="primary-button wide" type="submit">Entrar</button>
        <small className="demo-note">Acesso demonstrativo: nenhuma validação é necessária.</small>
      </form>
    </section>
  </main>
}

const navItems = [
  ['home', 'Início', Home], ['agenda', 'Agenda', CalendarDays], ['patients', 'Pacientes', UsersRound], ['services', 'Serviços', BriefcaseBusiness], ['appointments', 'Atendimentos', Sparkles], ['settings', 'Configurações', Settings],
]

function Sidebar({ page, setPage, mobileOpen, setMobileOpen, onLogout }) {
  return <>
    {mobileOpen && <button className="sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <button className="mobile-close" onClick={() => setMobileOpen(false)}><X /></button>
      <Brand />
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => { setPage(id); setMobileOpen(false) }}><Icon />{label}</button>)}</nav>
      <div className="sidebar-ornament"><Sparkles /><span>Equilíbrio para cuidar</span></div>
      <div className="profile"><div className="avatar">FD</div><div><strong>Fábio Duarte</strong><small>Terapeuta</small></div><button onClick={onLogout} aria-label="Sair"><LogOut /></button></div>
    </aside>
  </>
}

function Shell({ children, ...props }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return <div className="app-shell"><Sidebar {...props} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} /><section className="workspace"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu /> Menu</button>{children}</section></div>
}

function Status({ value }) { const item = statusMap[value] || statusMap.pending; return <span className={`status ${item.className}`}>{value === 'confirmed' && <Check />}{value === 'pending' && <Clock3 />}{item.label}</span> }
function WhatsAppButton({ patient, appointment, compact = false }) {
  const msg = encodeURIComponent(`Olá, ${patient?.name?.split(' ')[0] || ''}! Passando para confirmar seu atendimento de ${appointment.service}, no dia ${formatDate(appointment.date)}, às ${appointment.time}.`)
  return <a className={compact ? 'whatsapp-icon' : 'whatsapp-button'} href={`https://wa.me/${patient?.phone || ''}?text=${msg}`} target="_blank" rel="noreferrer"><MessageCircle />{!compact && 'Enviar WhatsApp'}</a>
}

function PageHeader({ eyebrow, title, subtitle, action }) { return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>{action}</header> }

function Dashboard({ data, openNew, goAgenda }) {
  const upcoming = data.appointments.filter((a) => a.date >= todayISO && a.status !== 'canceled').sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).slice(0,4)
  const today = data.appointments.filter((a) => a.date === todayISO && a.status !== 'canceled')
  const confirmed = data.appointments.filter((a) => a.status === 'confirmed').length
  const pending = data.appointments.filter((a) => a.status === 'pending').length
  return <>
    <PageHeader eyebrow="PAINEL PRINCIPAL" title="Olá, Fábio" subtitle="Aqui está o resumo dos seus atendimentos." action={<button className="primary-button" onClick={openNew}><Plus /> Nova consulta</button>} />
    <div className="stat-grid">
      <article className="stat-card"><div className="stat-icon"><UsersRound /></div><div><span>Consultas hoje</span><strong>{today.length}</strong><small>na sua agenda</small></div></article>
      <article className="stat-card"><div className="stat-icon"><Check /></div><div><span>Confirmadas</span><strong>{confirmed}</strong><small>próximos atendimentos</small></div></article>
      <article className="stat-card"><div className="stat-icon"><Clock3 /></div><div><span>Aguardando confirmação</span><strong>{pending}</strong><small>pedem sua atenção</small></div></article>
    </div>
    <div className="dashboard-grid">
      <article className="panel"><div className="panel-title"><div><CalendarDays /><h2>Próximos atendimentos</h2></div><button className="text-button" onClick={goAgenda}>Ver agenda</button></div>
        <div className="appointment-list">{upcoming.map((a) => { const patient = getPatient(data, a.patientId); return <div className="appointment-row" key={a.id}><div className="date-chip"><strong>{formatDate(a.date)}</strong><span>{a.time}</span></div><div className="row-main"><strong>{patient?.name}</strong><span>{a.service}</span></div><Status value={a.status} /><WhatsAppButton patient={patient} appointment={a} compact /></div> })}</div>
      </article>
      <article className="panel weekly"><div className="panel-title"><div><Sparkles /><h2>Visão da semana</h2></div><span className="soft-badge">Esta semana</span></div>
        <div className="bars">{[['Seg',2],['Ter',3],['Qua',4],['Qui',2],['Sex',3],['Sáb',1]].map(([d,v]) => <div key={d}><span style={{height:`${v*32}px`}} /><small>{d}</small></div>)}</div>
        <div className="weekly-footer"><div><small>Total</small><strong>{data.appointments.length}</strong></div><div><small>Confirmadas</small><strong>{confirmed}</strong></div><div><small>A confirmar</small><strong>{pending}</strong></div></div>
      </article>
    </div>
    <blockquote><Sparkles /> “Cuidar é abrir caminhos para o bem-estar do corpo, da mente e da alma.”</blockquote>
  </>
}

function AppointmentModal({ data, appointment, onClose, onSave }) {
  const firstService = data.services.find(service => service.active) || data.services[0]
  const initial = appointment || { patientId: data.patients[0]?.id || '', serviceId: firstService?.id || '', date: todayISO, time: '09:00', duration: firstService?.duration || 60, service: firstService?.name || '', price: firstService?.price || 0, status: 'pending', notes: '' }
  const [form, setForm] = useState(initial)
  const field = (key) => ({ value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) })
  const chooseService = (serviceId) => { const service = data.services.find(item => item.id === serviceId); if (service) setForm({ ...form, serviceId, service: service.name, price: service.price, duration: service.duration }) }
  return <div className="modal-layer" role="dialog" aria-modal="true"><form className="modal" onSubmit={(e) => { e.preventDefault(); onSave({ ...form, id: form.id || crypto.randomUUID(), duration: Number(form.duration), price: Number(form.price) }) }}>
    <div className="modal-header"><div><p className="eyebrow">AGENDA</p><h2>{appointment ? 'Editar consulta' : 'Novo agendamento'}</h2></div><button type="button" onClick={onClose}><X /></button></div>
    <div className="form-grid"><label className="span-2">Paciente<select {...field('patientId')}>{data.patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="span-2">Serviço<select value={form.serviceId} onChange={e=>chooseService(e.target.value)}>{data.services.filter(s=>s.active || s.id===form.serviceId).map(s => <option value={s.id} key={s.id}>{s.name} · {s.duration} min · {formatCurrency(s.price)}</option>)}</select></label><label>Data<input type="date" {...field('date')} /></label><label>Horário inicial<input type="time" {...field('time')} /></label><label>Duração deste atendimento<input type="number" min="15" step="15" {...field('duration')} /><small className="field-hint">Término previsto: {endTime(form.time, form.duration)}</small></label><label>Valor deste atendimento<input type="number" min="0" step="0.01" {...field('price')} /><small className="field-hint">Pode ser alterado para aplicar desconto.</small></label><label className="span-2">Status<select {...field('status')}>{Object.entries(statusMap).map(([id,s]) => <option key={id} value={id}>{s.label}</option>)}</select></label><label className="span-2">Observações<textarea rows="3" {...field('notes')} /></label></div>
    <div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">Salvar agendamento</button></div>
  </form></div>
}

function Agenda({ data, onEdit, openNew, setData }) {
  const days = ['2026-07-20','2026-07-21','2026-07-22','2026-07-23','2026-07-24','2026-07-25']
  const [selectedId, setSelectedId] = useState(data.appointments.find(a => a.date === '2026-07-23')?.id || data.appointments[0]?.id)
  const selected = data.appointments.find(a => a.id === selectedId)
  const patient = selected && getPatient(data, selected.patientId)
  const deleteSelected = () => { if (!selected || !confirm('Deseja excluir esta consulta?')) return; setData(d => ({...d, appointments:d.appointments.filter(a => a.id !== selected.id)})); setSelectedId(null) }
  return <>
    <PageHeader eyebrow="ORGANIZAÇÃO DA ROTINA" title="Agenda" subtitle="Organize seus horários e atendimentos." action={<button className="primary-button" onClick={openNew}><Plus /> Novo agendamento</button>} />
    <div className="agenda-toolbar"><div><button><ChevronLeft /></button><button className="today-button">Hoje</button><button><ChevronRight /></button></div><strong>20 a 25 de julho de 2026</strong><div className="view-switch"><button className="active">Semana</button><button>Mês</button></div></div>
    <div className="agenda-layout"><div className="calendar-wrap"><div className="calendar-grid"><div className="calendar-corner" />{days.map((d,i)=><div key={d} className={`day-head ${d===todayISO?'today':''}`}><span>{['Seg','Ter','Qua','Qui','Sex','Sáb'][i]}</span><strong>{d.slice(-2)}</strong></div>)}
      {['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00'].map(time => <div className="calendar-row" key={time}><div className="time-label">{time}</div>{days.map(day => <div className="calendar-cell" key={day}>{data.appointments.filter(a=>a.date===day && a.time.slice(0,2)===time.slice(0,2)).map(a=>{const p=getPatient(data,a.patientId);return <button key={a.id} className={`calendar-event ${a.status} ${selectedId===a.id?'selected':''}`} onClick={()=>setSelectedId(a.id)}><strong>{p?.name}</strong><span>{a.service}</span></button>})}</div>)}</div>)}</div></div>
      <aside className="detail-panel">{selected ? <><p className="eyebrow">DETALHES DA CONSULTA</p><div className="detail-person"><div className="avatar large">{patient?.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><h2>{patient?.name}</h2><span>{patient?.phone}</span></div></div><div className="detail-info"><p><CalendarDays /> {formatDate(selected.date)}, {selected.time}–{endTime(selected.time, selected.duration)}</p><p><Clock3 /> {selected.duration} minutos</p><p><Sparkles /> {selected.service}</p><p><strong>{formatCurrency(selected.price)}</strong></p><Status value={selected.status} />{selected.notes && <div className="note">{selected.notes}</div>}</div><WhatsAppButton patient={patient} appointment={selected} /><button className="secondary-button wide" onClick={()=>onEdit(selected)}><Pencil /> Editar</button><button className="danger-button wide" onClick={deleteSelected}><Trash2 /> Excluir consulta</button></> : <div className="empty-state"><CalendarDays /><h3>Selecione uma consulta</h3><p>Os detalhes aparecerão aqui.</p></div>}</aside>
    </div>
  </>
}

function Patients({ data, setData }) {
  const [search, setSearch] = useState(''); const [showForm,setShowForm]=useState(false)
  const [form,setForm]=useState({name:'',phone:'',email:'',notes:''})
  const filtered=data.patients.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()))
  const save=(e)=>{e.preventDefault();setData(d=>({...d,patients:[...d.patients,{...form,id:crypto.randomUUID()}]}));setForm({name:'',phone:'',email:'',notes:''});setShowForm(false)}
  return <><PageHeader eyebrow="RELACIONAMENTO" title="Pacientes" subtitle="Cadastros e histórico de atendimentos." action={<button className="primary-button" onClick={()=>setShowForm(true)}><Plus /> Novo paciente</button>} />
    <div className="search-box"><Search /><input placeholder="Buscar paciente..." value={search} onChange={e=>setSearch(e.target.value)} /></div>
    <div className="patient-grid">{filtered.map(p=>{const count=data.appointments.filter(a=>a.patientId===p.id).length;return <article className="patient-card" key={p.id}><div className="patient-top"><div className="avatar large">{p.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><h3>{p.name}</h3><span>{p.phone}</span></div></div><p>{p.email}</p><div className="patient-meta"><span>{count} atendimentos</span><a href={`https://wa.me/${p.phone}`} target="_blank"><MessageCircle /> WhatsApp</a></div>{p.notes&&<small className="patient-note">{p.notes}</small>}</article>})}</div>
    {showForm&&<div className="modal-layer"><form className="modal small" onSubmit={save}><div className="modal-header"><div><p className="eyebrow">CADASTRO</p><h2>Novo paciente</h2></div><button type="button" onClick={()=>setShowForm(false)}><X /></button></div><div className="form-grid"><label className="span-2">Nome<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Telefone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label><label>E-mail<input value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label className="span-2">Observações<textarea rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowForm(false)}>Cancelar</button><button className="primary-button">Salvar paciente</button></div></form></div>}
  </>
}

function Services({ data, setData }) {
  const empty = { name: '', price: '', duration: 60, active: true }
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const openForm = (service = null) => { setEditing(service?.id || 'new'); setForm(service ? { ...service } : empty) }
  const closeForm = () => { setEditing(null); setForm(empty) }
  const save = (event) => {
    event.preventDefault()
    const service = { ...form, id: editing === 'new' ? crypto.randomUUID() : editing, price: Number(form.price), duration: Number(form.duration), active: form.active !== false }
    setData(current => ({ ...current, services: editing === 'new' ? [...current.services, service] : current.services.map(item => item.id === editing ? service : item) }))
    closeForm()
  }
  const toggle = (id) => setData(current => ({ ...current, services: current.services.map(service => service.id === id ? { ...service, active: !service.active } : service) }))
  const remove = (id) => {
    const inUse = data.appointments.some(appointment => appointment.serviceId === id)
    if (inUse) return alert('Este serviço possui atendimentos vinculados. Você pode desativá-lo, mas não excluí-lo.')
    if (confirm('Deseja excluir este serviço?')) setData(current => ({ ...current, services: current.services.filter(service => service.id !== id) }))
  }
  return <><PageHeader eyebrow="CATÁLOGO" title="Serviços" subtitle="Defina valores e duração padrão para agilizar seus agendamentos." action={<button className="primary-button" onClick={()=>openForm()}><Plus /> Novo serviço</button>} />
    <div className="service-grid">{data.services.map(service=><article className={`service-card ${service.active?'':'inactive'}`} key={service.id}><div className="service-card-top"><div className="service-icon"><Sparkles /></div><span className={`service-state ${service.active?'active':'inactive'}`}>{service.active?'Ativo':'Inativo'}</span></div><h3>{service.name}</h3><div className="service-facts"><div><small>Valor padrão</small><strong>{formatCurrency(service.price)}</strong></div><div><small>Duração padrão</small><strong>{service.duration} min</strong></div></div><div className="service-actions"><button className="secondary-button" onClick={()=>openForm(service)}><Pencil /> Editar</button><button className="text-button" onClick={()=>toggle(service.id)}>{service.active?'Desativar':'Ativar'}</button><button className="icon-danger" onClick={()=>remove(service.id)} aria-label={`Excluir ${service.name}`}><Trash2 /></button></div></article>)}</div>
    {editing&&<div className="modal-layer" role="dialog" aria-modal="true"><form className="modal small" onSubmit={save}><div className="modal-header"><div><p className="eyebrow">SERVIÇO</p><h2>{editing==='new'?'Novo serviço':'Editar serviço'}</h2></div><button type="button" onClick={closeForm}><X /></button></div><div className="form-grid"><label className="span-2">Nome do serviço<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Valor padrão (R$)<input type="number" min="0" step="0.01" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></label><label>Duração padrão<input type="number" min="15" step="15" required value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/><small className="field-hint">Em minutos.</small></label><label className="check span-2"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})}/> Disponível para novos agendamentos</label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={closeForm}>Cancelar</button><button className="primary-button">Salvar serviço</button></div></form></div>}
  </>
}

function Appointments({ data, setData, onEdit, openNew }) {
  const [filter,setFilter]=useState('all')
  const list=[...data.appointments].sort((a,b)=>`${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).filter(a=>filter==='all'||a.status===filter)
  const updateStatus=(id,status)=>setData(d=>({...d,appointments:d.appointments.map(a=>a.id===id?{...a,status}:a)}))
  return <><PageHeader eyebrow="ACOMPANHAMENTO" title="Atendimentos" subtitle="Consulte e atualize o histórico das consultas." action={<button className="primary-button" onClick={openNew}><Plus /> Nova consulta</button>} />
    <div className="filter-tabs">{[['all','Todos'],...Object.entries(statusMap).map(([k,v])=>[k,v.label])].map(([k,l])=><button className={filter===k?'active':''} onClick={()=>setFilter(k)} key={k}>{l}</button>)}</div>
    <div className="table-wrap"><table><thead><tr><th>Paciente</th><th>Data e período</th><th>Serviço</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>{list.map(a=>{const p=getPatient(data,a.patientId);return <tr key={a.id}><td><strong>{p?.name}</strong><small>{p?.phone}</small></td><td>{formatDate(a.date)}<small>{a.time}–{endTime(a.time,a.duration)} · {a.duration} min</small></td><td>{a.service}</td><td><strong>{formatCurrency(a.price)}</strong></td><td><select className={`status-select ${a.status}`} value={a.status} onChange={e=>updateStatus(a.id,e.target.value)}>{Object.entries(statusMap).map(([k,v])=><option value={k} key={k}>{v.label}</option>)}</select></td><td><div className="table-actions"><WhatsAppButton patient={p} appointment={a} compact/><button onClick={()=>onEdit(a)}><Pencil /></button></div></td></tr>})}</tbody></table></div>
  </>
}

function SettingsPage({ resetData }) { return <><PageHeader eyebrow="PREFERÊNCIAS" title="Configurações" subtitle="Ajustes disponíveis nesta versão demonstrativa." /><div className="settings-grid"><article className="panel"><h2>Dados da demonstração</h2><p className="muted">Restaure pacientes e consultas originais. As alterações atuais serão substituídas.</p><button className="secondary-button" onClick={resetData}><RefreshCcw /> Restaurar dados iniciais</button></article><article className="panel"><h2>Sobre esta versão</h2><p className="muted">Protótipo local com login visual e persistência no navegador. Não há servidor ou autenticação real.</p><span className="version">Versão 0.1 · Apresentação</span></article></div></> }

export default function App() {
  const [logged, setLogged] = useState(() => sessionStorage.getItem('fabio-demo-login') === 'true')
  const [page, setPage] = useState('home'); const [data,setData]=usePersistentData(); const [modal,setModal]=useState(null)
  const enter=()=>{sessionStorage.setItem('fabio-demo-login','true');setLogged(true)}
  const logout=()=>{sessionStorage.removeItem('fabio-demo-login');setLogged(false)}
  const saveAppointment=(item)=>{setData(d=>({...d,appointments:d.appointments.some(a=>a.id===item.id)?d.appointments.map(a=>a.id===item.id?item:a):[...d.appointments,item]}));setModal(null)}
  const resetData=()=>{if(confirm('Restaurar todos os dados da demonstração?'))setData(cloneSeed())}
  if(!logged)return <Login onEnter={enter}/>
  const content={home:<Dashboard data={data} openNew={()=>setModal('new')} goAgenda={()=>setPage('agenda')}/>,agenda:<Agenda data={data} setData={setData} openNew={()=>setModal('new')} onEdit={a=>setModal(a)}/>,patients:<Patients data={data} setData={setData}/>,services:<Services data={data} setData={setData}/>,appointments:<Appointments data={data} setData={setData} openNew={()=>setModal('new')} onEdit={a=>setModal(a)}/>,settings:<SettingsPage resetData={resetData}/>}[page]
  return <Shell page={page} setPage={setPage} onLogout={logout}>{content}{modal&&<AppointmentModal data={data} appointment={modal==='new'?null:modal} onClose={()=>setModal(null)} onSave={saveAppointment}/>}</Shell>
}
