// // src/components/ReporteGenerator.tsx
// import React, { useState } from 'react';
// import { recopilarDatosReporte } from '..reportGenerator/reporteUtils';
// import { generarReportePDF } from '..reportGenerator/generadorPDF';
// import { generarReporteExcel } from '../utils/generadorExcel';

// interface ReporteGeneratorProps {
//   datosDelSistema: any;
//   analysisData: any;
//   nombreProducto: string;
// }

// const ReporteGenerator: React.FC<ReporteGeneratorProps> = ({
//   datosDelSistema,
//   analysisData,
//   nombreProducto
// }) => {
//   const [generando, setGenerando] = useState(false);
//   const [tipoReporte, setTipoReporte] = useState<'pdf' | 'excel' | 'completo' | null>(null);

//   // 📄 Generar PDF
//   const handleGenerarPDF = async () => {
//     try {
//       setGenerando(true);
//       setTipoReporte('pdf');
      
//       console.log('🚀 Iniciando generación de PDF...');
      
//       // Recopilar todos los datos
//       const datosReporte = recopilarDatosReporte(datosDelSistema, analysisData, nombreProducto);
      
//       // Generar PDF
//       const pdf = await generarReportePDF(datosReporte);
      
//       // Descargar
//       const nombreArchivo = `Reporte_${nombreProducto}_${new Date().toISOString().split('T')[0]}.pdf`;
//       pdf.save(nombreArchivo);
      
//       console.log('✅ PDF generado exitosamente');
      
//     } catch (error) {
//       console.error('❌ Error generando PDF:', error);
//       alert('Error al generar el PDF. Por favor, intenta de nuevo.');
//     } finally {
//       setGenerando(false);
//       setTipoReporte(null);
//     }
//   };

//   // 📊 Generar Excel
//   const handleGenerarExcel = async () => {
//     try {
//       setGenerando(true);
//       setTipoReporte('excel');
      
//       console.log('🚀 Iniciando generación de Excel...');
      
//       // Recopilar datos
//       const datosReporte = recopilarDatosReporte(datosDelSistema, analysisData, nombreProducto);
      
//       // Generar Excel
//       const workbook = generarReporteExcel(datosReporte);
      
//       // Descargar
//       const nombreArchivo = `Reporte_${nombreProducto}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
//       // Usar la función writeFile de xlsx
//       const XLSX = await import('xlsx');
//       XLSX.writeFile(workbook, nombreArchivo);
      
//       console.log('✅ Excel generado exitosamente');
      
//     } catch (error) {
//       console.error('❌ Error generando Excel:', error);
//       alert('Error al generar el Excel. Por favor, intenta de nuevo.');
//     } finally {
//       setGenerando(false);
//       setTipoReporte(null);
//     }
//   };

//   // 🚀 Generar ambos formatos
//   const handleGenerarCompleto = async () => {
//     try {
//       setGenerando(true);
//       setTipoReporte('completo');
      
//       console.log('🚀 Generando reporte completo (PDF + Excel)...');
      
//       // Generar PDF
//       await handleGenerarPDF();
      
//       // Pequeña pausa
//       await new Promise(resolve => setTimeout(resolve, 1000));
      
//       // Generar Excel
//       await handleGenerarExcel();
      
//       console.log('✅ Reporte completo generado');
      
//     } catch (error) {
//       console.error('❌ Error generando reporte completo:', error);
//       alert('Error al generar el reporte completo.');
//     } finally {
//       setGenerando(false);
//       setTipoReporte(null);
//     }
//   };

//   // 🎨 Obtener estado visual del botón
//   const getButtonState = (tipo: 'pdf' | 'excel' | 'completo') => {
//     if (!generando) return 'normal';
//     if (tipoReporte === tipo) return 'generando';
//     return 'disabled';
//   };

//   const getButtonStyle = (tipo: 'pdf' | 'excel' | 'completo') => {
//     const state = getButtonState(tipo);
    
//     const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1";
    
//     if (state === 'generando') {
//       return `${baseStyle} bg-blue-500 text-white animate-pulse cursor-wait`;
//     } else if (state === 'disabled') {
//       return `${baseStyle} bg-gray-300 text-gray-500 cursor-not-allowed`;
//     } else {
//       // Estilos específicos por tipo
//       if (tipo === 'pdf') {
//         return `${baseStyle} bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700`;
//       } else if (tipo === 'excel') {
//         return `${baseStyle} bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700`;
//       } else {
//         return `${baseStyle} bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700`;
//       }
//     }
//   };

//   const isDisabled = generando;

//   return (
//     <div className="relative bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 shadow-2xl rounded-3xl p-8 border-2 border-blue-200/30 backdrop-blur-lg overflow-hidden">
//       {/* Elementos decorativos de fondo */}
//       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl -translate-y-16 translate-x-16"></div>
//       <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-2xl translate-y-12 -translate-x-12"></div>

//       <div className="relative z-10">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="text-6xl mb-4">📋</div>
//           <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
//             Generar Reporte Completo
//           </h3>
//           <p className="text-gray-600 text-lg">
//             Exporta todo tu análisis de <span className="font-semibold text-blue-600">"{nombreProducto}"</span> en formato profesional
//           </p>
          
//           {/* Indicador de datos */}
//           <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//             {datosDelSistema?.metadatos?.backendCalculations ? (
//               <>🔄 Datos en tiempo real disponibles</>
//             ) : (
//               <>⚠️ Usando datos de demostración</>
//             )}
//           </div>
//         </div>

//         {/* Información del reporte */}
//         <div className="mb-8 bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/40 shadow-inner">
//           <h4 className="text-lg font-bold text-gray-800 mb-4">📊 El reporte incluirá:</h4>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Resumen ejecutivo con métricas clave
//               </div>
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Análisis detallado por hashtag
//               </div>
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Comparativa entre plataformas
//               </div>
//             </div>
//             <div className="space-y-2">
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Datos de ventas y tendencias
//               </div>
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Insights y recomendaciones
//               </div>
//               <div className="flex items-center text-gray-700">
//                 <span className="text-green-500 mr-2">✅</span>
//                 Contexto de noticias de mercado
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Botones de generación */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {/* Botón PDF */}
//           <button
//             onClick={handleGenerarPDF}
//             disabled={isDisabled}
//             className={getButtonStyle('pdf')}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               {getButtonState('pdf') === 'generando' ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Generando...</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-2xl">📄</span>
//                   <span>Reporte PDF</span>
//                 </>
//               )}
//             </div>
//             <div className="text-sm mt-1 opacity-90">
//               Documento ejecutivo completo
//             </div>
//           </button>

//           {/* Botón Excel */}
//           <button
//             onClick={handleGenerarExcel}
//             disabled={isDisabled}
//             className={getButtonStyle('excel')}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               {getButtonState('excel') === 'generando' ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Generando...</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-2xl">📊</span>
//                   <span>Datos Excel</span>
//                 </>
//               )}
//             </div>
//             <div className="text-sm mt-1 opacity-90">
//               Datos detallados para análisis
//             </div>
//           </button>

//           {/* Botón Completo */}
//           <button
//             onClick={handleGenerarCompleto}
//             disabled={isDisabled}
//             className={getButtonStyle('completo')}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               {getButtonState('completo') === 'generando' ? (
//                 <>
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   <span>Generando...</span>
//                 </>
//               ) : (
//                 <>
//                   <span className="text-2xl">🚀</span>
//                   <span>Pack Completo</span>
//                 </>
//               )}
//             </div>
//             <div className="text-sm mt-1 opacity-90">
//               PDF + Excel (recomendado)
//             </div>
//           </button>
//         </div>

//         {/* Estado de generación */}
//         {generando && (
//           <div className="mt-6 text-center">
//             <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800">
//               <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
//               <span className="font-medium">
//                 {tipoReporte === 'pdf' && 'Generando reporte PDF...'}
//                 {tipoReporte === 'excel' && 'Generando archivo Excel...'}
//                 {tipoReporte === 'completo' && 'Generando pack completo...'}
//               </span>
//             </div>
//           </div>
//         )}

//         {/* Footer informativo */}
//         <div className="mt-8 text-center">
//           <div className="text-sm text-gray-500">
//             📅 Fecha de análisis: {datosDelSistema?.metadatos?.timestamp ? 
//               new Date(datosDelSistema.metadatos.timestamp).toLocaleDateString('es-ES', {
//                 day: 'numeric',
//                 month: 'long',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit'
//               }) : 
//               'Tiempo real'
//             } • 
//             🔢 {datosDelSistema?.metadatos?.hashtagsOriginales?.length || 0} hashtags analizados • 
//             🎯 {datosDelSistema?.consolidacion?.insights?.length || 0} insights generados
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReporteGenerator;