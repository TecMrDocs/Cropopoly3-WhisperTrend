import { Link } from 'react-router-dom';

const equipo = {
  nivel1: [
    {
      nombre: 'Lucio Arturo Reyes Castillo',
      matricula: 'A01378985',
      rol: 'PM',
      imagen: 'src/images/lucio_pfp.jpeg',
    },
    {
      nombre: 'Arturo Barrios Mendoza',
      matricula: 'A01168331',
      rol: 'PO',
      imagen: 'src/images/Arturo_pfp.jpeg',
    },
  ],
  nivel2: [
    {
      nombre: 'Mariana Balderrábano Aguilar',
      matricula: 'A01749581',
      rol: 'Líder Técnico',
      imagen: 'src/images/mariana_pfp.jpeg',
    },
  ],
  nivel3: [
    {
      nombre: 'Andrés Cabrera Alvarado',
      matricula: 'A01798681',
      rol: 'DEV',
      imagen: 'src/images/andres_pfp.jpeg',
    },
    {
      nombre: 'Iván Alexander Ramos Ramírez',
      matricula: 'A01750817',
      rol: 'DEV',
      imagen: 'src/images/Ivan_pfp.jpeg',
    },
    {
      nombre: 'Renato García Morán',
      matricula: 'A01799387',
      rol: 'Backend Developer',
      imagen: 'src/images/renato_pfp.jpeg',
    },
    {
      nombre: 'Carlos Alberto Zamudio Velázquez',
      matricula: 'A01799283',
      rol: 'Backend Developer',
      imagen: 'src/images/carlos_pfp.jpeg',
    },
    {
      nombre: 'Sebastian Antonio Almanza',
      matricula: 'A01749694',
      rol: 'DEV',
      imagen: 'src/images/sebas_pfp.jpeg',
    },
    {
      nombre: 'Santiago Villazón',
      matricula: 'A01746396',
      rol: 'DEV',
      imagen: 'src/images/santi_pfp.jpeg',
    },
    {
      nombre: 'Julio Cesar Vivas Medina',
      matricula: 'A01749879',
      rol: 'DEV',
      imagen: 'src/images/julio_pfp.jpeg',
    },
  ],
};

function Card({ miembro }: { miembro: any }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-35 h-35 mb-2">
        <img
          src={miembro.imagen}
          alt={miembro.nombre}
          className="w-full h-full object-cover rounded-full shadow-md"
        />
      </div>
      <p className="text-center text-sm leading-tight font-medium text-white">
        {miembro.nombre}<br />
        <span className="text-xs font-normal">{miembro.matricula}</span><br />
        <span className="text-xs text-white font-bold">{miembro.rol}</span>
      </p>
    </div>
  );
}

export default function Us() {
  return (
    <div className="min-h-screen flex flex-col items-center">
      <h1 className="text-4xl font-bold text-white mb-8">Nosotros</h1>
      <Link
        to="/"
        className="bg-white font-sm px-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
      > 
        Regresar
        <span className="text-xl">←</span>
      </Link>
      <br></br>

      {/* Nivel 1 */}
      <div className="flex justify-center gap-12 mb-10">
        {equipo.nivel1.map((m, i) => (
          <Card key={`nivel1-${i}`} miembro={m} />
        ))}
      </div>

      {/* Nivel 2 */}
      <div className="flex justify-center gap-12 mb-10">
        {equipo.nivel2.map((m, i) => (
          <Card key={`nivel2-${i}`} miembro={m} />
        ))}
      </div>

      {/* Nivel 3 */}
      <div className="flex flex-wrap justify-center gap-12">
        {equipo.nivel3.map((m, i) => (
          <Card key={`nivel3-${i}`} miembro={m} />
        ))}
      </div>
    </div>
  );
}
