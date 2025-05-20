type SelectFieldProps = {
  label?: string;
  options: string[];
  width?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: React.ReactNode; // ← permite loables como texto + ícono
};

export default function SelectField({
  label,
  options,
  width = '200px',
  placeholder = 'Selecciona una opción',
  value,
  onChange,
  label,
}: SelectFieldProps) {
  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-2" style={{ width }}>
      {label && <label className="text-base font-medium">{label}</label>}
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <select
          value={value !== undefined ? value : ''}
=======
    <div className="flex flex-col gap-1" style={{ width }}>
      {label && <label className="text-md font-semibold">{label}</label>}
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <select
          value={value !== undefined ? value : undefined}
>>>>>>> 379a7e0 (Actualizo Pantalla de Editar Producto, ya que estaba sin terminar. Solo decia en texto editar producto.)
          onChange={onChange}
          className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black w-full"
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
