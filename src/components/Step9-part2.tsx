import { FunctionComponent } from 'react';
import styles from './Step9-part2.module.css';

type ChimneyType = 'masonry' | 'prefabricated';

interface Step9Part2Props {
  chimneyType?: ChimneyType;
}

const Step9Part2: FunctionComponent<Step9Part2Props> = ({ chimneyType = 'masonry' }) => {
  const renderMasonry = () => (
    <div className={styles.step9Part2}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.creosoteBuildUpTheMainCaWrapper}>
        <div className={styles.creosoteBuildUpContainer}>
          <ul className={styles.creosoteBuildUpTheMainCa}>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Creosote Build Up</b>
              <span>: The main cause of chimney fires is excessive creosote build up. We recommend having your chimney properly cleaned once a year if you are burning your fireplace. Excessive creosote build up may require different forms of cleaning which may incorporate mechanical cleaning with drills and spinning brushes or chains.</span>
            </li>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Smoke Shelf Access</b>
              <span className={styles.creosoteBuildUp}>: IRC code R1003.7 require clean out doors to be installed for cleaning. The exception is if the fireplace has access for cleaning through the fireplace opening. The problem is that the damper blocks the access for cleaning. Disassembling and reassembling dampers to perform the cleaning can be very difficult. Many chimney sweeps typically do not perform this step, which becomes an extreme fire hazard because the creosote piles on the smoke shelf. Poker dampers are frustrating but manageable and new cotter pins should be installed. The best way to solve the smoke shelf access problem is to install energy efficient cap dampers. We highly recommend cap damper installation for rotary dampers and even recommend for poker dampers.</span>
            </li>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Chimney Shoulders</b>
              <span className={styles.creosoteBuildUp}>: The chimney shoulders are located where the chimney transitions from the large firebox to the smaller flue liner. It is on the outside of the smoke chamber. This location is very important because if leaking occurs, then it can damage the interior refractor mortar of the smoke chamber.</span>
            </li>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Chimney Lintel Joint</b>
              <span className={styles.creosoteBuildUp}>: The lintel joint of the chimney is a very critical spot in the system. There is a separation between the firebox and the exterior brick that goes up to the mantel. This lintel joint can form gaps and heat can transfer up to the timber stud wall. IRC codes do not call out the specific requirement during construction and thus it is a constant hazard during chimney inspections. The best way to solve this problem is to inject high temperature refractory mortar into this joint and fill the voids to prevent heat transfer.</span>
            </li>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Fireplace Damper</b>
              <span className={styles.creosoteBuildUp}>: There are several types of dampers that have been installed into masonry fireplaces. The best type of damper is an energy efficient cap damper. These dampers mount on the top of the chimney and have a steel cable that attaches to a mount in the firebox. Because the original damper plate is removed. this allows for better airflow, which improves draft, decreases creosote build up and allows for easy access for cleaning the smoke shelf. The second type of damper is a poker damper. This is a decent traditional damper but still requires disassembly and reassembly for cleaning. Cotter pin replacement is advised to help for future cleanings. Finally, the worst type of damper is a rotary damper. These dampers were typically installed in the pre 1970's and are extremely difficult to clean because the entire rotary mechanism requires disassembly. If you have a rotary damper, we highly recommend changing to energy efficient cap damper.</span>
            </li>
            <li className={styles.step9Part2CreosoteBuildUpTheMainCa}>
              <b className={styles.creosoteBuildUp}>Fireplace Profile Seam</b>
              <span className={styles.creosoteBuildUp}>: Similar to the lintel joint, the profile seam is where the firebox and the exterior brickwork on the front of the fireplace connect. Many times the chimney and the home settle or move independently and can cause gaps and separations at this location. Beyond the brick work is the timber stud walls and this gap can transfer heat to this location and become a fire hazard. Filling these cracks with high temperature refractory mortar is recommended.</span>
            </li>
            <li>
              <b className={styles.creosoteBuildUp}>Firebox Joints</b>
              <span className={styles.creosoteBuildUp}>: The firebox has mortar joints that are designed to contain the heat inside the firebox. If these joints become deteriorated than they should be repointed with refractory mortar to keep the heat inside the firebox.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderPrefabricated = () => (
    <div className={styles.page12}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      <div className={styles.fireplaceDoorsMostPrefabriWrapper}>
        <div className={styles.fireplaceDoorsMostContainer}>
          <ul className={styles.fireplaceDoorsMostPrefabri}>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Fireplace Doors</b>
              <span>: Most prefabricated fireplaces come with doors. Sometimes, homeowners will install masonry fireplace doors on the outside of a prefabricated fireplace. This can be extremely dangerous, because the prefabricated fireplace is designed with various airflows around the unit. When masonry doors are installed over the front of a prefabricated fireplace, then this blocks the airflow in front of the unit and can overheat the system. Make sure the doors installed are designed for your system.</span>
            </li>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Top of Firebox</b>
              <span className={styles.fireplaceDoors}>: The top of the firebox is where the system can overheat and rust. When the high heat paint from the metal burns off, the metal can rust. If this occurs, the best solution may be to re-coat the top of the firebox with 2000 degree paint to help it last longer.</span>
            </li>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Damper/Liner Connection</b>
              <span className={styles.fireplaceDoors}>: The connection between the damper and liner connection is the location which receives the highest amount of heat and if this location becomes damaged then the entire unit will require replacement. Typically, leaking chase covers leak water down the outer pipe and ponds water at this location. This area begins to rust and if left unnoticed, can deteriorate and holes can form. Since water is saturating the exterior liner and this is the connection of the interior liner to firebox, then rusting likely indicates there is more unseen damage. KEEP YOUR CHASE COVER AND STORM COLLAR IN GOOD CONDITION!</span>
            </li>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Liner (Visible Portion)</b>
              <span className={styles.fireplaceDoors}>: With a NFPA Level 1 chimney inspection, the area just above the damper is the only portion of the liner that is visible. Damage or excessive creosote build-up is what we look for when we inspect this location.</span>
            </li>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Age of Unit</b>
              <span className={styles.fireplaceDoors}>: One of the most controversial topics with prefabricated fireplace manufactures and chimney sweeps are the age of units. The manufactures typically have 20 year limited warrantees and when asked by chimney sweeps what we should recommends to our customers if they have older units, these manufactures simply say that we should tell them to get new ones installed. Chimney sweeps then ask, what if the unit appears in good condition and it has hardly ever been used. The manufactures response was that we can not inspect the outside liner or top of the firebox so how can we say it is in good condition. This places the chimney sweeps at a legally liable position because most have been instructed to recommend replacing units after 20 years. The position our company has decided is that if the unit appears in good condition and is less then 20 years old then we state that it appears to be operating correctly. If the unit is 20-30 years old and appears in good condition then we state the unit appears to be operating correctly, we recommend replacement due to age of unit and burn at your own risk. If the unit is over 30 years old then we recommend replacement regardless of condition.</span>
            </li>
            <li className={styles.page12FireplaceDoorsMostPrefabri}>
              <b className={styles.fireplaceDoors}>Overall Roof Condition</b>
              <span className={styles.fireplaceDoors}>: As a courtesy, we offer general opinion regarding the age of your roof and if we notice any concerns. We mainly check locations near the chimney and is not an entire roof inspection.</span>
            </li>
            <li>
              <b className={styles.fireplaceDoors}>Local Shingles</b>
              <span className={styles.fireplaceDoors}>: As a courtesy, we inspect areas near the chimney and sometimes to the whole roof to see if we notice missing shingles. Missing shingles lead to roof leaks and should be repaired.</span>
            </li>
            <li> <b className={styles.fireplaceDoors}>Exposed Metal Vents</b>
              <span className={styles.fireplaceDoors}>: There are many vents that protrude through the roof. Many times these vents
are made of galvanised metal instead of stainless steel. These components can rust and will leak. The best way to keep these components in good condition is to rust inhibit the metal. It will help it to last longer.
</span>
            </li>
          </ul>
        </div>
      </div>
      
    </div>
  );

  return chimneyType === 'masonry' ? renderMasonry() : renderPrefabricated();
};

export default Step9Part2 as FunctionComponent<Step9Part2Props>;
