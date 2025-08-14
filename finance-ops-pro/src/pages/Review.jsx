import React from 'react'
import dayjs from 'dayjs'
import { getState, preApprove, finalApprove, rejectTx, returnTx, disburse } from '../store'

export default function Review(){
  const st = getState()
  const me = st.me
  const queue = st.transactions.filter(t=>{
    if(me.role==='supervisor') return ['submitted','returned'].includes(t.status)
    if(me.role==='manager') return ['pre_approved','returned','final_approved'].includes(t.status)
    return false
  })
  function act(fn, id){ try{ fn(id) }catch(e){ alert(e.message) } }
  return (
    <div className="grid">
      <div className="card">
        <h3>{me.role==='supervisor' ? 'Pre-Approval Queue' : 'Manager Approval / Disbursement'}</h3>
        <table className="table">
          <thead><tr><th>Code</th><th>Type</th><th>Amount</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {queue.map(t=>(
              <tr key={t.id} className={`status-${t.status}`}>
                <td>{t.code}</td><td>{t.type}</td>
                <td>{Number(t.amount).toLocaleString()} {t.currency}</td>
                <td><span className="badge">{t.status}</span></td>
                <td>{dayjs(t.created_at).format('DD/MM/YYYY HH:mm')}</td>
                <td style={{display:'flex', gap:8}}>
                  {me.role==='supervisor' && <>
                    <button className="btn" onClick={()=>act(preApprove, t.id)}>Pre-Approve</button>
                    <button className="btn" onClick={()=>{ const n=prompt('Return reason?'); if(n) act(()=>returnTx(t.id, n), t.id) }}>Return</button>
                  </>}
                  {me.role==='manager' && <>
                    {t.status!=='final_approved' && <button className="btn" onClick={()=>act(finalApprove, t.id)}>Final Approve</button>}
                    {t.status!=='final_approved' && <button className="btn" onClick={()=>act(rejectTx, t.id)}>Reject</button>}
                    {t.status==='final_approved' && <button className="btn" onClick={()=>act(disburse, t.id)}>Mark Disbursed</button>}
                    {t.status!=='final_approved' && <button className="btn" onClick={()=>{ const n=prompt('Return reason?'); if(n) act(()=>returnTx(t.id, n), t.id) }}>Return</button>}
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {queue.length===0 && <p className="small">No items in your queue right now.</p>}
      </div>
    </div>
  )
}
