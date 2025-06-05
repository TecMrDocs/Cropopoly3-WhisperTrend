import Navbar from "@/components/Navbar";

export default function AuthLayout(props: any) {
  return(
    <div className="min-h-screen min-w-screen w-full h-full bg-white flex flex-col">
      <Navbar />
      <div className="min-h-screen w-full">
        {props.children}
      </div>
    </div>
  )
}