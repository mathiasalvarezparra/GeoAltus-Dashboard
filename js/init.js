
//  INIT 
document.addEventListener('DOMContentLoaded',()=>{
  // Load persisted data first
  var loaded=loadAllData();
  initTheme();
  var hoy=new Date();
  currentMonth=hoy.getMonth();
  currentYear=hoy.getFullYear();
  // Si no hay datos para el mes actual, usar el ltimo mes con datos
  if(!dataMeses[getMesKey()]){
    var keys=Object.keys(dataMeses).sort();
    var last=keys[keys.length-1];
    if(last){const parts=last.split('-');currentYear=parseInt(parts[0]);currentMonth=parseInt(parts[1]);}
  }
  poblarFiltrosCat();
  loadViabParams();
  renderAll();
  // Init remuneracin
  var tInit=trabajadores[0];
  if(tInit){
    document.getElementById('liq-bruto').value=tInit.sueldo;
    tramosActuales=[];
    renderTramosPeriodos();
    calcLiquidacion();
    renderTramos();
  }
  if(loaded) toast('Datos cargados desde el navegador','info',2500);
  actualizarBadgeCotizaciones();
  // Keyboard shortcut hint in footer
  var foot=document.getElementById('foot-label');
  if(foot) foot.textContent='GeoAltus · N=Registrar';
});
// Warn on unload if somehow data not saved (belt-and-suspenders)
window.addEventListener('beforeunload',()=>{ saveAllData(); });
// Click-outside to close modals
['modal-reg','modal-edit','modal-pdf','modal-trab','modal-cliente','modal-proyecto','modal-confirm','modal-cotizacion','modal-cot-detail','modal-pdf-anual','modal-contrato','modal-plantilla'].forEach(id=>{
  var el=document.getElementById(id);
  if(el) el.addEventListener('click',e=>{if(e.target===e.currentTarget){closeModal();closeEdit();closePdf();closeModalTrab();closeModalCliente();closeModalProyecto();resolveConfirm(false);if(typeof closePdfAnual==='function')closePdfAnual();if(typeof closeModalContrato==='function')closeModalContrato();if(typeof closePlantillaModal==='function')closePlantillaModal();}});
});
