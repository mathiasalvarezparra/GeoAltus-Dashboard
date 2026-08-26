
// ═══════════════════════════════════════════════════════════
//  PLANTILLAS DE COTIZACIÓN
// ═══════════════════════════════════════════════════════════
var editPlantillaId=null;
var plantillaItemsBuffer=[];

function renderPlantillasList(){
  var cont=document.getElementById('plantillas-list');
  var empty=document.getElementById('plantillas-empty');
  if(!cont)return;
  if(plantillasCotizacion.length===0){
    cont.innerHTML='';empty.style.display='block';return;
  }
  empty.style.display='none';
  cont.innerHTML=plantillasCotizacion.map(p=>{
    var total=(p.items||[]).reduce((s,i)=>s+(i.cantidad*i.precio),0);
    return `<div class="trab-card" style="cursor:default">
      <div class="trab-name">${p.nombre}</div>
      <div class="trab-meta" style="margin-top:4px">${p.descripcion||'Sin descripción'}</div>
      <div class="trab-meta" style="margin-top:6px;color:var(--gold);font-family:var(--mono)">
        ${(p.items||[]).length} ítem${(p.items||[]).length===1?'':'s'} · ${fmt(total)} neto
      </div>
      <div style="display:flex;gap:6px;margin-top:10px">
        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="editarPlantilla(${p.id})">✎ Editar</button>
        <button class="btn btn-ghost btn-sm" style="flex:1;color:var(--red);border-color:rgba(240,82,82,.25)" onclick="eliminarPlantilla(${p.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

function openPlantillaModal(){
  editPlantillaId=null;
  plantillaItemsBuffer=[];
  document.getElementById('plantilla-modal-title').textContent='Nueva Plantilla';
  ['plantilla-nombre','plantilla-descripcion','plantilla-plazo','plantilla-pago','plantilla-notas'].forEach(id=>{var el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('plantilla-validez').value='30';
  renderItemsPlantilla();
  document.getElementById('modal-plantilla').classList.add('open');
}

function closePlantillaModal(){document.getElementById('modal-plantilla').classList.remove('open');}

function editarPlantilla(id){
  var p=plantillasCotizacion.find(x=>x.id===id);
  if(!p)return;
  editPlantillaId=id;
  plantillaItemsBuffer=JSON.parse(JSON.stringify(p.items||[]));
  document.getElementById('plantilla-modal-title').textContent='Editar Plantilla';
  document.getElementById('plantilla-nombre').value=p.nombre||'';
  document.getElementById('plantilla-descripcion').value=p.descripcion||'';
  document.getElementById('plantilla-validez').value=p.validez||30;
  document.getElementById('plantilla-plazo').value=p.plazo||'';
  document.getElementById('plantilla-pago').value=p.formaPago||'';
  document.getElementById('plantilla-notas').value=p.notas||'';
  renderItemsPlantilla();
  document.getElementById('modal-plantilla').classList.add('open');
}

function agregarItemPlantilla(){
  plantillaItemsBuffer.push({descripcion:'',cantidad:1,precio:0,unidad:'UN'});
  renderItemsPlantilla();
}

function quitarItemPlantilla(idx){
  plantillaItemsBuffer.splice(idx,1);
  renderItemsPlantilla();
}

function moverItemPlantilla(idx,dir){
  var nuevoIdx=idx+dir;
  if(nuevoIdx<0||nuevoIdx>=plantillaItemsBuffer.length)return;
  var tmp=plantillaItemsBuffer[idx];
  plantillaItemsBuffer[idx]=plantillaItemsBuffer[nuevoIdx];
  plantillaItemsBuffer[nuevoIdx]=tmp;
  renderItemsPlantilla();
}

function renderItemsPlantilla(){
  var cont=document.getElementById('plantilla-items');
  if(!cont)return;
  if(plantillaItemsBuffer.length===0){
    cont.innerHTML=`<div style="padding:20px;text-align:center;color:var(--text3);font-size:11px;font-family:var(--mono);border:1px dashed var(--border);border-radius:8px">Sin ítems · Agrega al menos uno</div>`;
    return;
  }
  cont.innerHTML=plantillaItemsBuffer.map((it,i)=>{
    var esPrimero=i===0;
    var esUltimo=i===plantillaItemsBuffer.length-1;
    var arrowOk='background:var(--surface);color:var(--text2);border:1px solid var(--border);border-radius:6px;width:24px;height:34px;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);padding:0';
    var arrowDis='background:transparent;color:var(--text3);border:1px solid var(--border);border-radius:6px;width:24px;height:34px;cursor:not-allowed;font-size:11px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);padding:0;opacity:.35';
    return `
    <div style="display:grid;grid-template-columns:1fr 80px 70px 110px 24px 24px 32px;gap:6px;align-items:center;background:var(--bg);padding:8px;border-radius:8px;border:1px solid var(--border)">
      <input class="form-input" style="height:34px;font-size:12px" placeholder="Descripción" value="${it.descripcion||''}" oninput="plantillaItemsBuffer[${i}].descripcion=this.value">
      <input class="form-input" style="height:34px;font-size:12px;text-align:right" type="number" placeholder="Cant." value="${it.cantidad||1}" oninput="plantillaItemsBuffer[${i}].cantidad=parseFloat(this.value)||0">
      <select class="form-input" style="height:34px;font-size:11px" onchange="plantillaItemsBuffer[${i}].unidad=this.value">
        <option value="UN" ${it.unidad==='UN'?'selected':''}>UN</option>
        <option value="HR" ${it.unidad==='HR'?'selected':''}>HR</option>
        <option value="DÍA" ${it.unidad==='DÍA'?'selected':''}>DÍA</option>
        <option value="HA" ${it.unidad==='HA'?'selected':''}>HA</option>
        <option value="KM" ${it.unidad==='KM'?'selected':''}>KM</option>
        <option value="M²" ${it.unidad==='M²'?'selected':''}>M²</option>
        <option value="GL" ${it.unidad==='GL'?'selected':''}>GL</option>
      </select>
      <input class="form-input" style="height:34px;font-size:12px;text-align:right" type="number" placeholder="Precio" value="${it.precio||0}" oninput="plantillaItemsBuffer[${i}].precio=parseFloat(this.value)||0">
      <button ${esPrimero?'disabled':''} title="Mover arriba" onclick="moverItemPlantilla(${i},-1)" style="${esPrimero?arrowDis:arrowOk}">▲</button>
      <button ${esUltimo?'disabled':''} title="Mover abajo" onclick="moverItemPlantilla(${i},1)" style="${esUltimo?arrowDis:arrowOk}">▼</button>
      <button class="btn btn-ghost btn-sm" style="padding:6px 8px;color:var(--red)" onclick="quitarItemPlantilla(${i})" title="Eliminar">✕</button>
    </div>
  `;}).join('');
}

function guardarPlantilla(){
  var nombre=document.getElementById('plantilla-nombre').value.trim();
  if(!nombre){toast('La plantilla debe tener un nombre','warn');return;}
  if(plantillaItemsBuffer.length===0){toast('Agrega al menos un ítem','warn');return;}
  var plantilla={
    id:editPlantillaId||Date.now(),
    nombre,
    descripcion:document.getElementById('plantilla-descripcion').value.trim(),
    validez:parseInt(document.getElementById('plantilla-validez').value)||30,
    plazo:document.getElementById('plantilla-plazo').value.trim(),
    formaPago:document.getElementById('plantilla-pago').value.trim(),
    notas:document.getElementById('plantilla-notas').value.trim(),
    items:plantillaItemsBuffer.map(i=>({descripcion:i.descripcion||'',cantidad:i.cantidad||1,unidad:i.unidad||'UN',precio:i.precio||0}))
  };
  if(editPlantillaId){
    var idx=plantillasCotizacion.findIndex(x=>x.id===editPlantillaId);
    if(idx>=0)plantillasCotizacion[idx]=plantilla;
  }else{
    plantillasCotizacion.push(plantilla);
  }
  saveAllData();
  closePlantillaModal();
  renderConfigView();
  toast('✓ Plantilla '+(editPlantillaId?'actualizada':'guardada'),'ok');
}

function eliminarPlantilla(id){
  var p=plantillasCotizacion.find(x=>x.id===id);if(!p)return;
  showConfirm({title:'¿Eliminar plantilla?',desc:'Se eliminará permanentemente.',item:p.nombre,okText:'Eliminar'}).then(ok=>{
    if(!ok)return;
    plantillasCotizacion=plantillasCotizacion.filter(x=>x.id!==id);
    saveAllData();renderConfigView();toast('Plantilla eliminada','warn');
  });
}

// ── USAR plantilla al crear cotización ──
// Esta función es llamada desde el modal de cotización (si existe botón "Usar plantilla")
function aplicarPlantillaCotizacion(plantillaId){
  var p=plantillasCotizacion.find(x=>x.id===plantillaId);
  if(!p)return null;
  return p; // el modal de cotización existente decide cómo inyectar los items
}
