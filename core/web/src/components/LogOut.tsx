import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import BlueButton from "../components/BlueButton";
import WhiteButton from "../components/WhiteButton";

interface LogoutModalProps {
  setMostrarModal: (value: boolean) => void;
}

const LogoutModal = ({ setMostrarModal }: LogoutModalProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth(); 

  const cerrarSesion = async () => {
    try {
      signOut(); 
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setMostrarModal(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setMostrarModal(false);
        }
      }}
    >
      <div className="p-[10px] rounded-xl bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <div className="bg-white p-6 rounded-md w-[600px] min-h-[200px] text-black flex flex-col justify-between items-center gap-6">
          <h2 className="text-xl font-semibold text-center">¿Quieres cerrar tu sesión?</h2>
          <div className="flex justify-center items-center w-full gap-20">
            <WhiteButton text="Cancelar" width="200px" onClick={() => setMostrarModal(false)} />
            <BlueButton text="Cerrar sesión" width="200px" onClick={cerrarSesion} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
