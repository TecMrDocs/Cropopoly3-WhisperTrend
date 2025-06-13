/**
* Módulo de datos de prueba para testing y desarrollo.
* 
* Este módulo proporciona datos simulados para testing del sistema de análisis
* de tendencias en redes sociales. Incluye datos estructurados para Instagram,
* Reddit y Twitter con métricas de engagement, metadatos de noticias y
* hashtags de ejemplo para validar el funcionamiento completo del pipeline.
* 
* Autor: Lucio Arturo Reyes Castillo
* Contribuyentes: [Lista de contribuyentes]
*/

// DatosPrueba.ts
// PASO 1: Crear este archivo nuevo en la misma carpeta donde tienes DescargaDatos.ts

/**
* Genera datos de prueba estructurados para testing del sistema.
* 
* Simula respuestas de APIs de redes sociales con métricas realistas
* para facilitar desarrollo y testing sin depender de APIs externas.
* 
* @return Object - Estructura completa de datos simulados con hashtags, métricas y metadatos
*/
export const obtenerDatosPrueba = () => {
 return {
   hashtags: ['#EcoFriendly', '#SustainableFashion', '#NuevosMateriales'],
   sentence: "Análisis de tendencias sostenibles en moda 2025",
   trends: {
     data: {
       instagram: [
         {
           keyword: '#EcoFriendly',
           posts: [
             {
               comments: 45,
               followers: 3500,
               likes: 350,
               link: "https://instagram.com/post/1",
               time: "2025-01-15T10:00:00Z"
             },
             {
               comments: 52,
               followers: 3600,
               likes: 420,
               link: "https://instagram.com/post/2",
               time: "2025-02-15T10:00:00Z"
             },
             {
               comments: 38,
               followers: 3700,
               likes: 380,
               link: "https://instagram.com/post/3",
               time: "2025-03-15T10:00:00Z"
             }
           ]
         },
         {
           keyword: '#SustainableFashion',
           posts: [
             {
               comments: 32,
               followers: 2800,
               likes: 280,
               link: "https://instagram.com/post/4",
               time: "2025-01-20T10:00:00Z"
             },
             {
               comments: 41,
               followers: 2900,
               likes: 310,
               link: "https://instagram.com/post/5",
               time: "2025-02-20T10:00:00Z"
             }
           ]
         },
         {
           keyword: '#NuevosMateriales',
           posts: [
             {
               comments: 25,
               followers: 2200,
               likes: 220,
               link: "https://instagram.com/post/6",
               time: "2025-01-25T10:00:00Z"
             },
             {
               comments: 28,
               followers: 2300,
               likes: 240,
               link: "https://instagram.com/post/7",
               time: "2025-02-25T10:00:00Z"
             }
           ]
         }
       ],
       reddit: [
         {
           keyword: '#EcoFriendly',
           posts: [
             {
               comments: 28,
               members: 15000,
               likes: 0,
               vote: 95,
               subreddit: 'sustainability',
               title: 'Post sobre EcoFriendly - 1',
               link: "https://reddit.com/r/sustainability/post/1",
               time: "2025-01-15T11:00:00Z"
             },
             {
               comments: 34,
               members: 15200,
               likes: 0,
               vote: 112,
               subreddit: 'sustainability',
               title: 'Post sobre EcoFriendly - 2',
               link: "https://reddit.com/r/sustainability/post/2",
               time: "2025-02-15T11:00:00Z"
             }
           ]
         },
         {
           keyword: '#SustainableFashion',
           posts: [
             {
               comments: 22,
               members: 12000,
               likes: 0,
               vote: 78,
               subreddit: 'sustainablefashion',
               title: 'Post sobre SustainableFashion - 1',
               link: "https://reddit.com/r/sustainablefashion/post/1",
               time: "2025-01-20T11:00:00Z"
             }
           ]
         },
         {
           keyword: '#NuevosMateriales',
           posts: [
             {
               comments: 18,
               members: 8000,
               likes: 0,
               vote: 65,
               subreddit: 'materials',
               title: 'Post sobre NuevosMateriales - 1',
               link: "https://reddit.com/r/materials/post/1",
               time: "2025-01-25T11:00:00Z"
             }
           ]
         }
       ],
       twitter: [] // Por ahora vacío como en tu sistema actual
     },
     metadata: [
       {
         title: "Pieles sintéticas revolucionan la moda en Milán",
         description: "Las nuevas tecnologías de materiales sintéticos están ganando terreno en las pasarelas milanesas.",
         url: "https://fashionnews.com/pieles-sinteticas-milan",
         keywords: ["pieles sintéticas", "moda sostenible", "innovación"]
       },
       {
         title: "Materiales reciclados: La nueva tendencia en accesorios",
         description: "Los bolsos fabricados con materiales reciclados muestran un crecimiento del 65% en popularidad.",
         url: "https://ecotrends.com/materiales-reciclados",
         keywords: ["materiales reciclados", "accesorios", "sostenibilidad"]
       }
     ]
   }
 };
};

export default { obtenerDatosPrueba };