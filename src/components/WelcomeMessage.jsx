import Strings from "@/utils/strings";

export default function WelcomeMessage() {
  return (
    <div className="bg-rerr p-4">
      <h1 className="text-white">{Strings.welcomeMessage}</h1>
    </div>
  )
}