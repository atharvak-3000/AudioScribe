"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader } from "lucide-react";

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
  isRecording?: boolean;
  recordingId?: string;
}

const MeetingCard = ({
  icon,
  title,
  date,
  isPreviousMeeting,
  buttonIcon1,
  handleClick,
  link,
  buttonText,
  isRecording = false,
  recordingId,
}: MeetingCardProps) => {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);

  const handleSummarize = async () => {
    if (!link || !isRecording) return;

    setIsSummarizing(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recordingUrl: link,
          recordingId: recordingId || link,
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setSummary(data.summary);
      setIsSummaryDialogOpen(true);
      toast({
        title: "Summary Generated",
        description: "Meeting summary has been created successfully.",
      });
    } catch (error) {
      console.error("Error summarizing meeting:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate summary. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-6 py-7 border border-dark-3 xl:max-w-[568px]">
      {/* Header */}
      <article className="flex flex-col gap-4">
        <Image src={icon} alt="icon" width={30} height={30} />

        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-sky-2">{date}</p>
          </div>
        </div>
      </article>

      {/* Avatars + Buttons */}
      <article className="flex justify-between items-center mt-4 flex-wrap gap-4">

        {/* Avatars */}
        <div className="relative flex items-center max-sm:hidden">
          {avatarImages.map((img, index) => (
            <div
              key={index}
              className="rounded-full overflow-hidden border-2 border-dark-1"
              style={{ marginLeft: index === 0 ? 0 : -15 }}
            >
              <Image
                src={img}
                alt="attendee"
                width={40}
                height={40}
                className="object-cover"
              />
            </div>
          ))}

          <div className="ml-2 flex-center size-10 rounded-full bg-dark-4 text-white text-sm border border-dark-3">
            +5
          </div>
        </div>

        {/* Buttons */}
        {!isPreviousMeeting && (
          <div className="flex gap-2 flex-wrap justify-end ml-auto">

            {/* Join / Start Button */}
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6">
              {buttonIcon1 && (
                <Image
                  src={buttonIcon1}
                  alt="feature"
                  width={20}
                  height={20}
                  className="mr-2"
                />
              )}
              {buttonText}
            </Button>

            {/* Summarize Button */}
            {isRecording && (
              <Button
                onClick={summary ? () => setIsSummaryDialogOpen(true) : handleSummarize}
                disabled={isSummarizing}
                className="bg-purple-1 px-6"
              >
                {isSummarizing ? (
                  <>
                    <Loader className="animate-spin" width={20} height={20} />
                    <span className="ml-2">Summarizing...</span>
                  </>
                ) : summary ? (
                  <>
                    <Image
                      src="/icons/checked.svg"
                      alt="view summary"
                      width={20}
                      height={20}
                      className="mr-2"
                    />
                    View Summary
                  </>
                ) : (
                  "Summarize"
                )}
              </Button>
            )}

            {/* Copy Link */}
            <Button
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast({
                  title: "Link Copied",
                });
              }}
              className="bg-dark-4 px-6"
            >
              <Image
                src="/icons/copy.svg"
                alt="copy"
                width={20}
                height={20}
                className="mr-2"
              />
              Copy Link
            </Button>
          </div>
        )}
      </article>

      {/* Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={setIsSummaryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-dark-1 border-dark-3 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Meeting Summary
            </DialogTitle>
            <DialogDescription className="text-sky-1">
              {title} — {date}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="whitespace-pre-wrap text-base leading-relaxed text-sky-2">
              {summary || "No summary available."}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MeetingCard;
