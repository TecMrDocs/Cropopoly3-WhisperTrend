type SelectFieldProps = {
  options: string[];
  width?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export default function SelectField({
  options,
  width = '200px',
  placeholder = 'Selecciona una opción',
  value,
  onChange,
}: SelectFieldProps) {
  return (
    <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
      <select
        value={value !== undefined ? value : undefined}
        onChange={onChange}
        style={{ width }}
        className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black"
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
  );
}