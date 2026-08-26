
// ══════════════════════════════════════════
//  HISTORIAL & BÚSQUEDA
// ══════════════════════════════════════════
function poblarFiltrosHist(){
  var sel=document.getElementById('hist-cat');
  if(!sel)return;
  var cats=[...new Set([...CAT_ING,...CAT_EGR].map(c=>catShort(c)))];
  var current=sel.value;
  sel.innerHTML='<option value="">Todas las categorías</option>'+cats.map(c=>`<option value="${c}" ${current===c?'selected':''}>${c}</option>`).join('');
}
function limpiarFiltrosHist(){
  ['hist-search','hist-tipo','hist-cat','hist-iva-f','hist-anio'].forEach(id=>{var e=document.getElementById(id);if(e)e.value='';});
  renderHist();
}
function renderHist(){
  poblarFiltrosHist();
  var search=(document.getElementById('hist-search')?.value||'').toLowerCase();
  var tipo=document.getElementById('hist-tipo')?.value||'';
  var cat=document.getElementById('hist-cat')?.value||'';
  var ivaF=document.getElementById('hist-iva-f')?.value||'';
  var anio=document.getElementById('hist-anio')?.value||'';
  // Collect all movs from all months
  var todos=[];
  Object.entries(dataMeses).sort(([a],[b])=>b.localeCompare(a)).forEach(([k,d])=>{
    var parts=k.split('-');var y=parseInt(parts[0]),m=parseInt(parts[1]);
    if(anio&&parseInt(anio)!==y)return;
    d.movs.forEach(mov=>{todos.push({...mov,_year:y,_mes:m,_label:MESES[m]+' '+y});});
  });
  // Filtrar
  var filtrados=todos.filter(m=>{
    if(tipo&&m.tipo!==tipo)return false;
    if(cat&&!m.cat.includes(cat))return false;
    if(ivaF&&m.iva!==ivaF)return false;
    if(search){
      var hay=(m.desc||'').toLowerCase().includes(search)||(m.rut||'').toLowerCase().includes(search)||(m.doc||'').toLowerCase().includes(search)||(m.cat||'').toLowerCase().includes(search);
      if(!hay)return false;
    }
    return true;
  });
  // Summary
  var totalIng=filtrados.filter(m=>m.tipo==='ing').reduce((s,m)=>s+m.monto,0);
  var totalEgr=filtrados.filter(m=>m.tipo==='egr').reduce((s,m)=>s+m.monto,0);
  var sumEl=document.getElementById('hist-summary');
  if(sumEl) sumEl.innerHTML=`<span style="color:var(--text2)">${filtrados.length} registros</span><span style="color:var(--green)">↑ ${fmt(totalIng)}</span><span style="color:var(--red)">↓ ${fmt(totalEgr)}</span><span style="color:var(--gold)">Util. ${fmt(totalIng-totalEgr)}</span>`;
  var tbody=document.getElementById('hist-tbody');
  var empty=document.getElementById('hist-empty');
  if(!filtrados.length){
    if(tbody)tbody.innerHTML='';
    if(empty)empty.style.display='block';
    return;
  }
  if(empty)empty.style.display='none';
  if(tbody)tbody.innerHTML=filtrados.map(m=>`
    <tr>
      <td><span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${m._label}</span></td>
      <td><div style="font-weight:600">${m.desc}</div><div style="font-size:10px;color:var(--text3);font-family:var(--mono)">${catShort(m.cat)}</div></td>
      <td style="font-size:11px;color:var(--text3)">${catShort(m.cat)}</td>
      <td style="font-family:var(--mono);font-size:11px">${m.fecha}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${m.rut||'—'}</td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${m.doc||'—'}</td>
      <td><span class="iva-chip ${ivaBadge(m.iva)}">${ivaStr(m.iva)}</span></td>
      <td style="font-family:var(--mono);font-weight:700;color:${m.tipo==='ing'?'var(--green)':'var(--red)'}">${m.tipo==='ing'?'+':'−'}${fmt(m.monto)}</td>
    </tr>`).join('');
}
