import Navbar from "@/components/Navbar";
import Landing from "./(nondashboard)/landing/page";
import { NAVBAR_HEIGHT } from "@/lib/constants";

export default function Home() {
  return (
    <div className="h-full w-full">
      <Navbar></Navbar>
      <main className={`h-full flex w-full flex-col`}>
        <Landing></Landing>
      </main>
    </div>
  );
}
