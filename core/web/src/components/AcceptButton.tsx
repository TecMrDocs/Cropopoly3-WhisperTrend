
export default function AcceptButton(props:any){
  return(
    <div>
      <button className="text-white bg-gradient-to-r from-blue-600 to-emerald-400 rounded-[15px] border-transparent py-2 px-2.5 text-[17px] font-semibold cursor-pointer w-[8%] hover:from-blue-600 hover:to-emerald-400">
        {props.text}
      </button>
    </div>
  );
}