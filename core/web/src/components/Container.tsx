export default function Container(props: any) {
  return (
    <div className="bg-gradient-to-r from-[#2d86d1] to-[#34d399] md:p-8 p-6 rounded-3xl w-full max-w-md shadow-xl">
      {props.children}
    </div>
  );
}
