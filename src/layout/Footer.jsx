import { FaInstagram, FaFacebookF, FaTwitter, FaUtensils } from 'react-icons/fa'
import { HiOutlineMapPin, HiOutlinePhone, HiOutlineClock } from 'react-icons/hi2'
import styles from './Footer.module.css'

const SOCIALS = [
  { icon: FaInstagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: FaFacebookF, label: 'Facebook', href: 'https://facebook.com' },
  { icon: FaTwitter, label: 'Twitter', href: 'https://twitter.com' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={['container', styles.grid].join(' ')}>
        <div className={styles.brandCol}>
          <div className={styles.brand}>
            <FaUtensils aria-hidden="true" />
            <span>Aurum</span>
          </div>
          <p className={styles.tagline}>Fine dining, reimagined. Seasonal ingredients, timeless craft.</p>
          <div className={styles.socials}>
            {SOCIALS.map(({ icon: Icon, label, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label} className={styles.socialLink}>
                <Icon aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Visit</h3>
          <ul className={styles.infoList}>
            <li>
              <HiOutlineMapPin aria-hidden="true" /> 24 Harbourfront Lane, San Francisco, CA
            </li>
            <li>
              <HiOutlinePhone aria-hidden="true" /> (415) 555-0192
            </li>
            <li>
              <HiOutlineClock aria-hidden="true" /> Tue – Sun · 5pm – 11pm
            </li>
          </ul>
        </div>

        <div className={styles.col}>
          <h3 className={styles.colTitle}>Explore</h3>
          <ul className={styles.linkList}>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/menu">Menu</a>
            </li>
          </ul>
        </div>
      </div>

      <div className={['container', styles.bottom].join(' ')}>
        <p>© {new Date().getFullYear()} Aurum Restaurant. All rights reserved.</p>
        <p className={styles.mockNote}>
          A UI mockup — mock data only. 3D models:{' '}
          <a href="https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Avocado" target="_blank" rel="noreferrer noopener">
            Avocado
          </a>{' '}
          (CC0), Mandarin Orange by{' '}
          <a href="https://skfb.ly/EZNY" target="_blank" rel="noreferrer noopener">
            zamdreamer
          </a>
          , glTF adaptation by Eric Chadwick (
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer noopener">
            CC BY 4.0
          </a>
          ).
        </p>
      </div>
    </footer>
  )
}
