import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DeudasView from './pages/DeudasView';
import './pages/DeudasView.css';
import { getGroups, createGroup, getGroupByInviteCode, getGroupMembers, joinGroup, getExpenses, createExpense, getGroupBalances, settlePayment } from './services/api';
import GroupBalance from './components/GroupBalance';
import Logo from '../src/public/LogoDos.svg';
import InicioAvatar from '../src/public/Inicio.svg';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';

const formatDate = (value) => {
  if (!value) return 'Hoy';
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const MAX_GROUP_MEMBERS = 8;

function EmptyGroupsIllustration() {
  return (
    <div className="empty-illustration" aria-hidden="true">
      <span className="empty-illustration-orbit orbit-one" />
      <span className="empty-illustration-orbit orbit-two" />
      <div className="empty-illustration-stack">
        <span className="stack-line line-one" />
        <span className="stack-line line-two" />
        <span className="stack-line line-three" />
      </div>
    </div>
  );
}

function InviteQr({ value }) {
  return (
    <div className="invite-qr" role="img" aria-label={`Código QR para ${value}`}>
      <QRCodeSVG value={value} size={192} bgColor="#ffffff" fgColor="#1d2a55" level="M" includeMargin />
    </div>
  );
}

function DeudasTab({ groupId, groupName, refreshKey }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const summary = await getGroupBalances(groupId);
      const nextDebts = (summary.debts || []).map((debt, index) => ({
        ...debt,
        id: `${debt.debtor}-${debt.creditor}-${index}`,
        creditorName: debt.creditor,
        status: 'PENDING',
      }));
      setDebts(nextDebts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebts();
  }, [groupId, refreshKey]);

  const handleMarkAsPaid = async (debt) => {
    await settlePayment(groupId, debt);
    await loadDebts();
  };

  if (loading) return <div className="card p-4">Cargando deudas...</div>;

  return <DeudasView groupName={groupName} debts={debts} onMarkAsPaid={handleMarkAsPaid} />;
}

function HomeView() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [participants, setParticipants] = useState(['Vanessa Gamarra', 'Tú']);
  const [participantInput, setParticipantInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('splitflow.userId');
    const currentUserId = storedUserId || crypto.randomUUID();
    if (!storedUserId) localStorage.setItem('splitflow.userId', currentUserId);
    setUserId(currentUserId);

    const storedGroups = JSON.parse(localStorage.getItem('splitflow.groups') || '[]');
    if (storedGroups.length > 0) {
      setGroups(storedGroups);
      return;
    }

    getGroups()
      .then((remoteGroups) => {
        const mergedGroups = remoteGroups.map((group) => ({ ...group, aliases: group.aliases || [] }));
        setGroups(mergedGroups);
        localStorage.setItem('splitflow.groups', JSON.stringify(mergedGroups));
      })
      .catch(() => {});
  }, []);

  const persistGroups = (nextGroups) => {
    setGroups(nextGroups);
    localStorage.setItem('splitflow.groups', JSON.stringify(nextGroups));
  };

  const resetGroups = () => {
    localStorage.removeItem('splitflow.groups');
    setGroups([]);
    setShowCreateForm(true);
  };

  const addParticipant = () => {
    const cleanName = participantInput.trim();
    if (!cleanName || participants.includes(cleanName)) {
      return;
    }
    setParticipants((currentParticipants) => [...currentParticipants, cleanName]);
    setParticipantInput('');
  };

  const removeParticipant = (nameToRemove) => {
    setParticipants((currentParticipants) => currentParticipants.filter((name) => name !== nameToRemove));
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    const cleanName = groupName.trim();
    if (!cleanName) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    const normalizedParticipants = [...new Set(participants.filter(Boolean))];

    try {
      const createdGroup = await createGroup({
        name: cleanName,
        currency,
        aliases: normalizedParticipants,
        ownerId: userId,
      });

      const nextGroup = {
        ...createdGroup,
        aliases: normalizedParticipants,
        ownerId: userId,
      };

      persistGroups([...groups, nextGroup]);
      setGroupName('');
      setParticipants(['Vanessa Gamarra', 'Tú']);
      setShowCreateForm(false);
      setError('');
      navigate(`/group/${createdGroup.id}`);
    } catch {
      setError('No pudimos crear el grupo. Revisa que el backend esté activo e intenta de nuevo.');
    }
  };

  const showForm = showCreateForm;

  return (
    <main className="splitflow-home-shell">
      {!showForm && groups.length === 0 && (
        <section className="splitflow-empty-state" aria-label="No hay grupos creados">
          <header className="splitflow-header">
          </header>

          <div className="splitflow-empty-card">
            <img src={Logo} alt="SplitFlow" className="splitflow-logo" />
            <h1 className="splitflow-title">Creá tu primer grupo</h1>
            <p className="splitflow-subtitle">Registra gastos compartidos y entérate al instante quién le debe a quién</p>
            <img src={InicioAvatar} alt="Ilustración de inicio" className="splitflow-Inicio" />
            <button type="button" className="splitflow-primary-button" onClick={() => setShowCreateForm(true)}>
              Crear mi primer grupo →
            </button>
            <p>¿Tienes un código de invitación?<a className="splitflow-link-button" href="/#"> Únete a un grupo</a></p>
            <button type="button" className="splitflow-reset-button" onClick={resetGroups}>
              Borrar grupos guardados
            </button>
          </div>
        </section>
      )}

      {!showForm && groups.length > 0 && (
        <section className="splitflow-home-list" aria-label="Listado de grupos">
          <header className="splitflow-home-list__header">
            <img src={Logo} alt="SplitFlow" className="splitflow-logo" />
            <div className="splitflow-avatar small">VG</div>
          </header>

          <div className="splitflow-home-list__content">
            <h2 className="splitflow-section-title">Tus grupos</h2>

            <div className="splitflow-group-list">
              {groups.map((group) => (
                <button
                  type="button"
                  key={group.id}
                  className="splitflow-group-card"
                  onClick={() => navigate(`/group/${group.id}`)}
                >
                  <div className="splitflow-group-card__avatars" aria-hidden="true">
                    <span className="splitflow-mini-avatar"></span>
                  </div>
                  <div className="splitflow-group-card__info">
                    <strong>{group.name}</strong>
                    <span>{(group.aliases?.length || 0)} miembros</span>
                  </div>
                  <div className="splitflow-group-card__meta">
                    <span className="splitflow-group-card__amount">$0</span>
                    <span className="splitflow-group-card__action">›</span>
                  </div>
                </button>
              ))}
            </div>

            <button type="button" className="splitflow-primary-button full-width" onClick={() => setShowCreateForm(true)}>
              Nuevo grupo +
            </button>
            <p>¿Tienes un código de invitación?<a className="splitflow-link-button" href="/#"> Únete a un grupo</a></p>
            <button type="button" className="splitflow-reset-button full-width" onClick={resetGroups}>
              Borrar grupos guardados
            </button>
          </div>
        </section>
      )}

      {showForm && (
        <section className="splitflow-create-form" aria-label="Formulario para crear un grupo">
          <header className="splitflow-create-form__header">
            <button type="button" className="splitflow-back-button" onClick={() => setShowCreateForm(false)} aria-label="Volver">
              ←
            </button>
            <h2>Crear grupo</h2>
          </header>

          <form onSubmit={handleCreateGroup} className="splitflow-create-form__body">
            <div className="splitflow-field">
              <label htmlFor="group-name">Nombre del grupo</label>
              <input
                id="group-name"
                type="text"
                maxLength={60}
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="Ej. Familia, Cumpleaños, Camilo"
                autoFocus
              />
              <span className="splitflow-counter">{groupName.length}/60</span>
            </div>

            <div className="splitflow-field">
              <label htmlFor="group-currency">Moneda</label>
              <select id="group-currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
                <option value="COP">COP — Peso Colombiano</option>
                <option value="USD">USD — Dólar estadounidense</option>
                <option value="ARS">ARS — Peso argentino</option>
                <option value="CLP">CLP — Peso chileno</option>
              </select>
            </div>

            <div className="splitflow-field splitflow-field--participants">
              <label>Participantes (Opcional)</label>
              <p>Agrega los nombres de tus amigos o familiares.</p>
              <p>Cada uno podrá elegir el suyo cuando los invites.</p>

              <div className="splitflow-participants-list">
                {participants.map((participant) => (
                  <div key={participant} className="splitflow-participant-chip">
                    <span>{participant}</span>
                    {participant !== 'Tú' && (
                      <button type="button" onClick={() => removeParticipant(participant)} aria-label={`Quitar ${participant}`}>
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="splitflow-add-participant">
                <input
                  type="text"
                  value={participantInput}
                  onChange={(event) => setParticipantInput(event.target.value)}
                  placeholder="Nombre del participante"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addParticipant();
                    }
                  }}
                />
                <button type="button" onClick={addParticipant}>Agregar</button>
              </div>
            </div>

            {error && <p className="splitflow-error" role="alert">{error}</p>}

            <button type="submit" className="splitflow-primary-button full-width form-submit" disabled={!groupName.trim()}>
              Crear grupo →
            </button>
          </form>
        </section>
      )}
    </main>
  );
}

function GroupView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [groupName, setGroupName] = useState(`Grupo #${id}`);
  const [aliases, setAliases] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [memberError, setMemberError] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [balanceRefreshKey, setBalanceRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('Gastos');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitMethod, setSplitMethod] = useState('EQUAL');
  const [allocations, setAllocations] = useState({});

  const loadData = async () => {
    try {
      const membersData = await getGroupMembers(id);
      setMembers(membersData);
      const activeAliases = membersData.filter((member) => member.active).map((member) => member.alias);
      setSelectedParticipants(activeAliases);
      setPaidBy((currentPaidBy) => currentPaidBy || activeAliases[0] || '');
      const expensesData = await getExpenses(id);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    }
  };

  useEffect(() => {
    const localGroup = JSON.parse(localStorage.getItem('splitflow.groups') || '[]').find((group) => String(group.id) === String(id));
    if (localGroup) {
      setGroupName(localGroup.name);
      setAliases(localGroup.aliases || []);
      setInviteCode(localGroup.inviteCode || '');
    }
    loadData();
  }, [id]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const alias = username.trim();
    if (!alias) {
      setMemberError('Debes ingresar un nombre');
      return;
    }

    setIsAddingMember(true);
    setMemberError('');
    try {
      const deviceId = localStorage.getItem('splitflow.userId') || crypto.randomUUID();
      localStorage.setItem('splitflow.userId', deviceId);
      const createdMember = await joinGroup(id, { alias, deviceId, email: email.trim() });
      setMembers((currentMembers) => {
        const alreadyPresent = currentMembers.some((member) => member.id === createdMember.id);
        return alreadyPresent
          ? currentMembers.map((member) => member.id === createdMember.id ? createdMember : member)
          : [...currentMembers, createdMember];
      });
      setSelectedParticipants((currentParticipants) => currentParticipants.includes(createdMember.alias)
        ? currentParticipants
        : [...currentParticipants, createdMember.alias]);
      setPaidBy((currentPaidBy) => currentPaidBy || createdMember.alias);
      setUsername('');
      setEmail('');
    } catch (error) {
      setMemberError(error.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return setInviteMessage('La descripcion es obligatoria');
    if (!amount || parseFloat(amount) <= 0) return setInviteMessage('El monto debe ser mayor a $0');
    if (selectedParticipants.length === 0) return setInviteMessage('Debes seleccionar al menos un participante');
    const totalAssigned = selectedParticipants.reduce((sum, participant) => sum + (parseFloat(allocations[participant]) || 0), 0);
    if (splitMethod === 'BY_AMOUNT' && Math.abs(totalAssigned - parseFloat(amount)) > 0.01) {
      return setInviteMessage(`$${Math.abs(parseFloat(amount) - totalAssigned).toFixed(2)} sin asignar`);
    }
    try {
      await createExpense(id, { description: description.trim(), amount: parseFloat(amount), paidBy, expenseDate, participants: selectedParticipants, splitMethod, allocations });
      setDescription('');
      setAmount('');
      setPaidBy('');
      setAllocations({});
      setInviteMessage('');
      loadData();
      setBalanceRefreshKey((currentKey) => currentKey + 1);
    } catch (error) {
      setInviteMessage(error.message);
    }
  };

  const toggleParticipant = (alias) => {
    setSelectedParticipants((current) => current.includes(alias)
      ? current.filter((participant) => participant !== alias)
      : [...current, alias]);
  };

  const assignedAmount = selectedParticipants.reduce((sum, participant) => sum + (parseFloat(allocations[participant]) || 0), 0);
  const amountDifference = parseFloat(amount || 0) - assignedAmount;
  const equalShare = selectedParticipants.length > 0 && amount
    ? (Math.floor((parseFloat(amount) * 100) / selectedParticipants.length) / 100).toFixed(2)
    : '0.00';

  const shareInvite = async () => {
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    await navigator.clipboard?.writeText(inviteUrl);
    setInviteMessage(`Enlace copiado: ${inviteUrl}`);
  };

  return (
    <main className="container mt-4 mb-5 splitflow-shell">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3 flex-wrap">
        <button className="ghost-button" onClick={() => navigate('/')} type="button">← Volver a Grupos</button>
        <h2 className="text-primary m-0 fw-bold">{groupName}</h2>
        {inviteCode && <button className="secondary-button" onClick={shareInvite} type="button">Compartir invitación</button>}
      </div>

      <nav className="group-tabs mb-4" aria-label="Navegación del grupo">
        {['Gastos', 'Saldos', 'Deudas'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'group-tab active' : 'group-tab'} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined} type="button">
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Gastos' && (
        <div className="row g-4">
          <div className="col-lg-5">
            <div className="card p-4 mb-4">
              <p className="text-uppercase fw-bold text-secondary mb-2" style={{ letterSpacing: '0.08em' }}>Participantes</p>
              <h3 className="h4 mb-3">Registrar participante</h3>
              <form onSubmit={handleUserSubmit}>
                <div className="field-group">
                  <label className="field-label">Nombre</label>
                  <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                {memberError && <p className="text-danger small" role="alert">{memberError}</p>}
                <button type="submit" className="primary-button w-100" disabled={isAddingMember || !username.trim()}>
                  {isAddingMember ? 'Guardando...' : 'Guardar participante'}
                </button>
              </form>
            </div>

            <div className="card p-4">
              <p className="text-uppercase fw-bold text-secondary mb-2" style={{ letterSpacing: '0.08em' }}>Miembros</p>
              <div className="d-grid gap-2">
                {members.map((member) => (
                  <div key={member.id} className="d-flex justify-content-between align-items-center gap-2 p-2 border rounded-3">
                    <span className="d-flex align-items-center gap-2"><span className={`avatar ${member.active ? '' : 'avatar-muted'}`}>{initials(member.alias)}</span><strong>{member.alias}</strong></span>
                    <span className={`status-pill ${member.active ? 'status-active' : 'status-pending'}`}>{member.active ? 'Activo' : 'Sin reclamar'}</span>
                  </div>
                ))}
                {members.length === 0 && aliases.map((alias) => (
                  <div key={alias} className="d-flex justify-content-between align-items-center gap-2 p-2 border rounded-3">
                    <span className="d-flex align-items-center gap-2"><span className="avatar avatar-muted">{initials(alias)}</span><strong>{alias}</strong></span><span className="status-pill status-pending">Sin reclamar</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="card p-4 mb-4">
              <p className="text-uppercase fw-bold text-secondary mb-2" style={{ letterSpacing: '0.08em' }}>SF-3</p>
              <h3 className="h4 mb-3">Registrar un gasto</h3>
              <form onSubmit={handleExpenseSubmit}>
                <div className="field-group">
                  <label className="field-label">Denominación</label>
                  <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. Mercado de la semana" required />
                </div>

                <div className="field-row">
                  <div className="field-group">
                    <label className="field-label">Monto</label>
                    <input type="number" step="0.01" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Fecha</label>
                    <input type="date" className="form-control" value={expenseDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setExpenseDate(e.target.value)} />
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">¿Quién pagó?</label>
                  <select className="form-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
                    <option value="">Seleccionar participante...</option>
                    {members.filter((member) => member.active).map((member) => (
                      <option key={member.id} value={member.alias}>{member.alias}</option>
                    ))}
                  </select>
                </div>

                <fieldset className="field-group mb-3">
                  <legend className="field-label">¿Quiénes participaron?</legend>
                  <div className="chip-list">
                    {members.filter((member) => member.active).map((member) => (
                      <label key={member.id} className="member-chip" style={{ cursor: 'pointer' }}>
                        <input className="form-check-input me-2" type="checkbox" checked={selectedParticipants.includes(member.alias)} onChange={() => toggleParticipant(member.alias)} />
                        {member.alias}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="field-group">
                  <span className="field-label d-block">Método de división</span>
                  <div className="segmented-control" role="radiogroup" aria-label="Método de división">
                    <label><input type="radio" name="split-method" value="EQUAL" checked={splitMethod === 'EQUAL'} onChange={(event) => setSplitMethod(event.target.value)} />Partes iguales</label>
                    <label><input type="radio" name="split-method" value="BY_AMOUNT" checked={splitMethod === 'BY_AMOUNT'} onChange={(event) => setSplitMethod(event.target.value)} />Por monto</label>
                  </div>
                </div>

                {splitMethod === 'EQUAL' && <p className="form-note">{selectedParticipants.length} participantes · ${equalShare} por persona</p>}
                {splitMethod === 'BY_AMOUNT' && (
                  <div className="field-group">
                    {selectedParticipants.map((participant) => (
                      <div className="input-group mb-2" key={participant}>
                        <span className="input-group-text">{participant}</span>
                        <input aria-label={`Monto de ${participant}`} className="form-control" type="number" min="0" step="0.01" value={allocations[participant] || ''} onChange={(event) => setAllocations({ ...allocations, [participant]: event.target.value })} />
                      </div>
                    ))}
                    <p className={Math.abs(amountDifference) <= 0.01 ? 'text-success small mb-0' : 'text-danger small mb-0'}>
                      {Math.abs(amountDifference) <= 0.01 ? '$0.00 sin asignar' : `$${Math.abs(amountDifference).toFixed(2)} sin asignar`}
                    </p>
                  </div>
                )}
                <button type="submit" className="primary-button w-100 mt-2" disabled={selectedParticipants.length === 0 || (splitMethod === 'BY_AMOUNT' && Math.abs(amountDifference) > 0.01)}>Registrar gasto</button>
              </form>
            </div>

            <div className="card p-4">
              <p className="text-uppercase fw-bold text-secondary mb-2" style={{ letterSpacing: '0.08em' }}>Historial</p>
              <h3 className="h4 mb-3">Gastos registrados</h3>
              {inviteMessage && <p className="text-danger" role="alert">{inviteMessage}</p>}
              {expenses.length === 0 ? (
                <div className="text-center text-secondary py-4">Este grupo todavía no tiene gastos.<br />Registra el primer gasto.</div>
              ) : (
                <div className="d-grid gap-2">
                  {expenses.map((ex) => (
                    <div key={ex.id} className="expense-tile d-flex justify-content-between align-items-center gap-3">
                      <div className="d-flex align-items-center gap-2">
                        <span className="avatar">{initials(ex.paidBy)}</span>
                        <div>
                          <strong>{ex.description}</strong><br />
                          <small className="expense-date">{ex.paidBy} · {formatDate(ex.expenseDate)}</small>
                        </div>
                      </div>
                      <strong className="amount-negative text-nowrap">${Number(ex.amount).toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'Saldos' || activeTab === 'Deudas') && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card p-4">
              {activeTab === 'Deudas' ? <DeudasTab groupId={parseInt(id, 10)} groupName={groupName} refreshKey={balanceRefreshKey} /> : <GroupBalance groupId={parseInt(id, 10)} refreshKey={balanceRefreshKey} view="saldos" />}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function JoinGroupView() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableAliases, setAvailableAliases] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroupByInviteCode(inviteCode)
      .then((groupData) => getGroupMembers(groupData.id).then((members) => [groupData, members]))
      .then(([groupData, members]) => {
        setGroup(groupData);
        setGroupMembers(members);
        setAvailableAliases(members.filter((member) => !member.active));
      })
      .catch(() => setError('No encontramos este grupo o el enlace ya no es válido.'))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  const handleJoin = async (event) => {
    event.preventDefault();
    const alias = selectedAlias || customAlias.trim();
    if (!alias) {
      setError('Debes ingresar un nombre para unirte');
      return;
    }
    try {
      const deviceId = localStorage.getItem('splitflow.userId') || crypto.randomUUID();
      localStorage.setItem('splitflow.userId', deviceId);
      await joinGroup(group.id, { alias, deviceId });
      navigate(`/group/${group.id}`);
    } catch (joinError) {
      setError(joinError.message);
    }
  };

  if (loading) return <main className="container py-5"><p>Cargando invitación...</p></main>;
  if (!group) return <main className="container py-5"><p className="text-danger">{error}</p></main>;

  const hasPendingAliases = availableAliases.length > 0;
  const isGroupFull = groupMembers.length >= MAX_GROUP_MEMBERS && !hasPendingAliases;
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
  const shareInvite = async () => {
    await navigator.clipboard?.writeText(inviteUrl);
    setError('Enlace copiado.');
  };

  return (
    <main className="container py-5 join-shell">
      <section className="invite-layout">
        <div className="invite-hero-panel">
          <p className="eyebrow text-uppercase fw-bold mb-3">Invitación a SplitFlow</p>
          <h1 className="display-6 fw-bold">Únete a {group.name}</h1>
          <p className="text-secondary">Escanea el código o comparte este enlace con tu grupo.</p>
          <button className="secondary-button" type="button" onClick={shareInvite}>Compartir enlace</button>
        </div>
        <div className="card invite-qr-card">
          <InviteQr value={inviteUrl} />
          <span className="form-note">Código de invitación</span>
          <strong className="invite-code">{inviteCode}</strong>
        </div>
      </section>

      <section className="card identity-card">
        <p className="eyebrow text-uppercase fw-bold mb-2">SF-2 · Tu identidad</p>
        <h2 className="h3 mb-2">¿Quién de estos sos tú?</h2>
        <p className="text-secondary mb-4">Elige tu perfil para entrar al grupo.</p>
        {isGroupFull && <div className="capacity-alert" role="alert"><strong>Grupo completo</strong><span>Este grupo alcanzó el límite de {MAX_GROUP_MEMBERS} participantes.</span></div>}
        <form onSubmit={handleJoin}>
          {hasPendingAliases && !isGroupFull ? (
            <div className="identity-grid">
              {availableAliases.map((member) => (
                <label className={`identity-option ${selectedAlias === member.alias ? 'selected' : ''}`} key={member.id}>
                  <input type="radio" name="identity" value={member.alias} checked={selectedAlias === member.alias} onChange={(event) => setSelectedAlias(event.target.value)} />
                  <span className="avatar">{initials(member.alias)}</span>
                  <span><strong>{member.alias}</strong><small>Participante invitado</small></span>
                </label>
              ))}
            </div>
          ) : !isGroupFull ? (
            <input className="form-control mb-3" maxLength={40} value={customAlias} onChange={(event) => setCustomAlias(event.target.value)} placeholder="Ej. Carlos" autoFocus />
          ) : null}
          {error && <p className="text-danger" role="alert">{error}</p>}
          <button className="primary-button w-100" type="submit" disabled={isGroupFull || (!selectedAlias && !customAlias.trim())}>Unirme al grupo</button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/group/:id" element={<GroupView />} />
      <Route path="/join/:inviteCode" element={<JoinGroupView />} />
    </Routes>
  );
}