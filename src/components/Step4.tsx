import { FunctionComponent } from 'react';
import styles from './Step4.module.css';

interface Page4Props {
  chimneyType?: string;
  isPDF?: boolean;
}

const Page4: FunctionComponent<Page4Props> = ({ chimneyType, isPDF = false }) => {
  const typeLabel = chimneyType ? `Your ${chimneyType.charAt(0).toUpperCase() + chimneyType.slice(1)}` : 'Your chimney_type';
  const imageSrc = chimneyType === 'prefabricated' ? '/prefabricated-p4.webp' : chimneyType === 'masonry' ? '/masonry-p4.webp' : undefined;
  const titleTop = isPDF ? '111px' : '117px';
  return (
    <div className={styles.page4} data-pdf={isPDF ? 'true' : 'false'}>
      <div className={styles.title}>
        <div className={styles.titleChild} />
        <img className={styles.logoIcon} alt="Logo" src="/logo.webp" />
      </div>
      <b className={styles.yourChimneyType} style={{ top: titleTop }}>
        <p className={styles.page4YourChimneyType}>{typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} Chimney</p>
        <p className={styles.page4YourChimneyType}>&nbsp;</p>
      </b>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.page4Child} >
        <img className={styles.chimneyImage } src={imageSrc} alt="Chimney Type" />
      </div>
      <div className={styles.byRayGessner}>By Ray Gessner, P.E.</div>
    </div>
  );
};

export default Page4;


