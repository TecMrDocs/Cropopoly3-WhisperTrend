
export default function BackButton(props:any){
  return(
    <button className="text-[#276de1] bg-white rounded-[15px] w-[8%] border-4 border-[#276de1] text-[17px] font-semibold cursor-pointer py-2 px-2.5">
      {props.text}
    </button>    
  );
}