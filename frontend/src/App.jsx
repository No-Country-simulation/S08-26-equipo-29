import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import DeudasView from './pages/DeudasView';
import './pages/DeudasView.css';
import { getGroups, createGroup, getGroupByInviteCode, getGroupMembers, joinGroup, getExpenses, createExpense, getGroupBalances, settlePayment } from './services/api';
import GroupBalance from './components/GroupBalance';

const initials = (name = '') => name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || '?';

const formatDate = (value) => {
  if (!value) return 'Hoy';
  const date = new Date(`${value}T12:00:00`);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Hoy';
  return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

function DeudasTab({ groupId, groupName, refreshKey }) {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDebts = async () => {
    setLoading(true);
    try {
      const summary = await getGroupBalances(groupId);
      setDebts((summary.debts || []).map((debt, index) => ({
        ...debt,
        id: `${debt.debtor}-${debt.creditor}-${index}`,
        creditorName: debt.creditor,
      })));
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

// --- PANTALLA 1: HOME (Listado de Grupos / Empecemos) ---
function HomeView() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [groups, setGroups] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [aliases, setAliases] = useState([]);
  const [aliasInput, setAliasInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUserId = localStorage.getItem('splitflow.userId');
    const currentUserId = storedUserId || crypto.randomUUID();
    if (!storedUserId) localStorage.setItem('splitflow.userId', currentUserId);
    setUserId(currentUserId);

    const storedGroups = JSON.parse(localStorage.getItem('splitflow.groups') || '[]');
    setGroups(storedGroups);
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

  const addAlias = () => {
    const alias = aliasInput.trim();
    if (!alias || alias.length > 40 || aliases.includes(alias)) return;
    setAliases([...aliases, alias]);
    setAliasInput('');
  };

  const handleCreateGroup = async (event) => {
    event.preventDefault();
    const cleanName = groupName.trim();
    if (!cleanName) {
      setError('El nombre del grupo es obligatorio');
      return;
    }

    try {
      const createdGroup = await createGroup({ name: cleanName, currency, aliases, ownerId: userId });
      const nextGroup = { ...createdGroup, aliases, ownerId: userId };
      persistGroups([...groups, nextGroup]);
      setGroupName('');
      setAliases([]);
      setShowCreateForm(false);
      setError('');
      navigate(`/group/${createdGroup.id}`);
    } catch {
      setError('No pudimos crear el grupo. Revisa que el backend este activo e intenta de nuevo.');
    }
  };

  return (
    <main className="container py-5 splitflow-shell">
      <header className="page-header mb-5">
        <p className="eyebrow text-uppercase text-primary fw-bold small mb-2">SplitFlow</p>
        <h1 className="display-5 fw-bold mb-2">Tus gastos, en orden.</h1>
        <p className="text-muted mb-0">Crea un grupo y empieza a dividir sin registros ni contrasenas.</p>
      </header>

      {groups.length === 0 && !showCreateForm && (
        <section className="card empty-state text-center">
          <div>
            <div className="avatar mx-auto mb-3" aria-hidden="true">+</div>
            <h2 className="h3">Todavia no tienes grupos</h2>
            <p className="text-muted mb-4">Tu primer grupo es el lugar para reunir gastos y participantes.</p>
            <button className="btn btn-primary btn-lg" onClick={() => setShowCreateForm(true)}>
              Crear mi primer grupo
            </button>
          </div>
        </section>
      )}

      {groups.length > 0 && !showCreateForm && (
        <section>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="h3 mb-0">Mis grupos</h2>
            <button className="btn btn-primary" onClick={() => setShowCreateForm(true)}>Crear grupo</button>
          </div>
          <div className="row g-3">
            {groups.map((group) => (
              <div className="col-md-6" key={group.id}>
                <button className="card group-tile p-4 text-start w-100" onClick={() => navigate(`/group/${group.id}`)}>
                  <span className="d-flex justify-content-between align-items-start gap-3"><span className="h4 d-block mb-2">{group.name}</span><span aria-hidden="true">›</span></span>
                  <span className="text-muted">{group.currency || 'COP'} · {group.aliases?.length || 0} participantes invitados</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {showCreateForm && (
        <section className="card p-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h3 mb-0">Crear grupo</h2>
            <button className="btn-close" aria-label="Cerrar" onClick={() => setShowCreateForm(false)} />
          </div>
          <form onSubmit={handleCreateGroup}>
            <label className="form-label" htmlFor="group-name">Nombre del grupo</label>
            <input id="group-name" className="form-control mb-3" maxLength={60} value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="Ej. Viaje Melgar" autoFocus />

            <label className="form-label" htmlFor="group-currency">Moneda</label>
            <select id="group-currency" className="form-select mb-3" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option>COP</option><option>ARS</option><option>CLP</option><option>USD</option>
            </select>

            <label className="form-label" htmlFor="group-alias">Participantes (opcional)</label>
            <div className="input-group mb-2">
              <input id="group-alias" className="form-control" maxLength={40} value={aliasInput} onChange={(event) => setAliasInput(event.target.value)} placeholder="Nombre o alias" />
              <button type="button" className="btn btn-outline-primary" onClick={addAlias}>Agregar</button>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-4">
              {aliases.map((alias) => <span className="badge text-bg-light border" key={alias}>{alias}</span>)}
            </div>
            {error && <p className="text-danger" role="alert">{error}</p>}
            <button className="btn btn-primary w-100" type="submit" disabled={!groupName.trim()}>Crear grupo</button>
          </form>
        </section>
      )}

      <p className="text-muted small mt-4 mb-0">ID local: {userId}</p>
      {!showCreateForm && <button className="fab btn btn-primary" aria-label="Crear grupo" title="Crear grupo" onClick={() => setShowCreateForm(true)}>+</button>}
    </main>
  );
}

// --- PANTALLA 2: VISTA INTERNA DEL GRUPO (Dashboard con Pestañas/Secciones) ---
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

  // Formulario de Usuario
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  // Formulario de Gasto
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
      console.error("Error al cargar datos:", error);
    }
  };

  useEffect(() => {
    const localGroup = JSON.parse(localStorage.getItem('splitflow.groups') || '[]')
      .find((group) => String(group.id) === String(id));
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
      {/* Barra superior de navegación interna estilo Figma */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>
          ← Volver a Grupos
        </button>
        <h2 className="text-primary m-0">{groupName}</h2>
        {inviteCode && <button className="btn btn-outline-primary btn-sm" onClick={shareInvite}>Compartir invitacion</button>}
      </div>

      <nav className="group-tabs mb-4" aria-label="Navegación del grupo">
        {['Gastos', 'Saldos', 'Deudas'].map((tab) => (
          <button key={tab} className={activeTab === tab ? 'group-tab active' : 'group-tab'} onClick={() => setActiveTab(tab)} aria-current={activeTab === tab ? 'page' : undefined}>
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'Gastos' && <div className="row">
        {/* Columna Izquierda: Participantes */}
        <div className="col-md-6">
          <div className="card p-4 mb-4 shadow-sm">
            <h3>Registrar Participante</h3>
            <form onSubmit={handleUserSubmit}>
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {memberError && <p className="text-danger small" role="alert">{memberError}</p>}
              <button type="submit" className="btn btn-success w-100" disabled={isAddingMember || !username.trim()}>
                {isAddingMember ? 'Guardando...' : 'Guardar Participante'}
              </button>
            </form>
          </div>

          <div className="card p-4">
            <h3>Participantes</h3>
            <div className="mt-3 d-grid gap-2">
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

        {/* Columna Derecha: Gastos */}
        <div className="col-md-6">
          <div className="card p-4 mb-4 shadow-sm">
            <h3>Registrar un Gasto</h3>
            <form onSubmit={handleExpenseSubmit}>
              <div className="mb-3">
                <label className="form-label">Descripción</label>
                <input type="text" className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Importe ($)</label>
                <input type="number" step="0.01" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input type="date" className="form-control" value={expenseDate} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setExpenseDate(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label">¿Quién pagó?</label>
                <select className="form-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)} required>
                  <option value="">Seleccionar participante...</option>
                  {members.filter((member) => member.active).map((member) => (
                    <option key={member.id} value={member.alias}>{member.alias}</option>
                  ))}
                </select>
              </div>
              <fieldset className="mb-3">
                <legend className="form-label fs-6">¿Quiénes participaron?</legend>
                {members.filter((member) => member.active).map((member) => (
                  <label className="d-block mb-2" key={member.id}>
                    <input className="form-check-input me-2" type="checkbox" checked={selectedParticipants.includes(member.alias)} onChange={() => toggleParticipant(member.alias)} />
                    {member.alias}
                  </label>
                ))}
              </fieldset>
              <div className="mb-3">
                <span className="form-label d-block">Método de división</span>
                <div className="segmented-control" role="radiogroup" aria-label="Método de división">
                  <label><input type="radio" name="split-method" value="EQUAL" checked={splitMethod === 'EQUAL'} onChange={(event) => setSplitMethod(event.target.value)} />Partes iguales</label>
                  <label><input type="radio" name="split-method" value="BY_AMOUNT" checked={splitMethod === 'BY_AMOUNT'} onChange={(event) => setSplitMethod(event.target.value)} />Por monto</label>
                </div>
              </div>
              {splitMethod === 'EQUAL' && <p className="small text-muted">{selectedParticipants.length} participantes · ${equalShare} por persona</p>}
              {splitMethod === 'BY_AMOUNT' && <div className="mb-3">
                {selectedParticipants.map((participant) => (
                  <div className="input-group mb-2" key={participant}>
                    <span className="input-group-text">{participant}</span>
                    <input aria-label={`Monto de ${participant}`} className="form-control" type="number" min="0" step="0.01" value={allocations[participant] || ''} onChange={(event) => setAllocations({ ...allocations, [participant]: event.target.value })} />
                  </div>
                ))}
                <p className={Math.abs(amountDifference) <= 0.01 ? 'text-success small' : 'text-danger small'}>
                  {Math.abs(amountDifference) <= 0.01 ? '$0.00 sin asignar' : `$${Math.abs(amountDifference).toFixed(2)} sin asignar`}
                </p>
              </div>}
              <button type="submit" className="btn btn-primary w-100" disabled={selectedParticipants.length === 0 || (splitMethod === 'BY_AMOUNT' && Math.abs(amountDifference) > 0.01)}>Registrar Gasto</button>
            </form>
          </div>

          <div className="card p-4 shadow-sm">
            <h3>Gastos Registrados</h3>
            {inviteMessage && <p className="text-danger" role="alert">{inviteMessage}</p>}
            {expenses.length === 0 ? <div className="text-center text-muted py-4">Este grupo todavia no tiene gastos.<br /><span>Registra el primer gasto.</span></div> : <div className="mt-3 d-grid gap-2">
              {expenses.map((ex) => (
                <div key={ex.id} className="expense-tile d-flex justify-content-between align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="avatar">{initials(ex.paidBy)}</span><div><strong>{ex.description}</strong><br /><small className="expense-date">{ex.paidBy} · {formatDate(ex.expenseDate)}</small></div>
                  </div>
                  <strong className="amount-negative text-nowrap">${Number(ex.amount).toFixed(2)}</strong>
                </div>
              ))}
            </div>}
          </div>
        </div>
      </div>}

      {/* Sección Inferior: Flujo de Saldos */}
      {(activeTab === 'Saldos' || activeTab === 'Deudas') && <div className="row mt-4">
        <div className="col-12">
          <div className="card p-4 shadow-sm">
            {activeTab === 'Deudas' ? <DeudasTab groupId={parseInt(id, 10)} groupName={groupName} refreshKey={balanceRefreshKey} /> : <GroupBalance groupId={parseInt(id, 10)} refreshKey={balanceRefreshKey} view="saldos" />}
          </div>
        </div>
      </div>}
    </main>
  );
}

function JoinGroupView() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
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
        setAvailableAliases(members.filter((member) => !member.active));
      })
      .catch(() => setError('No encontramos este grupo o el enlace ya no es valido.'))
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

  if (loading) return <main className="container py-5"><p>Cargando invitacion...</p></main>;
  if (!group) return <main className="container py-5"><p className="text-danger">{error}</p></main>;

  const hasPendingAliases = availableAliases.length > 0;
  return (
    <main className="container py-5" style={{ maxWidth: '560px' }}>
      <section className="card p-4 shadow-sm">
        <p className="text-uppercase text-primary fw-bold small mb-2">Invitacion a SplitFlow</p>
        <h1 className="h2">Unete a {group.name}</h1>
        <p className="text-muted">{hasPendingAliases ? 'Cual de estos eres tu?' : 'Con que nombre quieres aparecer en el grupo?'}</p>
        <form onSubmit={handleJoin}>
          {hasPendingAliases ? <select className="form-select mb-3" value={selectedAlias} onChange={(event) => setSelectedAlias(event.target.value)}>
            <option value="">Selecciona tu alias...</option>
            {availableAliases.map((member) => <option key={member.id} value={member.alias}>{member.alias}</option>)}
          </select> : <input className="form-control mb-3" maxLength={40} value={customAlias} onChange={(event) => setCustomAlias(event.target.value)} placeholder="Ej. Carlos" autoFocus />}
          {error && <p className="text-danger" role="alert">{error}</p>}
          <button className="btn btn-primary w-100" type="submit">Unirme</button>
        </form>
      </section>
    </main>
  );
}

// --- ENRUTADOR PRINCIPAL ---
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeView />} />
      <Route path="/join/:inviteCode" element={<JoinGroupView />} />
      <Route path="/group/:id" element={<GroupView />} />
    </Routes>
  );
}

export default App;