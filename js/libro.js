
//  LIBRO 
function onTipoChange(){poblarFiltrosCat();renderLibro();}

function poblarFiltrosCat(){
  var tipo=document.getElementById('fil-tipo').value;
  var sel=document.getElementById('fil-cat');const prev=sel.value;
  sel.innerHTML='<option value="">Todas las categorías</option>';
  var cats=tipo==='ing'?CAT_ING:tipo==='egr'?CAT_EGR:[...CAT_ING,...CAT_EGR];
  cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=catShort(c);sel.appendChild(o);});
  if(cats.find(c=>c===prev))sel.value=prev;
}

function renderLibro(){
  var d=getMes();const{movs}=d;var ing=getIng(d),egr=getEgr(d);
  document.getElementById('libro-title').textContent=`Registros — ${MESES[currentMonth]} ${currentYear}`;
  var fT=document.getElementById('fil-tipo').value,fC=document.getElementById('fil-cat').value,fI=document.getElementById('fil-iva').value,fS=document.getElementById('fil-search').value.toLowerCase();
  var filtered=[...movs].filter(m=>{
    if(fT&&m.tipo!==fT)return false;if(fC&&m.cat!==fC)return false;if(fI&&m.iva!==fI)return false;
    if(fS&&!m.desc.toLowerCase().includes(fS)&&!m.rut.includes(fS)&&!m.doc.toLowerCase().includes(fS))return false;return true;
  }).reverse();
  document.getElementById('libro-count').textContent=filtered.length+' registro'+(filtered.length!==1?'s':'');
  var tbody=document.getElementById('libro-tbody'),empty=document.getElementById('libro-empty');
  if(!filtered.length){tbody.innerHTML='';empty.style.display='block';}
  else{empty.style.display='none';tbody.innerHTML=filtered.map(m=>`<tr><td style="font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.desc}</td><td style="color:var(--text2);font-size:11px">${catShort(m.cat)}</td><td style="color:var(--text3);font-family:var(--mono);font-size:11px">${m.fecha}</td><td style="color:var(--text3);font-family:var(--mono);font-size:11px">${m.rut||'—'}</td><td style="color:var(--text3);font-family:var(--mono);font-size:11px">${m.doc||'—'}</td><td><span class="iva-chip ${ivaBadge(m.iva)}">${ivaStr(m.iva)}</span></td><td style="color:${m.tipo==='ing'?'var(--green)':'var(--red)'};font-weight:700;font-family:var(--mono)">${m.tipo==='ing'?'+':'−'}${fmt(m.monto)}</td><td><div class="row-actions"><button class="action-btn" onclick="abrirEdicion(${m.id})">✎</button><button class="action-btn del" onclick="eliminarRegistro(${m.id})">✕</button></div></td></tr>`).join('');}
  var _ingMovs=movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto'),_egrMovs=movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto');
  var ivaD=Math.round(_ingMovs.reduce((s,m)=>s+m.monto,0)*0.19),ivaC=Math.round(_egrMovs.reduce((s,m)=>s+m.monto,0)*0.19);
  document.getElementById('rl-ing').textContent=fmt(ing);document.getElementById('rl-egr').textContent=fmt(egr);
  document.getElementById('rl-ivad').textContent=fmt(ivaD);document.getElementById('rl-ivac').textContent=fmt(ivaC);
  document.getElementById('rl-ivan').textContent=fmt(ivaD-ivaC);document.getElementById('rl-util').textContent=fmt(ing-egr);
  renderCatBars('ing',movs,ing);renderCatBars('egr',movs,egr);
}

function renderCatBars(tipo,movs,total){
  var cats=tipo==='ing'?CAT_ING:CAT_EGR,colors=tipo==='ing'?CI:CE;
  var map={};movs.filter(m=>m.tipo===tipo).forEach(m=>{map[m.cat]=(map[m.cat]||0)+m.monto;});
  var items=cats.map((c,i)=>({name:catShort(c),val:map[c]||0,color:colors[i]})).filter(x=>x.val>0).sort((a,b)=>b.val-a.val);
  var el=document.getElementById(`cat-${tipo}-bars`);
  el.innerHTML=!items.length?'<div style="font-size:11px;color:var(--text3);font-family:var(--mono)">Sin registros</div>':items.map(it=>`<div class="cat-bar-item"><div class="cat-bar-top"><span class="cat-bar-name">${it.name}</span><span class="cat-bar-val">${total>0?Math.round(it.val/total*100):0}%</span></div><div class="cat-track"><div class="cat-fill" style="width:${total>0?Math.round(it.val/total*100):0}%;background:${it.color}"></div></div></div>`).join('');
}

function limpiarFiltros(){['fil-tipo','fil-cat','fil-iva'].forEach(id=>document.getElementById(id).value='');document.getElementById('fil-search').value='';poblarFiltrosCat();renderLibro();}
