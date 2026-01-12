import Image from 'next/image'
import styles from './ticket.module.css'
import Reveal from '@/components/Reveal'

export default function TicketPage() {
  const ticketTiers = [
    {
        image: "/regular_ticket.jpg",
      
      name: "Regular",
      price: "₦3k",
    },
    {
        image: "/vip_ticket.jpg",
      
      name: "VIP",
      price: "₦10k",
    },
    {
        image: "/odogwu_ticket.jpg",
      
      name: "Odogwu",
      price: "₦100k",
    }
  ];

  return (
    <main className={styles.pageWrapper}>
      <Reveal>
        <div className={styles.heroSection}>
          <Image
            src="/ticket_background.png"
            alt="Event Banner"
            fill
            className={styles.heroImage}
            priority
          />
          <div className={styles.heroOverlay}>
            <h1 className={styles.pageTitle}>Tickets</h1>
          </div>
        </div>

        <section className={styles.detailsSection}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>February, 2026</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Time</span>
              <span className={styles.detailValue}>4:00 pm</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Location</span>
              <span className={styles.detailValue}>
                <p>ACE-PUTOR </p>
                <p>By Unique Luxury Suites Opposite Christ Embassy, East West Road Choba Port Harcourt. </p>
       

              </span>
            </div>
          </div>

          <div className={styles.expectSection}>
            <h2 className={styles.expectTitle}>Experience Glamour, Talent, and Purpose — Live on Stage</h2>
            <p className={styles.expectText}>Join us for the Mr & Miss Treat Pageantry, an unforgettable night celebrating confidence, culture, elegance, and excellence.</p>
          </div>
        </section>

        <section className={styles.ticketSection}>
          <h2 className={styles.sectionTitle}>Choose Your Ticket</h2>
          <div className={styles.gridContainer}>
            {ticketTiers.map((ticket, index) => (
              <div key={index} className={styles.ticketCard}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={ticket.image}
                    alt={ticket.name}
                    width={400}
                    height={250}
                    className={styles.ticketImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.ticketName}>{ticket.name}</h3>
                  <p className={styles.ticketPrice}>{ticket.price}</p>
                  <a
                    href={`https://wa.me/2348136398336?text=I would like to buy a ${ticket.name} ticket`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.whatsappButton}
                  >
                    Buy Ticket
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>
    </main>
  )
}
