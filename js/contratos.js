
// ═══════════════════════════════════════════════════════════
//  CONTRATO DE TRABAJO — generación según Código del Trabajo CL
// ═══════════════════════════════════════════════════════════
var contratoTrabId=null;

// Datos del empleador — editables desde panel Configuración, persistidos en localStorage
var configEmpleador={
  razonSocial:'GEOALTUS SPA',
  rut:'',
  giro:'Servicios de geomática, topografía y análisis geoespacial',
  domicilio:'La Serena, Región de Coquimbo',
  email:'contacto@geoaltus.cl',
  telefono:'',
  web:'',
  inicioActividades:'2025-07-11',
  representanteNombre:'Mathías Felipe Álvarez Parra',
  representanteRut:'19.497.218-0',
  representanteCargo:'Representante Legal',
  bancoNombre:'',
  bancoTipo:'',
  bancoNumero:''
};
// Alias retrocompatible — el contrato sigue usando EMPLEADOR_CONTRATO en sus templates
var EMPLEADOR_CONTRATO=configEmpleador;

// Plantillas de cotización guardables
var plantillasCotizacion=[];

// Preferencias del sistema
var preferencias={tema:'dark',mesFiscal:0,facturaElectronica:true,notas:'',valoresMensuales:{},viabParams:{}};

function openModalContrato(trabId){
  var t=trabajadores.find(x=>x.id===trabId);
  if(!t){toast('Selecciona un trabajador','warn');return;}
  contratoTrabId=trabId;

  // Resumen del trabajador
  var camposFaltantes=[];
  if(!t.rut||t.rut==='XX.XXX.XXX-X')camposFaltantes.push('RUT');
  if(!t.domicilio)camposFaltantes.push('domicilio');
  if(!t.nacimiento)camposFaltantes.push('fecha nacimiento');
  if(!t.sueldo)camposFaltantes.push('sueldo');
  if(!t.cargo)camposFaltantes.push('cargo');
  var warn=camposFaltantes.length?`<div style="margin-top:10px;padding:8px 10px;background:var(--red-dim);border-radius:6px;font-size:11px;color:var(--red);font-family:var(--mono)">⚠ Faltan datos: ${camposFaltantes.join(', ')}. Edita el trabajador antes de generar el contrato.</div>`:'';

  document.getElementById('contrato-trab-resumen').innerHTML=`
    <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--gold);font-weight:700;margin-bottom:8px">Trabajador seleccionado</div>
    <div style="font-size:14px;font-weight:700;color:var(--text);margin-bottom:4px">${t.nombre}</div>
    <div style="font-size:12px;color:var(--text2);line-height:1.7">
      RUT: <strong>${t.rut||'—'}</strong> · Cargo: <strong>${t.cargo||'—'}</strong><br>
      Sueldo bruto: <strong>${fmt(t.sueldo||0)}</strong>${t.bonoMov?` · Bono mov: <strong>${fmt(t.bonoMov)}</strong>`:''}${t.bonoCol?` · Bono col: <strong>${fmt(t.bonoCol)}</strong>`:''}<br>
      AFP: <strong>${t.afp||'—'}%</strong> · Salud: <strong>${(t.salud||'fonasa').toUpperCase()}</strong>
    </div>${warn}`;

  // Pre-llenar formulario con datos del trabajador si existen
  document.getElementById('contrato-tipo').value=t.tipoContrato||'indefinido';
  document.getElementById('contrato-fecha-inicio').value=t.fechaContrato||'';
  document.getElementById('contrato-fecha-termino').value=t.fechaTermino||'';
  document.getElementById('contrato-obra').value=t.obra||'';
  document.getElementById('contrato-lugar').value=t.lugar||'Oficina GeoAltus, La Serena, Región de Coquimbo';
  document.getElementById('contrato-jornada').value=t.jornada||'Lunes a viernes, 08:30 a 17:30, con 1 hora de colación no imputable a la jornada';
  document.getElementById('contrato-clausula-extra').value='';
  toggleContratoCampos();
  document.getElementById('modal-contrato').classList.add('open');
}
function closeModalContrato(){document.getElementById('modal-contrato').classList.remove('open');contratoTrabId=null;}
function toggleContratoCampos(){
  var tipo=document.getElementById('contrato-tipo').value;
  document.getElementById('fg-fecha-termino').style.display=(tipo==='plazo_fijo')?'block':'none';
  document.getElementById('fg-obra-detalle').style.display=(tipo==='obra_faena')?'block':'none';
}

// Enganchar onchange
setTimeout(()=>{var el=document.getElementById('contrato-tipo');if(el)el.addEventListener('change',toggleContratoCampos);},800);

// Formato fechas y número con letras para contratos
function fechaLarga(iso){
  if(!iso)return '___________';
  var d=new Date(iso+'T12:00:00');
  var meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}
function numeroALetras(n){
  if(!n||n<=0)return 'cero pesos';
  var UNI=['','un','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte'];
  var DECENAS=['','','veinti','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];
  var CENTENAS=['','ciento','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];
  function trip(x){
    if(x===0)return '';
    if(x<=20)return UNI[x];
    if(x<30){return x===20?'veinte':'veinti'+UNI[x-20];}
    if(x<100){var d=Math.floor(x/10),u=x%10;return DECENAS[d]+(u?' y '+UNI[u]:'');}
    if(x===100)return 'cien';
    var c=Math.floor(x/100),r=x%100;
    return CENTENAS[c]+(r?' '+trip(r):'');
  }
  var millones=Math.floor(n/1000000),miles=Math.floor((n%1000000)/1000),rest=n%1000;
  var partes=[];
  if(millones>0)partes.push(millones===1?'un millón':trip(millones)+' millones');
  if(miles>0)partes.push(miles===1?'mil':trip(miles)+' mil');
  if(rest>0)partes.push(trip(rest));
  return (partes.join(' ').trim()||'cero')+' pesos';
}

function generarContratoPDF(){
  var t=trabajadores.find(x=>x.id===contratoTrabId);
  if(!t){toast('Trabajador no encontrado','warn');return;}
  var tipo=document.getElementById('contrato-tipo').value;
  var ciudad=document.getElementById('contrato-ciudad').value.trim()||'La Serena';
  var fechaInicio=document.getElementById('contrato-fecha-inicio').value;
  var fechaTermino=document.getElementById('contrato-fecha-termino').value;
  var obra=document.getElementById('contrato-obra').value.trim();
  var lugar=document.getElementById('contrato-lugar').value.trim()||'Oficina GeoAltus, La Serena';
  var jornada=document.getElementById('contrato-jornada').value.trim();
  var horasSem=parseInt(document.getElementById('contrato-horas-sem').value)||40;
  var colacionTipo=document.getElementById('contrato-colacion').value;
  var diaPago=document.getElementById('contrato-dia-pago').value.trim()||'el día 5 del mes siguiente';
  var clausulaExtra=document.getElementById('contrato-clausula-extra').value.trim();

  if(!fechaInicio){toast('Debes ingresar la fecha de inicio','warn');return;}
  if(tipo==='plazo_fijo'&&!fechaTermino){toast('Contrato plazo fijo requiere fecha de término','warn');return;}
  if(tipo==='obra_faena'&&!obra){toast('Contrato por obra/faena requiere especificar la obra','warn');return;}

  var hoy=new Date();
  var tipoLabel={indefinido:'INDEFINIDO',plazo_fijo:'A PLAZO FIJO',obra_faena:'POR OBRA O FAENA'}[tipo];
  var saludLabel=t.salud==='isapre'?'ISAPRE':'FONASA';

  // Cláusula SEGUNDO según tipo
  var clausulaSegundo='';
  if(tipo==='indefinido'){
    clausulaSegundo='La duración del presente contrato de trabajo es de carácter <strong>INDEFINIDO</strong>.';
  }else if(tipo==='plazo_fijo'){
    clausulaSegundo=`El presente contrato es <strong>A PLAZO FIJO</strong>, iniciando el ${fechaLarga(fechaInicio)} y terminando el ${fechaLarga(fechaTermino)}, sin necesidad de desahucio ni aviso previo. Las partes acuerdan que, si el trabajador continuare prestando servicios con conocimiento del empleador después de expirado el plazo, el contrato se transformará en indefinido conforme al artículo 159 N°4 del Código del Trabajo.`;
  }else{
    clausulaSegundo=`El presente contrato es <strong>POR OBRA O FAENA DETERMINADA</strong>, correspondiente a: <em>${obra}</em>. El contrato terminará una vez concluida la obra o faena indicada, sin necesidad de desahucio ni aviso previo, conforme al artículo 159 N°5 del Código del Trabajo.`;
  }

  // Cláusula QUINTO — beneficios
  var beneficios=[];
  if(t.bonoMov&&t.bonoMov>0)beneficios.push(`<li><strong>Bono de Movilización</strong>: ${fmt(t.bonoMov)} (${numeroALetras(t.bonoMov)}) mensuales.</li>`);
  if(t.bonoCol&&t.bonoCol>0)beneficios.push(`<li><strong>Bono de Colación</strong>: ${fmt(t.bonoCol)} (${numeroALetras(t.bonoCol)}) mensuales.</li>`);
  var clausulaQuinto=beneficios.length
    ?`El Empleador se compromete a otorgar al Trabajador los siguientes beneficios adicionales:<ul style="margin:6px 0 0 20px;padding:0">${beneficios.join('')}</ul>`
    :'Las partes acuerdan que no se convienen beneficios adicionales al sueldo base, sin perjuicio de aquellos que puedan pactarse posteriormente por escrito.';

  // Cláusula OCTAVO — pago remuneración
  var cuentaTxt='';
  if(t.banco||t.nCuenta){
    cuentaTxt=`El pago de la remuneración se realizará mediante transferencia electrónica a la siguiente cuenta del Trabajador:<br>
      • ${t.tipoCuenta||'Cuenta'} N° <strong>${t.nCuenta||'___________'}</strong><br>
      • Banco <strong>${t.banco||'___________'}</strong>${t.email?`<br>• Correo electrónico <strong>${t.email}</strong>`:''}`;
  }else{
    cuentaTxt='El pago de la remuneración se realizará mediante transferencia electrónica a la cuenta bancaria que el Trabajador indique por escrito.';
  }

  var css=`*{box-sizing:border-box;}
body{font-family:'Times New Roman',Times,serif;font-size:12pt;color:#000;margin:0;padding:40px 50px;line-height:1.6;background:#fff;}
h1{font-size:14pt;text-align:center;margin-bottom:24px;text-transform:uppercase;letter-spacing:1px;}
p{margin:0 0 12px;text-align:justify;}
.intro{text-align:justify;margin-bottom:20px;}
.clausula{margin-bottom:14px;text-align:justify;}
.clausula strong.titulo{text-transform:uppercase;}
ul{margin:4px 0 8px 24px;padding:0;}
li{margin-bottom:4px;text-align:justify;}
.firmas{margin-top:60px;display:flex;justify-content:space-between;gap:40px;page-break-inside:avoid;}
.firma-box{flex:1;text-align:center;font-size:11pt;}
.firma-line{border-top:1px solid #000;margin-bottom:6px;}
.firma-nombre{font-weight:700;text-transform:uppercase;}
.firma-rut{font-size:10pt;color:#333;}
.firma-rol{font-size:10pt;color:#333;margin-top:2px;}
footer{margin-top:30px;font-size:9pt;color:#666;text-align:center;border-top:1px solid #ddd;padding-top:10px;}
@media print{body{padding:1.5cm 2cm;}@page{size:A4;margin:0;}}`;

  var html=`<html><head><meta charset="UTF-8"><title>Contrato ${tipoLabel} — ${t.nombre}</title><style>${css}</style></head><body>

<h1>Contrato de Trabajo ${tipoLabel}</h1>

<p class="intro">En <strong>${ciudad}</strong>, a <strong>${fechaLarga(hoy.toISOString().slice(0,10))}</strong>, entre la empresa <strong>${EMPLEADOR_CONTRATO.razonSocial||'___________'}</strong>, RUT <strong>${EMPLEADOR_CONTRATO.rut||'___________'}</strong>, sociedad comercial del giro <em>${EMPLEADOR_CONTRATO.giro||'___________'}</em>, representada para estos efectos por don(ña) <strong>${EMPLEADOR_CONTRATO.representanteNombre||'___________'}</strong>, RUT <strong>${EMPLEADOR_CONTRATO.representanteRut||'___________'}</strong>, ambos domiciliados en <strong>${EMPLEADOR_CONTRATO.domicilio||'___________'}</strong>${EMPLEADOR_CONTRATO.email?`, correo electrónico <strong>${EMPLEADOR_CONTRATO.email}</strong>`:''}, por una parte, en adelante denominada la Empresa o el Empleador indistintamente; y por la otra parte, en adelante el Trabajador don(ña) <strong>${t.nombre||'___________'}</strong>, RUT <strong>${t.rut||'___________'}</strong>, de nacionalidad <strong>${t.nacionalidad||'chilena'}</strong>, estado civil <strong>${t.civil||'___________'}</strong>${t.nacimiento?`, nacido(a) el <strong>${fechaLarga(t.nacimiento)}</strong>`:''}, domiciliado(a) en <strong>${t.domicilio||'___________'}</strong>${t.email?`, correo electrónico <strong>${t.email}</strong>`:''}, se celebra el siguiente contrato de trabajo ${tipoLabel.toLowerCase()}, para lo cual las partes convienen en denominarse <strong>EMPLEADOR</strong> y <strong>TRABAJADOR</strong>, respectivamente.</p>

<p class="clausula"><strong class="titulo">Primero:</strong> El Trabajador se compromete a ejecutar el trabajo de <strong>${(t.cargo||'___________').toUpperCase()}</strong>. Esta tarea se realizará en dependencias ubicadas en <strong>${lugar}</strong>, desde el día <strong>${fechaLarga(fechaInicio)}</strong>. Sin perjuicio de realizar otra tarea análoga o similar al cargo asignado, pudiendo ser trasladado cuando el Empleador lo determine, no importando menoscabo para el Trabajador, contingencia inherente a la naturaleza de los servicios que se contratan.</p>

<p class="clausula"><strong class="titulo">Segundo:</strong> ${clausulaSegundo}</p>

<p class="clausula"><strong class="titulo">Tercero:</strong> El Trabajador se compromete, a la vez en forma expresa, a cumplir la siguiente jornada de trabajo: <strong>${jornada}</strong>, completando un total de <strong>${horasSem} horas semanales</strong>, conforme a la jornada establecida por la Ley N° 21.561 de reducción de jornada laboral en Chile. ${colacionTipo==='no_imputable'?'Dentro de dicha jornada el trabajador dispone de 1 hora de colación, la que <strong>no será imputable</strong> a la jornada de trabajo.':colacionTipo==='imputable'?'La hora de colación se considera <strong>imputable</strong> a la jornada de trabajo, atendida la naturaleza de los servicios prestados, conforme al artículo 34 inciso 1° del Código del Trabajo.':'Las partes acuerdan que no se conviene una hora específica de colación dentro de la jornada de trabajo.'}</p>

<p class="clausula"><strong class="titulo">Cuarto:</strong> Por la prestación efectiva de sus servicios el Trabajador tendrá derecho a un sueldo base de <strong>${fmt(t.sueldo||0)}</strong> (<em>${numeroALetras(t.sueldo||0)}</em>) por mes trabajado. A la remuneración así determinada, podrá el Empleador efectuar todos los descuentos previsionales y tributarios que correspondan, como los demás que permite la ley. El Trabajador acepta y autoriza al Empleador para que le descuente de sus remuneraciones el tiempo no trabajado, ya sea por inasistencias, atrasos o permisos. La remuneración se pagará por mensualidades vencidas, dentro de las disposiciones legales, ${diaPago} a aquel en que se devenguen las remuneraciones.</p>

<p class="clausula"><strong class="titulo">Quinto:</strong> ${clausulaQuinto}</p>

<p class="clausula"><strong class="titulo">Sexto:</strong> El Trabajador se obliga expresamente a abstenerse de ejecutar cualquier actividad que esté o que pueda presumirse razonablemente que se presente como un conflicto real o potencial con los intereses del Empleador. Asimismo, se obliga a mantener en absoluta reserva respecto de terceros toda la información relacionada con la actividad del Empleador o de sus clientes, o información que el cliente suministre como reservada. El incumplimiento de cualquiera de las obligaciones mencionadas u otras similares constituirá infracción grave a las obligaciones que impone este contrato, reservándose el Empleador el ejercicio de las facultades que le confiere la Ley.</p>

<p class="clausula"><strong class="titulo">Séptimo:</strong> La Gratificación se pagará de acuerdo a la modalidad del artículo 50 del Código del Trabajo, esto es, el 25% de la remuneración devengada por el Trabajador con un tope de 4,75 Ingresos Mínimos Mensuales. La empresa otorgará anticipos mensuales equivalentes a un duodécimo de los 4,75 Ingresos Mínimos Mensuales. Con este pago se entenderá cumplida la obligación de la empresa de pagar gratificación legal.</p>

<p class="clausula"><strong class="titulo">Octavo:</strong> El Trabajador, para efectos previsionales, se encuentra afiliado a <strong>AFP con cotización del ${t.afp||'10.58'}%</strong>, y para efectos de salud a <strong>${saludLabel}</strong>. ${cuentaTxt}</p>

<p class="clausula"><strong class="titulo">Noveno:</strong> Se deja constancia que el Trabajador ingresó a prestar servicios para el Empleador el día <strong>${fechaLarga(fechaInicio)}</strong>.</p>

<p class="clausula"><strong class="titulo">Décimo:</strong> Para todo efecto legal y contractual, las partes fijan su domicilio en la ciudad de <strong>${ciudad}</strong> y, por lo tanto, se someten a la jurisdicción de sus tribunales.</p>

<p class="clausula"><strong class="titulo">Décimo Primero:</strong> El presente contrato individual de trabajo se otorga en tres ejemplares del mismo tenor y fecha, quedando uno de ellos en poder del Trabajador y los otros dos restantes en poder de la Empresa.</p>

<p class="clausula"><strong class="titulo">Décimo Segundo:</strong> Toda la información confidencial que reciba el Trabajador no podrá ser reproducida por ningún medio ni en ningún formato sin expresa autorización previa escrita del Empleador, excepto por aquellas copias que el Trabajador pueda necesitar para hacer operativo el servicio. Se prohíbe la divulgación de imágenes e información relativas a los proyectos en los cuales desempeñará funciones.</p>

${clausulaExtra?`<p class="clausula"><strong class="titulo">Décimo Tercero:</strong> ${clausulaExtra.replace(/\n/g,'<br>')}</p>`:''}

<div class="firmas">
  <div class="firma-box">
    <div class="firma-line"></div>
    <div class="firma-nombre">${EMPLEADOR_CONTRATO.representanteNombre}</div>
    <div class="firma-rut">${EMPLEADOR_CONTRATO.representanteRut}</div>
    <div class="firma-rol">Representante Legal<br>${EMPLEADOR_CONTRATO.razonSocial}</div>
  </div>
  <div class="firma-box">
    <div class="firma-line"></div>
    <div class="firma-nombre">${t.nombre||'___________'}</div>
    <div class="firma-rut">${t.rut||'___________'}</div>
    <div class="firma-rol">Trabajador</div>
  </div>
</div>

<footer>Contrato generado el ${hoy.toLocaleDateString('es-CL')} mediante panel GeoAltus · Documento referencial sujeto a revisión legal antes de su firma</footer>

</body></html>`;

  var w=window.open('','_blank');
  if(!w){toast('⚠ Habilita las ventanas emergentes para descargar el contrato','warn');return;}
  w.document.write(html);w.document.close();
  setTimeout(()=>w.print(),600);
  closeModalContrato();
  toast('✓ Contrato generado para '+t.nombre,'ok');
}
