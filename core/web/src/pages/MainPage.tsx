import AcceptButton from "../components/AcceptButton";
import BackButton from "../components/BackButton";

export default function MainPage() {
  return(
    <div>
      <h1>Main Page</h1>
      <AcceptButton text="Accept" />
      <BackButton text="Back" />
    </div>
  );
}