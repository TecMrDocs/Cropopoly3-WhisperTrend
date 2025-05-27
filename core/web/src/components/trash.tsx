/*

import { hashtagsNoticias } from '../components/MenuComponentes';


const hashtagsNoticias = [
  { id: 'pielesSinteticas', nombre: '#PielesSinteticas', correlacion: 82, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 45.2 },
    { fecha: "1/02/25 - 28/02/25", tasa: 62.8 },
    { fecha: "1/03/25 - 31/03/25", tasa: 71.3 },
    { fecha: "1/04/25 - 19/04/25", tasa: 88.5 }
  ]},
  { id: 'milan', nombre: '#Milan', correlacion: 70, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 32.1 },
    { fecha: "1/02/25 - 28/02/25", tasa: 48.7 },
    { fecha: "1/03/25 - 31/03/25", tasa: 55.9 },
    { fecha: "1/04/25 - 19/04/25", tasa: 67.4 }
  ]},
  { id: 'modaSustentable', nombre: '#ModaSustentable', correlacion: 76, color: '#a855f7', datos: [
    { fecha: "01/01/25 - 31/01/25", tasa: 38.9 },
    { fecha: "1/02/25 - 28/02/25", tasa: 55.3 },
    { fecha: "1/03/25 - 31/03/25", tasa: 69.1 },
    { fecha: "1/04/25 - 19/04/25", tasa: 82.7 }
  ]}
];


const datosHashtagsNoticias = {
  'pielesSinteticas': hashtagsNoticias[0],
  'milan': hashtagsNoticias[1], 
  'modaSustentable': hashtagsNoticias[2]
};



              {hashtagsNoticias.map((hashtag) => (
                <div key={hashtag.id} className="flex items-center">
                  <div 
                    className={`w-6 h-6 rounded-full mr-3 cursor-pointer ${isHashtagNoticiaActive(hashtag.id) ? 'ring-2 ring-offset-2 ring-gray-600' : ''}`}
                    style={{ 
                      backgroundColor: isHashtagNoticiaActive(hashtag.id) ? hashtag.color : 'transparent',
                      border: `2px solid ${hashtag.color}`,
                    }}
                    onClick={() => handleHashtagNoticiaClick(hashtag.id)}
                  ></div>
                  <span className={`text-gray-800 ${isHashtagNoticiaActive(hashtag.id) ? 'font-bold' : 'font-medium'}`}>
                    {hashtag.nombre} - Correlación: {hashtag.correlacion}%
                  </span>
                </div>
              ))}

                const generarDatosCombinados = () => {
                  const todasFechas = Array.from(
                    new Set(
                      hashtagsIds.flatMap(id => {
                        const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
                        return hashtag ? hashtag.datos.map((d: any) => d.fecha) : [];
                      })
                    )
                  );
              
                  return todasFechas.map(fecha => {
                    const item: any = { fecha };
                    
                    hashtagsIds.forEach(id => {
                      const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
                      if (hashtag) {
                        const datoHashtag = hashtag.datos.find((d: any) => d.fecha === fecha);
                        item[id] = datoHashtag ? datoHashtag.tasa : 0;
                      }
                    });
                    
                    return item;
                  });
                };
              
                const datosCombinados = generarDatosCombinados();


                        <ResponsiveContainer>
          <LineChart data={datosCombinados} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" />
            <YAxis domain={[0, 'dataMax']} tickFormatter={(value) => `${value}%`} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            {hashtagsIds.map(id => {
              const hashtag = datosHashtagsNoticias[id as keyof typeof datosHashtagsNoticias];
              if (!hashtag) return null;
              
              return (
                <Line 
                  key={id}
                  type="monotone" 
                  dataKey={id} 
                  stroke={hashtag.color} 
                  name={hashtag.nombre} 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>


        
              //export { hashtagsNoticias };
*/