export default function EnclosedWord({ word }: { word: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="p-[3px] rounded-[10px] bg-gradient-to-r from-[#00BFB3] to-[#0091D5] inline-block">
        <p className="border-none outline-none p-2 px-3 rounded-[6px] bg-white text-base block text-black">
          {word}
        </p>
      </div>
    </div>
  );
}