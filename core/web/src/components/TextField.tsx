export default function TextField({ label, width = "300px" }: { label?: string, width?: string }){
  return(
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm text-gray-700">{label}</label>}
      <div
        className="p-[3px] rounded-3xl bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block"
        style={{ width }}
      >
        <input className="border-none outline-none p-2 px-3 rounded-3xl bg-white w-full text-base block text-black" />
      </div>
    </div>
  );
}