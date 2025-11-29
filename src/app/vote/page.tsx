'use client';
import { useEffect, useState } from 'react';
import styles from '../styles/vote.module.css';
import { supabase } from '@/utils/supabase';
export async function createPayment(amount: number, contestantId: any, contestantName: string) {
  
   const payload = {
    votes: amount,      
    contestantId,
    name: contestantName,
  };

  const response = await fetch('/api/create-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Payment creation failed with status ${response.status}`);
  }

  const data = await response.json();
  return data;
}

function getPercentage(votes: number, total: number) {
  if (total === 0) return 0;
  return Math.round((votes / total) * 100);
}

const ContestantCard = ({ contestant, totalVotes }: { contestant: any, totalVotes: number }) => {
  const percent = getPercentage(contestant.votes, totalVotes);
  const [amount, setAmount] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);

  const increment = () => setAmount((p) => p + 1);
  const decrement = () => setAmount((p) => Math.max(1, p - 1));
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // keep numeric only
    const v = e.target.value.replace(/\D/g, '');
    setAmount(v ? parseInt(v, 10) : 0);
  };

  const handleVote = async () => {
    if (amount < 1) return;
    setProcessing(true);
    try {
      const res = await createPayment(amount, contestant.id, contestant.name);
      console.log('Payment created', res);
      if (res.paymentLink) {
        // Redirect to the payment link
        window.location.href = res.paymentLink;
      }
    } catch (err) {
      console.error('Vote/payment error', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={styles.card}>
      <img src={contestant.image} alt={contestant.name} className={styles.cardImage} />
      <div className={styles.cardHeader}>
        <div className={styles.cardName}>{contestant.name}</div>
        <div className={styles.cardNumber}>Contestant Number {contestant.contestant_number ?? contestant.contestantNumber ?? contestant.number ?? '-'}</div>
      </div>
      <div className={styles.cardInfoRow}>
        <span className={styles.cardVotes}>{contestant.votes} votes</span>
        <span className={styles.cardPercent}>{percent}%</span>
      </div>
      <div className={styles.barContainer}>
        <div className={styles.barFill} style={{ width: `${percent}%` }} />
      </div>

      <div className={styles.voteControls}>
        <div className={styles.voteInputRow}>
          <button
            type="button"
            className={styles.qtyButton}
            aria-label="increase votes"
            onClick={increment}
          >
            +
          </button>

          <input
            className={styles.qtyInput}
            inputMode="numeric"
            pattern="[0-9]*"
            value={amount}
            onChange={handleChange}
            aria-label="vote amount"
          />

          <button
            type="button"
            className={styles.qtyButton}
            aria-label="decrease votes"
            onClick={decrement}
          >
            -
          </button>
        </div>

        <button
          className={styles.voteButton}
          onClick={handleVote}
          disabled={processing || amount < 1}
        >
          {processing ? 'Processing...' : 'Vote'}
        </button>
      </div>
    </div>
  );
};

export default function VotePage() {
  const [contestants, setContestants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Sort by votes descending
  const sorted = [...contestants].sort((a, b) => b.votes - a.votes);
  const totalVotes = sorted.reduce((sum, c) => sum + (c.votes || 0), 0);

  return (
    <main className={styles.content}>
      <div className={styles.voteHeader}>
        <h1 className={styles.voteTitle}>Vote for Your Favourite Contestant</h1>
        <div className={styles.voteSubtitle}>

        <p>
          Show your support by picking the contestant you love and cast your vote. Every vote helps them move closer to the crown. 
        </p>
          
          
          <p>

          Select how many votes you'd like to give, then click on the vote button to complete your voting. 
          </p>
          <p>

          Each vote cost the sum of 200 naria only.
          </p>
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