"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import styles from '../../styles/vote.module.css';
import { supabase } from '@/utils/supabase';

const COST_PER_VOTE = 100; // Cost in Naira

export default function ContestantPage() {
  const params = useParams();
  const nameFromParam = decodeURIComponent((params?.contestant as string) || '');
  const [contestant, setContestant] = useState<any | null>(null);
  const [votes, setVotes] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const totalCost = votes * COST_PER_VOTE;

  useEffect(() => {
    async function fetchContestant() {
      if (!nameFromParam) return;
      try {
        const { data, error } = await supabase
          .from('contestant')
          .select('*')
          .eq('name', nameFromParam)
          .limit(1)
          .single();
        if (!error) {
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
  }, [nameFromParam]);

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
      text: `Support ${contestant?.name} in the Mr & Miss Treat Contest! Every vote counts.`,
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
         <h1 className={styles.voteTitle}>Mr and Miss Treat Nigeria</h1>
        <div className={styles.profileHeader}>
          <h1 className={styles.contestantName}>{contestant.name}</h1>
          <h2 className={styles.contestantName}>{contestant.state}</h2>
          <p className={styles.contestantNumber}>
            Contestant No. {contestant.contestant_number ?? contestant.contestantNumber ?? contestant.number ?? '-'}
          </p>
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
                disabled={processing || votes < 1}
              >
                {processing ? 'Processing...' : `Vote Now (₦${totalCost.toLocaleString()})`}
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
