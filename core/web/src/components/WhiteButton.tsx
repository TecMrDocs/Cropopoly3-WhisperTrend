type WhiteButtonProps = {
  text?: string;
  width?: string;
  onClick?: () => void;
};

export default function WhiteButton({text = '', width = '400px', onClick} : WhiteButtonProps) {
  return(
    <button onClick={onClick} style={{ width }} className="back-button text-[#276de1] !bg-white rounded-3xl w-[8%] border-4 border-[#276de1] text-[17px] font-semibold cursor-pointer py-2 px-2.5">
      {text}
    </button>    
  );
}
