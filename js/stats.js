
// ══════════════════════════════════════════
//  ESTADÍSTICAS
// ══════════════════════════════════════════
let statsYear=2026;
function renderStats(){
  // Build year buttons
  var btnEl=document.getElementById('stats-year-btns');
  if(btnEl){
    btnEl.innerHTML=['2025','2026'].map(y=>`<button class="btn btn-sm ${parseInt(y)===statsYear?'btn-gold':'btn-ghost'}" onclick="statsYear=${y};renderStats()">${y}</button>`).join('');
  }
  var yk=statsYear+'-';
  var mesesData=Array.from({length:12},(_,i)=>{
    var k=yk+i;
    var d=dataMeses[k];
    return{mes:MESES[i].slice(0,3),mesIdx:i,ing:d?getIng(d):0,egr:d?getEgr(d):0,tiene:!!(d&&d.movs&&d.movs.length)};
  });
  var conDatos=mesesData.filter(m=>m.tiene);
  var totalIng=conDatos.reduce((s,m)=>s+m.ing,0);
  var totalEgr=conDatos.reduce((s,m)=>s+m.egr,0);
  var totalUtil=totalIng-totalEgr;
  var margenProm=totalIng>0?Math.round(totalUtil/totalIng*100):0;
  var maxIng=Math.max(...mesesData.map(m=>m.ing),1);

  // KPIs
  document.getElementById('stats-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--green)"><div class="kpi-top"><div class="kpi-lbl">Ingresos ${statsYear}</div><div class="kpi-ico">↑</div></div><div class="kpi-val" style="color:var(--green)">${fmtK(totalIng)}</div><div class="kpi-foot"><span class="muted">${conDatos.length} meses con datos</span></div></div>
    <div class="kpi" style="--kc:var(--red)"><div class="kpi-top"><div class="kpi-lbl">Egresos ${statsYear}</div><div class="kpi-ico">↓</div></div><div class="kpi-val" style="color:var(--red)">${fmtK(totalEgr)}</div><div class="kpi-foot"><span class="muted">Promedio ${fmtK(conDatos.length?Math.round(totalEgr/conDatos.length):0)}/mes</span></div></div>
    <div class="kpi" style="--kc:var(--gold)"><div class="kpi-top"><div class="kpi-lbl">Utilidad ${statsYear}</div><div class="kpi-ico">◈</div></div><div class="kpi-val" style="color:var(--gold)">${fmtK(totalUtil)}</div><div class="kpi-foot"><span class="muted">Margen prom. ${margenProm}%</span></div></div>
    <div class="kpi" style="--kc:var(--teal)"><div class="kpi-top"><div class="kpi-lbl">Mejor Mes</div><div class="kpi-ico">★</div></div><div class="kpi-val" style="color:var(--teal);font-size:18px">${conDatos.length?conDatos.reduce((a,b)=>a.ing>b.ing?a:b).mes:'—'}</div><div class="kpi-foot"><span class="muted">${conDatos.length?fmtK(Math.max(...conDatos.map(m=>m.ing))):'—'} en ingresos</span></div></div>`;

  // Barras mensuales
  document.getElementById('stats-bars').innerHTML=mesesData.map(m=>{
    var ingPct=maxIng>0?Math.round(m.ing/maxIng*100):0;
    var egrPct=maxIng>0?Math.round(m.egr/maxIng*100):0;
    var util=m.ing-m.egr;
    var margen=m.ing>0?Math.round(util/m.ing*100):0;
    var color=margen>=40?'var(--green)':margen>=20?'var(--amber)':'var(--red)';
    if(!m.tiene) return`<div style="display:grid;grid-template-columns:40px 1fr 80px;gap:10px;align-items:center;opacity:.25;padding:4px 0">
      <div style="font-size:11px;font-family:var(--mono);color:var(--text3)">${m.mes}</div>
      <div style="height:8px;background:var(--border);border-radius:99px"></div>
      <div style="font-size:10px;font-family:var(--mono);color:var(--text3);text-align:right">sin datos</div>
    </div>`;
    return`<div style="display:grid;grid-template-columns:40px 1fr 120px;gap:10px;align-items:center;padding:4px 0">
      <div style="font-size:11px;font-family:var(--mono);color:var(--text2)">${m.mes}</div>
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <div style="width:${ingPct}%;height:7px;background:var(--green);border-radius:99px;min-width:3px;transition:width 1s ease"></div>
          <span style="font-size:10px;font-family:var(--mono);color:var(--green);white-space:nowrap">${fmtK(m.ing)}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          <div style="width:${egrPct}%;height:7px;background:var(--red);border-radius:99px;min-width:3px;transition:width 1s ease"></div>
          <span style="font-size:10px;font-family:var(--mono);color:var(--red);white-space:nowrap">${fmtK(m.egr)}</span>
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:12px;font-weight:700;font-family:var(--mono);color:${color}">${margen}%</div>
        <div style="font-size:10px;font-family:var(--mono);color:var(--text3)">${fmtK(util)} util.</div>
      </div>
    </div>`;
  }).join('');

  // Tendencia margen — SVG line chart
  var margenData=conDatos.map(m=>({mes:m.mes,margen:m.ing>0?Math.round((m.ing-m.egr)/m.ing*100):0,ing:m.ing,egr:m.egr}));
  var el_mg=document.getElementById('stats-margen');
  if(!margenData.length){el_mg.innerHTML=`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:20px;text-align:center">Sin datos para ${statsYear}</div>`;}
  else{
    var W=460,H=140,padL=40,padR=16,padT=16,padB=32;
    var chartW=W-padL-padR,chartH=H-padT-padB;
    var maxMg=Math.max(...margenData.map(d=>d.margen),60);
    var minMg=Math.min(...margenData.map(d=>d.margen),0);
    var range=maxMg-minMg||1;
    var xStep=chartW/(margenData.length-1||1);
    var yPct=v=>(1-(v-minMg)/range)*chartH+padT;
    var xPos=i=>padL+i*xStep;
    // Line path
    var pts=margenData.map((d,i)=>`${xPos(i).toFixed(1)},${yPct(d.margen).toFixed(1)}`).join(' L ');
    // Area fill
    var areaD=`M ${xPos(0).toFixed(1)},${(padT+chartH).toFixed(1)} L ${pts.replace(/ L /g,' L ')} L ${xPos(margenData.length-1).toFixed(1)},${(padT+chartH).toFixed(1)} Z`;
    // Grid lines
    var grids=[0,20,40,60].filter(v=>v>=minMg&&v<=maxMg+5).map(v=>{
      var y=yPct(v).toFixed(1);
      return`<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="var(--border)" stroke-width="1"/>
             <text x="${padL-5}" y="${parseFloat(y)+4}" text-anchor="end" font-size="9" fill="var(--text3)" font-family="JetBrains Mono">${v}%</text>`;
    }).join('');
    // Zone lines
    var y20=yPct(20).toFixed(1),y40=yPct(40).toFixed(1);
    // Dots + labels
    var dots=margenData.map((d,i)=>{
      var cx=xPos(i).toFixed(1),cy=yPct(d.margen).toFixed(1);
      var c=d.margen>=40?'#4ade80':d.margen>=20?'#fb923c':'#f05252';
      return`<circle cx="${cx}" cy="${cy}" r="4" fill="${c}" stroke="var(--card)" stroke-width="2"/>
             <text x="${cx}" y="${parseFloat(cy)-9}" text-anchor="middle" font-size="9" fill="${c}" font-family="JetBrains Mono">${d.margen}%</text>
             <text x="${cx}" y="${(padT+chartH+16).toFixed(1)}" text-anchor="middle" font-size="9" fill="var(--text3)" font-family="JetBrains Mono">${d.mes}</text>`;
    }).join('');
    el_mg.innerHTML=`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;overflow:visible">
      <defs><linearGradient id="mgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4ade80" stop-opacity="0.3"/><stop offset="100%" stop-color="#4ade80" stop-opacity="0.02"/></linearGradient></defs>
      ${grids}
      <line x1="${padL}" y1="${y20}" x2="${W-padR}" y2="${y20}" stroke="rgba(251,146,60,.3)" stroke-width="1" stroke-dasharray="4,3"/>
      <line x1="${padL}" y1="${y40}" x2="${W-padR}" y2="${y40}" stroke="rgba(74,222,128,.3)" stroke-width="1" stroke-dasharray="4,3"/>
      <path d="${areaD}" fill="url(#mgGrad)"/>
      <polyline points="${margenData.map((d,i)=>`${xPos(i).toFixed(1)},${yPct(d.margen).toFixed(1)}`).join(' ')}" fill="none" stroke="#4ade80" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
    <div style="display:flex;gap:16px;margin-top:8px;font-size:10px;font-family:var(--mono);color:var(--text3)">
      <span><span style="color:#f05252">—</span> &lt;20% riesgo</span>
      <span><span style="color:#fb923c">—</span> 20–40% aceptable</span>
      <span><span style="color:#4ade80">—</span> &gt;40% saludable</span>
    </div>`;
  }

  // Resumen anual
  var promIngM=conDatos.length?Math.round(totalIng/conDatos.length):0;
  var promEgrM=conDatos.length?Math.round(totalEgr/conDatos.length):0;
  document.getElementById('stats-anual').innerHTML=[
    {l:'Ingresos acumulados',v:fmt(totalIng),c:'var(--green)'},
    {l:'Egresos acumulados',v:fmt(totalEgr),c:'var(--red)'},
    {l:'Utilidad acumulada',v:fmt(totalUtil),c:'var(--gold)'},
    {l:'Promedio ing. mensual',v:fmt(promIngM),c:'var(--text2)'},
    {l:'Promedio egr. mensual',v:fmt(promEgrM),c:'var(--text2)'},
    {l:'Margen promedio',v:margenProm+'%',c:margenProm>=40?'var(--green)':margenProm>=20?'var(--amber)':'var(--red)'},
  ].map(r=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface);border-radius:7px;border:1px solid var(--border)">
    <span style="font-size:11px;color:var(--text2)">${r.l}</span>
    <span style="font-size:13px;font-weight:700;font-family:var(--mono);color:${r.c}">${r.v}</span>
  </div>`).join('');

  // Ranking categorías acumulado anual
  var allMovs=Object.entries(dataMeses).filter(([k])=>k.startsWith(yk)).flatMap(([,d])=>d.movs);
  var catIngAcum={},catEgrAcum={};
  allMovs.filter(m=>m.tipo==='ing').forEach(m=>{var s=catShort(m.cat);catIngAcum[s]=(catIngAcum[s]||0)+m.monto;});
  allMovs.filter(m=>m.tipo==='egr').forEach(m=>{var s=catShort(m.cat);catEgrAcum[s]=(catEgrAcum[s]||0)+m.monto;});
  var maxCI=Math.max(...Object.values(catIngAcum),1);
  var maxCE=Math.max(...Object.values(catEgrAcum),1);
  var renderCatBars=(obj,max,colors)=>Object.entries(obj).sort(([,a],[,b])=>b-a).map(([cat,val],i)=>`
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px">
        <span style="color:var(--text2)">${cat}</span>
        <span style="font-family:var(--mono);color:var(--text3)">${fmtK(val)}</span>
      </div>
      <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
        <div style="height:100%;width:${Math.round(val/max*100)}%;background:${colors[i%colors.length]};border-radius:99px;transition:width 1s ease"></div>
      </div>
    </div>`).join('');
  document.getElementById('stats-cat-ing').innerHTML=Object.keys(catIngAcum).length?renderCatBars(catIngAcum,maxCI,CI):`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:16px;text-align:center">Sin datos</div>`;
  document.getElementById('stats-cat-egr').innerHTML=Object.keys(catEgrAcum).length?renderCatBars(catEgrAcum,maxCE,CE):`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:16px;text-align:center">Sin datos</div>`;

  // Heatmap estacionalidad
  var maxHeat=Math.max(...mesesData.map(m=>m.ing),1);
  document.getElementById('stats-heat').innerHTML=`
    <div style="display:grid;grid-template-columns:repeat(12,1fr);gap:6px">
      ${mesesData.map(m=>{
        var int=m.tiene?Math.round(m.ing/maxHeat*100):0;
        var bg=m.tiene?`rgba(74,222,128,${0.08+int*0.007})`:'var(--surface)';
        var border=m.tiene?`rgba(74,222,128,${0.1+int*0.005})`:'var(--border)';
        return`<div style="background:${bg};border:1px solid ${border};border-radius:8px;padding:10px 6px;text-align:center;cursor:default" title="${m.mes}: ${fmtK(m.ing)}">
          <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:4px">${m.mes}</div>
          <div style="font-size:12px;font-weight:700;font-family:var(--mono);color:${m.tiene?'var(--green)':'var(--text3)'}">${m.tiene?fmtK(m.ing):'—'}</div>
        </div>`;
      }).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:8px;margin-top:10px;font-size:10px;font-family:var(--mono);color:var(--text3)">
      <div style="width:12px;height:12px;background:rgba(74,222,128,.08);border:1px solid rgba(74,222,128,.1);border-radius:3px"></div>Menor
      <div style="width:12px;height:12px;background:rgba(74,222,128,.4);border:1px solid rgba(74,222,128,.5);border-radius:3px"></div>Mayor
      <span style="margin-left:8px">· Color más intenso = mayor facturación</span>
    </div>`;
}
