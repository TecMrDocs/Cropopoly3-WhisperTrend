import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";

export default function MainLayout(props:any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex flex-1 w-full h-full">
        <SideBar />
        <div className="flex-1 py-6">
          {props.children}
        </div>
      </div>
    </div>
  );
}