"use client";
import { useEffect, useState } from 'react';
import styles from '../styles/vote.module.css';
import { supabase } from '@/utils/supabase';
import ContestantCard from './ContestantCard';
export default function VotePage() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [countdownTime, setCountdownTime] = useState<{hours: number, minutes: number, seconds: number}>({hours: 0, minutes: 0, seconds: 0});
  const [countdownEnded, setCountdownEnded] = useState<boolean>(false);

  useEffect(() => {
    async function fetchContestants() {
      setLoading(true);
      const { data, error } = await supabase
        .from('contestant')
        .select('*');
      if (error) {
        setContestants([]);
      } else {
        setContestants(data || []);
      
            }
            setLoading(false);
          }
          fetchContestants();
        }, []);

        // Calculate countdown to 12am Nigerian time (WAT - UTC+1)
  useEffect(() => {
    const calculateCountdown = async () => {
      try {
        // Fetch UTC time from World Time API
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        const data = await response.json();
        
        // Parse the datetime string to get UTC time
        const utcDateTime = new Date(data.datetime);
        
        // Convert to Nigerian time (UTC+1)
        const nigerianTime = new Date(utcDateTime.getTime() + (1 * 60 * 60 * 1000));
        
        // Calculate midnight (12:00am) at the end of today in Nigerian time
        const midnight = new Date(nigerianTime);
        midnight.setDate(midnight.getDate() + 1); // Move to next day
        midnight.setHours(0, 0, 0, 0); // Set to 00:00 (12:00am)
        
        const diff = midnight.getTime() - nigerianTime.getTime();
        
        if (diff <= 0) {
          setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
          setCountdownEnded(true);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          
          setCountdownTime({ hours, minutes, seconds });
          // Disable when minutes reach 00
          if (minutes === 0 && seconds === 0) {
            setCountdownEnded(true);
          } else {
            setCountdownEnded(false);
          }
        }
      } catch (err) {
        console.error('Error fetching time from API:', err);
        // Fallback to client time if API fails
        const now = new Date();
        const nigerianTime = new Date(now.toLocaleString('en-US', { timeZone: 'Africa/Lagos' }));
        const midnight = new Date(nigerianTime);
        midnight.setDate(midnight.getDate() + 1);
        midnight.setHours(0, 0, 0, 0);
        
        const diff = midnight.getTime() - nigerianTime.getTime();
        
        if (diff <= 0) {
          setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
          setCountdownEnded(true);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setCountdownTime({ hours, minutes, seconds });
          // Disable when minutes reach 00
          if (minutes === 0 && seconds === 0) {
            setCountdownEnded(true);
          } else {
            setCountdownEnded(false);
          }
        }
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    
    return () => clearInterval(interval);
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
                Show your support by picking the contestant you love and cast your vote. 
              </p>
              <p>
                Every vote helps them move closer to the crown. 
              </p>
          
              
              </div>
          
            </div>
            <div className={`${styles.countdownCard} ${countdownEnded ? styles.ended : ''}`}>
              <p className={styles.countdownLabel}>
                {countdownEnded ? ' Voting Closed' : ' Time Until Voting Closes'}
              </p>
              <div className={styles.countdownDisplay}>
                <div className={styles.countdownUnit}>
                  <span>{String(countdownTime.minutes).padStart(2, '0')}</span>
                  <span>Minutes</span>
                </div>
                <span className={styles.countdownSeparator}>:</span>
                <div className={styles.countdownUnit}>
                  <span>{String(countdownTime.seconds).padStart(2, '0')}</span>
                  <span>Seconds</span>
                </div>
              </div>
            </div>
              {/* 
            */}
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