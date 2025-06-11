// /**
//  * 🔢 Generar hoja de datos raw para análisis avanzado
//  */
// const generarHojaDatosRaw = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const data: any[][] = [
//     ['METADATOS TÉCNICOS'],
//     [''],
//     ['Timestamp Original:', datosReporte.metadatos.timestamp],
//     ['Fuente de Datos:', datosReporte.metadatos.fuente],
//     ['Cálculos Backend:', datosReporte.metadatos.backendCalculations ? 'Sí' : 'No'],
//     ['Query Original:', datosReporte.metadatos.sentence],
//     [''],
//     ['HASHTAGS ORIGINALES'],
//     ['']
//   ];

//   Lista de hashtags originales
//   data.push(['No.', 'Hashtag']);
//   datosReporte.metadatos.hashtagsOriginales.forEach((hashtag, index) => {
//     data.push([index + 1, hashtag]);
//   });

//   Datos de calculated_results si están disponibles
//   if (datosReporte.calculated_results) {
//     data.push(['']);
//     data.push(['CÁLCULOS DEL BACKEND']);
//     data.push(['']);
//     src/utils/generadorExcel.ts
// import * as XLSX from 'xlsx';
// import { DatosReporte, formatearFechaReporte } from './reporteUtils';

// /**
//  * 🎯 FUNCIÓN PRINCIPAL: Genera el archivo Excel completo del reporte
//  */
// export const generarReporteExcel = (datosReporte: DatosReporte): XLSX.WorkBook => {
//   console.log('📊 Iniciando generación de Excel...');
  
//   Crear nuevo workbook
//   const workbook = XLSX.utils.book_new();

//   📋 HOJA 1: RESUMEN EJECUTIVO
//   const hojaResumen = generarHojaResumen(datosReporte);
//   XLSX.utils.book_append_sheet(workbook, hojaResumen, 'Resumen Ejecutivo');

//   📈 HOJA 2: ANÁLISIS DE HASHTAGS
//   const hojaHashtags = generarHojaHashtags(datosReporte);
//   XLSX.utils.book_append_sheet(workbook, hojaHashtags, 'Análisis Hashtags');

//   🏆 HOJA 3: RANKING DE PLATAFORMAS
//   const hojaPlataformas = generarHojaPlataformas(datosReporte);
//   XLSX.utils.book_append_sheet(workbook, hojaPlataformas, 'Ranking Plataformas');

//   💰 HOJA 4: DATOS DE VENTAS (si existen)
//   if (datosReporte.ventas && datosReporte.ventas.length > 0) {
//     const hojaVentas = generarHojaVentas(datosReporte);
//     XLSX.utils.book_append_sheet(workbook, hojaVentas, 'Datos Ventas');
//   }

//   💡 HOJA 5: INSIGHTS Y RECOMENDACIONES
//   const hojaInsights = generarHojaInsights(datosReporte);
//   XLSX.utils.book_append_sheet(workbook, hojaInsights, 'Insights');

//   📰 HOJA 6: NOTICIAS (si existen)
//   if (datosReporte.noticias && datosReporte.noticias.length > 0) {
//     const hojaNoticias = generarHojaNoticias(datosReporte);
//     XLSX.utils.book_append_sheet(workbook, hojaNoticias, 'Noticias');
//   }

//   🔢 HOJA 7: DATOS RAW (para análisis avanzado)
//   const hojaRaw = generarHojaDatosRaw(datosReporte);
//   XLSX.utils.book_append_sheet(workbook, hojaRaw, 'Datos Raw');

//   console.log('✅ Excel generado exitosamente');
//   return workbook;
// };

// /**
//  * 📋 Generar hoja de resumen ejecutivo
//  */
// const generarHojaResumen = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const data = [
//     ['REPORTE DE ANÁLISIS DE REDES SOCIALES'],
//     [''],
//     ['Información General'],
//     ['Producto/Servicio:', datosReporte.empresa],
//     ['Fecha de Generación:', formatearFechaReporte(datosReporte.fechaGeneracion)],
//     ['Fecha de Análisis:', datosReporte.fechaAnalisis],
//     ['Fuente de Datos:', datosReporte.metadatos.backendCalculations ? 'Cálculos en Tiempo Real' : 'Datos de Demostración'],
//     [''],
//     ['Métricas Principales'],
//     ['Total de Hashtags:', datosReporte.resumenEjecutivo.totalHashtags],
//     ['Mejor Hashtag:', datosReporte.resumenEjecutivo.mejorHashtag],
//     ['Mejor Plataforma:', datosReporte.resumenEjecutivo.mejorPlataforma],
//     ['Tasa Interacción Global:', `${datosReporte.resumenEjecutivo.tasaInteraccionGlobal.toFixed(2)}%`],
//     ['Tendencia General:', datosReporte.resumenEjecutivo.tendenciaGeneral],
//     [''],
//     ['Métricas de Alcance'],
//     ['Total Interacciones:', datosReporte.metricas.totalInteracciones.toLocaleString()],
//     ['Alcance Estimado:', datosReporte.metricas.alcanceEstimado.toLocaleString()],
//     ['Engagement Rate:', `${datosReporte.metricas.engagement.toFixed(2)}%`],
//     ['Potencial Viral:', `${datosReporte.metricas.potencialViral.toFixed(1)}%`],
//     [''],
//     ['Distribución de Posts Analizados'],
//     ['Instagram:', datosReporte.metadatos.totalPosts.instagram],
//     ['Reddit:', datosReporte.metadatos.totalPosts.reddit],
//     ['Twitter:', datosReporte.metadatos.totalPosts.twitter],
//     ['Total:', datosReporte.metadatos.totalPosts.instagram + datosReporte.metadatos.totalPosts.reddit + datosReporte.metadatos.totalPosts.twitter],
//     [''],
//     ['Insights Generados'],
//     ['Total de Insights:', datosReporte.insights.length],
//     ['Total de Recomendaciones:', datosReporte.recomendaciones.length],
//     ['Noticias Relevantes:', datosReporte.noticias.length]
//   ];

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Aplicar estilos básicos (anchos de columna)
//   worksheet['!cols'] = [
//     { width: 30 }, // Columna A
//     { width: 25 }  // Columna B
//   ];

//   return worksheet;
// };

// /**
//  * 📈 Generar hoja de análisis de hashtags
//  */
// const generarHojaHashtags = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const headers = [
//     'Hashtag',
//     'ID',
//     'Mejor Plataforma',
//     'Puntuación Global',
//     'Instagram - Interacción',
//     'Instagram - Viralidad',
//     'Instagram - Total Likes',
//     'Instagram - Total Comentarios',
//     'Reddit - Interacción',
//     'Reddit - Viralidad',
//     'Reddit - Total UpVotes',
//     'Reddit - Total Comentarios',
//     'Twitter - Interacción',
//     'Twitter - Viralidad',
//     'Twitter - Total Likes',
//     'Twitter - Total Repost'
//   ];

//   const data: any[][] = [headers];

//   datosReporte.hashtagsAnalisis.forEach(hashtag => {
//     const row = [
//       hashtag.nombre,
//       hashtag.id,
//       hashtag.mejorPlataforma,
//       parseFloat(hashtag.puntuacionGlobal.toFixed(2)),
//       parseFloat(hashtag.rendimiento.instagram.interaccionPromedio.toFixed(2)),
//       parseFloat(hashtag.rendimiento.instagram.viralidadPromedio.toFixed(2)),
//       hashtag.rendimiento.instagram.totalLikes || 0,
//       hashtag.rendimiento.instagram.totalComentarios || 0,
//       parseFloat(hashtag.rendimiento.reddit.interaccionPromedio.toFixed(2)),
//       parseFloat(hashtag.rendimiento.reddit.viralidadPromedio.toFixed(2)),
//       hashtag.rendimiento.reddit.totalUpVotes || 0,
//       hashtag.rendimiento.reddit.totalComentarios || 0,
//       parseFloat(hashtag.rendimiento.x.interaccionPromedio.toFixed(2)),
//       parseFloat(hashtag.rendimiento.x.viralidadPromedio.toFixed(2)),
//       hashtag.rendimiento.x.totalLikes || 0,
//       hashtag.rendimiento.x.totalRepost || 0
//     ];
//     data.push(row);
//   });

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = Array(headers.length).fill({ width: 15 });

//   return worksheet;
// };

// /**
//  * 🏆 Generar hoja de ranking de plataformas
//  */
// const generarHojaPlataformas = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const headers = [
//     'Posición',
//     'Plataforma',
//     'Puntuación',
//     'Hashtag Destacado',
//     'Fortalezas',
//     'Debilidades'
//   ];

//   const data: any[][] = [headers];

//   datosReporte.rankingPlataformas.forEach((plataforma, index) => {
//     const row = [
//       index + 1,
//       plataforma.plataforma,
//       parseFloat(plataforma.puntuacion.toFixed(2)),
//       plataforma.hashtagDestacado,
//       plataforma.fortalezas.join(', '),
//       plataforma.debilidades.join(', ')
//     ];
//     data.push(row);
//   });

//   Agregar análisis adicional
//   data.push(['']); // Fila vacía
//   data.push(['ANÁLISIS COMPARATIVO']);
//   data.push(['']);

//   if (datosReporte.rankingPlataformas.length > 0) {
//     const mejorPlataforma = datosReporte.rankingPlataformas[0];
//     const peorPlataforma = datosReporte.rankingPlataformas[datosReporte.rankingPlataformas.length - 1];
    
//     data.push(['Mejor Plataforma:', mejorPlataforma.plataforma]);
//     data.push(['Puntuación Máxima:', mejorPlataforma.puntuacion.toFixed(2)]);
//     data.push(['Plataforma con Menor Rendimiento:', peorPlataforma.plataforma]);
//     data.push(['Puntuación Mínima:', peorPlataforma.puntuacion.toFixed(2)]);
//     data.push(['Diferencia:', (mejorPlataforma.puntuacion - peorPlataforma.puntuacion).toFixed(2)]);
//   }

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = [
//     { width: 10 }, // Posición
//     { width: 15 }, // Plataforma
//     { width: 12 }, // Puntuación
//     { width: 20 }, // Hashtag Destacado
//     { width: 30 }, // Fortalezas
//     { width: 30 }  // Debilidades
//   ];

//   return worksheet;
// };

// /**
//  * 💰 Generar hoja de datos de ventas
//  */
// const generarHojaVentas = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const headers = [
//     'ID',
//     'Mes',
//     'Año',
//     'Unidades Vendidas',
//     'Resource ID',
//     'Período'
//   ];

//   const data = [headers];

//   Datos de ventas
//   datosReporte.ventas.forEach(venta => {
//     const nombresMeses = [
//       'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
//       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
//     ];
    
//     const nombreMes = nombresMeses[venta.month - 1] || `Mes ${venta.month}`;
//     const periodo = `${nombreMes} ${venta.year}`;

//     const row: (string | number)[] = [
//       venta.id,
//       venta.month,
//       venta.year,
//       venta.units_sold,
//       venta.resource_id,
//       periodo
//     ];
//     data.push(row);
//   });

//   Estadísticas de ventas
//   if (datosReporte.ventas.length > 0) {
//     const totalVentas = datosReporte.ventas.reduce((sum, venta) => sum + venta.units_sold, 0);
//     const promedioMensual = Math.round(totalVentas / datosReporte.ventas.length);
//     const mejorMes = datosReporte.ventas.reduce((mejor, actual) => 
//       actual.units_sold > mejor.units_sold ? actual : mejor
//     );
//     const peorMes = datosReporte.ventas.reduce((peor, actual) => 
//       actual.units_sold < peor.units_sold ? actual : peor
//     );

//     data.push(['']); // Fila vacía
//     data.push(['ESTADÍSTICAS DE VENTAS']);
//     data.push(['']);
//     data.push(['Total de Unidades Vendidas:', totalVentas]);
//     data.push(['Promedio Mensual:', promedioMensual]);
//     data.push(['Mejor Mes:', `${mejorMes.month}/${mejorMes.year}`]);
//     data.push(['Mejor Venta:', mejorMes.units_sold]);
//     data.push(['Mes de Menor Venta:', `${peorMes.month}/${peorMes.year}`]);
//     data.push(['Menor Venta:', peorMes.units_sold]);
//     data.push(['Rango de Ventas:', mejorMes.units_sold - peorMes.units_sold]);
//     data.push(['Períodos Analizados:', datosReporte.ventas.length]);

//     Cálculo de tendencia
//     if (datosReporte.ventas.length > 1) {
//       const primeraVenta = datosReporte.ventas[0].units_sold;
//       const ultimaVenta = datosReporte.ventas[datosReporte.ventas.length - 1].units_sold;
//       const crecimiento = ((ultimaVenta - primeraVenta) / primeraVenta) * 100;
      
//       data.push(['Crecimiento Total (%):', crecimiento.toFixed(2)]);
//       data.push(['Proyección Anual:', promedioMensual * 12]);
//     }
//   }

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = [
//     { width: 8 },  // ID
//     { width: 6 },  // Mes
//     { width: 8 },  // Año
//     { width: 18 }, // Unidades Vendidas
//     { width: 12 }, // Resource ID
//     { width: 20 }  // Período
//   ];

//   return worksheet;
// };

// /**
//  * 💡 Generar hoja de insights y recomendaciones
//  */
// const generarHojaInsights = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const data: any[][] = [
//     ['INSIGHTS GENERADOS'],
//     [''],
//     ['Tipo', 'Título', 'Descripción', 'Hashtag', 'Plataforma', 'Valor', 'Recomendación']
//   ];

//   Agregar insights
//   datosReporte.insights.forEach(insight => {
//     const row = [
//       insight.tipo,
//       insight.titulo,
//       insight.descripcion,
//       insight.hashtag || '',
//       insight.plataforma || '',
//       insight.valor || '',
//       insight.recomendacion || ''
//     ];
//     data.push(row);
//   });

//   Espacio y recomendaciones
//   data.push(['']);
//   data.push(['RECOMENDACIONES ESTRATÉGICAS']);
//   data.push(['']);
//   data.push(['No.', 'Recomendación']);

//   datosReporte.recomendaciones.forEach((recomendacion, index) => {
//     data.push([index + 1, recomendacion]);
//   });

//   Estadísticas de insights
//   data.push(['']);
//   data.push(['ESTADÍSTICAS DE INSIGHTS']);
//   data.push(['']);
  
//   const tiposInsights = datosReporte.insights.reduce((acc, insight) => {
//     acc[insight.tipo] = (acc[insight.tipo] || 0) + 1;
//     return acc;
//   }, {} as Record<string, number>);

//   Object.entries(tiposInsights).forEach(([tipo, cantidad]) => {
//     data.push([`Insights tipo "${tipo}":`, cantidad]);
//   });

//   data.push(['Total de Insights:', datosReporte.insights.length]);
//   data.push(['Total de Recomendaciones:', datosReporte.recomendaciones.length]);

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = [
//     { width: 12 }, // Tipo/No.
//     { width: 25 }, // Título/Recomendación
//     { width: 50 }, // Descripción
//     { width: 15 }, // Hashtag
//     { width: 15 }, // Plataforma
//     { width: 10 }, // Valor
//     { width: 40 }  // Recomendación
//   ];

//   return worksheet;
// };

// /**
//  * 📰 Generar hoja de noticias
//  */
// const generarHojaNoticias = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const headers = [
//     'No.',
//     'Título',
//     'Descripción',
//     'URL',
//     'Keywords',
//     'Cantidad de Keywords'
//   ];

//   const data: any[][] = [headers];

//   datosReporte.noticias.forEach((noticia, index) => {
//     const row = [
//       index + 1,
//       noticia.title,
//       noticia.description,
//       noticia.url,
//       noticia.keywords.join(', '),
//       noticia.keywords.length
//     ];
//     data.push(row);
//   });

//   Análisis de keywords
//   data.push(['']);
//   data.push(['ANÁLISIS DE KEYWORDS']);
//   data.push(['']);

//   Contar frecuencia de keywords
//   const keywordFrequency = datosReporte.noticias
//     .flatMap(noticia => noticia.keywords)
//     .reduce((acc, keyword) => {
//       acc[keyword] = (acc[keyword] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);

//   Ordenar keywords por frecuencia
//   const sortedKeywords = Object.entries(keywordFrequency)
//     .sort(([,a], [,b]) => b - a)
//     .slice(0, 10); // Top 10

//   data.push(['Keyword', 'Frecuencia']);
//   sortedKeywords.forEach(([keyword, freq]) => {
//     data.push([keyword, freq]);
//   });

//   data.push(['']);
//   data.push(['ESTADÍSTICAS']);
//   data.push(['Total de Noticias:', datosReporte.noticias.length]);
//   data.push(['Total de Keywords Únicas:', Object.keys(keywordFrequency).length]);
//   data.push(['Promedio de Keywords por Noticia:', (Object.values(keywordFrequency).reduce((a, b) => a + b, 0) / datosReporte.noticias.length).toFixed(2)]);

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = [
//     { width: 6 },  // No.
//     { width: 40 }, // Título
//     { width: 60 }, // Descripción
//     { width: 50 }, // URL
//     { width: 40 }, // Keywords
//     { width: 18 }  // Cantidad de Keywords
//   ];

//   return worksheet;
// };

// /**
//  * 🔢 Generar hoja de datos raw para análisis avanzado
//  */
// const generarHojaDatosRaw = (datosReporte: DatosReporte): XLSX.WorkSheet => {
//   const data = [
//     ['METADATOS TÉCNICOS'],
//     [''],
//     ['Timestamp Original:', datosReporte.metadatos.timestamp],
//     ['Fuente de Datos:', datosReporte.metadatos.fuente],
//     ['Cálculos Backend:', datosReporte.metadatos.backendCalculations ? 'Sí' : 'No'],
//     ['Query Original:', datosReporte.metadatos.sentence],
//     [''],
//     ['HASHTAGS ORIGINALES'],
//     ['']
//   ];

//   Lista de hashtags originales
//   data.push(['No.', 'Hashtag']);
//   datosReporte.metadatos.hashtagsOriginales.forEach((hashtag, index) => {
//     data.push([index + 1, hashtag]);
//   });

//   Datos de calculated_results si están disponibles
//   if (datosReporte.calculated_results) {
//     data.push(['']);
//     data.push(['CÁLCULOS DEL BACKEND']);
//     data.push(['']);
//     data.push(['Fuente:', datosReporte.calculated_results.data_source]);
//     data.push(['Total Hashtags Procesados:', datosReporte.calculated_results.total_hashtags]);
    
//     data.push(['']);
//     data.push(['MÉTRICAS CALCULADAS POR EL BACKEND']);
//     data.push(['']);
//     data.push([
//       'Hashtag',
//       'Instagram Interacción',
//       'Instagram Viralidad',
//       'Reddit Interacción',
//       'Reddit Viralidad',
//       'Twitter Interacción',
//       'Twitter Viralidad'
//     ]);

//     datosReporte.calculated_results.hashtags.forEach(hashtag => {
//       data.push([
//         hashtag.name,
//         hashtag.instagram_interaction.toFixed(4),
//         hashtag.instagram_virality.toFixed(4),
//         hashtag.reddit_interaction.toFixed(4),
//         hashtag.reddit_virality.toFixed(4),
//         hashtag.twitter_interaction.toFixed(4),
//         hashtag.twitter_virality.toFixed(4)
//       ]);
//     });
//   }

//   Información de generación del reporte
//   data.push(['']);
//   data.push(['INFORMACIÓN DEL REPORTE']);
//   data.push(['']);
//   data.push(['Fecha de Generación:', formatearFechaReporte(datosReporte.fechaGeneracion)]);
//   data.push(['Empresa/Producto:', datosReporte.empresa]);
//   data.push(['Total de Hojas Generadas:', '6-7']);
//   data.push(['Versión del Generador:', '1.0']);

//   const worksheet = XLSX.utils.aoa_to_sheet(data);

//   Configurar anchos de columna
//   worksheet['!cols'] = [
//     { width: 25 }, // Etiquetas
//     { width: 30 }, // Valores
//     { width: 15 }, // Datos adicionales
//     { width: 15 },
//     { width: 15 },
//     { width: 15 },
//     { width: 15 }
//   ];

//   return worksheet;
// };