// export default function GenericButton(props:any){
//   return(
//     <button className="back-button text-[#276de1] !bg-white rounded-[15px] w-[8%] border-4 border-[#276de1] text-[17px] font-semibold cursor-pointer py-2 px-2.5">
//       {props.text}
//     </button>    
//   );
// }

export default function GenericButton(props: any) {
  return (
    <button style={{
      background: "linear-gradient(90deg, #2d86d1 0%, #34d399 100%)",
      width: "100%",
      padding: "0.75rem",
      margin: "1rem 0",
      color: "white",
      border: "none",
      borderRadius: "25px",
      cursor: "pointer"
    }}>
      {props.text}
    </button>
  );
}
