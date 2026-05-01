"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { avatarImages } from "@/constants";
import { useToast } from "./ui/use-toast";
import { saveSummary } from "@/lib/summaryHistory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Loader, Download, Share2, CheckSquare } from "lucide-react";

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
  callId?: string;
}

interface SummaryRendererProps {
  summary: string;
}

const SummaryRenderer = ({ summary }: SummaryRendererProps) => {
  const parts = summary.split(/\*\*([^*]+)\*\*/);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return (
            <span
              key={index}
              className="font-semibold bg-yellow-200 text-yellow-900 rounded px-1"
            >
              {part}
            </span>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};

interface ActionItemsProps {
  summary: string;
}

const ActionItems = ({ summary }: ActionItemsProps) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  // Extract action items from summary
  const extractActionItems = (text: string): string[] => {
    const items: string[] = [];
    const lines = text.split('\n');
    let inActionItems = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().includes('action items')) {
        inActionItems = true;
        continue;
      }
      if (inActionItems) {
        if (trimmed === '' || trimmed.match(/^#+ /)) {
          inActionItems = false;
          continue;
        }
        const cleaned = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
        if (cleaned && cleaned.length > 3) {
          items.push(cleaned);
        }
      }
    }

    // Fallback: look for bullet points or numbered items anywhere
    if (items.length === 0) {
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.match(/^[-*•]\s+/) || trimmed.match(/^\d+\.\s+/)) {
          const cleaned = trimmed.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
          if (cleaned && cleaned.length > 5 && !cleaned.toLowerCase().includes('summary')) {
            items.push(cleaned);
          }
        }
      }
    }

    return items;
  };

  const actionItems = extractActionItems(summary);

  const toggleItem = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  if (actionItems.length === 0) {
    return (
      <div className="text-sky-2 text-center py-8">
        No action items found in this summary.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actionItems.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg bg-dark-4 border border-dark-3 cursor-pointer hover:bg-dark-3 transition-colors"
          onClick={() => toggleItem(index)}
        >
          <div className="mt-0.5">
            {checkedItems.has(index) ? (
              <div className="w-5 h-5 rounded bg-green-500 flex items-center justify-center">
                <CheckSquare className="w-4 h-4 text-white" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded border-2 border-sky-2" />
            )}
          </div>
          <span
            className={cn(
              "text-sky-2 flex-1",
              checkedItems.has(index) && "line-through opacity-50"
            )}
          >
            {item}
          </span>
        </div>
      ))}
    </div>
  );
};

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
  callId,
}: MeetingCardProps) => {
  const { toast } = useToast();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'actionItems'>('summary');
  const [savedId, setSavedId] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!link || !isRecording) return;

    console.log("[MeetingCard] Starting summarization with callId:", callId);
    if (!callId) {
      console.warn("[MeetingCard] callId is undefined! Cannot map speakers to usernames.");
    }

    setIsSummarizing(true);
    try {
      const requestBody = {
        recordingUrl: link,
        recordingId: recordingId || link,
        callId,
      };
      console.log("[MeetingCard] Sending request body:", requestBody);

      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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

      // Auto-save to history
      const entry = saveSummary(title, date, data.summary, callId);
      setSavedId(entry.id);

      toast({
        title: "Summary Generated",
        description: "Meeting summary has been created and saved to history.",
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

  const downloadPDF = () => {
    if (!summary) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Meeting Summary", pageWidth / 2, 30, { align: "center" });

    // Subtitle
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`${title}`, pageWidth / 2, 45, { align: "center" });
    doc.text(`${date}`, pageWidth / 2, 55, { align: "center" });

    // Body
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");

    // Process summary to handle bold sections
    const lines = summary.split('\n');
    let y = 75;
    const lineHeight = 6;

    for (const line of lines) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      // Check if line is a header (starts with ** or contains "Summary:" or "Action Items:")
      const isHeader = line.startsWith('**') || line.match(/^(Summary|Action Items|Key Points|Decisions|Next Steps):/i);

      if (isHeader) {
        doc.setFont("helvetica", "bold");
        const cleanLine = line.replace(/\*\*/g, '');
        const splitLines = doc.splitTextToSize(cleanLine, contentWidth);
        doc.text(splitLines, margin, y);
        y += splitLines.length * lineHeight + 2;
        doc.setFont("helvetica", "normal");
      } else {
        const cleanLine = line.replace(/\*\*/g, '');
        const splitLines = doc.splitTextToSize(cleanLine, contentWidth);
        doc.text(splitLines, margin, y);
        y += splitLines.length * lineHeight;
      }
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(128, 128, 128);
      doc.text("Generated by AudioScribe", pageWidth / 2, 285, { align: "center" });
      doc.setTextColor(0, 0, 0);
    }

    const dateStr = new Date().toISOString().split('T')[0];
    doc.save(`meeting-summary-${dateStr}.pdf`);

    toast({
      title: "PDF Downloaded",
      description: "Meeting summary has been saved as PDF.",
    });
  };

  const shareSummary = () => {
    if (!summary) return;

    try {
      const encoded = btoa(encodeURIComponent(summary));
      const shareUrl = `${window.location.origin}/summary/${encoded}`;

      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Share link copied",
        description: "The shareable link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive",
      });
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-dark-1 border-dark-3 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Meeting Summary
            </DialogTitle>
            <DialogDescription className="text-sky-1">
              {title} — {date}
            </DialogDescription>
          </DialogHeader>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button
              onClick={downloadPDF}
              className="bg-green-600 hover:bg-green-700 px-4"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={shareSummary}
              className="bg-blue-600 hover:bg-blue-700 px-4"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => setActiveTab(activeTab === 'summary' ? 'actionItems' : 'summary')}
              className="bg-purple-600 hover:bg-purple-700 px-4"
              size="sm"
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              {activeTab === 'summary' ? 'Action Items' : 'View Summary'}
            </Button>
          </div>

          {/* Tab Content */}
          <div className="mt-4">
            {activeTab === 'summary' ? (
              <div className="whitespace-pre-wrap text-base leading-relaxed text-sky-2">
                {summary ? (
                  <SummaryRenderer summary={summary} />
                ) : (
                  "No summary available."
                )}
              </div>
            ) : (
              <ActionItems summary={summary || ''} />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MeetingCard;
