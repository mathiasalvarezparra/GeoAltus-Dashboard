

//  VIABILIDAD 
// Lee un input numérico tratando vacío como "no configurado" (null), no como cero ni como fallback.
function _viabNum(id){
  var el=document.getElementById(id);
  if(!el)return null;
  var raw=el.value;
  if(raw===''||raw===null||raw===undefined)return null;
  var n=parseFloat(raw);
  return isNaN(n)?null:n;
}

// Persiste y restaura los parámetros configurables
function onViabParamChange(){
  preferencias.viabParams={
    fijos:document.getElementById('viab-fijos').value,
    metaAnio:document.getElementById('viab-meta-año').value,
    margenVar:document.getElementById('viab-margen-var').value,
    mesesProy:document.getElementById('viab-meses-proy').value,
  };
  saveAllData();
  renderViab();
}
function loadViabParams(){
  var p=preferencias.viabParams||{};
  var setIf=(id,v)=>{var el=document.getElementById(id);if(el&&v!==undefined&&v!==null&&v!=='')el.value=v;};
  setIf('viab-fijos',p.fijos);
  setIf('viab-meta-año',p.metaAnio);
  setIf('viab-margen-var',p.margenVar);
  setIf('viab-meses-proy',p.mesesProy);
}

function renderViab(){
  // Recopilar datos reales de dataMeses
  var yk=currentYear+'-';
  var mesesConDatos=Object.entries(dataMeses).filter(([k])=>k.startsWith(yk)).map(([k,d])=>({...d,mesIdx:parseInt(k.split('-')[1]),ing:getIng(d),egr:getEgr(d)}));
  var promIng=mesesConDatos.length?Math.round(mesesConDatos.reduce((s,d)=>s+d.ing,0)/mesesConDatos.length):0;
  var promEgr=mesesConDatos.length?Math.round(mesesConDatos.reduce((s,d)=>s+d.egr,0)/mesesConDatos.length):0;
  var totalIngAnual=mesesConDatos.reduce((s,d)=>s+d.ing,0);
  var totalEgrAnual=mesesConDatos.reduce((s,d)=>s+d.egr,0);

  // Parámetros configurables: null = no configurado (no usar fallback silencioso)
  var gastosFijosRaw=_viabNum('viab-fijos');
  var metaAnioRaw=_viabNum('viab-meta-año');
  var margenVarRaw=_viabNum('viab-margen-var');
  var mesesProyRaw=_viabNum('viab-meses-proy');
  // Para cálculos: usar 0 cuando no está configurado, pero recordar el estado para mostrar "—"
  var gastosFijos=gastosFijosRaw||0;
  var metaAnio=metaAnioRaw||0;
  var margenVar=(margenVarRaw||0)/100;
  var mesesProy=mesesProyRaw||6;  // Solo el rango del flujo de caja conserva un default razonable

  // Costos fijos totales mes (gastos fijos + sueldos + cotizaciones + f29 estimado)
  var costoSueldos=trabajadores.filter(t=>t.estado==='activo').reduce((s,t)=>{
    var d=calcLiqData(t.sueldo,t.afp,30,'completo',t.tipoContrato);
    return s+t.sueldo+d.cesE+d.sis+d.aporteReforma;
  },0);
  var usaPPM=document.getElementById('ppm-toggle')?.checked??true;
  var f29EstMes=promIng>0?Math.round(promIng*0.19-promEgr*0.19+(usaPPM?promIng*0.0025:0)):0;
  var costoTotalMes=gastosFijos+costoSueldos+f29EstMes;

  // Punto de equilibrio — requiere gastosFijos Y margenVar configurados
  var peConfigurado=gastosFijosRaw!==null&&margenVarRaw!==null&&margenVarRaw>0;
  var pe=peConfigurado?Math.round(costoTotalMes/margenVar):0;
  var utilidadMes=promIng-promEgr;
  var margenReal=promIng>0?Math.round((promIng-promEgr)/promIng*100):0;
  var excedentesPE=promIng-pe;
  var diasPE=pe>0&&promIng>0?Math.round(pe/promIng*30):0;

  // F22 proyeccin
  var f22=calcF22Saldo(0.25,usaPPM);

  // ROI — requiere gastos fijos configurados (sino la inversión está sesgada)
  var inversion=gastosFijos*12+costoSueldos*12;
  var roiConfigurado=gastosFijosRaw!==null||costoSueldos>0;
  var roi=roiConfigurado&&inversion>0?Math.round((totalIngAnual-totalEgrAnual)/inversion*100):0;

  // Avance meta — requiere meta configurada
  var metaConfigurada=metaAnioRaw!==null&&metaAnioRaw>0;
  var avanceMeta=metaConfigurada?Math.round(totalIngAnual/metaAnio*100):0;

  // Semforo
  var saludable=margenReal>=40&&excedentesPE>0&&peConfigurado;
  var atencion=margenReal>=20||(excedentesPE>0&&peConfigurado);
  var saludColor=saludable?'var(--green)':atencion?'var(--amber)':'var(--red)';
  var saludLabel=peConfigurado?(saludable?'Saludable':atencion?'Atención':'Crítico'):'Sin configurar';
  document.getElementById('viab-salud-badge').className='badge '+(peConfigurado?(saludable?'bg':atencion?'ba':'br'):'bt');
  document.getElementById('viab-salud-badge').textContent=saludLabel;

  // KPIs — muestran "—" cuando no se puede calcular
  var peLabel=peConfigurado?fmtK(pe):'—';
  var peSubLabel=peConfigurado?`Facturar día ${diasPE} del mes`:'Configura gastos y margen';
  var margenLabel=mesesConDatos.length?margenReal+'%':'—';
  var margenSubLabel=mesesConDatos.length?`Promedio ${mesesConDatos.length} meses`:'Sin movimientos registrados';
  var roiLabel=roiConfigurado&&inversion>0?roi+'%':'—';
  var roiSubLabel=roiConfigurado?'Retorno sobre costos':'Configura gastos fijos';
  document.getElementById('viab-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--gold)"><div class="kpi-top"><div class="kpi-lbl">Punto de Equilibrio</div><div class="kpi-ico">◈</div></div><div class="kpi-val" style="color:var(--gold)">${peLabel}</div><div class="kpi-foot"><span class="muted">${peSubLabel}</span></div></div>
    <div class="kpi" style="--kc:${saludColor}"><div class="kpi-top"><div class="kpi-lbl">Margen Operacional</div><div class="kpi-ico">▲</div></div><div class="kpi-val" style="color:${saludColor}">${margenLabel}</div><div class="kpi-foot"><span class="muted">${margenSubLabel}</span></div></div>
    <div class="kpi" style="--kc:var(--teal)"><div class="kpi-top"><div class="kpi-lbl">ROI Acumulado</div><div class="kpi-ico">↑</div></div><div class="kpi-val" style="color:var(--teal)">${roiLabel}</div><div class="kpi-foot"><span class="muted">${roiSubLabel}</span></div></div>
    <div class="kpi" style="--kc:${f22>=0?'var(--red)':'var(--green)'}"><div class="kpi-top"><div class="kpi-lbl">Proyección F22</div><div class="kpi-ico">⊞</div></div><div class="kpi-val" style="color:${f22>=0?'var(--red)':'var(--green)'}">${fmtK(Math.abs(f22))}</div><div class="kpi-foot"><span class="muted">${f22>=0?'A pagar':'Devolución'} · Abr ${currentYear+1}</span></div></div>`;

  // Punto de equilibrio detalle
  var peRow=peConfigurado
    ?`<div class="f29-row" style="background:var(--gold-dim);border-color:rgba(233,185,73,.3)"><span class="f29-lbl" style="color:var(--gold)">▶ Punto de equilibrio (÷ margen ${Math.round(margenVar*100)}%)</span><span class="f29-val" style="color:var(--gold);font-size:15px">${fmt(pe)}</span></div>
       <div class="f29-row" style="background:${excedentesPE>=0?'var(--green-dim)':'var(--red-dim)'};border-color:${excedentesPE>=0?'rgba(74,222,128,.25)':'rgba(240,82,82,.25)'}">
         <span class="f29-lbl" style="color:${excedentesPE>=0?'var(--green)':'var(--red)'}">${excedentesPE>=0?'▶ Excedente sobre PE':'⚠ Déficit sobre PE'}</span>
         <span class="f29-val" style="color:${excedentesPE>=0?'var(--green)':'var(--red)'}">${fmt(Math.abs(excedentesPE))}</span>
       </div>`
    :`<div class="f29-row" style="background:var(--surface);border-color:var(--border)"><span class="f29-lbl" style="color:var(--text3);font-style:italic">Configura "Gastos Fijos" y "Margen Variable" en Parámetros del Negocio para ver el punto de equilibrio</span></div>`;
  document.getElementById('viab-pe-content').innerHTML=`
    <div class="f29-rows">
      <div class="f29-row"><span class="f29-lbl">Costo mensual fijos</span><span class="f29-val" style="color:var(--text2)">${gastosFijosRaw!==null?fmt(gastosFijos):'—'}</span></div>
      <div class="f29-row"><span class="f29-lbl">Costo sueldos + cargas empleador</span><span class="f29-val" style="color:var(--text2)">${fmt(costoSueldos)}</span></div>
      <div class="f29-row"><span class="f29-lbl">F29 estimado mensual</span><span class="f29-val" style="color:var(--text2)">${fmt(f29EstMes)}</span></div>
      <div class="f29-row f29-total"><span class="f29-lbl">Costo total mes GeoAltus</span><span class="f29-val">${fmt(costoTotalMes)}</span></div>
      ${peRow}
    </div>`;

  // Resumen parmetros
  document.getElementById('viab-resumen-params').innerHTML=`
    <div class="f29-row" style="margin-top:4px"><span class="f29-lbl">Meta anual</span><span class="f29-val" style="color:var(--text2)">${metaConfigurada?fmt(metaAnio):'—'}</span></div>
    <div class="f29-row"><span class="f29-lbl">Avance meta anual</span><span class="f29-val" style="color:${metaConfigurada?(avanceMeta>=50?'var(--green)':'var(--amber)'):'var(--text3)'}">${metaConfigurada?avanceMeta+'%':'—'}</span></div>
    <div class="f29-row"><span class="f29-lbl">Promedio mensual real</span><span class="f29-val">${fmt(promIng)}</span></div>`;

  // Indicadores
  var indicadores=[
    {label:'Margen Operacional',val:mesesConDatos.length?margenReal+'%':'—',meta:'Meta: 40%',pct:mesesConDatos.length?Math.min(margenReal/40*100,100):0,color:!mesesConDatos.length?'var(--text3)':margenReal>=40?'var(--green)':margenReal>=20?'var(--amber)':'var(--red)'},
    {label:'Cobertura Costos',val:promIng>0&&costoTotalMes>0?Math.round(promIng/costoTotalMes*100)+'%':'—',meta:'Meta: >100%',pct:promIng>0&&costoTotalMes>0?Math.min(promIng/costoTotalMes*100,100):0,color:!promIng||!costoTotalMes?'var(--text3)':promIng>=costoTotalMes?'var(--green)':'var(--red)'},
    {label:'Avance Meta Anual',val:metaConfigurada?avanceMeta+'%':'—',meta:metaConfigurada?`${fmtK(totalIngAnual)} / ${fmtK(metaAnio)}`:'Meta no configurada',pct:metaConfigurada?Math.min(avanceMeta,100):0,color:metaConfigurada?'var(--gold)':'var(--text3)'},
    {label:'ROI',val:roiConfigurado&&inversion>0?roi+'%':'—',meta:roiConfigurado?'Retorno sobre inversión':'Configura gastos fijos',pct:roiConfigurado&&inversion>0?Math.min(roi,100):0,color:!roiConfigurado||!inversion?'var(--text3)':roi>=50?'var(--teal)':roi>=0?'var(--blue)':'var(--red)'},
  ];
  document.getElementById('viab-indicadores').innerHTML=indicadores.map(ind=>`
    <div style="background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:16px">
      <div style="font-size:11px;color:var(--text3);font-family:var(--mono);margin-bottom:8px">${ind.label}</div>
      <div style="font-size:22px;font-weight:800;font-family:var(--mono);color:${ind.color};margin-bottom:8px">${ind.val}</div>
      <div style="height:4px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:6px">
        <div style="height:100%;width:${ind.pct}%;background:${ind.color};border-radius:99px;transition:width 1s ease"></div>
      </div>
      <div style="font-size:10px;color:var(--text3);font-family:var(--mono)">${ind.meta}</div>
    </div>`).join('');

  // Flujo de caja proyectado
  var hoy3=new Date();
  var cfHead=document.getElementById('viab-cf-head');
  var cfBody=document.getElementById('viab-cf-body');
  var conceptos=['Ingresos est.','Egresos est.','F29 est.','Sueldos est.','Saldo neto'];
  cfHead.innerHTML='<th style="padding:0 12px 10px;font-size:10px;font-family:var(--mono);color:var(--text3)">Concepto</th>'+
    Array.from({length:mesesProy},(_,i)=>{
      var m=new Date(hoy3.getFullYear(),hoy3.getMonth()+i+1,1);
      return`<th style="padding:0 12px 10px;font-size:10px;font-family:var(--mono);color:var(--text3);text-align:right">${MESES[m.getMonth()].slice(0,3)} ${m.getFullYear()}</th>`;
    }).join('');
  var rows=conceptos.map((c,ci)=>{
    var cols=Array.from({length:mesesProy},(_,i)=>{
      var growthIng=1+i*0.03;
      var ing2=Math.round(promIng*growthIng);
      var egr2=Math.round(promEgr*(1+i*0.02));
      var f29_2=Math.round(ing2*0.19-egr2*0.19+(usaPPM?ing2*0.0025:0));
      var suel2=costoSueldos;
      var neto=ing2-egr2-f29_2-suel2;
      var vals=[ing2,egr2,f29_2,suel2,neto];
      var v=vals[ci];
      var color=ci===0?'var(--green)':ci===4?(v>=0?'var(--green)':'var(--red)'):'var(--red)';
      return`<td style="text-align:right;font-family:var(--mono);font-size:11px;color:${color};padding:10px 12px">${ci===4&&v<0?'−':ci>0&&ci<4?'−':''}${fmtK(Math.abs(v))}</td>`;
    }).join('');
    var rowStyle=ci===4?'background:var(--gold-dim);font-weight:700':'';
    return`<tr style="${rowStyle}"><td style="padding:10px 12px;font-size:12px;color:var(--text2)">${c}</td>${cols}</tr>`;
  });
  cfBody.innerHTML=rows.join('');

  // Evolucin mensual
  var evolEl=document.getElementById('viab-evolucion');
  if(!mesesConDatos.length){
    evolEl.innerHTML=`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);text-align:center;padding:24px">Sin datos registrados. Ingresa movimientos en el Libro para ver la evolución.</div>`;
    return;
  }
  var maxVal=Math.max(...mesesConDatos.map(d=>d.ing));
  evolEl.innerHTML=mesesConDatos.map(d=>{
    var ingPct=maxVal>0?Math.round(d.ing/maxVal*100):0;
    var egrPct=maxVal>0?Math.round(d.egr/maxVal*100):0;
    var margenM=d.ing>0?Math.round((d.ing-d.egr)/d.ing*100):0;
    return`<div style="display:grid;grid-template-columns:80px 1fr 1fr 60px;gap:12px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:11px;font-family:var(--mono);color:var(--text3)">${MESES[d.mesIdx].slice(0,3)} ${currentYear}</div>
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:${ingPct}%;height:6px;background:var(--green);border-radius:99px;min-width:4px;max-width:100%;transition:width 1s ease"></div>
          <span style="font-size:11px;font-family:var(--mono);color:var(--green)">${fmtK(d.ing)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:${egrPct}%;height:6px;background:var(--red);border-radius:99px;min-width:4px;max-width:100%;transition:width 1s ease"></div>
          <span style="font-size:11px;font-family:var(--mono);color:var(--red)">${fmtK(d.egr)}</span>
        </div>
      </div>
      <div style="height:28px;background:var(--surface);border-radius:6px;overflow:hidden;position:relative">
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-family:var(--mono);color:var(--text3)">Utilidad</div>
        <div style="height:100%;width:${Math.max(0,margenM)}%;background:${margenM>=40?'rgba(74,222,128,.3)':margenM>=20?'rgba(251,146,60,.3)':'rgba(240,82,82,.3)'};transition:width 1s ease"></div>
      </div>
      <div style="font-size:12px;font-weight:700;font-family:var(--mono);color:${margenM>=40?'var(--green)':margenM>=20?'var(--amber)':'var(--red)'};text-align:right">${margenM}%</div>
    </div>`;
  }).join('');
}

//  RENDER ALL 
function renderAll(){
  updateMonthNav();
  renderResumen();
  var active=document.querySelector('.view.active');
  if(active?.id==='view-libro'){poblarFiltrosCat();renderLibro();}
  if(active?.id==='view-f29')renderF29View();
  if(active?.id==='view-rem')renderRem();
  if(active?.id==='view-viab')renderViab();
}
