import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import { UnitProvider } from './context/UnitContext';
import { manager, unit } from '../legacy-demo/fixtures';
import { collection, onSnapshot } from '../legacy-demo/firestore';
import { db } from '../core/firebase/config';

// The historical components use a local Firestore-shaped adapter in this demo.
// No authentication, production database, uploads, or external AI are initialized.
const App: React.FC = () => {
  const [data,setData] = useState<Record<string,any[]>>({});
  useEffect(() => {
    const names=['users','shifts','requests','todos','admin_todos','time_entries','feedback','polls'];
    const unsubscribe=names.map(name=>onSnapshot(collection(db,name),snapshot=>setData(previous=>({ ...previous, [name]:snapshot.docs.map(document=>({ id:document.id,...document.data() })) }))));
    return ()=>unsubscribe.forEach(fn=>fn());
  },[]);
  const [units] = useState([unit]);
  return <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
    <div role="status" style={{flexShrink:0,background:'#fef3c7',color:'#78350f',padding:'6px 12px',fontSize:12,textAlign:'center'}}>
      MintLeaf · LEGACY BEFORE · Fiktív adatok · A módosítások frissítéskor elvesznek
    </div>
    <div style={{flex:1,minHeight:0}}><UnitProvider currentUser={manager} allUnits={units}>
      <Dashboard currentUser={manager} onLogout={()=>location.reload()} isDemoMode={true}
        requests={data.requests||[]} shifts={data.shifts||[]} todos={data.todos||[]}
        adminTodos={data.admin_todos||[]} allUnits={units} allUsers={data.users||[]}
        permissions={{}} unitPermissions={{}} timeEntries={data.time_entries||[]}
        feedbackList={data.feedback||[]} polls={data.polls||[]} />
    </UnitProvider></div>
  </div>;
};
export default App;
