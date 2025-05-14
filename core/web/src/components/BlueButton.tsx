type BlueButtonProps = {
  text?: string;
  width?: string;
};

export default function BlueButton({text = '', width = '400px'} : BlueButtonProps){
  return(
    <div>
      <button style={{ width }} className="text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-[15px] border-transparent py-2 px-2.5 text-[17px] font-semibold cursor-pointer w-[8%] hover:from-blue-600 hover:to-emerald-400">
        {text}
      </button>
    </div>
  );
}