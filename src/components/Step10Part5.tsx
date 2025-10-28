import React from 'react';
import styles from './Step10Part5.module.css';

export const Step10Part5 = () => {
  return (
    <div className={styles.step10part5}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <img className={styles.titleIcon} alt="" src="/logo.webp" />
      <img className={styles.screenshot20251024At0033} src="/thankyou.png" alt="" />
      <b className={styles.thankYouFromContainer}>
        <p className={styles.thankYou}>Thank you!</p>
        <p className={styles.thankYou}>{`From the entire staff of A Step in Time, it has been a pleasure serving you. If you have any questions regarding your report then feel free to contact us at 757-498-8000.`}</p>
        <p className={styles.thankYou}>{`Sincerely,`}</p>
        <p className={styles.thankYou}>&nbsp;</p>
        <p className={styles.thankYou}>Staff - A Step in Time</p>
      </b>
    </div>
  );
};

export default Step10Part5;
