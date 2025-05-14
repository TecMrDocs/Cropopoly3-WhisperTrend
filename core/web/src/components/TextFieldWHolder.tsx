type TextFieldWHolderProps = {
  placeholder?: string;
  width?: string;
};

export default function TextFieldWHolder({ placeholder = '', width = '200px' }: TextFieldWHolderProps) {
  return (
    <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
      <input
        placeholder={placeholder}
        style={{ width }}
        className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black"
      />
    </div>
  );
}
