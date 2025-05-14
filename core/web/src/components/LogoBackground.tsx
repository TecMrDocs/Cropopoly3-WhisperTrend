import colorLogo from '../images/color-logo.png';


export default function LogoBackground(props: any) {
  return (

    <div style={{
    backgroundImage: `url(${colorLogo})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    minHeight: "100vh",
    display: "flex"
    }}>
      {props.children}
    </div>
  );
}
