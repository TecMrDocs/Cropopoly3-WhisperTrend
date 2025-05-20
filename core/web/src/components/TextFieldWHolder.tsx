type TextFieldWHolderProps = {
  placeholder?: string;
  width?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  name?: string;
  id?: string;
  hasError?: boolean;
  type?: string;
};

export default function TextFieldWHolder({ 
  placeholder = '', 
  width = '200px',
  value,
  onChange,
  label,
  name,
  id,
  hasError = false,
  type = 'text',
}: TextFieldWHolderProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-md text-gray-700 font-bold ">{label}</label>}
      {/* <div className="p-[3px] rounded-3xl bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block"> */}
      <div 
        className={`p-[3px] rounded-3xl inline-block ${
          hasError 
            ? "bg-gradient-to-r from-red-500 to-red-400" // Gradiente rojo en error
            : "bg-gradient-to-r from-[#00BFB3] to-[#0091D5]" // Gradiente normal
        }`}
      >
        <input
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{ width }}
          className="border-none outline-none p-2 px-3 rounded-3xl bg-white text-base block text-black"
          name={name}
          id={id}
          autoComplete="off"
          type={type}
        />
      </div>
    </div>
  );
}
