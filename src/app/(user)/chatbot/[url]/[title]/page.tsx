"use client";
import { useRouter } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import Spinner from "@/components/Spinner";
import jsPDF from "jspdf";

export default function Chatbot({ params }: { params: Promise<{ url: string; title: string }> }) {
  const router = useRouter();

  const [chat, setChat] = useState<{ role: string; content: string; timestamp: string }[]>([]);
  const { url: encodedurl, title: encodedtitle } = use(params);
  const url = decodeURIComponent(encodedurl);
  const title = decodeURIComponent(encodedtitle);
  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null); // Ref to scrollable area

  // Automatically scroll to the bottom of the chat area when the chat updates
  useEffect(() => {
    if (chat.length > 0) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  const getResponse = async () => {
    if (question === "") {
      alert("Please enter a question");
      return;
    }

    const timestamp = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");

    const userMessage = {
      role: "user",
      content: question,
      timestamp: timestamp,
    };
    // Append user's question to the chat
    setChat((prevChat) => [...prevChat, userMessage]);
    setLoading(true);
    fetch("http://10.6.0.61:8001/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_link: url,
        question: question,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          alert("Error Occurred");
        } else {
          console.log(data);
          const assistantMessage = {
            role: "Assistant",
            content: data.content,
            timestamp: new Date().toISOString().replace(/T/, " ").replace(/\..+/, ""),
          };
          // Append assistant's response to the chat
          setChat((prevChat) => [...prevChat, assistantMessage]);
        }
      })
      .catch((error) => {
        console.error(error);
        alert("An error occurred while fetching the response.");
      });

    setQuestion(""); // Clear input after sending question
  };

  // Export chat as PDF
  const exportChatToPDF = () => {
    if (chat.length === 0) {
      alert("No chat to export.");
      return;
    }
  
    const doc = new jsPDF();
    let y = 10; // Y coordinate for PDF text
    const maxWidth = 180; // Maximum width to fit the text within page
    const lineHeight = 5; // Line height for proper spacing
  
    chat.forEach((message) => {
      const role = message.role === "user" ? "You" : "Assistant";
      const content = `${role}: ${message.content}`;
  
      // Adjust font size if text exceeds the max width
      let fontSize = 12;
      if (doc.getTextWidth(content) > maxWidth) {
        fontSize = 10; // Reduce font size if content is too wide
      }
  
      doc.setFontSize(fontSize);
  
      // Calculate the width and wrap text if necessary
      let textWidth = doc.getTextWidth(content);
      if (textWidth > maxWidth) {
        // Wrap text to fit within the page
        const lines = doc.splitTextToSize(content, maxWidth);
        doc.text(lines, 10, y);
        y += lines.length * (fontSize * 1.2); // Increase Y position based on the number of lines
      } else {
        // Single line text
        doc.text(content, 10, y);
        y += fontSize + lineHeight; // Move down for the next line
      }
  
      // Check if we need a new page after the current message
      if (y > 270) {
        doc.addPage(); // Add a new page if content exceeds current page
        y = 10; // Reset Y position for the new page
      }
    });
  
    doc.save("chat_transcript.pdf");
  };
  
  

  return (
    <div className="flex flex-col h-screen w-screen justify-center items-center p-4  bg-gray-900 text-white">
      {/* Chat Title */}
      <div className="text-2xl md:text-4xl font-bold text-center my-7">{title}</div>

      {/* Chat Area */}
      <ScrollArea
        className="w-full max-w-2xl flex-col rounded-md border border-gray-700 p-4 h-[60vh] overflow-y-auto bg-gray-800"
        id="chat"
      >
        {chat.length === 0 ? (
          <div className="text-center text-gray-500">No conversation yet. Start by asking a question!</div>
        ) : (
          chat.map((item, index) => (
            <div key={index} className="mb-4">
              <div
                className={`${item.role === "user" ? "text-blue-400" : "text-green-400"} font-bold`}
              >
                {item.role === "user" ? "You" : "Assistant"}:
              </div>
              <div className="ml-2 text-gray-200">{item.content}</div>
              <div className="text-xs text-gray-500">{item.timestamp}</div>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </ScrollArea>

      {/* Input Section */}
      <div className="flex flex-row w-full max-w-2xl items-center space-x-2 py-6">
        <Input
          type="text"
          placeholder="Enter your question..."
          className="grow bg-gray-800 text-white border border-gray-700 rounded-md p-2"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              getResponse(); // Trigger the send function
            }
          }}
        />
        <Button
          type="submit"
          onClick={getResponse}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
        >
          {loading ? <Spinner /> : <FontAwesomeIcon icon={faPaperPlane} />}
        </Button>
       
      </div>
      <Button
          onClick={exportChatToPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center"
        >
          <FontAwesomeIcon icon={faFilePdf} className="mr-2" />
          Export Chat
        </Button>
    </div>
  );
}
