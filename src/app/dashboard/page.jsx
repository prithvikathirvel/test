import Strings from "@/utils/strings";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold">{Strings.dashboard}</h1>
      <p>{Strings.welcomeToDashboard}</p>
    </div>
  );
}