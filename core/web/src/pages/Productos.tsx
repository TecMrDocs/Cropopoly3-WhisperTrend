import React, { useState } from 'react';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const products = [
  { name: 'Bolso Marianne' },
  { name: 'Cartera Erika' }
];

export default function Productos() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const handleDeleteClick = (productName: string) => {
    setProductToDelete(productName);
    setShowModal(true);
  };

  const handleConfirmDelete = () => {
    alert(`Producto eliminado: ${productToDelete}`);
    setShowModal(false);
  };

  return (
    <div className="min-h-screen relative">
      <h1 className="text-5xl font-bold text-center mb-15">Mis productos y servicios</h1>

      <div className="flex flex-wrap justify-center gap-10">
        {products.map((product, index) => (
          <div
            key={index}
            className="w-60 border-2 border-blue-400 rounded-xl p-4 flex flex-col items-center space-y-5"
          >
            <p className="text-lg text-blue-500 font-semibold">Producto</p>
            <p className="text-2xl font-bold text-blue-400">{product.name}</p>

            <button
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer bg-gradient-to-r from-blue-500 to-teal-400 text-white font-semibold px-6 py-2 rounded-full"
            >
              Ver
            </button>

            <div className="flex justify-between w-full px-4">
              <FiTrash2
                className="cursor-pointer hover:text-red-500"
                size={20}
                onClick={() => handleDeleteClick(product.name)}
              />
              <FiEdit2 className="cursor-pointer hover:text-blue-600" size={20} />
            </div>
          </div>
        ))}

        <div className="w-60 border-2 border-teal-400 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-5 hover:shadow-md transition">
          <p className="text-black font-medium text-lg">Agregar producto</p>
          <div
            className="border-2 border-teal-400 p-2 rounded-full cursor-pointer"
            onClick={() => navigate('/editarProducto')}
          >
            <FiPlus className="text-teal-500" size={28} />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center">
          <div className="bg-white border-2 border-teal-400 rounded-xl p-8 text-center space-y-8 w-110">
            <p className="text-black text-lg">¿Realmente quieres eliminar este producto?</p>
            <div className="flex justify-around mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer border-2 border-blue-500 text-blue-600 font-semibold px-6 py-2 rounded-full hover:bg-blue-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="cursor-pointer bg-red-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-red-600"
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
