import { useState } from 'react';
import analysisApi from '../utils/api/analysis';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const InterpretacionDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  // Variable utilizada para el modelo de IA en el uso del endpoint principal
  // const model = 'deepseek-r1-distill-llama-70b';

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Simulación de llamada a la API para obtener la interpretación
      await new Promise((r) => setTimeout(r, 3000));
      const res = await analysisApi.analysis.getDummy();
      setResult(res);
    } catch (err) {
      console.error('Error al obtener la interpretación:', err);
      setResult('Ocurrió un error al procesar la interpretación. Por favor, inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Procesando interpretación...
      </div>
    );
  }

  if (result) {
    return (
      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 overflow-auto max-h-[600px]">
        <div className="prose max-w-none">
            <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            // Omitidos (temporalmente, por errores)
            // components={{
            //   ul: ({ node, ...props }) => <ul className="list-disc ml-6" {...props} />,
            //   ol: ({ node, ...props }) => <ol className="list-decimal ml-6" {...props} />,
            //   li: ({ node, ...props }) => <li className="mb-1" {...props} />,
            //   strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
            //   h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
            //   h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
            //   h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-2 mb-1" {...props} />,
            //   pre: ({ node, ...props }) => <pre className="bg-gray-100 rounded p-2 overflow-x-auto" {...props} />,
            //   code: ({ node, ...props }) => <code className="font-mono bg-gray-100 rounded px-1" {...props} />,
            //   p: ({ node, ...props }) => <p className="mb-2" {...props} />,
            // }}
            >
            {result}
            </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
      <p className="text-gray-700 mb-3">
        En esta sección puedes visualizar cómo se comportan diferentes métricas
        de rendimiento en redes sociales a lo largo del tiempo.
      </p>
      <p className="text-gray-700 mb-6">
        Usa las opciones para cambiar entre los valores originales, su escala
        logarítmica o una versión normalizada para facilitar la comparación
        entre métricas de diferente orden de magnitud.
      </p>
      <button
        onClick={handleAnalyze}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Generar interpretación
      </button>
    </div>
  );
};

export default InterpretacionDashboard;