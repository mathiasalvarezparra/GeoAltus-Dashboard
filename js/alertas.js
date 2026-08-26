
// ══════════════════════════════════════════
//  ALERTAS
// ══════════════════════════════════════════
function buildAlertas(){
  var hoy=new Date();
  var mesKey=currentYear+'-'+currentMonth;
  var d=getMes();
  var movs=d.movs;
  var ingMovs=movs.filter(m=>m.tipo==='ing'),egrMovs=movs.filter(m=>m.tipo==='egr');
  var ing=ingMovs.reduce((s,m)=>s+m.monto,0);
  var egr=egrMovs.reduce((s,m)=>s+m.monto,0);
  var ventasAfectas=ingMovs.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var comprasAfectas=egrMovs.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var honBoletas=egrMovs.filter(m=>m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
  var ivaD=Math.round(ventasAfectas*0.19),ivaC=Math.round(comprasAfectas*0.19);
  var usaPPM=document.getElementById('ppm-toggle')?.checked??true;
  var ppm=usaPPM?Math.round(ventasAfectas*0.0025):0;
  var honRet=Math.round(honBoletas*0.1525);
  var imp2Cat=histLiquidaciones.filter(h=>h.mesKey===mesKey).reduce((s,h)=>s+h.imp2,0);
  var f29=ivaD-ivaC+ppm+honRet+imp2Cat;
  var df29=diasHasta(12,1);
  var dcot=diasHasta(30,0);
  var gastosFijos=_viabNum('viab-fijos')||0;
  var costoSueldos=trabajadores.filter(t=>t.estado==='activo').reduce((s,t)=>{var dd=calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato);return s+t.sueldo+dd.cesE+dd.sis+dd.aporteReforma;},0);
  var meta=gastosFijos+costoSueldos+f29+(COT||0);
  var pct=meta>0?Math.round(ing/meta*100):0;
  var totalIngAnual=Object.entries(dataMeses).filter(([k])=>k.startsWith(currentYear+'-')).reduce((s,[,dd])=>s+getIng(dd),0);
  var metaAnual=_viabNum('viab-meta-año')||0;
  var pctAnual=metaAnual>0?Math.round(totalIngAnual/metaAnual*100):0;

  var alerts=[];

  // ── TRIBUTARIAS ──
  var f29Label=fmt(f29);
  var mesF29LABEL=MESES[(currentMonth+1)%12];
  if(df29<=0) alerts.push({cat:'trib',sev:'ad',i:'🚨',t:'F29 VENCIDO',d:`${f29Label} debía pagarse el 12 ${mesF29LABEL}. Paga en SII.cl con multa e interés.`,action:'Ir a SII.cl',url:'https://zeus.sii.cl/cvc/stc/stc.html'});
  else if(df29<=7) alerts.push({cat:'trib',sev:'ad',i:'⚑',t:`F29 vence en ${df29} días`,d:`${f29Label} · 12 ${mesF29LABEL} ${currentYear}. ¡Urgente!`,action:'Calcular F29',nav:'f29'});
  else if(df29<=21) alerts.push({cat:'trib',sev:'aw',i:'⚑',t:`F29 en ${df29} días`,d:`${f29Label} · 12 ${mesF29LABEL} ${currentYear}`,action:'Ver detalle',nav:'f29'});
  else alerts.push({cat:'trib',sev:'ao',i:'✓',t:`F29 al día`,d:`Próximo vencimiento: 12 ${mesF29LABEL} · ${f29Label}`,action:'Ver F29',nav:'f29'});

  if(dcot<=0) alerts.push({cat:'trib',sev:'ad',i:'🚨',t:'Cotizaciones VENCIDAS',d:`Plazo era el 30 ${MESES[currentMonth]}. Paga en previred.com con recargo.`,action:'Ir a PreviRed',url:'https://previred.com'});
  else if(dcot<=5) alerts.push({cat:'trib',sev:'ad',i:'◎',t:`Cotizaciones en ${dcot} días`,d:`${fmt(COT||0)} · 30 ${MESES[currentMonth]} ${currentYear}. ¡Urgente!`,action:'Ir a PreviRed',url:'https://previred.com'});
  else if(dcot<=10) alerts.push({cat:'trib',sev:'aw',i:'◎',t:`Cotizaciones en ${dcot} días`,d:`${fmt(COT||0)} · PreviRed · 30 ${MESES[currentMonth]}`,action:'Ir a PreviRed',url:'https://previred.com'});
  else alerts.push({cat:'trib',sev:'ao',i:'✓',t:'Cotizaciones al día',d:`Próximo vencimiento: 30 ${MESES[currentMonth]} · ${fmt(COT||0)}`,action:'Ver Rem.',nav:'rem'});

  // Imp. 2ª categoría
  var trabConImp2=trabajadores.filter(t=>{var dd=calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato);return dd.imp2>0&&t.estado==='activo';});
  var liqMesActual=histLiquidaciones.filter(h=>h.mesKey===mesKey);
  var trabSinLiq=trabajadores.filter(t=>t.estado==='activo'&&!liqMesActual.find(h=>h.trabId===t.id));
  if(trabSinLiq.length>0){
    alerts.push({cat:'rem',sev:'aw',i:'◎',t:`${trabSinLiq.length} liquidación${trabSinLiq.length>1?'es':''} sin guardar`,d:`${trabSinLiq.map(t=>t.nombre).join(', ')} — El Imp. 2ª Cat. no se incluirá en el F29 hasta guardar.`,action:'Ir a Remuneración',nav:'rem'});
  }
  if(imp2Cat>0){
    alerts.push({cat:'trib',sev:'ai',i:'⊞',t:`Imp. 2ª Categoría: ${fmt(imp2Cat)}`,d:`Incluido en el F29 de ${MESES[currentMonth]}. ${trabConImp2.length} trabajador${trabConImp2.length!==1?'es':''} con retención activa.`,action:'Ver F29',nav:'f29'});
  } else if(trabConImp2.length>0 && trabSinLiq.length===0){
    alerts.push({cat:'trib',sev:'ai',i:'⊞',t:`Imp. 2ª Cat. detectado`,d:`${trabConImp2.map(t=>t.nombre).join(', ')} tiene retención. Guarda la liquidación del mes para incluirlo en el F29.`,action:'Ir a Remuneración',nav:'rem'});
  }

  // DJ 1879 (marzo)
  if(hoy.getMonth()<=2&&hoy.getFullYear()>2025){
    var djDias=Math.ceil((new Date(hoy.getFullYear(),2,31)-hoy)/86400000);
    if(djDias<=30) alerts.push({cat:'trib',sev:'aw',i:'⊞',t:`DJ 1879 en ${djDias} días`,d:`Declaración jurada honorarios ${hoy.getFullYear()-1}. Plazo 31 marzo.`,action:'Ver F29',nav:'f29'});
  }

  // ── REMUNERACIÓN ──
  if(trabSinLiq.length===0 && trabajadores.filter(t=>t.estado==='activo').length>0){
    alerts.push({cat:'rem',sev:'ao',i:'✓',t:'Todas las liquidaciones guardadas',d:`${MESES[currentMonth]} ${currentYear} · ${liqMesActual.length} liquidación${liqMesActual.length!==1?'es':''}`});
  }
  var diasVacPendientes=0;
  trabajadores.filter(t=>t.estado==='activo').forEach(t=>{
    if(!t.fechaContrato)return;
    var s=calcularSaldoVacaciones(t);
    diasVacPendientes+=s.disponibles;
  });
  if(diasVacPendientes>=15) alerts.push({cat:'rem',sev:'aw',i:'🏖',t:`${diasVacPendientes} días de vacaciones acumulados`,d:'Considera planificar el uso de vacaciones para evitar deuda laboral.',action:'Ver Rem.',nav:'rem'});

  // ── PROYECTOS ──
  var proyActivos=proyectos.filter(p=>p.estado==='activo');
  var proyVencidos=proyActivos.filter(p=>p.fin&&new Date(p.fin)<hoy);
  if(proyVencidos.length>0) alerts.push({cat:'proy',sev:'ad',i:'◫',t:`${proyVencidos.length} proyecto${proyVencidos.length>1?'s':''} con plazo vencido`,d:proyVencidos.map(p=>p.nombre).join(', '),action:'Ver Proyectos',nav:'proyectos'});
  var proyXFact=proyectos.filter(p=>p.estado==='activo'&&p.presupuesto>0&&p.facturado<p.presupuesto*0.5);
  if(proyXFact.length>0) alerts.push({cat:'proy',sev:'aw',i:'◫',t:`${proyXFact.length} proyecto${proyXFact.length>1?'s':''} con facturación baja`,d:`Menos del 50% facturado: ${proyXFact.map(p=>p.nombre).join(', ')}`,action:'Ver Proyectos',nav:'proyectos'});
  var proyCotz=proyectos.filter(p=>p.estado==='cotizacion');
  if(proyCotz.length>0) alerts.push({cat:'proy',sev:'ai',i:'◎',t:`${proyCotz.length} cotización${proyCotz.length>1?'es':''} pendiente${proyCotz.length>1?'s':''}`,d:proyCotz.map(p=>p.nombre).join(', ')+` · ${fmt(proyCotz.reduce((s,p)=>s+p.presupuesto,0))} potencial`,action:'Ver Proyectos',nav:'proyectos'});
  if(!proyActivos.length&&!proyCotz.length) alerts.push({cat:'proy',sev:'ai',i:'◫',t:'Sin proyectos activos',d:'Agrega proyectos para hacer seguimiento de rentabilidad y facturación.',action:'Nuevo Proyecto',nav:'proyectos'});

  // ── METAS & FINANZAS ──
  if(pct>=100) alerts.push({cat:'fin',sev:'ao',i:'★',t:'¡Meta mensual alcanzada!',d:`${fmt(ing)} facturado vs ${fmt(meta)} requerido · ${pct}%`});
  else if(pct>=70) alerts.push({cat:'fin',sev:'aw',i:'◈',t:`${pct}% de la meta mensual`,d:`Faltan ${fmt(meta-ing)} para cubrir todos los costos del mes`});
  else alerts.push({cat:'fin',sev:'ad',i:'◈',t:`Solo ${pct}% de la meta mensual`,d:`Ingresos insuficientes — Faltan ${fmt(meta-ing)} para punto de equilibrio`});

  if(pctAnual>=100) alerts.push({cat:'fin',sev:'ao',i:'★',t:'Meta anual alcanzada',d:`${fmt(totalIngAnual)} / ${fmt(metaAnual)} · 100%+`});
  else alerts.push({cat:'fin',sev:'ai',i:'▲',t:`Meta anual: ${pctAnual}%`,d:`${fmt(totalIngAnual)} / ${fmt(metaAnual)} · Proyección anual`,action:'Ver Viabilidad',nav:'viab'});

  var margen=ing>0?Math.round((ing-egr)/ing*100):0;
  if(margen<20&&ing>0) alerts.push({cat:'fin',sev:'ad',i:'↓',t:`Margen bajo: ${margen}%`,d:'El margen operacional está por debajo del 20%. Revisa egresos.',action:'Ver Libro',nav:'libro'});
  else if(margen>=20&&ing>0) alerts.push({cat:'fin',sev:'ao',i:'↑',t:`Margen saludable: ${margen}%`,d:`Utilidad: ${fmt(ing-egr)} este mes`});

  // Respaldo
  alerts.push({cat:'fin',sev:'ai',i:'↓',t:'Recuerda hacer respaldo mensual',d:'Exporta un JSON de respaldo desde la sección Exportación.',action:'Ir a Exportación',nav:'export'});

  return alerts;
}

function renderAlertas(){
  var alerts=buildAlertas();
  var categs={trib:[],rem:[],proy:[],fin:[]};
  alerts.forEach(a=>{ if(categs[a.cat]) categs[a.cat].push(a); });
  var sevCount=a=>a.filter(x=>x.sev==='ad'||x.sev==='aw').length;

  function renderAlertHTML(a){
    var btnHtml='';
    if(a.action&&a.nav) btnHtml=`<button class="btn btn-ghost btn-sm" style="margin-top:6px;font-size:10px" onclick="showView('${a.nav}',document.getElementById('nav-${a.nav}'))">${a.action} →</button>`;
    else if(a.action&&a.url) btnHtml=`<a href="${a.url}" target="_blank" class="btn btn-ghost btn-sm" style="margin-top:6px;font-size:10px;text-decoration:none">${a.action} →</a>`;
    return`<div class="alert ${a.sev}">
      <div class="alert-ico">${a.i}</div>
      <div style="flex:1"><div class="alert-title">${a.t}</div><div class="alert-desc">${a.d}</div>${btnHtml}</div>
    </div>`;
  }

  // Render by category
  ['trib','rem','proy','fin'].forEach(cat=>{
    var el=document.getElementById('alr-'+cat);
    var badge=document.getElementById('alr-'+cat+'-badge');
    if(!el)return;
    var items=categs[cat];
    var urgentes=sevCount(items);
    if(badge) badge.textContent=urgentes>0?urgentes+' pendiente'+(urgentes>1?'s':''):'OK';
    if(badge) badge.className='badge '+(urgentes>0?'br':'bg');
    el.innerHTML=items.length?items.map(renderAlertHTML).join(''):`<div class="alert ao"><div class="alert-ico">✓</div><div><div class="alert-title">Sin alertas en esta categoría</div></div></div>`;
  });

  // All alerts sorted by severity
  var sevOrder={ad:0,aw:1,ai:2,ao:3};
  var allSorted=[...alerts].sort((a,b)=>(sevOrder[a.sev]||3)-(sevOrder[b.sev]||3));
  document.getElementById('alr-all').innerHTML=allSorted.map(renderAlertHTML).join('');
  document.getElementById('alr-total-badge').textContent=allSorted.length+' alertas';

  // KPIs
  var criticas=alerts.filter(a=>a.sev==='ad').length;
  var advertencias=alerts.filter(a=>a.sev==='aw').length;
  var info=alerts.filter(a=>a.sev==='ai').length;
  var ok=alerts.filter(a=>a.sev==='ao').length;
  document.getElementById('alertas-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--red)"><div class="kpi-top"><div class="kpi-lbl">Críticas</div><div class="kpi-ico">🚨</div></div><div class="kpi-val" style="color:${criticas>0?'var(--red)':'var(--text3)'}">${criticas}</div><div class="kpi-foot"><span class="muted">Requieren acción inmediata</span></div></div>
    <div class="kpi" style="--kc:var(--amber)"><div class="kpi-top"><div class="kpi-lbl">Advertencias</div><div class="kpi-ico">⚑</div></div><div class="kpi-val" style="color:${advertencias>0?'var(--amber)':'var(--text3)'}">${advertencias}</div><div class="kpi-foot"><span class="muted">Revisar pronto</span></div></div>
    <div class="kpi" style="--kc:var(--blue)"><div class="kpi-top"><div class="kpi-lbl">Informativas</div><div class="kpi-ico">◎</div></div><div class="kpi-val" style="color:var(--blue)">${info}</div><div class="kpi-foot"><span class="muted">Sin urgencia</span></div></div>
    <div class="kpi" style="--kc:var(--green)"><div class="kpi-top"><div class="kpi-lbl">Al día</div><div class="kpi-ico">✓</div></div><div class="kpi-val" style="color:var(--green)">${ok}</div><div class="kpi-foot"><span class="muted">Obligaciones cumplidas</span></div></div>`;

  // Update badge in nav
  var totalUrgentes=criticas+advertencias;
  var badge=document.getElementById('badge-count');
  if(badge) badge.textContent=totalUrgentes||'';
}
