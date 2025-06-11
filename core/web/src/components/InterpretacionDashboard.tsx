import { useState } from 'react';
import analysisApi from '../utils/api/analysis';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface InterpretacionDashboardProps {
  analysisData?: any;
}

const InterpretacionDashboard: React.FC<InterpretacionDashboardProps> = ({ analysisData }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [analysisType, setAnalysisType] = useState<'new' | 'latest' | 'previous' | null>(null);
  const resourceName = analysisData?.resource_name || 'Bolso Mariana :D';

  const handleGenerateNew = async () => {
    if (!analysisData) {
      console.error('No hay datos de análisis disponibles');
      return;
    }

    setLoading(true);
    setAnalysisType('new');
    
    try {
      console.log('🔍 Enviando datos al backend:', analysisData);
      
      const response = await analysisApi.analysis.generateNew({
        model: "llama3-70b-8192",
        analysis_data: analysisData
      });
      
      console.log('✅ Respuesta del backend:', response);
      setResult(response.analysis);
      
      if (response.saved) {
        console.log('✅ Análisis guardado exitosamente');
      } else {
        console.warn('⚠️ El análisis no se pudo guardar');
      }
      
    } catch (err) {
      console.error('❌ Error al generar análisis:', err);
      setResult('Error al generar el análisis. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLatest = async () => {
    setLoading(true);
    setAnalysisType('latest');
    
    try {
      const response = await analysisApi.analysis.getLatest();
      setResult(response);
    } catch (err) {
      console.error('Error al obtener último análisis:', err);
      setResult('No hay análisis reciente disponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPrevious = async () => {
    setLoading(true);
    setAnalysisType('previous');
    
    try {
      const response = await analysisApi.analysis.getPrevious();
      setResult(response);
    } catch (err) {
      console.error('Error al obtener análisis anterior:', err);
      setResult('No hay análisis anterior disponible.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearResult = () => {
    setResult('');
    setAnalysisType(null);
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {analysisType === 'new' 
            ? `Generando nuevo análisis para "${resourceName}"...` 
            : analysisType === 'latest'
            ? 'Cargando último análisis...'
            : 'Cargando análisis anterior...'
          }
        </p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="space-y-4">
        {/* Header con botones de acción */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600">
              {analysisType === 'new' && '🆕 Análisis Recién Generado'}
              {analysisType === 'latest' && '📊 Último Análisis'}
              {analysisType === 'previous' && '📋 Análisis Anterior'}
            </span>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleGenerateNew}
              disabled={!analysisData}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔄 Nuevo Análisis
            </button>
            <button
              onClick={handleClearResult}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Contenido del análisis */}
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 overflow-auto max-h-[600px]">
          <div className="prose max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <p className="text-gray-700 mb-3">
        En esta sección puedes generar y visualizar análisis detallados de las tendencias
        de <span className="font-semibold text-blue-600">"{resourceName}"</span> basados en 
        datos reales de redes sociales y ventas.
      </p>
      
      <p className="text-gray-700 mb-6">
        Utiliza la inteligencia artificial para obtener insights profundos, correlaciones
        y recomendaciones estratégicas personalizadas para tu producto o servicio.
      </p>

      {/* Botones de acción */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateNew}
            disabled={!analysisData}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>🤖</span>
            Generar Nuevo Análisis
          </button>
          
          <button
            onClick={handleViewLatest}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            <span>📊</span>
            Ver Último Análisis
          </button>
          
          <button
            onClick={handleViewPrevious}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition"
          >
            <span>📋</span>
            Ver Análisis Anterior
          </button>
        </div>

        {!analysisData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700">
              ⚠️ No hay datos de análisis disponibles. Asegúrate de haber completado 
              el proceso de configuración de tu producto.
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> El análisis se basa en los datos de tu producto: 
            hashtags, métricas de redes sociales, ventas y tendencias. 
            Cada nuevo análisis reemplaza al anterior como "último análisis".
          </p>
        </div>
      </div>
    </div>
  );
};

export default InterpretacionDashboard;