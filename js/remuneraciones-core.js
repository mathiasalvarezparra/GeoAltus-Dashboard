



//  REMUNERACIN 
// Tramos Impuesto Único 2ª Categoría (Art. 43 LIR) — factores y rebajas FIJOS en UTM
// Fuente: https://www.sii.cl/valores_y_fechas/impuesto_2da_categoria/impuesto2026.htm
const TRAMOS = [
  {desde:0,     hasta:13.5,  tasa:0,    rebaja:0},
  {desde:13.5,  hasta:30,    tasa:0.04, rebaja:0.54},
  {desde:30,    hasta:50,    tasa:0.08, rebaja:1.74},
  {desde:50,    hasta:70,    tasa:0.135,rebaja:4.49},
  {desde:70,    hasta:90,    tasa:0.23, rebaja:11.14},
  {desde:90,    hasta:120,   tasa:0.304,rebaja:17.80},
  {desde:120,   hasta:310,   tasa:0.35, rebaja:23.32},
  {desde:310,   hasta:9999,  tasa:0.40, rebaja:38.82},
];

// Topes imponibles 2026 en UF — fijos para todo el año (Superintendencia de Pensiones)
const TOPE_AFP_UF = 90.0;    // AFP / Salud / Ley Accidentes
const TOPE_CES_UF = 135.2;   // Seguro de Cesantía

// Tasas fijas 2026
const TASA_SALUD = 0.07;
const TASA_CES_T_INDEF = 0.006;   // Trabajador contrato indefinido
const TASA_CES_E_INDEF = 0.024;   // Empleador contrato indefinido
const TASA_CES_E_PLAZO = 0.03;    // Empleador contrato plazo fijo/obra (trabajador 0%)
const TASA_SIS = 0.0154;          // Enero 2026 (baja a 1.50% desde agosto 2026)
const TASA_REFORMA_EMP = 0.01;    // Aporte empleador Ley 21.735 (ago/25 – jul/26)

// Tabla precargada de valores mensuales 2026
// UTM: valor oficial del SII (derivado de la tabla IUSC · tramo exento ÷ 13,5)
// UF: valor aproximado del último día de cada mes (se usa para calcular topes imponibles)
// IMM: Ingreso Mínimo Mensual vigente
const VALORES_MES_DEFAULT = {
  '2026-0':  {utm:69751, uf:39817, imm:539000},  // Enero
  '2026-1':  {utm:69611, uf:39800, imm:539000},  // Febrero
  '2026-2':  {utm:69889, uf:39838, imm:539000},  // Marzo
  '2026-3':  {utm:69889, uf:39842, imm:539000},  // Abril
  '2026-4':  {utm:70588, uf:39900, imm:539000},  // Mayo (IMM puede subir)
  '2026-5':  {utm:70588, uf:39950, imm:539000},  // Junio (provisorio)
  '2026-6':  {utm:70588, uf:40000, imm:539000},  // Julio (provisorio)
  '2026-7':  {utm:70588, uf:40050, imm:539000},  // Agosto (provisorio)
  '2026-8':  {utm:70588, uf:40100, imm:539000},  // Septiembre (provisorio)
  '2026-9':  {utm:70588, uf:40150, imm:539000},  // Octubre (provisorio)
  '2026-10': {utm:70588, uf:40200, imm:539000},  // Noviembre (provisorio)
  '2026-11': {utm:70588, uf:40250, imm:539000},  // Diciembre (provisorio)
};

// Devuelve los valores mensuales vigentes para un mesKey "YYYY-M" dado
// Prioridad: valoresMensuales editado por el usuario → VALORES_MES_DEFAULT → fallback
function getValoresMes(mesKey){
  var edit=(preferencias.valoresMensuales||{})[mesKey];
  var def=VALORES_MES_DEFAULT[mesKey];
  var fallback={utm:69889, uf:39842, imm:539000}; // Abril 2026
  return {
    utm: (edit&&edit.utm) || (def&&def.utm) || fallback.utm,
    uf:  (edit&&edit.uf)  || (def&&def.uf)  || fallback.uf,
    imm: (edit&&edit.imm) || (def&&def.imm) || fallback.imm,
  };
}

// Devuelve valores del mes actualmente seleccionado en la UI (currentYear + currentMonth)
function getValoresMesActual(){
  return getValoresMes(currentYear+'-'+currentMonth);
}

// Compatibilidad: UTM se mantiene como getter dinámico para código existente
// que la referencia como constante global
Object.defineProperty(window,'UTM',{get:function(){return getValoresMesActual().utm;}});

// Datos trabajadores
let trabajadores=[
  {id:1,nombre:'Mathias Álvarez',rut:'XX.XXX.XXX-X',cargo:'Geomensor / Fundador',sueldo:1200000,afp:10.46,afpNombre:'Uno',salud:'fonasa',tipoContrato:'indefinido',fechaContrato:'2025-07-11',estado:'activo'},
];
let trabSeleccionado=1;
// histLiquidaciones: datos reales guardados por el usuario
// Formato: {trabId, mesKey (ao-mes), mes (label), bruto, brutoRemunerado, cotizaciones, imp2, liquido, dias, diasLicencia, diasVacaciones, diasPermiso, tramos, estado, costoEmp}
let histLiquidaciones=[];
let editTrabId=null;

//  GUARDAR / MODIFICAR LIQUIDACIN 
function guardarLiquidacion(){
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  if(!t){alert('Selecciona un trabajador');return;}
  var bruto=parseFloat(document.getElementById('liq-bruto').value)||0;
  var grat=document.getElementById('liq-grat').value;
  var totalDias=diasEnMes(currentYear,currentMonth);
  var diasTrab=0,diasLic=0,diasVac=0,diasPerm=0;
  if(!tramosActuales.length){diasTrab=totalDias;}
  else{tramosActuales.forEach(tr=>{const d=Math.max(0,tr.hasta-tr.desde+1);if(tr.tipo==='trabajado')diasTrab+=d;else if(tr.tipo==='licencia')diasLic+=d;else if(tr.tipo==='vacaciones')diasVac+=d;else diasPerm+=d;});}
  var diasRem=diasTrab+diasVac;
  var diasAsignados=diasTrab+diasLic+diasVac+diasPerm;
  if(diasAsignados!==totalDias){
    if(!confirm(`Los días asignados (${diasAsignados}) no cuadran con el mes (${totalDias}). ¿Guardar igualmente?`))return;
  }
  var brutoRem=Math.round(bruto*(diasRem/totalDias));
  var d=calcLiqData(brutoRem,t.afp,diasRem,'completo',t.tipoContrato);
  var gratVal=grat==='mensual'?Math.round(brutoRem/12):0;
  var mesKey=currentYear+'-'+currentMonth;
  var mesLabel=MESES[currentMonth]+' '+currentYear;
  // Check if exists
  var existing=histLiquidaciones.findIndex(h=>h.trabId===trabSeleccionado&&h.mesKey===mesKey);
  var registro={
    trabId:trabSeleccionado, mesKey, mes:mesLabel,
    bruto, brutoRemunerado:brutoRem, gratVal,
    cotizaciones:d.cotizaciones, imp2:d.imp2, liquido:d.liquido+gratVal,
    costoEmp:brutoRem+d.cesE+d.sis+d.aporteReforma,
    dias:diasTrab, diasLicencia:diasLic, diasVacaciones:diasVac, diasPermiso:diasPerm,
    tramos:[...tramosActuales], estado:'pendiente',
    afpVal:d.afpVal, saludVal:d.saludVal, cesT:d.cesT, cesE:d.cesE, sis:d.sis,
    aporteReforma:d.aporteReforma, tipoContrato:d.tipoContrato, base:d.base,
  };
  if(existing>=0){histLiquidaciones[existing]=registro;}
  else{histLiquidaciones.push(registro);}
  // Show confirmation
  var notice=document.getElementById('liq-saved-notice');
  notice.style.display='block';
  notice.textContent=`✓ Liquidación de ${mesLabel} guardada — Líquido: ${fmt(registro.liquido)}`;
  var btn=document.getElementById('btn-guardar-liq');
  btn.textContent='✓ Modificar Liquidación';
  // Refresh
  renderHistLiq();
  renderHistAusentismo();
  saveAllData();toast('Liquidación guardada · Líquido: '+fmt(registro.liquido),'ok',4000);
  // Update F29 with imp2cat
  if(document.querySelector('#view-f29.active'))renderF29View();
}

function renderHistAusentismo(){
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  var ausData=histLiquidaciones.filter(h=>h.trabId===trabSeleccionado&&(h.diasLicencia>0||h.diasVacaciones>0||h.diasPermiso>0));
  document.getElementById('hist-aus-sub').textContent=(t?t.nombre:'Trabajador')+' · Ausentismo registrado';
  document.getElementById('hist-aus-count').textContent=ausData.length+' registros';
  var el=document.getElementById('hist-aus-content');
  if(!ausData.length){
    el.innerHTML=`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:20px;text-align:center">Sin registros de ausentismo</div>`;
    return;
  }
  el.innerHTML=`<table class="hist-liq-table"><thead><tr><th>Período</th><th>Días Trabajados</th><th>Licencia</th><th>Vacaciones</th><th>Permiso s/goce</th></tr></thead><tbody>`+
    ausData.map(h=>`<tr>
      <td>${h.mes}</td>
      <td style="font-family:var(--mono)">${h.dias||30}</td>
      <td style="font-family:var(--mono);color:var(--amber)">${h.diasLicencia||0}</td>
      <td style="font-family:var(--mono);color:var(--teal)">${h.diasVacaciones||0}</td>
      <td style="font-family:var(--mono);color:var(--red)">${h.diasPermiso||0}</td>
    </tr>`).join('')+'</tbody></table>';
}

function renderRem(){
  renderTrabList();
  renderTramosPeriodos();
  calcLiquidacion();
  renderTramos();
  renderHistLiq();
  renderHistAusentismo();
  renderRemKPIs();
}

function renderRemKPIs(){
  var trab=trabajadores.filter(t=>t.estado==='activo');
  var totalBruto=trab.reduce((s,t)=>s+t.sueldo,0);
  var totalLiq=trab.reduce((s,t)=>s+calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato).liquido,0);
  var totalCot=trab.reduce((s,t)=>{const d=calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato);return s+d.afpVal+d.saludVal+d.cesT+d.cesE+d.sis+d.aporteReforma;},0);
  var costoEmp=trab.reduce((s,t)=>{const d=calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato);return s+t.sueldo+d.cesE+d.sis+d.aporteReforma;},0);
  document.getElementById('rem-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--green)">
      <div class="kpi-top"><div class="kpi-lbl">Total Sueldos Brutos</div><div class="kpi-ico">◎</div></div>
      <div class="kpi-val" style="color:var(--green)">${fmt(totalBruto)}</div>
      <div class="kpi-foot"><span class="muted">${trab.length} trabajador${trab.length!==1?'es':''} activo${trab.length!==1?'s':''}</span></div>
    </div>
    <div class="kpi" style="--kc:var(--teal)">
      <div class="kpi-top"><div class="kpi-lbl">Total Líquido a Pagar</div><div class="kpi-ico">↓</div></div>
      <div class="kpi-val" style="color:var(--teal)">${fmt(totalLiq)}</div>
      <div class="kpi-foot"><span class="muted">Lo que reciben los trabajadores</span></div>
    </div>
    <div class="kpi" style="--kc:var(--blue)">
      <div class="kpi-top"><div class="kpi-lbl">Cotizaciones PreviRed</div><div class="kpi-ico">⊞</div></div>
      <div class="kpi-val" style="color:var(--blue)">${fmt(totalCot)}</div>
      <div class="kpi-foot"><span class="muted">AFP + Salud + Cesantía</span></div>
    </div>
    <div class="kpi" style="--kc:var(--gold)">
      <div class="kpi-top"><div class="kpi-lbl">Costo Total GeoAltus</div><div class="kpi-ico">▲</div></div>
      <div class="kpi-val" style="color:var(--gold)">${fmt(costoEmp)}</div>
      <div class="kpi-foot"><span class="muted">Bruto + cargas empleador</span></div>
    </div>`;
}

function renderTrabList(){
  var el=document.getElementById('trab-list');
  el.innerHTML=trabajadores.map(t=>`
    <div class="trab-card ${t.id===trabSeleccionado?'selected':''} ${t.estado==='inactivo'?'inactivo':''}" onclick="seleccionarTrab(${t.id})">
      <div class="trab-name">${t.nombre}</div>
      <div class="trab-meta">${t.cargo}</div>
      <div class="trab-meta" style="margin-top:2px">${fmt(t.sueldo)} bruto</div>
      <span class="trab-badge ${t.estado==='activo'?'trab-activo':'trab-inactivo'}">${t.estado==='activo'?'Activo':'Inactivo'}</span>
    </div>`).join('')+
    `<div style="display:flex;gap:6px;margin-top:4px;flex-wrap:wrap">
      ${trabSeleccionado?`<button class="btn btn-ghost btn-sm" style="flex:1;min-width:0" onclick="editarTrab(${trabSeleccionado})">✎ Editar</button>`:''}
      ${trabSeleccionado?`<button class="btn btn-ghost btn-sm" style="flex:1;min-width:0;color:var(--gold);border-color:rgba(233,185,73,.3)" onclick="openModalContrato(${trabSeleccionado})">📄 Contrato</button>`:''}
      ${trabSeleccionado?`<button class="btn btn-ghost btn-sm" style="flex:1;min-width:0;color:var(--red);border-color:rgba(240,82,82,.3)" onclick="eliminarTrabajador(${trabSeleccionado})">✕ Eliminar</button>`:''}
    </div>`;
}

function seleccionarTrab(id){
  trabSeleccionado=id;
  var t=trabajadores.find(x=>x.id===id);
  if(t){
    document.getElementById('liq-bruto').value=t.sueldo;
    tramosActuales=[];
    renderTramosPeriodos();
  }
  renderTrabList();
  calcLiquidacion();
  renderHistLiq();
  renderHistAusentismo();
}

// Feriados Chile 2025/2026
const FERIADOS={
  '2025-7-15':'Asunción de la Virgen','2025-9-18':'Independencia','2025-9-19':'Glorias del Ejército',
  '2025-10-12':'Encuentro de dos mundos','2025-10-31':'Día de las Iglesias Evangélicas',
  '2025-11-1':'Día de Todos los Santos','2025-12-8':'Inmaculada Concepción','2025-12-25':'Navidad',
  '2026-1-1':'Año Nuevo','2026-4-3':'Viernes Santo','2026-4-4':'Sábado Santo',
  '2026-5-1':'Día del Trabajo','2026-5-21':'Glorias Navales','2026-6-20':'Pueblos indígenas',
  '2026-6-29':'San Pedro y San Pablo','2026-7-16':'Virgen del Carmen','2026-8-15':'Asunción',
  '2026-9-18':'Independencia','2026-9-19':'Glorias del Ejército','2026-10-12':'Encuentro dos mundos',
  '2026-10-31':'Iglesias Evangélicas','2026-11-1':'Todos los Santos','2026-12-8':'Inmaculada',
  '2026-12-25':'Navidad',
};

function feriadosMes(anio,mes){
  var prefix=`${anio}-${mes+1}-`;
  return Object.entries(FERIADOS).filter(([k])=>k.startsWith(prefix)).map(([k,v])=>({dia:parseInt(k.split('-')[2]),nombre:v}));
}

// Tramos del mes
let tramosActuales=[];

function diasEnMes(anio,mes){return new Date(anio,mes+1,0).getDate();}

function agregarTramo(){
  var totalDias=diasEnMes(currentYear,currentMonth);
  var usados=tramosActuales.reduce((s,t)=>s+(t.hasta-t.desde+1),0);
  if(usados>=totalDias){alert('Ya tienes todos los días del mes asignados.');return;}
  tramosActuales.push({id:Date.now(),desde:usados+1,hasta:totalDias,tipo:'trabajado'});
  renderTramosPeriodos();
  calcLiquidacion();
}

function eliminarTramo(id){
  tramosActuales=tramosActuales.filter(t=>t.id!==id);
  renderTramosPeriodos();calcLiquidacion();
}

function updateTramo(id,campo,val){
  var t=tramosActuales.find(x=>x.id===id);
  if(t){t[campo]=campo==='tipo'?val:parseInt(val)||0;}
  calcLiquidacion();
}

function renderTramosPeriodos(){
  var totalDias=diasEnMes(currentYear,currentMonth);
  var el=document.getElementById('tramos-periodos');
  if(!tramosActuales.length){
    el.innerHTML=`<div style="font-size:11px;color:var(--text3);font-family:var(--mono);padding:10px;text-align:center">
      Haz clic en "+ Agregar período" para registrar los períodos del mes.<br>
      Por defecto se considera mes completo trabajado.</div>`;
    return;
  }
  el.innerHTML=tramosActuales.map((t,i)=>`
    <div style="display:grid;grid-template-columns:80px 80px 1fr auto;gap:8px;align-items:center;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:9px 13px">
      <div>
        <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">DESDE DÍA</div>
        <input type="number" min="1" max="${totalDias}" value="${t.desde}" onchange="updateTramo(${t.id},'desde',this.value);renderTramosPeriodos()" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:6px;font-family:var(--mono);font-size:12px;outline:none">
      </div>
      <div>
        <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">HASTA DÍA</div>
        <input type="number" min="1" max="${totalDias}" value="${t.hasta}" onchange="updateTramo(${t.id},'hasta',this.value);renderTramosPeriodos()" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:6px;font-family:var(--mono);font-size:12px;outline:none">
      </div>
      <div>
        <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">TIPO</div>
        <select onchange="updateTramo(${t.id},'tipo',this.value)" style="width:100%;background:var(--card);border:1px solid var(--border);color:var(--text);padding:5px 8px;border-radius:6px;font-family:var(--font);font-size:12px;outline:none">
          <option value="trabajado" ${t.tipo==='trabajado'?'selected':''}>Trabajado</option>
          <option value="licencia" ${t.tipo==='licencia'?'selected':''}>Licencia Médica</option>
          <option value="vacaciones" ${t.tipo==='vacaciones'?'selected':''}>Vacaciones</option>
          <option value="permiso" ${t.tipo==='permiso'?'selected':''}>Permiso sin goce</option>
        </select>
      </div>
      <button class="action-btn del" onclick="eliminarTramo(${t.id})">✕</button>
    </div>`).join('');
}

function calcLiquidacion(){
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  if(!t)return;
  var bruto=parseFloat(document.getElementById('liq-bruto').value)||0;
  var grat=document.getElementById('liq-grat').value;
  var totalDias=diasEnMes(currentYear,currentMonth);
  var feriados=feriadosMes(currentYear,currentMonth);

  // Feriados box
  var ferTxt=feriados.length>0
    ?`${feriados.length} feriado${feriados.length!==1?'s':''} este mes: `+feriados.map(f=>`día ${f.dia} (${f.nombre})`).join(', ')+' — no se descuentan del sueldo mensual'
    :'Sin feriados este mes';
  document.getElementById('feriados-text').textContent=ferTxt;

  // Calcular das por tipo desde tramos
  var diasTrabajados=0,diasLicencia=0,diasVacaciones=0,diasPermiso=0;
  if(!tramosActuales.length){
    diasTrabajados=totalDias; // mes completo por defecto
  } else {
    tramosActuales.forEach(tr=>{
      var d=Math.max(0,tr.hasta-tr.desde+1);
      if(tr.tipo==='trabajado') diasTrabajados+=d;
      else if(tr.tipo==='licencia') diasLicencia+=d;
      else if(tr.tipo==='vacaciones') diasVacaciones+=d;
      else if(tr.tipo==='permiso') diasPermiso+=d;
    });
  }
  var diasAsignados=diasTrabajados+diasLicencia+diasVacaciones+diasPermiso;

  // Contador das
  var counter=document.getElementById('dias-count');
  var status=document.getElementById('dias-status');
  counter.textContent=`${diasAsignados}/${totalDias}`;
  if(diasAsignados===totalDias){counter.style.color='var(--green)';status.textContent='✓ Completo';status.style.color='var(--green)';}
  else if(diasAsignados>totalDias){counter.style.color='var(--red)';status.textContent='⚠ Excede el mes';status.style.color='var(--red)';}
  else{counter.style.color='var(--amber)';status.textContent=`Faltan ${totalDias-diasAsignados} días`;status.style.color='var(--amber)';}

  // Das remunerados = trabajados + vacaciones (licencia la paga Fonasa, permiso no se paga)
  var diasRemunerados=diasTrabajados+diasVacaciones;
  var brutoRemunerado=Math.round(bruto*(diasRemunerados/totalDias));
  var d=calcLiqData(brutoRemunerado,t.afp,diasRemunerados,'completo',t.tipoContrato);
  var gratVal=grat==='mensual'?Math.round(brutoRemunerado/12):0;
  var afpNombreTxt=t.afpNombre?`AFP ${t.afpNombre}`:'AFP';
  var saludLblCorto=(t.salud||'fonasa')==='fonasa'?'Fonasa':'Isapre';
  var contratoLbl=t.tipoContrato==='plazo_fijo'?'Plazo fijo':(t.tipoContrato==='obra_faena'?'Obra o faena':'Indefinido');

  document.getElementById('liq-nombre-titulo').textContent=t.nombre;
  document.getElementById('liq-cargo-titulo').textContent=t.cargo+' · '+afpNombreTxt+' · '+saludLblCorto+' · '+contratoLbl;
  document.getElementById('liq-mes-badge').textContent=MESES[currentMonth]+' '+currentYear;

  // Ausentismo resumen
  var ausBox=document.getElementById('aus-box');
  if(diasLicencia>0||diasPermiso>0){
    ausBox.style.display='block';
    var silEstimado=Math.round(bruto*(diasLicencia/totalDias)*0.9);
    var detalle='';
    if(diasLicencia>0) detalle+=`<div class="aus-row"><span class="aus-lbl">Días con licencia médica</span><span class="aus-val">${diasLicencia} días</span></div>
      <div class="aus-row"><span class="aus-lbl">Subsidio SIL estimado (Fonasa)</span><span class="aus-val" style="color:var(--teal)">${fmt(silEstimado)} aprox.</span></div>`;
    if(diasPermiso>0) detalle+=`<div class="aus-row"><span class="aus-lbl">Días permiso sin goce</span><span class="aus-val">${diasPermiso} días — sin pago</span></div>`;
    document.getElementById('aus-detalle').innerHTML=detalle;
  } else { ausBox.style.display='none'; }

  // Aviso de tope imponible aplicado (si la remuneración supera 90 UF o 135,2 UF)
  var topeBox=document.getElementById('liq-tope-aviso');
  if(topeBox){
    if(d.topeAFPAplicado||d.topeCESAplicado){
      var msgs=[];
      if(d.topeAFPAplicado) msgs.push(`AFP/Salud/SIS calculados sobre tope de ${fmt(d.topeAFP)} (90 UF)`);
      if(d.topeCESAplicado) msgs.push(`Cesantía calculada sobre tope de ${fmt(d.topeCES)} (135,2 UF)`);
      topeBox.style.display='block';
      topeBox.innerHTML='⚠ Tope imponible aplicado — '+msgs.join(' · ');
    } else {
      topeBox.style.display='none';
    }
  }

  // Cesantía trabajador se omite para contratos no indefinidos
  var cesTTexto=(t.tipoContrato==='indefinido')
    ? {clase:'liq-desc',label:'Seguro Cesantía trabajador (0.6%)',nota:'AFC Chile',val:'−'+fmt(d.cesT),color:'var(--red)'}
    : {clase:'',label:'Seguro Cesantía trabajador',nota:`No aplica en contrato ${contratoLbl.toLowerCase()} — 100% cargo empleador`,val:'$0',color:'var(--text3)'};

  // Render filas
  var cont=document.getElementById('liq-rows-container');
  var rows=[
    {clase:'liq-haber',label:'Sueldo Base',nota:diasRemunerados<totalDias?`${diasRemunerados} días remunerados de ${totalDias}`:'Mes completo',val:fmt(brutoRemunerado),color:'var(--green)'},
    ...(gratVal>0?[{clase:'liq-haber',label:'Gratificación mensual',nota:'1/12 sueldo anual',val:fmt(gratVal),color:'var(--green)'}]:[]),
    {divider:true},
    {clase:'liq-desc',label:`Cotización ${afpNombreTxt} (${t.afp}%)`,nota:'Cuenta capitalización individual',val:'−'+fmt(d.afpVal),color:'var(--red)'},
    {clase:'liq-desc',label:`Cotización Salud ${saludLblCorto} (7%)`,nota:(t.salud||'fonasa')==='fonasa'?'Sistema de salud público':'Plan privado de salud',val:'−'+fmt(d.saludVal),color:'var(--red)'},
    cesTTexto,
    {divider:true},
    {clase:'',label:'Base Imponible 2ª Categoría',nota:'Bruto − Cotizaciones previsionales',val:fmt(d.base),color:'var(--text2)'},
    ...(d.imp2>0?[{clase:'liq-desc',label:'Impuesto 2ª Categoría',nota:'Retención mensual — se declara en F29',val:'−'+fmt(d.imp2),color:'var(--red)'}]:[{clase:'',label:'Impuesto 2ª Categoría',nota:'No aplica (base bajo tramo imponible)',val:'$0',color:'var(--text3)'}]),
    {divider:true},
    {clase:'liq-total-liq',label:'▶ SUELDO LÍQUIDO',nota:'Lo que recibe el trabajador',val:fmt(d.liquido),color:'var(--green)'},
    {divider:true},
    {clase:'liq-costo-emp',label:'▶ Costo total GeoAltus (solo referencia interna)',nota:`Bruto + Cesantía emp. (${t.tipoContrato==='indefinido'?'2.4%':'3%'}) + SIS (1.54%) + Reforma Ley 21.735 (1%) — no aparece en PDF`,val:fmt(brutoRemunerado+d.cesE+d.sis+d.aporteReforma),color:'var(--gold)'},
  ];
  cont.innerHTML='<div class="liq-rows">'+rows.map(r=>{
    if(r.divider) return '<div class="liq-divider"></div>';
    return`<div class="liq-row ${r.clase||''}">
      <div class="liq-row-left">
        <div class="liq-row-label">${r.label}</div>
        ${r.nota?`<div class="liq-row-nota">${r.nota}</div>`:''}
      </div>
      <div class="liq-row-val" style="color:${r.color}">${r.val}</div>
    </div>`;
  }).join('')+'</div>';

  // PreviRed
  document.getElementById('prev-afp-trab').textContent=fmt(d.afpVal);
  document.getElementById('prev-salud').textContent=fmt(d.saludVal);
  document.getElementById('prev-ces-t').textContent=fmt(d.cesT);
  document.getElementById('prev-ces-e').textContent=fmt(d.cesE);
  document.getElementById('prev-sis').textContent=fmt(d.sis);
  var prevReformaEl=document.getElementById('prev-reforma');
  if(prevReformaEl) prevReformaEl.textContent=fmt(d.aporteReforma);
  // Etiquetas dinámicas en las cards PreviRed
  var prevAfpLbl=document.getElementById('prev-afp-trab-label');
  if(prevAfpLbl) prevAfpLbl.textContent=afpNombreTxt+' (trabajador)';
  var prevAfpSub=document.getElementById('prev-afp-trab-sub');
  if(prevAfpSub) prevAfpSub.textContent=t.afp+'% sueldo bruto';
  var prevSaludLbl=document.getElementById('prev-salud-label');
  if(prevSaludLbl) prevSaludLbl.textContent=saludLblCorto+' (trabajador)';
  var prevCesTSub=document.getElementById('prev-ces-t-sub');
  if(prevCesTSub) prevCesTSub.textContent=(t.tipoContrato==='indefinido'?'0.6% sueldo bruto':'No aplica en '+contratoLbl.toLowerCase());
  var prevCesESub=document.getElementById('prev-ces-e-sub');
  if(prevCesESub) prevCesESub.textContent=(t.tipoContrato==='indefinido'?'2.4%':'3.0%')+' · Cargo GeoAltus';
  document.getElementById('prev-total').textContent=fmt(d.afpVal+d.saludVal+d.cesT+d.cesE+d.sis+d.aporteReforma);

  // Show save area
  var saveArea=document.getElementById('liq-save-area');
  if(saveArea) saveArea.style.display='block';
  var mesKey=currentYear+'-'+currentMonth;
  var existing=histLiquidaciones.find(h=>h.trabId===trabSeleccionado&&h.mesKey===mesKey);
  var btn=document.getElementById('btn-guardar-liq');
  var notice=document.getElementById('liq-saved-notice');
  if(btn){btn.textContent=existing?'✓ Modificar Liquidación':'✓ Guardar Liquidación';}
  if(notice&&!existing){notice.style.display='none';}
  else if(notice&&existing){notice.style.display='block';notice.textContent=`Liquidación guardada — Líquido: ${fmt(existing.liquido)} · Estado: ${existing.estado}`;}

  renderTramos();
  renderSaldoVacaciones(t);
}

function renderSaldoVacaciones(t){
  if(!t||!t.fechaContrato) return;
  var saldo=calcularSaldoVacaciones(t);
  var card=document.querySelector(`.trab-card[onclick="seleccionarTrab(${t.id})"]`);
  if(card){
    var existing=card.querySelector('.vac-saldo');
    if(existing) existing.remove();
    var div=document.createElement('div');
    div.className='vac-saldo';
    div.style.cssText='font-size:10px;font-family:var(--mono);color:var(--teal);margin-top:4px';
    var ico=saldo.disponibles>=15?'⚠':'🏖';
    var col=saldo.disponibles>=15?'var(--amber)':'var(--teal)';
    div.style.color=col;
    div.title=`Antigüedad: ${saldo.años}a ${saldo.mesesExtra}m · Generados: ${saldo.generados} · Usados: ${saldo.usados}`;
    div.textContent=`${ico} Vacaciones: ${saldo.disponibles} días hábiles disponibles`;
    card.appendChild(div);
  }
}

// Cálculo de vacaciones según art. 67 Código del Trabajo Chile
// - 15 días hábiles por año cumplido
// - +1 día extra cada 3 años sobre 10 años de antigüedad (tope 35)
// - Acumulación proporcional desde el primer día (15/12 ≈ 1.25 días/mes)
// - El primer derecho legal se adquiere al cumplir 1 año, pero se contabiliza la acumulación
function calcularSaldoVacaciones(t){
  if(!t||!t.fechaContrato)return{generados:0,usados:0,disponibles:0,años:0,mesesExtra:0,extraAntiguedad:0};
  var inicio=new Date(t.fechaContrato+'T00:00:00');
  var hoy=new Date();
  if(isNaN(inicio.getTime())||inicio>hoy)return{generados:0,usados:0,disponibles:0,años:0,mesesExtra:0,extraAntiguedad:0};
  // Antigüedad en años y meses
  var años=hoy.getFullYear()-inicio.getFullYear();
  var mesesExtra=hoy.getMonth()-inicio.getMonth();
  if(hoy.getDate()<inicio.getDate())mesesExtra--;
  if(mesesExtra<0){años--;mesesExtra+=12;}
  // Días extra por antigüedad (después de 10 años, +1 cada 3 años, tope 35 totales)
  var extraAntiguedad=años>=10?Math.min(20,Math.floor((años-10)/3)+1):0;
  var diasPorAño=15+extraAntiguedad;
  // Generados totales: años cumplidos × diasPorAño + meses extra × proporcional
  var generados=Math.round(años*diasPorAño + mesesExtra*(diasPorAño/12));
  // Usados (sólo del trabajador y solo días registrados como vacaciones)
  var usados=histLiquidaciones.filter(h=>h.trabId===t.id).reduce((s,h)=>s+(h.diasVacaciones||0),0);
  var disponibles=Math.max(0,generados-usados);
  return{generados,usados,disponibles,años,mesesExtra,extraAntiguedad};
}

function onPeriodoChange(){ calcLiquidacion(); }

function calcLiqData(bruto, afpTasa, dias, tipo, tipoContrato){
  var diasMes=30;
  var prop=dias/diasMes;
  var brutoP=tipo==='permiso'?0:Math.round(bruto*prop);

  // Valores del mes vigente (UTM, UF) para calcular topes en pesos
  var vm=getValoresMesActual();
  var topeAFP=Math.round(TOPE_AFP_UF*vm.uf);   // 90 UF (AFP, Salud, Ley Accidentes, SIS, Reforma)
  var topeCES=Math.round(TOPE_CES_UF*vm.uf);   // 135,2 UF (Seguro Cesantía)

  // Base imponible topeada (aplica por separado para AFP/Salud y para Cesantía)
  var brutoAFP=Math.min(brutoP,topeAFP);
  var brutoCES=Math.min(brutoP,topeCES);

  // Cotizaciones del trabajador
  var afpTasaD=afpTasa/100;
  var afpVal=Math.round(brutoAFP*afpTasaD);
  var saludVal=Math.round(brutoAFP*TASA_SALUD);
  var tc=tipoContrato||'indefinido';
  // Cesantía: indefinido 0,6%+2,4%; plazo fijo / obra: 0%+3%
  var cesT=(tc==='indefinido')?Math.round(brutoCES*TASA_CES_T_INDEF):0;
  var cesE=(tc==='indefinido')?Math.round(brutoCES*TASA_CES_E_INDEF):Math.round(brutoCES*TASA_CES_E_PLAZO);

  // Cotizaciones de cargo del empleador (no descuentan al trabajador)
  var sis=Math.round(brutoAFP*TASA_SIS);
  var aporteReforma=Math.round(brutoAFP*TASA_REFORMA_EMP); // Ley 21.735 — 1% patronal

  // Base para Impuesto de Segunda Categoría = bruto proporcional − cotizaciones legales
  // (el topeo se aplicó sólo a los descuentos; la base imponible parte del brutoP real)
  var base=brutoP-afpVal-saludVal-cesT;
  var UTMmes=vm.utm;
  var baseUTM=base/UTMmes;
  var imp2=0;
  for(const t of TRAMOS){
    if(baseUTM>t.desde&&baseUTM<=t.hasta){
      imp2=Math.max(0,Math.round((base*t.tasa)-(t.rebaja*UTMmes)));
      break;
    }
  }
  var liquido=base-imp2;
  var cotizaciones=afpVal+saludVal+cesT;
  // Flags para la UI
  var topeAFPAplicado=brutoP>topeAFP;
  var topeCESAplicado=brutoP>topeCES;
  return{brutoP,afpVal,saludVal,cesT,cesE,sis,aporteReforma,base,imp2,liquido,cotizaciones,
         topeAFP,topeCES,topeAFPAplicado,topeCESAplicado,tipoContrato:tc};
}

function renderTramos(){
  var bruto=parseFloat(document.getElementById('liq-bruto').value)||1200000;
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  var afp=t?t.afp:10.46;
  var tc=t?t.tipoContrato:'indefinido';
  var d=calcLiqData(bruto,afp,30,'completo',tc);
  var UTMmes=getValoresMesActual().utm;
  var baseUTM=d.base/UTMmes;
  var el=document.getElementById('tramos-list');
  el.innerHTML=TRAMOS.map(tr=>{
    var activo=baseUTM>tr.desde&&baseUTM<=tr.hasta;
    return`<div class="tramo-row ${activo?'activo':''}">
      <span>${fmt(Math.round(tr.desde*UTMmes))} – ${tr.hasta>=9999?'sin tope':fmt(Math.round(tr.hasta*UTMmes))}</span>
      <span>${(tr.tasa*100).toFixed(1)}%</span>
      <span>${activo?'◀ Tu tramo actual':''}</span>
    </div>`;
  }).join('');
}

function renderHistLiq(){
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  var hist=histLiquidaciones.filter(h=>!trabSeleccionado||h.trabId===trabSeleccionado).sort((a,b)=>a.mesKey>b.mesKey?-1:1);
  document.getElementById('hist-liq-sub').textContent=(t?t.nombre:'Todos')+' · Historial liquidaciones';
  document.getElementById('hist-liq-count').textContent=hist.length+' registro'+(hist.length!==1?'s':'');
  var tbody=document.getElementById('hist-liq-tbody');
  if(!hist.length){
    tbody.innerHTML=`<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--text3);font-family:var(--mono)">Sin liquidaciones guardadas. Usa "Guardar Liquidación" para registrar.</td></tr>`;
    return;
  }
  tbody.innerHTML=hist.map(h=>{
    var trab=trabajadores.find(x=>x.id===h.trabId);
    var ausInfo=[h.diasLicencia>0?`${h.diasLicencia}d lic`:'',h.diasVacaciones>0?`${h.diasVacaciones}d vac`:'',h.diasPermiso>0?`${h.diasPermiso}d perm`:''].filter(Boolean).join(' · ')||'Mes completo';
    var estadoBtn=h.estado==='pagado'
      ?`<span class="badge bg" style="cursor:pointer" onclick="toggleEstadoLiq('${h.mesKey}',${h.trabId})" title="Clic para marcar Pendiente">✓ Pagado</span>`
      :`<span class="badge ba" style="cursor:pointer" onclick="toggleEstadoLiq('${h.mesKey}',${h.trabId})" title="Clic para marcar Pagado">◉ Pendiente</span>`;
    return`<tr>
      <td>${trab?trab.nombre:'—'}</td>
      <td style="font-family:var(--mono)">${h.mes}</td>
      <td style="font-family:var(--mono)">${fmt(h.bruto)}</td>
      <td style="font-family:var(--mono);color:var(--red)">−${fmt(h.cotizaciones)}</td>
      <td style="font-family:var(--mono);color:var(--red)">${h.imp2>0?'−'+fmt(h.imp2):'$0'}</td>
      <td style="font-family:var(--mono);color:var(--green);font-weight:700">${fmt(h.liquido)}</td>
      <td style="font-family:var(--mono);color:var(--text3);font-size:11px">${ausInfo}</td>
      <td>${estadoBtn}</td>
      <td><div class="row-actions"><button class="action-btn" onclick="verLiqPDF('${h.mesKey}',${h.trabId})" title="Descargar PDF">↓</button><button class="action-btn del" onclick="eliminarLiquidacion('${h.mesKey}',${h.trabId})" title="Eliminar liquidación">✕</button></div></td>
    </tr>`;
  }).join('');
}

async function eliminarLiquidacion(mesKey,trabId){
  var idx=histLiquidaciones.findIndex(x=>x.mesKey===mesKey&&x.trabId===trabId);
  if(idx<0)return;
  var h=histLiquidaciones[idx];
  var trab=trabajadores.find(x=>x.id===trabId);
  var nombre=trab?trab.nombre:'Trabajador';
  var ok=await confirmDialog('¿Eliminar liquidación?','Esta acción no se puede deshacer. Se eliminará el registro guardado del historial.',`${nombre} · ${h.mes} · Líquido: ${fmt(h.liquido)}`);
  if(!ok)return;
  histLiquidaciones.splice(idx,1);
  // Si la liquidación eliminada corresponde al trabajador y mes actualmente seleccionados,
  // recalcular para que el botón vuelva a mostrar "Guardar Liquidación"
  var mesKeyActual=currentYear+'-'+currentMonth;
  if(trabId===trabSeleccionado&&mesKey===mesKeyActual){
    calcLiquidacion();
  }
  renderHistLiq();
  renderHistAusentismo();
  renderTrabList();
  saveAllData();
  toast('Liquidación eliminada','warn');
}

function toggleEstadoLiq(mesKey,trabId){
  var h=histLiquidaciones.find(x=>x.mesKey===mesKey&&x.trabId===trabId);
  if(!h)return;
  h.estado=h.estado==='pagado'?'pendiente':'pagado';
  renderHistLiq();
}

// MODAL TRABAJADOR
var TRAB_FIELDS=['nombre','rut','nacimiento','nacionalidad','civil','domicilio','email','telefono','cargo','sueldo','bono-mov','bono-col','afp','salud','tipo-contrato','fecha','fecha-termino','lugar','jornada','obra','banco','tipo-cuenta','n-cuenta','estado'];
function limpiarCamposTrab(){TRAB_FIELDS.forEach(f=>{var el=document.getElementById('trab-'+f);if(el){if(el.tagName==='SELECT')el.selectedIndex=0;else el.value='';}});}
function openModalTrab(){
  editTrabId=null;
  document.getElementById('trab-modal-title').textContent='Agregar Trabajador';
  limpiarCamposTrab();
  document.getElementById('trab-nacionalidad').value='Chilena';
  document.getElementById('trab-jornada').value='Lunes a viernes, 08:30–17:30';
  document.getElementById('trab-estado').value='activo';
  document.getElementById('trab-tipo-contrato').value='indefinido';
  document.getElementById('modal-trab').classList.add('open');
}
function editarTrab(id){
  var t=trabajadores.find(x=>x.id===id);if(!t)return;
  editTrabId=id;
  document.getElementById('trab-modal-title').textContent='Editar Trabajador';
  var setV=(f,v)=>{var el=document.getElementById('trab-'+f);if(el)el.value=v||'';};
  setV('nombre',t.nombre);setV('rut',t.rut);setV('nacimiento',t.nacimiento);
  setV('nacionalidad',t.nacionalidad||'Chilena');setV('civil',t.civil||'soltero/a');
  setV('domicilio',t.domicilio);setV('email',t.email);setV('telefono',t.telefono);
  setV('cargo',t.cargo);setV('sueldo',t.sueldo);
  setV('bono-mov',t.bonoMov);setV('bono-col',t.bonoCol);
  // AFP: si tenemos afpNombre, seleccionar esa opción exacta; si no, hacer match por tasa
  var afpSel=document.getElementById('trab-afp');
  if(afpSel){
    var idx=-1;
    if(t.afpNombre){
      for(var i=0;i<afpSel.options.length;i++){
        if(afpSel.options[i].dataset.nombre===t.afpNombre){idx=i;break;}
      }
    }
    if(idx<0 && t.afp!=null){
      for(var i=0;i<afpSel.options.length;i++){
        if(parseFloat(afpSel.options[i].value)===parseFloat(t.afp)){idx=i;break;}
      }
    }
    afpSel.selectedIndex=idx>=0?idx:0;
  }
  setV('salud',t.salud||'fonasa');
  setV('tipo-contrato',t.tipoContrato||'indefinido');
  setV('fecha',t.fechaContrato);setV('fecha-termino',t.fechaTermino);
  setV('lugar',t.lugar);setV('jornada',t.jornada||'Lunes a viernes, 08:30–17:30');
  setV('obra',t.obra);setV('banco',t.banco);setV('tipo-cuenta',t.tipoCuenta);
  setV('n-cuenta',t.nCuenta);setV('estado',t.estado||'activo');
  document.getElementById('modal-trab').classList.add('open');
}
function closeModalTrab(){document.getElementById('modal-trab').classList.remove('open');}
// Captura el nombre de la AFP seleccionada desde data-nombre del <option>
function onAfpChange(){
  var sel=document.getElementById('trab-afp');
  if(!sel) return;
  var opt=sel.options[sel.selectedIndex];
  // Se usa al guardar — nada que renderizar por ahora
}
function getAfpNombreActual(){
  var sel=document.getElementById('trab-afp');
  if(!sel) return 'Uno';
  var opt=sel.options[sel.selectedIndex];
  return opt?.dataset?.nombre || 'Uno';
}
function guardarTrabajador(){
  var nombre=document.getElementById('trab-nombre').value.trim();
  if(!validateForm([{id:'trab-nombre'}]))return;
  var getV=(f)=>{var el=document.getElementById('trab-'+f);return el?el.value.trim():'';};
  var datos={
    nombre,rut:getV('rut'),
    nacimiento:getV('nacimiento'),nacionalidad:getV('nacionalidad')||'Chilena',
    civil:getV('civil')||'soltero/a',domicilio:getV('domicilio'),
    email:getV('email'),telefono:getV('telefono'),
    cargo:getV('cargo'),
    sueldo:parseFloat(document.getElementById('trab-sueldo').value)||0,
    bonoMov:parseFloat(document.getElementById('trab-bono-mov').value)||0,
    bonoCol:parseFloat(document.getElementById('trab-bono-col').value)||0,
    afp:parseFloat(document.getElementById('trab-afp').value)||10.46,
    afpNombre:getAfpNombreActual(),
    salud:getV('salud')||'fonasa',
    tipoContrato:getV('tipo-contrato')||'indefinido',
    fechaContrato:getV('fecha'),fechaTermino:getV('fecha-termino'),
    lugar:getV('lugar'),jornada:getV('jornada'),obra:getV('obra'),
    banco:getV('banco'),tipoCuenta:getV('tipo-cuenta'),nCuenta:getV('n-cuenta'),
    estado:getV('estado')||'activo',
  };
  if(editTrabId){Object.assign(trabajadores.find(x=>x.id===editTrabId),datos);}
  else{trabajadores.push({id:Date.now(),...datos});}
  closeModalTrab();renderRem();saveAllData();toast(editTrabId?'Trabajador actualizado':'Trabajador guardado','ok');
}

async function eliminarTrabajador(id){
  var t=trabajadores.find(x=>x.id===id);
  if(!t)return;
  // Bloquear si tiene liquidaciones históricas — preserva integridad de F22, certificados y fiscalización SII/DT
  var liqsDelTrab=histLiquidaciones.filter(h=>h.trabId===id);
  if(liqsDelTrab.length>0){
    await confirmDialog(
      'No se puede eliminar',
      `${t.nombre} tiene ${liqsDelTrab.length} liquidación${liqsDelTrab.length!==1?'es':''} registrada${liqsDelTrab.length!==1?'s':''} en el historial. Para preservar la integridad contable (F22, certificados, fiscalización SII/DT), no se permite borrar trabajadores con historial. En su lugar, edita la ficha y márcalo como "Inactivo".`,
      null,
      'Entendido',
      'var(--gold)'
    );
    return;
  }
  // Si no tiene historial, permitir borrado con confirmación
  var ok=await confirmDialog(
    '¿Eliminar trabajador?',
    'Esta acción no se puede deshacer. Se eliminará la ficha completa.',
    `${t.nombre} · ${t.cargo} · ${fmt(t.sueldo)} bruto`
  );
  if(!ok)return;
  trabajadores=trabajadores.filter(x=>x.id!==id);
  // Reasignar selección si el eliminado era el seleccionado
  if(trabSeleccionado===id){
    trabSeleccionado=trabajadores.length?trabajadores[0].id:null;
  }
  renderRem();saveAllData();toast('Trabajador eliminado','warn');
}
