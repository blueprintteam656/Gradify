import {useEffect,useState} from 'react';
import {getDashboard,updateDashboard} from './dashboardStore';
import {useAuth} from '../../hooks/useAuth';
export function useDashboard(){const {currentUser}=useAuth(); const [data,setData]=useState(()=>getDashboard(currentUser)); useEffect(()=>{const refresh=()=>setData(getDashboard(currentUser));refresh();window.addEventListener('gradify-dashboard-change',refresh);return ()=>window.removeEventListener('gradify-dashboard-change',refresh)},[currentUser?.id,currentUser?.email]); return {data,save:fn=>setData(updateDashboard(currentUser,fn)),currentUser};}
