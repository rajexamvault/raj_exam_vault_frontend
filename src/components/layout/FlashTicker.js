"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import announcementService from "@/services/announcementService";

export default function FlashTicker() {
  const [tickerAlerts, setTickerAlerts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTicker = async () => {
      try {
        const res = await announcementService.getFlashTicker();
        if (res.data?.alerts && res.data.alerts.length > 0) {
          setTickerAlerts(res.data.alerts);
        }
      } catch (err) {
        console.warn("Flash ticker notice:", err.message);
      }
    };
    fetchTicker();
  }, []);

  useEffect(() => {
    if (tickerAlerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerAlerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [tickerAlerts]);

  if (tickerAlerts.length === 0) return null;

  const current = tickerAlerts[currentIndex];

  return (
    <div className="bg-linear-to-r from-red-700 via-rose-600 to-red-800 text-white text-xs font-semibold py-1.5 px-4 shadow-xs relative overflow-hidden flex items-center justify-between z-40">
      <div className="flex items-center gap-2.5 max-w-5xl w-full truncate">
        <span className="bg-white text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 animate-pulse tracking-wide shadow-xs">
          ⚡ LIVE BREAKING
        </span>

        <div className="truncate flex items-center gap-2">
          {current.exam && (
            <span className="bg-red-950/40 text-red-200 text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0">
              {current.exam.shortName || current.exam.title}
            </span>
          )}
          <span className="truncate">{current.title}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-3">
        {current.officialPdfUrl ? (
          <a
            href={current.officialPdfUrl}
            target="_blank"
            rel="noreferrer"
            className="underline text-white hover:text-red-100 text-[11px] font-bold"
          >
            Download PDF →
          </a>
        ) : (
          <Link href="/announcements" className="underline text-white hover:text-red-100 text-[11px] font-bold">
            View Notice →
          </Link>
        )}
      </div>
    </div>
  );
}
