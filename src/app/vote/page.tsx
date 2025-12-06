"use client";
import { useEffect, useState } from 'react';
import styles from '../styles/vote.module.css';
import { supabase } from '@/utils/supabase';
import ContestantCard from './ContestantCard';
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

                Each vote cost the sum of 100 naria only.
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