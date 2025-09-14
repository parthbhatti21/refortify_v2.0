import React, { useState, useEffect } from "react";
import styles from "./Step7.module.css";

interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  used?: boolean;
}

interface TableRow {
  id: string;
  srNo: number;
  description: string;
  unit: number;
  price: number;
  recommendation?: string;
}

interface Page7Props {
  scrapedImages?: ImageItem[];
  selectedImages?: ImageItem[];
  onImageSelection?: (images: ImageItem[]) => void;
  isPDF?: boolean;
  repairEstimateData?: {
    manualEntry: boolean;
    rows: TableRow[];
  };
  reviewImage?: string;
  customRecommendation?: string;
}
const dropdownOptions = [
  {
    srNo: 1,
    description: 'Install Multi-Flue Chimney Cap With Manf Lifetime Warranty',
    unit: 1,
    estimate: 340,
    recommendation: 'REPLACE SINGLE FLUE CHIMNEY CAP Virginia Residential code R1003.9.1 states: Chimney caps. Masonry chimneys shall have a concrete, metal or stone cap….Chimney caps are designed to keep animals, rain, leaves and wind induced downdrafts from entering the chimney. They also help prevent hot embers from drafting out of the flue and landing on the roof. Chimney caps are required by modern building codes.A Step in Time recommends replacing chimney caps that are missing, rusted, damaged, improperly sized, improperly bolted or improperly screened as required by Virginia building codes.'
  },
  {
    srNo: 2,
    description: 'Replace Top Flue Tile',
    unit: 1,
    estimate: 990,
    recommendation: 'INSTALL MUILTFLUE CHIMNEY CAPVirginia Residential code R1003.9.1 states: Chimney caps. Masonry chimneys shall have a concrete, metal or stone cap….Chimney caps are designed to keep animals, rain, leaves and wind induced downdrafts from entering the chimney. They also help prevent hot embers from drafting out of the flue and landing on the roof. Chimney caps are required by modern building codes.A Step in Time recommends replacing chimney caps that are missing, rusted, damaged, improperly sized, improperly bolted or improperly screened as required by Virginia building codes.'
  },
  {
    srNo: 3,
    description: 'Parge Top Flue Tile Joint With Refractory Mortar',
    unit: 1,
    estimate: 890,
    recommendation: 'REPLACE TOP FLUE LINER Virginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. Virginia Residential Code R1003.9.1 require flue liners to be installed in accordance with ASTM C1283. NFPA 211 14.9 require damaged or deteriorated liners to be replaced, repaired or relined. NFPA 211 7.2.13.3 requires the top flue liner to extend above the crown at least 2 inches. ASTM C1283 8.5 specifies the flue shall not extend father than 4 inches above the chimney crown.A Step in Time recommends replacement of top flue liners if the liner is less than 2 inches above the crown so that chimney caps can be properly fastened to the flue tile. A Step in Time recommends replacing flues that extend above 4 inches if they are part of a multiflued chimney so a proper cap can be installed to allow appropriate draft. A Step in Time recommends replacement of damaged or deteriorated top flue liners, depending on the extent of damage and the ability to contain combustion and house a chimney cap.'
  },
  {
    srNo: 4,
    description: 'Fireguard All Flue Liner Joints',
    unit: 1,
    estimate: 290,
    recommendation: 'REPAIR GAPPED VOIDED JOINT BETWEEN 1ST AND 2ND FLUE TILESVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 states  "Flue liners shall be maintained by filling any voids in the interior, or hot face, with medium duty water insoluble refractory mortar conforming to Test Method C199."A Step in Time recommends repairing any voids between flue liners with approved material. This material may be products like FIREGUARD LINER REPAIR or refractory mortar conforming to C199.'
  },
  {
    srNo: 5,
    description: 'Install Stainless Steel Chimney Liner',
    unit: 1,
    estimate: 3500,
    recommendation: 'REPAIR GAPPED VOIDED JOINTS BETWEEN FLUE LINERSVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 states  "Flue liners shall be maintained by filling any voids in the interior, or hot face, with medium duty water insoluble refractory mortar conforming to Test Method C199."A Step in Time recommends repairing any voids between flue liners with approved material. This material may be products like FIREGUARD LINER REPAIR or refractory mortar conforming to C199.'
  },
  {
    srNo: 6,
    description: 'Install Stainless Steel Chimney Liner To Repair Damaged Chimney Fire Liner',
    unit: 1,
    estimate: 4900,
    recommendation: 'CHIMNEY LINERS ARE OFFSET & REQUIRE RELININGVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 5.4 states: Flue Liners shall be installed each flue liner carefully bedded on the previous one, using water insoluble refractory mortar complying with Test Method C199 (medium duty). All joints of the flue liner shall be 1/16 inch to 1/8 inch thick and struck flush to produce a straight, smooth, fully aligned flue. Liners shall be placed in such a manner as to minimize ledges or steps within the flue passageway.The flue liners are offset which can cause creosote and flue gases to escape into the chimney chase. This can lead to fire hazards and CO migration into the residence. A Step in Time recommends relining with a UL listed stainless steel chimney liner.'
  },
  {
    srNo: 7,
    description: 'Repair Chimney Fire Damaged Flue Tiles With Fireguard Chimney Liner Repair',
    unit: 1,
    estimate: 4900,
    recommendation: 'EVIDENCE OF CHIMNEY FIRE - OFFSET TILESVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 5.4 states: Flue Liners shall be installed each flue liner carefully bedded on the previous one, using water insoluble refractory mortar complying with Test Method C199 (medium duty). All joints of the flue liner shall be 1/16 inch to 1/8 inch thick and struck flush to produce a straight, smooth, fully aligned flue. Liners shall be placed in such a manner as to minimize ledges or steps within the flue passageway.CHIMNEY FIRES OVERHEAT THE CHIMNEY LINER. If the chimney liner overheats, the thermal expansion of the chimney liner causes the liners to offset. The bottom of the liner is pressed on the supporting brick at the top of the smoke chamber. The top of the chimney liner is encased by the chimney crown. When the liner overheats from a chimney fire, it thermally expands and causes the entire liner to buckle, which results in offset flue tiles.Flue liners are designed to contain creosote and flue gases to safely expel to the atmosphere. Offset tiles will allow gases and creosote to transfer to the inner chimney chase, which can result in potential fire hazards and CO poisoning into the residence. A Step in Time recommends the installation of a stainless steel chimney liner to repair the damaged offset flue liners. '
  },
  {
    srNo: 8,
    description: 'Fireguard Repair Of Chimney Fire Damaged Liner Joints',
    unit: 1,
    estimate: 4900,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion, the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends repairing the chimney liner with FIREGUARD liner repair material."
  },
  {
    srNo: 9,
    description: 'Install Stainless Steel Chimney Liner To Repair Damaged Chimney Fire Liner',
    unit: 1,
    estimate: 3500,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion (i.e., heat, moisture, creosote, and flue gases), the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends replacing the chimney liner with a UL listed stainless steel liner."
  },
  {
    srNo: 10,
    description: 'No Wythe Wall',
    unit: 1,
    estimate: 4900,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion (i.e., heat, moisture, creosote, and flue gases), the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends replacing the chimney liner with a UL listed stainless steel liner."
  },
  {
    srNo: 11,
    description: 'Cracked Crown Pmp',
    unit: 1,
    estimate: 790,
    recommendation: "CHIMNEY CROWN IS CRACKED AND LEAKINGVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage."
  },
  {
    srNo: 12,
    description: 'CrownNew Rebuild',
    unit: 1,
    estimate: 790,
    recommendation: "CHIMNEY CROWN IS CRACKED AND NO DRIP EDGEVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage"
  },
  {
    srNo: 13,
    description: 'Crown Cut Seperation',
    unit: 1,
    estimate: 2100,
    recommendation: "CHIMNEY CROWN IS BONDED TO FLUE TILEVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage."
  },
  {
    srNo: 14,
    description: 'Seal Drip Edge',
    unit: 1,
    estimate: 1100,
    recommendation: "DRIP EDGE IS LEAKINGVirginia Building code R1003.9.1 requires masonry chimneys to have a drip edge. The drip edge is designed to have water that flows off the top of the chimney to drip off the chimney instead of cascading. Water that saturates the exterior of the chimney will damage mortar joints and lead to leaks.A Step in Time recommends sealing drip edges with elastomeric sealant to prevent water from entering the horizontal mortar joint above the drip edge. This helps prevent water from damaging underlying mortar joints below the drip edge."
  },
  {
    srNo: 15,
    description: 'Flex Shot Brick Joints',
    unit: 1,
    estimate: 390,
    recommendation: "BRICK JOINTS GAPPED, VOIDED AND LEAKINGTight well tooled brick joints prevent leaks in brick joints. When water enters gapped brick joints, the water can freeze and thaw and make the voids worse. The expansion of the ice will deteriorate mortar joints. When brick joints develop these voids, the solution is to try to keep it from getting worse. The best ways to keep water from entering these voids is to inject clear rubber material and coat the masonry brick with industrial strength \"breathable\" masonry water repellant. This helps to prevent water from entering that masonry."
  },
  {
    srNo: 16,
    description: 'Rust Inhibit Flashing',
    unit: 1,
    estimate: 690,
    recommendation: "CHIMNEY FLASHING IS RUSTEDVirginia Building Code R507.2.4 requires that \"flashing shall be corrosion-resistant.\"The flashing that has been installed is rusted and will soon leak.A Step in Time recommends to either rust inhibit the existing flashing or replace it with new flashing. Rust inhibiting the flashing will simply add life but cannot change the underlying material composition."
  },
  {
    srNo: 17,
    description: 'Replace Chimney Flashing',
    unit: 1,
    estimate: 290,
    recommendation: "CHIMNEY FLASHING HAS BEEN IMPROPERLY INSTALLEDVirginia Building Code R905.2.8.4 Other Flashing: chimney flashing shall be applied in accordance with the asphalt manufacture's printed instructions.GAF requires counterflashing to extend over the base step flashing and to be completely sealed with elastomeric polyurethane sealant.A Step in Time recommends replacing the chimney flashing."
  },
  {
    srNo: 18,
    description: 'Reseal Flashing',
    unit: 1,
    estimate: 1500,
    recommendation: "CHIMNEY FLASHING REQUIRES RESEALINGVirginia Building Code R905.2.8.4 Other Flashing: chimney flashing shall be applied in accordance with the asphalt manufacture's printed instructions.GAF requires counterflashing to extend over the base step flashing and to be completely sealed with elastomeric polyurethane sealant."
  },
  {
    srNo: 19,
    description: 'Install Cricket',
    unit: 1,
    estimate: 290,
    recommendation: "CHIMNEY REQUIRES A CRICKETVirginia Building code R1003.20 Chimney Crickets. Chimneys shall be provided with crickets where the dimensions parallel to the ridgeline are greater than 30 inches.Chimney crickets are designed to divert water around the chimney and can prevent leaks around the chimney. The installation of chimney crickets requires complete removal of chimney flashing, removal of shingles and underlayment, rebuilding the roof,  reinstallation of underlayment and chimney flashing, and the installation of a code compliant chimney cricket."
  },
  {
    srNo: 20,
    description: 'Profile Seams Exterior Caulking',
    unit: 1,
    estimate: 2100,
    recommendation: "SEAL CHIMNEY TO SIDING LIFETIME CAULK Virginia Maintenance code requires sealing all exposed opening that can be exposed to weather. The joint between the chimney and the residence requires sealing to prevent sideways rain from entering between the chimney and the residence./ A Step in Time recommends sealing from ground to roofline with lifetime caulk."
  },
  {
    srNo: 21,
    description: 'Repair Shoulders',
    unit: 1,
    estimate: 590,
    recommendation: "CHIMNEY SHOULDERS REQUIRE REPAIRVirginia Building code R1003.5 Corbeling: The projection of a single course shall not exceed half the unit height or one third the unit bed depth, whichever is less.Many times, shoulders are not properly corbeled, and brick holes are exposed, or the chimney shoulders can leak into the smoke chamber. Rebuilding an improperly built chimney is not practical, but parging or repairing exposed chimney shoulders can help prevent water leakage into the chimney."
  },
  {
    srNo: 22,
    description: 'Cut And Reinstall Thermal Damaged Bricks Behind Smoke Chamber',
    unit: 1,
    estimate: 890,
    recommendation: "THERMAL CRACKS ARE LOCATED BEHIND THE SMOKE CHAMBERVirginia Building Code R1001.8 requires the smoke chamber wall to be a minimum of 8 inches thick and parged with refractory mortar. The exposed side of the smoke chamber will crack if the wall is too thin and not properly parged with refractory mortar. The exact reason is that the inner smoke chamber is heated during use, and the opposite side of the exposed wall is cool from the outside air. This change in temperature of the brick will cause the brick to expand on the heated inner surface and contract on cooler outer surface. This thermal expansion difference causes stresses in the brick, which causes vertical cracks. Coating the inner smoke chamber with thick refractory mortar helps prevent this noticeable change in temperatures problems."
  },
  {
    srNo: 23,
    description: 'Install Stainless Steel Chimney Liner To Replace Unsupported Liner',
    unit: 1,
    estimate: 1800,
    recommendation: "BOTTOM FLUE TILE IS NOT PROPERLY SUPPORTEDVirginia Building code R1003.12 states: \"Flue liners shall be supported on all sides.\"If the flue liner is not supported by all sides,  when the inner portion of the liners heat, the liner can extend into the smoke chamber, and ultimately may collapse into the smoke chamber.A Step in Time recommends removal of all the vitrified clay flue tiles and installation of a stainless steel chimney liner."
  },
  {
    srNo: 24,
    description: 'Parge Lower Flue Tile Gape With Refractory Mortar',
    unit: 1,
    estimate: 4900,
    recommendation: "BOTTOM FLUE TILE IS NOT PROPERLY SUPPORTEDVirginia Building code R1003.12 states: \"Flue liners shall be supported on all sides.\"If the flue liner is not supported by all sides, then gas and creosote can migrate between the flue liner and the enclosed chimney. This can cause a fire hazard and can also allow CO to escape through the chimney and into the residence.A Step in Time recommend sealing the voids where the liner is not supported with high temperature refractory mortar."
  },
  {
    srNo: 25,
    description: 'Parge Smoke Chamber With Chambertech 2000',
    unit: 1,
    estimate: 690,
    recommendation: "SMOKE CHAMBER REQUIRES PARGINGVirginia Building Code R1001.8.1 Smoke Chamber: requires \"The inside surface shall be parged smooth with refractory mortar.\" Smoke chambers are required to be parged smooth with refractory mortar to provide a smooth draft through the smoke chambers and prevent creosote and heat from transferring through the corbeled brick, which can lead to heating of surrounding timber structural members.A Step in Time recommends parging the smoke chamber with refractory mortar conforming with ASTM C199."
  },
  {
    srNo: 26,
    description: 'Fill Voided Smoke Shelf With Fireclay Mortar',
    unit: 1,
    estimate: 1500,
    recommendation: "SMOKE SHELF IS MISSING AND REQUIRES INSTALLATIONVirginia Building Code Figure R1001.1 (Fireplace and Chimney Details) shows the curved smoke shelf next to detail H - vertical reinforcement. The upward smooth curve of the smoke shelf is designed to provide a circular airflow where air travels downward along the rear smoke shelf and reverses direction along the curved smoke shelf to direct upward airflow past the damper, which increases draft. Filled smoke shelves also reinforce the structural integrity of the rear firebox wall.A Step in Time recommends filling the smoke shelf area with refractory mortar as per Virginia Building codes."
  },
  {
    srNo: 27,
    description: 'Install Stainless Steel Cap Damper In Place Of Rotary Damper',
    unit: 1,
    estimate: 1500,
    recommendation: "RECOMMEND CAP DAMPERVirginia Building Code R1001.7.1 Damper - Masonry fireplaces shall be equipped with a ferrous metal damper. R1003.17 Masonry chimney cleanout openings shall be provided. Exception: Chimney flues servicing masonry fireplaces where cleaning is possible through the fireplace opening.A Step in Time recommends replacing all rotary dampers with cap dampers because the rotary damper mechanism prevents proper cleaning through the fireplace opening."
  },
  {
    srNo: 28,
    description: 'Install Stainless Steel Cap Damper To Improve Draft',
    unit: 1,
    estimate: 1090,
    recommendation: "RECOMMEND CAP DAMPERVirginia Building Code R1001.7.1 Damper - Masonry fireplaces shall be equipped with a ferrous metal damper. R1003.17 Masonry chimney cleanout opening shall be provided. Exception: Chimney flues servicing masonry fireplaces where cleaning is possible through the fireplace opening.A Step in Time recommends installing an energy efficient cap damper, which improves draft and allows for easier cleaning through the fireplace opening."
  },
  {
    srNo: 29,
    description: 'Liner To Wood Stove',
    unit: 1,
    estimate: 890,
    recommendation: "WOOD STOVE REQUIRES DIRECT CONNECT LINERVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 13.4.5.1 \"A natural draft solid fuel burning appliance such as a wood stove or insert shall be permitted to be used in a masonry fireplace flue, where the following conditions are met: 1) There is a connector between the appliance to the flue liner.In the 1970's and 1980's many homes had wood stove inserts installed, and insurance companies found that the decreased opening of the wood stove drafted the appliance extremely slowly, which produced large amounts of creosote. This dangerous situation caused many chimney fires, and the building code officials solved this problem by requiring smaller direct connect liners installed from the appliance up the chimney liner."
  },
  {
    srNo: 30,
    description: 'Parge Lintel Joint With Refractory Mortar',
    unit: 1,
    estimate: 2900,
    recommendation: "LINTEL JOINT REQUIRES PARGINGVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high-temperature insulating mortar."
  },
  {
    srNo: 31,
    description: 'Repair Cracked Profile Seams With Refractory Mortar',
    unit: 1,
    estimate: 390,
    recommendation: "FIREBOX PROFILE SEAMS REQUIRES PARGINGVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    srNo: 32,
    description: 'Repair Inner/Outer Profile Seam With Refractory Mortar',
    unit: 1,
    estimate: 290,
    recommendation: "JOINT BETWEEN INNER & OUTER HEARTH REQUIRES PARGINGVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    srNo: 33,
    description: 'Repoint Firebox Joints With Refractory Mortar',
    unit: 1,
    estimate: 190,
    recommendation: "FIREBOX MORTAR JOINTS REQUIRE REPOINTINGVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    srNo: 34,
    description: 'Replace Ash Dump Door',
    unit: 1,
    estimate: 990,
    recommendation: "REPLACE ASH DUMP DOORVirginia Building Code R1001.2.1 Ash Dump Cleanout is required \"to remain tightly closed except when in use.\"Many times, ash dump doors will warp, rust, or become inoperable after repeated use.A Step in Time recommends replacement of the ash dump door."
  },
  {
    srNo: 35,
    description: 'Replace Clean Out Door',
    unit: 1,
    estimate: 90,
    recommendation: "REPLACE CLEAN-OUT DOORVirginia Building Code R1001.2.1 Clean outs shall be located to allow access so that ash removal will not create a hazard to combustible materials. Additional clean-out doors are required to remain tightly closed.Many times, clean-out doors will warp, rust, or become inoperable after repeated use.A Step in Time recommends replacement of the clean-out door."
  },
  {
    srNo: 36,
    description: 'Remove Timber Formwork',
    unit: 1,
    estimate: 490,
    recommendation: "REMOVE COMBUSTIBLE MATERIAL UNDER HEARTHVirginia Building Code R1001.9 requires: \"Combustible material shall not remain against the underside of hearths and hearth extensions after construction.\"The heat from the firebox can heat the combustible material under the hearth. This combustible material should be removed, and the outer heart may require support using foundation and pier supports."
  },
  {
    srNo: 37,
    description: 'Remove Wood Stove',
    unit: 1,
    estimate: 2100,
    recommendation: "WOOD STOVE INSERT SHOULD BE REMOVEDVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 13.4.5.1 \"A natural draft solid fuel burning appliance such as a wood stove or insert shall be permitted to be used in a masonry fireplace flue, where the following conditions are met: 1) There is a connector between the appliance to the flue liner.In the 1970's and 1980's many homes had wood stove inserts installed, and insurance companies found that the decreased opening of the wood stove drafted the appliance extremely slowly, which produced large amounts of creosote. This dangerous situation caused many chimney fires, and the building code officials solved this problem by requiring smaller direct connect liners installed from the appliance up the chimney liner."
  },
  {
    srNo: 38,
    description: 'Level 2 Chimney Inspection Is Required',
    unit: 1,
      estimate: 450,
    recommendation: "Virginia Chimneys, Fireplaces, Vents and Solid Fuel-Burning Appliance Code 15.4 states: A Level II inspection is indicated when verification of the suitability of the chimney for new or changed conditions of service is needed or when a Level I inspection is not sufficient to determine the serviceability of the chimney. 15.4.1: Circumstances: After a building or chimney fire, weather or seismic event, or other incident likely to have caused damage to the chimney."
  },
  {
    srNo: 39,
    description: 'Level 2 Chimney Inspection Is Required',
    unit: 1,
    estimate: 100,
    recommendation: "Virginia Chimneys, Fireplaces, Vents and Solid Fuel-Burning Appliance Code 15.4 states: A Level II inspection is indicated when verification of the suitability of the chimney for new or changed conditions of service is needed or when a Level I inspection is not sufficient to determine the serviceability of the chimney. 15.4.1: Circumstances: After a building or chimney fire, weather or seismic event, or other incident likely to have caused damage to the chimney."
  }
];


export const Page7: React.FC<Page7Props> = ({
  scrapedImages = [],
  selectedImages = [],
  onImageSelection,
  isPDF = false,
  repairEstimateData,
  reviewImage,
  customRecommendation
}) => {
  const tableRows = repairEstimateData?.rows || [];
  const [availableImages, setAvailableImages] = useState<ImageItem[]>(selectedImages);

  useEffect(() => {
    // Filter out used images
    const unusedImages = selectedImages.filter(img => !img.used);
    setAvailableImages(unusedImages);
  }, [selectedImages]);


  const markImageAsUsed = (imageId: string) => {
    // Mark image as used
    const updatedImages = selectedImages.map(img => 
      img.id === imageId ? { ...img, used: true } : img
    );
    onImageSelection?.(updatedImages);
    
    // Update available images
    setAvailableImages(availableImages.filter(img => img.id !== imageId));
  };

  const calculateTotal = () => {
    return tableRows.reduce((total, row) => total + (row.unit * row.price), 0);
  };

  // For PDF mode, render the preview only
  if (isPDF) {
    return (
      <div className="bg-white w-[595px] h-[842px] mx-auto">
        <div className="relative w-[546px] h-[790px] top-[26px] left-[22.5px]">
          {/* Header Section */}
          <div className="w-[393px] h-[106px] absolute top-[25px]" style={{left: '50%', transform: 'translateX(-50%)'}}>
            <div className="absolute w-[391px] h-[54px] top-[52px] left-0 bg-black rounded-[36px] border-[6px] border-solid border-[#722420]">
              <div className="absolute w-[364px] top-[4px] left-2 [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[21px] text-center tracking-[0.42px] leading-[normal] whitespace-nowrap">
                Repair Estimate
              </div>
            </div>
            <img className="absolute w-[124px] h-[52px] top-0 left-[134px] aspect-[2.4] object-cover" alt="Logo" src="/logo.webp" />
          </div>

          {/* Table Section */}
          <div style={{ position: 'absolute', top: '140px', left: '29px', right: '29px' }}>
          <div 
            style={{
                width: '100%', 
                fontSize: '12px',
                fontFamily: 'Inter, Arial, sans-serif'
              }}
            >
              {/* Header Row */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: '#722420', 
                borderBottom: '2px solid #722420' 
              }}>
                <div style={{ 
                  flex: '1',
                  textAlign: 'center', 
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Description
                </div>
                <div style={{ 
                  width: '80px',
                  textAlign: 'center', 
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Unit
                </div>
                <div style={{ 
                  width: '100px',
                  height: '30px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Price
                </div>
                <div style={{ 
                  width: '100px',
                  textAlign: 'center',
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#ffffff',
                  backgroundColor: '#722420'
                }}>
                  Total
                </div>
          </div>

              {/* Data Rows */}
              {tableRows.map((row, index) => {
                const total = row.unit * row.price;
                return (
                  <div key={row.id} style={{ 
                    display: 'flex',
                    minHeight: '30px',
                    marginBottom: '4px',
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                  }}>
                    <div style={{ 
                      flex: '1',
                      minHeight: '30px',
                      position: 'relative',
                      backgroundColor: 'inherit'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '6px',
                        right: '6px',
                        bottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: '1.5',
                        textAlign: 'center',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        hyphens: 'auto',
                        fontSize: '8px'
                      }}>
                        {row.description}
                      </div>
                    </div>
                    <div style={{ 
                      width: '80px',
                      minHeight: '30px',
                      position: 'relative',
                      backgroundColor: 'inherit'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '10px',
                        right: '10px',
                        bottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        {row.unit}
                      </div>
                    </div>
                    <div style={{ 
                      width: '100px',
                      minHeight: '30px',
                      position: 'relative',
                      backgroundColor: 'inherit'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '10px',
                        right: '10px',
                        bottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                      }}>
                        ${row.price.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ 
                      width: '100px',
                      minHeight: '30px',
                      position: 'relative',
                      backgroundColor: 'inherit'
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '8px',
                        left: '10px',
                        right: '10px',
                        bottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        fontWeight: '600'
                      }}>
                        ${total.toLocaleString()}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Total row */}
              {tableRows.length > 0 && (
                <div style={{ 
                  display: 'flex',
                  height: '30px',
                  backgroundColor: '#722420', 
                  color: 'white',
                  borderTop: '2px solid #722420',
                  fontWeight: '700'
                }}>
                  <div style={{ 
                    flex: '1',
                    height: '30px',
                    backgroundColor: '#722420'
                  }}></div>
                  <div style={{ 
                    width: '80px',
                    height: '30px',
                    backgroundColor: '#722420'
                  }}></div>
                  <div style={{ 
                    width: '100px',
                    height: '30px',
                    position: 'relative',
                    backgroundColor: '#722420'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0px',
                      left: '6px',
                      right: '6px',
                      bottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      textAlign: 'right',
                      letterSpacing: '0.42px',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      TOTAL :
                    </div>
                  </div>
                  <div style={{ 
                    width: '100px',
                    height: '30px',
                    position: 'relative',
                    backgroundColor: '#722420'
                  }}>
                    <div style={{
                      position: 'absolute',
                      top: '0px',
                      left: '6px',
                      right: '6px',
                      bottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#ffffff'
                    }}>
                      ${calculateTotal().toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {tableRows.length === 0 && (
                <div style={{ 
                  display: 'flex',
                  height: '50px',
                  backgroundColor: '#f8f9fa',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6c757d',
                  fontSize: '14px'
                }}>
                  No repair items added yet
              </div>
              )}
            </div>
          </div>

          {/* Recommendations Section */}
          {tableRows.some(row => row.recommendation) && (
            <div style={{ 
              position: 'absolute', 
              left: '29px', 
              right: '29px',
              top: (() => {
                const baseTop = 160; // Table starts at 160px
                const headerHeight = 30; // Header row height
                const totalRowHeight = 30; // Total row height
                const rows = tableRows || [];
                
                // Calculate dynamic row heights based on description length
                let totalRowsHeight = 0;
                rows.forEach(row => {
                  const descLength = (row.description || '').length;
                  // Very conservative estimate: 30 chars per line for description column in PDF
                  // (accounting for flex: '1' column width, font size, and padding)
                  const estimatedLines = Math.max(1, Math.ceil(descLength / 30));
                  // Each line is about 22px in PDF, minimum 30px row height, plus 4px margin
                  const rowHeight = Math.max(30, (estimatedLines * 22) + 16) + 4;
                  totalRowsHeight += rowHeight;
                });
                
                // Add minimal spacing to prevent overlap with recommendations
                totalRowsHeight += 20;
                
                // Calculate dynamic position based on actual table content
                const calculatedTop = baseTop + headerHeight + totalRowsHeight + totalRowHeight + 5;
                return `${calculatedTop}px`;
              })()
            }}>
              <div style={{ 
                backgroundColor: '#f8f9fa', 
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                position: 'relative',
                minHeight: (() => {
                  const recommendationText = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                  const textLength = recommendationText.length;
                  // Estimate height based on text length (roughly 80 chars per line at 8px font)
                  const estimatedLines = Math.max(2, Math.ceil(textLength / 80));
                  // Header (17px) + text lines (8.5px each) + minimal padding (3px) - 15% reduction
                  return `${17 + (estimatedLines * 8.5) + 3}px`;
                })()
              }}>
                <h4 style={{ 
                  position: 'absolute',
                  top: '6px',
                  left: '12px',
                  right: '12px',
                  fontSize: '10px', 
                  fontWeight: '700', 
                  color: '#722420',
                  fontFamily: 'Inter, Arial, sans-serif',
                  margin: '0',
                  height: '10px'
                }}>
                  Professional Recommendations:
                </h4>
                <p style={{ 
                  position: 'absolute',
                  top: '20px',
                  left: '12px',
                  right: '12px',
                  bottom: '0px',  // Minimal bottom margin
                  fontSize: '8px', 
                  color: '#495057', 
                  lineHeight: '1.3',
                  margin: '0',
                  fontFamily: 'Inter, Arial, sans-serif',
                  textAlign: 'justify'
                }}>
                  {(() => {
                    const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                    const allRecommendations = customRecommendation ? 
                      `${tableRecommendations} ${customRecommendation}`.trim() : 
                      tableRecommendations;
                    return allRecommendations;
                  })()}
                </p>
              </div>
            </div>
          )}

          {/* Review Image Section */}
          {reviewImage && (
            <div 
              style={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)',
                bottom: (() => {
                  const recommendationText = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                  const textLength = recommendationText.length;
                  
                  // Dynamic positioning based on text length
                  if (textLength > 2000) return '5px';       // Very long text - very low position
                  if (textLength > 1500) return '10px';      // Long text - low position  
                  if (textLength > 1000) return '20px';      // Medium text - medium position
                  if (textLength > 500) return '35px';       // Short text - higher position
                  return '50px';                             // Very short or no text - highest position
                })()
              }}
            >
              <img
                src={reviewImage}
                alt="Review image"
                style={{
                  maxWidth: (() => {
                    const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                    const allRecommendations = customRecommendation ? 
                      `${tableRecommendations} ${customRecommendation}`.trim() : 
                      tableRecommendations;
                    const textLength = allRecommendations.length;
                    
                    if (textLength > 2000) return '280px';
                    if (textLength > 1500) return '320px';
                    if (textLength > 1000) return '350px';
                    return '390px';
                  })(),
                  maxHeight: (() => {
                    const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                    const allRecommendations = customRecommendation ? 
                      `${tableRecommendations} ${customRecommendation}`.trim() : 
                      tableRecommendations;
                    const textLength = allRecommendations.length;
                    
                    if (textLength > 2000) return '190px';
                    if (textLength > 1500) return '220px';
                    if (textLength > 1000) return '250px';
                    return '280px';
                  })(),
                  objectFit: 'contain',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}
              />
            </div>
          )}

          {/* Frame Border */}
          <div className="w-[546px] h-[790px] border-2 border-solid border-[#722420] absolute top-0 left-0">
            <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
          </div>
        </div>
      </div>
    );
  }

  // For non-PDF mode, render the preview in the standard layout
  return (
    <div className="bg-white w-[595px] h-[842px] mx-auto">
      <div className="relative w-[546px] h-[790px] top-[26px] left-[22.5px]">
        {/* Header Section */}
        <div 
          className="w-[393px] h-[106px] absolute top-[25px]"
          style={{
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="absolute w-[391px] h-[54px] top-[52px] left-0 bg-black rounded-[36px] border-[6px] border-solid border-[#722420]">
            <div 
              className="absolute w-[364px] top-[8px] left-2 [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[21px] text-center tracking-[0.42px] leading-[normal] whitespace-nowrap"
            >
              Repair Estimate
            </div>
          </div>
          <img
            className="absolute w-[124px] h-[52px] top-0 left-[134px] aspect-[2.4] object-cover"
            alt="Logo"
            src="/logo.webp"
          />
        </div>

        {/* Table Section */}
        <div style={{ position: 'absolute', top: '160px', left: '29px', right: '29px' }}>
        <div 
          style={{
              width: '100%', 
              fontSize: '12px',
              fontFamily: 'Inter, Arial, sans-serif'
            }}
          >
            {/* Header Row */}
            <div style={{ 
              display: 'flex', 
              backgroundColor: '#722420', 
              borderBottom: '2px solid #722420' 
            }}>
              <div style={{ 
                flex: '1',
                textAlign: 'center', 
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#722420'
              }}>
                Description
              </div>
              <div style={{ 
                width: '80px',
                textAlign: 'center', 
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#722420'
              }}>
                Unit
              </div>
              <div style={{ 
                width: '100px',
                height: '30px',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#722420'
              }}>
                Price
              </div>
              <div style={{ 
                width: '100px',
                textAlign: 'center',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                color: '#ffffff',
                backgroundColor: '#722420'
              }}>
                Total
              </div>
            </div>

            {/* Data Rows */}
            {tableRows.map((row, index) => {
              const total = row.unit * row.price;
              return (
                <div key={row.id} style={{ 
                  display: 'flex',
                  minHeight: '30px',
                  marginBottom: '4px',
                  backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa'
                }}>
                  <div style={{ 
                    flex: '1',
                    padding: '8px 10px', 
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: '1.2',
                    textAlign: 'center',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    backgroundColor: 'inherit'
                  }}>
                    {row.description}
                  </div>
                  <div style={{ 
                    width: '80px',
                    padding: '8px 10px', 
                    textAlign: 'center',
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'inherit'
                  }}>
                    {row.unit}
                  </div>
                  <div style={{ 
                    width: '100px',
                    padding: '8px 10px', 
                    textAlign: 'center', 
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'inherit'
                  }}>
                    ${row.price.toLocaleString()}
                  </div>
                  <div style={{ 
                    width: '100px',
                    padding: '8px 10px', 
                    textAlign: 'center', 
                    minHeight: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600',
                    backgroundColor: 'inherit'
                  }}>
                    ${total.toLocaleString()}
                  </div>
                </div>
              );
            })}

            {/* Total row */}
              {tableRows.length > 0 && (
              <div style={{ 
                display: 'flex',
                height: '30px',
                backgroundColor: '#722420', 
                color: 'white',
                borderTop: '2px solid #722420',
                fontWeight: '700'
              }}>
                <div style={{ 
                  flex: '1',
                  height: '30px',
                  backgroundColor: '#722420'
                }}></div>
                <div style={{ 
                  width: '80px',
                  height: '30px',
                  backgroundColor: '#722420'
                }}></div>
                <div style={{ 
                  width: '100px',
                  padding: '2px 6px', 
                  textAlign: 'right', 
                  height: '30px',
                  letterSpacing: '0.42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: '#722420',
                  color: '#ffffff'
                }}>
                  TOTAL :
                </div>
                <div style={{ 
                  width: '100px',
                  padding: '2px 6px', 
                  textAlign: 'center', 
                  height: '30px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: '600',
                  backgroundColor: '#722420',
                  color: '#ffffff'
                }}>
                  ${calculateTotal().toLocaleString()}
                </div>
              </div>
            )}

            {/* Empty state */}
              {tableRows.length === 0 && (
              <div style={{ 
                display: 'flex',
                height: '50px',
                backgroundColor: '#f8f9fa',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6c757d',
                fontSize: '14px'
              }}>
                    No repair items added yet
                </div>
              )}
          </div>
        </div>

        {/* Recommendations Section */}
        {tableRows.some(row => row.recommendation) && (
          <div 
            className="absolute left-0 right-0 px-7"
            style={{
              top: (() => {
                const baseTop = 160; // Table starts at 160px
                const headerHeight = 30; // Header row height
                const totalRowHeight = 30; // Total row height
                const rows = tableRows || [];
                
                // Calculate dynamic row heights based on description length
                let totalRowsHeight = 0;
                rows.forEach(row => {
                  const descLength = (row.description || '').length;
                  // Very conservative estimate: 30 chars per line for description column in PDF
                  // (accounting for flex: '1' column width, font size, and padding)
                  const estimatedLines = Math.max(1, Math.ceil(descLength / 30));
                  // Each line is about 22px in PDF, minimum 30px row height, plus 4px margin
                  const rowHeight = Math.max(30, (estimatedLines * 22) + 16) + 4;
                  totalRowsHeight += rowHeight;
                });
                
                // Add minimal spacing to prevent overlap with recommendations
                totalRowsHeight += 20;
                
                // Calculate dynamic position based on actual table content
                const calculatedTop = baseTop + headerHeight + totalRowsHeight + totalRowHeight + 5;
                return `${calculatedTop}px`;
              })()
            }}
          >
            <div className="bg-gray-50 p-3 rounded border">
              <h4 className="text-xs font-bold mb-2 text-[#722420]">Professional Recommendations:</h4>
              <p className="text-[8.5px] text-gray-700 leading-tight text-justify">
                {(() => {
                  const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                  const allRecommendations = customRecommendation ? 
                    `${tableRecommendations} ${customRecommendation}`.trim() : 
                    tableRecommendations;
                  return allRecommendations;
                })()}
              </p>
            </div>
          </div>
        )}

        {/* Review Image Section */}
        {reviewImage && (
          <div 
            className="absolute left-[50%] transform -translate-x-1/2"
            style={{
              bottom: (() => {
                const recommendationText = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                const textLength = recommendationText.length;
                
                // Dynamic positioning based on text length
                if (textLength > 2000) return '5px';       // Very long text - very low position
                if (textLength > 1500) return '10px';      // Long text - low position  
                if (textLength > 1000) return '20px';      // Medium text - medium position
                if (textLength > 500) return '35px';       // Short text - higher position
                return '50px';                             // Very short or no text - highest position
              })()
            }}
          >
            <img
              src={reviewImage}
              alt="Review image"
              style={{
                maxWidth: (() => {
                  const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                  const allRecommendations = customRecommendation ? 
                    `${tableRecommendations} ${customRecommendation}`.trim() : 
                    tableRecommendations;
                  const textLength = allRecommendations.length;
                  
                  if (textLength > 2000) return '280px';
                  if (textLength > 1200) return '320px';
                  if (textLength > 1000) return '350px';
                  return '390px';
                })(),
                maxHeight: (() => {
                  const tableRecommendations = tableRows.filter(row => row.recommendation).map(row => row.recommendation).join(' ');
                  const allRecommendations = customRecommendation ? 
                    `${tableRecommendations} ${customRecommendation}`.trim() : 
                    tableRecommendations;
                  const textLength = allRecommendations.length;
                  
                  if (textLength > 2000) return '190px';
                  if (textLength > 1500) return '220px';
                  if (textLength > 1000) return '250px';
                  return '280px';
                })(),
                objectFit: 'contain',
                borderRadius: '4px',
                border: '1px solid #e9ecef',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            />
          </div>
        )}

        {/* Frame Border */}
        <div className="w-[546px] h-[790px] border-2 border-solid border-[#722420] absolute top-0 left-0">
          <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
        </div>
      </div>
    </div>
  );
};

export default Page7;
