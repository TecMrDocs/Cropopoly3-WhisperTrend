import React, { useState } from 'react'
import TextAreaField from '../components/TextAreaField'
import TextFieldWHolder from '../components/TextFieldWHolder'
import TagInput from '../components/TagInput'
import WhiteButton from '../components/WhiteButton'
import BlueButton from '../components/BlueButton'

const EditarProducto: React.FC = () => {
  const [associatedWords, setAssociatedWords] = useState<string[]>([])

  return (
    <div className="flex flex-col items-center">
      <div className="flex max-w-7xl w-full h-15 text-[25px] mt-7 mb-4 ">
        <div className="bg-gradient-to-r from-[#2d86d1] to-[#34d399] w-1/2 p-8 border-4 border-blue-500 text-white flex items-center justify-center">
          Editar información del producto
        </div>
        <div className="w-1/2 bg-white p-8 border-4 border-blue-500 text-blue-500 flex items-center justify-center">
          <p>Editar información de ventas</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 justify-center items-center mt-15 mb-10 ">
        <TextFieldWHolder
          label="Producto o servicio"
          width="700px"
          placeholder="Producto"
        />
        <TextFieldWHolder
          label="Nombre del producto o servicio"
          width="700px"
          placeholder="Bolso Marianne."
        />

        <label className="self-start text-md text-gray-700 font-bold ">
          Descripción del producto o servicio
        </label>
        <TextAreaField
          width="700px"
          placeholder="Bolso de piel sintética para mujer..."
        />

        {/* Aquí el TagInput en TSX */}
        <TagInput
          label="Palabras asociadas"
          tags={associatedWords}
          setTags={setAssociatedWords}
          placeholder="ej. Elegancia"
          width="700px"
        />
      </div>
      <div className="flex flex-row justify-center gap-100 ">
      <WhiteButton text="Cancelar" width="300px" />
      {/* <BlueButton text="Guardar" width="300px" onClick={handleSave}/> */}
      <BlueButton text="Guardar" width="300px" onClick={()=>console.log(1)}/>

      </div>
    </div>
  )
}

export default EditarProducto
