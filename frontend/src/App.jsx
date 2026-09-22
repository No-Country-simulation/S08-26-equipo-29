import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DeudasView from './pages/DeudasView';
import './pages/DeudasView.css';
import { getGroups, createGroup, getGroupByInviteCode, getGroupMembers, joinGroup, removeMember, getExpenses, createExpense, getGroupBalances, settlePayment } from './services/api';
import GroupBalance from './components/GroupBalance';
import Button from './components/Button';
import Avatar from './components/Avatar';
import GroupCard from './components/GroupCard';
import ParticipantCard from './components/ParticipantCard';
import SegmentedControl from './components/SegmentedControl';
import Logo from '../src/public/LogoDos.svg';
import InicioAvatar from '../src/public/Inicio.svg';
import SinGastos from '../src/public/sinGastos.svg';

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

function ChevronLeftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11.6 3H6a2 2 0 00-2 2v5.6c0 .5.2 1 .6 1.4l8.4 8.4c.8.8 2 .8 2.8 0l5.6-5.6c.8-.8.8-2 0-2.8L12.99 3.6c-.4-.4-.9-.6-1.4-.6z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
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

  const addParticipant = (cleanName) => {
    if (!cleanName || participants.includes(cleanName)) {
      return;
    }
    setParticipants((currentParticipants) => [...currentParticipants, cleanName]);
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
            <Button variant="primary" icon onClick={() => setShowCreateForm(true)}>
              Crear mi primer grupo
            </Button>
            <p>¿Tienes un código de invitación?<a className="splitflow-link-button" href="/#"> Únete a un grupo</a></p>
            <Button variant="ghost" size="small" onClick={resetGroups}>
              Borrar grupos guardados
            </Button>
          </div>
        </section>
      )}

      {!showForm && groups.length > 0 && (
        <section className="splitflow-home-list" aria-label="Listado de grupos">
          <header className="splitflow-home-list__header">
            <img src={Logo} alt="SplitFlow" className="splitflow-logo" />
            <Avatar name="Vanessa Gamarra" size="medium" />
          </header>

          <div className="splitflow-home-list__content">
            <h2 className="splitflow-section-title">Tus grupos</h2>

            <div className="splitflow-group-list">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  name={group.name}
                  members={(group.aliases || []).map((alias, index) => ({ id: index, name: alias }))}
                  onClick={() => navigate(`/group/${group.id}`)}
                />
              ))}
            </div>

            <Button variant="primary" icon className="full-width" onClick={() => setShowCreateForm(true)}>
              Nuevo grupo
            </Button>
            <p>¿Tienes un código de invitación?<a className="splitflow-link-button" href="/#"> Únete a un grupo</a></p>
            <Button variant="ghost" size="small" className="full-width" onClick={resetGroups}>
              Borrar grupos guardados
            </Button>
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

              <ParticipantCard
                participants={participants.map((name) => ({
                  id: name,
                  name,
                  tag: name === 'Tú' ? 'Tú' : undefined,
                  removable: name !== 'Tú',
                }))}
                onRemoveParticipant={removeParticipant}
                onAddParticipant={addParticipant}
              />
            </div>

            {error && <p className="splitflow-error" role="alert">{error}</p>}

            <Button type="submit" variant="primary" icon className="full-width form-submit" disabled={!groupName.trim()}>
              Crear grupo
            </Button>
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
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [expenseView, setExpenseView] = useState('list');
  const [showMembersView, setShowMembersView] = useState(false);
  const [memberActionError, setMemberActionError] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [currency, setCurrency] = useState('COP');

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
      setCurrency(localGroup.currency || 'COP');
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
      setIsAddingParticipant(false);
    } catch (error) {
      setMemberError(error.message);
    } finally {
      setIsAddingMember(false);
    }
  };

  const memberHasActivity = (alias) => expenses.some((expense) => expense.paidBy === alias
    || expense.splits?.some((split) => split.participant === alias));

  const confirmRemoveMember = async () => {
    if (!memberToRemove) return;
    setMemberActionError('');
    try {
      await removeMember(id, memberToRemove.id);
      setMembers((currentMembers) => currentMembers.filter((current) => current.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (error) {
      setMemberActionError(error.message);
      setMemberToRemove(null);
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
      setExpenseView('list');
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

  const myDeviceId = localStorage.getItem('splitflow.userId');
  const myAlias = members.find((member) => member.deviceId === myDeviceId)?.alias;
  const displayName = (alias) => (alias === myAlias ? 'Tú' : alias);

  return (
    <main className="splitflow-home-shell">
      <div className="splitflow-group-view">
      {expenseView !== 'form' && !showMembersView && (
        <>
          <div className="group-header mb-4">
            <button className="group-header__icon-button" onClick={() => navigate('/')} type="button" aria-label="Volver a grupos">
              <ChevronLeftIcon />
            </button>
            <h2 className="group-header__title">{groupName}</h2>
            <button
              className="group-header__icon-button"
              onClick={() => { setActiveTab('Gastos'); setExpenseView('form'); }}
              type="button"
              aria-label="Nuevo gasto"
            >
              <PlusIcon />
            </button>
          </div>

          <SegmentedControl
            className="mb-4"
            options={[
              { value: 'Gastos', label: 'Gastos' },
              { value: 'Saldos', label: 'Saldos' },
              { value: 'Deudas', label: 'Deudas' },
            ]}
            value={activeTab}
            onChange={setActiveTab}
          />
        </>
      )}

      {expenseView === 'form' && (
        <div className="group-header mb-4">
          <button className="group-header__icon-button" onClick={() => setExpenseView('list')} type="button" aria-label="Volver">
            <ChevronLeftIcon />
          </button>
          <h2 className="group-header__title">Nuevo gasto</h2>
          <span className="group-header__icon-button" aria-hidden="true" />
        </div>
      )}

      {showMembersView && (
        <div className="group-header mb-4">
          <button className="group-header__icon-button" onClick={() => setShowMembersView(false)} type="button" aria-label="Volver">
            <ChevronLeftIcon />
          </button>
          <h2 className="group-header__title">Gestionar miembros</h2>
          <span className="group-header__icon-button" aria-hidden="true" />
        </div>
      )}

      <div className="splitflow-group-view__body">
      {showMembersView ? (
        <>
          <Button variant="secondary" size="small" className="full-width" onClick={shareInvite}>+ Invitar</Button>
          {inviteMessage && <p className="text-success small mt-2" role="status">{inviteMessage}</p>}

          <div className="card p-4 mt-4">
            {isAddingParticipant ? (
              <>
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
                  <div className="d-flex gap-2">
                    <button type="submit" className="primary-button w-100" disabled={isAddingMember || !username.trim()}>
                      {isAddingMember ? 'Guardando...' : 'Guardar participante'}
                    </button>
                    <Button type="button" variant="ghost" onClick={() => setIsAddingParticipant(false)}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setIsAddingParticipant(true)}>
                + Registrar participante
              </Button>
            )}
          </div>

          <div className="card p-4 mt-3">
            <p className="text-uppercase fw-bold text-secondary mb-2" style={{ letterSpacing: '0.08em' }}>Miembros</p>
            {memberActionError && <p className="text-danger small" role="alert">{memberActionError}</p>}
            <div className="d-grid gap-2">
              {members.map((member) => {
                const canRemove = member.alias !== myAlias && !memberHasActivity(member.alias);
                return (
                  <div key={member.id} className="d-flex justify-content-between align-items-center gap-2 p-2 border rounded-3">
                    <span className="d-flex align-items-center gap-2">
                      <span className={`avatar ${member.active ? '' : 'avatar-muted'}`}>{initials(displayName(member.alias))}</span>
                      <strong>{displayName(member.alias)}</strong>
                    </span>
                    <span className="d-flex align-items-center gap-2">
                      <span className={`status-pill ${member.active ? 'status-active' : 'status-pending'}`}>{member.active ? 'Activo' : 'Sin reclamar'}</span>
                      {canRemove && (
                        <button
                          type="button"
                          className="group-header__icon-button"
                          style={{ width: 28, height: 28 }}
                          onClick={() => setMemberToRemove(member)}
                          aria-label={`Expulsar a ${displayName(member.alias)}`}
                        >
                          <CloseIcon />
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
              {members.length === 0 && aliases.map((alias) => (
                <div key={alias} className="d-flex justify-content-between align-items-center gap-2 p-2 border rounded-3">
                  <span className="d-flex align-items-center gap-2"><span className="avatar avatar-muted">{initials(alias)}</span><strong>{alias}</strong></span><span className="status-pill status-pending">Sin reclamar</span>
                </div>
              ))}
            </div>
          </div>

          {memberToRemove && (
            <div
              className="payment-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => { if (event.target === event.currentTarget) setMemberToRemove(null); }}
            >
              <section className="payment-modal" role="dialog" aria-modal="true" aria-labelledby="remove-member-title">
                <h2 id="remove-member-title" className="h4">Quitar del grupo</h2>
                <p>¿Confirmas que querés quitar a {displayName(memberToRemove.alias)} del grupo? Esta acción no se puede deshacer.</p>
                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button className="btn btn-light" onClick={() => setMemberToRemove(null)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={confirmRemoveMember}>Quitar</button>
                </div>
              </section>
            </div>
          )}
        </>
      ) : (
      <>
      {activeTab === 'Gastos' && expenseView === 'list' && (
        <>
            <div className="expense-list-header">
              <div className="expense-list-header__avatars">
                {members.filter((member) => member.active).map((member) => (
                  <Avatar
                    key={member.id}
                    name={displayName(member.alias)}
                    size="small"
                    ring="white"
                    className="expense-list-header__avatar"
                  />
                ))}
                <span className="expense-list-header__count">{members.filter((member) => member.active).length} miembros</span>
              </div>
              <Button variant="secondary" size="small" onClick={() => setShowMembersView(true)}>Gestionar miembros</Button>
            </div>

            {inviteMessage && <p className="text-success small mt-2" role="status">{inviteMessage}</p>}

            <div className="expense-list">
              {expenses.length === 0 ? (
                <div className="text-center text-secondary py-4">
                  <img src={SinGastos} alt="Ilustración de gastos" />
                  Este grupo todavía<br /><span className="splitflow-link-button">no tiene gastos</span>
                  <p>Registra el primero y los participantes sabrán cuánto le corresponde a cada uno.</p></div>
              ) : (
                expenses.map((ex) => {
                  const mySplit = ex.splits?.find((split) => split.participant === myAlias);
                  return (
                    <div key={ex.id} className="expense-row">
                      <Avatar name={displayName(ex.paidBy)} size="small" />
                      <div className="expense-row__info">
                        <strong>{ex.description}</strong>
                        <span>Pagó {displayName(ex.paidBy)} · {formatDate(ex.expenseDate)}</span>
                      </div>
                      <div className="expense-row__amounts">
                        <strong>${Number(ex.amount).toFixed(2)}</strong>
                        <span>{mySplit ? `Tu parte $${Number(mySplit.amount).toFixed(2)}` : 'No participaste'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {expenses.length > 0 && (
              <div className="expense-list__total">
                <span>TOTAL DEL GRUPO</span>
                <strong>${expenses.reduce((sum, ex) => sum + Number(ex.amount), 0).toFixed(2)}</strong>
              </div>
            )}
        </>
      )}

      {activeTab === 'Gastos' && expenseView === 'form' && (
            <form onSubmit={handleExpenseSubmit} className="card p-4">
              <div className="expense-form__amount">
                <span className="expense-form__group-badge">
                  <TagIcon />
                  Gastos de <strong>{groupName}</strong>
                </span>
                <span className="expense-form__amount-eyebrow">Monto</span>
                <div className="expense-form__amount-row">
                  <span className="expense-form__currency-tag">{currency}</span>
                  <span className="expense-form__currency-symbol">$</span>
                  <input
                    className="expense-form__amount-input"
                    type="number"
                    step="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Descripción</label>
                <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej. Alojamiento Hotel Melgar" required />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label">Quién pagó</label>
                  <select className="form-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
                    <option value="">Seleccionar participante...</option>
                    {members.filter((member) => member.active).map((member) => (
                      <option key={member.id} value={member.alias}>{displayName(member.alias)}</option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Fecha</label>
                  <input type="date" className="form-control" value={expenseDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setExpenseDate(e.target.value)} />
                </div>
              </div>

              <fieldset className="field-group mb-3">
                <legend className="field-label">¿Quién participa?</legend>
                <div className="expense-participants-list">
                  {members.filter((member) => member.active).map((member) => (
                    <label key={member.id} className={`expense-participant-row ${selectedParticipants.includes(member.alias) ? 'is-selected' : ''}`}>
                      <span className="expense-participant-row__info">
                        <Avatar name={displayName(member.alias)} size="small" />
                        <span>{displayName(member.alias)}</span>
                      </span>
                      <input type="checkbox" checked={selectedParticipants.includes(member.alias)} onChange={() => toggleParticipant(member.alias)} />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="field-group">
                <span className="field-label d-block">¿Cómo lo dividimos?</span>
                <SegmentedControl
                  options={[
                    { value: 'EQUAL', label: 'Partes iguales' },
                    { value: 'BY_AMOUNT', label: 'Por monto' },
                  ]}
                  value={splitMethod}
                  onChange={setSplitMethod}
                />
              </div>

              {splitMethod === 'EQUAL' && <p className="form-note">{selectedParticipants.length} personas · ${equalShare} cada una</p>}
              {splitMethod === 'BY_AMOUNT' && (
                <div className="field-group">
                  {selectedParticipants.map((participant) => (
                    <div className="input-group mb-2" key={participant}>
                      <span className="input-group-text">{displayName(participant)}</span>
                      <input aria-label={`Monto de ${displayName(participant)}`} className="form-control" type="number" min="0" step="0.01" value={allocations[participant] || ''} onChange={(event) => setAllocations({ ...allocations, [participant]: event.target.value })} />
                    </div>
                  ))}
                  <p className={Math.abs(amountDifference) <= 0.01 ? 'text-success small mb-0' : 'text-danger small mb-0'}>
                    {Math.abs(amountDifference) <= 0.01 ? '$0.00 sin asignar' : `$${Math.abs(amountDifference).toFixed(2)} sin asignar`}
                  </p>
                </div>
              )}

              {inviteMessage && <p className="text-danger" role="alert">{inviteMessage}</p>}

              <Button
                type="submit"
                variant="primary"
                icon
                className="full-width mt-2"
                disabled={selectedParticipants.length === 0 || (splitMethod === 'BY_AMOUNT' && Math.abs(amountDifference) > 0.01)}
              >
                Guardar gasto
              </Button>
            </form>
      )}

      {(activeTab === 'Saldos' || activeTab === 'Deudas') && (
            <div className="card p-4">
              {activeTab === 'Deudas' ? (
                <DeudasTab groupId={parseInt(id, 10)} groupName={groupName} refreshKey={balanceRefreshKey} />
              ) : (
                <GroupBalance groupId={parseInt(id, 10)} refreshKey={balanceRefreshKey} view="saldos" onRegisterExpense={() => setActiveTab('Gastos')} />
              )}
            </div>
      )}
      </>
      )}
      </div>
      </div>
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

  if (loading) return <main className="splitflow-home-shell"><div className="splitflow-join-view"><p>Cargando invitación...</p></div></main>;
  if (!group) return <main className="splitflow-home-shell"><div className="splitflow-join-view"><p className="text-danger">{error}</p></div></main>;

  const hasPendingAliases = availableAliases.length > 0;
  const isGroupFull = groupMembers.length >= MAX_GROUP_MEMBERS && !hasPendingAliases;
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
  const shareInvite = async () => {
    await navigator.clipboard?.writeText(inviteUrl);
    setError('Enlace copiado.');
  };

  return (
    <main className="splitflow-home-shell">
      <div className="splitflow-join-view">
      <section className="card invite-qr-card mb-4">
        <p className="eyebrow text-uppercase fw-bold mb-1">Invitación a SplitFlow</p>
        <h1 className="h3 fw-bold mb-2">Únete a {group.name}</h1>
        <InviteQr value={inviteUrl} />
        <span className="form-note">Código de invitación</span>
        <strong className="invite-code">{inviteCode}</strong>
        <Button variant="secondary" size="small" className="mt-3" onClick={shareInvite}>Compartir enlace</Button>
      </section>

      <section className="card identity-card">
        <p className="eyebrow text-uppercase fw-bold mb-2">Tu identidad</p>
        <h2 className="h4 mb-2">¿Quién de estos sos tú?</h2>
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
      </div>
    </main>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLeavingSplash, setIsLeavingSplash] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setIsLeavingSplash(true), 1200);
    const hideTimer = setTimeout(() => setShowSplash(false), 1800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <>
      {showSplash && (
        <div className={`splitflow-splash-screen ${isLeavingSplash ? 'is-leaving' : ''}`} aria-live="polite">
          <img src={Logo} alt="SplitFlow" className="splitflow-splash-logo" />
          <p className="splitflow-splash-wordmark">Split<strong>Flow</strong></p>
          <div className="splitflow-splash-loader" role="status" aria-label="Cargando">
            <span className="splitflow-splash-loader__dot" />
            <span className="splitflow-splash-loader__dot" />
            <span className="splitflow-splash-loader__dot" />
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/group/:id" element={<GroupView />} />
        <Route path="/join/:inviteCode" element={<JoinGroupView />} />
      </Routes>
    </>
  );
}