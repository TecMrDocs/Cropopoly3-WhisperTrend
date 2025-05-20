type SelectFieldProps = {
  options: string[];
  width?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  label?: React.ReactNode; // ← permite loables como texto + ícono
};

export default function SelectField({
  options,
  width = '200px',
  placeholder = 'Selecciona una opción',
  value,
  onChange,
  label,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-2" style={{ width }}>
      {label && <label className="text-base font-medium">{label}</label>}
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <select
          value={value !== undefined ? value : ''}
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
