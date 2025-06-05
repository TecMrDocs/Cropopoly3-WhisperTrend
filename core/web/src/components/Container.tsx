export default function Container(props: any) {
  return (
    <div className="bg-gradient-to-r from-[#2d86d1] to-[#34d399] p-8 rounded-3xl w-full max-w-[400px] shadow-xl">
      {props.children}
    </div>
  );
}
