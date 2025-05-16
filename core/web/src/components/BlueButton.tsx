type BlueButtonProps = {
  text?: string;
  width?: string;
  onClick?: () => void;
};

export default function BlueButton({text = '', width = '400px', onClick} : BlueButtonProps){
  return(
    <div>
      <button onClick={onClick} style={{ width }} className="text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-3xl border-transparent py-2 px-2.5 text-[17px] font-semibold cursor-pointer w-[8%] hover:from-blue-600 hover:to-emerald-400 h-[48px] ">
        {text}
      </button>
    </div>
  );
}