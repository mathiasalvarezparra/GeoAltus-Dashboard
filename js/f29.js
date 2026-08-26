
//  F29 VIEW 
const histEstados={};
let histYear=2026;

function setHistYear(yr){
  histYear=yr;
  document.getElementById('yr-2025').className=yr===2025?'btn btn-gold btn-sm':'btn btn-ghost btn-sm';
  document.getElementById('yr-2026').className=yr===2026?'btn btn-gold btn-sm':'btn btn-ghost btn-sm';
  var ppmTasa=parseFloat(document.getElementById('f29v-ppm-tasa').value)||0.25;
  var usaPPM=document.getElementById('f29v-ppm-toggle').checked;
  renderHistCards(ppmTasa,usaPPM);
}

function renderF29View(){
  var d=getMes();
  const{movs}=d;var ing=getIng(d),egr=getEgr(d);
  var ppmTasa=parseFloat(document.getElementById('f29v-ppm-tasa').value)||0.25;
  var usaPPM=document.getElementById('f29v-ppm-toggle').checked;
  document.getElementById('f29v-ppm-tasa-label').textContent=ppmTasa;

  var ventasAfectas=movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var comprasAfectas=movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var honBoletas=movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
  var ivaD=Math.round(ventasAfectas*0.19),ivaC=Math.round(comprasAfectas*0.19),ivaN=ivaD-ivaC;
  var ppm=usaPPM?Math.round(ventasAfectas*ppmTasa/100):0;
  var honRet=Math.round(honBoletas*0.1525);
  var total=ivaN+ppm+honRet;

  // Impuesto 2 categora desde liquidacin GUARDADA del mes actual
  var mesKey=currentYear+'-'+currentMonth;
  var liqGuardada=histLiquidaciones.find(h=>h.mesKey===mesKey);
  var imp2Cat=liqGuardada?liqGuardada.imp2:0;
  var totalConImp2=total+imp2Cat;

  document.getElementById('f29v-periodo').textContent=MESES[currentMonth]+' '+currentYear;
  document.getElementById('f29v-ventas').textContent=fmt(ventasAfectas);
  document.getElementById('f29v-debito').textContent='+'+fmt(ivaD);
  document.getElementById('f29v-compras').textContent=fmt(comprasAfectas);
  document.getElementById('f29v-credito').textContent='−'+fmt(ivaC);
  document.getElementById('f29v-neto').textContent=fmt(ivaN);
  document.getElementById('f29v-ppm').textContent=usaPPM?fmt(ppm):'No activo';
  document.getElementById('f29v-ppm-row').style.opacity=usaPPM?'1':'0.35';
  document.getElementById('f29v-ret').textContent=honRet>0?fmt(honRet):'—';
  document.getElementById('f29v-ret-row').style.opacity=honRet>0?'1':'0.35';
  // Imp 2 cat row
  if(!document.getElementById('f29v-imp2-row')){
    var neto=document.getElementById('f29v-ret').closest('.f29-row');
    var imp2Row=document.createElement('div');
    imp2Row.className='f29-row'; imp2Row.id='f29v-imp2-row';
    imp2Row.innerHTML=`<span class="f29-lbl">Imp. 2ª Categoría retenido</span><span class="f29-val" id="f29v-imp2" style="color:var(--purple)">—</span>`;
    neto.parentNode.insertBefore(imp2Row,neto.nextSibling);
  }
  document.getElementById('f29v-imp2').textContent=imp2Cat>0?fmt(imp2Cat):'$0';
  document.getElementById('f29v-imp2-row').style.opacity=imp2Cat>0?'1':'0.35';
  document.getElementById('f29v-imp2-row').title=liqGuardada?'Tomado de la liquidación guardada del mes':'Guarda la liquidación del mes en Remuneración para ver este valor';
  document.getElementById('f29v-total').textContent=fmt(totalConImp2);

  // Acumulados ao actual
  var yearKey=currentYear+'-';
  var anualDeb=0,anualCred=0,anualPPM=0,anualRet=0;
  Object.entries(dataMeses).filter(([k])=>k.startsWith(yearKey)).forEach(([,dm])=>{
    var va=dm.movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
    var ca=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
    var hb=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
    anualDeb+=Math.round(va*0.19); anualCred+=Math.round(ca*0.19);
    anualPPM+=usaPPM?Math.round(va*ppmTasa/100):0; anualRet+=Math.round(hb*0.1525);
  });
  document.getElementById('f29v-anual-deb').textContent=fmt(anualDeb);
  document.getElementById('f29v-anual-cred').textContent=fmt(anualCred);
  document.getElementById('f29v-anual-ppm').textContent=fmt(anualPPM);
  document.getElementById('f29v-anual-ret').textContent=fmt(anualRet);

  // DJ 1879
  var djBoletas=0,djRet=0;
  Object.entries(dataMeses).filter(([k])=>k.startsWith(yearKey)).forEach(([,dm])=>{
    var hb=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
    djBoletas+=hb; djRet+=Math.round(hb*0.1525);
  });
  document.getElementById('dj-boletas').textContent=fmt(djBoletas);
  document.getElementById('dj-retenido').textContent=fmt(djRet);
  document.getElementById('dj-pagado').textContent=fmt(djBoletas-djRet);

  // KPIs tributarios  calculados dinmicamente desde dataMeses
  var _yk2=currentYear+'-';
  var pagadoSII=0,mesesPagados=0;
  // Calcular F29 de cada mes desde registros reales
  Object.entries(dataMeses).filter(([k])=>k.startsWith(_yk2)).forEach(([k,dm])=>{
    var mesIdx=parseInt(k.split('-')[1]);
    var mesLabel=MESES[mesIdx]+' '+currentYear;
    if(histEstados[mesLabel]==='pagado'){
      var va=dm.movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
      var ca=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
      var hb=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
      var iD=Math.round(va*0.19),iC=Math.round(ca*0.19);
      var p=usaPPM?Math.round(va*ppmTasa/100):0,r=Math.round(hb*0.1525);
      // Imp 2 cat desde liquidacin guardada
      var liqMes=histLiquidaciones.find(h=>h.mesKey===k);
      var imp2=liqMes?liqMes.imp2:0;
      pagadoSII+=iD-iC+p+r+imp2; mesesPagados++;
    }
  });
  var f22saldo=calcF22Saldo(ppmTasa,usaPPM);
  document.getElementById('f29-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--blue)">
      <div class="kpi-top"><div class="kpi-lbl">F29 Mes Actual</div><div class="kpi-ico">⊞</div></div>
      <div class="kpi-val" style="color:var(--blue)">${fmt(totalConImp2)}</div>
      <div class="kpi-foot"><span class="muted">Vence 12 ${MESES[(currentMonth+1)%12]}</span></div>
    </div>
    <div class="kpi" style="--kc:var(--green)">
      <div class="kpi-top"><div class="kpi-lbl">Total Pagado SII ${currentYear}</div><div class="kpi-ico">✓</div></div>
      <div class="kpi-val" style="color:var(--green)">${fmt(pagadoSII)}</div>
      <div class="kpi-foot"><span class="muted">${mesesPagados} meses pagados</span></div>
    </div>
    <div class="kpi" style="--kc:var(--purple)">
      <div class="kpi-top"><div class="kpi-lbl">Ret. Honorarios 2026</div><div class="kpi-ico">◎</div></div>
      <div class="kpi-val" style="color:var(--purple)">${fmt(anualRet)}</div>
      <div class="kpi-foot"><span class="muted">DJ 1879 · Marzo 2027</span></div>
    </div>
    <div class="kpi" style="--kc:${f22saldo>=0?'var(--red)':'var(--green)'}">
      <div class="kpi-top"><div class="kpi-lbl">Proyección F22</div><div class="kpi-ico">▲</div></div>
      <div class="kpi-val" style="color:${f22saldo>=0?'var(--red)':'var(--green)'}">${fmt(Math.abs(f22saldo))}</div>
      <div class="kpi-foot"><span class="muted">${f22saldo>=0?'A pagar':'Devolución'} · Abr 2027</span></div>
    </div>`;

  renderHistCards(ppmTasa,usaPPM);
  renderF22(ppmTasa,usaPPM);
  renderCalendario();
}

function calcF22Saldo(ppmTasa,usaPPM){
  var _yk=currentYear+"-"; const ing2026=Object.entries(dataMeses).filter(([k])=>k.startsWith(_yk)).reduce((s,[,d])=>s+getIng(d),0);
  var egr2026=Object.entries(dataMeses).filter(([k])=>k.startsWith(_yk)).reduce((s,[,d])=>s+getEgr(d),0);
  var utilidad=ing2026-egr2026;
  var impuesto=Math.round(utilidad*0.25);
  var ppmPagado=usaPPM?Math.round(ing2026*ppmTasa/100):0;
  return impuesto-ppmPagado;
}

function renderHistCards(ppmTasa,usaPPM){
  var hist2025=[
    {mes:'Jul 2025',v:0,c:0,hb:0,anio:2025,mesIdx:6},
    {mes:'Ago 2025',v:0,c:0,hb:0,anio:2025,mesIdx:7},
    {mes:'Sep 2025',v:0,c:0,hb:0,anio:2025,mesIdx:8},
    {mes:'Oct 2025',v:0,c:0,hb:0,anio:2025,mesIdx:9},
    {mes:'Nov 2025',v:0,c:0,hb:0,anio:2025,mesIdx:10},
    {mes:'Dic 2025',v:0,c:0,hb:0,anio:2025,mesIdx:11},
  ];
  // Build hist2026 dynamically from dataMeses
  var hoy2=new Date();
  var hist2026=Array.from({length:12},(_, i)=>{
    var k=`2026-${i}`;
    var dm=dataMeses[k];
    var isFuture=new Date(2026,i,1)>hoy2;
    if(isFuture) return{mes:MESES[i]+' 2026',v:0,c:0,hb:0,futuro:true};
    var v=dm?dm.movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0):0;
    var c=dm?dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0):0;
    var hb=dm?dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0):0;
    var liq=histLiquidaciones.find(h=>h.mesKey===k);
    return{mes:MESES[i]+' 2026',v,c,hb,imp2:liq?liq.imp2:0,mesIdx:i,anio:2026};
  });
  var histData=histYear===2025?hist2025:hist2026;
  var hoy=new Date();
  document.getElementById('hist-cards').innerHTML=histData.map(h=>{
    if(h.futuro){
      return`<div class="hist-card" style="opacity:.35">
        <div class="hc-mes">${h.mes}</div>
        <div class="hc-total" style="color:var(--text3)">—</div>
        <div class="hc-rows"><div class="hc-row"><span class="hc-lbl" style="color:var(--text3)">Sin datos aún</span></div></div>
        <button class="hc-btn" style="background:var(--surface);color:var(--text3);border:1px solid var(--border);cursor:default">Futuro</button>
      </div>`;
    }
    var iD=Math.round(h.v*0.19),iC=Math.round(h.c*0.19);
    var p=usaPPM?Math.round(h.v*ppmTasa/100):0,ret=Math.round(h.hb*0.1525);
    var imp2dyn=h.imp2||0;
    var tot=iD-iC+p+ret+imp2dyn;
    var est=histEstados[h.mes]||'pendiente';
    var mesNombre=h.mes.split(' ')[0];
    var mesAnio=parseInt(h.mes.split(' ')[1]);
    var mesIdx=h.mesIdx!==undefined?h.mesIdx:MESES.findIndex(m=>m.slice(0,3)===mesNombre.slice(0,3));
    var vence=new Date(mesAnio,mesIdx+1,12);
    var autoEst=est==='pagado'?'pagado':vence<hoy?'vencido':'pendiente';
    // 2025 sin movimientos  misma lgica de estados que 2026
    if(h.v===0&&histYear===2025){
      var vence2025=new Date(h.anio,h.mesIdx+1,12);
      var autoEst2025=est==='pagado'?'pagado':vence2025<hoy?'vencido':'pendiente';
      var btnClass2025=autoEst2025==='pagado'?'hc-btn-pagado':autoEst2025==='vencido'?'hc-btn-vencido':'hc-btn-pendiente';
      var btnLabel2025=autoEst2025==='pagado'?'✓ Pagado':autoEst2025==='vencido'?'⚑ Vencido':'◉ Pendiente';
      return`<div class="hist-card ${autoEst2025}">
        <div class="hc-mes">${h.mes}</div>
        <div class="hc-total" style="color:${autoEst2025==='pagado'?'var(--green)':autoEst2025==='vencido'?'var(--red)':'var(--amber)'}">$0</div>
        <div class="hc-rows"><div class="hc-row"><span class="hc-lbl">Sin movimientos GeoAltus</span></div></div>
        <button class="hc-btn ${btnClass2025}" onclick="toggleEstado('${h.mes}')">${btnLabel2025}</button>
      </div>`;
    }
    var btnClass=autoEst==='pagado'?'hc-btn-pagado':autoEst==='vencido'?'hc-btn-vencido':'hc-btn-pendiente';
    var btnLabel=autoEst==='pagado'?'✓ Pagado':autoEst==='vencido'?'⚑ Vencido':'◉ Pendiente';
    return`<div class="hist-card ${autoEst}">
      <div class="hc-mes">${h.mes}</div>
      <div class="hc-total" style="color:${autoEst==='pagado'?'var(--green)':autoEst==='vencido'?'var(--red)':'var(--amber)'}">${fmt(tot)}</div>
      <div class="hc-rows">
        <div class="hc-row"><span class="hc-lbl">IVA Débito</span><span class="hc-val">${fmt(iD)}</span></div>
        <div class="hc-row"><span class="hc-lbl">IVA Crédito</span><span class="hc-val">${fmt(iC)}</span></div>
        ${p>0?`<div class="hc-row"><span class="hc-lbl">PPM</span><span class="hc-val">${fmt(p)}</span></div>`:''}
        ${ret>0?`<div class="hc-row"><span class="hc-lbl">Ret. Hon.</span><span class="hc-val">${fmt(ret)}</span></div>`:''}
        ${imp2dyn>0?`<div class="hc-row"><span class="hc-lbl">Imp. 2ª Cat.</span><span class="hc-val">${fmt(imp2dyn)}</span></div>`:''}
      </div>
      <button class="hc-btn ${btnClass}" onclick="toggleEstado('${h.mes}')">${btnLabel}</button>
    </div>`;
  }).join('');
}

function toggleEstado(mes){
  histEstados[mes]=histEstados[mes]==='pagado'?'pendiente':'pagado';
  renderF29View();saveAllData();
}

function renderF22(ppmTasa,usaPPM){
  var _yk2=currentYear+"-"; const ing2026=Object.entries(dataMeses).filter(([k])=>k.startsWith(_yk2)).reduce((s,[,d])=>s+getIng(d),0);
  var egr2026=Object.entries(dataMeses).filter(([k])=>k.startsWith(_yk2)).reduce((s,[,d])=>s+getEgr(d),0);
  var utilidad=ing2026-egr2026;
  var impuesto=Math.round(utilidad*0.25);
  var ppmPagado=usaPPM?Math.round(ing2026*ppmTasa/100):0;
  var saldo=impuesto-ppmPagado;
  document.getElementById('f22-proj').innerHTML=`
    <div class="f22-row"><span class="f22-label">Ingresos totales 2026 registrados</span><span class="f22-val" style="color:var(--green)">${fmt(ing2026)}</span></div>
    <div class="f22-row"><span class="f22-label">Egresos totales 2026 registrados</span><span class="f22-val" style="color:var(--red)">${fmt(egr2026)}</span></div>
    <div class="f22-row"><span class="f22-label">Utilidad imponible</span><span class="f22-val">${fmt(utilidad)}</span></div>
    <div class="f22-row"><span class="f22-label">Impuesto 1ª categoría (25%)</span><span class="f22-val" style="color:var(--amber)">${fmt(impuesto)}</span></div>
    <div class="f22-row"><span class="f22-label">PPM pagados 2026 (descuento)</span><span class="f22-val" style="color:var(--teal)">−${fmt(ppmPagado)}</span></div>
    <div class="f22-row" style="border-bottom:none;padding-top:8px">
      <span class="f22-label" style="font-weight:700;font-size:13px">${saldo>=0?'▶ Estimado a pagar':'▶ Devolución estimada'}</span>
      <span class="f22-val" style="font-size:18px;color:${saldo>=0?'var(--red)':'var(--green)'}">${fmt(Math.abs(saldo))}</span>
    </div>`;
}

// Genera dinámicamente los próximos vencimientos desde la fecha real de hoy — evita que el
// calendario quede fijo en fechas de un año/mes específico y termine mostrando plazos vencidos.
// F29: día 12 (no facturador electrónico) o día 20 (facturador electrónico) del mes siguiente al declarado.
// Cotizaciones previsionales: día 10 (declaración) / día 13 (pago vía PreviRed por internet) del mes siguiente.
// Fuente: Superintendencia de Pensiones (spensiones.cl) y SII (calendario tributario).
function renderCalendario(){
  var hoy=new Date();hoy.setHours(0,0,0,0);
  var diaF29=preferencias.facturaElectronica===false?12:20;
  var eventos=[];
  for(var i=0;i<3;i++){
    var fF29=new Date(hoy.getFullYear(),hoy.getMonth()+i,diaF29);
    var mesDeclF29=new Date(fF29.getFullYear(),fF29.getMonth()-1,1);
    eventos.push({mes:MESES[fF29.getMonth()]+' '+fF29.getFullYear(),tipo:'F29 '+MESES[mesDeclF29.getMonth()]+' '+mesDeclF29.getFullYear(),fecha:diaF29+' '+MESES[fF29.getMonth()]+' '+fF29.getFullYear(),dias:Math.round((fF29-hoy)/86400000)});
    var fCot=new Date(hoy.getFullYear(),hoy.getMonth()+i,13);
    var mesDeclCot=new Date(fCot.getFullYear(),fCot.getMonth()-1,1);
    eventos.push({mes:MESES[fCot.getMonth()]+' '+fCot.getFullYear(),tipo:'Cotizaciones '+MESES[mesDeclCot.getMonth()]+' (PreviRed)',fecha:'13 '+MESES[fCot.getMonth()]+' '+fCot.getFullYear(),dias:Math.round((fCot-hoy)/86400000)});
  }
  eventos=eventos.filter(e=>e.dias>=0).sort((a,b)=>a.dias-b.dias).slice(0,5);
  // Obligaciones anuales — la fecha exacta (día) la fija el SII cada año; se muestra a nivel de mes
  var anioDJ=hoy.getMonth()<2?hoy.getFullYear():hoy.getFullYear()+1;
  var anioF22=anioDJ;
  var anioTributario=anioDJ-1;
  var fDJ=new Date(anioDJ,2,15),fF22=new Date(anioF22,3,15);
  eventos.push({mes:'Mar '+anioDJ,tipo:'DJ 1879 Honorarios '+anioTributario,fecha:'Marzo '+anioDJ,dias:Math.round((fDJ-hoy)/86400000)});
  eventos.push({mes:'Abr '+anioF22,tipo:'F22 Año '+anioTributario,fecha:'Abril '+anioF22,dias:Math.round((fF22-hoy)/86400000)});
  var color=d=>d<=7?'var(--red)':d<=20?'var(--amber)':d<=60?'var(--gold)':'var(--text3)';
  document.getElementById('cal-grid').innerHTML=eventos.map(e=>`<div class="cal-item"><div class="cal-mes">${e.mes}</div><div class="cal-tipo">${e.tipo}</div><div class="cal-fecha">${e.fecha}</div><div class="cal-days" style="color:${color(e.dias)}">${e.dias}</div><div class="cal-days-lbl">días restantes</div></div>`).join('');
}
