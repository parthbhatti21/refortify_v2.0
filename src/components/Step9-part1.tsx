import { FunctionComponent } from 'react';
import styles from './Step9-part1.module.css';

type ChimneyType = 'masonry' | 'prefabricated';

interface Step9Part1Props {
  chimneyType?: ChimneyType;
}

const Step9Part1: FunctionComponent<Step9Part1Props> = ({ chimneyType }) => {
  // console.log('chimneyType', chimneyType);
  const renderMasonry = () => (
    <div className={styles.understandingYourMasonryChiParent}>
      <b className={styles.understandingYourMasonry}>Understanding your Masonry Chimney</b>
      <div className={styles.chimneyCapTheContainer}>
        <ul className={styles.chimneyCapTheChimneyCapI}>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Chimney Cap</b>
            <span>: The chimney cap is required by building code R1003.9.1. It is designed to keep rain from damaging the chimney liner, keeps animals from nesting inside the flue, keeps sparks from landing on the roof and helps prevent wind induced downdrafts.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Top Flue Tile</b>
            <span className={styles.chimneyCap}>: The top liner needs to be in good condition to expel hot gases through the top of the chimney. Building codes require the tile to extend at least 2 inches to allow for chimney caps to be fastened to the tile and must not extend too far because multi-flue caps may need to be installed directly to the crown.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Drip Edge</b>
            <span className={styles.chimneyCap}>: The drip edge is required by building code R1003.9.1 and is designed to drip water off the crown. Water that flows off the crown without a drip edge will saturate the exterior of the brick and will damage mortar joints during freeze/thaw cycles.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Chimney Crown</b>
            <span className={styles.chimneyCap}>{`: The chimney crown is the most important part of your chimney. IT MUST BE DESIGNED TO ALLOW FOR THERMAL EXPANSION OF THE FLUE LINER per IRC code R1003.9.1, ASTM C1238 & R1001.3.1. Chimney crowns that are not properly constructed will damage the chimney liner and will become a fire hazard.`}</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Top Flue Liner Joint</b>
            <span className={styles.chimneyCap}>: The top flue liner joint is the first sign of an improperly installed crown. When the chimney liner elongates during thermal expansion, the tile forces itself through the concrete crown and as it cools, the liner is held by the improperly installed crown that does not have the required separation. A gap forms between the first and second flue tile and this allows CO gases to escape through the liner and can end up coming into the home. This can cause many potential hazards.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Chimney Liner</b>
            <span className={styles.chimneyCap}>: A properly installed and maintained chimney liner is extremely important to keep your family safe. Joints in liner and flue tiles are required to be sealed and in good condition. This liner transports the hot gases to the outside atmosphere.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Brick Joints</b>
            <span className={styles.chimneyCap}>: Brick joints are critical to keeping water from penetrating the chimney. Gaps and air voids in the brick joints will allow water to enter and damage various interior components of the chimney including the chimney liner.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Chimney Flashing</b>
            <span className={styles.chimneyCap}>: The chimney flashing is designed to keep water from penetrating between the chimney and the roof. Chimney flashing is sealed with roofing sealant and requires resealing every 3-5 years. Chimney flashings also tend to rust and so applying rust inhabitants every few years is also highly recommended.</span>
          </li>
          <li className={styles.step9part1ChimneyCapTheChimneyCapI}>
            <b className={styles.chimneyCap}>Chimney Crickets</b>
            <span className={styles.chimneyCap}>: For chimneys wider than 30 inches, chimney crickets are required by IRC code R1003.20, and are designed to shed water away from the chimney. Chimneys without crickets can leak and cause water damage to roof sheathing near the chimney.</span>
          </li>
          <li>
            <b className={styles.chimneyCap}>Smoke Chamber</b>
            <span className={styles.chimneyCap}>: IRC code R1001.8 require corbeled (stair stepped) smoke chambers to be parged (troweled) smooth with refractory mortar. This is extremely important to keep the hottest part of the system from transferring heat to surrounding timber framing and also to provide a smooth draft flow to reduce creosote build up.</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderPrefabricated = () => (
    <div className={styles.understandingYourPrefabricatParent}>
      <b className={styles.understandingYourPrefabricat}>Understanding your Prefabricated Chimney
      </b>
      <div className={styles.chimneyCapTheContainer}>
        <ul className={styles.chimneyCapTheChimneyCapF}>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Chimney Cap:</b>
            <span> The chimney cap for a prefabricated chimney is specially designed for the
system. Unlike a regular masonry chimney cap, a prefabricated chimney cap is required to have air cooled construction that allows for proper air flow through the system. This "air cooled" chimney cap draws air from the outside and circulates the air around the liner to cool the liner and keep it functioning properly. Improperly installed chimney caps on prefabricated fireplaces can overheat the system and cause fire hazards.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Exterior of Liner:</b>
            <span className={styles.chimneyCap}> The top exterior of the chimney liner is one of the only portions of the outer liner that is visible because the chase cover blocks the inspection of the other portions of the liner. Over time, this area can rust and deteriorate. Since the outer liner is designed to contain heat from the timber chase, it is very important to keep this in good condition.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Storm Collar:</b>
            <span className={styles.chimneyCap}> The storm collar is designed to keep rainwater from dripping down the outer liner which will rust and deteriorate the liner. If the storm collar rusts or the sealant between the outer liner and storm collar deteriorates then it should be repaired immediately.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Chase Cover:</b>
            <span className={styles.chimneyCap}> The chase cover is one of the most important components of a chimney
system. Building codes require chase covers to be specifically constructed and properly installed. One of the most important requirements for the chase cover is to have cross breaks which are typically required by prefabricated chimney manufacture's instructions. These cross breaks shed water off the top of the chase cover so that it prevents rusting. Rusting chase covers will leak and damage the outer chimney liner and will also rust the liner damper connection. Other code requirements include having a minimum of a 4 inch skirt, and drip edge.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Flashing/Crickets:</b>
            <span className={styles.chimneyCap}> Flashing and chimney crickets are areas where water can leak. Properly sealing flashing is required every few years and chimney crickets are required by building code if the chimney is wider than 30 inches.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Exterior Profile Seam:</b>
            <span className={styles.chimneyCap}> The exterior profile seams on prefabricated chimneys are areas
where sideways rain can saturate timber framing of the chimney. These seams need to be caulked and maintained every few years to prevent water intrusion which can lead to structural damage.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>Exterior Air Intake:</b>
            <span className={styles.chimneyCap}> Checking to make sure the exterior air intake is not blocked by bird nests or other debris is very important.</span>
          </li>
          <li className={styles.page18ChimneyCapTheChimneyCapF}>
            <b className={styles.chimneyCap}>{`Fireplace Panels: `}</b>
            <span className={styles.chimneyCap}>The fireplace panels in a prefabricated fireplace is designed to shield heat from the side and back walls. Sometimes these panels will crack and may require replacement or repair. If the crack is hairline or small then we will typically recommend repair with refractory mortar. If the crack continues or is too large to repair then we will recommend replacement with a cut to fit refractory panel.</span>
          </li>
          <li>
            <b className={styles.chimneyCap}>Damper:</b>
            <span className={styles.chimneyCap}> The damper for the prefabricated fireplace is one of the first place to show signs of rust if a chase cover or storm collar is leaking. The damper, which is required by code, can rust and become inoperable. If this occurs, then there are no ways to replace the damper because the unit is a UL listed unit as one unit. It is very important to keep your damper in good condition.</span>
          </li>
        </ul>
      </div>
    </div>
  );

  return (
    <div className={styles.step9part1}>
      <div className={styles.frame}>
        <div className={styles.frameChild} />
        <div className={styles.rectangle} />
      </div>
      {chimneyType === 'masonry' ? renderMasonry() : renderPrefabricated()}
    </div>
  );
};

export default Step9Part1 as FunctionComponent<Step9Part1Props>;
