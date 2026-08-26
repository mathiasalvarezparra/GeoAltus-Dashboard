


// ══════════════════════════════════════════
//  COTIZACIONES
// ══════════════════════════════════════════
const CAT_SERVICIOS=[
  {
    id:'tecnicos',
    label:'Servicios Técnicos',
    ico:'⚙',
    color:'var(--teal)',
    items:[
      {ico:'📡',label:'Levantamiento GPS',desc:'Levantamiento topográfico con GPS',unidad:'Ha',precio:180000},
      {ico:'📐',label:'Estación Total',desc:'Levantamiento con estación total',unidad:'Ha',precio:200000},
      {ico:'🚁',label:'Vuelo Fotogramétrico',desc:'Vuelo fotogramétrico con drone',unidad:'Ha',precio:220000},
      {ico:'🔍',label:'Inspección Drone',desc:'Inspección visual aérea con drone',unidad:'Ha',precio:90000},
      {ico:'🌊',label:'Batimetría',desc:'Levantamiento batimétrico',unidad:'Ha',precio:250000},
      {ico:'📍',label:'Replanteo',desc:'Replanteo topográfico en terreno',unidad:'Punto',precio:18000},
      {ico:'📏',label:'Nivelación',desc:'Nivelación geométrica de precisión',unidad:'km',precio:120000},
      {ico:'🗺',label:'Análisis GIS',desc:'Análisis espacial y cartografía SIG',unidad:'Capa',precio:280000},
      {ico:'🛰',label:'Teledetección',desc:'Análisis de imágenes satelitales',unidad:'Escena',precio:350000},
      {ico:'🤖',label:'Geo IA',desc:'Análisis geoespacial multicapa con IA',unidad:'Análisis',precio:450000},
      {ico:'💬',label:'Consultoría',desc:'Asesoría técnica geomática',unidad:'Hora',precio:80000},
      {ico:'📊',label:'Control Topográfico',desc:'Control y verificación topográfica',unidad:'Punto',precio:25000},
    ]
  },
  {
    id:'logistica',
    label:'Terreno & Logística',
    ico:'🚗',
    color:'var(--amber)',
    items:[
      {ico:'🚗',label:'Movilización (km)',desc:'Movilización por kilómetro recorrido',unidad:'km',precio:500},
      {ico:'📅',label:'Movilización (día)',desc:'Movilización día completo en faena',unidad:'Día',precio:45000},
      {ico:'🏨',label:'Estadía',desc:'Estadía en terreno por noche',unidad:'Noche',precio:35000},
      {ico:'🍽',label:'Alimentación',desc:'Viáticos de alimentación',unidad:'Día',precio:15000},
      {ico:'⛽',label:'Combustible',desc:'Combustible y peajes',unidad:'Día',precio:20000},
      {ico:'🚙',label:'Vehículo 4x4',desc:'Arriendo vehículo 4x4',unidad:'Día',precio:80000},
      {ico:'🚁',label:'Drone',desc:'Uso de drone en terreno',unidad:'Día',precio:60000},
      {ico:'📡',label:'GPS',desc:'Uso de GPS diferencial/RTK',unidad:'Día',precio:50000},
      {ico:'📐',label:'Estación Total',desc:'Uso de estación total',unidad:'Día',precio:45000},
      {ico:'👷',label:'Ayudante Terreno',desc:'Ayudante de terreno',unidad:'Día',precio:40000},
      {ico:'🛡',label:'Seguro Equipos',desc:'Seguro de equipos en terreno',unidad:'Día',precio:12000},
      {ico:'📋',label:'Permisos Acceso',desc:'Trámites y permisos de acceso a faena',unidad:'Gestión',precio:30000},
    ]
  },
  {
    id:'entregables',
    label:'Entregables & Procesamiento',
    ico:'📦',
    color:'var(--purple)',
    items:[
      {ico:'🖼',label:'Ortofoto',desc:'Ortofoto georreferenciada',unidad:'km²',precio:150000},
      {ico:'☁',label:'Nube de Puntos',desc:'Nube de puntos LAS/LAZ',unidad:'km²',precio:120000},
      {ico:'⛰',label:'MDT',desc:'Modelo Digital de Terreno',unidad:'km²',precio:100000},
      {ico:'🏔',label:'MDS',desc:'Modelo Digital de Superficie',unidad:'km²',precio:100000},
      {ico:'🗄',label:'Geodatabase',desc:'Diseño y construcción de geodatabase',unidad:'Proyecto',precio:320000},
      {ico:'📍',label:'Shapefile',desc:'Capas vectoriales shapefile',unidad:'Capa',precio:80000},
      {ico:'📐',label:'Plano DWG',desc:'Plano topográfico en AutoCAD DWG',unidad:'Plano',precio:120000},
      {ico:'📊',label:'Informe Técnico',desc:'Informe técnico geoespacial',unidad:'Informe',precio:180000},
      {ico:'🧮',label:'Memoria de Cálculo',desc:'Memoria de cálculo topográfico',unidad:'Documento',precio:80000},
      {ico:'📈',label:'Presentación',desc:'Presentación ejecutiva de resultados',unidad:'Presentación',precio:120000},
      {ico:'💿',label:'Respaldo en Disco',desc:'Entrega en disco externo',unidad:'Unidad',precio:25000},
      {ico:'🔬',label:'Clasificación Imágenes',desc:'Clasificación supervisada de imágenes satelitales',unidad:'Escena',precio:280000},
    ]
  },
];
// Flat list for backwards compatibility
const SERVICIOS_PREDEFINIDOS=CAT_SERVICIOS.flatMap((cat,ci)=>cat.items.map(s=>({...s,tipo:cat.id,catIdx:ci})));
let catServAbierta={tecnicos:false,logistica:false,entregables:false};

let cotizaciones=[];
let nextCotId=1;
let editCotId=null;
let cotItems=[];

function nextCotNum(){
  var n=nextCotId;
  return'COT-'+String(n).padStart(3,'0');
}

function openModalCotizacion(id){
  editCotId=id||null;
  var modal=document.getElementById('modal-cotizacion');
  if(!modal)return;
  var hoy=new Date().toISOString().split('T')[0];
  if(id){
    var c=cotizaciones.find(x=>x.id===id);
    if(!c)return;
    document.getElementById('cot-modal-title').textContent='Editar Cotización';
    document.getElementById('cot-num-preview').textContent=c.numero;
    document.getElementById('cot-cli-nombre').value=c.cliNombre;
    document.getElementById('cot-cli-id').value=c.cliId||'';
    document.getElementById('cot-cli-rut').value=c.cliRut||'';
    document.getElementById('cot-proyecto').value=c.proyecto;
    document.getElementById('cot-fecha-emision').value=c.fechaEmision;
    document.getElementById('cot-vigencia').value=c.vigencia||30;
    document.getElementById('cot-condpago').value=c.condPago||'Contado';
    document.getElementById('cot-iva-tipo').value=c.ivaTipo||'afecto';
    document.getElementById('cot-descuento').value=c.descPct||0;
    document.getElementById('cot-notas').value=c.notas||'';
    cotItems=[...c.items.map(i=>({...i}))];
  } else {
    document.getElementById('cot-modal-title').textContent='Nueva Cotización';
    document.getElementById('cot-num-preview').textContent=nextCotNum();
    document.getElementById('cot-cli-nombre').value='';
    document.getElementById('cot-cli-id').value='';
    document.getElementById('cot-cli-rut').value='';
    document.getElementById('cot-proyecto').value='';
    document.getElementById('cot-fecha-emision').value=hoy;
    document.getElementById('cot-vigencia').value='30';
    document.getElementById('cot-condpago').value='Contado';
    document.getElementById('cot-iva-tipo').value='afecto';
    document.getElementById('cot-descuento').value='0';
    document.getElementById('cot-notas').value='';
    cotItems=[];
  }
  renderServiciosRapidos();
  renderItemsCotizacion();
  recalcCotizacion();
  clearValidation(['cot-cli-nombre','cot-proyecto']);
  // Poblar selector de plantillas
  var selP=document.getElementById('cot-plantilla-sel');
  var wrapP=document.getElementById('cot-plantilla-selector');
  if(selP&&wrapP){
    if(plantillasCotizacion.length>0){
      selP.innerHTML='<option value="">— Seleccionar plantilla —</option>'+plantillasCotizacion.map(p=>`<option value="${p.id}">${p.nombre}</option>`).join('');
      wrapP.style.display='flex';
    }else{
      wrapP.style.display='none';
    }
    selP.value='';
  }
  modal.classList.add('open');
  setTimeout(()=>document.getElementById('cot-cli-nombre').focus(),100);
}
function closeModalCotizacion(){
  var m=document.getElementById('modal-cotizacion');
  if(m)m.classList.remove('open');
}
function closeModalCotDetail(){
  var m=document.getElementById('modal-cot-detail');
  if(m)m.classList.remove('open');
}

// Autocomplete cliente en cotización
function acCotCliente(input){
  var q=(input.value||'').toLowerCase();
  var list=document.getElementById('ac-cot-list');
  if(!list)return;
  if(q.length<1){list.style.display='none';return;}
  var matches=clientes.filter(c=>c.nombre.toLowerCase().includes(q)||c.rut.toLowerCase().includes(q)).slice(0,6);
  if(!matches.length){list.style.display='none';return;}
  list.innerHTML=matches.map(c=>`<div class="autocomplete-item" onmousedown="selectCotCliente(${c.id})"><div class="ac-name">${c.nombre.split('(')[0].trim()}</div><div class="ac-rut">${c.rut}</div></div>`).join('');
  list.style.display='block';
}
function selectCotCliente(id){
  var c=clientes.find(x=>x.id===id);
  if(!c)return;
  document.getElementById('cot-cli-nombre').value=c.nombre.split('(')[0].trim();
  document.getElementById('cot-cli-id').value=c.id;
  document.getElementById('cot-cli-rut').value=c.rut;
  closeAcCot();
}
function closeAcCot(){
  var l=document.getElementById('ac-cot-list');
  if(l)l.style.display='none';
}

// Servicios rápidos — categorías colapsables
function renderServiciosRapidos(){
  var el=document.getElementById('serv-rapidos');
  if(!el)return;
  el.innerHTML=CAT_SERVICIOS.map(cat=>`
    <div style="margin-bottom:8px;border:1px solid var(--border);border-radius:9px;overflow:hidden">
      <div onclick="toggleCatServ('${cat.id}')" style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;cursor:pointer;background:var(--surface);transition:background .13s;user-select:none" onmouseover="this.style.background='var(--card2)'" onmouseout="this.style.background='var(--surface)'">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="font-size:16px">${cat.ico}</span>
          <span style="font-size:12px;font-weight:700;color:${cat.color}">${cat.label}</span>
          <span style="font-size:10px;font-family:var(--mono);color:var(--text3)">${cat.items.length} ítems</span>
        </div>
        <span id="cat-arrow-${cat.id}" style="font-size:11px;color:var(--text3);transition:transform .2s;display:inline-block;transform:${catServAbierta[cat.id]?'rotate(90deg)':'rotate(0deg)'}">›</span>
      </div>
      <div id="cat-grid-${cat.id}" style="display:${catServAbierta[cat.id]?'grid':'none'};grid-template-columns:repeat(auto-fill,minmax(105px,1fr));gap:7px;padding:10px">
        ${cat.items.map((s,i)=>{
          var globalIdx=SERVICIOS_PREDEFINIDOS.findIndex(x=>x.desc===s.desc&&x.tipo===cat.id);
          return`<div class="serv-btn" onclick="agregarServicioRapido(${globalIdx})" title="${s.desc}">
            <span class="serv-ico">${s.ico}</span>
            <span>${s.label}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`).join('');
}

function toggleCatServ(catId){
  catServAbierta[catId]=!catServAbierta[catId];
  var grid=document.getElementById('cat-grid-'+catId);
  var arrow=document.getElementById('cat-arrow-'+catId);
  if(grid)grid.style.display=catServAbierta[catId]?'grid':'none';
  if(arrow)arrow.style.transform=catServAbierta[catId]?'rotate(90deg)':'rotate(0deg)';
}

function agregarServicioRapido(idx){
  var s=SERVICIOS_PREDEFINIDOS[idx];
  if(!s)return;
  cotItems.push({id:Date.now()+Math.random(),desc:s.desc,unidad:s.unidad,cantidad:1,precioUnit:s.precio});
  renderItemsCotizacion();
  recalcCotizacion();
}

function agregarItemCotizacion(){
  cotItems.push({id:Date.now()+Math.random(),desc:'',unidad:'Proyecto',cantidad:1,precioUnit:0});
  renderItemsCotizacion();
  recalcCotizacion();
}

// Cargar items desde una plantilla guardada
function cargarPlantillaEnCotizacion(){
  var sel=document.getElementById('cot-plantilla-sel');
  if(!sel||!sel.value){toast('Selecciona una plantilla primero','warn');return;}
  var p=plantillasCotizacion.find(x=>x.id===parseInt(sel.value));
  if(!p){toast('Plantilla no encontrada','warn');return;}
  // Mapear unidades de plantilla → cotización (la cotización usa vocabulario distinto)
  var mapU={UN:'Proyecto',HR:'Hora','DÍA':'Día',HA:'Ha',KM:'km','M²':'km²',GL:'Proyecto'};
  (p.items||[]).forEach(it=>{
    cotItems.push({
      id:Date.now()+Math.random(),
      desc:it.descripcion||'',
      unidad:mapU[it.unidad]||it.unidad||'Proyecto',
      cantidad:it.cantidad||1,
      precioUnit:it.precio||0
    });
  });
  // Rellenar campos de cotización con los de la plantilla si están vacíos
  var campoVigencia=document.getElementById('cot-vigencia');
  if(campoVigencia&&(!campoVigencia.value||campoVigencia.value==='30')&&p.validez)campoVigencia.value=p.validez;
  var campoNotas=document.getElementById('cot-notas');
  if(campoNotas&&!campoNotas.value.trim()){
    var partes=[];
    if(p.plazo)partes.push('Plazo de entrega: '+p.plazo);
    if(p.formaPago)partes.push('Forma de pago: '+p.formaPago);
    if(p.notas)partes.push(p.notas);
    if(partes.length)campoNotas.value=partes.join('\n\n');
  }
  renderItemsCotizacion();
  recalcCotizacion();
  sel.value='';
  toast(`✓ Plantilla "${p.nombre}" cargada (${(p.items||[]).length} ítems)`,'ok');
}

function eliminarItemCot(id){
  cotItems=cotItems.filter(x=>x.id!==id);
  renderItemsCotizacion();
  recalcCotizacion();
}

function moverItemCot(id,dir){
  var idx=cotItems.findIndex(x=>x.id===id);
  if(idx<0)return;
  var nuevoIdx=idx+dir;
  if(nuevoIdx<0||nuevoIdx>=cotItems.length)return;
  // Intercambiar posición
  var tmp=cotItems[idx];
  cotItems[idx]=cotItems[nuevoIdx];
  cotItems[nuevoIdx]=tmp;
  renderItemsCotizacion();
}

function updateItemCot(id,campo,val){
  var item=cotItems.find(x=>x.id===id);
  if(!item)return;
  item[campo]=campo==='desc'||campo==='unidad'?val:(parseFloat(val)||0);
  recalcCotizacion();
}

function renderItemsCotizacion(){
  var el=document.getElementById('cot-items');
  if(!el)return;
  if(!cotItems.length){
    el.innerHTML=`<div style="text-align:center;padding:20px;font-size:12px;font-family:var(--mono);color:var(--text3)">Usa los botones de arriba para agregar servicios rápidamente,<br>o haz clic en "+ Agregar ítem" para un ítem personalizado.</div>`;
    return;
  }
  el.innerHTML=cotItems.map((item,idx)=>{
    var esPrimero=idx===0;
    var esUltimo=idx===cotItems.length-1;
    var btnArrowStyle='background:var(--surface);color:var(--text2);border:1px solid var(--border);border-radius:6px;width:24px;height:28px;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--mono)';
    var btnArrowDisabledStyle='background:transparent;color:var(--text3);border:1px solid var(--border);border-radius:6px;width:24px;height:28px;cursor:not-allowed;font-size:11px;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-family:var(--mono);opacity:.35';
    return `
    <div class="item-row">
      <input type="text" value="${item.desc||''}" placeholder="Descripción del servicio" oninput="updateItemCot(${item.id},'desc',this.value)">
      <select onchange="updateItemCot(${item.id},'unidad',this.value)">
        ${['Ha','km²','Punto','Capa','Escena','Informe','Proyecto','Hora','Día','Vuelo','km'].map(u=>`<option ${item.unidad===u?'selected':''}>${u}</option>`).join('')}
      </select>
      <input type="number" value="${item.cantidad||1}" min="0.1" step="0.1" oninput="updateItemCot(${item.id},'cantidad',this.value)" style="text-align:center">
      <input type="number" value="${item.precioUnit||0}" min="0" step="1000" oninput="updateItemCot(${item.id},'precioUnit',this.value)">
      <button onclick="moverItemCot(${item.id},-1)" ${esPrimero?'disabled':''} title="Mover arriba" style="${esPrimero?btnArrowDisabledStyle:btnArrowStyle}">▲</button>
      <button onclick="moverItemCot(${item.id},1)" ${esUltimo?'disabled':''} title="Mover abajo" style="${esUltimo?btnArrowDisabledStyle:btnArrowStyle}">▼</button>
      <button onclick="eliminarItemCot(${item.id})" title="Eliminar" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,.2);border-radius:6px;width:28px;height:28px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0">✕</button>
    </div>
    <div style="font-size:10px;font-family:var(--mono);color:var(--text3);text-align:right;padding-right:120px;margin-bottom:2px;margin-top:-4px">${item.cantidad} × ${fmt(item.precioUnit)} = <span style="color:var(--gold)">${fmt(item.cantidad*item.precioUnit)}</span></div>
  `;}).join('');
}

function recalcCotizacion(){
  var ivaTipo=document.getElementById('cot-iva-tipo')?.value||'afecto';
  var descPct=parseFloat(document.getElementById('cot-descuento')?.value)||0;
  var subtotal=cotItems.reduce((s,i)=>s+i.cantidad*i.precioUnit,0);
  var descMonto=descPct>0?Math.round(subtotal*descPct/100):0;
  var subtotalConDesc=subtotal-descMonto;
  var iva=ivaTipo==='afecto'?Math.round(subtotalConDesc*0.19):0;
  var total=subtotalConDesc+iva;
  var el=document.getElementById('cot-totales-preview');
  if(!el)return;
  el.innerHTML=`
    <div class="cot-tot-row"><span class="cot-tot-lbl">Subtotal neto</span><span class="cot-tot-val">${fmt(subtotal)}</span></div>
    ${descMonto>0?`<div class="cot-tot-row"><span class="cot-tot-lbl" style="color:var(--green)">Descuento (${descPct}%)</span><span class="cot-tot-val" style="color:var(--green)">− ${fmt(descMonto)}</span></div>`:''}
    ${descMonto>0?`<div class="cot-tot-row"><span class="cot-tot-lbl">Subtotal c/descuento</span><span class="cot-tot-val">${fmt(subtotalConDesc)}</span></div>`:''}
    ${iva>0?`<div class="cot-tot-row"><span class="cot-tot-lbl">IVA (19%)</span><span class="cot-tot-val" style="color:var(--blue)">${fmt(iva)}</span></div>`:'<div class="cot-tot-row"><span class="cot-tot-lbl">IVA</span><span class="cot-tot-val" style="color:var(--text3)">Exento</span></div>'}
    <div class="cot-tot-row cot-tot-final"><span class="cot-tot-lbl">TOTAL</span><span class="cot-tot-val">${fmt(total)}</span></div>
    <div style="margin-top:10px;font-size:10px;font-family:var(--mono);color:var(--text3);line-height:1.7">
      ${cotItems.length} ítem${cotItems.length!==1?'s':''} · ${document.getElementById('cot-condpago')?.value||''}
    </div>`;
}

function guardarCotizacion(estado){
  var valid=validateForm([{id:'cot-cli-nombre'},{id:'cot-proyecto'}]);
  if(!valid)return;
  if(!cotItems.length){toast('Agrega al menos un servicio a la cotización','err');return;}
  var subtotal=cotItems.reduce((s,i)=>s+i.cantidad*i.precioUnit,0);
  var ivaTipo=document.getElementById('cot-iva-tipo').value;
  var descPct=parseFloat(document.getElementById('cot-descuento')?.value)||0;
  var descMonto=descPct>0?Math.round(subtotal*descPct/100):0;
  var subtotalConDesc=subtotal-descMonto;
  var iva=ivaTipo==='afecto'?Math.round(subtotalConDesc*0.19):0;
  var vigDias=parseInt(document.getElementById('cot-vigencia').value)||30;
  var fechaEmision=document.getElementById('cot-fecha-emision').value;
  var fechaVencimiento=new Date(fechaEmision);
  fechaVencimiento.setDate(fechaVencimiento.getDate()+vigDias);
  var cot={
    id:editCotId||nextCotId,
    numero:editCotId?cotizaciones.find(x=>x.id===editCotId)?.numero:nextCotNum(),
    cliNombre:document.getElementById('cot-cli-nombre').value.trim(),
    cliId:parseInt(document.getElementById('cot-cli-id').value)||null,
    cliRut:document.getElementById('cot-cli-rut').value.trim(),
    proyecto:document.getElementById('cot-proyecto').value.trim(),
    fechaEmision,
    vigencia:vigDias,
    fechaVencimiento:fechaVencimiento.toISOString().split('T')[0],
    condPago:document.getElementById('cot-condpago').value,
    ivaTipo,
    notas:document.getElementById('cot-notas').value.trim(),
    items:cotItems.map(i=>({...i})),
    subtotal,descPct,descMonto,subtotalConDesc,iva,total:subtotalConDesc+iva,
    estado,
    creadoEn:new Date().toISOString(),
  };
  if(editCotId){
    var idx=cotizaciones.findIndex(x=>x.id===editCotId);
    if(idx>=0)cotizaciones[idx]=cot;
  } else {
    cotizaciones.push(cot);
    nextCotId++;
    // Crear proyecto automáticamente si tiene cliente o nombre
    crearProyectoDesdeCotizacion(cot);
  }
  closeModalCotizacion();
  renderCotizaciones();
  saveAllData();
  toast(editCotId?'Cotización actualizada':'Cotización '+cot.numero+' creada','ok',4000);
  // Update nav badge
  actualizarBadgeCotizaciones();
}

function crearProyectoDesdeCotizacion(cot){
  // Map servicio tipo from items
  var tipoMap={topografia:'topografia',fotogrametria:'fotogrametria',gis:'gis',teledeteccion:'teledeteccion',geoIA:'gis',consultoria:'consultoria'};
  var tipoServ='otro';
  var serv=SERVICIOS_PREDEFINIDOS.find(s=>cot.items.some(i=>i.desc.includes(s.desc.split(' ')[0])));
  if(serv)tipoServ=serv.tipo;
  var proy={
    id:nextProyId++,
    nombre:cot.proyecto,
    cliId:cot.cliId,
    tipoServ,
    estado:'cotizacion',
    presupuesto:cot.total,
    facturado:0,
    inicio:cot.fechaEmision,
    fin:'',
    desc:'Creado automáticamente desde cotización '+cot.numero,
    cotId:cot.id,
  };
  proyectos.push(proy);
  toast('Proyecto "'+cot.proyecto+'" creado en estado Cotización','info',4000);
}

function cambiarEstadoCotizacion(id,nuevoEstado){
  var cot=cotizaciones.find(x=>x.id===id);
  if(!cot)return;
  var estadoAnterior=cot.estado;
  cot.estado=nuevoEstado;
  // Si se acepta, actualizar proyecto asociado
  if(nuevoEstado==='aceptada'){
    var proy=proyectos.find(p=>p.cotId===id);
    if(proy){proy.estado='activo';proy.inicio=new Date().toISOString().split('T')[0];}
    toast('¡Cotización aceptada! Proyecto actualizado a "En curso"','ok',5000);
  } else if(nuevoEstado==='rechazada'){
    var proy=proyectos.find(p=>p.cotId===id);
    if(proy)proy.estado='pausado';
    toast('Cotización marcada como rechazada','warn');
  }
  closeModalCotDetail();
  renderCotizaciones();
  saveAllData();
  actualizarBadgeCotizaciones();
}

function actualizarBadgeCotizaciones(){
  var pendientes=cotizaciones.filter(c=>c.estado==='enviada').length;
  var badge=document.getElementById('badge-cot');
  if(badge){badge.textContent=pendientes||'';badge.style.display=pendientes?'':'none';}
}

async function eliminarCotizacion(id){
  var c=cotizaciones.find(x=>x.id===id);
  if(!c)return;
  var ok=await confirmDialog('¿Eliminar cotización?','El proyecto asociado no se eliminará.',c.numero+' · '+c.proyecto);
  if(!ok)return;
  cotizaciones=cotizaciones.filter(x=>x.id!==id);
  renderCotizaciones();
  saveAllData();
  actualizarBadgeCotizaciones();
  toast('Cotización eliminada','warn');
}

function verCotizacion(id){
  var c=cotizaciones.find(x=>x.id===id);
  if(!c)return;
  var hoy=new Date();
  var vencida=new Date(c.fechaVencimiento)<hoy&&c.estado!=='aceptada'&&c.estado!=='rechazada';
  if(vencida&&c.estado==='enviada')c.estado='vencida';
  var estadoColor={borrador:'var(--text3)',enviada:'var(--blue)',aceptada:'var(--green)',rechazada:'var(--red)',vencida:'var(--amber)'};
  var ec=estadoColor[c.estado]||'var(--text2)';
  document.getElementById('cotd-titulo').textContent=c.proyecto;
  document.getElementById('cotd-sub').textContent=c.numero+' · '+c.cliNombre+' · '+c.fechaEmision;
  document.getElementById('cotd-body').innerHTML=`
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="cot-totales">
        <div class="cot-tot-row"><span class="cot-tot-lbl">Estado</span><span class="cot-tot-val" style="color:${ec}">${c.estado.toUpperCase()}</span></div>
        <div class="cot-tot-row"><span class="cot-tot-lbl">Cliente</span><span class="cot-tot-val">${c.cliNombre}</span></div>
        <div class="cot-tot-row"><span class="cot-tot-lbl">RUT</span><span class="cot-tot-val">${c.cliRut||'—'}</span></div>
        <div class="cot-tot-row"><span class="cot-tot-lbl">Emisión</span><span class="cot-tot-val">${c.fechaEmision}</span></div>
        <div class="cot-tot-row"><span class="cot-tot-lbl">Vencimiento</span><span class="cot-tot-val" style="color:${vencida?'var(--red)':'var(--text2)'}">${c.fechaVencimiento}</span></div>
        <div class="cot-tot-row"><span class="cot-tot-lbl">Pago</span><span class="cot-tot-val">${c.condPago}</span></div>
      </div>
      <div class="cot-totales">
        <div class="cot-tot-row"><span class="cot-tot-lbl">Subtotal</span><span class="cot-tot-val">${fmt(c.subtotal)}</span></div>
        ${c.descMonto>0?`<div class="cot-tot-row"><span class="cot-tot-lbl" style="color:var(--green)">Descuento (${c.descPct}%)</span><span class="cot-tot-val" style="color:var(--green)">− ${fmt(c.descMonto)}</span></div>`:''}
        <div class="cot-tot-row"><span class="cot-tot-lbl">IVA</span><span class="cot-tot-val" style="color:var(--blue)">${c.ivaTipo==='afecto'?fmt(c.iva):'Exento'}</span></div>
        <div class="cot-tot-row cot-tot-final"><span class="cot-tot-lbl">TOTAL</span><span class="cot-tot-val">${fmt(c.total)}</span></div>
      </div>
    </div>
    <div style="margin-bottom:14px">
      <div style="font-size:10px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Ítems cotizados</div>
      ${c.items.map(i=>`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--surface);border-radius:7px;border:1px solid var(--border);margin-bottom:5px">
          <div>
            <div style="font-size:12px;font-weight:600">${i.desc}</div>
            <div style="font-size:10px;font-family:var(--mono);color:var(--text3)">${i.cantidad} ${i.unidad} × ${fmt(i.precioUnit)}</div>
          </div>
          <div style="font-size:13px;font-weight:700;font-family:var(--mono);color:var(--gold)">${fmt(i.cantidad*i.precioUnit)}</div>
        </div>`).join('')}
    </div>
    ${c.notas?`<div style="background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px;font-size:12px;color:var(--text2);line-height:1.6;white-space:pre-wrap">${c.notas}</div>`:''}`;
  var footer=document.getElementById('cotd-footer');
  var acciones=[];
  if(c.estado==='borrador')acciones.push(`<button class="btn btn-ghost btn-sm" onclick="cambiarEstadoCotizacion(${c.id},'enviada')">Marcar enviada →</button>`);
  if(c.estado==='enviada'||c.estado==='borrador'){
    acciones.push(`<button class="btn btn-sm" style="background:var(--green-dim);color:var(--green);border:1px solid rgba(74,222,128,.3)" onclick="cambiarEstadoCotizacion(${c.id},'aceptada')">✓ Aceptada</button>`);
    acciones.push(`<button class="btn btn-sm" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,.3)" onclick="cambiarEstadoCotizacion(${c.id},'rechazada')">✕ Rechazada</button>`);
  }
  if(c.estado==='aceptada'){
    acciones.push(`<button class="btn btn-gold btn-sm" onclick="closeModalCotDetail();registrarIngresoCotizacion(${c.id})">↑ Registrar como ingreso</button>`);
  }
  acciones.push(`<button class="btn btn-ghost btn-sm" onclick="closeModalCotDetail();openModalCotizacion(${c.id})">✎ Editar</button>`);
  acciones.push(`<button class="btn btn-gold btn-sm" onclick="generarPDFCotizacion(${c.id})">↓ PDF</button>`);
  footer.innerHTML=`<button class="btn btn-ghost" onclick="closeModalCotDetail()">Cerrar</button><div style="display:flex;gap:6px;flex-wrap:wrap">${acciones.join('')}</div>`;
  document.getElementById('modal-cot-detail').classList.add('open');
}

function registrarIngresoCotizacion(cotId){
  var c=cotizaciones.find(x=>x.id===cotId);
  if(!c)return;
  var d=getMes();
  var cat=CAT_ING[0]; // Levantamiento por defecto, usuario puede editar
  var mov={id:nextId++,tipo:'ing',desc:c.proyecto+' ('+c.numero+')',cat,monto:c.subtotal,fecha:new Date().toISOString().split('T')[0],iva:c.ivaTipo,rut:c.cliRut||'',doc:c.numero,proyId:proyectos.find(p=>p.cotId===cotId)?.id||null};
  d.movs.push(mov);
  c.estado='aceptada';
  var proy=proyectos.find(p=>p.cotId===cotId);
  if(proy){proy.facturado=c.total;proy.estado='activo';}
  renderAll();
  saveAllData();
  toast('Ingreso registrado en el Libro · '+fmt(c.subtotal),'ok',5000);
  actualizarBadgeCotizaciones();
}

function renderCotizaciones(){
  var hoy=new Date();
  // Auto-vencer enviadas con fecha pasada
  cotizaciones.forEach(c=>{
    if(c.estado==='enviada'&&new Date(c.fechaVencimiento)<hoy)c.estado='vencida';
  });
  actualizarBadgeCotizaciones();
  var search=(document.getElementById('cot-search')?.value||'').toLowerCase();
  var filtroEstado=document.getElementById('cot-filtro-estado')?.value||'';
  var filtradas=cotizaciones.filter(c=>{
    if(filtroEstado&&c.estado!==filtroEstado)return false;
    if(search&&!c.proyecto.toLowerCase().includes(search)&&!c.cliNombre.toLowerCase().includes(search)&&!c.numero.toLowerCase().includes(search))return false;
    return true;
  }).sort((a,b)=>b.id-a.id);
  // KPIs
  var totalEnviadas=cotizaciones.filter(c=>c.estado==='enviada').length;
  var totalAceptadas=cotizaciones.filter(c=>c.estado==='aceptada').length;
  var montoEnviado=cotizaciones.filter(c=>c.estado==='enviada').reduce((s,c)=>s+c.total,0);
  var montoAceptado=cotizaciones.filter(c=>c.estado==='aceptada').reduce((s,c)=>s+c.total,0);
  var tasaExito=cotizaciones.filter(c=>c.estado==='aceptada'||c.estado==='rechazada').length>0?
    Math.round(cotizaciones.filter(c=>c.estado==='aceptada').length/cotizaciones.filter(c=>c.estado==='aceptada'||c.estado==='rechazada').length*100):0;
  document.getElementById('cot-kpis').innerHTML=`
    <div class="kpi" style="--kc:var(--blue)"><div class="kpi-top"><div class="kpi-lbl">Enviadas</div><div class="kpi-ico">📤</div></div><div class="kpi-val" style="color:var(--blue)">${totalEnviadas}</div><div class="kpi-foot"><span class="muted">${fmt(montoEnviado)} en juego</span></div></div>
    <div class="kpi" style="--kc:var(--green)"><div class="kpi-top"><div class="kpi-lbl">Aceptadas</div><div class="kpi-ico">✓</div></div><div class="kpi-val" style="color:var(--green)">${totalAceptadas}</div><div class="kpi-foot"><span class="muted">${fmt(montoAceptado)} ganado</span></div></div>
    <div class="kpi" style="--kc:var(--gold)"><div class="kpi-top"><div class="kpi-lbl">Tasa de éxito</div><div class="kpi-ico">★</div></div><div class="kpi-val" style="color:var(--gold)">${tasaExito}%</div><div class="kpi-foot"><span class="muted">Cotizaciones cerradas</span></div></div>
    <div class="kpi" style="--kc:var(--teal)"><div class="kpi-top"><div class="kpi-lbl">Total creadas</div><div class="kpi-ico">◈</div></div><div class="kpi-val" style="color:var(--teal)">${cotizaciones.length}</div><div class="kpi-foot"><span class="muted">${cotizaciones.filter(c=>c.estado==='borrador').length} borradores</span></div></div>`;
  var estadoIcon={borrador:'◎',enviada:'📤',aceptada:'✓',rechazada:'✕',vencida:'⚑'};
  var estadoColor={borrador:'var(--text3)',enviada:'var(--blue)',aceptada:'var(--green)',rechazada:'var(--red)',vencida:'var(--amber)'};
  var estadoBadge={borrador:'bb',enviada:'bt',aceptada:'bg',rechazada:'br',vencida:'ba'};
  document.getElementById('cot-grid').innerHTML=filtradas.length?filtradas.map(c=>`
    <div class="cot-card estado-${c.estado}" onclick="verCotizacion(${c.id})">
      <div class="cot-num">${c.numero} · ${c.fechaEmision}</div>
      <div class="cot-nombre">${c.proyecto}</div>
      <div class="cot-cliente">📍 ${c.cliNombre||'Sin cliente'}</div>
      <div class="cot-grid">
        <div class="cot-stat"><div class="cot-stat-lbl">Total</div><div class="cot-stat-val" style="color:var(--gold)">${fmtK(c.total)}</div></div>
        <div class="cot-stat"><div class="cot-stat-lbl">Ítems</div><div class="cot-stat-val" style="color:var(--blue)">${c.items.length}</div></div>
        <div class="cot-stat"><div class="cot-stat-lbl">Estado</div><div class="cot-stat-val" style="color:${estadoColor[c.estado]};font-size:10px">${c.estado.toUpperCase()}</div></div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:10px;font-family:var(--mono);color:${c.estado==='vencida'?'var(--red)':'var(--text3)'}">Vence: ${c.fechaVencimiento}</span>
        <div style="display:flex;gap:5px">
          <button class="btn btn-ghost btn-sm" style="font-size:10px" onclick="event.stopPropagation();generarPDFCotizacion(${c.id})">↓ PDF</button>
          <button class="btn btn-sm" style="background:var(--red-dim);color:var(--red);border:1px solid rgba(240,82,82,.2);font-size:10px" onclick="event.stopPropagation();eliminarCotizacion(${c.id})">✕</button>
        </div>
      </div>
    </div>`).join('')
    :`<div style="grid-column:1/-1;text-align:center;padding:48px;font-size:12px;font-family:var(--mono);color:var(--text3)">Sin cotizaciones aún.<br>Haz clic en "+ Nueva Cotización" para crear tu primera propuesta.</div>`;
}
