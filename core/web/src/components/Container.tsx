export default function Container(props: any) {
  return (

    <form style={{
    background: "linear-gradient(90deg, #2d86d1 0%, #34d399 100%)",
    padding: "2rem",
    borderRadius: "27px",
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
  }}>
      {props.children}
    </form>
  );
}
