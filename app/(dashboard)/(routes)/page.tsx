import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <UserButton afterSignOutUrl="/" />
      <p className="text-3xl text-sky-500 font-medium">Hello world</p>
      <Button variant={"destructive"}>Click me</Button>
    </div>
  );
}
