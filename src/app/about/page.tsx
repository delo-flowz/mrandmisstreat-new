import styles from '../styles/about.module.css';
import Reveal from '@/components/Reveal';

export default function AboutPage() {
  return (
    
    <main className={styles.container}>
      <Reveal>

      <h1 className={styles.title}>About Mr And Miss Treat Nigeria</h1>
      <p className={styles.paragraph}>
        Mr and Miss Treat Nigeria is a prestigious pageant dedicated to discovering the most
        vibrant, talented, and outstanding young individuals across the nation, youths who are
        ready to rise, shine, and make their mark as stars.
      </p>
      <p className={styles.paragraph}>
        The pageant is designed to celebrate Nigerian culture, unity, and progress by merging
        beauty, talent, and intellect into one platform of excellence. Its mission is to empower
        young Nigerians to become ambassadors of positive change, instilling in them a deep
        sense of national pride, responsibility, and purpose. Winners of the crown are not only
        committed to their reign but are also expected to continue their legacy beyond it,
        spreading hope, supporting communities, uplifting lives, and serving as advocates for
        peace and humanitarian causes.
      </p>
      <p className={styles.paragraph}>
        More than just a competition, Mr and Miss Treat Nigeria establishes a strong connection
        between pageantry and talent showcasing. It provides young people with a platform to
        exhibit their creativity, leadership, and innovation, while also opening doors to
        international opportunities. At its core, the pageant is committed to nurturing role
        models who inspire, influence, and represent Nigeria with dignity both at home and
        abroad.
      </p>
      </Reveal>
    </main>
  );
}