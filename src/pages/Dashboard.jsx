import React from 'react'
import { kpis, monthlySeries, getState } from '../store'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export default function Dashboard(){
  const st = getState()
  const { revenue, expense, net, pending } = kpis()
  const data = monthlySeries()
  return (
    <div className="grid">
      <div className="grid kpi">
        <KPI title="Total Revenue (SAR)" value={revenue.toLocaleString()} />
        <KPI title="Total Expenses (SAR)" value={expense.toLocaleString()} />
        <KPI title="Net (SAR)" value={net.toLocaleString()} />
        <KPI title="Pending approvals" value={pending} />
      </div>
      <div className="grid two">
        <div className="card">
          <h3>Monthly Revenue vs. Expenses</h3>
          <div style={{width:'100%', height:300}}>
            <ResponsiveContainer>
              <AreaChart data={data}>
                <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                <Area type="monotone" dataKey="revenue" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expenses" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card">
          <h3>Quick Actions</h3>
          <ul>
            {st.me?.role==='employee' && <li><a href="/new" className="btn">Add Transaction</a></li>}
            {st.me?.role==='supervisor' && <li><a href="/review" className="btn">Review (Pre-Approve)</a></li>}
            {st.me?.role==='manager' && <li><a href="/review" className="btn">Approval Queue</a></li>}
          </ul>
          <p className="small">All times assumed Asia/Riyadh; currency in SAR.</p>
        </div>
      </div>
    </div>
  )
}
function KPI({title, value}){ return <div className="card"><div className="small">{title}</div><div style={{fontSize:28, fontWeight:700}}>{value}</div></div> }
