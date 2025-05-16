export default function Container(props: any) {
  return (
    <form className="bg-gradient-to-r from-[#2d86d1] to-[#34d399] p-8 rounded-[27px] w-full max-w-[400px] shadow-md">
      {props.children}
    </form>
  );
}
