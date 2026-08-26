
//  MODAL REGISTRO 
function openModal(){
  document.getElementById('modal-reg').classList.add('open');
  document.getElementById('r-fecha').value=new Date().toISOString().split('T')[0];
  document.getElementById('r-desc').value='';document.getElementById('r-monto').value='';
  document.getElementById('r-rut').value='';document.getElementById('r-doc').value='';
  document.getElementById('hon-boleta').value='';document.getElementById('hon-neto').value='';
  clearValidation(['r-desc','r-monto','r-fecha','r-cat']);
  poblarProyectoSelector();
  setTipo('ing');
  setTimeout(()=>document.getElementById('r-desc').focus(),100);
}
function closeModal(){document.getElementById('modal-reg').classList.remove('open');}

function setTipo(t){
  tipoActual=t;
  document.getElementById('tab-ing').className='tipo-tab'+(t==='ing'?' t-ing':'');
  document.getElementById('tab-egr').className='tipo-tab'+(t==='egr'?' t-egr':'');
  var cat=document.getElementById('r-cat');
  cat.innerHTML='<option value="">-- Seleccionar --</option>';
  (t==='ing'?CAT_ING:CAT_EGR).forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=catShort(c);cat.appendChild(o);});
  // En ingresos: solo afecto/exento. En egresos: afecto/exento/honorarios
  var ivaSelect=document.getElementById('r-iva');
  ivaSelect.innerHTML=t==='ing'
    ?'<option value="afecto">Afecto IVA (19%)</option><option value="exento">Exento de IVA</option>'
    :'<option value="afecto">Afecto IVA (19%)</option><option value="exento">Exento de IVA</option><option value="honorarios">Honorarios Externos</option>';
  document.getElementById('hon-calc-box').style.display='none';
  updateIvaPreview();
}

function onCatChange(){
  var cat=document.getElementById('r-cat').value;
  var isHon=cat==='Honorarios Externos';
  if(isHon){document.getElementById('r-iva').value='honorarios';}
  document.getElementById('hon-calc-box').style.display=isHon?'block':'none';
  updateIvaPreview();
}

function calcHonBoleta(){
  var b=parseFloat(document.getElementById('hon-boleta').value)||0;
  document.getElementById('hon-neto').value='';
  if(!b){document.getElementById('hc-boleta').textContent='—';document.getElementById('hc-ret').textContent='—';document.getElementById('hc-pago').textContent='—';document.getElementById('r-monto').value='';return;}
  var ret=Math.round(b*0.1525),pago=b-ret;
  document.getElementById('hc-boleta').textContent=fmt(b);
  document.getElementById('hc-ret').textContent='−'+fmt(ret);
  document.getElementById('hc-pago').textContent=fmt(pago);
  document.getElementById('r-monto').value=b;
  updateIvaPreview();
}

function calcHonNeto(){
  var n=parseFloat(document.getElementById('hon-neto').value)||0;
  document.getElementById('hon-boleta').value='';
  if(!n){document.getElementById('hc-boleta').textContent='—';document.getElementById('hc-ret').textContent='—';document.getElementById('hc-pago').textContent='—';document.getElementById('r-monto').value='';return;}
  var b=Math.round(n/0.8475),ret=b-n;
  document.getElementById('hc-boleta').textContent=fmt(b);
  document.getElementById('hc-ret').textContent='−'+fmt(ret);
  document.getElementById('hc-pago').textContent=fmt(n);
  document.getElementById('hon-boleta').value=b;
  document.getElementById('r-monto').value=b;
  updateIvaPreview();
}

function updateIvaPreview(){
  var monto=parseFloat(document.getElementById('r-monto').value)||0;
  var iva=document.getElementById('r-iva').value;
  var prev=document.getElementById('iva-preview');
  if(!monto){prev.textContent='Ingresa monto para calcular';return;}
  if(iva==='afecto'){const v=Math.round(monto*0.19);prev.textContent=`IVA: ${fmt(v)} → Total con IVA: ${fmt(monto+v)}`;}
  else if(iva==='exento'){prev.textContent=`Exento — sin IVA. Total: ${fmt(monto)}`;}
  else{const r=Math.round(monto*0.1525);prev.textContent=`Retención 15.25%: ${fmt(r)} → Pago neto: ${fmt(monto-r)}`;}
}

function guardarRegistro(){
  var desc=document.getElementById('r-desc').value.trim();
  var monto=parseFloat(document.getElementById('r-monto').value);
  var cat=document.getElementById('r-cat').value;
  var fecha=document.getElementById('r-fecha').value;
  var iva=document.getElementById('r-iva').value;
  var rut=document.getElementById('r-rut').value.trim();
  var doc=document.getElementById('r-doc').value.trim();
  var proyId=document.getElementById('r-proyecto')?.value||'';
  var valid=validateForm([
    {id:'r-desc'},{id:'r-monto'},{id:'r-fecha'}
  ]);
  if(!cat){var catEl=document.getElementById('r-cat');catEl.classList.add('error');valid=false;}
  if(!valid)return;
  var d=getMes();
  d.movs.push({id:nextId++,tipo:tipoActual,desc,cat,monto,fecha,iva,rut,doc,proyId:proyId||null});
  closeModal();renderAll();saveAllData();toast('Movimiento guardado','ok');
}

//  EDICIN 
function abrirEdicion(id){
  var d=getMes();const m=d.movs.find(x=>x.id===id);if(!m)return;
  editIdx=id;
  document.getElementById('e-desc').value=m.desc;document.getElementById('e-monto').value=m.monto;
  document.getElementById('e-fecha').value=m.fecha;document.getElementById('e-rut').value=m.rut||'';
  document.getElementById('e-doc').value=m.doc||'';document.getElementById('e-iva').value=m.iva;
  var ecat=document.getElementById('e-cat');
  var cats=m.tipo==='ing'?CAT_ING:CAT_EGR;
  ecat.innerHTML='';cats.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=catShort(c);if(c===m.cat)o.selected=true;ecat.appendChild(o);});
  updateEditIva();document.getElementById('modal-edit').classList.add('open');
}
function closeEdit(){document.getElementById('modal-edit').classList.remove('open');editIdx=null;}
function updateEditIva(){
  var monto=parseFloat(document.getElementById('e-monto').value)||0;
  var iva=document.getElementById('e-iva').value;
  var prev=document.getElementById('edit-iva-preview');
  if(!monto){prev.textContent='—';return;}
  if(iva==='afecto'){const v=Math.round(monto*0.19);prev.textContent=`IVA: ${fmt(v)} → Total: ${fmt(monto+v)}`;}
  else if(iva==='exento'){prev.textContent=`Exento. Total: ${fmt(monto)}`;}
  else{const r=Math.round(monto*0.1525);prev.textContent=`Retención: ${fmt(r)} → Pago: ${fmt(monto-r)}`;}
}
function guardarEdicion(){
  var d=getMes();const idx=d.movs.findIndex(x=>x.id===editIdx);if(idx<0)return;
  var old=d.movs[idx];
  var nm=parseFloat(document.getElementById('e-monto').value)||old.monto;
  d.movs[idx]={...old,desc:document.getElementById('e-desc').value.trim()||old.desc,monto:nm,fecha:document.getElementById('e-fecha').value||old.fecha,cat:document.getElementById('e-cat').value||old.cat,iva:document.getElementById('e-iva').value,rut:document.getElementById('e-rut').value.trim(),doc:document.getElementById('e-doc').value.trim()};
  closeEdit();renderAll();saveAllData();toast('Cambios guardados','ok');
}
async function eliminarRegistro(id){
  var d=getMes();const m=d.movs.find(x=>x.id===id);if(!m)return;
  var ok=await confirmDialog('¿Eliminar registro?','Esta acción no se puede deshacer.',`${m.desc} · ${fmt(m.monto)}`);
  if(!ok)return;
  d.movs=d.movs.filter(x=>x.id!==id);renderAll();saveAllData();toast('Registro eliminado','warn');
}
