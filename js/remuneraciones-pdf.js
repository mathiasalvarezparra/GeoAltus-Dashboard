
function generarLiqPDF(){
  var t=trabajadores.find(x=>x.id===trabSeleccionado);
  if(!t){alert('Selecciona un trabajador');return;}
  var bruto=parseFloat(document.getElementById('liq-bruto').value)||0;
  var totalDias=diasEnMes(currentYear,currentMonth);
  var diasTrab=0,diasLic=0,diasVac=0,diasPerm=0;
  if(!tramosActuales.length){diasTrab=totalDias;}
  else{tramosActuales.forEach(tr=>{const d=Math.max(0,tr.hasta-tr.desde+1);if(tr.tipo==='trabajado')diasTrab+=d;else if(tr.tipo==='licencia')diasLic+=d;else if(tr.tipo==='vacaciones')diasVac+=d;else diasPerm+=d;});}
  var diasRem=diasTrab+diasVac;
  var brutoRem=Math.round(bruto*(diasRem/totalDias));
  var d=calcLiqData(brutoRem,t.afp,diasRem,'completo',t.tipoContrato);
  var mesLabel=MESES[currentMonth]+' '+currentYear;
  var fechaPago=new Date().toLocaleDateString('es-CL');
  var afpNombrePDF=t.afpNombre?`AFP ${t.afpNombre}`:'AFP';
  var saludLblPDF=(t.salud||'fonasa')==='fonasa'?'Fonasa':'Isapre';
  var html=`<html><head><meta charset="UTF-8"><title>Liquidación ${t.nombre} ${mesLabel}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:32px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px;}
    .empresa-nombre{font-size:18px;font-weight:800;letter-spacing:.5px;}
    .empresa-sub{font-size:10px;color:#666;margin-top:3px;}
    .liq-titulo{font-size:13px;font-weight:700;text-align:right;}
    .liq-periodo{font-size:11px;color:#666;text-align:right;margin-top:3px;}
    .datos-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;background:#f8f8f8;border:1px solid #e0e0e0;border-radius:6px;padding:14px;margin-bottom:20px;}
    .dato{display:flex;flex-direction:column;gap:2px;}
    .dato-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#888;}
    .dato-val{font-size:12px;font-weight:600;}
    .sec{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;border-bottom:1px solid #ddd;padding-bottom:4px;margin:16px 0 8px;}
    table{width:100%;border-collapse:collapse;}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:11px;}
    .right{text-align:right;font-weight:700;}
    .total-row{background:#f0fdf4;border-top:2px solid #86efac;}
    .total-row td{font-weight:800;font-size:14px;padding:10px;}
    .borrador{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-30deg);font-size:72px;font-weight:900;color:rgba(0,0,0,.05);letter-spacing:4px;pointer-events:none;}
    .aus-nota{font-size:10px;color:#888;background:#fffbeb;border:1px solid #fde68a;border-radius:5px;padding:8px 10px;margin-top:12px;}
    .footer{margin-top:28px;padding-top:12px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:flex-end;}
    .footer-left{font-size:10px;color:#888;line-height:1.6;}
    .firma{text-align:center;}
    .firma-linea{width:180px;border-bottom:1px solid #333;margin-bottom:4px;}
    .firma-label{font-size:9px;color:#666;}
  </style></head><body>
  <div class="borrador">BORRADOR</div>
  <div class="header">
    <div>
      <div class="empresa-nombre">GeoAltus SPA</div>
      <div class="empresa-sub">RUT: 77.XXX.XXX-X · La Serena, Coquimbo</div>
    </div>
    <div>
      <div class="liq-titulo">Liquidación de Remuneración</div>
      <div class="liq-periodo">${mesLabel}</div>
    </div>
  </div>
  <div class="datos-grid">
    <div class="dato"><span class="dato-lbl">Nombre Trabajador</span><span class="dato-val">${t.nombre}</span></div>
    <div class="dato"><span class="dato-lbl">RUT Trabajador</span><span class="dato-val">${t.rut||'Por completar'}</span></div>
    <div class="dato"><span class="dato-lbl">Cargo</span><span class="dato-val">${t.cargo}</span></div>
    <div class="dato"><span class="dato-lbl">Fecha Contrato</span><span class="dato-val">${t.fechaContrato||'—'}</span></div>
    <div class="dato"><span class="dato-lbl">AFP</span><span class="dato-val">${afpNombrePDF} (${t.afp}%)</span></div>
    <div class="dato"><span class="dato-lbl">Previsión Salud</span><span class="dato-val">${saludLblPDF} (7%)</span></div>
    <div class="dato"><span class="dato-lbl">Período Remuneración</span><span class="dato-val">${mesLabel}</span></div>
    <div class="dato"><span class="dato-lbl">Fecha de Pago</span><span class="dato-val">${fechaPago}</span></div>
  </div>
  <div class="sec">Haberes</div>
  <table>
    <tr><td>Sueldo Base${diasRem<totalDias?` (${diasRem} días remunerados de ${totalDias})`:''}</td><td class="right" style="color:#16a34a">${fmt(brutoRem)}</td></tr>
  </table>
  <div class="sec">Descuentos Previsionales</div>
  <table>
    <tr><td>Cotización ${afpNombrePDF} (${t.afp}%)</td><td class="right" style="color:#dc2626">−${fmt(d.afpVal)}</td></tr>
    <tr><td>Cotización Salud ${saludLblPDF} (7%)</td><td class="right" style="color:#dc2626">−${fmt(d.saludVal)}</td></tr>
    ${t.tipoContrato==='indefinido'?`<tr><td>Seguro de Cesantía trabajador (0.6%)</td><td class="right" style="color:#dc2626">−${fmt(d.cesT)}</td></tr>`:''}
  </table>
  <div class="sec">Impuesto a la Renta</div>
  <table>
    <tr><td>Base Imponible 2ª Categoría</td><td class="right">${fmt(d.base)}</td></tr>
    <tr><td>Impuesto Único de 2ª Categoría retenido</td><td class="right" style="color:#dc2626">${d.imp2>0?'−'+fmt(d.imp2):'$0 (exento)'}</td></tr>
  </table>
  <table style="margin-top:12px">
    <tr class="total-row"><td>▶ TOTAL SUELDO LÍQUIDO</td><td class="right" style="color:#16a34a">${fmt(d.liquido)}</td></tr>
  </table>
  ${diasLic>0?`<div class="aus-nota">* Este período incluye ${diasLic} día(s) con licencia médica. El subsidio por incapacidad laboral (SIL) es pagado directamente por Fonasa.</div>`:''}
  <div class="footer">
    <div class="footer-left">
      Borrador — Guardar liquidación para documento oficial<br>
      GeoAltus SPA · ${new Date().toLocaleString('es-CL')}
    </div>
    <div class="firma">
      <div class="firma-linea"></div>
      <div class="firma-label">GeoAltus SPA · Empleador</div>
    </div>
  </div>
  </body></html>`;
  var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);
}

function verLiqPDF(mesKey,trabId){
  var t=trabajadores.find(x=>x.id===trabId);
  var h=histLiquidaciones.find(x=>x.mesKey===mesKey&&x.trabId===trabId);
  if(!t||!h){alert('No se encontró la liquidación');return;}
  var fechaPago=new Date().toLocaleDateString('es-CL');
  var afpNombrePDF=t.afpNombre?`AFP ${t.afpNombre}`:'AFP';
  var saludLblPDF=(t.salud||'fonasa')==='fonasa'?'Fonasa':'Isapre';
  // Usar tipoContrato guardado en el registro (fallback al del trabajador, default indefinido)
  var tcPDF=h.tipoContrato||t.tipoContrato||'indefinido';
  var html=`<html><head><meta charset="UTF-8"><title>Liquidación ${t.nombre} ${h.mes}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;font-size:11px;color:#111;padding:32px;}
    .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #111;padding-bottom:14px;margin-bottom:20px;}
    .empresa-nombre{font-size:18px;font-weight:800;letter-spacing:.5px;}
    .empresa-sub{font-size:10px;color:#666;margin-top:3px;}
    .liq-titulo{font-size:13px;font-weight:700;text-align:right;}
    .liq-periodo{font-size:11px;color:#666;text-align:right;margin-top:3px;}
    .datos-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 20px;background:#f8f8f8;border:1px solid #e0e0e0;border-radius:6px;padding:14px;margin-bottom:20px;}
    .dato{display:flex;flex-direction:column;gap:2px;}
    .dato-lbl{font-size:9px;text-transform:uppercase;letter-spacing:.5px;color:#888;}
    .dato-val{font-size:12px;font-weight:600;}
    .sec{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;border-bottom:1px solid #ddd;padding-bottom:4px;margin:16px 0 8px;}
    table{width:100%;border-collapse:collapse;}
    td{padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:11px;}
    .right{text-align:right;font-weight:700;}
    .total-row{background:#f0fdf4;border-top:2px solid #86efac;}
    .total-row td{font-weight:800;font-size:14px;padding:10px;}
    .aus-nota{font-size:10px;color:#888;background:#fffbeb;border:1px solid #fde68a;border-radius:5px;padding:8px 10px;margin-top:12px;}
    .footer{margin-top:28px;padding-top:12px;border-top:1px solid #e0e0e0;display:flex;justify-content:space-between;align-items:flex-end;}
    .footer-left{font-size:10px;color:#888;line-height:1.6;}
    .firma{text-align:center;}
    .firma-linea{width:180px;border-bottom:1px solid #333;margin-bottom:4px;}
    .firma-label{font-size:9px;color:#666;}
  </style></head><body>
  <div class="header">
    <div>
      <div class="empresa-nombre">GeoAltus SPA</div>
      <div class="empresa-sub">RUT: 77.XXX.XXX-X · La Serena, Coquimbo</div>
    </div>
    <div>
      <div class="liq-titulo">Liquidación de Remuneración</div>
      <div class="liq-periodo">${h.mes}</div>
    </div>
  </div>

  <div class="datos-grid">
    <div class="dato"><span class="dato-lbl">Nombre Trabajador</span><span class="dato-val">${t.nombre}</span></div>
    <div class="dato"><span class="dato-lbl">RUT Trabajador</span><span class="dato-val">${t.rut||'Por completar'}</span></div>
    <div class="dato"><span class="dato-lbl">Cargo</span><span class="dato-val">${t.cargo}</span></div>
    <div class="dato"><span class="dato-lbl">Fecha Contrato</span><span class="dato-val">${t.fechaContrato||'—'}</span></div>
    <div class="dato"><span class="dato-lbl">AFP</span><span class="dato-val">${afpNombrePDF} (${t.afp}%)</span></div>
    <div class="dato"><span class="dato-lbl">Previsión Salud</span><span class="dato-val">${saludLblPDF} (7%)</span></div>
    <div class="dato"><span class="dato-lbl">Período Remuneración</span><span class="dato-val">${h.mes}</span></div>
    <div class="dato"><span class="dato-lbl">Fecha de Pago</span><span class="dato-val">${fechaPago}</span></div>
  </div>

  <div class="sec">Haberes</div>
  <table>
    <tr><td>Sueldo Base${h.dias<(new Date(parseInt(h.mesKey.split('-')[0]),parseInt(h.mesKey.split('-')[1])+1,0).getDate())?` (${h.dias} días trabajados)`:''}</td><td class="right" style="color:#16a34a">${fmt(h.brutoRemunerado||h.bruto)}</td></tr>
    ${h.gratVal>0?`<tr><td>Gratificación mensual</td><td class="right" style="color:#16a34a">${fmt(h.gratVal)}</td></tr>`:''}
  </table>

  <div class="sec">Descuentos Previsionales</div>
  <table>
    <tr><td>Cotización ${afpNombrePDF} (${t.afp}%)</td><td class="right" style="color:#dc2626">−${fmt(h.afpVal||0)}</td></tr>
    <tr><td>Cotización Salud ${saludLblPDF} (7%)</td><td class="right" style="color:#dc2626">−${fmt(h.saludVal||0)}</td></tr>
    ${tcPDF==='indefinido'?`<tr><td>Seguro de Cesantía trabajador (0.6%)</td><td class="right" style="color:#dc2626">−${fmt(h.cesT||0)}</td></tr>`:''}
  </table>

  <div class="sec">Impuesto a la Renta</div>
  <table>
    <tr><td>Base Imponible 2ª Categoría</td><td class="right">${fmt(h.base||0)}</td></tr>
    <tr><td>Impuesto Único de 2ª Categoría retenido</td><td class="right" style="color:#dc2626">${h.imp2>0?'−'+fmt(h.imp2):'$0 (exento)'}</td></tr>
  </table>

  <table style="margin-top:12px">
    <tr class="total-row"><td>▶ TOTAL SUELDO LÍQUIDO</td><td class="right" style="color:#16a34a">${fmt(h.liquido)}</td></tr>
  </table>

  ${h.diasLicencia>0?`<div class="aus-nota">* Este período incluye ${h.diasLicencia} día(s) con licencia médica. El subsidio por incapacidad laboral (SIL) correspondiente es pagado directamente por Fonasa.</div>`:''}

  <div class="footer">
    <div class="footer-left">
      Documento generado electrónicamente por GeoAltus SPA<br>
      ${new Date().toLocaleString('es-CL')} · Sistema GeoAltus Control
    </div>
    <div class="firma">
      <div class="firma-linea"></div>
      <div class="firma-label">GeoAltus SPA · Empleador</div>
    </div>
  </div>
  </body></html>`;
  var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(()=>w.print(),500);
}
