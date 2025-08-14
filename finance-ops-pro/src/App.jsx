import React from 'react'
import { Routes, Route, Link, Navigate, useNavigate, Outlet } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import NewTransaction from './pages/NewTransaction'
import Review from './pages/Review'
import { getState, logout } from './store'

function useStore(){
  const [tick, setTick] = React.useState(0)
  React.useEffect(()=>{ const i=setInterval(()=>setTick(t=>t+1),500); return ()=>clearInterval(i) },[])
  return getState()
}
function Layout(){
  const st = useStore(); const nav = useNavigate(); const me = st.me
  return (
    <div>
      <div className="nav">
        <div className="brand">Finance Ops Pro</div>
        <Link to="/" className="btn ghost">Dashboard</Link>
        <Link to="/tx" className="btn ghost">Transactions</Link>
        {me?.role==='employee' && <Link to="/new" className="btn ghost">New Transaction</Link>}
        {me?.role==='supervisor' && <Link to="/review" className="btn ghost">Pre-Approve</Link>}
        {me?.role==='manager' && <Link to="/review" className="btn ghost">Approvals</Link>}
        <div style={{marginLeft:'auto'}}>
          {me ? (<><span className="small">Signed in as {me.name} ({me.role})</span>{' '}
          <button className="btn" onClick={()=>{logout(); nav('/login')}}>Logout</button></>) : <Link to="/login" className="btn primary">Login</Link>}
        </div>
      </div>
      <div className="container"><Outlet/></div>
    </div>
  )
}
function RequireAuth({children}){ const st=getState(); return st.me ? children : <Navigate to="/login" replace /> }
export default function App(){
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route element={<Layout/>}>
        <Route index element={<RequireAuth><Dashboard/></RequireAuth>} />
        <Route path="/tx" element={<RequireAuth><Transactions/></RequireAuth>} />
        <Route path="/new" element={<RequireAuth><NewTransaction/></RequireAuth>} />
        <Route path="/review" element={<RequireAuth><Review/></RequireAuth>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
