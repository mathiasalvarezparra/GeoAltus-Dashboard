
// ══════════════════════════════════════════
//  PROYECTOS
// ══════════════════════════════════════════
let proyectos=[];
let nextProyId=1;
let editProyId=null;

function openModalProyecto(id){
  editProyId=id||null;
  var modal=document.getElementById('modal-proyecto');
  if(!modal)return;
  // Poblar select clientes
  var sel=document.getElementById('proy-cli-select');
  sel.innerHTML=clientes.map(c=>`<option value="${c.id}">${c.nombre.split('(')[0].trim()}</option>`).join('');
  if(id){
    var p=proyectos.find(x=>x.id===id);
    if(!p)return;
    document.getElementById('proy-modal-title').textContent='Editar Proyecto';
    document.getElementById('proy-nombre').value=p.nombre;
    sel.value=p.cliId;
    document.getElementById('proy-tipo-serv').value=p.tipoServ;
    document.getElementById('proy-estado-f').value=p.estado;
    document.getElementById('proy-presupuesto').value=p.presupuesto;
    document.getElementById('proy-facturado').value=p.facturado;
    document.getElementById('proy-inicio').value=p.inicio;
    document.getElementById('proy-fin').value=p.fin||'';
    document.getElementById('proy-desc').value=p.desc;
  } else {
    document.getElementById('proy-modal-title').textContent='Nuevo Proyecto';
    ['proy-nombre','proy-presupuesto','proy-facturado','proy-inicio','proy-fin','proy-desc'].forEach(i=>document.getElementById(i).value='');
    document.getElementById('proy-tipo-serv').value='gis';
    document.getElementById('proy-estado-f').value='cotizacion';
  }
  modal.classList.add('open');
}
function closeModalProyecto(){var m=document.getElementById('modal-proyecto');if(m)m.classList.remove('open');}
function guardarProyecto(){
  var valid=validateForm([{id:'proy-nombre'}]);
  if(!valid)return;
  var nombre=document.getElementById('proy-nombre').value.trim();
  var p={
    id:editProyId||nextProyId++,
    nombre,
    cliId:parseInt(document.getElementById('proy-cli-select').value),
    tipoServ:document.getElementById('proy-tipo-serv').value,
    estado:document.getElementById('proy-estado-f').value,
    presupuesto:parseFloat(document.getElementById('proy-presupuesto').value)||0,
    facturado:parseFloat(document.getElementById('proy-facturado').value)||0,
    inicio:document.getElementById('proy-inicio').value,
    fin:document.getElementById('proy-fin').value,
    desc:document.getElementById('proy-desc').value.trim(),
  };
  if(editProyId){var idx=proyectos.findIndex(x=>x.id===editProyId);if(idx>=0)proyectos[idx]=p;}
  else proyectos.push(p);
  closeModalProyecto();
  renderProyectos();saveAllData();toast(editProyId?'Proyecto actualizado':'Proyecto creado','ok');
}
async function eliminarProyecto(id){
  var p=proyectos.find(x=>x.id===id);
  if(!p)return;
  var ok=await confirmDialog('¿Eliminar proyecto?','Esta acción no se puede deshacer.',p.nombre);
  if(!ok)return;
  proyectos=proyectos.filter(x=>x.id!==id);
  renderProyectos();saveAllData();toast('Proyecto eliminado','warn');
}
function poblarFiltroClientes(){
  var sel=document.getElementById('proy-cliente');
  if(!sel)return;
  sel.innerHTML='<option value="">Todos los clientes</option>'+clientes.map(c=>`<option value="${c.id}">${c.nombre.split('(')[0].trim()}</option>`).join('');
}
function renderProyectos(){
  poblarFiltroClientes();
  var search=(document.getElementById('proy-search')?.value||'').toLowerCase();
  var estado=document.getElementById('proy-estado')?.value||'';
  var cliF=document.getElementById('proy-cliente')?.value||'';
  var filtrados=proyectos.filter(p=>{
    if(estado&&p.estado!==estado)return false;
    if(cliF&&p.cliId!==parseInt(cliF))return false;
    if(search&&!p.nombre.toLowerCase().includes(search))return false;
    return true;
  });
  // KPIs
  var totalPres=proyectos.reduce((s,p)=>s+p.presupuesto,0);
  var totalFact=proyectos.reduce((s,p)=>s+p.facturado,0);
  var activos=proyectos.filter(p=>p.estado==='activo').length;
  var completados=proyectos.filter(p=>p.estado==='completado').length;
  document.getElementById('proy-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--blue)"><div class="kpi-top"><div class="kpi-lbl">Total Proyectos</div><div class="kpi-ico">◫</div></div><div class="kpi-val" style="color:var(--blue)">${proyectos.length}</div><div class="kpi-foot"><span class="muted">${activos} activos · ${completados} completados</span></div></div>
    <div class="kpi" style="--kc:var(--gold)"><div class="kpi-top"><div class="kpi-lbl">Presupuesto Total</div><div class="kpi-ico">◈</div></div><div class="kpi-val" style="color:var(--gold)">${fmtK(totalPres)}</div><div class="kpi-foot"><span class="muted">Acumulado todos los proyectos</span></div></div>
    <div class="kpi" style="--kc:var(--green)"><div class="kpi-top"><div class="kpi-lbl">Total Facturado</div><div class="kpi-ico">↑</div></div><div class="kpi-val" style="color:var(--green)">${fmtK(totalFact)}</div><div class="kpi-foot"><span class="muted">${totalPres>0?Math.round(totalFact/totalPres*100):0}% del presupuesto</span></div></div>
    <div class="kpi" style="--kc:var(--teal)"><div class="kpi-top"><div class="kpi-lbl">En Cotización</div><div class="kpi-ico">◎</div></div><div class="kpi-val" style="color:var(--teal)">${proyectos.filter(p=>p.estado==='cotizacion').length}</div><div class="kpi-foot"><span class="muted">Oportunidades abiertas</span></div></div>`;
  var estadoColor={activo:'var(--green)',completado:'var(--teal)',pausado:'var(--amber)',cotizacion:'var(--blue)'};
  var estadoBadge={activo:'bg',completado:'bt',pausado:'ba',cotizacion:'bb'};
  var tipoServLabel={topografia:'Levantamiento',fotogrametria:'Fotogrametría',gis:'GIS',teledeteccion:'Teledetección',consultoria:'Consultoría',otro:'Otro'};
  document.getElementById('proy-cards').innerHTML=filtrados.length?filtrados.map(p=>{
    var cli=clientes.find(c=>c.id===p.cliId);
    var pct=p.presupuesto>0?Math.min(Math.round(p.facturado/p.presupuesto*100),100):0;
    var rentColor=p.facturado>=p.presupuesto?'var(--green)':p.facturado>0?'var(--amber)':'var(--text3)';
    return`<div class="card">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div>
          <div style="font-size:13px;font-weight:700;margin-bottom:4px">${p.nombre}</div>
          <div style="font-size:11px;color:var(--text3);font-family:var(--mono)">${cli?cli.nombre.split('(')[0].trim():'Cliente eliminado'}</div>
        </div>
        <span class="badge ${estadoBadge[p.estado]||'bb'}">${p.estado}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--surface);border-radius:7px;padding:8px;border:1px solid var(--border)">
          <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:2px">PRESUPUESTO</div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:var(--gold)">${fmtK(p.presupuesto)}</div>
        </div>
        <div style="background:var(--surface);border-radius:7px;padding:8px;border:1px solid var(--border)">
          <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:2px">FACTURADO</div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:${rentColor}">${fmtK(p.facturado)}</div>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:10px;font-family:var(--mono);color:var(--text3);margin-bottom:4px">
          <span>Avance facturación</span><span>${pct}%</span>
        </div>
        <div style="height:5px;background:var(--border);border-radius:99px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${rentColor};border-radius:99px;transition:width 1s ease"></div>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:10px;font-size:11px;font-family:var(--mono);color:var(--text3)">
        <span>📅 ${p.inicio||'—'}</span>${p.fin?`<span>→ ${p.fin}</span>`:''}
        <span class="badge bt" style="font-size:9px">${tipoServLabel[p.tipoServ]||p.tipoServ}</span>
      </div>
      ${p.desc?`<div style="font-size:11px;color:var(--text3);margin-bottom:10px;line-height:1.5">${p.desc}</div>`:''}
      <div style="display:flex;gap:6px">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="openModalProyecto(${p.id})">✎ Editar</button>
        <button class="btn btn-sm" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,.2)" onclick="eliminarProyecto(${p.id})">✕</button>
      </div>
    </div>`;
  }).join(''):`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:32px;text-align:center;grid-column:1/-1">Sin proyectos que coincidan con los filtros.<br>Haz clic en "+ Nuevo Proyecto" para crear uno.</div>`;
}
