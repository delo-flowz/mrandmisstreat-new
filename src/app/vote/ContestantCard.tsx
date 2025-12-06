"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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


	const ContestantCard = ({ contestant, totalVotes }: { contestant: any; totalVotes: number }) => {
	  const percent = getPercentage(contestant.votes, totalVotes);
	  const [amount, setAmount] = useState<number>(1);
	  const [processing, setProcessing] = useState<boolean>(false);
	  const inputId = `vote-amount-${contestant.id ?? contestant.contestant_number ?? contestant.contestantNumber ?? contestant.number ?? contestant.name}`;
	  const costPerVote = 200;
	  const totalCost = amount * costPerVote;

	  const increment = () => setAmount((p) => p + 1);
	  const decrement = () => setAmount((p) => Math.max(1, p - 1));
	  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
	    const v = e.target.value.replace(/\D/g, '');
	    setAmount(v ? parseInt(v, 10) : 0);
	  };

	const router = useRouter();

	const handleVote = () => {
		// Route to the contestant page, passing the contestant number as the route id
		const numberId = encodeURIComponent(contestant.contestant_number || contestant.contestantNumber || contestant.number || contestant.name || 'unknown');
		router.push(`/vote/contestant/${numberId}`);
	};

	  return (
	    <div className={styles.card}>
            <div className={styles.voteCardtop}>

	      <img src={contestant.image} alt={contestant.name} className={styles.cardImage} />
	      <div className={styles.cardHeader}>
	        <h1 className={styles.cardName}>{contestant.name}</h1>
	        <h1 className={styles.cardNumber}>Contestant No. {contestant.contestant_number ?? contestant.contestantNumber ?? contestant.number ?? '-'}</h1>
            <h1 className={styles.cardNumber}>{contestant.state}</h1>
	      </div>
            </div>
          <div className={styles.voteInfo}>
	      <div className={styles.cardInfoRow}>
	        <span className={styles.cardPercent}>Current Votes</span>
	        <span className={styles.cardVotes}>{contestant.votes}</span>
	      </div>
	      <div className={styles.barContainer}>
	        <div className={styles.barFill} style={{ width: `${percent}%` }} />
	      </div>
          <div className={styles.cardInfopercentRow}>
	    
	        <span className={styles.cardPercent}>{percent}%</span>
	      </div>

			<div className={styles.voteControls}>
				<button
					className={styles.voteButton}
					onClick={handleVote}
					aria-label={`Vote now for ${contestant.name}`}
                    >
                      <span className={styles.voteButtontext}>Vote Now</span>   
					
				</button>
			</div>
                    </div>
	    </div>
	  );
	};

	export default ContestantCard;


