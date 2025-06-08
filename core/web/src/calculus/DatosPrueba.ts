// DatosPrueba.ts
// VERSIÓN MODIFICADA PARA DEMOSTRAR DINAMISMO

// Simulador simple de datos para testing
export const obtenerDatosPrueba = () => {
  console.log('🎲 Generando datos de prueba MODIFICADOS...');
  
  return {
    // 🆕 CAMBIO 1: Agregar un nuevo hashtag
    hashtags: ['#EcoFriendly', '#SustainableFashion', '#NuevosMateriales', '#ModaVerde'],
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
          },
          // 🆕 CAMBIO 2: Agregar datos para el nuevo hashtag
          {
            keyword: '#ModaVerde',
            posts: [
              {
                comments: 67,
                followers: 4200,
                likes: 520,
                link: "https://instagram.com/post/8",
                time: "2025-01-10T10:00:00Z"
              },
              {
                comments: 73,
                followers: 4350,
                likes: 610,
                link: "https://instagram.com/post/9",
                time: "2025-02-10T10:00:00Z"
              },
              {
                comments: 81,
                followers: 4500,
                likes: 690,
                link: "https://instagram.com/post/10",
                time: "2025-03-10T10:00:00Z"
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
          },
          // 🆕 CAMBIO 3: Agregar datos Reddit para #ModaVerde
          {
            keyword: '#ModaVerde',
            posts: [
              {
                comments: 45,
                members: 18000,
                likes: 0,
                vote: 134,
                subreddit: 'greenfashion',
                title: 'Post sobre ModaVerde - 1',
                link: "https://reddit.com/r/greenfashion/post/1",
                time: "2025-01-10T11:00:00Z"
              },
              {
                comments: 52,
                members: 18500,
                likes: 0,
                vote: 167,
                subreddit: 'greenfashion',
                title: 'Post sobre ModaVerde - 2',
                link: "https://reddit.com/r/greenfashion/post/2",
                time: "2025-02-10T11:00:00Z"
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
        },
        // 🆕 CAMBIO 4: Agregar nueva noticia relacionada
        {
          title: "Moda Verde: El futuro de la industria textil",
          description: "Las marcas adoptan cada vez más prácticas sostenibles, con un crecimiento del 85% en moda verde.",
          url: "https://greentrends.com/moda-verde-futuro",
          keywords: ["moda verde", "sostenibilidad", "futuro textil"]
        }
      ]
    }
  };
};

export default { obtenerDatosPrueba };