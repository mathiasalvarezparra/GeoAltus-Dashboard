//  RESUMEN 
function renderResumen(){
  var d=getMes();const{movs}=d;
  var ingMovs=movs.filter(m=>m.tipo==='ing'),egrMovs=movs.filter(m=>m.tipo==='egr');
  var ing=ingMovs.reduce((s,m)=>s+m.monto,0);
  var egr=egrMovs.reduce((s,m)=>s+m.monto,0);
  var util=ing-egr,margen=ing>0?Math.round(util/ing*100):0;
  var ventasAfectas=ingMovs.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var comprasAfectas=egrMovs.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var honBoletas=egrMovs.filter(m=>m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
  var ivaD=Math.round(ventasAfectas*0.19),ivaC=Math.round(comprasAfectas*0.19),ivaN=ivaD-ivaC;
  var usaPPM=document.getElementById('ppm-toggle').checked;
  var ppmTasa=0.0025;
  var ppm=usaPPM?Math.round(ventasAfectas*ppmTasa):0;
  var honRet=Math.round(honBoletas*0.1525);
  var _mesKey2=currentYear+'-'+currentMonth;
  var _liq2=histLiquidaciones.filter(h=>h.mesKey===_mesKey2).reduce((s,h)=>s+h.imp2,0);
  var f29=ivaN+ppm+honRet+_liq2;
  var prevKey=currentMonth===0?(currentYear-1)+'-11':currentYear+'-'+(currentMonth-1);
  var prev=dataMeses[prevKey];
  var prevIng=prev?getIng(prev):0;
  var delta=prev&&prevIng>0?Math.round((ing-prevIng)/prevIng*100):null;
  var mesF29=(currentMonth+1)%12;
  document.getElementById('k-ing').textContent=fmt(ing);
  document.getElementById('k-egr').textContent=fmt(egr);
  document.getElementById('k-util').textContent=fmt(util);
  document.getElementById('k-f29').textContent=fmt(f29);
  document.getElementById('k-ing-d').textContent=delta!==null?(delta>=0?'↑':'↓')+Math.abs(delta)+'%':'—';
  document.getElementById('k-ing-d').className=delta!==null&&delta>=0?'up':'dn';
  document.getElementById('k-ing-s').textContent=delta!==null?'vs '+MESES[currentMonth-1]:'primer mes';
  document.getElementById('k-egr-s').textContent='margen '+margen+'%';
  document.getElementById('k-margen').textContent='margen operacional '+margen+'%';
  document.getElementById('k-f29-fecha').textContent='⚑ Vence 12 '+MESES[(currentMonth+1)%12]+' '+currentYear;
  var banner=document.getElementById('healthBanner');
  banner.className='health-banner '+(margen>=45?'h-green':margen>=25?'h-yellow':'h-red');
  document.getElementById('hb-icon').textContent=margen>=45?'🟢':margen>=25?'🟡':'🔴';
  document.getElementById('hb-title').textContent=margen>=45?'Estado financiero saludable':margen>=25?'Atención — Margen bajo':'Crítico — Margen muy bajo';
  document.getElementById('hb-desc').textContent=`Margen operacional ${margen}% · `+(margen>=45?'Ingresos superan el punto de equilibrio':margen>=25?'Revisa los egresos del mes':'Los egresos superan lo recomendado');
  var hoy=new Date();document.getElementById('hb-date').textContent=`${hoy.getDate()} ${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
  var meta=f29+COT+SUELDO+FIJOS,pct=Math.min(Math.round(ing/meta*100),100);
  document.getElementById('meta-cur').textContent=fmtK(ing);document.getElementById('meta-tgt').textContent=fmtK(meta);
  document.getElementById('meta-pct').textContent=pct+'%';document.getElementById('meta-fill').style.width=pct+'%';
  document.getElementById('mi-f29').textContent=fmtK(f29);document.getElementById('mi-cot').textContent=fmtK(COT);
  document.getElementById('mi-sue').textContent=fmtK(SUELDO);document.getElementById('mi-fij').textContent=fmtK(FIJOS);
  document.getElementById('f29-periodo').textContent=MESES[currentMonth]+' '+currentYear+' · Pro Pyme General';
  document.getElementById('f29-deb').textContent='+'+fmt(ivaD);document.getElementById('f29-cred').textContent='−'+fmt(ivaC);
  document.getElementById('f29-ppm').textContent=fmt(ppm);document.getElementById('f29-ret').textContent=fmt(honRet);
  document.getElementById('f29-tot').textContent=fmt(f29);
  document.getElementById('f29-ppm-row').style.opacity=usaPPM?'1':'0.35';
  var df29=diasHasta(12,1),dcot=diasHasta(30,0);
  document.getElementById('days-f29').textContent=df29;document.getElementById('days-cot').textContent=dcot;
  document.getElementById('days-f29-f').textContent='12 '+MESES[mesF29]+' 2026';
  document.getElementById('days-cot-f').textContent='30 '+MESES[currentMonth]+' 2026';
  document.getElementById('days-f29').style.color=df29<=7?'var(--red)':df29<=15?'var(--amber)':'var(--gold)';
  document.getElementById('days-cot').style.color=dcot<=5?'var(--red)':dcot<=10?'var(--amber)':'var(--blue)';
  var am=document.getElementById('alert-mini');am.innerHTML='';
  var alerts=[];
  if(df29<=21)alerts.push({c:'aw',i:'⚑',t:`F29 en ${df29} días`,d:`${fmt(f29)} · ${MESES[mesF29]} 2026`});
  if(dcot<=10)alerts.push({c:'ad',i:'◎',t:`Cotizaciones en ${dcot} días`,d:`${fmt(COT)} · PreviRed`});
  if(pct>=100)alerts.push({c:'ao',i:'✓',t:'Meta mensual alcanzada',d:'Ingresos cubren todos los costos del mes'});
  else alerts.push({c:'ai',i:'◈',t:`${100-pct}% restante para la meta`,d:`Faltan ${fmt(meta-ing)}`});
  // Sync nav badge via buildAlertas (safe: only if histLiquidaciones is ready)
  try{var _ba=buildAlertas();var _ub=_ba.filter(a=>a.sev==='ad'||a.sev==='aw').length;document.getElementById('badge-count').textContent=_ub||'';}catch(e){}
  alerts.forEach(a=>{am.innerHTML+=`<div class="alert ${a.c}"><div class="alert-ico">${a.i}</div><div class="alert-body"><div class="alert-title">${a.t}</div><div class="alert-desc">${a.d}</div></div></div>`;});
  var ml=document.getElementById('mov-list');
  var ult=[...movs].reverse().slice(0,5);
  document.getElementById('badge-movs').textContent=movs.length+' registros';
  ml.innerHTML=ult.length===0?'<div style="font-size:12px;color:var(--text3);text-align:center;padding:24px;font-family:var(--mono)">Sin registros este mes.<br>Usa "+ Registrar" para agregar.</div>':ult.map(m=>`<div class="mov-item"><div class="mov-dot" style="background:${m.tipo==='ing'?'var(--green)':'var(--red)'}"></div><div class="mov-info"><div class="mov-desc">${m.desc}</div><div class="mov-cat">${catShort(m.cat)} · ${ivaStr(m.iva)}</div></div><div class="mov-right"><div class="mov-amount" style="color:${m.tipo==='ing'?'var(--green)':'var(--red)'}">${m.tipo==='ing'?'+':'−'}${fmt(m.monto)}</div><div class="mov-date">${m.fecha}</div></div></div>`).join('');
  renderDonut('ing',movs,ing);renderDonut('egr',movs,egr);renderCashflow(f29);
}

function renderDonut(tipo,movs,total){
  var cats=tipo==='ing'?CAT_ING:CAT_EGR,colors=tipo==='ing'?CI:CE;
  var map={};movs.filter(m=>m.tipo===tipo).forEach(m=>{map[m.cat]=(map[m.cat]||0)+m.monto;});
  var items=cats.map((c,i)=>({name:catShort(c),val:map[c]||0,color:colors[i]})).filter(x=>x.val>0);
  if(!items.length){document.getElementById(`donut-${tipo}-svg`).innerHTML='<text x="45" y="50" text-anchor="middle" font-size="9" fill="#3d5068" font-family="JetBrains Mono">Sin datos</text>';document.getElementById(`donut-${tipo}-leg`).innerHTML='<div style="font-size:11px;color:var(--text3);font-family:var(--mono)">Sin registros</div>';return;}
  var circ=201.06;let offset=0,svg='<circle cx="45" cy="45" r="32" fill="none" stroke="#1a2535" stroke-width="11"/>';
  items.forEach(it=>{const d=it.val/total*circ;svg+=`<circle cx="45" cy="45" r="32" fill="none" stroke="${it.color}" stroke-width="11" stroke-dasharray="${d.toFixed(1)} ${(circ-d).toFixed(1)}" stroke-dashoffset="${(-offset).toFixed(1)}" transform="rotate(-90 45 45)"/>`;offset+=d;});
  document.getElementById(`donut-${tipo}-svg`).innerHTML=svg;
  document.getElementById(`donut-${tipo}-leg`).innerHTML=items.map(it=>`<div class="donut-item"><div class="donut-left"><div class="donut-dot" style="background:${it.color}"></div><span class="donut-name">${it.name}</span></div><span class="donut-val" style="color:${it.color}">${Math.round(it.val/total*100)}%</span></div>`).join('');
}

function renderCashflow(f29){
  var meses=Object.entries(dataMeses).filter(([k])=>k.startsWith(currentYear+"-")).map(([,v])=>v);
  var pI=meses.length?meses.reduce((s,x)=>s+getIng(x),0)/meses.length:0,pE=meses.length?meses.reduce((s,x)=>s+getEgr(x),0)/meses.length:0;
  var usaPPM=document.getElementById('ppm-toggle').checked;
  var html='';
  [1,2].forEach(off=>{
    var m=MESES[(currentMonth+off)%12],i2=Math.round(pI*(1+off*.05)),e2=Math.round(pE*(1+off*.02));
    var _imp2Avg=histLiquidaciones.length?Math.round(histLiquidaciones.reduce((s,h)=>s+h.imp2,0)/histLiquidaciones.length):0;
    var f=Math.round(i2*0.19-e2*0.19+(usaPPM?i2*0.0025:0))+_imp2Avg;
    var net=i2-e2-f-COT;
    html+=`<div class="cf-col"><div class="cf-month">${m} 2026</div><div class="cf-row"><span class="cf-rl">Ingresos est.</span><span class="cf-rv" style="color:var(--green)">${fmtK(i2)}</span></div><div class="cf-row"><span class="cf-rl">Egresos est.</span><span class="cf-rv" style="color:var(--red)">${fmtK(e2)}</span></div><div class="cf-row"><span class="cf-rl">F29 est.</span><span class="cf-rv" style="color:var(--amber)">${fmtK(f)}</span></div><div class="cf-div"></div><div class="cf-net"><span style="color:var(--text2)">Saldo neto</span><span style="color:${net>=0?'var(--green)':'var(--red)'}">${fmtK(net)}</span></div></div>`;
  });
  document.getElementById('cf-cols').innerHTML=html;
}
