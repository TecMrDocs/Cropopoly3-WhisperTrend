import logo from '../assets/Wtw1.png';

export default function Navbar() {
  return(
    <div className="w-full h-20 flex flex-row justify-between items-center px-5 bg-gradient-to-r from-blue-600 to-emerald-400 text-white">
      <div className="flex items-center gap-2.5">
        <img 
          src={logo} 
          alt="Whisper Trend Logo" 
          className="h-[50px] w-auto object-contain"
        />
        <p className="m-0 text-2xl font-bold">Whisper Trend</p>
      </div>
    </div>
  );
}