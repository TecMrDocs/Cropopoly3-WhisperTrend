type ButtonAddProps = {
  width?: string;
  onClick?: () => void;
};

export default function ButtonAdd({ width = '40px', onClick }: ButtonAddProps) {
  return (
    <button
      onClick={onClick}
      style={{ width, height: width }}
      className="flex items-center justify-center text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-full border-transparent text-xl font-bold leading-none cursor-pointer hover:from-blue-600 hover:to-emerald-400"
    >
      <p className="mb-1">+</p>
    </button>
  );
}
