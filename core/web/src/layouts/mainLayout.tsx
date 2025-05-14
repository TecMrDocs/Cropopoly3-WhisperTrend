import Navbar from "../components/Navbar";

export default function MainLayout(props:any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 w-full py-6">
        {props.children}
      </div>
    </div>
  );
}