// Frontend-only data layer. User-scoped localStorage is a prototype, NOT an authorization boundary.
const KEY = 'gradify-dashboard-v1';
const empty = () => ({projects:[], tasks:[], deliverables:[], reviews:[], meetings:[], activities:[], suggestions:[]});
const readAll = () => {try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}};
export function getDashboard(user) {const all=readAll(); return {...empty(),...(all[String(user?.id ?? user?.email ?? 'anonymous')]||{})};}
export function updateDashboard(user, updater) {const id=String(user?.id ?? user?.email ?? 'anonymous'); const all=readAll(); const next=updater(getDashboard(user)); all[id]=next; localStorage.setItem(KEY,JSON.stringify(all)); window.dispatchEvent(new Event('gradify-dashboard-change')); return next;}
export const percent = (done,total) => total?Math.round(done/total*100):0;
export const isDone = status => ['completed','approved','done'].includes(String(status).toLowerCase());
