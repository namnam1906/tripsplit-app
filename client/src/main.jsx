import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, ReceiptText, Users, WalletCards, Camera, Plus, ArrowRightLeft, Menu } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './styles.css';

const members = ['Mint', 'Palm', 'Ice', 'Nam', 'Beam'];
const initialExpenses = [
  { id: 1, title: 'ค่าอาหารเย็น Think Park', category: 'อาหาร', amount: 850, paidBy: 'Mint', splitWith: members },
  { id: 2, title: 'ค่าที่พัก Airbnb 2 คืน', category: 'ที่พัก', amount: 2800, paidBy: 'Palm', splitWith: ['Mint', 'Palm', 'Ice', 'Nam'] },
  { id: 3, title: 'รถแดงไปคาเฟ่', category: 'เดินทาง', amount: 420, paidBy: 'Ice', splitWith: members },
];

function calculateSettlement(expenses) {
  const balance = Object.fromEntries(members.map(m => [m, 0]));
  expenses.forEach(e => {
    balance[e.paidBy] += e.amount;
    const each = e.amount / e.splitWith.length;
    e.splitWith.forEach(m => { balance[m] -= each; });
  });
  const debtors = Object.entries(balance).filter(([,v]) => v < -0.01).map(([name,v]) => ({ name, amount: -v }));
  const creditors = Object.entries(balance).filter(([,v]) => v > 0.01).map(([name,v]) => ({ name, amount: v }));
  const settlements = [];
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({ from: debtors[i].name, to: creditors[j].name, amount: pay });
    debtors[i].amount -= pay; creditors[j].amount -= pay;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }
  return settlements;
}

function App() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [active, setActive] = useState('dashboard');
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const settlements = useMemo(() => calculateSettlement(expenses), [expenses]);
  const chartData = Object.values(expenses.reduce((acc, e) => {
    acc[e.category] ||= { name: e.category, value: 0 };
    acc[e.category].value += e.amount;
    return acc;
  }, {}));

  const addDemoExpense = () => setExpenses(prev => [...prev, {
    id: Date.now(), title: 'กาแฟและขนม', category: 'อาหาร', amount: 390, paidBy: 'Nam', splitWith: ['Mint','Nam','Beam']
  }]);

  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col border-r bg-white p-5">
      <div className="flex items-center gap-2 text-xl font-bold"><div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-600 text-white">T</div>TripSplit</div>
      <button className="mt-8 rounded-2xl bg-brand-600 px-4 py-3 font-semibold text-white shadow" onClick={addDemoExpense}>+ เพิ่มรายจ่าย</button>
      <nav className="mt-8 space-y-2">
        <Nav icon={<Home/>} label="Dashboard" active={active==='dashboard'} onClick={()=>setActive('dashboard')} />
        <Nav icon={<ReceiptText/>} label="รายรับ / รายจ่าย" active={active==='expenses'} onClick={()=>setActive('expenses')} />
        <Nav icon={<ArrowRightLeft/>} label="สรุปการจ่ายคืน" active={active==='settle'} onClick={()=>setActive('settle')} />
        <Nav icon={<Users/>} label="สมาชิก" active={active==='members'} onClick={()=>setActive('members')} />
      </nav>
      <div className="mt-auto rounded-2xl border bg-green-50 p-4 text-sm text-green-700">Google Drive / Sheet: พร้อมเชื่อมต่อ</div>
    </aside>

    <main className="lg:ml-64 pb-24 lg:pb-8">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-4 py-4 backdrop-blur lg:px-8">
        <div><p className="text-sm text-slate-500">ทริปปัจจุบัน</p><h1 className="text-xl font-bold lg:text-2xl">เชียงใหม่ 3 วัน 2 คืน</h1></div>
        <button className="rounded-xl border p-2 lg:hidden"><Menu size={20}/></button>
      </header>

      <section className="grid gap-4 p-4 lg:grid-cols-4 lg:p-8">
        <Card icon={<WalletCards/>} title="ค่าใช้จ่ายรวม" value={`฿${total.toLocaleString()}`} />
        <Card icon={<Users/>} title="สมาชิก" value={`${members.length} คน`} />
        <Card icon={<ReceiptText/>} title="รายการ" value={`${expenses.length} รายการ`} />
        <Card icon={<ArrowRightLeft/>} title="ต้องจ่ายคืน" value={`${settlements.length} รายการ`} danger />
      </section>

      <section className="grid gap-4 px-4 lg:grid-cols-3 lg:px-8">
        <div className="rounded-3xl border bg-white p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold">รายการล่าสุด</h2><button onClick={addDemoExpense} className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white"><Plus size={16} className="inline"/> เพิ่ม</button></div>
          <div className="space-y-3">
            {expenses.map(e => <div key={e.id} className="rounded-2xl border p-4 sm:flex sm:items-center sm:justify-between">
              <div><p className="font-semibold">{e.title}</p><p className="text-sm text-slate-500">{e.category} · จ่ายโดย {e.paidBy} · หาร {e.splitWith.length} คน</p></div>
              <p className="mt-2 font-bold sm:mt-0">฿{e.amount.toLocaleString()}</p>
            </div>)}
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">Dashboard</h2>
          <div className="h-56"><ResponsiveContainer><PieChart><Pie data={chartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85}>{chartData.map((_, i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>
          <div className="mt-2 space-y-2 text-sm">{chartData.map(d => <div className="flex justify-between" key={d.name}><span>{d.name}</span><b>฿{d.value.toLocaleString()}</b></div>)}</div>
        </div>
      </section>

      <section className="grid gap-4 p-4 lg:grid-cols-2 lg:p-8">
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">OCR ใบเสร็จ</h2>
          <div className="grid place-items-center rounded-3xl border-2 border-dashed bg-brand-50 p-8 text-center">
            <Camera className="mb-3 text-brand-600" size={42}/>
            <p className="font-semibold">ถ่ายรูป / อัปโหลดใบเสร็จ</p>
            <p className="text-sm text-slate-500">ระบบจะส่งไป Akson OCR ผ่าน backend หรือนำเข้า n8n flow</p>
            <button className="mt-4 rounded-xl border bg-white px-4 py-2 font-semibold">เลือกไฟล์</button>
          </div>
        </div>
        <div className="rounded-3xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold">สรุปใครต้องคืนใคร</h2>
          <div className="space-y-3">{settlements.map((s, i) => <div key={i} className="flex items-center justify-between rounded-2xl border p-4"><span><b>{s.from}</b> → <b>{s.to}</b></span><b className="text-brand-600">฿{s.amount.toFixed(2)}</b></div>)}</div>
        </div>
      </section>
    </main>

    <nav className="fixed bottom-0 left-0 right-0 grid grid-cols-4 border-t bg-white p-2 lg:hidden">
      <MobileNav icon={<Home/>} label="หน้าแรก" active={active==='dashboard'} onClick={()=>setActive('dashboard')} />
      <MobileNav icon={<ReceiptText/>} label="รายการ" active={active==='expenses'} onClick={()=>setActive('expenses')} />
      <MobileNav icon={<Plus/>} label="เพิ่ม" active onClick={addDemoExpense} />
      <MobileNav icon={<ArrowRightLeft/>} label="คืนเงิน" active={active==='settle'} onClick={()=>setActive('settle')} />
    </nav>
  </div>
}

function Nav({ icon, label, active, onClick }) { return <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold ${active?'bg-brand-50 text-brand-600':'text-slate-500 hover:bg-slate-50'}`}>{React.cloneElement(icon,{size:18})}{label}</button> }
function MobileNav({ icon, label, active, onClick }) { return <button onClick={onClick} className={`grid place-items-center gap-1 rounded-xl py-2 text-xs ${active?'text-brand-600':'text-slate-500'}`}>{React.cloneElement(icon,{size:20})}<span>{label}</span></button> }
function Card({ icon, title, value, danger }) { return <div className="rounded-3xl border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">{React.cloneElement(icon,{size:22})}</div><div><p className="text-sm text-slate-500">{title}</p><p className={`text-xl font-bold ${danger?'text-rose-500':''}`}>{value}</p></div></div></div> }

createRoot(document.getElementById('root')).render(<App />);
