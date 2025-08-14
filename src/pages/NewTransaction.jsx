import React from 'react'
import { createTransaction } from '../store'
import { useNavigate } from 'react-router-dom'

export default function NewTransaction(){
  const nav = useNavigate()
  const [type, setType] = React.useState('expense')
  const [amount, setAmount] = React.useState(0)
  const [description, setDescription] = React.useState('')
  const [error, setError] = React.useState('')

  function onSubmit(e){
    e.preventDefault()
    try{ createTransaction({ type, amount: Number(amount), description }); nav('/tx') }
    catch(err){ setError(err.message) }
  }
  return (
    <div className="grid" style={{maxWidth:640}}>
      <div className="card">
        <h3>New Transaction</h3>
        <form onSubmit={onSubmit} className="grid">
          <div className="form-row">
            <div><label>Type</label>
              <select value={type} onChange={e=>setType(e.target.value)}>
                <option value="revenue">Revenue</option><option value="expense">Expense</option><option value="other">Other</option>
              </select>
            </div>
            <div><label>Amount (SAR)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} min="0" step="0.01" /></div>
          </div>
          <div><label>Description</label><textarea rows={3} value={description} onChange={e=>setDescription(e.target.value)} /></div>
          {error && <div className="card" style={{borderColor:'#fecaca', background:'#fff1f2'}}>{error}</div>}
          <div className="sticky-actions">
            <button className="btn" type="button" onClick={()=>history.back()}>Cancel</button>
            <button className="btn primary" type="submit">Save Draft</button>
          </div>
        </form>
      </div>
      <div className="card small">After saving, go to Transactions → Submit for approval.</div>
    </div>
  )
}
