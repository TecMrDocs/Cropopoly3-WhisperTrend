export default function GenericButton(props: any) {
  return (
    <button 
      type={props.type || "button"}
      onClick={props.onClick}
      className="w-full bg-gradient-to-r from-[#2d86d1] to-[#34d399] py-3 my-4 text-white border-none rounded-full cursor-pointer">
      {props.text}
    </button>
  );
}