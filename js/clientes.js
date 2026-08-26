
// ══════════════════════════════════════════
//  CLIENTES
// ══════════════════════════════════════════
let clientes=[];
let nextCliId=1;
let editCliId=null;

function openModalCliente(id){
  editCliId=id||null;
  var modal=document.getElementById('modal-cliente');
  if(!modal)return;
  if(id){
    var c=clientes.find(x=>x.id===id);
    if(!c)return;
    document.getElementById('cli-modal-title').textContent='Editar Cliente';
    document.getElementById('cli-nombre').value=c.nombre;
    document.getElementById('cli-rut').value=c.rut;
    document.getElementById('cli-tipo').value=c.tipo;
    document.getElementById('cli-contacto').value=c.contacto;
    document.getElementById('cli-email').value=c.email;
    document.getElementById('cli-tel').value=c.tel;
    document.getElementById('cli-notas').value=c.notas;
  } else {
    document.getElementById('cli-modal-title').textContent='Nuevo Cliente';
    ['cli-nombre','cli-rut','cli-contacto','cli-email','cli-tel','cli-notas'].forEach(id=>document.getElementById(id).value='');
    document.getElementById('cli-tipo').value='minera';
  }
  modal.classList.add('open');
}
function closeModalCliente(){
  var m=document.getElementById('modal-cliente');
  if(m)m.classList.remove('open');
}
function guardarCliente(){
  var valid=validateForm([{id:'cli-nombre'},{id:'cli-rut'}]);
  if(!valid)return;
  var nombre=document.getElementById('cli-nombre').value.trim();
  var rut=document.getElementById('cli-rut').value.trim();
  var c={id:editCliId||nextCliId++,nombre,rut,tipo:document.getElementById('cli-tipo').value,contacto:document.getElementById('cli-contacto').value.trim(),email:document.getElementById('cli-email').value.trim(),tel:document.getElementById('cli-tel').value.trim(),notas:document.getElementById('cli-notas').value.trim(),activo:true};
  if(editCliId){var idx=clientes.findIndex(x=>x.id===editCliId);if(idx>=0)clientes[idx]=c;}
  else clientes.push(c);
  closeModalCliente();
  renderClientes();saveAllData();toast(editCliId?'Cliente actualizado':'Cliente guardado','ok');
}
async function eliminarCliente(id){
  var c=clientes.find(x=>x.id===id);
  if(!c)return;
  var ok=await confirmDialog('¿Eliminar cliente?','Se eliminará la ficha. Los movimientos del Libro no se borran.',c.nombre);
  if(!ok)return;
  clientes=clientes.filter(x=>x.id!==id);
  renderClientes();saveAllData();toast('Cliente eliminado','warn');
}
function getFacturacionCliente(rut){
  var total=0,facturas=0,ultimo='';
  Object.values(dataMeses).forEach(d=>{
    d.movs.filter(m=>m.tipo==='ing'&&m.rut===rut).forEach(m=>{total+=m.monto;facturas++;if(!ultimo||m.fecha>ultimo)ultimo=m.fecha;});
  });
  return{total,facturas,ultimo};
}
function getProyectosCliente(cliId){
  return proyectos.filter(p=>p.cliId===cliId);
}
function renderClientes(){
  var search=(document.getElementById('cli-search')?.value||'').toLowerCase();
  var filtrados=clientes.filter(c=>{
    if(!search)return true;
    return c.nombre.toLowerCase().includes(search)||c.rut.toLowerCase().includes(search)||(c.contacto||'').toLowerCase().includes(search);
  });
  // KPIs
  var totalFact=clientes.reduce((s,c)=>s+getFacturacionCliente(c.rut).total,0);
  var mejorCli=clientes.length?clientes.reduce((a,b)=>getFacturacionCliente(a.rut).total>getFacturacionCliente(b.rut).total?a:b):null;
  document.getElementById('cli-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--teal)"><div class="kpi-top"><div class="kpi-lbl">Total Clientes</div><div class="kpi-ico">◎</div></div><div class="kpi-val" style="color:var(--teal)">${clientes.length}</div><div class="kpi-foot"><span class="muted">${clientes.filter(c=>c.activo).length} activos</span></div></div>
    <div class="kpi" style="--kc:var(--green)"><div class="kpi-top"><div class="kpi-lbl">Facturación Total</div><div class="kpi-ico">↑</div></div><div class="kpi-val" style="color:var(--green)">${fmtK(totalFact)}</div><div class="kpi-foot"><span class="muted">Todos los períodos</span></div></div>
    <div class="kpi" style="--kc:var(--gold)"><div class="kpi-top"><div class="kpi-lbl">Cliente Principal</div><div class="kpi-ico">★</div></div><div class="kpi-val" style="color:var(--gold);font-size:14px">${mejorCli?mejorCli.nombre.split(' ')[0]:'—'}</div><div class="kpi-foot"><span class="muted">${mejorCli?fmtK(getFacturacionCliente(mejorCli.rut).total):'—'} facturado</span></div></div>
    <div class="kpi" style="--kc:var(--blue)"><div class="kpi-top"><div class="kpi-lbl">Proyectos Activos</div><div class="kpi-ico">◫</div></div><div class="kpi-val" style="color:var(--blue)">${proyectos.filter(p=>p.estado==='activo').length}</div><div class="kpi-foot"><span class="muted">En todos los clientes</span></div></div>`;
  // Cards
  var tipoIcon={minera:'⛏',privado:'◎',publica:'◉',constructora:'◫',otro:'◈'};
  var tipoBadge={minera:'bgo',privado:'bb',publica:'bt',constructora:'ba',otro:'bp'};
  document.getElementById('cli-grid').innerHTML=filtrados.length?filtrados.map(c=>{
    var f=getFacturacionCliente(c.rut);
    var ps=getProyectosCliente(c.id);
    return`<div class="card" style="cursor:pointer" onclick="openModalCliente(${c.id})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:10px">
          <div style="width:38px;height:38px;border-radius:9px;background:var(--gold-dim);border:1px solid rgba(233,185,73,.2);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${tipoIcon[c.tipo]||'◈'}</div>
          <div>
            <div style="font-size:13px;font-weight:700;line-height:1.3">${c.nombre}</div>
            <div style="font-size:10px;font-family:var(--mono);color:var(--text3);margin-top:2px">${c.rut}</div>
          </div>
        </div>
        <span class="badge ${tipoBadge[c.tipo]||'bb'}">${c.tipo}</span>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="background:var(--surface);border-radius:7px;padding:8px;border:1px solid var(--border)">
          <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">FACTURADO</div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:var(--green)">${fmtK(f.total)}</div>
        </div>
        <div style="background:var(--surface);border-radius:7px;padding:8px;border:1px solid var(--border)">
          <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">FACTURAS</div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:var(--blue)">${f.facturas}</div>
        </div>
        <div style="background:var(--surface);border-radius:7px;padding:8px;border:1px solid var(--border)">
          <div style="font-size:9px;font-family:var(--mono);color:var(--text3);margin-bottom:3px">PROYECTOS</div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:var(--teal)">${ps.length}</div>
        </div>
      </div>
      ${c.contacto?`<div style="font-size:11px;color:var(--text3);margin-bottom:4px">👤 ${c.contacto}</div>`:''}
      ${c.notas?`<div style="font-size:11px;color:var(--text3);font-style:italic">${c.notas}</div>`:''}
      <div style="display:flex;gap:6px;margin-top:12px">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="event.stopPropagation();openModalCliente(${c.id})">✎ Editar</button>
        <button class="btn btn-sm" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,.2)" onclick="event.stopPropagation();eliminarCliente(${c.id})">✕</button>
      </div>
    </div>`;
  }).join(''):`<div style="font-size:12px;color:var(--text3);font-family:var(--mono);padding:32px;text-align:center;grid-column:1/-1">Sin clientes encontrados</div>`;
  // Tabla
  document.getElementById('cli-tbody').innerHTML=filtrados.map(c=>{
    var f=getFacturacionCliente(c.rut);
    var ps=getProyectosCliente(c.id);
    var pct=totalFact>0?Math.round(f.total/totalFact*100):0;
    return`<tr>
      <td><div style="font-weight:700">${c.nombre}</div></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${c.rut}</td>
      <td><span class="badge ${tipoBadge[c.tipo]||'bb'}">${c.tipo}</span></td>
      <td style="font-family:var(--mono)">${ps.length}</td>
      <td style="font-family:var(--mono)">${f.facturas}</td>
      <td style="font-family:var(--mono);font-weight:700;color:var(--green)">${fmt(f.total)} <span style="font-size:10px;color:var(--text3)">(${pct}%)</span></td>
      <td style="font-family:var(--mono);font-size:11px;color:var(--text3)">${f.ultimo||'—'}</td>
      <td><span class="badge ${c.activo?'bg':'br'}">${c.activo?'Activo':'Inactivo'}</span></td>
    </tr>`;
  }).join('');
}
