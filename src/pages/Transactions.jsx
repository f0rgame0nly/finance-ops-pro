import React from 'react'
import dayjs from 'dayjs'
import { getState, submitTransaction } from '../store'

export default function Transactions(){
  const st = getState()
  const [q, setQ] = React.useState('')
  const list = st.transactions.filter(t => !q || t.code.toLowerCase().includes(q.toLowerCase()) || (t.description||'').toLowerCase().includes(q.toLowerCase()))
  const me = st.me
  return (
    <div className="grid">
      <div className="card">
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <input placeholder="Search by code or description..." value={q} onChange={e=>setQ(e.target.value)} />
          <span className="small">Total: {list.length}</span>
        </div>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Code</th><th>Type</th><th>Amount</th><th>Status</th><th>Creator</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {list.map(t=>(
              <tr key={t.id} className={`status-${t.status}`}>
                <td>{t.code}</td>
                <td>{t.type}</td>
                <td>{Number(t.amount).toLocaleString()} {t.currency}</td>
                <td><span className="badge">{t.status}</span></td>
                <td>{st.users.find(u=>u.id===t.created_by)?.name || t.created_by}</td>
                <td>{dayjs(t.created_at).format('DD/MM/YYYY HH:mm')}</td>
                <td>{me?.role==='employee' && t.status==='draft' && (<button className="btn" onClick={()=>submitTransaction(t.id)}>Submit</button>)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
