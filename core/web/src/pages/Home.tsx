import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import logo from '../assets/Wtw2.png';
import whisperVideo from '../assets/whisper2.mp4';
import subtitlesFile from '../assets/[es-MX] whisper2.mp4.vtt';

export default function Home() {
  const videoRef = useRef(null);
  const videoContainerRef = useRef(null);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showPanel, setShowPanel] = useState(true);
  const [overlayMode, setOverlayMode] = useState(false);

  // Parse .vtt
  useEffect(() => {
    fetch(subtitlesFile)
      .then((res) => res.text())
      .then((text) => {
        const parsed = parseVTT(text);
        setSubtitles(parsed);
      });
  }, []);

  // Sync subtitle with video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const time = video.currentTime;
      const subtitle = subtitles.find((s) => time >= s.start && time <= s.end);
      setCurrentSubtitle(subtitle ? subtitle.text : '');
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [subtitles]);

  // Detect fullscreen to force overlayMode
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      const isFullscreen = fullscreenElement === videoContainerRef.current;
      if (isFullscreen) {
        setOverlayMode(true);
        setShowPanel(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const parseVTT = (data) => {
    const lines = data.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      if (lines[i].includes('-->')) {
        const [start, end] = lines[i].split(' --> ');
        const textLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== '') {
          textLines.push(lines[i]);
          i++;
        }
        result.push({
          start: parseTime(start.trim()),
          end: parseTime(end.trim()),
          text: textLines.join('\n'),
        });
      } else {
        i++;
      }
    }

    return result;
  };

  const parseTime = (time) => {
    const [h, m, s] = time.replace(',', '.').split(':');
    const [sec, ms = '0'] = s.split('.');
    return (
      parseInt(h) * 3600 +
      parseInt(m) * 60 +
      parseInt(sec) +
      parseInt(ms) / 1000
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-start items-center">
      <img src={logo} alt="WhisperTrend Logo" className="md:w-100 w-70 mb-8" />

      <Link
        to="/login"
        className="bg-white text-black font-medium px-6 py-3 rounded-full flex items-center gap-2 hover:scale-105 transition-transform"
      >
        Ingresar <span className="text-xl">→</span>
      </Link>

      <Link
        to="/nosotros"
        className="mt-4 bg-white px-3 rounded-3xl flex items-center gap-2 hover:scale-105 transition-transform"
      >
        <p className="text-md">Conócenos</p>
      </Link>

      <div className="bg-white text-black text-center md:p-8 p-4 mt-11 max-w-4xl rounded-3xl shadow-md">
        <p className="md:text-lg text-sm">
          Whispertrend es tu plataforma de inteligencia de mercado. Nosotros sabemos que las tendencias y
          noticias en redes sociales pueden impulsar o afectar tu negocio en minutos. WhisperTrend te
          permite monitorearlas, medir su impacto, y detectar oportunidades o amenazas antes que nadie.
          WhisperTrend te ayuda a tomar decisiones estratégicas con información precisa y a mantenerte
          siempre un paso adelante.
        </p>
      </div>

      {/* VIDEO CON PANEL DE SUBTÍTULOS O MODO OVERLAY */}
      <div className="w-full max-w-4xl mt-16 flex relative">
        {/* Panel lateral visible solo si showPanel y !overlayMode */}
        {showPanel && !overlayMode && (
          <div className="w-[300px] shrink-0 ml-[-9rem] bg-white bg-opacity-90 text-black p-4 rounded-l-xl shadow-lg transition-transform duration-300">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-2xl">Subtítulos</h3>
              <button
                onClick={() => {
                  setShowPanel(false);
                  setOverlayMode(true);
                }}
                className="text-xl transform hover:scale-125 transition-transform"
                title="Ver subtítulos sobre el video"
              >
                →
              </button>
            </div>
            <p className="text-sm mb-2">
              Los subtítulos se sincronizan con el video. Puedes verlos aquí mientras el video se reproduce.
            </p>
            <p className="text-xl whitespace-pre-wrap">{currentSubtitle}</p>
          </div>
        )}

        {/* Contenedor del video + overlay */}
        <div ref={videoContainerRef} className="relative flex-1">
          {/* Subtítulo en overlay */}
          {overlayMode && (
            <>
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded z-10 text-center text-sm max-w-md whitespace-pre-wrap">
                {currentSubtitle}
              </div>
              <button
                onClick={() => {
                  setOverlayMode(false);
                  setShowPanel(true);
                }}
                className="absolute top-4 left-3 bg-white px-3 rounded-full text-sm shadow z-20"
                title="Mostrar panel lateral"
              >
                ←
              </button>
            </>
          )}

          {/* Video principal */}
          <video ref={videoRef} controls className="w-full rounded-xl z-0">
            <source src={whisperVideo} type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
