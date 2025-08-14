import dayjs from 'dayjs'

const LS_KEY = 'finance_ops_store_v2'

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) ?? null } catch { return null }
}
function save(state) { localStorage.setItem(LS_KEY, JSON.stringify(state)) }

const defaultUsers = [
  { id: 1,  name: 'Eman',        email: 'eman@demo.local',        role: 'employee',   password: '123456', is_active: true },
  { id: 4,  name: 'Ali',         email: 'ali@demo.local',         role: 'employee',   password: '123456', is_active: true },
  { id: 5,  name: 'Sara',        email: 'sara@demo.local',        role: 'employee',   password: '123456', is_active: true },
  { id: 6,  name: 'Khalid',      email: 'khalid@demo.local',      role: 'employee',   password: '123456', is_active: true },
  { id: 2,  name: 'Samar',       email: 'samar@demo.local',       role: 'supervisor', password: '123456', is_active: true },
  { id: 7,  name: 'Noura',       email: 'noura@demo.local',       role: 'supervisor', password: '123456', is_active: true },
  { id: 3,  name: 'Mohammed',    email: 'manager@demo.local',     role: 'manager',    password: '123456', is_active: true },
  { id: 8,  name: 'Abdulrahman', email: 'abdulrahman@demo.local', role: 'manager',    password: '123456', is_active: true }
]

const defaultState = {
  users: defaultUsers,
  me: null,
  transactions: [
    { id: 1001, code: 'TX-2025-00001', type: 'revenue', amount: 12000, currency: 'SAR', description: 'August sales batch A', status: 'submitted', created_by: 1,
      created_at: dayjs().subtract(2, 'day').toISOString(), submitted_at: dayjs().subtract(2, 'day').add(30, 'minute').toISOString(),
      pre_approved_at: null, final_approved_at: null, disbursed_at: null, notes: [], attachments: [] },
    { id: 1002, code: 'TX-2025-00002', type: 'expense', amount: 3250, currency: 'SAR', description: 'Office supplies', status: 'pre_approved', created_by: 1,
      created_at: dayjs().subtract(1, 'day').toISOString(), submitted_at: dayjs().subtract(1, 'day').add(20, 'minute').toISOString(),
      pre_approved_at: dayjs().subtract(1, 'day').add(2, 'hour').toISOString(), final_approved_at: null, disbursed_at: null,
      notes: [{ author_id: 2, text: 'Attach invoice, please', created_at: dayjs().subtract(1, 'day').add(30, 'minute').toISOString() }], attachments: [] }
  ],
  audit: []
}

let state = load() || defaultState
export const roles = ['employee','supervisor','manager']
export function getState(){ return state }
export function setState(updater){ state = typeof updater === 'function' ? updater(state) : updater; save(state) }

export function login(email, password){
  const user = state.users.find(u => u.email === email && u.password === password && u.is_active)
  if(!user) throw new Error('Invalid credentials')
  setState(s => ({...s, me: { id: user.id, name: user.name, email: user.email, role: user.role }}))
  log('user', user.id, 'login', {}, {}); return user
}
export function logout(){ setState(s => ({...s, me: null})) }
export function requireRole(role){ const me = state.me; if(!me || (role && me.role !== role)) throw new Error('Unauthorized'); return me }

export function createTransaction(data){
  const me = requireRole('employee')
  const id = Math.max(1000, ...state.transactions.map(t=>t.id)) + 1
  const code = `TX-${dayjs().format('YYYY')}-${String(id).slice(-5).padStart(5,'0')}`
  const tx = { id, code, status:'draft', currency:'SAR', created_by:me.id, created_at:dayjs().toISOString(), updated_at:dayjs().toISOString(),
    submitted_at:null, pre_approved_at:null, final_approved_at:null, disbursed_at:null, notes:[], attachments:[], ...data }
  setState(s => ({...s, transactions: [tx, ...s.transactions]})); log('transaction', id, 'create', {}, tx); return tx
}
export function updateTransaction(id, patch){
  const idx = state.transactions.findIndex(t=>t.id===id); if(idx<0) throw new Error('Not found')
  const old = state.transactions[idx]; const next = { ...old, ...patch, updated_at: dayjs().toISOString() }
  state.transactions[idx] = next; setState(s => ({...s})); log('transaction', id, 'update', old, next); return next
}
export function submitTransaction(id){
  const tx = state.transactions.find(t=>t.id===id); if(!tx) throw new Error('Not found'); if(tx.status!=='draft') throw new Error('Only draft can be submitted')
  updateTransaction(id, { status:'submitted', submitted_at:dayjs().toISOString() }); log('transaction', id, 'submit', {}, {})
}
export function preApprove(id){
  const me = requireRole('supervisor'); const tx = state.transactions.find(t=>t.id===id)
  if(!tx || !['submitted','returned'].includes(tx.status)) throw new Error('Not in supervisor queue')
  updateTransaction(id, { status:'pre_approved', pre_approved_at:dayjs().toISOString() }); log('transaction', id, 'pre_approve', {}, { actor: me.id })
}
export function finalApprove(id){
  const me = requireRole('manager'); const tx = state.transactions.find(t=>t.id===id)
  if(!tx || !['pre_approved','returned'].includes(tx.status)) throw new Error('Not in manager queue')
  updateTransaction(id, { status:'final_approved', final_approved_at:dayjs().toISOString() }); log('transaction', id, 'final_approve', {}, { actor: me.id })
}
export function rejectTx(id){
  const me = requireRole('manager'); const tx = state.transactions.find(t=>t.id===id)
  if(!tx || !['submitted','pre_approved','returned'].includes(tx.status)) throw new Error('Cannot reject')
  updateTransaction(id, { status:'rejected' }); log('transaction', id, 'reject', {}, { actor: me.id })
}
export function returnTx(id, note){
  const me = state.me; const tx = state.transactions.find(t=>t.id===id); if(!tx) throw new Error('Not found')
  if(!['submitted','pre_approved','final_approved','returned'].includes(tx.status)) throw new Error('Cannot return')
  tx.notes.push({ author_id: me?.id, text: note || 'Please fix', created_at: dayjs().toISOString() })
  updateTransaction(id, { status:'returned' }); log('transaction', id, 'return', {}, { actor: me?.id, note })
}
export function disburse(id){
  const me = requireRole('manager'); const tx = state.transactions.find(t=>t.id===id)
  if(!tx || tx.status!=='final_approved') throw new Error('Only final approved can be disbursed')
  updateTransaction(id, { status:'disbursed', disbursed_at:dayjs().toISOString() }); log('transaction', id, 'disburse', {}, { actor: me.id })
}
export function addNote(id, text){
  const me = state.me; const tx = state.transactions.find(t=>t.id===id); if(!tx) throw new Error('Not found')
  tx.notes.push({ author_id: me?.id, text, created_at: dayjs().toISOString() })
  updateTransaction(id, { notes: tx.notes }); log('transaction', id, 'note', {}, { actor: me?.id })
}
export function kpis(){ const list = state.transactions
  const revenue = list.filter(t=>t.type==='revenue').reduce((s,t)=>s+Number(t.amount||0),0)
  const expense = list.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount||0),0)
  return { revenue, expense, net: revenue-expense, pending: state.transactions.filter(t=>['submitted','pre_approved'].includes(t.status)).length }
}
export function monthlySeries(){
  const months = Array.from({length:6}, (_,i)=>dayjs().subtract(5-i,'month'))
  return months.map(m=>{
    const monthTx = state.transactions.filter(t=>dayjs(t.created_at).format('YYYY-MM')===m.format('YYYY-MM'))
    const rev = monthTx.filter(t=>t.type==='revenue').reduce((s,t)=>s+Number(t.amount||0),0)
    const exp = monthTx.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount||0),0)
    return { name: m.format('MMM'), revenue: rev, expenses: exp }
  })
}
function log(entity, entity_id, action, old_value, new_value){
  const rec = { id: (state.audit.at(-1)?.id || 0)+1, entity, entity_id, action, old_value, new_value, at: dayjs().toISOString() }
  setState(s => ({...s, audit: [...s.audit, rec]}))
}
