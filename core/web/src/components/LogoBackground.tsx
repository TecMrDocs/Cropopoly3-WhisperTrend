import colorLogo from '../images/color-logo.png';

export default function LogoBackground(props: any) {
  return (
    <div
      className="min-h-screen flex bg-no-repeat bg-center bg-[length:125%]"
      style={{ backgroundImage: `url(${colorLogo})` }}
    >
      {props.children}
    </div>
  );
}
