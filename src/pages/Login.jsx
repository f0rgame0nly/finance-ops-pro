import React from 'react'
import { useNavigate } from 'react-router-dom'
import { login, getState } from '../store'

export default function Login(){
  const nav = useNavigate()
  const [email, setEmail] = React.useState('eman@demo.local')
  const [password, setPassword] = React.useState('123456')
  const [error, setError] = React.useState('')
  function onSubmit(e){
    e.preventDefault()
    try{ login(email, password); const me = getState().me; if(me.role==='employee') nav('/new'); else nav('/') }
    catch(err){ setError(err.message) }
  }
  return (
    <div className="container" style={{maxWidth:420}}>
      <h2>Sign in</h2>
      <p className="small">Demo: eman@demo.local / samar@demo.local / manager@demo.local — password: 123456</p>
      <form onSubmit={onSubmit} className="grid">
        <div><label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <div><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
        {error && <div className="card" style={{borderColor:'#fecaca', background:'#fff1f2'}}>{error}</div>}
        <button className="btn primary" type="submit">Login</button>
      </form>
    </div>
  )
}
