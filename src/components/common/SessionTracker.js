"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import API_BASE_URL from "@/lib/api";

export default function SessionTracker() {
  const pathname = usePathname();
  const heartbeatTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const sendHeartbeat = (event = "ping") => {
      try {
        const sessionId = localStorage.getItem("raj_session_id");
        if (!sessionId) return;

        const payload = JSON.stringify({
          sessionId,
          currentPath: pathname || window.location.pathname,
          event
        });

        const url = `${API_BASE_URL}/monitoring/heartbeat`;

        if (event === "leave" && navigator.sendBeacon) {
          const blob = new Blob([payload], { type: "application/json" });
          navigator.sendBeacon(url, blob);
        } else {
          fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-session-id": sessionId
            },
            body: payload,
            keepalive: true
          }).catch(() => {});
        }
      } catch (_) {}
    };

    // Immediate ping on route change
    sendHeartbeat("ping");

    // Periodic heartbeat every 25 seconds to accurately record stay time
    heartbeatTimerRef.current = setInterval(() => {
      sendHeartbeat("ping");
    }, 25000);

    // Visibility & unload listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        sendHeartbeat("leave");
      } else {
        sendHeartbeat("ping");
      }
    };

    const handleBeforeUnload = () => {
      sendHeartbeat("leave");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [pathname]);

  return null;
}
