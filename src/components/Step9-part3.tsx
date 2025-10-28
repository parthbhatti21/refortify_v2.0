import { FunctionComponent } from 'react';
import styles from './Step9Part3.module.css';

type ChimneyType = 'masonry' | 'prefabricated';

interface Step9Part3Props {
  chimneyType?: ChimneyType;
}

const Step9Part3: FunctionComponent<Step9Part3Props> = ({ chimneyType = 'masonry' }) => {
  const renderMasonry = () => (
    <div className={styles.step9Part3}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.chimneyClearancesBuildingCWrapper}>
        <div className={styles.chimneyClearancesBuildingContainer}>
          <ul className={styles.chimneyClearancesBuildingC}>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Chimney Clearances</b>
              <span>: Building codes require certain clearances to combustibles and many times contractors or home owners may add timber to chimney walls which is a fire hazard. Higher levels of chimney inspections typically address these concerns.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Ash Dump Door</b>
              <span className={styles.chimneyClearances}>: The ash dump door typically requires replacement every 10 years because heat will warp these doors and can allow hot ashes to fall down in the ash pit.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Clean Out Door</b>
              <span className={styles.chimneyClearances}>: Clean out doors are required to remain tightly closed (R1001.2.1) when not in use. Many times hot ash can fall into the ash pit and can become a fire hazard if the doors are not properly sealed. These doors can rust and will require replacement.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Overall Roof Condition</b>
              <span className={styles.chimneyClearances}>: As a courtesy, we offer general opinion regarding the age of your roof and if we notice any concerns. We mainly check locations near the chimney and is not an entire roof inspection.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Exposed Nail Heads</b>
              <span className={styles.chimneyClearances}>: As a courtesy, we inspect the nail heads to see if they are properly sealed as required by IRC codes referring to manufacture instruction. Nail heads that are not properly sealed are the number one cause of leaks. The unsealed nail heads are initially saturated with water and rust. The rusted nail begins to dissolve and allows water to penetrates through the rusted nail skin and eventually leaks into the attic. This causes mold and water damage to a point where a homeowner finally notices leaks on ceilings. Sealing nail heads is the best way to prevent a problem before it becomes a bigger problem.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Exposed Metal Vents</b>
              <span className={styles.chimneyClearances}>: There are many vents that protrude through the roof. Many times these vents are made of galvanized metal instead of stainless steel. These components can rust and will leak. The best way to keep these components in good condition is to rust inhibit the metal. It will help it to last longer.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Local Shingles</b>
              <span className={styles.chimneyClearances}>: As a courtesy, we inspect areas near the chimney and sometimes to the whole roof to see if we notice missing shingles. Missing shingles lead to roof leaks and should be repaired.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Gutter Cleanliness</b>
              <span className={styles.chimneyClearances}>: As a courtesy, we inspect gutters to see if they are clean. Blocked and clogged gutters can lead to water damage to the facia, roof sheathing and water that sheds over the gutters can lead to foundation damage. The water that seeps along your foundation wall can saturate clay soil which can expand and contract that leads to foundation cracking. Many times simply cleaning your gutters can prevent these costly problems.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Gutter Condition</b>
              <span className={styles.chimneyClearances}>: Gutters do not last forever and many times they do not drain properly. Installing new gutters may be a good solution to maintain your home.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Brickwork on Home</b>
              <span className={styles.chimneyClearances}>: Many times brickwork on home causes cracks in mortar joints. Keeping your brickwork maintained is a good idea.</span>
            </li>
            <li className={styles.step9Part3ChimneyClearancesBuildingC}>
              <b className={styles.chimneyClearances}>Dryer Vent Cleanliness</b>
              <span className={styles.chimneyClearances}>: Dryer vents cause more household fires than chimneys. Most homeowners are not aware that they need to have their dryer vents cleaned every year. The longer you wait, the harder it is to clean and can become a serious problem. We offer free dryer vent inspections with our service.</span>
            </li>
            <li>
              <b className={styles.chimneyClearances}>Dryer Vent Condition</b>
              <span className={styles.chimneyClearances}>: Building codes regarding dryer vent construction and termination are becoming stricter every year because dryer vent fires occur so often. Dryer vents, specifically those terminating out of the roof, are required to have a damper that open and close. Many times, contractors improperly install closed vents that do not allow cleaning access. This is an extreme fire hazard and requires immediate attention.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderPrefabricated = () => (
    <div className={styles.page13}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.exposedNailHeadsAsACourtWrapper}>
        <div className={styles.exposedNailHeadsContainer}>
          {/* <li className={styles.blankLine}> */}
            <span>&nbsp;</span>
          {/* </li> */}
          <ul className={styles.exposedNailHeadsAsACourt}>
            <li className={styles.blankLine}>
              <b className={styles.exposedNailHeads}>Exposed Nail Heads</b>
              <span>: As a courtesy, we inspect the nail heads to see if they are properly sealed as required by IRC codes referring to manufacture instruction. Nail heads that are not properly sealed are the number one cause of leaks. The unsealed nail heads are initially saturated with water and rust. The rusted nail begins to dissolve and allows water to penetrates through the rusted nail skin and eventually leaks into the attic. This causes mold and water damage to a point where a homeowner finally notices leaks on ceilings. Sealing nail heads is the best way to prevent a problem before it becomes a bigger problem.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <b className={styles.exposedNailHeads}>Gutter Cleanliness</b>
              <span className={styles.exposedNailHeads}>: As a courtesy, we inspect gutters to see if they are clean. Blocked and clogged gutters can lead to water damage to the facia, roof sheathing and water that sheds over the gutters can lead to foundation damage. The water that seeps along your foundation wall can saturate clay soil which can expand and contract that leads to foundation cracking. Many times simply cleaning your gutters can prevent these costly problems.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <b className={styles.exposedNailHeads}>Gutter Condition</b>
              <span className={styles.exposedNailHeads}>: Gutters do not last forever and many times they do not drain properly. Installing new gutters may be a good solution to maintain your home.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <span className={styles.exposedNailHeads}>Brickwork on Home: Many times brickwork on home causes cracks in mortar joints. Keeping your brickwork maintained is a good idea.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <b className={styles.exposedNailHeads}>Dryer Vent Cleanliness</b>
              <span className={styles.exposedNailHeads}>: Dryer vents cause more household fires than chimneys. Most homeowners are not aware that they need to have their dryer vents cleaned every year. The longer you wait, the harder it is to clean and can become a serious problem. We offer free dryer vent inspections with our service.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <b className={styles.exposedNailHeads}>Dryer Vent Condition</b>
              <span className={styles.exposedNailHeads}>: Building codes regarding dryer vent construction and termination are becoming stricter every year because dryer vent fires occur so often. Dryer vents, specifically those terminating out of the roof, are required to have a damper that open and close. Many times, contractors improperly install closed vents that do not allow cleaning access. This is an extreme fire hazard and requires immediate attention.</span>
              <b className={styles.exposedNailHeads}>Chimney Clearances</b>
              <span className={styles.exposedNailHeads}>: Building codes require certain clearances to combustibles and many times contractors or home owners may add timber to chimney walls which is a fire hazard. Higher levels of chimney inspections typically address these concerns.</span>
            </li>
            <li className={styles.gutterCleanlinessAsACourt}>
              <b className={styles.exposedNailHeads}>Ash Dump Door</b>
              <span className={styles.exposedNailHeads}>: The ash dump door typically requires replacement every 10 years because heat will warp these doors and can allow hot ashes to fall down in the ash pit.</span>
              <b className={styles.exposedNailHeads}>Clean Out Door</b>
              <span className={styles.exposedNailHeads}>: Clean out doors are required to remain tightly closed (R1001.2.1) when not in use. Many times hot ash can fall into the ash pit and can become a fire hazard if the doors are not properly sealed. These doors can rust and will require replacement.</span>
              <b className={styles.exposedNailHeads}>Brickwork on Home</b>
              <span className={styles.exposedNailHeads}>: Many times brickwork on home causes cracks in mortar joints. Keeping your brickwork maintained is a good idea.</span>
            </li>
          </ul>
        </div>
      </div>
      <div className={styles.textWrapper}>
        <div className={styles.exposedNailHeadsContainer}>
          <p className={styles.blankLine}>&nbsp;</p>
        </div>
      </div>
    </div>
  );

  return chimneyType === 'masonry' ? renderMasonry() : renderPrefabricated();
};

export default Step9Part3 as FunctionComponent<Step9Part3Props>;
