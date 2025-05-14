import Navbar from "../components/Navbar";
import SideBar from "../components/SideBar";

export default function ProfileLayout(props: any) {
  return (
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="flex-1 w-full flex">
        <SideBar />
        <div className="flex-1 p-6">
          {props.children}
        </div>
      </div>
    </div>
  );
}