"use client";
import { useEffect, useState } from "react";
import styles from "../styles/vote.module.css";
import { supabase } from "@/utils/supabase";
import ContestantCard from "./ContestantCard";

export default function VotePage() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdownTime, setCountdownTime] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });
  const [countdownEnded, setCountdownEnded] = useState<boolean>(false);

  // Fetch contestants once
  useEffect(() => {
    async function fetchContestants() {
      setLoading(true);
      const { data, error } = await supabase.from("contestant").select("*");
      if (error) {
        setContestants([]);
      } else {
        setContestants(data || []);
      }
      setLoading(false);
    }
    fetchContestants();
  }, []);

  // Countdown logic
  useEffect(() => {
    let serverTime: number | null = null;
    let fetchedAt: number | null = null;

    // Fetch server time from WorldTimeAPI
    const fetchServerTime = async () => {
      try {
        const response = await fetch(
          "https://worldtimeapi.org/api/timezone/Etc/UTC"
        );
        if (!response.ok) {
          if (response.status === 429) {
            console.warn("API rate limited, using client time");
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        const utcDateTime = new Date(data.datetime);
        serverTime = utcDateTime.getTime();
        fetchedAt = Date.now();
      } catch (err) {
        console.error("Error fetching time from API:", err);
        serverTime = null;
        fetchedAt = null;
      }
    };

    const calculateCountdown = () => {
      let currentTime: number;

      if (serverTime !== null && fetchedAt !== null) {
        const elapsed = Date.now() - fetchedAt;
        currentTime = serverTime + elapsed;
      } else {
        currentTime = Date.now();
      }

      // Convert to Nigerian time (UTC+1)
      const nigerianTime = new Date(currentTime + 1 * 60 * 60 * 1000);

      // Debug log
      console.log(
        "Nigerian time:",
        nigerianTime.toLocaleTimeString("en-NG", {
          timeZone: "Africa/Lagos",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );

      // Calculate midnight (today or tomorrow depending on current time)
      const midnight = new Date(nigerianTime);
      midnight.setHours(0, 0, 0, 0); // today 00:00

      if (nigerianTime.getTime() >= midnight.getTime()) {
        // Already past today’s midnight → move to next day
        midnight.setDate(midnight.getDate() + 1);
      }

      const diff = midnight.getTime() - nigerianTime.getTime();

      if (diff <= 0) {
        setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
        setCountdownEnded(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownTime({ hours, minutes, seconds });
      setCountdownEnded(false);
    };

    // Fetch server time once on mount
    fetchServerTime();

    // Update countdown every second
    const interval = setInterval(calculateCountdown, 1000);
    calculateCountdown(); // run immediately

    // Refetch server time every 30 minutes to prevent drift
    const refetchInterval = setInterval(fetchServerTime, 30 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearInterval(refetchInterval);
    };
  }, []);

  // Sort by votes descending
  const sorted = [...contestants].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <main className={styles.content}>
      {/* Countdown Card */}
      <div className={styles.voteHeader}>
        <h1 className={styles.voteTitle}>Vote for Your Favourite Contestant</h1>
        <div className={styles.voteSubtitle}>
          <p>
            Show your support by picking the contestant you love and cast your
            vote.
          </p>
          <p>Every vote helps them move closer to the crown.</p>
        </div>
      </div>

      <div className={`${styles.countdownCard} ${countdownEnded ? styles.ended : ""}`}>
        <p className={styles.countdownLabel}>
          {countdownEnded ? "Voting Closed" : "Time Until Voting Closes"}
        </p>
        <div className={styles.countdownDisplay}>
          <div className={styles.countdownUnit}>
            <span>{String(countdownTime.minutes).padStart(2, "0")}</span>
            <span>Minutes</span>
          </div>
          <span className={styles.countdownSeparator}>:</span>
          <div className={styles.countdownUnit}>
            <span>{String(countdownTime.seconds).padStart(2, "0")}</span>
            <span>Seconds</span>
          </div>
        </div>
      </div>

      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{contestants.length}</div>
          <div className={styles.statLabel}>Total Contestants</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{totalVotes}</div>
          <div className={styles.statLabel}>Total Votes</div>
        </div>
      </div>

      <div className={styles.voteList}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : (
          sorted.map((c, idx) => (
            <ContestantCard key={c.id || idx} contestant={c} totalVotes={totalVotes} />
          ))
        )}
      </div>
    </main>
  );
}
