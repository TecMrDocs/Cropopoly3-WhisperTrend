import { useState } from 'react';
import { usePrompt } from '../contexts/PromptContext';
import analysisApi from '../utils/api/analysis';

export default function TestPromptContext() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { analysisData } = usePrompt();

  const handleTest = async () => {
    if (!analysisData) {
      setError('No hay datos en PromptContext para enviar');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧪 [TEST] Datos del PromptContext:', analysisData);
      
      const response = await analysisApi.analysis.testPromptContext(analysisData);
      
      console.log('✅ [TEST] Respuesta del servidor:', response);
      setResult(response);
      
    } catch (err) {
      console.error('❌ [TEST] Error:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">🧪 Test PromptContext</h3>
      
      <div className="mb-4">
        <p><strong>Estado del PromptContext:</strong></p>
        <p className={analysisData ? 'text-green-600' : 'text-red-600'}>
          {analysisData ? '✅ Datos disponibles' : '❌ Sin datos'}
        </p>
        
        {analysisData && (
          <div className="mt-2 text-sm text-gray-600">
            <p>• Sentence: {analysisData.sentence || 'N/A'}</p>
            <p>• Hashtags: {analysisData.hashtags?.length || 0}</p>
            <p>• Resource: {analysisData.resource_name || 'N/A'}</p>
            <p>• Calculated Results: {analysisData.calculated_results ? '✅' : '❌'}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleTest}
        disabled={!analysisData || isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isLoading ? 'Probando...' : 'Probar Envío'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h4 className="font-semibold text-green-600">✅ Respuesta del Servidor:</h4>
          <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-auto max-h-64">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}