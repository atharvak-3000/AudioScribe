"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { getSummaries, SummaryEntry } from "@/lib/summaryHistory";
import { cn } from "@/lib/utils";
import { FileText, Users, Calendar, TrendingUp } from "lucide-react";

interface WeeklyData {
  week: string;
  count: number;
}

interface SpeakerStat {
  name: string;
  count: number;
}

const AnalyticsPage = () => {
  const [summaries, setSummaries] = useState<SummaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = getSummaries();
    setSummaries(data);
    setIsLoading(false);
  }, []);

  const totalMeetings = summaries.length;

  const mostRecentDate = useMemo(() => {
    if (summaries.length === 0) return null;
    const dates = summaries.map((s) => new Date(s.date).getTime());
    const maxTime = Math.max(...dates);
    return new Date(maxTime).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [summaries]);

  const weeklyData: WeeklyData[] = useMemo(() => {
    const now = new Date();
    const weeks: WeeklyData[] = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - i * 7);
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const count = summaries.filter((s) => {
        const date = new Date(s.date);
        return date >= weekStart && date <= weekEnd;
      }).length;

      const weekLabel = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      weeks.push({ week: weekLabel, count });
    }

    return weeks;
  }, [summaries]);

  const topSpeakers: SpeakerStat[] = useMemo(() => {
    const speakerCounts = new Map<string, number>();

    for (const summary of summaries) {
      // Look for highlighted names (between **)
      const matches = summary.summary.match(/\*\*([^*]+)\*\*/g);
      if (matches) {
        for (const match of matches) {
          const name = match.replace(/\*\*/g, "").trim();
          // Filter out non-name patterns (like headers)
          if (
            name.length > 1 &&
            name.length < 30 &&
            !name.toLowerCase().includes("summary") &&
            !name.toLowerCase().includes("action items") &&
            !name.toLowerCase().includes("key points") &&
            !name.toLowerCase().includes("decisions") &&
            !name.toLowerCase().includes("next steps") &&
            !name.match(/^\d+$/)
          ) {
            speakerCounts.set(name, (speakerCounts.get(name) || 0) + 1);
          }
        }
      }
    }

    return Array.from(speakerCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [summaries]);

  if (isLoading) {
    return (
      <section className="flex size-full flex-col gap-10 text-white p-6">
        <h1 className="text-3xl font-bold">Meeting Analytics</h1>
        <div className="flex items-center justify-center h-64">
          <p className="text-sky-2">Loading...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex size-full flex-col gap-10 text-white p-6">
      <h1 className="text-3xl font-bold">Meeting Analytics</h1>

      {summaries.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <TrendingUp className="w-16 h-16 text-sky-2 opacity-50" />
          <p className="text-sky-2 text-lg">No data available yet.</p>
          <p className="text-sky-2 text-sm">
            Generate summaries to see analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-1 border border-dark-3 rounded-[14px] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-1 rounded-full">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sky-2 text-sm">Total Meetings</p>
                  <p className="text-3xl font-bold">{totalMeetings}</p>
                </div>
              </div>
            </div>

            <div className="bg-dark-1 border border-dark-3 rounded-[14px] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-600 rounded-full">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sky-2 text-sm">Most Recent Meeting</p>
                  <p className="text-xl font-bold">
                    {mostRecentDate || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-dark-1 border border-dark-3 rounded-[14px] p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sky-2 text-sm">Unique Speakers</p>
                  <p className="text-3xl font-bold">{topSpeakers.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-dark-1 border border-dark-3 rounded-[14px] p-6">
            <h2 className="text-xl font-semibold mb-6">Summaries Per Week (Last 4 Weeks)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="week"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1c1f2e",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="count" fill="#0e78f9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Speakers */}
          <div className="bg-dark-1 border border-dark-3 rounded-[14px] p-6">
            <h2 className="text-xl font-semibold mb-6">Top Speakers</h2>
            {topSpeakers.length > 0 ? (
              <div className="space-y-3">
                {topSpeakers.map((speaker, index) => (
                  <div
                    key={speaker.name}
                    className="flex items-center justify-between p-3 bg-dark-4 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                          index === 0 && "bg-yellow-500 text-yellow-900",
                          index === 1 && "bg-gray-400 text-gray-900",
                          index === 2 && "bg-orange-600 text-white",
                          index > 2 && "bg-dark-3 text-sky-2"
                        )}
                      >
                        {index + 1}
                      </span>
                      <span className="font-medium">{speaker.name}</span>
                    </div>
                    <span className="text-sky-2 text-sm">
                      {speaker.count} mentions
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sky-2 text-center py-8">
                No speaker data available. Make sure speaker names are highlighted in summaries.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default AnalyticsPage;
