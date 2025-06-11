// // src/utils/generadorPDF.ts
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { DatosReporte, formatearFechaReporte, formatearNumero, obtenerColorMetrica } from './reporteUtils';

// /**
//  * 🎯 FUNCIÓN PRINCIPAL: Genera el PDF completo del reporte
//  */
// export const generarReportePDF = async (datosReporte: DatosReporte): Promise<jsPDF> => {
//   console.log('📄 Iniciando generación de PDF...');
  
//   // Configurar PDF (formato A4)
//   const pdf = new jsPDF({
//     orientation: 'portrait',
//     unit: 'mm',
//     format: 'a4'
//   });

//   // Configuraciones base
//   const pageWidth = pdf.internal.pageSize.getWidth();
//   const pageHeight = pdf.internal.pageSize.getHeight();
//   const margin = 15;
//   const contentWidth = pageWidth - (margin * 2);

//   let currentY = margin;

//   // 📋 PÁGINA 1: PORTADA
//   await generarPortada(pdf, datosReporte, margin, pageWidth, pageHeight);
  
//   // 📊 PÁGINA 2: RESUMEN EJECUTIVO
//   pdf.addPage();
//   currentY = margin;
//   currentY = await generarResumenEjecutivo(pdf, datosReporte, margin, contentWidth, currentY);

//   // 📈 PÁGINA 3: ANÁLISIS DE HASHTAGS
//   pdf.addPage();
//   currentY = margin;
//   currentY = await generarAnalisisHashtags(pdf, datosReporte, margin, contentWidth, currentY);

//   // 💰 PÁGINA 4: ANÁLISIS DE VENTAS (si hay datos)
//   if (datosReporte.ventas && datosReporte.ventas.length > 0) {
//     pdf.addPage();
//     currentY = margin;
//     currentY = await generarAnalisisVentas(pdf, datosReporte, margin, contentWidth, currentY);
//   }

//   // 💡 PÁGINA 5: INSIGHTS Y RECOMENDACIONES
//   pdf.addPage();
//   currentY = margin;
//   currentY = await generarInsightsYRecomendaciones(pdf, datosReporte, margin, contentWidth, currentY);

//   // 📰 PÁGINA 6: CONTEXTO DE MERCADO (si hay noticias)
//   if (datosReporte.noticias && datosReporte.noticias.length > 0) {
//     pdf.addPage();
//     currentY = margin;
//     currentY = await generarContextoMercado(pdf, datosReporte, margin, contentWidth, currentY);
//   }

//   // 📋 PÁGINA FINAL: APÉNDICE CON METADATOS
//   pdf.addPage();
//   currentY = margin;
//   await generarApendice(pdf, datosReporte, margin, contentWidth, currentY);

//   console.log('✅ PDF generado exitosamente');
//   return pdf;
// };

// /**
//  * 📋 Generar página de portada
//  */
// const generarPortada = async (
//   pdf: jsPDF, 
//   datosReporte: DatosReporte, 
//   margin: number, 
//   pageWidth: number, 
//   pageHeight: number
// ) => {
//   // Título principal
//   pdf.setFontSize(28);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55); // gray-800
  
//   const tituloY = pageHeight / 3;
//   pdf.text('REPORTE DE ANÁLISIS', pageWidth / 2, tituloY, { align: 'center' });
//   pdf.text('DE REDES SOCIALES', pageWidth / 2, tituloY + 15, { align: 'center' });

//   // Nombre del producto/empresa
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'normal');
//   pdf.setTextColor(59, 130, 246); // blue-500
//   pdf.text(datosReporte.empresa, pageWidth / 2, tituloY + 35, { align: 'center' });

//   // Fecha de generación
//   pdf.setFontSize(12);
//   pdf.setTextColor(107, 114, 128); // gray-500
//   const fechaTexto = `Generado el ${formatearFechaReporte(datosReporte.fechaGeneracion)}`;
//   pdf.text(fechaTexto, pageWidth / 2, tituloY + 50, { align: 'center' });

//   // Resumen rápido en la portada
//   const resumenY = tituloY + 70;
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('RESUMEN EJECUTIVO', pageWidth / 2, resumenY, { align: 'center' });

//   // Métricas clave en la portada
//   pdf.setFontSize(11);
//   pdf.setFont('helvetica', 'normal');
  
//   const metricas = [
//     `📊 ${datosReporte.resumenEjecutivo.totalHashtags} hashtags analizados`,
//     `🏆 Mejor hashtag: ${datosReporte.resumenEjecutivo.mejorHashtag}`,
//     `🚀 Mejor plataforma: ${datosReporte.resumenEjecutivo.mejorPlataforma}`,
//     `📈 Tasa global: ${datosReporte.resumenEjecutivo.tasaInteraccionGlobal.toFixed(2)}%`,
//     `💡 ${datosReporte.insights.length} insights generados`
//   ];

//   metricas.forEach((metrica, index) => {
//     pdf.text(metrica, pageWidth / 2, resumenY + 20 + (index * 8), { align: 'center' });
//   });

//   // Footer de la portada
//   pdf.setFontSize(10);
//   pdf.setTextColor(107, 114, 128);
//   const footerY = pageHeight - 30;
//   pdf.text('Generado automáticamente por TrendHash Analytics', pageWidth / 2, footerY, { align: 'center' });
  
//   // Línea decorativa
//   pdf.setDrawColor(59, 130, 246);
//   pdf.setLineWidth(2);
//   pdf.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
// };

// /**
//  * 📊 Generar página de resumen ejecutivo
//  */
// const generarResumenEjecutivo = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('📊 RESUMEN EJECUTIVO', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 10;

//   // Información general
//   pdf.setFontSize(12);
//   pdf.setFont('helvetica', 'normal');
//   pdf.setTextColor(75, 85, 99);
  
//   const infoGeneral = [
//     `Producto/Servicio: ${datosReporte.empresa}`,
//     `Fecha de análisis: ${datosReporte.fechaAnalisis}`,
//     `Fuente de datos: ${datosReporte.metadatos.backendCalculations ? 'Cálculos en tiempo real' : 'Datos de demostración'}`,
//     `Total de posts analizados: ${datosReporte.metadatos.totalPosts.instagram + datosReporte.metadatos.totalPosts.reddit + datosReporte.metadatos.totalPosts.twitter}`
//   ];

//   infoGeneral.forEach(info => {
//     pdf.text(info, margin, currentY);
//     currentY += 7;
//   });

//   currentY += 10;

//   // Métricas principales en cajas
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('MÉTRICAS PRINCIPALES', margin, currentY);
//   currentY += 10;

//   // Crear cajas para métricas
//   const boxWidth = (contentWidth - 10) / 2;
//   const boxHeight = 25;

//   // Caja 1: Total Interacciones
//   pdf.setFillColor(239, 246, 255); // blue-50
//   pdf.rect(margin, currentY, boxWidth, boxHeight, 'F');
//   pdf.setFontSize(10);
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('Total Interacciones', margin + 5, currentY + 8);
//   pdf.setFontSize(16);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(59, 130, 246);
//   pdf.text(formatearNumero(datosReporte.metricas.totalInteracciones), margin + 5, currentY + 18);

//   // Caja 2: Engagement
//   pdf.setFillColor(236, 253, 245); // green-50
//   pdf.rect(margin + boxWidth + 10, currentY, boxWidth, boxHeight, 'F');
//   pdf.setFontSize(10);
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('Engagement Rate', margin + boxWidth + 15, currentY + 8);
//   pdf.setFontSize(16);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(34, 197, 94);
//   pdf.text(`${datosReporte.metricas.engagement.toFixed(2)}%`, margin + boxWidth + 15, currentY + 18);

//   currentY += boxHeight + 10;

//   // Caja 3: Alcance Estimado
//   pdf.setFillColor(254, 243, 199); // yellow-50
//   pdf.rect(margin, currentY, boxWidth, boxHeight, 'F');
//   pdf.setFontSize(10);
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('Alcance Estimado', margin + 5, currentY + 8);
//   pdf.setFontSize(16);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(245, 158, 11);
//   pdf.text(formatearNumero(datosReporte.metricas.alcanceEstimado), margin + 5, currentY + 18);

//   // Caja 4: Potencial Viral
//   pdf.setFillColor(250, 245, 255); // purple-50
//   pdf.rect(margin + boxWidth + 10, currentY, boxWidth, boxHeight, 'F');
//   pdf.setFontSize(10);
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('Potencial Viral', margin + boxWidth + 15, currentY + 8);
//   pdf.setFontSize(16);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(147, 51, 234);
//   pdf.text(`${datosReporte.metricas.potencialViral.toFixed(1)}%`, margin + boxWidth + 15, currentY + 18);

//   currentY += boxHeight + 15;

//   // Tendencia general
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('TENDENCIA GENERAL', margin, currentY);
//   currentY += 10;

//   pdf.setFontSize(12);
//   pdf.setFont('helvetica', 'normal');
//   const tendenciaColor = datosReporte.resumenEjecutivo.tendenciaGeneral === 'subiendo' ? [34, 197, 94] : 
//                         datosReporte.resumenEjecutivo.tendenciaGeneral === 'bajando' ? [239, 68, 68] : [107, 114, 128];
  
//   pdf.setTextColor(...tendenciaColor);
//   const iconoTendencia = datosReporte.resumenEjecutivo.tendenciaGeneral === 'subiendo' ? '📈' : 
//                         datosReporte.resumenEjecutivo.tendenciaGeneral === 'bajando' ? '📉' : '📊';
  
//   pdf.text(`${iconoTendencia} La tendencia general es: ${datosReporte.resumenEjecutivo.tendenciaGeneral.toUpperCase()}`, margin, currentY);
//   currentY += 10;

//   pdf.setTextColor(75, 85, 99);
//   pdf.text(`Tasa de interacción global: ${datosReporte.resumenEjecutivo.tasaInteraccionGlobal.toFixed(2)}%`, margin, currentY);

//   return currentY + 15;
// };

// /**
//  * 📈 Generar análisis de hashtags
//  */
// const generarAnalisisHashtags = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('📈 ANÁLISIS POR HASHTAG', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 15;

//   // Ranking de plataformas
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.text('🏆 RANKING DE PLATAFORMAS', margin, currentY);
//   currentY += 10;

//   datosReporte.rankingPlataformas.forEach((plataforma, index) => {
//     pdf.setFontSize(11);
//     pdf.setFont('helvetica', 'normal');
//     pdf.setTextColor(75, 85, 99);
    
//     const ranking = `${index + 1}. ${plataforma.emoji} ${plataforma.plataforma}`;
//     const puntuacion = `Puntuación: ${plataforma.puntuacion.toFixed(2)}`;
//     const destacado = `Hashtag destacado: ${plataforma.hashtagDestacado}`;
    
//     pdf.text(ranking, margin, currentY);
//     pdf.text(puntuacion, margin + 60, currentY);
//     pdf.text(destacado, margin + 120, currentY);
//     currentY += 8;
//   });

//   currentY += 10;

//   // Análisis detallado por hashtag
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('📋 ANÁLISIS DETALLADO', margin, currentY);
//   currentY += 10;

//   // Encabezados de tabla
//   pdf.setFontSize(9);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(75, 85, 99);
  
//   const headers = ['Hashtag', 'Mejor Plataforma', 'Puntuación', 'Instagram', 'Reddit', 'Twitter'];
//   const colWidths = [35, 30, 20, 25, 25, 25];
//   let colX = margin;
  
//   headers.forEach((header, index) => {
//     pdf.text(header, colX, currentY);
//     colX += colWidths[index];
//   });
  
//   currentY += 5;
  
//   // Línea de separación
//   pdf.setDrawColor(229, 231, 235);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 5;

//   // Datos de hashtags
//   pdf.setFont('helvetica', 'normal');
//   datosReporte.hashtagsAnalisis.forEach((hashtag) => {
//     if (currentY > 250) { // Salto de página si es necesario
//       pdf.addPage();
//       currentY = margin;
//     }

//     colX = margin;
    
//     // Hashtag
//     pdf.setTextColor(31, 41, 55);
//     pdf.text(hashtag.nombre.length > 12 ? hashtag.nombre.substring(0, 12) + '...' : hashtag.nombre, colX, currentY);
//     colX += colWidths[0];
    
//     // Mejor plataforma
//     const colorPlataforma = hashtag.mejorPlataforma === 'instagram' ? [233, 30, 99] :
//                            hashtag.mejorPlataforma === 'reddit' ? [249, 115, 22] : [59, 130, 246];
//     pdf.setTextColor(...colorPlataforma);
//     pdf.text(hashtag.mejorPlataforma, colX, currentY);
//     colX += colWidths[1];
    
//     // Puntuación
//     pdf.setTextColor(75, 85, 99);
//     pdf.text(hashtag.puntuacionGlobal.toFixed(2), colX, currentY);
//     colX += colWidths[2];
    
//     // Métricas por plataforma (simplificadas)
//     const instagramScore = (hashtag.rendimiento.instagram.interaccionPromedio + hashtag.rendimiento.instagram.viralidadPromedio) / 2;
//     const redditScore = (hashtag.rendimiento.reddit.interaccionPromedio + hashtag.rendimiento.reddit.viralidadPromedio) / 2;
//     const xScore = (hashtag.rendimiento.x.interaccionPromedio + hashtag.rendimiento.x.viralidadPromedio) / 2;
    
//     pdf.text(instagramScore.toFixed(1), colX, currentY);
//     colX += colWidths[3];
//     pdf.text(redditScore.toFixed(1), colX, currentY);
//     colX += colWidths[4];
//     pdf.text(xScore.toFixed(1), colX, currentY);
    
//     currentY += 8;
//   });

//   return currentY + 15;
// };

// /**
//  * 💰 Generar análisis de ventas
//  */
// const generarAnalisisVentas = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('💰 ANÁLISIS DE VENTAS', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 10;

//   if (!datosReporte.ventas || datosReporte.ventas.length === 0) {
//     pdf.setFontSize(12);
//     pdf.setTextColor(107, 114, 128);
//     pdf.text('No hay datos de ventas disponibles para análisis.', margin, currentY);
//     return currentY + 20;
//   }

//   // Procesar datos de ventas
//   const totalVentas = datosReporte.ventas.reduce((sum, venta) => sum + venta.units_sold, 0);
//   const promedioMensual = Math.round(totalVentas / datosReporte.ventas.length);
//   const mejorMes = datosReporte.ventas.reduce((mejor, actual) => 
//     actual.units_sold > mejor.units_sold ? actual : mejor
//   );
//   const peorMes = datosReporte.ventas.reduce((peor, actual) => 
//     actual.units_sold < peor.units_sold ? actual : peor
//   );

//   // Métricas de ventas
//   pdf.setFontSize(12);
//   pdf.setFont('helvetica', 'normal');
//   pdf.setTextColor(75, 85, 99);
  
//   const metricas = [
//     `Total de unidades vendidas: ${totalVentas.toLocaleString()}`,
//     `Promedio mensual: ${promedioMensual.toLocaleString()} unidades`,
//     `Mejor mes: ${mejorMes.month}/${mejorMes.year} (${mejorMes.units_sold.toLocaleString()} unidades)`,
//     `Período de menor venta: ${peorMes.month}/${peorMes.year} (${peorMes.units_sold.toLocaleString()} unidades)`,
//     `Número de períodos analizados: ${datosReporte.ventas.length}`
//   ];

//   metricas.forEach(metrica => {
//     pdf.text(metrica, margin, currentY);
//     currentY += 8;
//   });

//   currentY += 10;

//   // Tendencia de ventas
//   if (datosReporte.ventas.length > 1) {
//     const primeraVenta = datosReporte.ventas[0].units_sold;
//     const ultimaVenta = datosReporte.ventas[datosReporte.ventas.length - 1].units_sold;
//     const crecimiento = ((ultimaVenta - primeraVenta) / primeraVenta) * 100;
    
//     pdf.setFontSize(14);
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('TENDENCIA DE CRECIMIENTO', margin, currentY);
//     currentY += 10;
    
//     pdf.setFontSize(12);
//     pdf.setFont('helvetica', 'normal');
//     const colorCrecimiento = crecimiento > 0 ? [34, 197, 94] : crecimiento < 0 ? [239, 68, 68] : [107, 114, 128];
//     pdf.setTextColor(...colorCrecimiento);
    
//     const iconoCrecimiento = crecimiento > 0 ? '📈' : crecimiento < 0 ? '📉' : '📊';
//     pdf.text(`${iconoCrecimiento} Crecimiento total: ${crecimiento.toFixed(2)}%`, margin, currentY);
//     currentY += 8;
    
//     const proyeccionAnual = promedioMensual * 12;
//     pdf.setTextColor(75, 85, 99);
//     pdf.text(`🎯 Proyección anual: ${proyeccionAnual.toLocaleString()} unidades`, margin, currentY);
//   }

//   return currentY + 15;
// };

// /**
//  * 💡 Generar insights y recomendaciones
//  */
// const generarInsightsYRecomendaciones = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('💡 INSIGHTS Y RECOMENDACIONES', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 15;

//   // INSIGHTS
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('🔍 INSIGHTS GENERADOS', margin, currentY);
//   currentY += 10;

//   datosReporte.insights.forEach((insight, index) => {
//     if (currentY > 250) {
//       pdf.addPage();
//       currentY = margin;
//     }

//     // Icono según tipo
//     const iconos = {
//       'trending': '🚀',
//       'warning': '⚠️',
//       'opportunity': '💡',
//       'info': 'ℹ️'
//     };
//     const icono = iconos[insight.tipo as keyof typeof iconos] || '📊';

//     pdf.setFontSize(11);
//     pdf.setFont('helvetica', 'bold');
//     pdf.setTextColor(31, 41, 55);
//     pdf.text(`${icono} ${insight.titulo}`, margin, currentY);
//     currentY += 8;

//     pdf.setFontSize(10);
//     pdf.setFont('helvetica', 'normal');
//     pdf.setTextColor(75, 85, 99);
    
//     // Descripción (con wrapping básico)
//     const descripcionWords = insight.descripcion.split(' ');
//     let linea = '';
//     let maxWidth = contentWidth - 10;
    
//     for (const word of descripcionWords) {
//       const testLine = linea + word + ' ';
//       const textWidth = pdf.getTextWidth(testLine);
      
//       if (textWidth > maxWidth && linea !== '') {
//         pdf.text(linea.trim(), margin + 5, currentY);
//         currentY += 6;
//         linea = word + ' ';
//       } else {
//         linea = testLine;
//       }
//     }
    
//     if (linea.trim() !== '') {
//       pdf.text(linea.trim(), margin + 5, currentY);
//       currentY += 6;
//     }

//     // Recomendación si existe
//     if (insight.recomendacion) {
//       pdf.setTextColor(59, 130, 246);
//       pdf.text(`→ ${insight.recomendacion}`, margin + 5, currentY);
//       currentY += 6;
//     }

//     currentY += 4;
//   });

//   currentY += 10;

//   // RECOMENDACIONES
//   pdf.setFontSize(14);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('🎯 RECOMENDACIONES ESTRATÉGICAS', margin, currentY);
//   currentY += 10;

//   datosReporte.recomendaciones.forEach((recomendacion, index) => {
//     if (currentY > 250) {
//       pdf.addPage();
//       currentY = margin;
//     }

//     pdf.setFontSize(11);
//     pdf.setFont('helvetica', 'normal');
//     pdf.setTextColor(75, 85, 99);
    
//     const numeroRecom = `${index + 1}. `;
//     pdf.text(numeroRecom, margin, currentY);
    
//     // Recomendación con wrapping
//     const recomWords = recomendacion.split(' ');
//     let linea = '';
//     const maxWidth = contentWidth - 15;
//     let lineX = margin + pdf.getTextWidth(numeroRecom);
    
//     for (const word of recomWords) {
//       const testLine = linea + word + ' ';
//       const textWidth = pdf.getTextWidth(testLine);
      
//       if (textWidth > maxWidth && linea !== '') {
//         pdf.text(linea.trim(), lineX, currentY);
//         currentY += 7;
//         lineX = margin + 10; // Indentación para líneas siguientes
//         linea = word + ' ';
//       } else {
//         linea = testLine;
//       }
//     }
    
//     if (linea.trim() !== '') {
//       pdf.text(linea.trim(), lineX, currentY);
//     }
    
//     currentY += 10;
//   });

//   return currentY + 15;
// };

// /**
//  * 📰 Generar contexto de mercado
//  */
// const generarContextoMercado = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('📰 CONTEXTO DE MERCADO', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 15;

//   if (!datosReporte.noticias || datosReporte.noticias.length === 0) {
//     pdf.setFontSize(12);
//     pdf.setTextColor(107, 114, 128);
//     pdf.text('No se encontraron noticias relevantes para el análisis.', margin, currentY);
//     return currentY + 20;
//   }

//   datosReporte.noticias.forEach((noticia, index) => {
//     if (currentY > 230) {
//       pdf.addPage();
//       currentY = margin;
//     }

//     // Título de la noticia
//     pdf.setFontSize(12);
//     pdf.setFont('helvetica', 'bold');
//     pdf.setTextColor(31, 41, 55);
//     const tituloNoticia = `${index + 1}. ${noticia.title}`;
    
//     // Título con wrapping
//     const tituloWords = tituloNoticia.split(' ');
//     let lineaTitulo = '';
    
//     for (const word of tituloWords) {
//       const testLine = lineaTitulo + word + ' ';
//       const textWidth = pdf.getTextWidth(testLine);
      
//       if (textWidth > contentWidth && lineaTitulo !== '') {
//         pdf.text(lineaTitulo.trim(), margin, currentY);
//         currentY += 8;
//         lineaTitulo = word + ' ';
//       } else {
//         lineaTitulo = testLine;
//       }
//     }
    
//     if (lineaTitulo.trim() !== '') {
//       pdf.text(lineaTitulo.trim(), margin, currentY);
//       currentY += 8;
//     }

//     // Descripción
//     pdf.setFontSize(10);
//     pdf.setFont('helvetica', 'normal');
//     pdf.setTextColor(75, 85, 99);
    
//     const descWords = noticia.description.split(' ');
//     let lineaDesc = '';
    
//     for (const word of descWords) {
//       const testLine = lineaDesc + word + ' ';
//       const textWidth = pdf.getTextWidth(testLine);
      
//       if (textWidth > contentWidth && lineaDesc !== '') {
//         pdf.text(lineaDesc.trim(), margin + 5, currentY);
//         currentY += 6;
//         lineaDesc = word + ' ';
//       } else {
//         lineaDesc = testLine;
//       }
//     }
    
//     if (lineaDesc.trim() !== '') {
//       pdf.text(lineaDesc.trim(), margin + 5, currentY);
//       currentY += 6;
//     }

//     // Keywords
//     if (noticia.keywords && noticia.keywords.length > 0) {
//       pdf.setFontSize(9);
//       pdf.setTextColor(107, 114, 128);
//       const keywordsText = `Keywords: ${noticia.keywords.join(', ')}`;
//       pdf.text(keywordsText, margin + 5, currentY);
//       currentY += 6;
//     }

//     // URL (truncada si es muy larga)
//     pdf.setTextColor(59, 130, 246);
//     const urlTexto = noticia.url.length > 60 ? noticia.url.substring(0, 57) + '...' : noticia.url;
//     pdf.text(`🔗 ${urlTexto}`, margin + 5, currentY);
//     currentY += 12;
//   });

//   return currentY + 15;
// };

// /**
//  * 📋 Generar apéndice con metadatos
//  */
// const generarApendice = async (
//   pdf: jsPDF,
//   datosReporte: DatosReporte,
//   margin: number,
//   contentWidth: number,
//   startY: number
// ): Promise<number> => {
//   let currentY = startY;

//   // Título de la sección
//   pdf.setFontSize(20);
//   pdf.setFont('helvetica', 'bold');
//   pdf.setTextColor(31, 41, 55);
//   pdf.text('📋 APÉNDICE - INFORMACIÓN TÉCNICA', margin, currentY);
//   currentY += 15;

//   // Línea separadora
//   pdf.setDrawColor(229, 231, 235);
//   pdf.setLineWidth(0.5);
//   pdf.line(margin, currentY, margin + contentWidth, currentY);
//   currentY += 15;

//   // Metadatos técnicos
//   pdf.setFontSize(12);
//   pdf.setFont('helvetica', 'normal');
//   pdf.setTextColor(75, 85, 99);

//   const metadatos = [
//     `Fecha de análisis original: ${datosReporte.metadatos.timestamp}`,
//     `Fuente de datos: ${datosReporte.metadatos.fuente}`,
//     `Cálculos del backend: ${datosReporte.metadatos.backendCalculations ? 'Sí' : 'No'}`,
//     `Query original: ${datosReporte.metadatos.sentence}`,
//     `Total de posts analizados:`,
//     `  • Instagram: ${datosReporte.metadatos.totalPosts.instagram}`,
//     `  • Reddit: ${datosReporte.metadatos.totalPosts.reddit}`,
//     `  • Twitter: ${datosReporte.metadatos.totalPosts.twitter}`,
//     '',
//     'Hashtags analizados:'
//   ];

//   metadatos.forEach(metadato => {
//     pdf.text(metadato, margin, currentY);
//     currentY += 7;
//   });

//   // Lista de hashtags
//   datosReporte.metadatos.hashtagsOriginales.forEach((hashtag, index) => {
//     pdf.text(`  ${index + 1}. ${hashtag}`, margin, currentY);
//     currentY += 6;
//   });

//   currentY += 10;

//   // Información de calculated_results si está disponible
//   if (datosReporte.calculated_results) {
//     pdf.setFontSize(12);
//     pdf.setFont('helvetica', 'bold');
//     pdf.text('CÁLCULOS DEL BACKEND:', margin, currentY);
//     currentY += 8;

//     pdf.setFont('helvetica', 'normal');
//     pdf.text(`Fuente: ${datosReporte.calculated_results.data_source}`, margin, currentY);
//     currentY += 7;
//     pdf.text(`Total de hashtags procesados: ${datosReporte.calculated_results.total_hashtags}`, margin, currentY);
//     currentY += 7;
//     pdf.text(`Algoritmos utilizados: ${datosReporte.calculated_results.formulas_used?.join(', ') || 'No especificado'}`, margin, currentY);
//     currentY += 10;
//   }

//   // Footer del documento
//   pdf.setFontSize(10);
//   pdf.setTextColor(107, 114, 128);
//   pdf.text('Este reporte fue generado automáticamente por TrendHash Analytics', margin, currentY);
//   currentY += 6;
//   pdf.text(`Generado el: ${formatearFechaReporte(datosReporte.fechaGeneracion)}`, margin, currentY);
//   currentY += 6;
//   pdf.text('Para más información, contacte al equipo de análisis.', margin, currentY);

//   return currentY;
// };