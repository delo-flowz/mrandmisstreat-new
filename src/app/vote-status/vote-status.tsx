"use client";
import styles from '../styles/vote-status.module.css';
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function VoteStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const statusRaw = searchParams.get("status");
  const status = statusRaw ? statusRaw.toLowerCase() : null;

  useEffect(() => {
    // Prevent user going back to Flutterwave checkout
    window.history.replaceState(null, "", window.location.pathname + window.location.search);

    if (!status) {
      // No status provided -> show 404 page
      router.replace('/404');
      return;
    }

    // Redirect back automatically after 2 seconds
    const timer = setTimeout(() => {
      router.back();
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, status]);

  return (
    <main className={styles.wrapper}>
      {status === 'successful' ? (
        <section className={styles.card} aria-live="polite">
          <div className={styles.iconWrap}>
            <svg className={styles.check} viewBox="0 0 52 52" aria-hidden>
              <circle className={styles.checkCircle} cx="26" cy="26" r="25" fill="none" />
              <path className={styles.checkMark} fill="none" d="M14 27 l8 8 l16 -16" />
            </svg>
          </div>
          <h1 className={styles.title}>Payment Successful</h1>
          <p className={styles.subtitle}>Thank you — your vote has been recorded. Redirecting back...</p>
        </section>
      ) : status === 'cancelled' ? (
        <section className={styles.card} aria-live="polite">
          <div className={styles.iconWrap}>
            <svg className={styles.cross} viewBox="0 0 52 52" aria-hidden>
              <circle className={styles.crossCircle} cx="26" cy="26" r="25" fill="none" />
              <line className={styles.crossLine} x1="16" y1="16" x2="36" y2="36" />
              <line className={styles.crossLine} x1="36" y1="16" x2="16" y2="36" />
            </svg>
          </div>
          <h1 className={styles.title}>Payment Cancelled</h1>
          <p className={styles.subtitle}>Your payment was cancelled. Redirecting back...</p>
        </section>
      ) : null}
    </main>
  );
}
