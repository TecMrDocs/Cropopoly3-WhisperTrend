// pruebaCompleta.ts
// 🧪 PRUEBA COMPLETA DEL SISTEMA INTEGRADO

import { crearConDatosPrueba } from './DescargaDatos';
import { procesarParaDashboard } from './ConsolidacionDatos';

async function probarSistemaCompleto() {
  console.log('🚀 ========================================');
  console.log('🧪 INICIANDO PRUEBA DEL SISTEMA COMPLETO');
  console.log('🚀 ========================================');
  
  try {
    // PASO 1: Cargar datos con DescargaDatos
    console.log('\n📡 PASO 1: Cargando datos...');
    const descargaDatos = crearConDatosPrueba();
    const resultadoFinal = await descargaDatos.obtenerResultadosCalculados();
    
    console.log('✅ Datos cargados:');
    console.log('   📊 Hashtags:', resultadoFinal.metadatos.hashtagsOriginales);
    console.log('   📸 Instagram hashtags procesados:', resultadoFinal.resultadoInstaCalc.hashtags.length);
    console.log('   🔴 Reddit hashtags procesados:', resultadoFinal.resultadoRedditCalc.hashtags.length);
    console.log('   🐦 X hashtags procesados:', resultadoFinal.resultadoXCalc.hashtags.length);
    console.log('   📰 Noticias encontradas:', resultadoFinal.noticias.length);
    console.log('   🎯 Fuente de datos:', resultadoFinal.metadatos.fuente);
    
    // PASO 2: Procesar con ConsolidacionDatos
    console.log('\n🔧 PASO 2: Consolidando datos...');
    const datosConsolidados = procesarParaDashboard(resultadoFinal);
    
    console.log('✅ Consolidación completada:');
    console.log('   🎯 Hashtags comparativos:', datosConsolidados.consolidacion.hashtagsComparativos.length);
    console.log('   🏆 Ranking de plataformas:', datosConsolidados.consolidacion.rankingPlataformas.length);
    console.log('   💡 Insights generados:', datosConsolidados.consolidacion.insights.length);
    console.log('   📋 Recomendaciones:', datosConsolidados.consolidacion.recomendaciones.length);
    
    // PASO 3: Mostrar resultados detallados
    console.log('\n📊 RESUMEN EJECUTIVO:');
    console.log('   🏷️ Total hashtags:', datosConsolidados.consolidacion.resumenEjecutivo.totalHashtags);
    console.log('   🚀 Mejor hashtag:', datosConsolidados.consolidacion.resumenEjecutivo.mejorHashtag);
    console.log('   🏆 Mejor plataforma:', datosConsolidados.consolidacion.resumenEjecutivo.mejorPlataforma);
    console.log('   📈 Tasa global:', datosConsolidados.consolidacion.resumenEjecutivo.tasaInteraccionGlobal + '%');
    console.log('   📊 Tendencia:', datosConsolidados.consolidacion.resumenEjecutivo.tendenciaGeneral);
    
    console.log('\n💡 INSIGHTS PRINCIPALES:');
    datosConsolidados.consolidacion.insights.forEach((insight, index) => {
      console.log(`   ${index + 1}. ${insight.titulo}`);
      console.log(`      ${insight.descripcion}`);
      if (insight.recomendacion) {
        console.log(`      💡 ${insight.recomendacion}`);
      }
    });
    
    console.log('\n🏆 RANKING DE PLATAFORMAS:');
    datosConsolidados.consolidacion.rankingPlataformas.forEach((plataforma, index) => {
      console.log(`   ${index + 1}. ${plataforma.emoji} ${plataforma.plataforma} - ${plataforma.puntuacion.toFixed(2)}%`);
      console.log(`      ✅ Fortalezas: ${plataforma.fortalezas.join(', ')}`);
      console.log(`      ⚠️ Debilidades: ${plataforma.debilidades.join(', ')}`);
    });
    
    console.log('\n📋 RECOMENDACIONES:');
    datosConsolidados.consolidacion.recomendaciones.forEach((rec, index) => {
      console.log(`   ${index + 1}. ${rec}`);
    });
    
    console.log('\n📊 MÉTRICAS GLOBALES:');
    console.log('   🔄 Total interacciones:', datosConsolidados.consolidacion.metricas.totalInteracciones);
    console.log('   📡 Alcance estimado:', datosConsolidados.consolidacion.metricas.alcanceEstimado);
    console.log('   💫 Engagement:', datosConsolidados.consolidacion.metricas.engagement + '%');
    console.log('   🚀 Potencial viral:', datosConsolidados.consolidacion.metricas.potencialViral + '%');
    
    // PASO 4: Verificar datos para gráficas
    console.log('\n📈 DATOS PARA GRÁFICAS:');
    console.log('   📸 Instagram - Primer hashtag tiene', datosConsolidados.resultadoInstaCalc.hashtags[0]?.datosInteraccion.length, 'puntos de datos');
    console.log('   🔴 Reddit - Primer hashtag tiene', datosConsolidados.resultadoRedditCalc.hashtags[0]?.datosInteraccion.length, 'puntos de datos');
    console.log('   🐦 X - Primer hashtag tiene', datosConsolidados.resultadoXCalc.hashtags[0]?.datosInteraccion.length, 'puntos de datos');
    
    console.log('\n🎉 ========================================');
    console.log('🎉 ¡SISTEMA COMPLETO FUNCIONANDO! ✅✅✅');
    console.log('🎉 ========================================');
    
    return datosConsolidados;
    
  } catch (error) {
    console.error('\n❌ ========================================');
    console.error('❌ ERROR EN EL SISTEMA:');
    console.error('❌ ========================================');
    console.error(error);
    console.error('\n🔧 Revisa que todos los archivos estén importados correctamente');
  }
}

// 🚀 EJECUTAR LA PRUEBA
console.log('Iniciando prueba en 1 segundo...');
setTimeout(() => {
  probarSistemaCompleto();
}, 1000);