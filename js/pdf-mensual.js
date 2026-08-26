
//  PDF 
function openPdf(){
  document.getElementById('modal-pdf').classList.add('open');
  document.getElementById('pdf-periodo').textContent=MESES[currentMonth]+' 2026 · GeoAltus SPA';
}
function closePdf(){document.getElementById('modal-pdf').classList.remove('open');}
function generarPDF(){
  var d=getMes();const{movs}=d;
  var usaPPM=document.getElementById('ppm-toggle').checked;
  var ingresos=movs.filter(m=>m.tipo==='ing'),egresos=movs.filter(m=>m.tipo==='egr');
  // Recalcular desde movimientos reales (igual que renderF29View)
  var ing=ingresos.reduce((s,m)=>s+m.monto,0);
  var egr=egresos.reduce((s,m)=>s+m.monto,0);
  var ventasAfectas=ingresos.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var comprasAfectas=egresos.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
  var honBoletas=egresos.filter(m=>m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
  var ivaD=Math.round(ventasAfectas*0.19);
  var ivaC=Math.round(comprasAfectas*0.19);
  var ivaN=ivaD-ivaC;
  var ppm=usaPPM?Math.round(ventasAfectas*0.0025):0;
  var honRet=Math.round(honBoletas*0.1525);
  var _mkPDF=currentYear+'-'+currentMonth;
  var imp2Cat=histLiquidaciones.filter(h=>h.mesKey===_mkPDF).reduce((s,h)=>s+h.imp2,0);
  var f29=ivaN+ppm+honRet+imp2Cat;
  var margen=ing>0?Math.round((ing-egr)/ing*100):0;
  var html=`<html><head><meta charset="UTF-8"><title>GeoAltus — ${MESES[currentMonth]} 2026</title>
  <style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:11px;color:#111;margin:36px;line-height:1.5;}h1{font-size:18px;margin-bottom:2px;}.sub{color:#666;font-size:10px;margin-bottom:24px;}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;}.kbox{border:1px solid #e0e0e0;border-radius:6px;padding:12px;background:#fafafa;}.kl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#888;margin-bottom:4px;}.kv{font-size:16px;font-weight:800;}.sec{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;border-bottom:1px solid #eee;padding-bottom:3px;margin:18px 0 8px;}table{width:100%;border-collapse:collapse;font-size:10px;}th{background:#f4f4f4;padding:6px 8px;text-align:left;font-weight:700;border-bottom:1px solid #ddd;}td{padding:6px 8px;border-bottom:1px solid #f0f0f0;}.pos{color:#16a34a;font-weight:700;}.neg{color:#dc2626;font-weight:700;}.tot td{font-weight:700;background:#fffbeb;}footer{margin-top:30px;font-size:9px;color:#aaa;border-top:1px solid #eee;padding-top:8px;}</style></head><body>
  <h1>GeoAltus SPA — Informe Mensual</h1>
  <div class="sub">${MESES[currentMonth]} 2026 · Generado ${new Date().toLocaleDateString('es-CL')} · Régimen Pro Pyme General</div>
  <div class="kpis"><div class="kbox"><div class="kl">Ingresos</div><div class="kv" style="color:#16a34a">${fmt(ing)}</div></div><div class="kbox"><div class="kl">Egresos</div><div class="kv" style="color:#dc2626">${fmt(egr)}</div></div><div class="kbox"><div class="kl">Utilidad Neta</div><div class="kv" style="color:#b45309">${fmt(ing-egr)}</div></div><div class="kbox"><div class="kl">Margen</div><div class="kv">${margen}%</div></div></div>
  <div class="sec">Detalle de Ingresos</div>
  <table><thead><tr><th>Descripción</th><th>Categoría</th><th>Fecha</th><th>RUT</th><th>N° Doc.</th><th>IVA</th><th>Neto</th><th>IVA Débito</th><th>Total</th></tr></thead><tbody>
  ${ingresos.map(m=>{const iv=m.iva==='afecto'?Math.round(m.monto*0.19):0;return`<tr><td>${m.desc}</td><td>${catShort(m.cat)}</td><td>${m.fecha}</td><td>${m.rut||'—'}</td><td>${m.doc||'—'}</td><td>${ivaStr(m.iva)}</td><td class="pos">${fmt(m.monto)}</td><td>${m.iva==='afecto'?fmt(iv):'—'}</td><td class="pos">${fmt(m.monto+iv)}</td></tr>`;}).join('')}
  <tr class="tot"><td colspan="6">TOTAL INGRESOS</td><td class="pos">${fmt(ing)}</td><td class="pos">${fmt(ivaD)}</td><td class="pos">${fmt(ing+ivaD)}</td></tr></tbody></table>
  <div class="sec">Detalle de Egresos</div>
  <table><thead><tr><th>Descripción</th><th>Categoría</th><th>Fecha</th><th>RUT</th><th>N° Doc.</th><th>IVA</th><th>Monto</th><th>IVA/Ret.</th></tr></thead><tbody>
  ${egresos.map(m=>{const iv=m.iva==='afecto'?Math.round(m.monto*0.19):m.iva==='honorarios'?Math.round(m.monto*0.1525):0;return`<tr><td>${m.desc}</td><td>${catShort(m.cat)}</td><td>${m.fecha}</td><td>${m.rut||'—'}</td><td>${m.doc||'—'}</td><td>${ivaStr(m.iva)}</td><td class="neg">${fmt(m.monto)}</td><td>${iv>0?fmt(iv):'—'}</td></tr>`;}).join('')}
  <tr class="tot"><td colspan="5">TOTAL EGRESOS</td><td class="neg" style="font-size:9px">Crédito IVA: ${fmt(ivaC)}<br>Ret.Hon: ${fmt(honRet)}</td><td class="neg">${fmt(egr)}</td><td class="neg">${fmt(ivaC+honRet)}</td></tr></tbody></table>
  <div class="sec">Cálculo F29 — ${MESES[currentMonth]} 2026 · Pro Pyme General</div>
  <table><tbody><tr><td>IVA Débito (ventas × 19%)</td><td class="pos">${fmt(ivaD)}</td></tr><tr><td>IVA Crédito Fiscal (compras × 19%)</td><td class="neg">−${fmt(ivaC)}</td></tr><tr><td>IVA Neto</td><td>${fmt(ivaN)}</td></tr><tr><td>PPM (0.25% sobre ventas)</td><td>${usaPPM?fmt(ppm):'No aplicado'}</td></tr><tr><td>Retención Honorarios (15.25%)</td><td>${honRet>0?fmt(honRet):'—'}</td></tr><tr><td>Imp. 2ª Categoría retenido</td><td style='color:#7c3aed'>${imp2Cat>0?fmt(imp2Cat):'$0 (sin liq. guardada)'}</td></tr><tr class="tot"><td><strong>TOTAL F29 A PAGAR</strong></td><td><strong>${fmt(f29)}</strong></td></tr></tbody></table>
  <footer>GeoAltus SPA · Inicio actividades 11-07-2025 · Informe generado ${new Date().toLocaleString('es-CL')}</footer></body></html>`;
  var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);closePdf();
}

// ═══════════════════════════════════════════════════════════
//  PDF ANUAL — Informe completo del año
// ═══════════════════════════════════════════════════════════
function openPdfAnual(yearPreset){
  var añosSet=new Set();
  Object.keys(dataMeses).forEach(k=>{var y=parseInt(k.split('-')[0]);if(y)añosSet.add(y);});
  añosSet.add(currentYear);añosSet.add(2025);añosSet.add(2026);
  var años=Array.from(añosSet).sort((a,b)=>b-a);
  var sel=yearPreset||(typeof statsYear!=='undefined'?statsYear:currentYear);
  var optsHtml=años.map(y=>`<option value="${y}" ${parseInt(y)===parseInt(sel)?'selected':''}>${y}</option>`).join('');
  document.getElementById('pdf-anual-year-select').innerHTML=optsHtml;
  document.getElementById('modal-pdf-anual').classList.add('open');
  actualizarPreviewAnual();
}
function closePdfAnual(){document.getElementById('modal-pdf-anual').classList.remove('open');}
function actualizarPreviewAnual(){
  var y=parseInt(document.getElementById('pdf-anual-year-select').value);
  var mesesConDatos=0,totalIng=0,totalEgr=0,totalMovs=0;
  for(var i=0;i<12;i++){
    var d=dataMeses[y+'-'+i];
    if(d&&d.movs&&d.movs.length>0){
      mesesConDatos++;
      totalIng+=d.movs.filter(m=>m.tipo==='ing').reduce((s,m)=>s+m.monto,0);
      totalEgr+=d.movs.filter(m=>m.tipo==='egr').reduce((s,m)=>s+m.monto,0);
      totalMovs+=d.movs.length;
    }
  }
  var el=document.getElementById('pdf-anual-preview-stats');
  if(!el)return;
  if(mesesConDatos===0){
    el.innerHTML=`<div style="color:var(--amber);font-size:12px;font-family:var(--mono);padding:4px 0">⚠ No hay registros para el año ${y}.</div>`;
  }else{
    el.innerHTML=`<div style="font-size:12px;font-family:var(--mono);color:var(--text2);line-height:1.9">
      <div>• Meses con datos: <strong style="color:var(--text)">${mesesConDatos} de 12</strong></div>
      <div>• Movimientos totales: <strong style="color:var(--text)">${totalMovs}</strong></div>
      <div>• Ingresos acumulados: <strong style="color:var(--green)">${fmt(totalIng)}</strong></div>
      <div>• Egresos acumulados: <strong style="color:var(--red)">${fmt(totalEgr)}</strong></div>
      <div>• Utilidad neta: <strong style="color:var(--gold)">${fmt(totalIng-totalEgr)}</strong></div>
    </div>`;
  }
}
function generarPDFAnual(){
  var y=parseInt(document.getElementById('pdf-anual-year-select').value);
  var usaPPM=document.getElementById('pdf-anual-ppm-toggle')?.checked!==false;

  var mesesData=[],totalAnual={ing:0,egr:0,ventasAfectas:0,comprasAfectas:0,honBoletas:0,ivaD:0,ivaC:0,ivaN:0,ppm:0,honRet:0,imp2Cat:0,f29:0,movs:0};
  var catIngMap={},catEgrMap={},todosMovs=[];
  for(var i=0;i<12;i++){
    var k=y+'-'+i;
    var d=dataMeses[k];
    var ing=0,egr=0,ventasAfectas=0,comprasAfectas=0,honBoletas=0,ingresos=[],egresos=[];
    if(d&&d.movs){
      ingresos=d.movs.filter(m=>m.tipo==='ing');
      egresos=d.movs.filter(m=>m.tipo==='egr');
      ing=ingresos.reduce((s,m)=>s+m.monto,0);
      egr=egresos.reduce((s,m)=>s+m.monto,0);
      ventasAfectas=ingresos.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
      comprasAfectas=egresos.filter(m=>m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
      honBoletas=egresos.filter(m=>m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
      ingresos.forEach(m=>{var c=catShort(m.cat);catIngMap[c]=(catIngMap[c]||0)+m.monto;});
      egresos.forEach(m=>{var c=catShort(m.cat);catEgrMap[c]=(catEgrMap[c]||0)+m.monto;});
      d.movs.forEach(m=>todosMovs.push({...m,_mesIdx:i,_mesNom:MESES[i]}));
    }
    var ivaD=Math.round(ventasAfectas*0.19);
    var ivaC=Math.round(comprasAfectas*0.19);
    var ivaN=ivaD-ivaC;
    var ppm=usaPPM?Math.round(ventasAfectas*0.0025):0;
    var honRet=Math.round(honBoletas*0.1525);
    var imp2Cat=(typeof histLiquidaciones!=='undefined'?histLiquidaciones:[]).filter(h=>h.mesKey===k).reduce((s,h)=>s+h.imp2,0);
    var f29=ivaN+ppm+honRet+imp2Cat;
    var util=ing-egr,margen=ing>0?Math.round(util/ing*100):0;
    mesesData.push({mes:MESES[i],mesIdx:i,ing,egr,util,margen,ventasAfectas,comprasAfectas,ivaD,ivaC,ivaN,ppm,honRet,imp2Cat,f29,tiene:!!(d&&d.movs&&d.movs.length)});
    totalAnual.ing+=ing;totalAnual.egr+=egr;totalAnual.ventasAfectas+=ventasAfectas;totalAnual.comprasAfectas+=comprasAfectas;totalAnual.honBoletas+=honBoletas;
    totalAnual.ivaD+=ivaD;totalAnual.ivaC+=ivaC;totalAnual.ivaN+=ivaN;totalAnual.ppm+=ppm;totalAnual.honRet+=honRet;totalAnual.imp2Cat+=imp2Cat;totalAnual.f29+=f29;
    totalAnual.movs+=(d&&d.movs)?d.movs.length:0;
  }

  var utilAnual=totalAnual.ing-totalAnual.egr;
  var margenAnual=totalAnual.ing>0?Math.round(utilAnual/totalAnual.ing*100):0;
  var mesesConDatos=mesesData.filter(m=>m.tiene).length;
  var mesesUtil=mesesData.filter(m=>m.tiene);
  var mejorMes=mesesUtil.length?mesesUtil.reduce((a,b)=>a.ing>b.ing?a:b):null;
  var peorMes=mesesUtil.length?mesesUtil.reduce((a,b)=>a.util<b.util?a:b):null;
  var f22Proy=Math.round(Math.max(0,utilAnual)*0.25);
  var topIng=Object.entries(catIngMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
  var topEgr=Object.entries(catEgrMap).sort((a,b)=>b[1]-a[1]).slice(0,10);
  todosMovs.sort((a,b)=>{if(a._mesIdx!==b._mesIdx)return a._mesIdx-b._mesIdx;return (a.fecha||'').localeCompare(b.fecha||'');});
  var ingAnual=todosMovs.filter(m=>m.tipo==='ing');
  var egrAnual=todosMovs.filter(m=>m.tipo==='egr');

  var css=`*{box-sizing:border-box;}body{font-family:Arial,sans-serif;font-size:10px;color:#111;margin:32px;line-height:1.5;}
h1{font-size:20px;margin-bottom:2px;color:#111;}h2{font-size:14px;margin:22px 0 10px;color:#b45309;border-bottom:2px solid #b45309;padding-bottom:3px;page-break-after:avoid;}
.sub{color:#666;font-size:10px;margin-bottom:22px;}
.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;margin-bottom:18px;}
.kbox{border:1px solid #e0e0e0;border-radius:6px;padding:11px;background:#fafafa;}
.kl{font-size:8px;text-transform:uppercase;letter-spacing:.5px;color:#888;margin-bottom:4px;}
.kv{font-size:15px;font-weight:800;}
table{width:100%;border-collapse:collapse;font-size:9.5px;margin-bottom:6px;}
th{background:#f4f4f4;padding:5px 7px;text-align:left;font-weight:700;border-bottom:1px solid #ddd;font-size:9px;}
td{padding:5px 7px;border-bottom:1px solid #f0f0f0;}
.pos{color:#16a34a;font-weight:700;}.neg{color:#dc2626;font-weight:700;}
.tot td{font-weight:700;background:#fffbeb;}
.subtot td{font-weight:600;background:#f8fafc;color:#475569;font-size:9px;}
.num{text-align:right;font-variant-numeric:tabular-nums;}
.muted{color:#999;font-style:italic;}
footer{margin-top:30px;font-size:8.5px;color:#aaa;border-top:1px solid #eee;padding-top:8px;}
.page-break{page-break-before:always;}
.hdr-row td{background:#fef3c7;color:#92400e;font-weight:700;font-size:10px;padding:7px;}
.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px;}
.sgrid-box{border:1px solid #e5e7eb;border-radius:6px;padding:11px;background:#fff;}
.sgrid-title{font-size:10px;font-weight:700;color:#475569;margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;}
@media print{h2{page-break-after:avoid;}tr{page-break-inside:avoid;}}`;

  var hoy=new Date(),fechaStr=hoy.toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'}),horaStr=hoy.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});

  var html=`<html><head><meta charset="UTF-8"><title>GeoAltus — Informe Anual ${y}</title><style>${css}</style></head><body>
<h1>GeoAltus SPA — Informe Anual ${y}</h1>
<div class="sub">Período completo enero–diciembre ${y} · Generado ${fechaStr} ${horaStr} · Régimen Pro Pyme General</div>

<h2>1. Resumen Ejecutivo Anual</h2>
<div class="kpis">
  <div class="kbox"><div class="kl">Ingresos ${y}</div><div class="kv" style="color:#16a34a">${fmt(totalAnual.ing)}</div></div>
  <div class="kbox"><div class="kl">Egresos ${y}</div><div class="kv" style="color:#dc2626">${fmt(totalAnual.egr)}</div></div>
  <div class="kbox"><div class="kl">Utilidad Neta</div><div class="kv" style="color:#b45309">${fmt(utilAnual)}</div></div>
  <div class="kbox"><div class="kl">Margen Neto</div><div class="kv">${margenAnual}%</div></div>
</div>
<div class="summary-grid">
  <div class="sgrid-box"><div class="sgrid-title">Cobertura del año</div>
    <div style="font-size:11px;line-height:1.8">
      • Meses con registros: <strong>${mesesConDatos} de 12</strong><br>
      • Movimientos totales: <strong>${totalAnual.movs}</strong><br>
      • Promedio ingresos/mes: <strong>${fmt(mesesConDatos?Math.round(totalAnual.ing/mesesConDatos):0)}</strong><br>
      • Promedio egresos/mes: <strong>${fmt(mesesConDatos?Math.round(totalAnual.egr/mesesConDatos):0)}</strong>
    </div></div>
  <div class="sgrid-box"><div class="sgrid-title">Mejor y peor mes</div>
    <div style="font-size:11px;line-height:1.8">
      ${mejorMes?`• Mejor mes (ingresos): <strong style="color:#16a34a">${mejorMes.mes}</strong> — ${fmt(mejorMes.ing)}<br>`:''}
      ${peorMes?`• Mes más débil (utilidad): <strong style="color:#dc2626">${peorMes.mes}</strong> — ${fmt(peorMes.util)}<br>`:''}
      ${!mejorMes?'• Sin datos suficientes':''}
    </div></div>
</div>

<h2>2. Evolución Mensual</h2>
<table>
<thead><tr><th>Mes</th><th class="num">Ingresos</th><th class="num">Egresos</th><th class="num">Utilidad</th><th class="num">Margen</th><th class="num">IVA Neto</th><th class="num">F29</th></tr></thead>
<tbody>`;
  mesesData.forEach(m=>{
    if(!m.tiene){html+=`<tr><td>${m.mes}</td><td colspan="6" class="muted" style="text-align:center">Sin registros</td></tr>`;}
    else{html+=`<tr><td><strong>${m.mes}</strong></td><td class="num pos">${fmt(m.ing)}</td><td class="num neg">${fmt(m.egr)}</td><td class="num" style="color:${m.util>=0?'#16a34a':'#dc2626'};font-weight:700">${fmt(m.util)}</td><td class="num">${m.margen}%</td><td class="num">${fmt(m.ivaN)}</td><td class="num" style="color:#b45309;font-weight:700">${fmt(m.f29)}</td></tr>`;}
  });
  html+=`<tr class="tot"><td>TOTAL ${y}</td><td class="num pos">${fmt(totalAnual.ing)}</td><td class="num neg">${fmt(totalAnual.egr)}</td><td class="num" style="color:${utilAnual>=0?'#16a34a':'#dc2626'}">${fmt(utilAnual)}</td><td class="num">${margenAnual}%</td><td class="num">${fmt(totalAnual.ivaN)}</td><td class="num" style="color:#b45309">${fmt(totalAnual.f29)}</td></tr></tbody></table>

<h2>3. Ranking de Categorías</h2>
<div class="summary-grid">
  <div class="sgrid-box"><div class="sgrid-title" style="color:#16a34a">Top Ingresos</div>
    <table style="margin-bottom:0"><tbody>${topIng.length?topIng.map((c,i)=>`<tr><td style="font-size:9px">${i+1}. ${c[0]}</td><td class="num pos">${fmt(c[1])}</td><td class="num" style="color:#888;font-size:9px">${totalAnual.ing>0?Math.round(c[1]/totalAnual.ing*100):0}%</td></tr>`).join(''):`<tr><td class="muted">Sin datos</td></tr>`}</tbody></table>
  </div>
  <div class="sgrid-box"><div class="sgrid-title" style="color:#dc2626">Top Egresos</div>
    <table style="margin-bottom:0"><tbody>${topEgr.length?topEgr.map((c,i)=>`<tr><td style="font-size:9px">${i+1}. ${c[0]}</td><td class="num neg">${fmt(c[1])}</td><td class="num" style="color:#888;font-size:9px">${totalAnual.egr>0?Math.round(c[1]/totalAnual.egr*100):0}%</td></tr>`).join(''):`<tr><td class="muted">Sin datos</td></tr>`}</tbody></table>
  </div>
</div>

<div class="page-break"></div>
<h2>4. Resumen Tributario ${y}</h2>
<table>
<thead><tr><th>Concepto Tributario</th><th class="num">Monto Anual</th><th class="num">Promedio mensual</th></tr></thead>
<tbody>
<tr><td>Ventas Afectas (base IVA)</td><td class="num">${fmt(totalAnual.ventasAfectas)}</td><td class="num">${fmt(mesesConDatos?Math.round(totalAnual.ventasAfectas/mesesConDatos):0)}</td></tr>
<tr><td>Compras Afectas (base IVA)</td><td class="num">${fmt(totalAnual.comprasAfectas)}</td><td class="num">${fmt(mesesConDatos?Math.round(totalAnual.comprasAfectas/mesesConDatos):0)}</td></tr>
<tr><td>Honorarios pagados</td><td class="num">${fmt(totalAnual.honBoletas)}</td><td class="num">${fmt(mesesConDatos?Math.round(totalAnual.honBoletas/mesesConDatos):0)}</td></tr>
<tr class="subtot"><td>IVA Débito (ventas × 19%)</td><td class="num pos">${fmt(totalAnual.ivaD)}</td><td class="num">—</td></tr>
<tr class="subtot"><td>IVA Crédito (compras × 19%)</td><td class="num neg">−${fmt(totalAnual.ivaC)}</td><td class="num">—</td></tr>
<tr class="subtot"><td><strong>IVA Neto anual</strong></td><td class="num"><strong>${fmt(totalAnual.ivaN)}</strong></td><td class="num">—</td></tr>
<tr><td>PPM pagado (${usaPPM?'0.25% sobre ventas':'no aplicado'})</td><td class="num">${fmt(totalAnual.ppm)}</td><td class="num">—</td></tr>
<tr><td>Retención Honorarios (15.25%)</td><td class="num">${fmt(totalAnual.honRet)}</td><td class="num">—</td></tr>
<tr><td>Imp. 2ª Categoría retenido</td><td class="num" style="color:#7c3aed">${fmt(totalAnual.imp2Cat)}</td><td class="num">—</td></tr>
<tr class="tot"><td><strong>TOTAL F29 ACUMULADO ${y}</strong></td><td class="num"><strong style="color:#b45309">${fmt(totalAnual.f29)}</strong></td><td class="num">—</td></tr>
</tbody></table>

<h2 style="margin-top:22px">4.1 Proyección F22 (Abril ${y+1})</h2>
<table><tbody>
<tr><td>Utilidad anual (base imponible estimada)</td><td class="num">${fmt(Math.max(0,utilAnual))}</td></tr>
<tr><td>Régimen Pro Pyme General</td><td class="num">25% sobre utilidades</td></tr>
<tr class="tot"><td><strong>Impuesto 1ª Categoría proyectado</strong></td><td class="num"><strong style="color:#b45309">${fmt(f22Proy)}</strong></td></tr>
<tr><td>PPM pagado durante ${y} (crédito)</td><td class="num neg">−${fmt(totalAnual.ppm)}</td></tr>
<tr class="tot"><td><strong>Saldo estimado a pagar F22</strong></td><td class="num"><strong style="color:${(f22Proy-totalAnual.ppm)>0?'#dc2626':'#16a34a'}">${fmt(Math.max(0,f22Proy-totalAnual.ppm))}</strong></td></tr>
</tbody></table>
<p style="font-size:9px;color:#888;margin-top:8px;font-style:italic">Cálculo referencial. La declaración definitiva debe considerar ajustes tributarios específicos (gastos rechazados, corrección monetaria, etc.).</p>

<div class="page-break"></div>
<h2>5. Detalle Completo de Ingresos ${y}</h2>
<p style="font-size:10px;color:#666;margin-bottom:10px">${ingAnual.length} movimiento${ingAnual.length===1?'':'s'} · Ordenados cronológicamente.</p>`;
  if(ingAnual.length===0){html+=`<p class="muted" style="font-size:11px">Sin ingresos registrados en ${y}.</p>`;}
  else{
    html+=`<table>
<thead><tr><th>Mes</th><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>RUT</th><th>N° Doc.</th><th>IVA</th><th class="num">Neto</th><th class="num">IVA Déb.</th><th class="num">Total</th></tr></thead>
<tbody>`;
    var mesActual=-1;
    ingAnual.forEach(m=>{
      if(m._mesIdx!==mesActual){
        mesActual=m._mesIdx;
        var ingMes=ingAnual.filter(x=>x._mesIdx===mesActual).reduce((s,x)=>s+x.monto,0);
        html+=`<tr class="hdr-row"><td colspan="10">${m._mesNom} ${y} — ${fmt(ingMes)}</td></tr>`;
      }
      var iv=m.iva==='afecto'?Math.round(m.monto*0.19):0;
      html+=`<tr><td style="font-size:9px;color:#888">${m._mesNom.slice(0,3)}</td><td>${m.fecha||'—'}</td><td>${m.desc}</td><td>${catShort(m.cat)}</td><td>${m.rut||'—'}</td><td>${m.doc||'—'}</td><td style="font-size:9px">${ivaStr(m.iva)}</td><td class="num pos">${fmt(m.monto)}</td><td class="num">${m.iva==='afecto'?fmt(iv):'—'}</td><td class="num pos">${fmt(m.monto+iv)}</td></tr>`;
    });
    html+=`<tr class="tot"><td colspan="7">TOTAL INGRESOS ${y}</td><td class="num pos">${fmt(totalAnual.ing)}</td><td class="num pos">${fmt(totalAnual.ivaD)}</td><td class="num pos">${fmt(totalAnual.ing+totalAnual.ivaD)}</td></tr></tbody></table>`;
  }

  html+=`<div class="page-break"></div>
<h2>6. Detalle Completo de Egresos ${y}</h2>
<p style="font-size:10px;color:#666;margin-bottom:10px">${egrAnual.length} movimiento${egrAnual.length===1?'':'s'} · Ordenados cronológicamente.</p>`;
  if(egrAnual.length===0){html+=`<p class="muted" style="font-size:11px">Sin egresos registrados en ${y}.</p>`;}
  else{
    html+=`<table>
<thead><tr><th>Mes</th><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>RUT</th><th>N° Doc.</th><th>IVA</th><th class="num">Monto</th><th class="num">IVA/Ret.</th></tr></thead>
<tbody>`;
    var mesActualE=-1;
    egrAnual.forEach(m=>{
      if(m._mesIdx!==mesActualE){
        mesActualE=m._mesIdx;
        var egrMes=egrAnual.filter(x=>x._mesIdx===mesActualE).reduce((s,x)=>s+x.monto,0);
        html+=`<tr class="hdr-row"><td colspan="9">${m._mesNom} ${y} — ${fmt(egrMes)}</td></tr>`;
      }
      var iv=m.iva==='afecto'?Math.round(m.monto*0.19):m.iva==='honorarios'?Math.round(m.monto*0.1525):0;
      html+=`<tr><td style="font-size:9px;color:#888">${m._mesNom.slice(0,3)}</td><td>${m.fecha||'—'}</td><td>${m.desc}</td><td>${catShort(m.cat)}</td><td>${m.rut||'—'}</td><td>${m.doc||'—'}</td><td style="font-size:9px">${ivaStr(m.iva)}</td><td class="num neg">${fmt(m.monto)}</td><td class="num">${iv>0?fmt(iv):'—'}</td></tr>`;
    });
    html+=`<tr class="tot"><td colspan="7">TOTAL EGRESOS ${y}</td><td class="num neg">${fmt(totalAnual.egr)}</td><td class="num neg">Créd.IVA: ${fmt(totalAnual.ivaC)} · Ret.Hon: ${fmt(totalAnual.honRet)}</td></tr></tbody></table>`;
  }

  html+=`<footer>GeoAltus SPA · Inicio actividades 11-07-2025 · Informe anual ${y} generado ${hoy.toLocaleString('es-CL')} · Régimen Pro Pyme General<br>Informe referencial basado en registros del panel. Validar con contador antes de declaraciones oficiales al SII.</footer></body></html>`;

  var w=window.open('','_blank');
  if(!w){toast('⚠ Habilita ventanas emergentes para descargar el PDF','warn');return;}
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),600);
  closePdfAnual();
  toast('✓ Informe anual '+y+' generado','ok');
}
