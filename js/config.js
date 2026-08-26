
// ═══════════════════════════════════════════════════════════
//  CONFIGURACIÓN — Panel del empleador, plantillas, backup, preferencias
// ═══════════════════════════════════════════════════════════

// ── Panel config: cargar valores al abrir vista ──
function renderConfigView(){
  // Datos empleador
  var c=configEmpleador;
  var setV=(id,v)=>{var el=document.getElementById(id);if(el)el.value=v||'';};
  setV('cfg-empresa-nombre',c.razonSocial);
  setV('cfg-empresa-rut',c.rut);
  setV('cfg-empresa-inicio',c.inicioActividades);
  setV('cfg-empresa-giro',c.giro);
  setV('cfg-empresa-domicilio',c.domicilio);
  setV('cfg-empresa-email',c.email);
  setV('cfg-empresa-telefono',c.telefono);
  setV('cfg-empresa-web',c.web);
  setV('cfg-rep-nombre',c.representanteNombre);
  setV('cfg-rep-rut',c.representanteRut);
  setV('cfg-rep-cargo',c.representanteCargo||'Representante Legal');
  setV('cfg-banco-nombre',c.bancoNombre);
  setV('cfg-banco-tipo',c.bancoTipo);
  setV('cfg-banco-numero',c.bancoNumero);
  // Preferencias
  setV('cfg-pref-tema',preferencias.tema||'dark');
  setV('cfg-pref-mes-fiscal',preferencias.mesFiscal||0);
  setV('cfg-pref-factura-electronica',preferencias.facturaElectronica===false?'no':'si');
  setV('cfg-pref-notas',preferencias.notas||'');
  // KPIs
  document.getElementById('cfg-kpi-empresa').textContent=c.razonSocial||'—';
  document.getElementById('cfg-kpi-rut').textContent=c.rut?('RUT '+c.rut):'RUT no configurado';
  document.getElementById('cfg-kpi-plantillas').textContent=plantillasCotizacion.length;
  // Stats backup
  var totalMovs=Object.values(dataMeses).reduce((s,d)=>s+(d.movs?.length||0),0);
  document.getElementById('cfg-stat-movs').textContent=totalMovs;
  document.getElementById('cfg-stat-trab').textContent=trabajadores.length;
  document.getElementById('cfg-stat-cli').textContent=clientes.length;
  document.getElementById('cfg-stat-proy').textContent=proyectos.length;
  document.getElementById('cfg-stat-cot').textContent=cotizaciones.length;
  document.getElementById('cfg-stat-plan').textContent=plantillasCotizacion.length;
  document.getElementById('cfg-stat-liq').textContent=histLiquidaciones.length;
  // Storage estimado
  try{
    var sz=JSON.stringify(localStorage[LS_KEY]||'').length;
    var kb=(sz/1024).toFixed(1);
    document.getElementById('cfg-kpi-storage').textContent=kb+' KB';
  }catch(e){document.getElementById('cfg-kpi-storage').textContent='—';}
  // Plantillas
  renderPlantillasList();
  // Valores económicos mensuales
  poblarSelectValoresMes();
  cargarValoresMes();
  // Listeners para actualización en vivo del panel de valores derivados
  ['cfg-vm-utm','cfg-vm-uf','cfg-vm-imm'].forEach(function(id){
    var el=document.getElementById(id);
    if(el && !el.dataset.vmBound){
      el.addEventListener('input', calcularDerivadosValoresMes);
      el.dataset.vmBound='1';
    }
  });
}

function guardarConfiguracion(){
  var getV=(id)=>{var el=document.getElementById(id);return el?el.value.trim():'';};
  configEmpleador.razonSocial=getV('cfg-empresa-nombre')||'GEOALTUS SPA';
  configEmpleador.rut=getV('cfg-empresa-rut');
  configEmpleador.inicioActividades=getV('cfg-empresa-inicio');
  configEmpleador.giro=getV('cfg-empresa-giro');
  configEmpleador.domicilio=getV('cfg-empresa-domicilio');
  configEmpleador.email=getV('cfg-empresa-email');
  configEmpleador.telefono=getV('cfg-empresa-telefono');
  configEmpleador.web=getV('cfg-empresa-web');
  configEmpleador.representanteNombre=getV('cfg-rep-nombre');
  configEmpleador.representanteRut=getV('cfg-rep-rut');
  configEmpleador.representanteCargo=getV('cfg-rep-cargo')||'Representante Legal';
  configEmpleador.bancoNombre=getV('cfg-banco-nombre');
  configEmpleador.bancoTipo=getV('cfg-banco-tipo');
  configEmpleador.bancoNumero=getV('cfg-banco-numero');
  saveAllData();
  renderConfigView();
  toast('✓ Configuración guardada','ok');
}

function restaurarConfigDefault(){
  Object.assign(configEmpleador,{
    razonSocial:'GEOALTUS SPA',rut:'',giro:'Servicios de geomática, topografía y análisis geoespacial',
    domicilio:'La Serena, Región de Coquimbo',email:'contacto@geoaltus.cl',telefono:'',web:'',
    inicioActividades:'2025-07-11',representanteNombre:'Mathías Felipe Álvarez Parra',
    representanteRut:'19.497.218-0',representanteCargo:'Representante Legal',
    bancoNombre:'',bancoTipo:'',bancoNumero:''
  });
  renderConfigView();toast('Valores por defecto restaurados','info');
}

function guardarPreferencias(){
  preferencias.tema=document.getElementById('cfg-pref-tema').value;
  preferencias.mesFiscal=parseInt(document.getElementById('cfg-pref-mes-fiscal').value)||0;
  preferencias.facturaElectronica=document.getElementById('cfg-pref-factura-electronica').value!=='no';
  preferencias.notas=document.getElementById('cfg-pref-notas').value;
  saveAllData();
  toast('✓ Preferencias guardadas','ok');
  if(document.getElementById('cal-grid'))renderCalendario();
}

function cambiarTemaConfig(v){
  // Aprovechar el toggle de tema existente si está
  if(typeof setTheme==='function'){setTheme(v);}
  else{document.documentElement.setAttribute('data-theme',v);}
  preferencias.tema=v;
}

// ── VALORES ECONÓMICOS MENSUALES (UTM / UF / IMM) ──
// Rellena el <select> de meses con los meses del año actual
function poblarSelectValoresMes(){
  var sel=document.getElementById('cfg-vm-mes');
  if(!sel) return;
  // Mantiene selección si existe
  var prev=sel.value;
  sel.innerHTML='';
  var año=currentYear;
  for(var m=0;m<12;m++){
    var key=año+'-'+m;
    var opt=document.createElement('option');
    opt.value=key;
    opt.textContent=MESES[m]+' '+año;
    sel.appendChild(opt);
  }
  // Por defecto el mes actualmente seleccionado en la UI
  var actual=currentYear+'-'+currentMonth;
  sel.value=prev&&[...sel.options].some(o=>o.value===prev) ? prev : actual;
}
// Carga los valores del mes seleccionado en los inputs
function cargarValoresMes(){
  var sel=document.getElementById('cfg-vm-mes');
  if(!sel) return;
  var mesKey=sel.value;
  var v=getValoresMes(mesKey);
  document.getElementById('cfg-vm-utm').value=v.utm;
  document.getElementById('cfg-vm-uf').value=v.uf;
  document.getElementById('cfg-vm-imm').value=v.imm;
  // Actualiza labels con fuente (default vs personalizado)
  var edit=(preferencias.valoresMensuales||{})[mesKey];
  var tagU=(edit&&edit.utm)?' · <span style="color:var(--teal)">editado</span>':' · <span style="color:var(--text3)">precargado</span>';
  var tagF=(edit&&edit.uf)?' · <span style="color:var(--teal)">editado</span>':' · <span style="color:var(--text3)">precargado</span>';
  var tagI=(edit&&edit.imm)?' · <span style="color:var(--teal)">editado</span>':' · <span style="color:var(--text3)">precargado</span>';
  document.getElementById('cfg-vm-utm-label').innerHTML='UTM (pesos)'+tagU;
  document.getElementById('cfg-vm-uf-label').innerHTML='UF último día del mes (pesos)'+tagF;
  document.getElementById('cfg-vm-imm-label').innerHTML='Ingreso Mínimo Mensual (pesos)'+tagI;
  calcularDerivadosValoresMes();
}
// Recalcula y muestra los topes derivados en tiempo real
function calcularDerivadosValoresMes(){
  var utm=parseFloat(document.getElementById('cfg-vm-utm').value)||0;
  var uf=parseFloat(document.getElementById('cfg-vm-uf').value)||0;
  var imm=parseFloat(document.getElementById('cfg-vm-imm').value)||0;
  document.getElementById('cfg-vm-tope-afp').textContent=fmt(Math.round(TOPE_AFP_UF*uf))+'  (90 UF)';
  document.getElementById('cfg-vm-tope-ces').textContent=fmt(Math.round(TOPE_CES_UF*uf))+'  (135,2 UF)';
  document.getElementById('cfg-vm-tope-grat').textContent=fmt(Math.round(4.75*imm/12))+'  (mensual)';
  document.getElementById('cfg-vm-exento').textContent=fmt(Math.round(13.5*utm));
}
// Guarda en preferencias.valoresMensuales[mesKey]
function guardarValoresMes(){
  var sel=document.getElementById('cfg-vm-mes');
  if(!sel) return;
  var mesKey=sel.value;
  var utm=parseFloat(document.getElementById('cfg-vm-utm').value)||0;
  var uf=parseFloat(document.getElementById('cfg-vm-uf').value)||0;
  var imm=parseFloat(document.getElementById('cfg-vm-imm').value)||0;
  if(utm<=0||uf<=0||imm<=0){toast('Los valores deben ser mayores a 0','warn');return;}
  if(!preferencias.valoresMensuales) preferencias.valoresMensuales={};
  preferencias.valoresMensuales[mesKey]={utm,uf,imm};
  saveAllData();
  // Re-render de todo lo que depende de estos valores
  if(typeof calcLiquidacion==='function') calcLiquidacion();
  if(typeof renderTramos==='function') renderTramos();
  if(typeof renderAll==='function') renderAll();
  cargarValoresMes();
  toast('✓ Valores del mes '+MESES[parseInt(mesKey.split('-')[1])]+' guardados','ok');
}
// Elimina la edición del usuario y vuelve al default precargado
function restaurarValoresMesDefault(){
  var sel=document.getElementById('cfg-vm-mes');
  if(!sel) return;
  var mesKey=sel.value;
  if(preferencias.valoresMensuales && preferencias.valoresMensuales[mesKey]){
    delete preferencias.valoresMensuales[mesKey];
    saveAllData();
    if(typeof calcLiquidacion==='function') calcLiquidacion();
    if(typeof renderAll==='function') renderAll();
    cargarValoresMes();
    toast('↺ Valores restaurados al precargado','ok');
  } else {
    toast('Este mes ya usa el valor precargado','info');
  }
}

// ── BACKUP / RESTORE ──
function exportarBackupCompleto(){
  var data={
    _meta:{producto:'GeoAltus Dashboard',version:'v12',exportado:new Date().toISOString()},
    dataMeses,clientes,proyectos,trabajadores,histLiquidaciones,cotizaciones,
    configEmpleador,plantillasCotizacion,preferencias,histEstados,
    nextId,nextCliId,nextProyId,nextCotId
  };
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  var fecha=new Date().toISOString().slice(0,10);
  a.href=url;a.download=`geoaltus-backup-${fecha}.json`;
  document.body.appendChild(a);a.click();document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('✓ Backup descargado','ok');
}

function restaurarBackup(input){
  if(!input.files||!input.files[0]){return;}
  var file=input.files[0];
  var reader=new FileReader();
  reader.onload=function(e){
    try{
      var d=JSON.parse(e.target.result);
      if(!d._meta||d._meta.producto!=='GeoAltus Dashboard'){
        if(!confirm('Este archivo no parece ser un backup de GeoAltus. ¿Continuar de todas formas?'))return;
      }
      showConfirm({
        title:'¿Restaurar backup?',
        desc:'Se reemplazarán TODOS los datos actuales por los del archivo. Esta acción no se puede deshacer.',
        item:`Exportado: ${d._meta?.exportado||'desconocido'} · ${Object.keys(d.dataMeses||{}).length} meses, ${(d.trabajadores||[]).length} trabajadores, ${(d.clientes||[]).length} clientes`,
        okText:'Restaurar'
      }).then(ok=>{
        if(!ok){input.value='';return;}
        try{
          if(d.dataMeses){for(var k in dataMeses)delete dataMeses[k];Object.assign(dataMeses,d.dataMeses);}
          if(d.clientes)clientes=d.clientes;
          if(d.proyectos)proyectos=d.proyectos;
          if(d.trabajadores)trabajadores=d.trabajadores;
          if(d.histLiquidaciones)histLiquidaciones=d.histLiquidaciones;
          if(d.cotizaciones)cotizaciones=d.cotizaciones;
          if(d.configEmpleador)Object.assign(configEmpleador,d.configEmpleador);
          if(d.plantillasCotizacion)plantillasCotizacion=d.plantillasCotizacion;
          if(d.preferencias)Object.assign(preferencias,d.preferencias);
          if(d.histEstados)Object.assign(histEstados,d.histEstados);
          if(d.nextId)nextId=d.nextId;
          if(d.nextCliId)nextCliId=d.nextCliId;
          if(d.nextProyId)nextProyId=d.nextProyId;
          if(d.nextCotId)nextCotId=d.nextCotId;
          saveAllData();
          setTimeout(()=>location.reload(),800);
          toast('✓ Backup restaurado — recargando...','ok');
        }catch(err){toast('Error al restaurar: '+err.message,'warn');}
        input.value='';
      });
    }catch(err){toast('Archivo inválido: '+err.message,'warn');input.value='';}
  };
  reader.readAsText(file);
}

function confirmarBorrarTodo(){
  showConfirm({
    title:'¿Borrar todos los datos?',
    desc:'Esto eliminará TODO: movimientos, trabajadores, clientes, proyectos, cotizaciones, plantillas y configuración. La acción es IRREVERSIBLE.',
    item:'Recomendación: descarga un backup antes de continuar.',
    okText:'Borrar TODO'
  }).then(ok=>{
    if(!ok)return;
    try{localStorage.removeItem(LS_KEY);}catch(e){}
    toast('Datos borrados — recargando...','warn');
    setTimeout(()=>location.reload(),1200);
  });
}
