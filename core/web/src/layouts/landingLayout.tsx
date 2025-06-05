import './landing.css';

export default function LandingLayout(props: any) {
  const { children } = props;

  return (
    <div className="min-h-screen w-screen m-0 p-0 relative flex flex-col overflow-hidden">
      <div className='absolute inset-0 z-0'>
        <div className="wave -one" />
        <div className="wave -two" />
        <div className="wave -three" />
      </div>

      <div className="min-h-screen w-full relative z-10 p-5 flex flex-col">
        <header className="mb-5 pb-5">
          <h1 className="text-white text-3xl font-bold">Whisper Trend</h1>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
