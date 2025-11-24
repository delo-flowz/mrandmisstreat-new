import RegisterSection from '@/components/home/RegisterSection';
import Getintouch from '@/components/home/Getintouch';
import Visionandmission from '@/components/home/visionandmission';
import styles from './styles/page.module.css';
import Reveal from '@/components/Reveal';
import SponsorsSection from '@/components/SponsorsSection';
import Socialhandle from '@/components/socialhandle';
import Votingbanner from '@/components/home/votingbanner'
export default function HomePage() {
  return (
    <main className={styles.container}>
      <Reveal>
        <RegisterSection />
        <Votingbanner/>
        <Visionandmission />
        <Getintouch />
        <SponsorsSection />
      </Reveal>
    </main>
  );
}