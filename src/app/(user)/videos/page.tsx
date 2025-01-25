"use client"
import { useRouter } from 'next/navigation';
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
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortDown, faSortUp } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import copy from 'clipboard-copy';
import { jsPDF } from "jspdf";


type VideoData = {
  title: string;
  url: string;
  thumbnails: { url: string; height: number; width: number }[];
};

// Function to export transcript to PDF



export default function Videos() {

  const [videodata, setVideodata] = useState<VideoData[]>([]);
  useEffect(() => {
    fetch("http://10.6.0.61:8001/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        playlist_link: "https://www.youtube.com/playlist?list=PLdzqwsgWJ4p7QdqJci5Ok9GYKjKY5FKz6"
      }),
    })

      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          alert("Error Occured");
        }
        else {
          console.log(data)
          setVideodata(data.playlist)
        }
      });


  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-900">
      <div className="text-3xl md:text-4xl lg:text-5xl text-white text-center p-3 my-4 font-bold ">Lecture Videos</div>
      <ScrollArea className="w-full flex-col rounded-md border border-4 p-4 text-white grow justify-center items-center ">
        {videodata.length > 0 ? (
          videodata.map((item, index) => (
            <VideoCardComponent Title={item.title} link={item.url} thumbnailurl={item.thumbnails[0].url} key={index} />
          ))
        ) : (
          <div className="flex justify-center items-center w-full h-[80vh]">
            <Spinner />
          </div>
        )}
      </ScrollArea>
    </div>

  );
}


const VideoCardComponent = ({ Title, link, thumbnailurl, key }: { Title: string, link: string, thumbnailurl: string, key: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  

  const handleNavigate = () => {
    const urlToEncode = link;
    const encodedUrl = encodeURIComponent(urlToEncode);

    router.push(`/chatbot/${encodedUrl}/${Title}`);
  };




  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add a bold title at the top center of the first page
    const margin = 10; // Page margin
    const pageWidth = doc.internal.pageSize.getWidth(); // Get the page width
    const pageHeight = doc.internal.pageSize.getHeight(); // Get the page height
    const textWidth = pageWidth - 2 * margin; // Subtract the margins
    const title = `Transcript of ${Title}`;

    // Set font for the title (bold, size 16)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);

    // Center the title on the page
    const titleWidth = doc.getTextWidth(title); // Get the width of the title text
    const titleX = (pageWidth - titleWidth) / 2; // Calculate X position to center the title
    doc.text(title, titleX, margin + 10); // Add title at the top center

    // Set font for the transcript (normal, size 12)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    // Split the transcript into multiple lines that fit the page width
    const lines = doc.splitTextToSize(transcript, textWidth);

    // Starting position for the text
    let y = margin + 20; // Initial Y position after the title

    // Loop through the lines and add them to the PDF
    for (let i = 0; i < lines.length; i++) {
      // If the current line goes beyond the page height, add a new page
      if (y + 10 > pageHeight - margin) {
        doc.addPage();
        y = margin + 10; // Reset Y position for the new page
      }

      // Add the line to the PDF at the current Y position
      doc.text(lines[i], margin, y);
      y += 10; // Increment the Y position for the next line
    }

    // Save the PDF with the title as the filename
    doc.save(`${Title}-transcript.pdf`);
  };

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const getTranscript = () => {
    setLoading(true)
    fetch("http://10.6.0.61:8001/transcript", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_link: link
      }),
    })

      .then((response) => response.json())
      .then((data) => {
        setLoading(false)
        if (data.error) {
          alert("Error Occured");
        }
        else {
          console.log(data)
          setTranscript(data.transcript)
          openDrawer()
        }
      });
  }
  return (
    <Card className="flex flex-col md:flex-row items-center justify-between my-4"  >
      <CardHeader className="flex flex-row items-center justify-between w-full gap-3">
        <div className="flex flex-row items-center gap-3">
          <img className="" src={thumbnailurl} width={100} height={100} onClick={() => router.push(link)}/>
          <CardTitle className="text-[13px] md:text-[16px]">{Title}</CardTitle>
        </div>


        <FontAwesomeIcon className="flex md:hidden pb-2" icon={isExpanded ? faSortUp : faSortDown} onClick={() => setIsExpanded(!isExpanded)} />


      </CardHeader>
      <div className="flex flex-col md:flex-row items-center justify-between md:justify-around w-full md:w-fit">

        {isExpanded && (
          <div className="flex  md:hidden flex-row justify-between  w-full md:w-fit text-center items-center p-3">
            <Button variant="secondary" className="bg-gray-700 text-white md:mr-4" onClick={getTranscript}>
              Transcript {loading && <Spinner />}
            </Button>
            <Button variant="secondary" className="bg-blue-400 text-white" onClick={() => handleNavigate()}>
              Chat
            </Button>
          </div>
        )}

        <div className="hidden md:flex flex-row justify-between md:justify-around w-full md:w-fit text-center items-center">
          <Button variant="secondary" className="bg-gray-700  text-white md:mr-4" onClick={getTranscript}>
            Transcript {loading && <Spinner />}
          </Button>
          <Button variant="secondary" className="bg-blue-400 text-white md:mr-4" onClick={() => handleNavigate()}>
            Chat
          </Button>
        </div>
      </div>
      {transcript !== "" &&

        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent className="flex flex-col h-[75vh]">
            <DrawerHeader>
              <DrawerTitle className='text-center md:text-3xl sm:text-lg mt-5 font-bold'>Transcript of {Title}</DrawerTitle>
            </DrawerHeader>
            <DrawerFooter className="flex-grow overflow-hidden items-end">
              <div>
                <Button

                  onClick={async () => {
                    if (window.isSecureContext && navigator.clipboard) {
                      await navigator.clipboard.writeText(transcript);
                    }
                    else {
                      await copy(transcript);
                    }

                    alert("Copied to clipboard");
                  }}
                  className="relative mr-3 bg-blue-400"
                >
                  Copy
                </Button>

                <Button
                  onClick={async () => {
                    exportToPDF();
                  }}
                  className="relative bg-gray-600"
                >
                  Export PDF
                </Button>
              </div>


              <ScrollArea className="w-full h-full max-h-[60vh] flex-col rounded-md border p-8 overflow-y-auto text-black">
                {transcript}
              </ScrollArea>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>


      }
    </Card>

  )
}