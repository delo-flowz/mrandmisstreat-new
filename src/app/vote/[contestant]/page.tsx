"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '@/app/styles/vote.module.css';
import { supabase } from '@/utils/supabase';

const COST_PER_VOTE = 100; // Cost in Naira

export default function ContestantPage() {
  const params = useParams();
  const numberFromParam = decodeURIComponent((params?.contestant as string) || '');
  const [contestant, setContestant] = useState<any | null>(null);
  const [votes, setVotes] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [votingDisabled, setVotingDisabled] = useState<boolean>(false);
  const [countdownTime, setCountdownTime] = useState<{hours: number, minutes: number, seconds: number}>({hours: 0, minutes: 0, seconds: 0});
  const [countdownEnded, setCountdownEnded] = useState<boolean>(false);

  const totalCost = votes * COST_PER_VOTE;

  // Calculate countdown to 12am Nigerian time (WAT - UTC+1)
 useEffect(() => {
    let serverTime: number | null = null;
    let fetchedAt: number | null = null;
    let retryCount = 0;

    const fetchServerTime = async () => {
      try {
        // Fetch UTC time from World Time API once
        const response = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC');
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('API rate limited, using client time');
            return;
          }
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Parse the datetime string to get UTC time
        const utcDateTime = new Date(data.datetime);
        serverTime = utcDateTime.getTime();
        fetchedAt = Date.now();
        retryCount = 0; // Reset retry count on success
      } catch (err) {
        console.error('Error fetching time from API:', err);
        // Use client time if API fails
        serverTime = null;
        fetchedAt = null;
      }
    };

    const calculateCountdown = () => {
      let currentTime: number;

      if (serverTime !== null && fetchedAt !== null) {
        // Use server time + elapsed client time
        const elapsed = Date.now() - fetchedAt;
        currentTime = serverTime + elapsed;
      } else {
        // Fallback to client time
        currentTime = Date.now();
      }

      // Convert to Nigerian time (UTC+1)
      const nigerianTime = new Date(currentTime + (1 * 60 * 60 * 1000));
      
      // Set target time to 9:00 PM today in Nigerian time
      const targetTime = new Date(nigerianTime);
      targetTime.setHours(0, 10, 0, 0); // Set to 9:00 PM (22:00)
      
      const diff = targetTime.getTime() - nigerianTime.getTime();
      
      if (diff <= 0) {
        setCountdownTime({ hours: 0, minutes: 0, seconds: 0 });
        setVotingDisabled(true);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setCountdownTime({ hours, minutes, seconds });
        setVotingDisabled(false);
      }
    };

    // Fetch server time once on mount
    fetchServerTime();

    // Update countdown every second using stored time
    const interval = setInterval(calculateCountdown, 1000);
    
    // Also calculate immediately
    setTimeout(() => calculateCountdown(), 100);

    // Refetch server time every 30 minutes to prevent drift (reduce API calls)
    const refetchInterval = setInterval(fetchServerTime, 30 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      clearInterval(refetchInterval);
    };
  }, []);

  useEffect(() => {
    async function fetchContestant() {
      if (!numberFromParam) return;
      try {
        // Try to fetch by contestant_number first
        let { data, error } = await supabase
          .from('contestant')
          .select('*')
          .eq('contestant_number', numberFromParam)
          .limit(1)
          .single();
        
        // If not found, try contestantNumber
        if (error) {
          const result = await supabase
            .from('contestant')
            .select('*')
            .eq('contestantNumber', numberFromParam)
            .limit(1)
            .single();
          data = result.data;
          error = result.error;
        }
        
        // If still not found, try number
        if (error) {
          const result = await supabase
            .from('contestant')
            .select('*')
            .eq('number', numberFromParam)
            .limit(1)
            .single();
          data = result.data;
          error = result.error;
        }

        if (!error && data) {
          setContestant(data);
          setError('');
        } else {
          setError('Contestant not found');
          console.error('Error fetching contestant:', error);
        }
      } catch (err) {
        setError('Failed to load contestant');
        console.error('Unexpected fetch error', err);
      }
    }
    fetchContestant();
  }, [numberFromParam]);

  async function createPayment(amount: number, contestantId: any, contestantName: string) {
    const payload = { votes: amount, contestantId, name: contestantName };
    const response = await fetch('/api/create-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`Payment creation failed with status ${response.status}`);
    return response.json();
  }

  const handleVoteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0) {
      setVotes(Math.max(1, value));
    }
  };

  const incrementVotes = () => setVotes(prev => prev + 1);
  const decrementVotes = () => setVotes(prev => Math.max(1, prev - 1));

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `Vote for ${contestant?.name}`,
      text: `Support ${contestant?.name} in the Mr & Miss Treat Pageantry Contest. Every vote takes them a step closer to the crown.`,
      url,
    };

    try {
      // Prefer native share when available
      if (navigator.share) {
        await navigator.share(shareData as any);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
        return;
      }

      // Try Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setShared(true);
        setTimeout(() => setShared(false), 3000);
        return;
      }

      // Fallback: create a temporary textarea and use execCommand('copy')
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (successful) {
        setShared(true);
        setTimeout(() => setShared(false), 3000);
      } else {
        // Last resort: prompt the user with the link to copy manually
        // eslint-disable-next-line no-alert
        alert(`Copy this link to share: ${url}`);
      }
    } catch (err) {
      console.error('Share error:', err);
      // eslint-disable-next-line no-alert
      alert(`Unable to share automatically. Copy this link: ${url}`);
    }
  };

  const handleMakePayment = async () => {
    if (!contestant || votes < 1) {
      setError('Please enter a valid number of votes');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const res = await createPayment(votes, contestant.id, contestant.name);
      console.log('Payment created', res);
      if (res.paymentLink) {
        window.location.href = res.paymentLink;
      } else {
        setError('Payment link not received. Please try again.');
      }
    } catch (err) {
      console.error('Payment error', err);
      setError('Unable to process payment. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!contestant) {
    return (
      <main className={styles.content}>
        <div className={styles.profileContainer}>
          <div className={styles.profileHeader}>
            <h1 className={styles.voteTitle}>Loading...</h1>
          </div>
          <div style={{ padding: '40px', textAlign: 'center', color: '#ddd' }}>
            {error ? error : 'Please wait while we load the contestant profile...'}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.content}>
      <div className={styles.profileContainer}>
         <h1 className={styles.voteTitle}>Mr and Miss Treat <p>Contestant Voting</p></h1>
        <div className={styles.profileHeader}>
          <h1 className={styles.contestantName}>{contestant.name}</h1>
          <h2 className={styles.contestantNumber}>{contestant.state}</h2>
          <p className={styles.contestantNumber}>
            Contestant No. {contestant.contestant_number ?? contestant.contestantNumber ?? contestant.number ?? '-'}
          </p>
        </div>

        <div className={`${styles.countdownCard} ${votingDisabled ? styles.ended : ''}`} style={{ marginBottom: '16px' }}>
          <p className={styles.countdownLabel}>{votingDisabled ? 'Voting Closed' : 'Time Until Voting Closes'}</p>
          <div className={styles.countdownDisplay}>
            <div className={styles.countdownUnit}>
              <span>{String(countdownTime.hours).padStart(2, '0')}</span>
              <span>Hours</span>
            </div>
            <span className={styles.countdownSeparator}>:</span>
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

        <div className={styles.profileBody}>
          <div className={styles.imageContainer}>
            <img 
              src={contestant.image} 
              alt={contestant.name} 
              className={styles.profileImage} 
            />
          </div>

          <div className={styles.detailsContainer}>
          <div className={styles.cardInfoRow}>
	        <span className={styles.cardPercent}>Current Votes</span>
	        <span className={styles.cardVotes}>{contestant.votes}</span>
	      </div> 

            <div className={styles.voteSection}>
              <label htmlFor="vote-count">Input Number of Votes</label>
              <p style={{ margin: '8px 0', color: '#ffd700', fontSize: '0.9rem' }}>
                ₦{COST_PER_VOTE.toLocaleString()} per vote
              </p>
              <input
                id="vote-count"
                type="number"
                min={1}
                value={votes}
                onChange={handleVoteChange}
                placeholder="Enter number of votes"
              />
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                <button 
                  className={styles.qtyButton} 
                  onClick={decrementVotes}
                  aria-label="Decrease votes"
                >
                  −
                </button>
                <button 
                  className={styles.qtyButton} 
                  onClick={incrementVotes}
                  aria-label="Increase votes"
                >
                  +
                </button>
              </div>
              <p style={{ margin: '12px 0 0 0', color: '#ff8c00', fontSize: '0.95rem', fontWeight: '600' }}>
                Total Cost: ₦{totalCost.toLocaleString()}
              </p>
              {error && (
                <p style={{ color: '#ff6b6b', fontSize: '0.9rem', margin: '8px 0 0 0' }}>
                  {error}
                </p>
              )}
              <button 
                className={styles.voteButton} 
                onClick={handleMakePayment} 
                disabled={processing || votes < 1 || votingDisabled}
              >
                {processing ? 'Processing...' : votingDisabled ? 'Voting Disabled' : `Vote Now (₦${totalCost.toLocaleString()})`}
              </button>
            </div>

            <button 
              className={styles.shareButton} 
              onClick={handleShare}
              title="Share this contestant"
            >
                {shared ? (
                  '✓ Link Copied!'
                ) : (
                  <>
                    <img src="/share.png" alt="Share" className={styles.shareIcon} />
                    Share Contestant
                  </>
                )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
