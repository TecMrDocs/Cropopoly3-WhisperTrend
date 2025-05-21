import BlueButton from "../components/BlueButton";
import TextFieldWHolder from "../components/TextFieldWHolder";
import WhiteButton from "../components/WhiteButton";
import SelectField from "../components/SelectField";
import TextAreaField from "../components/TextAreaField";

export default function EditarProducto() {
  return (
    <div>
      <div className="flex items-center justify-center mb-6">
        <h1 className="text-2xl font-w700">Edita tu producto o servicio</h1>
      </div>

      <div className="flex flex-col items-center gap-6">
        <SelectField label="Selecciona si es un producto o servicio" width="700px" options={["Producto", "Servicio"]}/>
        <TextFieldWHolder label="Nombre de producto o servicio:" width="700px" placeholder="Ej. Bandolera"/>
        <TextAreaField label="¿Qué es tu producto o servicio?, ¿en qué consiste?" placeholder="Es una bolsa de piel sintética" width="700px"/>
        <TextFieldWHolder label="Indica palabras asociadas con tu producto o servicio (máximo 10)" width="700px" placeholder="Ej. Moda, Elegancia..."/>
      </div>

      <br />

      <div className="flex flex-row justify-center gap-10">
        <WhiteButton text="Regresar" width="300px" />
        <BlueButton text="Continuar" width="300px" />
      </div>
    </div>
  );
}
