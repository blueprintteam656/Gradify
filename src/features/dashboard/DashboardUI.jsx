import {Link} from 'react-router-dom';
export const shell={padding:'26px',background:'#f5f7fb',minHeight:'100vh',color:'#1c2e52'};
export const panel={background:'#fff',border:'1px solid #e6eaf2',borderRadius:14,padding:18,boxShadow:'0 2px 8px #1c2e5208'};
export function Stat({title,value,subtitle}){return <div style={panel}><div style={{fontSize:11,color:'#8995ad',fontWeight:700}}>{title.toUpperCase()}</div><div style={{fontSize:28,fontWeight:800,margin:'7px 0'}}>{value}</div><div style={{fontSize:12,color:'#73819b'}}>{subtitle}</div></div>}
export function Section({title,children,to,link='View All'}){return <section style={panel}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:15}}><h2 style={{fontSize:15,fontWeight:800,margin:0}}>{title}</h2>{to&&<Link to={to} style={{fontSize:12,color:'#4059bb'}}>{link}</Link>}</div>{children}</section>}
export function Empty({message}){return <div style={{padding:'25px 10px',color:'#8995ad',fontSize:13,textAlign:'center'}}>{message}</div>}
export function Tag({children}){return <span style={{fontSize:11,padding:'5px 9px',borderRadius:30,background:'#eef1ff',color:'#4059bb',whiteSpace:'nowrap'}}>{children}</span>}
export const button={border:0,background:'#1c2e52',color:'white',padding:'10px 15px',borderRadius:9,cursor:'pointer',fontWeight:700};
