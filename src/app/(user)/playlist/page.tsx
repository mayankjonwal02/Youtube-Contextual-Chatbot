import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


export default function Playlist() {
  return (
    <div className="flex flex-col h-screen w-screen">
      <div className="text-3xl text-white text-center">Playlists</div>
      <ScrollArea className="w-full flex-col rounded-md border p-4 text-white grow">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          
        </Card>


      </ScrollArea>
    </div>

  );
}
