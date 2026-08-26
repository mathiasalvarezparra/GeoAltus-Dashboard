// ══════════════════════════════════════════
//  UTILIDADES — TOAST, CONFIRM, THEME, STORAGE
// ══════════════════════════════════════════

// TOAST
function toast(msg, tipo='ok', dur=3000){
  var wrap=document.getElementById('toast-wrap');
  if(!wrap)return;
  var icons={ok:'✓',err:'✕',warn:'⚑',info:'◎'};
  var el=document.createElement('div');
  el.className='toast t-'+tipo;
  el.innerHTML=`<span>${icons[tipo]||'◎'}</span><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(()=>{el.style.animation='toastIn .25s ease reverse';setTimeout(()=>el.remove(),250);},dur);
}

// CONFIRM MODAL
var _confirmResolve=null;
function confirmDialog(title,desc,itemLabel,okLabel='Eliminar',okColor='var(--red)'){
  return new Promise(resolve=>{
    _confirmResolve=resolve;
    document.getElementById('confirm-title').textContent=title;
    document.getElementById('confirm-desc').textContent=desc;
    var itemEl=document.getElementById('confirm-item');
    if(itemLabel){itemEl.textContent=itemLabel;itemEl.style.display='block';}
    else itemEl.style.display='none';
    var okBtn=document.getElementById('confirm-ok-btn');
    okBtn.textContent=okLabel;
    okBtn.style.background=okColor==='var(--red)'?'var(--red-dim)':'var(--gold-dim)';
    okBtn.style.color=okColor;
    okBtn.style.borderColor=okColor==='var(--red)'?'rgba(240,82,82,.3)':'rgba(233,185,73,.3)';
    document.getElementById('modal-confirm').classList.add('open');
  });
}
function resolveConfirm(val){
  document.getElementById('modal-confirm').classList.remove('open');
  if(_confirmResolve){_confirmResolve(val);_confirmResolve=null;}
}

// THEME
var currentTheme='dark';
function toggleTheme(){
  currentTheme=currentTheme==='dark'?'light':'dark';
  document.documentElement.classList.toggle('light',currentTheme==='light');
  document.getElementById('theme-toggle-btn').textContent=currentTheme==='light'?'🌙':'☀️';
  lsSet('ga_theme',currentTheme);
}
function initTheme(){
  var saved=lsGet('ga_theme')||'dark';
  currentTheme=saved;
  document.documentElement.classList.toggle('light',saved==='light');
  document.getElementById('theme-toggle-btn').textContent=saved==='light'?'🌙':'☀️';
}

// MOBILE
function toggleMobileMenu(){
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('mobile-overlay').classList.toggle('visible');
}
function closeMobileMenu(){
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('mobile-overlay').classList.remove('visible');
}

// UNSAVED INDICATOR
var _hasUnsaved=false;
function markUnsaved(){
  if(!_hasUnsaved){
    _hasUnsaved=true;
    var dot=document.getElementById('unsaved-dot');
    if(dot)dot.style.display='inline-block';
    document.title='● GeoAltus — Panel de Control';
  }
}
function markSaved(){
  _hasUnsaved=false;
  var dot=document.getElementById('unsaved-dot');
  if(dot)dot.style.display='none';
  document.title='GeoAltus — Panel de Control';
}

// LOCALSTORAGE
var LS_KEY='geoaltus_v11_data';
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function lsGet(k){try{var v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){return null;}}
function saveAllData(){
  lsSet(LS_KEY,{dataMeses,clientes,proyectos,trabajadores,histLiquidaciones,nextId,nextCliId,nextProyId,nextCotId,histEstados,cotizaciones,configEmpleador,plantillasCotizacion,preferencias});
  markSaved();
  // silent — no toast on every save
}
function loadAllData(){
  var saved=lsGet(LS_KEY);
  if(!saved)return false;
  try{
    if(saved.dataMeses){
      // Migración: descartar campos ing/egr huérfanos del localStorage.
      // Los totales ahora se calculan dinámicamente desde movs (única fuente de verdad).
      for(var mk in saved.dataMeses){
        var smd=saved.dataMeses[mk];
        if(smd&&typeof smd==='object'){
          dataMeses[mk]={movs:Array.isArray(smd.movs)?smd.movs:[]};
        }
      }
    }
    if(saved.clientes&&saved.clientes.length) clientes=saved.clientes;
    if(saved.proyectos&&saved.proyectos.length) proyectos=saved.proyectos;
    if(saved.trabajadores&&saved.trabajadores.length) trabajadores=saved.trabajadores;
    if(saved.histLiquidaciones) histLiquidaciones=saved.histLiquidaciones;
    if(saved.histEstados) Object.assign(histEstados,saved.histEstados);
    if(saved.nextId) nextId=saved.nextId;
    if(saved.nextCliId) nextCliId=saved.nextCliId;
    if(saved.nextProyId) nextProyId=saved.nextProyId;
    if(saved.nextCotId) nextCotId=saved.nextCotId;
    if(saved.cotizaciones) cotizaciones=saved.cotizaciones;
    if(saved.configEmpleador) Object.assign(configEmpleador,saved.configEmpleador);
    if(saved.plantillasCotizacion) plantillasCotizacion=saved.plantillasCotizacion;
    if(saved.preferencias) Object.assign(preferencias,saved.preferencias);
    return true;
  }catch(e){return false;}
}

// FORM VALIDATION HELPER
function validateForm(rules){
  // rules: [{id, label}]
  var ok=true;
  rules.forEach(r=>{
    var el=document.getElementById(r.id);
    if(!el)return;
    var val=(el.value||'').trim();
    var isNum=el.type==='number';
    var empty=isNum?(parseFloat(el.value)<=0||isNaN(parseFloat(el.value))):!val;
    var errEl=el.parentNode.querySelector('.field-error');
    if(empty){
      el.classList.add('error');
      var lbl=el.parentNode.querySelector('.form-label');
      if(lbl)lbl.classList.add('error');
      if(!errEl){var e=document.createElement('div');e.className='field-error';e.textContent='Campo requerido';el.parentNode.appendChild(e);}
      ok=false;
    } else {
      el.classList.remove('error');
      var lbl=el.parentNode.querySelector('.form-label');
      if(lbl)lbl.classList.remove('error');
      if(errEl)errEl.remove();
    }
  });
  return ok;
}
function clearValidation(ids){
  ids.forEach(id=>{
    var el=document.getElementById(id);
    if(!el)return;
    el.classList.remove('error');
    var lbl=el.parentNode.querySelector('.form-label');
    if(lbl)lbl.classList.remove('error');
    var errEl=el.parentNode.querySelector('.field-error');
    if(errEl)errEl.remove();
  });
}

// AUTOCOMPLETE RUT
function acRut(input){
  var q=(input.value||'').toLowerCase();
  var list=document.getElementById('ac-rut-list');
  if(!list)return;
  if(q.length<2){list.style.display='none';return;}
  var matches=clientes.filter(c=>c.rut.toLowerCase().includes(q)||c.nombre.toLowerCase().includes(q)).slice(0,6);
  if(!matches.length){list.style.display='none';return;}
  list.innerHTML=matches.map(c=>`<div class="autocomplete-item" onmousedown="selectAcRut('${c.rut}','${c.nombre.replace(/'/g,"\'")}')"><div class="ac-name">${c.nombre.split('(')[0].trim()}</div><div class="ac-rut">${c.rut}</div></div>`).join('');
  list.style.display='block';
}
function selectAcRut(rut,nombre){
  var inp=document.getElementById('r-rut');
  if(inp)inp.value=rut;
  // Auto-populate proyecto if matching
  var cliMatch=clientes.find(c=>c.rut===rut);
  if(cliMatch){
    var sel=document.getElementById('r-proyecto');
    if(sel){
      var proyMatch=proyectos.filter(p=>p.cliId===cliMatch.id&&p.estado==='activo');
      // rebuild options keeping the match
      poblarProyectoSelector(cliMatch.id);
    }
  }
  closeAc();
}
function closeAc(){
  var list=document.getElementById('ac-rut-list');
  if(list)list.style.display='none';
}
function poblarProyectoSelector(cliIdFiltro){
  var sel=document.getElementById('r-proyecto');
  if(!sel)return;
  var items=cliIdFiltro?proyectos.filter(p=>p.cliId===cliIdFiltro&&(p.estado==='activo'||p.estado==='cotizacion')):proyectos.filter(p=>p.estado==='activo'||p.estado==='cotizacion');
  sel.innerHTML='<option value="">— Sin proyecto —</option>'+items.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('');
}

// KEYBOARD SHORTCUTS
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||e.target.tagName==='SELECT')return;
  if(e.key==='n'||e.key==='N'){openModal();}
  if(e.key==='Escape'){
    closeModal();closeEdit();closePdf();closeModalTrab();closeModalCliente();closeModalProyecto();
    closeModalCotizacion();closeModalCotDetail();
    resolveConfirm(false);closeMobileMenu();
  }
});

//  CONSTANTES 
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const CAT_ING=['Levantamiento de Datos (topografía, drone, GPS, estación total)','Fotogrametría y Modelado (procesamiento vuelos, nubes de puntos, MDT)','GIS y Cartografía (análisis espacial, mapas, shapes, geodatabases)','Teledetección (NDVI, cambio de cobertura, clasificación satelital, GEE)','Geo IA (análisis geoespacial multicapa para la toma de decisiones)','Consultoría (asesorías, reuniones técnicas, revisión de proyectos)','Otros Servicios'];
const CAT_EGR=['Software y Licencias','Equipamiento','Movilización y Terreno','Honorarios Externos','Comunicaciones','Oficina y Admin','Capacitación','Otros Egresos'];
const CI=['#e9b949','#2dd4bf','#60a5fa','#4ade80','#a78bfa','#fb923c','#7a8fa8'];
const CE=['#f05252','#fb923c','#60a5fa','#a78bfa','#2dd4bf','#4ade80','#e9b949','#7a8fa8'];

const dataMeses={};

let currentMonth=3,currentYear=2026,tipoActual='ing',editIdx=null,nextId=200;
const COT=280800,SUELDO=981840,FIJOS=800000;
const fmt=n=>'$'+Math.round(n).toLocaleString('es-CL');
const fmtK=n=>n>=1000000?'$'+(n/1000000).toFixed(1)+'M':'$'+(n/1000).toFixed(0)+'K';
const catShort=c=>c.split(' (')[0];
const ivaStr=v=>v==='afecto'?'Afecto IVA':v==='exento'?'Exento':'Honorarios';
const ivaBadge=v=>v==='afecto'?'iva-afecto':v==='exento'?'iva-exento':'iva-hon';
function diasHasta(dia,off=0){const h=new Date(),t=new Date(h.getFullYear(),h.getMonth()+off,dia);if(t<h)t.setMonth(t.getMonth()+1);return Math.ceil((t-h)/86400000);}
// getMes/getMesKey defined in navigation section below

//  SIDEBAR TOGGLE 
let sidebarCollapsed=false;
function toggleSidebar(){
  sidebarCollapsed=!sidebarCollapsed;
  document.getElementById('sidebar').classList.toggle('collapsed',sidebarCollapsed);
  document.querySelector('.app').classList.toggle('collapsed',sidebarCollapsed);
  document.getElementById('sidebar-toggle').textContent=sidebarCollapsed?'>':'<';
  document.getElementById('sidebar-toggle').title=sidebarCollapsed?'Expandir menu':'Colapsar menu';
}

//  NAVEGACIN 
function showView(id,el){
  if(!id)return;
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('view-'+id).classList.add('active');
  if(el)el.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
  var titles={resumen:'Resumen General',libro:'Libro de Ingresos & Egresos',f29:'Gestión Tributaria',rem:'Remuneración & Cotizaciones',viab:'Viabilidad',stats:'Estadísticas',hist:'Historial & Búsqueda',clientes:'Clientes',proyectos:'Proyectos',export:'Exportación',alertas:'Centro de Alertas',cotizaciones:'Cotizaciones'};
  var subs={resumen:'Vista consolidada del mes',libro:'Registro y control de movimientos financieros',f29:'F29, F22, retenciones y calendario de obligaciones',rem:'Liquidaciones, cotizaciones PreviRed y trabajadores',viab:'Sostenibilidad, proyecciones y flujo de caja',stats:'Gráficos y análisis histórico anual',hist:'Búsqueda global de registros en todos los meses',clientes:'Fichas de clientes y facturación acumulada',proyectos:'Rentabilidad y control por proyecto',export:'Exportar datos, informes y respaldos',alertas:'Obligaciones pendientes y notificaciones del sistema',cotizaciones:'Propuestas comerciales · PDF profesional para clientes',config:'Datos del empleador, plantillas y preferencias del sistema'};
  document.getElementById('page-title').textContent=titles[id]||id;
  document.getElementById('page-sub').textContent=subs[id]||'';
  if(id==='libro'){poblarFiltrosCat();renderLibro();}
  if(id==='f29')renderF29View();
  if(id==='rem')renderRem();
  if(id==='viab')renderViab();
  if(id==='stats')renderStats();
  if(id==='hist')renderHist();
  if(id==='clientes')renderClientes();
  if(id==='proyectos')renderProyectos();
  if(id==='export')renderExport();
  if(id==='alertas')renderAlertas();
  if(id==='cotizaciones')renderCotizaciones();
  if(id==='config')renderConfigView();
}

// currentYear/Month para navegacin extendida (julio 2025 = inicio)
const INICIO_YEAR=2025, INICIO_MONTH=6; // julio=6

function changeMonth(dir){
  var m=currentMonth+dir, y=currentYear;
  if(m<0){m=11;y--;}
  else if(m>11){m=0;y++;}
  // No ir antes de julio 2025
  if(y<INICIO_YEAR||(y===INICIO_YEAR&&m<INICIO_MONTH))return;
  // No ir despus del mes actual
  var hoy=new Date();
  if(y>hoy.getFullYear()||(y===hoy.getFullYear()&&m>hoy.getMonth()))return;
  currentMonth=m; currentYear=y;
  renderAll();
}

function updateMonthNav(){
  var hoy=new Date();
  document.getElementById('month-label').textContent=MESES[currentMonth]+' '+currentYear;
  var atInicio=currentYear===INICIO_YEAR&&currentMonth===INICIO_MONTH;
  var atHoy=currentYear===hoy.getFullYear()&&currentMonth===hoy.getMonth();
  document.getElementById('btn-next').disabled=atHoy;
  var btnPrev=document.querySelector('.month-btn');
  if(btnPrev)btnPrev.disabled=atInicio;
  document.getElementById('foot-label').textContent=MESES[currentMonth]+' '+currentYear+' · Activo';
}

function getMesKey(){return currentYear+'-'+currentMonth;}
function getMes(){
  var k=getMesKey();
  if(!dataMeses[k])dataMeses[k]={movs:[]};
  return dataMeses[k];
}
// Totales SIEMPRE calculados desde movs — única fuente de verdad.
// Esto previene desincronización entre la lista de movimientos y los totales.
function getIng(d){return d&&d.movs?d.movs.filter(m=>m.tipo==='ing').reduce((s,m)=>s+m.monto,0):0;}
function getEgr(d){return d&&d.movs?d.movs.filter(m=>m.tipo==='egr').reduce((s,m)=>s+m.monto,0):0;}
