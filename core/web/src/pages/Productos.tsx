import React, { useState, useEffect } from 'react';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_URL } from "@/utils/constants";
import { getConfig } from "@/utils/auth";
import { usePrompt } from "../contexts/PromptContext";

interface Resource {
  id: number;
  user_id: number;
  r_type: "Producto" | "Servicio";
  name: string;
  description: string;
  related_words: string;
}

export default function Productos() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);

  const { setProducto, setProductId } = usePrompt();

  const getUserId = async (): Promise<number | null> => {
    try {
      const res = await fetch(`${API_URL}auth/check`, getConfig());
      if (!res.ok) throw new Error("Error al verificar usuario");
      const data = await res.json();
      return data.id;
    } catch (err) {
      console.error("Error obteniendo user_id:", err);
      return null;
    }
  };

  const fetchResources = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const res = await fetch(`${API_URL}resource/user/${userId}`, getConfig());
      if (!res.ok) throw new Error("Error al cargar recursos");

      const data: Resource[] = await res.json();
      setResources(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resourceToDelete) return;
  
    try {
      const res = await fetch(`${API_URL}resource/${resourceToDelete}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getConfig().headers,
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }
  
      setResources(prev => prev.filter(r => r.id !== resourceToDelete));
      setShowModal(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error("Error eliminando recurso:", error);
      alert("Ocurrió un error al eliminar el recurso.");
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center">Cargando...</div>;
  }

  const handleEditClick = async (resourceId: number) => {
    try {
      const res = await fetch(`${API_URL}resource/${resourceId}`, getConfig());
      if (!res.ok) throw new Error("Error al obtener recurso");
      const data = await res.json();
  
      setProducto({
        r_type: data.r_type,
        name: data.name,
        description: data.description,
        related_words: data.related_words,
      });
      setProductId(data.id);
  
      navigate(`/editarProducto`);
    } catch (error) {
      console.error("Error obteniendo recurso:", error);
    }
  };

  return (
    <div className="min-h-screen relative p-8">
      <h1 className="text-5xl font-bold text-center mb-12">Mis productos y servicios</h1>

      <div className="flex flex-wrap justify-center gap-10">
        {resources.map((resource) => (
          <div
            key={resource.id}
            className="w-60 border-2 border-blue-400 rounded-xl p-4 flex flex-col items-center space-y-5"
          >
            {/* Badge para el tipo */}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              resource.r_type === "Producto" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-teal-100 text-teal-800"
            }`}>
              {resource.r_type}
            </span>

            <p className="text-2xl font-bold text-blue-400 text-center">{resource.name}</p>

            <button
              // onClick={() => navigate(`/detalle/${resource.id}`)}
              onClick={() => navigate(`/dashboard`)}
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-6 py-2 rounded-full"
            >
              Ver
            </button>

            <div className="flex justify-between w-full px-4">
              <FiTrash2
                className="cursor-pointer hover:text-red-500"
                size={20}
                onClick={() => {
                  setResourceToDelete(resource.id);
                  setShowModal(true);
                }}
              />
              <FiEdit2 
                className="cursor-pointer hover:text-blue-600" 
                size={20}
                onClick={() => handleEditClick(resource.id)}
              />
            </div>
          </div>
        ))}

        {/* Tarjeta para agregar nuevo */}
        <div 
          className="w-60 border-2 border-teal-400 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-5 hover:shadow-md transition cursor-pointer"
          onClick={() => navigate('/NewResource')}
        >
          <p className="text-black font-medium text-lg">Agregar nuevo</p>
          <div className="border-2 border-teal-400 p-2 rounded-full">
            <FiPlus className="text-teal-500" size={28} />
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white rounded-xl p-8 text-center space-y-6 w-96">
            <h3 className="text-xl font-bold">Confirmar eliminación</h3>
            <p>¿Estás seguro de eliminar este {resources.find(r => r.id === resourceToDelete)?.r_type.toLowerCase()}?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 border border-gray-300 rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}