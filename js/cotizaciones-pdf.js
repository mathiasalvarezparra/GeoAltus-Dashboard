
// ══════════════════════════════════════════
//  PDF COTIZACIÓN — documento profesional
// ══════════════════════════════════════════
function generarPDFCotizacion(id){
  var c=cotizaciones.find(x=>x.id===id);
  if(!c)return;
  var html=`<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
  <title>Cotización ${c.numero} — GeoAltus</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;color:#1e293b;background:#fff;padding:0;}
    .page{max-width:210mm;margin:0 auto;padding:28px 32px;}
    /* HEADER */
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #1e293b;margin-bottom:24px;}
    .logo-wrap{display:flex;align-items:center;gap:12px;}
    .logo-box{width:46px;height:46px;background:linear-gradient(135deg,#e9b949,#b8880e);border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:16px;color:#000;letter-spacing:-0.5px;}
    .empresa-nombre{font-size:20px;font-weight:800;color:#1e293b;letter-spacing:-0.3px;}
    .empresa-sub{font-size:10px;color:#64748b;margin-top:2px;}
    .empresa-datos{font-size:9px;color:#94a3b8;margin-top:6px;line-height:1.6;}
    .doc-info{text-align:right;}
    .doc-tipo{font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px;}
    .doc-num{font-size:13px;font-family:monospace;color:#e9b949;font-weight:700;margin-top:2px;}
    .doc-fecha{font-size:10px;color:#64748b;margin-top:4px;}
    /* CLIENTE */
    .seccion-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px;}
    .seccion-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 16px;}
    .seccion-titulo{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px;}
    .seccion-fila{display:flex;justify-content:space-between;font-size:10px;padding:3px 0;border-bottom:1px solid #f1f5f9;}
    .seccion-fila:last-child{border-bottom:none;}
    .sf-label{color:#64748b;}
    .sf-val{font-weight:600;color:#1e293b;}
    /* ITEMS TABLE */
    .tabla-titulo{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px;}
    table{width:100%;border-collapse:collapse;margin-bottom:6px;}
    .th{background:#1e293b;color:#fff;padding:8px 10px;text-align:left;font-size:9px;text-transform:uppercase;letter-spacing:.8px;}
    .th:last-child{text-align:right;}
    td{padding:9px 10px;font-size:10px;border-bottom:1px solid #f1f5f9;}
    tr:nth-child(even) td{background:#fafbfc;}
    .td-right{text-align:right;font-family:monospace;font-weight:600;}
    .td-num{color:#64748b;font-family:monospace;}
    /* TOTALES */
    .totales-wrap{display:flex;justify-content:flex-end;margin-bottom:24px;}
    .totales-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;min-width:240px;}
    .tot-row{display:flex;justify-content:space-between;font-size:11px;padding:4px 0;}
    .tot-lbl{color:#64748b;}
    .tot-val{font-family:monospace;font-weight:600;}
    .tot-final{border-top:2px solid #1e293b;margin-top:8px;padding-top:10px;}
    .tot-final .tot-lbl{font-weight:800;font-size:13px;color:#1e293b;}
    .tot-final .tot-val{font-weight:900;font-size:15px;color:#e9b949;}
    /* NOTAS */
    .notas-box{background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:14px 16px;margin-bottom:20px;}
    .notas-titulo{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#92400e;margin-bottom:8px;}
    .notas-texto{font-size:10px;color:#78350f;line-height:1.7;white-space:pre-wrap;}
    /* FOOTER */
    .footer{border-top:1px solid #e2e8f0;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end;}
    .footer-izq{font-size:9px;color:#94a3b8;line-height:1.7;}
    .firma-box{text-align:center;}
    .firma-linea{width:180px;border-top:1px solid #1e293b;margin-bottom:6px;}
    .firma-lbl{font-size:9px;color:#64748b;}
    .firma-nombre{font-size:10px;font-weight:700;}
    .vigencia-badge{display:inline-block;background:#dbeafe;color:#1d4ed8;border-radius:20px;padding:3px 10px;font-size:9px;font-weight:700;letter-spacing:.5px;}
    @media print{body{padding:0;}@page{margin:1.5cm;size:A4;}}
  </style></head><body><div class="page">
  <div class="header">
    <div class="logo-wrap">
      <div class="logo-box">GA</div>
      <div>
        <div class="empresa-nombre">GeoAltus SPA</div>
        <div class="empresa-sub">Servicios de Geomática y Teledetección</div>
        <div class="empresa-datos">La Serena, Región de Coquimbo · Chile<br>mathias.alvarez@geoaltus.cl</div>
      </div>
    </div>
    <div class="doc-info">
      <div class="doc-tipo">COTIZACIÓN</div>
      <div class="doc-num">${c.numero}</div>
      <div class="doc-fecha">Emitida: ${c.fechaEmision}</div>
      <div class="doc-fecha" style="margin-top:4px"><span class="vigencia-badge">Válida hasta: ${c.fechaVencimiento}</span></div>
    </div>
  </div>

  <div class="seccion-grid">
    <div class="seccion-box">
      <div class="seccion-titulo">Cliente</div>
      <div class="seccion-fila"><span class="sf-label">Razón Social</span><span class="sf-val">${c.cliNombre}</span></div>
      ${c.cliRut?`<div class="seccion-fila"><span class="sf-label">RUT</span><span class="sf-val">${c.cliRut}</span></div>`:''}
    </div>
    <div class="seccion-box">
      <div class="seccion-titulo">Condiciones</div>
      <div class="seccion-fila"><span class="sf-label">Condición de pago</span><span class="sf-val">${c.condPago}</span></div>
      <div class="seccion-fila"><span class="sf-label">Tipo de documento</span><span class="sf-val">${c.ivaTipo==='afecto'?'Afecto IVA (19%)':'Exento de IVA'}</span></div>
      <div class="seccion-fila"><span class="sf-label">Vigencia cotización</span><span class="sf-val">${c.vigencia} días</span></div>
    </div>
  </div>

  <div class="tabla-titulo">Detalle de Servicios — ${c.proyecto}</div>
  <table>
    <thead><tr>
      <th class="th" style="width:45%">Descripción</th>
      <th class="th" style="width:10%">Unid.</th>
      <th class="th" style="width:10%;text-align:right">Cant.</th>
      <th class="th" style="width:17%;text-align:right">P. Unitario</th>
      <th class="th" style="width:18%;text-align:right">Total</th>
    </tr></thead>
    <tbody>
      ${c.items.map((item,i)=>`<tr>
        <td>${item.desc}</td>
        <td class="td-num">${item.unidad}</td>
        <td class="td-right td-num">${item.cantidad}</td>
        <td class="td-right">${fmt(item.precioUnit)}</td>
        <td class="td-right" style="color:#e9b949;font-weight:700">${fmt(item.cantidad*item.precioUnit)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totales-wrap">
    <div class="totales-box">
      <div class="tot-row"><span class="tot-lbl">Subtotal neto</span><span class="tot-val">${fmt(c.subtotal)}</span></div>
      ${c.descMonto>0?`<div class="tot-row"><span class="tot-lbl" style="color:#16a34a">Descuento (${c.descPct}%)</span><span class="tot-val" style="color:#16a34a">− ${fmt(c.descMonto)}</span></div><div class="tot-row"><span class="tot-lbl">Subtotal c/descuento</span><span class="tot-val">${fmt(c.subtotalConDesc)}</span></div>`:''}
      ${c.ivaTipo==='afecto'?`<div class="tot-row"><span class="tot-lbl">IVA (19%)</span><span class="tot-val">${fmt(c.iva)}</span></div>`:'<div class="tot-row"><span class="tot-lbl">IVA</span><span class="tot-val">Exento</span></div>'}
      <div class="tot-row tot-final"><span class="tot-lbl">TOTAL</span><span class="tot-val">${fmt(c.total)}</span></div>
    </div>
  </div>

  ${c.notas?`<div class="notas-box"><div class="notas-titulo">Alcance y Condiciones</div><div class="notas-texto">${c.notas}</div></div>`:''}

  <div class="footer">
    <div class="footer-izq">
      GeoAltus SPA · Servicios de Geomática<br>
      La Serena, Coquimbo · Chile<br>
      Documento generado el ${new Date().toLocaleDateString('es-CL')}
    </div>
    <div class="firma-box">
      <div class="firma-linea"></div>
      <div class="firma-nombre">Mathias F. Álvarez Parra</div>
      <div class="firma-lbl">Geomensor · GeoAltus SPA</div>
    </div>
  </div>
</div></body></html>`;
  var w=window.open('','_blank');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>w.print(),600);
}
