import './landing.css';

export default function LandingLayout(props: any) {
  const { children } = props;

  return (
    <div className="min-h-screen w-screen m-0 p-0 relative flex flex-col overflow-hidden">
      <div className="wave -one" />
      <div className="wave -two" />
      <div className="wave -three" />

      <div className="min-h-[85vh] w-full relative z-10 p-5">
        <header className="mb-5 pb-5">
          <h1 className="text-white text-3xl font-bold">Whisper Trend</h1>
        </header>
        <main>{children}</main>
      </div>

      <div className="min-h-[25vh] w-full bg-white relative -mt-[10vh] m-0 p-0 z-10" />
    </div>
  );
}
