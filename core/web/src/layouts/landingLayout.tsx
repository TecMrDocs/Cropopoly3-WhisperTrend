import React from "react";

export default function LandingLayout(props: any){
  const { children } = props;

  return(
    <div className="min-h-screen w-screen m-0 p-0 relative flex flex-col overflow-hidden">
      <div className="min-h-[85vh] w-full bg-gradient-to-b from-[#00BFB3] to-[#0091D5] relative m-0 p-0">
        <div className="w-full h-full relative z-10 p-5">
          <header className="mb-5 pb-5">
            <h1 className="text-white">Whisper Trend</h1>
          </header>
          <main>
            {children}
          </main>
        </div>
      </div>
      <div className="min-h-[25vh] w-full bg-white relative -mt-[10vh] m-0 p-0">
        <div className="w-full h-full relative">
        </div>
      </div>
    </div>
  );
}