import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DeudasView from './pages/DeudasView';
import './pages/DeudasView.css';
import { getGroups, createGroup, getGroupByInviteCode, getGroupMembers, joinGroup, removeMember, getExpenses, createExpense, getGroupBalances, settlePayment } from './services/api';
import { clearStoredGroups, findStoredGroup, getStoredGroups, saveStoredGroups, upsertStoredGroup } from './services/groupStorage';
import { clearStartedPayment, getStartedPayments, keepStartedPaymentsOf, markPaymentStarted } from './services/startedPayments';
import { copyToClipboard } from './utils/clipboard';
import { formatCurrency, toCents } from './utils/format';
import { parseInviteCode } from './utils/invite';
import { YOU_LABEL, isReservedName, memberLabel } from './utils/members';
import GroupBalance from './components/GroupBalance';
import Button from './components/Button';
import Avatar from './components/Avatar';
import GroupCard from './components/GroupCard';
import ParticipantCard from './components/ParticipantCard';
import SegmentedControl from './components/SegmentedControl';
import Logo from '../src/public/LogoDos.svg';
import InicioAvatar from '../src/public/Inicio.svg';
import SinGastos from '../src/public/sinGastos.svg';
import exitoRegistro from '../src/public/exitoRegistro.svg';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';

const formatDate = (value) => {
  if (!value) return 'Hoy';
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

// Fecha de hoy en la zona horaria del usuario (toISOString usa UTC y adelanta el día por las noches en América)
const todayISO = () => {
  const now = new Date();
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()].map((part) => String(part).padStart(2, '0')).join('-');
};

const MAX_GROUP_MEMBERS = 50;
const DEFAULT_PARTICIPANTS = [YOU_LABEL];
const RESERVED_NAME_MESSAGE = 'Ese nombre está reservado. Elige otro.';

// Solo se guarda localmente lo que Home y el detalle necesitan, sin datos personales de los miembros
const toStoredGroup = (group, members) => ({
  id: group.id,
  name: group.name,
  currency: group.currency,
  inviteCode: group.inviteCode,
  aliases: [...new Set(members.map((member) => member.alias))],
});

// Deja el grupo en el listado local para que aparezca en Home y con su nombre real al abrirlo
const rememberGroup = (group, members) => upsertStoredGroup(toStoredGroup(group, members));

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

// Qué decir cuando el usuario no tiene deudas: aún no hay gastos, el grupo quedó al día o simplemente no debe nada
const debtsEmptyState = (summary) => {
  if (!summary.hasExpenses) {
    return { title: 'Todavía no hay deudas', message: 'Registra el primer gasto para ver quién le debe a quién', showBadge: false };
  }
  if (summary.hadDebts && (summary.debts || []).length === 0) {
    return { title: 'Todas las cuentas están saldadas', message: '¡Todo el mundo está al día!' };
  }
  return { title: 'Sin deudas pendientes', message: 'No tienes deudas pendientes en este grupo' };
};

// El monto forma parte de la identidad: si la deuda cambia, un "Pago iniciado" anterior ya no le corresponde
const debtId = (debt) => `${debt.debtor}|${debt.creditor}|${debt.amount}`;

// Vista personal: solo las deudas en las que participa quien mira, no todas las del grupo
const personalDebts = (summary, myAlias, startedPayments) => (summary.debts || [])
  .filter((debt) => debt.debtor === myAlias || debt.creditor === myAlias)
  .map((debt) => {
    const owedByMe = debt.debtor === myAlias;
    return {
      ...debt,
      id: debtId(debt),
      owedByMe,
      otherName: memberLabel(owedByMe ? debt.creditor : debt.debtor, myAlias),
      status: startedPayments.has(debtId(debt)) ? 'STARTED' : 'PENDING',
    };
  });

function DeudasTab({ groupId, refreshKey, myAlias, membersLoaded }) {
  const [summary, setSummary] = useState(null);
  const [startedPayments, setStartedPayments] = useState(() => getStartedPayments(groupId));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const loadDebts = async () => {
    setLoadError('');
    try {
      const nextSummary = await getGroupBalances(groupId);
      const currentDebtIds = (nextSummary.debts || []).map(debtId);
      keepStartedPaymentsOf(groupId, currentDebtIds);
      setStartedPayments((previous) => new Set([...previous, ...getStartedPayments(groupId)].filter((id) => currentDebtIds.includes(id))));
      setSummary(nextSummary);
    } catch {
      setLoadError('No pudimos cargar las deudas. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebts();
  }, [groupId, refreshKey]);

  const retryLoad = () => {
    setLoading(true);
    loadDebts();
  };

  // Se calcula al dibujar: si los miembros llegan después del resumen, "mis deudas" se actualiza sola
  const debts = useMemo(
    () => (summary ? personalDebts(summary, myAlias, startedPayments) : []),
    [summary, myAlias, startedPayments],
  );

  const handleStartPayment = (debt) => {
    markPaymentStarted(groupId, debt.id);
    setStartedPayments((previous) => new Set(previous).add(debt.id));
  };

  const handleMarkAsPaid = async (debt) => {
    try {
      await settlePayment(groupId, debt);
    } catch (error) {
      // Si el servidor la rechazó (p. ej. otra persona ya la saldó), la lista mostrada quedó desactualizada
      if (error.status) await loadDebts();
      throw error;
    }
    clearStartedPayment(groupId, debt.id);
    await loadDebts();
  };

  if (loading || !membersLoaded) return <div className="card p-4">Cargando deudas...</div>;
  if (loadError || !summary) {
    return (
      <div className="card p-4">
        <p className="text-danger" role="alert">{loadError}</p>
        <Button variant="secondary" size="small" onClick={retryLoad}>Reintentar</Button>
      </div>
    );
  }

  return <DeudasView debts={debts} emptyState={debtsEmptyState(summary)} onStartPayment={handleStartPayment} onMarkAsPaid={handleMarkAsPaid} />;
}

function HomeView() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [participants, setParticipants] = useState(DEFAULT_PARTICIPANTS);
  const [error, setError] = useState('');
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);

  useEffect(() => {
    const storedUserId = localStorage.getItem('splitflow.userId');
    const currentUserId = storedUserId || crypto.randomUUID();
    if (!storedUserId) localStorage.setItem('splitflow.userId', currentUserId);
    setUserId(currentUserId);

    setGroups(getStoredGroups());

    // El servidor conoce los grupos del dispositivo: se suman los que falten en el listado local
    getGroups(currentUserId)
      .then((remoteGroups) => {
        const storedGroups = getStoredGroups();
        const knownIds = new Set(storedGroups.map((group) => String(group.id)));
        const missingGroups = remoteGroups
          .filter((group) => !knownIds.has(String(group.id)))
          .map((group) => toStoredGroup(group, group.members || []));
        if (missingGroups.length === 0) return;
        const mergedGroups = [...storedGroups, ...missingGroups];
        setGroups(mergedGroups);
        saveStoredGroups(mergedGroups);
      })
      .catch(() => {});
  }, []);

  const persistGroups = (nextGroups) => {
    setGroups(nextGroups);
    saveStoredGroups(nextGroups);
  };
  const handleJoinClick = () => {
    const code = parseInviteCode(prompt('Ingresa el código de invitación:'));
    if (code) {
      navigate(`/join/${code}`);
    }
  };

  const joinByCodeButton = (
    <button type="button" className="splitflow-link-button" onClick={handleJoinClick} style={{ background: 'none', border: 'none', color: 'inherit', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}>
      Únete a un grupo
    </button>
  );

  const resetGroups = () => {
    clearStoredGroups();
    setGroups([]);
    setShowCreateForm(true);
  };

  const addParticipant = (cleanName) => {
    if (!cleanName || participants.includes(cleanName)) {
      return;
    }
    if (isReservedName(cleanName)) {
      setError(RESERVED_NAME_MESSAGE);
      return;
    }
    setParticipants((currentParticipants) => [...currentParticipants, cleanName]);
  };

  const removeParticipant = (nameToRemove) => {
    setParticipants((currentParticipants) => currentParticipants.filter((name) => name !== nameToRemove));
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    if (isCreatingGroup) return;
    const cleanName = groupName.trim();
    if (!cleanName) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    const normalizedParticipants = [...new Set(participants.filter(Boolean))];

    setIsCreatingGroup(true);
    try {
      // "Tú" solo identifica al creador en el formulario; el creador ya entra al grupo con su dispositivo
      const createdGroup = await createGroup({
        name: cleanName,
        currency,
        aliases: normalizedParticipants.filter((name) => name !== YOU_LABEL),
        ownerId: userId,
      });

      const nextGroup = {
        ...createdGroup,
        aliases: normalizedParticipants,
        ownerId: userId,
      };

      persistGroups([...groups, nextGroup]);
      setGroupName('');
      setParticipants(DEFAULT_PARTICIPANTS);
      setShowCreateForm(false);
      setError('');
      navigate(`/group/${createdGroup.id}`);
    } catch (createError) {
      setError(createError.message || 'No pudimos crear el grupo. Intenta de nuevo.');
    } finally {
      setIsCreatingGroup(false);
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
           <p>
              ¿Tienes un código de invitación?{' '}
              {joinByCodeButton}
            </p>
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
            <Avatar name={userId} aria-label="Tu perfil" size="medium" />
          </header>

          <div className="splitflow-home-list__content">
            <h2 className="splitflow-section-title">Tus grupos</h2>

            <div className="splitflow-group-list">
              {groups.map((group) => (
                <GroupCard
                  key={group.id}
                  name={group.name}
                  members={(group.aliases || []).map((alias, index) => ({ id: index, name: memberLabel(alias) }))}
                  onClick={() => navigate(`/group/${group.id}`)}
                />
              ))}
            </div>

            <Button variant="primary" icon className="full-width" onClick={() => setShowCreateForm(true)}>
              Nuevo grupo
            </Button>
            <p>¿Tienes un código de invitación? {joinByCodeButton}</p>
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
                  tag: name === YOU_LABEL ? YOU_LABEL : undefined,
                  removable: name !== YOU_LABEL,
                }))}
                onRemoveParticipant={removeParticipant}
                onAddParticipant={addParticipant}
              />
            </div>

            {error && <p className="splitflow-error" role="alert">{error}</p>}

            <Button type="submit" variant="primary" icon className="full-width form-submit" disabled={isCreatingGroup || !groupName.trim()}>
              {isCreatingGroup ? 'Creando...' : 'Crear grupo'}
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
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [groupName, setGroupName] = useState(`Grupo #${id}`);
  const [aliases, setAliases] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const [expenseError, setExpenseError] = useState('');
  const [inviteNotice, setInviteNotice] = useState(null);
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
  const [savedExpense, setSavedExpense] = useState(null);
  const [isSavingExpense, setIsSavingExpense] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [expenseDate, setExpenseDate] = useState(todayISO);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [splitMethod, setSplitMethod] = useState('EQUAL');
  const [allocations, setAllocations] = useState({});

  const loadData = async () => {
    // Miembros y gastos son independientes: si uno falla, el otro se muestra igual y el error se avisa
    const [membersResult, expensesResult] = await Promise.allSettled([getGroupMembers(id), getExpenses(id)]);
    if (membersResult.status === 'fulfilled') {
      const membersData = membersResult.value;
      setMembers(membersData);
      setMembersLoaded(true);
      const activeAliases = membersData.filter((member) => member.active).map((member) => member.alias);
      setSelectedParticipants(activeAliases);
      // Quien registra el gasto suele ser quien pagó: el pagador por defecto es la persona que usa este dispositivo
      const myDeviceId = localStorage.getItem('splitflow.userId');
      const myMember = membersData.find((member) => member.active && myDeviceId && member.deviceId === myDeviceId);
      setPaidBy((currentPaidBy) => currentPaidBy || myMember?.alias || activeAliases[0] || '');
    }
    if (expensesResult.status === 'fulfilled') {
      setExpenses(expensesResult.value);
    }
    const failure = [membersResult, expensesResult].find((result) => result.status === 'rejected');
    if (failure) console.error('Error al cargar datos:', failure.reason);
    setLoadError(failure ? failure.reason.message : '');
  };

  const applyGroupDetails = (group) => {
    setGroupName(group.name);
    setAliases(group.aliases || []);
    setInviteCode(group.inviteCode || '');
    setCurrency(group.currency || 'COP');
  };

  useEffect(() => {
    let isCurrent = true;
    const localGroup = findStoredGroup(id);
    const deviceId = localStorage.getItem('splitflow.userId');
    if (localGroup) {
      applyGroupDetails(localGroup);
    } else if (deviceId) {
      // Sin datos locales del grupo (otro navegador, almacenamiento borrado) se toman de los grupos del dispositivo en el servidor
      getGroups(deviceId)
        .then((remoteGroups) => {
          const remoteGroup = remoteGroups.find((group) => String(group.id) === String(id));
          if (!isCurrent || !remoteGroup) return;
          const storedGroup = toStoredGroup(remoteGroup, remoteGroup.members || []);
          upsertStoredGroup(storedGroup);
          applyGroupDetails(storedGroup);
        })
        .catch(() => {});
    }
    loadData();
    return () => { isCurrent = false; };
  }, [id]);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    const alias = username.trim();
    if (!alias) {
      setMemberError('Debes ingresar un nombre');
      return;
    }
    if (isReservedName(alias)) {
      setMemberError(RESERVED_NAME_MESSAGE);
      return;
    }

    setIsAddingMember(true);
    setMemberError('');
    try {
      // Se registra sin dispositivo: la persona queda "sin reclamar" hasta que abra la invitación y elija su nombre
      const createdMember = await joinGroup(id, { alias, email: email.trim() });
      setMembers((currentMembers) => {
        const alreadyPresent = currentMembers.some((member) => member.id === createdMember.id);
        return alreadyPresent
          ? currentMembers.map((member) => member.id === createdMember.id ? createdMember : member)
          : [...currentMembers, createdMember];
      });
      // Solo los miembros activos aparecen en el formulario de gastos
      if (createdMember.active) {
        setSelectedParticipants((currentParticipants) => currentParticipants.includes(createdMember.alias)
          ? currentParticipants
          : [...currentParticipants, createdMember.alias]);
        setPaidBy((currentPaidBy) => currentPaidBy || createdMember.alias);
      }
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
      // Quien ya no está en el grupo tampoco puede quedar como participante o pagador del gasto en curso
      setSelectedParticipants((currentParticipants) => currentParticipants.filter((alias) => alias !== memberToRemove.alias));
      setPaidBy((currentPaidBy) => (currentPaidBy === memberToRemove.alias ? '' : currentPaidBy));
      setMemberToRemove(null);
    } catch (error) {
      setMemberActionError(error.message);
      setMemberToRemove(null);
    }
  };

  // Todo se compara en centavos enteros: con decimales binarios 100 - 99.99 da 0.010000000000005 y no cuadra con el servidor
  const totalCents = toCents(amount);
  const assignedCents = selectedParticipants.reduce((sum, participant) => sum + toCents(allocations[participant]), 0);
  const differenceCents = totalCents - assignedCents;
  // El servidor tolera un centavo de diferencia y lo absorbe en el primer participante
  const isSplitBalanced = Math.abs(differenceCents) <= 1;
  // Partes iguales: el centavo sobrante lo asume el primer participante, igual que en el servidor
  const equalShareCents = selectedParticipants.length > 0 ? Math.floor(totalCents / selectedParticipants.length) : 0;
  const equalRemainderCents = selectedParticipants.length > 0 ? totalCents % selectedParticipants.length : 0;
  const equalShare = formatCurrency(equalShareCents / 100);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (isSavingExpense) return;
    if (!description.trim()) return setExpenseError('La descripcion es obligatoria');
    if (!amount || parseFloat(amount) <= 0) return setExpenseError('El monto debe ser mayor a $0');
    if (selectedParticipants.length === 0) return setExpenseError('Debes seleccionar al menos un participante');
    if (splitMethod === 'BY_AMOUNT' && !isSplitBalanced) {
      return setExpenseError(`${formatCurrency(Math.abs(differenceCents) / 100)} sin asignar`);
    }
    setIsSavingExpense(true);
    try {
      // Solo viajan los montos de quienes siguen en el reparto: los de participantes desmarcados harían fallar el guardado
      const splitAllocations = Object.fromEntries(selectedParticipants.map((participant) => [participant, parseFloat(allocations[participant]) || 0]));
      const created = { description: description.trim(), amount: parseFloat(amount), paidBy, expenseDate, participants: selectedParticipants, splitMethod, allocations: splitMethod === 'BY_AMOUNT' ? splitAllocations : undefined };
      setSavedExpense(await createExpense(id, created));
      setDescription('');
      setAmount('');
      setPaidBy('');
      setAllocations({});
      setExpenseError('');
      setBalanceRefreshKey((currentKey) => currentKey + 1);
      setExpenseView('success');
      loadData();
    } catch (error) {
      setExpenseError(error.message);
    } finally {
      setIsSavingExpense(false);
    }
  };

  const toggleParticipant = (alias) => {
    setSelectedParticipants((current) => current.includes(alias)
      ? current.filter((participant) => participant !== alias)
      : [...current, alias]);
  };


  // El gasto recién guardado cuenta hasta que la recarga del servidor lo incluya en la lista
  const expensesWithSaved = savedExpense && !expenses.some((expense) => expense.id === savedExpense.id)
    ? [savedExpense, ...expenses]
    : expenses;

  const shareInvite = async () => {
    if (!inviteCode) {
      setInviteNotice({ text: 'No encontramos el código de invitación de este grupo en este dispositivo.', isError: true });
      return;
    }
    const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
    const copied = await copyToClipboard(inviteUrl);
    setInviteNotice({ text: copied ? `Enlace copiado: ${inviteUrl}` : `Copia y comparte este enlace: ${inviteUrl}`, isError: false });
  };

  const inviteNoticeMessage = inviteNotice && (
    <p className={`${inviteNotice.isError ? 'text-danger' : 'text-success'} small mt-2`} role={inviteNotice.isError ? 'alert' : 'status'}>
      {inviteNotice.text}
    </p>
  );

  const myDeviceId = localStorage.getItem('splitflow.userId');
  // Sin identificador de dispositivo nadie es "yo": los miembros sin reclamar también tienen el dispositivo vacío
  const myAlias = myDeviceId ? members.find((member) => member.deviceId === myDeviceId)?.alias : undefined;
  const displayName = (alias) => memberLabel(alias, myAlias);

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
          <button className="group-header__icon-button" onClick={() => { setShowMembersView(false); setInviteNotice(null); }} type="button" aria-label="Volver">
            <ChevronLeftIcon />
          </button>
          <h2 className="group-header__title">Gestionar miembros</h2>
          <span className="group-header__icon-button" aria-hidden="true" />
        </div>
      )}

      <div className="splitflow-group-view__body">
      {loadError && (
        <p className="text-danger small" role="alert">
          {loadError}{' '}
          <button type="button" className="btn btn-link btn-sm p-0 align-baseline" onClick={loadData}>Reintentar</button>
        </p>
      )}
      {showMembersView ? (
        <>
          <Button variant="secondary" size="small" className="full-width" onClick={shareInvite}>+ Invitar</Button>
          {inviteNoticeMessage}

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
                    <label className="field-label">Email (opcional)</label>
                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
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
                      {member.active ? (
                        <Avatar name={displayName(member.alias)} size="small" />
                      ) : (
                        <span className="avatar avatar-muted">{initials(displayName(member.alias))}</span>
                      )}
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
              <Button variant="secondary" size="small" onClick={() => { setInviteNotice(null); setShowMembersView(true); }}>Gestionar miembros</Button>
            </div>

            {inviteNoticeMessage}

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
                        <strong>{formatCurrency(ex.amount)}</strong>
                        <span>{mySplit ? `Tu parte ${formatCurrency(mySplit.amount)}` : 'No participaste'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {expenses.length > 0 && (
              <div className="expense-list__total">
                <span>TOTAL DEL GRUPO</span>
                <strong>{formatCurrency(expenses.reduce((sum, ex) => sum + Number(ex.amount), 0))}</strong>
              </div>
            )}
        </>
      )}

      {activeTab === 'Gastos' && expenseView === 'form' && (
            <form onSubmit={handleExpenseSubmit} className="expense-form-shell">
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
                  <input type="date" className="form-control" value={expenseDate} max={todayISO()} onChange={(e) => setExpenseDate(e.target.value)} />
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

              {splitMethod === 'EQUAL' && (
                <p className="form-note">
                  {selectedParticipants.length} {selectedParticipants.length === 1 ? 'persona' : 'personas'} · {equalShare} cada una
                  {equalRemainderCents > 0 && ` · ${displayName(selectedParticipants[0])} asume ${formatCurrency(equalRemainderCents / 100)} más`}
                </p>
              )}
              {splitMethod === 'BY_AMOUNT' && (
                <div className="field-group">
                  {selectedParticipants.map((participant) => (
                    <div className="input-group mb-2" key={participant}>
                      <span className="input-group-text">{displayName(participant)}</span>
                      <input aria-label={`Monto de ${displayName(participant)}`} className="form-control" type="number" min="0" step="0.01" value={allocations[participant] || ''} onChange={(event) => setAllocations({ ...allocations, [participant]: event.target.value })} />
                    </div>
                  ))}
                  <p className={isSplitBalanced ? 'text-success small mb-0' : 'text-danger small mb-0'}>
                    {isSplitBalanced ? `${formatCurrency(0)} sin asignar` : `${formatCurrency(Math.abs(differenceCents) / 100)} sin asignar`}
                  </p>
                </div>
              )}

              {expenseError && <p className="text-danger" role="alert">{expenseError}</p>}

              <Button
                type="submit"
                variant="primary"
                icon
                className="full-width mt-2"
                disabled={isSavingExpense || selectedParticipants.length === 0 || (splitMethod === 'BY_AMOUNT' && !isSplitBalanced)}
              >
                {isSavingExpense ? 'Guardando...' : 'Guardar gasto'}
              </Button>
            </form>
      )}

      {activeTab === 'Gastos' && expenseView === 'success' && (
        <div className="expense-success">
          <div className="expense-success__header">
            <img src={exitoRegistro } alt="Registro exitoso" />
            <h3>¡Registro exitoso!</h3>
          </div>

          <div className="expense-success__summary">
            <span>Total del grupo</span>
            <strong>{formatCurrency(expensesWithSaved.reduce((sum, ex) => sum + Number(ex.amount || 0), 0))}</strong>
          </div>

          <Button variant="primary" icon className="full-width mt-3" onClick={() => setExpenseView('list')}>
            Ver lista de gastos
          </Button>
        </div>
      )}

      {(activeTab === 'Saldos' || activeTab === 'Deudas') && (
            <div className="card p-4">
              {activeTab === 'Deudas' ? (
                <DeudasTab groupId={parseInt(id, 10)} refreshKey={balanceRefreshKey} myAlias={myAlias} membersLoaded={membersLoaded} />
              ) : (
                <GroupBalance groupId={parseInt(id, 10)} refreshKey={balanceRefreshKey} myAlias={myAlias} onRegisterExpense={() => setActiveTab('Gastos')} />
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
  const inviteCode = parseInviteCode(useParams().inviteCode);
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [availableAliases, setAvailableAliases] = useState([]);
  const [selectedAlias, setSelectedAlias] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    getGroupByInviteCode(inviteCode)
      .then((groupData) => getGroupMembers(groupData.id).then((members) => [groupData, members]))
      .then(([groupData, members]) => {
        // Quien ya participa con este dispositivo entra directo, sin unirse una segunda vez
        const myDeviceId = localStorage.getItem('splitflow.userId');
        if (myDeviceId && members.some((member) => member.deviceId === myDeviceId)) {
          rememberGroup(groupData, members);
          navigate(`/group/${groupData.id}`, { replace: true });
          return;
        }
        setGroup(groupData);
        setGroupMembers(members);
        setAvailableAliases(members.filter((member) => !member.active));
      })
      .catch((loadError) => setError(loadError.status === 404
        ? 'No encontramos este grupo o el enlace ya no es válido.'
        : loadError.message))
      .finally(() => setLoading(false));
  }, [inviteCode, navigate]);

  const handleJoin = async (event) => {
    event.preventDefault();
    if (isJoining) return;
    const alias = selectedAlias || customAlias.trim();
    if (!alias) {
      setError('Debes ingresar un nombre para unirte');
      return;
    }
    if (!selectedAlias && isReservedName(alias)) {
      setError(RESERVED_NAME_MESSAGE);
      return;
    }
    setIsJoining(true);
    setError('');
    try {
      const deviceId = localStorage.getItem('splitflow.userId') || crypto.randomUUID();
      localStorage.setItem('splitflow.userId', deviceId);
      const createdMember = await joinGroup(group.id, { alias, deviceId });
      rememberGroup(group, [...groupMembers, createdMember]);
      navigate(`/group/${group.id}`);
    } catch (joinError) {
      setError(joinError.message);
      setIsJoining(false);
    }
  };

  if (loading) return <main className="splitflow-home-shell"><div className="splitflow-join-view"><p>Cargando invitación...</p></div></main>;
  if (!group) return <main className="splitflow-home-shell"><div className="splitflow-join-view"><p className="text-danger">{error}</p></div></main>;

  const hasPendingAliases = availableAliases.length > 0;
  const isGroupFull = groupMembers.length >= MAX_GROUP_MEMBERS && !hasPendingAliases;
  const inviteUrl = `${window.location.origin}/join/${inviteCode}`;
  const shareInvite = async () => {
    setNotice(await copyToClipboard(inviteUrl) ? 'Enlace copiado.' : `Copia y comparte este enlace: ${inviteUrl}`);
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
          {notice && <p className="text-success" role="status">{notice}</p>}
          {error && <p className="text-danger" role="alert">{error}</p>}
          <button className="primary-button w-100" type="submit" disabled={isGroupFull || isJoining || (!selectedAlias && !customAlias.trim())}>{isJoining ? 'Uniéndote...' : 'Unirme al grupo'}</button>
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
