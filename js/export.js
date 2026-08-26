
// ══════════════════════════════════════════
//  EXPORTACIÓN
// ══════════════════════════════════════════
function renderExport(){
  // Preview
  var periodo=document.getElementById('exp-periodo')?.value||'mes';
  var allMovs=[];
  if(periodo==='mes'){var d=getMes();allMovs=d.movs;}
  else if(periodo==='año'){Object.entries(dataMeses).filter(([k])=>k.startsWith(currentYear+'-')).forEach(([,d])=>allMovs.push(...d.movs));}
  else{Object.values(dataMeses).forEach(d=>allMovs.push(...d.movs));}
  var ings=allMovs.filter(m=>m.tipo==='ing');
  var egrs=allMovs.filter(m=>m.tipo==='egr');
  document.getElementById('export-preview').innerHTML=[
    {l:'Período seleccionado',v:periodo==='mes'?MESES[currentMonth]+' '+currentYear:periodo==='año'?'Año '+currentYear:'Todo el historial',c:'var(--teal)'},
    {l:'Total registros',v:allMovs.length+' movimientos',c:'var(--text2)'},
    {l:'Ingresos',v:fmt(ings.reduce((s,m)=>s+m.monto,0))+' ('+ings.length+' registros)',c:'var(--green)'},
    {l:'Egresos',v:fmt(egrs.reduce((s,m)=>s+m.monto,0))+' ('+egrs.length+' registros)',c:'var(--red)'},
    {l:'Clientes registrados',v:clientes.length,c:'var(--blue)'},
    {l:'Proyectos registrados',v:proyectos.length,c:'var(--purple)'},
  ].map(r=>`<div style="display:flex;justify-content:space-between;padding:9px 13px;background:var(--surface);border-radius:8px;border:1px solid var(--border)">
    <span style="font-size:12px;color:var(--text2)">${r.l}</span>
    <span style="font-size:12px;font-weight:700;font-family:var(--mono);color:${r.c}">${r.v}</span>
  </div>`).join('');
  // Auto-save to localStorage when visiting export
  saveAllData();markSaved();
}
function exportarCSV(){
  var periodo=document.getElementById('exp-periodo')?.value||'mes';
  var allMovs=[];
  if(periodo==='mes'){var d=getMes();allMovs=d.movs.map(m=>({...m,periodo:MESES[currentMonth]+' '+currentYear}));}
  else if(periodo==='año'){Object.entries(dataMeses).filter(([k])=>k.startsWith(currentYear+'-')).forEach(([k,d])=>{var p=MESES[parseInt(k.split('-')[1])]+' '+currentYear;allMovs.push(...d.movs.map(m=>({...m,periodo:p})));});}
  else{Object.entries(dataMeses).sort(([a],[b])=>a.localeCompare(b)).forEach(([k,d])=>{var parts=k.split('-');var p=MESES[parseInt(parts[1])]+' '+parts[0];allMovs.push(...d.movs.map(m=>({...m,periodo:p})));});}
  var header='Período,Tipo,Descripción,Categoría,Fecha,RUT,N° Documento,Tipo IVA,Monto Neto,IVA';
  var rows=allMovs.map(m=>{
    var iv=m.iva==='afecto'?Math.round(m.monto*0.19):m.iva==='honorarios'?Math.round(m.monto*0.1525):0;
    return[m.periodo,m.tipo==='ing'?'Ingreso':'Egreso',`"${m.desc}"`,`"${catShort(m.cat)}"`,m.fecha,m.rut||'',m.doc||'',ivaStr(m.iva),m.monto,iv].join(',');
  });
  var csv=header+'\n'+rows.join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`GeoAltus_Libro_${periodo}_${new Date().toLocaleDateString('es-CL').replace(/\//g,'-')}.csv`;a.click();
}
function exportarResumenTributario(){
  var anio=document.getElementById('exp-año-pdf')?.value||currentYear;
  var yk=anio+'-';
  var usaPPM=true,ppmTasa=0.25;
  var mesesResumen=Array.from({length:12},(_,i)=>{
    var k=yk+i;var dm=dataMeses[k];
    if(!dm)return{mes:MESES[i],v:0,c:0,hb:0,ppm:0,ret:0,total:0};
    var v=dm.movs.filter(m=>m.tipo==='ing'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
    var c=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='afecto').reduce((s,m)=>s+m.monto,0);
    var hb=dm.movs.filter(m=>m.tipo==='egr'&&m.iva==='honorarios').reduce((s,m)=>s+m.monto,0);
    var iD=Math.round(v*0.19),iC=Math.round(c*0.19),ppm=Math.round(v*ppmTasa/100),ret=Math.round(hb*0.1525);
    var imp2M=histLiquidaciones.filter(h=>h.mesKey===k).reduce((s,h)=>s+h.imp2,0);
    return{mes:MESES[i],v,c,hb,iD,iC,ppm,ret,imp2M,total:iD-iC+ppm+ret+imp2M};
  });
  var header='Mes,Ventas Afectas,Compras Afectas,IVA Débito,IVA Crédito,IVA Neto,PPM (0.25%),Ret. Honorarios,Imp. 2ª Cat.,Total F29';
  var rows=mesesResumen.map(m=>[m.mes,m.v,m.c,m.iD,m.iC,m.iD-(m.iC||0),m.ppm,m.ret,m.imp2M||0,m.total].join(','));
  var csv=header+'\n'+rows.join('\n');
  var blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`GeoAltus_Tributario_${anio}.csv`;a.click();
}
async function resetLocalStorage(){
  var ok=await confirmDialog('¿Limpiar caché del navegador?','Esto borrará los datos guardados localmente. Los datos de ejemplo se restaurarán.','Esta acción no se puede deshacer.','Limpiar','var(--red)');
  if(!ok)return;
  try{localStorage.removeItem(LS_KEY);localStorage.removeItem('ga_theme');}catch(e){}
  toast('Caché limpiado — recarga la página para reiniciar','warn',5000);
  markUnsaved();
}
function exportarBackup(){
  var backup={version:12,exportado:new Date().toISOString(),dataMeses,clientes,proyectos,trabajadores,histLiquidaciones,cotizaciones,nextCotId};
  var blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});
  var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`GeoAltus_Backup_${new Date().toLocaleDateString('es-CL').replace(/\//g,'-')}.json`;a.click();
  toast('Respaldo descargado','ok');
}
function importarBackup(evt){
  var file=evt.target.files[0];
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var data=JSON.parse(e.target.result);
      if(data.dataMeses)Object.assign(dataMeses,data.dataMeses);
      if(data.clientes)clientes=data.clientes;
      if(data.proyectos)proyectos=data.proyectos;
      if(data.trabajadores)trabajadores=data.trabajadores;
      if(data.histLiquidaciones)histLiquidaciones=data.histLiquidaciones;
      document.getElementById('import-status').textContent='✓ Datos importados correctamente';
      document.getElementById('import-status').style.color='var(--green)';
      saveAllData();markSaved();renderAll();toast('Datos importados correctamente','ok',4000);
    }catch(err){
      document.getElementById('import-status').textContent='⚠ Error al leer el archivo';
      document.getElementById('import-status').style.color='var(--red)';
    }
  };
  reader.readAsText(file);
}
