import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';
import Page4 from './Page4';
import Page5 from './Page5';
import Page6 from './Page6';
import Page7 from './Page7';
import Page8 from './Page8';
import Page9Part1 from './Page9-part1';
import Page9Part2 from './Page9-part2';
import Page9Part3 from './Page9-part3';
import Page9Part4 from './Page9-part4';
import Step10Part1 from './Step10Part1';
import Step10Part2 from './Step10Part2';
import DataScraper from './DataScraper';
import ImageCropper from './ImageCropper';

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
}

export interface FormData {
  // Client Information
  clientName: string;
  clientAddress: string;
  chimneyType: string;
  reportDate: string;
  timelineCoverImage?: string; // Timeline cover image from scraped data
  scrapedImages?: ImageItem[]; // All images from DataScraper
  selectedImages?: ImageItem[]; // Selected images for Page6
  invoiceData?: {
    invoiceNumber: string;
    paymentMethod: string;
    paymentNumber: string;
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
    }>;
  };
  repairEstimatePages?: Array<{
    id: string;
    reviewImage: string;
    customRecommendation?: string; // Custom recommendation text
    repairEstimateData: {
      manualEntry: boolean;
      rows: Array<{
        id: string;
        srNo: number;
        description: string;
        unit: number;
        price: number;
        isManual: boolean; // Individual row entry mode
        recommendation?: string; // Recommendation text for predefined items
      }>;
    };
  }>;
  usedReviewImages?: string[]; // Track used images to remove from available list
}

const dropdownOptions = [
  {
    id: '1',
    srNo: 1,
    description: 'Install Multi-Flue Chimney Cap With Manf Lifetime Warranty',
    unit: 1,
    price: 340,
    recommendation: 'REPLACE SINGLE FLUE CHIMNEY CAP Virginia Residential code R1003.9.1 states: Chimney caps. Masonry chimneys shall have a concrete, metal or stone cap….Chimney caps are designed to keep animals, rain, leaves and wind induced downdrafts from entering the chimney. They also help prevent hot embers from drafting out of the flue and landing on the roof. Chimney caps are required by modern building codes.A Step in Time recommends replacing chimney caps that are missing, rusted, damaged, improperly sized, improperly bolted or improperly screened as required by Virginia building codes.'
  },
  {
    id: '2',
    srNo: 2,
    description: 'Replace Top Flue Tile',
    unit: 1,
    price: 990,
    recommendation: 'INSTALL MUILTFLUE CHIMNEY CAPVirginia Residential code R1003.9.1 states: Chimney caps. Masonry chimneys shall have a concrete, metal or stone cap….Chimney caps are designed to keep animals, rain, leaves and wind induced downdrafts from entering the chimney. They also help prevent hot embers from drafting out of the flue and landing on the roof. Chimney caps are required by modern building codes.A Step in Time recommends replacing chimney caps that are missing, rusted, damaged, improperly sized, improperly bolted or improperly screened as required by Virginia building codes.'
  },
  {
    id: '3',
    srNo: 3,
    description: 'Parge Top Flue Tile Joint With Refractory Mortar',
    unit: 1,
    price: 890,
    recommendation: 'REPLACE TOP FLUE LINER Virginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. Virginia Residential Code R1003.9.1 require flue liners to be installed in accordance with ASTM C1283. NFPA 211 14.9 require damaged or deteriorated liners to be replaced, repaired or relined. NFPA 211 7.2.13.3 requires the top flue liner to extend above the crown at least 2 inches. ASTM C1283 8.5 specifies the flue shall not extend father than 4 inches above the chimney crown.A Step in Time recommends replacement of top flue liners if the liner is less than 2 inches above the crown so that chimney caps can be properly fastened to the flue tile. A Step in Time recommends replacing flues that extend above 4 inches if they are part of a multiflued chimney so a proper cap can be installed to allow appropriate draft. A Step in Time recommends replacement of damaged or deteriorated top flue liners, depending on the extent of damage and the ability to contain combustion and house a chimney cap.'
  },
  {
    id: '4',
    srNo: 4,
    description: 'Fireguard All Flue Liner Joints',
    unit: 1,
    price: 290,
    recommendation: 'REPAIR GAPPED VOIDED JOINT BETWEEN 1ST AND 2ND FLUE TILESVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 states  "Flue liners shall be maintained by filling any voids in the interior, or hot face, with medium duty water insoluble refractory mortar conforming to Test Method C199."A Step in Time recommends repairing any voids between flue liners with approved material. This material may be products like FIREGUARD LINER REPAIR or refractory mortar conforming to C199.'
  },
  {
    id: '5',
    srNo: 5,
    description: 'Install Stainless Steel Chimney Liner',
    unit: 1,
    price: 3500,
    recommendation: 'REPAIR GAPPED VOIDED JOINTS BETWEEN FLUE LINERSVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 states  "Flue liners shall be maintained by filling any voids in the interior, or hot face, with medium duty water insoluble refractory mortar conforming to Test Method C199."A Step in Time recommends repairing any voids between flue liners with approved material. This material may be products like FIREGUARD LINER REPAIR or refractory mortar conforming to C199.'
  },
  {
    id: '6',
    srNo: 6,
    description: 'Install Stainless Steel Chimney Liner To Repair Damaged Chimney Fire Liner',
    unit: 1,
    price: 4900,
    recommendation: 'CHIMNEY LINERS ARE OFFSET & REQUIRE RELININGVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 5.4 states: Flue Liners shall be installed each flue liner carefully bedded on the previous one, using water insoluble refractory mortar complying with Test Method C199 (medium duty). All joints of the flue liner shall be 1/16 inch to 1/8 inch thick and struck flush to produce a straight, smooth, fully aligned flue. Liners shall be placed in such a manner as to minimize ledges or steps within the flue passageway.The flue liners are offset which can cause creosote and flue gases to escape into the chimney chase. This can lead to fire hazards and CO migration into the residence. A Step in Time recommends relining with a UL listed stainless steel chimney liner.'
  },
  {
    id: '7',
    srNo: 7,
    description: 'Repair Chimney Fire Damaged Flue Tiles With Fireguard Chimney Liner Repair',
    unit: 1,
    price: 4900,
    recommendation: 'EVIDENCE OF CHIMNEY FIRE - OFFSET TILESVirginia Building code R1003.12 require clay flue liners to be installed in accordance with ASTM C1283. ASTM C1283 5.4 states: Flue Liners shall be installed each flue liner carefully bedded on the previous one, using water insoluble refractory mortar complying with Test Method C199 (medium duty). All joints of the flue liner shall be 1/16 inch to 1/8 inch thick and struck flush to produce a straight, smooth, fully aligned flue. Liners shall be placed in such a manner as to minimize ledges or steps within the flue passageway.CHIMNEY FIRES OVERHEAT THE CHIMNEY LINER. If the chimney liner overheats, the thermal expansion of the chimney liner causes the liners to offset. The bottom of the liner is pressed on the supporting brick at the top of the smoke chamber. The top of the chimney liner is encased by the chimney crown. When the liner overheats from a chimney fire, it thermally expands and causes the entire liner to buckle, which results in offset flue tiles.Flue liners are designed to contain creosote and flue gases to safely expel to the atmosphere. Offset tiles will allow gases and creosote to transfer to the inner chimney chase, which can result in potential fire hazards and CO poisoning into the residence. A Step in Time recommends the installation of a stainless steel chimney liner to repair the damaged offset flue liners. '
  },
  {
    id: '8',  
    srNo: 8,
    description: 'Fireguard Repair Of Chimney Fire Damaged Liner Joints',
    unit: 1,
    price: 4900,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion, the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends repairing the chimney liner with FIREGUARD liner repair material."
  },
  {
    id: '9',
    srNo: 9,
    description: 'Install Stainless Steel Chimney Liner To Repair Damaged Chimney Fire Liner',
    unit: 1,
    price: 3500,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion (i.e., heat, moisture, creosote, and flue gases), the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends replacing the chimney liner with a UL listed stainless steel liner."
  },
  {
    id: '10',
    srNo: 10,
    description: 'No Wythe Wall',
    unit: 1,
    price: 4900,
    recommendation: "EVIDENCE OF CHIMNEY FIRE - CRACKED TILESVirginia Residential code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. NFPA 211 14.9 discuss Damaged or Deteriorated Liners. If the flue liner in a chimney has softened, cracked, or otherwise deteriorated so that it no longer has the continued ability to contain the products of combustion (i.e., heat, moisture, creosote, and flue gases), the liner shall be either removed and replaced, repaired, or relined with a listed liner system or other approved material that will resist corrosion, softening, or cracking from flue gases at temperatures appropriate to the class of chimney service.The specific reason why chimney liners crack is documented by many white papers. Basically, the chimney fire causes a quick increase in flue gas temperature. The interior of the chimney liner quickly thermally expands, and the exterior portion of the chimney liner is at a lower temperature. This causes the liner to experience a thermal shock, where the exterior is in extreme tension, and the interior of the liner is in extreme compression. Vitrified clay flue tiles are very weak in tension, and this causes thermal cracks. These thermal cracks open during hot flue gases and return to a nearly hairline crack when the liner cools. This crack opening results in the loss of the liner's continued ability to contain the products of combustion.A Step in Time recommends replacing the chimney liner with a UL listed stainless steel liner."
  },
  {
    id: '11',
    srNo: 11,
    description: 'Cracked Crown Pmp',
    unit: 1,
    price: 790,
    recommendation: "CHIMNEY CROWN IS CRACKED AND LEAKINGVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage."
  },
  {
    id: '12',
    srNo: 12,
    description: 'CrownNew Rebuild',
    unit: 1,
    price: 790,
    recommendation: "CHIMNEY CROWN IS CRACKED AND NO DRIP EDGEVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage"
  },
  {
    id: '13',
    srNo: 13,
    description: 'Crown Cut Seperation',
    unit: 1,
    price: 2100,
    recommendation: "CHIMNEY CROWN IS BONDED TO FLUE TILEVirginia Building Code R1003.9.1 requires chimney crowns to be built according to ASTM C1283. This type of construction specifically requires drip edges, thermal expansion joints, and the crown being thick enough to prevent water leakage into the chase. Many crowns have been improperly constructed, and thus, A Step in Time recommends the following: If the crown has a drip edge and is cracked, which now allows thermal expansion, then we recommend sealing the crown with PMP crown repair material to prevent leakage. If the crown does not have a drip edge, then we recommend replacement with an ASTM C1283 crown. If the crown is bonded and not cracked, then we recommend masonry cut separation between the crown and flue tile to allow for thermal expansion and seal with PMP to prevent leakage."
  },
  {
    id: '14',
    srNo: 14,
    description: 'Seal Drip Edge',
    unit: 1,
        price: 1100,
    recommendation: "DRIP EDGE IS LEAKINGVirginia Building code R1003.9.1 requires masonry chimneys to have a drip edge. The drip edge is designed to have water that flows off the top of the chimney to drip off the chimney instead of cascading. Water that saturates the exterior of the chimney will damage mortar joints and lead to leaks.A Step in Time recommends sealing drip edges with elastomeric sealant to prevent water from entering the horizontal mortar joint above the drip edge. This helps prevent water from damaging underlying mortar joints below the drip edge."
  },
  {
    id: '15',
    srNo: 15,
    description: 'Flex Shot Brick Joints',
    unit: 1,
    price: 390,
    recommendation: "BRICK JOINTS GAPPED, VOIDED AND LEAKINGTight well tooled brick joints prevent leaks in brick joints. When water enters gapped brick joints, the water can freeze and thaw and make the voids worse. The expansion of the ice will deteriorate mortar joints. When brick joints develop these voids, the solution is to try to keep it from getting worse. The best ways to keep water from entering these voids is to inject clear rubber material and coat the masonry brick with industrial strength \"breathable\" masonry water repellant. This helps to prevent water from entering that masonry."
  },
  {
    id: '16',
    srNo: 16,
    description: 'Rust Inhibit Flashing',
    unit: 1,
    price: 690,
    recommendation: "CHIMNEY FLASHING IS RUSTEDVirginia Building Code R507.2.4 requires that \"flashing shall be corrosion-resistant.\"The flashing that has been installed is rusted and will soon leak.A Step in Time recommends to either rust inhibit the existing flashing or replace it with new flashing. Rust inhibiting the flashing will simply add life but cannot change the underlying material composition."
  },
  {
    id: '17',
    srNo: 17,
    description: 'Replace Chimney Flashing',
    unit: 1,
    price: 290,
    recommendation: "CHIMNEY FLASHING HAS BEEN IMPROPERLY INSTALLEDVirginia Building Code R905.2.8.4 Other Flashing: chimney flashing shall be applied in accordance with the asphalt manufacture's printed instructions.GAF requires counterflashing to extend over the base step flashing and to be completely sealed with elastomeric polyurethane sealant.A Step in Time recommends replacing the chimney flashing."
  },
  {
    id: '18',
    srNo: 18,
    description: 'Reseal Flashing',
    unit: 1,
    price: 1500,
    recommendation: "CHIMNEY FLASHING REQUIRES RESEALINGVirginia Building Code R905.2.8.4 Other Flashing: chimney flashing shall be applied in accordance with the asphalt manufacture's printed instructions.GAF requires counterflashing to extend over the base step flashing and to be completely sealed with elastomeric polyurethane sealant."
  },
  {
    id: '19',
    srNo: 19,
    description: 'Install Cricket',
    unit: 1,
    price: 290,
    recommendation: "CHIMNEY REQUIRES A CRICKETVirginia Building code R1003.20 Chimney Crickets. Chimneys shall be provided with crickets where the dimensions parallel to the ridgeline are greater than 30 inches.Chimney crickets are designed to divert water around the chimney and can prevent leaks around the chimney. The installation of chimney crickets requires complete removal of chimney flashing, removal of shingles and underlayment, rebuilding the roof,  reinstallation of underlayment and chimney flashing, and the installation of a code compliant chimney cricket."
  },
  {
    id: '20',
          srNo: 20,
    description: 'Profile Seams Exterior Caulking',
    unit: 1,
    price: 2100,
    recommendation: "SEAL CHIMNEY TO SIDING LIFETIME CAULK Virginia Maintenance code requires sealing all exposed opening that can be exposed to weather. The joint between the chimney and the residence requires sealing to prevent sideways rain from entering between the chimney and the residence./ A Step in Time recommends sealing from ground to roofline with lifetime caulk."
  },
  {
    id: '21',
    srNo: 21,
    description: 'Repair Shoulders',
    unit: 1,
    price: 590,
    recommendation: "CHIMNEY SHOULDERS REQUIRE REPAIRVirginia Building code R1003.5 Corbeling: The projection of a single course shall not exceed half the unit height or one third the unit bed depth, whichever is less.Many times, shoulders are not properly corbeled, and brick holes are exposed, or the chimney shoulders can leak into the smoke chamber. Rebuilding an improperly built chimney is not practical, but parging or repairing exposed chimney shoulders can help prevent water leakage into the chimney."
  },
  {
    id: '22',
    srNo: 22,
    description: 'Cut And Reinstall Thermal Damaged Bricks Behind Smoke Chamber',
    unit: 1,
    price: 890,
    recommendation: "THERMAL CRACKS ARE LOCATED BEHIND THE SMOKE CHAMBERVirginia Building Code R1001.8 requires the smoke chamber wall to be a minimum of 8 inches thick and parged with refractory mortar. The exposed side of the smoke chamber will crack if the wall is too thin and not properly parged with refractory mortar. The exact reason is that the inner smoke chamber is heated during use, and the opposite side of the exposed wall is cool from the outside air. This change in temperature of the brick will cause the brick to expand on the heated inner surface and contract on cooler outer surface. This thermal expansion difference causes stresses in the brick, which causes vertical cracks. Coating the inner smoke chamber with thick refractory mortar helps prevent this noticeable change in temperatures problems."
  },
  {
    id: '23',
    srNo: 23,
    description: 'Install Stainless Steel Chimney Liner To Replace Unsupported Liner',
    unit: 1,
    price: 1800,
    recommendation: "BOTTOM FLUE TILE IS NOT PROPERLY SUPPORTEDVirginia Building code R1003.12 states: \"Flue liners shall be supported on all sides.\"If the flue liner is not supported by all sides,  when the inner portion of the liners heat, the liner can extend into the smoke chamber, and ultimately may collapse into the smoke chamber.A Step in Time recommends removal of all the vitrified clay flue tiles and installation of a stainless steel chimney liner."
  },
  {
    id: '24',
    srNo: 24,
    description: 'Parge Lower Flue Tile Gape With Refractory Mortar',
    unit: 1,
    price: 4900,
    recommendation: "BOTTOM FLUE TILE IS NOT PROPERLY SUPPORTEDVirginia Building code R1003.12 states: \"Flue liners shall be supported on all sides.\"If the flue liner is not supported by all sides, then gas and creosote can migrate between the flue liner and the enclosed chimney. This can cause a fire hazard and can also allow CO to escape through the chimney and into the residence.A Step in Time recommend sealing the voids where the liner is not supported with high temperature refractory mortar."
  },
  {
    id: '25',
    srNo: 25,
    description: 'Parge Smoke Chamber With Chambertech 2000',
    unit: 1,
    price: 690,
    recommendation: "SMOKE CHAMBER REQUIRES PARGINGVirginia Building Code R1001.8.1 Smoke Chamber: requires \"The inside surface shall be parged smooth with refractory mortar.\" Smoke chambers are required to be parged smooth with refractory mortar to provide a smooth draft through the smoke chambers and prevent creosote and heat from transferring through the corbeled brick, which can lead to heating of surrounding timber structural members.A Step in Time recommends parging the smoke chamber with refractory mortar conforming with ASTM C199."
  },
  {
    id: '26',
    srNo: 26,
    description: 'Fill Voided Smoke Shelf With Fireclay Mortar',
    unit: 1,
    price: 1500,
    recommendation: "SMOKE SHELF IS MISSING AND REQUIRES INSTALLATIONVirginia Building Code Figure R1001.1 (Fireplace and Chimney Details) shows the curved smoke shelf next to detail H - vertical reinforcement. The upward smooth curve of the smoke shelf is designed to provide a circular airflow where air travels downward along the rear smoke shelf and reverses direction along the curved smoke shelf to direct upward airflow past the damper, which increases draft. Filled smoke shelves also reinforce the structural integrity of the rear firebox wall.A Step in Time recommends filling the smoke shelf area with refractory mortar as per Virginia Building codes."
  },
  {
    id: '27',
    srNo: 27,
    description: 'Install Stainless Steel Cap Damper In Place Of Rotary Damper',
    unit: 1,
    price: 1500,
    recommendation: "RECOMMEND CAP DAMPERVirginia Building Code R1001.7.1 Damper - Masonry fireplaces shall be equipped with a ferrous metal damper. R1003.17 Masonry chimney cleanout openings shall be provided. Exception: Chimney flues servicing masonry fireplaces where cleaning is possible through the fireplace opening.A Step in Time recommends replacing all rotary dampers with cap dampers because the rotary damper mechanism prevents proper cleaning through the fireplace opening."
  },
  {
    id: '28',
    srNo: 28,
    description: 'Install Stainless Steel Cap Damper To Improve Draft',
    unit: 1,
    price: 1090,
    recommendation: "RECOMMEND CAP DAMPERVirginia Building Code R1001.7.1 Damper - Masonry fireplaces shall be equipped with a ferrous metal damper. R1003.17 Masonry chimney cleanout opening shall be provided. Exception: Chimney flues servicing masonry fireplaces where cleaning is possible through the fireplace opening.A Step in Time recommends installing an energy efficient cap damper, which improves draft and allows for easier cleaning through the fireplace opening."
  },
  {
    id: '29',
    srNo: 29,
    description: 'Liner To Wood Stove',
    unit: 1,
    price: 890,
    recommendation: "WOOD STOVE REQUIRES DIRECT CONNECT LINERVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 13.4.5.1 \"A natural draft solid fuel burning appliance such as a wood stove or insert shall be permitted to be used in a masonry fireplace flue, where the following conditions are met: 1) There is a connector between the appliance to the flue liner.In the 1970's and 1980's many homes had wood stove inserts installed, and insurance companies found that the decreased opening of the wood stove drafted the appliance extremely slowly, which produced large amounts of creosote. This dangerous situation caused many chimney fires, and the building code officials solved this problem by requiring smaller direct connect liners installed from the appliance up the chimney liner."
  },
  {
    id: '30',
        srNo: 30,
    description: 'Parge Lintel Joint With Refractory Mortar',
    unit: 1,
    price: 2900,
    recommendation: "LINTEL JOINT REQUIRES PARGINGVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high-temperature insulating mortar."
  },
  {
    id: '31',
    srNo: 31,
    description: 'Repair Cracked Profile Seams With Refractory Mortar',
    unit: 1,
    price: 390,
    recommendation: "FIREBOX PROFILE SEAMS REQUIRES PARGINGVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    id: '32',
    srNo: 32,
    description: 'Repair Inner/Outer Profile Seam With Refractory Mortar',
    unit: 1,
    price: 290,
    recommendation: "JOINT BETWEEN INNER & OUTER HEARTH REQUIRES PARGINGVirginia Building Code G2427.5.2 requires masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    id: '33',
    srNo: 33,
    description: 'Repoint Firebox Joints With Refractory Mortar',
    unit: 1,
    price: 190,
    recommendation: "FIREBOX MORTAR JOINTS REQUIRE REPOINTINGVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 11.2.1.5 All joints and intersections between the hearth extension/ fireplace facing and the fire chamber (firebox) shall be fully sealed with medium-duty refractory mortar (ASTM C199, Standard Test Method for Pier Test for Refractory Mortars). Gaps or voids at supporting lintels and joints between steel fireplace units and the fireplace face or between the frames of dampers and the fireplace face shall be sealed with the same material or with a high temperature insulating mortar."
  },
  {
    id: '34',
    srNo: 34,
    description: 'Replace Ash Dump Door',
    unit: 1,
    price: 990,
    recommendation: "REPLACE ASH DUMP DOORVirginia Building Code R1001.2.1 Ash Dump Cleanout is required \"to remain tightly closed except when in use.\"Many times, ash dump doors will warp, rust, or become inoperable after repeated use.A Step in Time recommends replacement of the ash dump door."
  },
  {
    id: '35',
    srNo: 35,
    description: 'Replace Clean Out Door',
    unit: 1,
    price: 90,
    recommendation: "REPLACE CLEAN-OUT DOORVirginia Building Code R1001.2.1 Clean outs shall be located to allow access so that ash removal will not create a hazard to combustible materials. Additional clean-out doors are required to remain tightly closed.Many times, clean-out doors will warp, rust, or become inoperable after repeated use.A Step in Time recommends replacement of the clean-out door."
  },
  {
    id: '36',
    srNo: 36,
    description: 'Remove Timber Formwork',
    unit: 1,
    price: 490,
    recommendation: "REMOVE COMBUSTIBLE MATERIAL UNDER HEARTHVirginia Building Code R1001.9 requires: \"Combustible material shall not remain against the underside of hearths and hearth extensions after construction.\"The heat from the firebox can heat the combustible material under the hearth. This combustible material should be removed, and the outer heart may require support using foundation and pier supports."
  },
  {
    id: '37',
    srNo: 37,
    description: 'Remove Wood Stove',
    unit: 1,
    price: 2100,
    recommendation: "WOOD STOVE INSERT SHOULD BE REMOVEDVirginia Building Code G2427.5.2 require masonry chimneys to be installed in accordance with NFPA 211. 13.4.5.1 \"A natural draft solid fuel burning appliance such as a wood stove or insert shall be permitted to be used in a masonry fireplace flue, where the following conditions are met: 1) There is a connector between the appliance to the flue liner.In the 1970's and 1980's many homes had wood stove inserts installed, and insurance companies found that the decreased opening of the wood stove drafted the appliance extremely slowly, which produced large amounts of creosote. This dangerous situation caused many chimney fires, and the building code officials solved this problem by requiring smaller direct connect liners installed from the appliance up the chimney liner."
  },
  {
    id: '38',
    srNo: 38,
    description: 'Level 2 Chimney Inspection Is Required',
    unit: 1,
    price: 450,
    recommendation: "Virginia Chimneys, Fireplaces, Vents and Solid Fuel-Burning Appliance Code 15.4 states: A Level II inspection is indicated when verification of the suitability of the chimney for new or changed conditions of service is needed or when a Level I inspection is not sufficient to determine the serviceability of the chimney. 15.4.1: Circumstances: After a building or chimney fire, weather or seismic event, or other incident likely to have caused damage to the chimney."
  },
  {
    id: '39',
    srNo: 39,
    description: 'Level 2 Chimney Inspection Is Required',
    unit: 1,
    price: 100,
    recommendation: "Virginia Chimneys, Fireplaces, Vents and Solid Fuel-Burning Appliance Code 15.4 states: A Level II inspection is indicated when verification of the suitability of the chimney for new or changed conditions of service is needed or when a Level I inspection is not sufficient to determine the serviceability of the chimney. 15.4.1: Circumstances: After a building or chimney fire, weather or seismic event, or other incident likely to have caused damage to the chimney."
  }
];

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'scrape' | 'form'>('scrape');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentRecommendationPageIndex, setCurrentRecommendationPageIndex] = useState<number>(0);
  const [formData, setFormData] = useState<FormData>({
    clientName: '',
    clientAddress: '',
    chimneyType: '',
    reportDate: new Date().toISOString().split('T')[0],
    timelineCoverImage: '',
    scrapedImages: [],
    selectedImages: [],
    invoiceData: {
      invoiceNumber: '',
      paymentMethod: '',
      paymentNumber: '',
      rows: []
    },
    repairEstimatePages: [],
    usedReviewImages: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [preferGoogleDocs, setPreferGoogleDocs] = useState(true); // User preference for PDF viewing
  const [includeRepairEstimate, setIncludeRepairEstimate] = useState(true); // Page 7 is always included
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [showReviewImageSelector, setShowReviewImageSelector] = useState(false);
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [showPredefinedModal, setShowPredefinedModal] = useState(false);
  const [showChangeImageModal, setShowChangeImageModal] = useState(false);

  // Block mobile devices until they switch to desktop view
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
      
      if (isMobileDevice) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Helper functions for managing recommendation pages
  const getCurrentRecommendationPage = () => {
    const pages = formData.repairEstimatePages || [];
    // Always use currentRecommendationPageIndex for consistency
    return pages[currentRecommendationPageIndex];
  };

  const addNewRecommendationPage = (reviewImage: string) => {
    const newPage = {
      id: Date.now().toString(),
      reviewImage,
      customRecommendation: '',
      repairEstimateData: {
        manualEntry: false,
        rows: []
      }
    };

    const updatedPages = [...(formData.repairEstimatePages || []), newPage];
    const usedImages = [...(formData.usedReviewImages || []), reviewImage];

    updateFormData({
      repairEstimatePages: updatedPages,
      usedReviewImages: usedImages
    });

    setCurrentRecommendationPageIndex(updatedPages.length - 1);
  };

  const updateCurrentRecommendationPage = (updates: any) => {
    const pages = [...(formData.repairEstimatePages || [])];
    if (pages[currentRecommendationPageIndex]) {
      pages[currentRecommendationPageIndex] = {
        ...pages[currentRecommendationPageIndex],
        ...updates
      };
      updateFormData({ repairEstimatePages: pages });
    }
  };

  const getAvailableImages = () => {
    const usedImages = formData.usedReviewImages || [];
    return (formData.scrapedImages || []).filter((img: any) => !usedImages.includes(img.url));
  };

  const deleteRecommendationPage = (pageIndex: number) => {
    const pages = formData.repairEstimatePages || [];
    const pageToDelete = pages[pageIndex];
    
    if (pageToDelete) {
      // Remove the page
      const updatedPages = pages.filter((_, index) => index !== pageIndex);
      
      // Remove the image from used images
      const updatedUsedImages = (formData.usedReviewImages || []).filter(
        img => img !== pageToDelete.reviewImage
      );
      
      updateFormData({
        repairEstimatePages: updatedPages,
        usedReviewImages: updatedUsedImages
      });
      
      // Adjust current page index if needed
      let newIndex = currentRecommendationPageIndex;
      if (updatedPages.length === 0) {
        newIndex = 0;
      } else if (currentRecommendationPageIndex >= updatedPages.length) {
        newIndex = updatedPages.length - 1;
      } else if (currentRecommendationPageIndex > pageIndex) {
        // If we deleted a page before the current one, adjust the index
        newIndex = currentRecommendationPageIndex - 1;
      }
      // If we deleted a page after the current one, no adjustment needed
      
      setCurrentRecommendationPageIndex(newIndex);
    }
  };

  const changePageImage = (pageIndex: number, newImageUrl: string) => {
    const pages = [...(formData.repairEstimatePages || [])];
    const oldImageUrl = pages[pageIndex]?.reviewImage;
    
    if (pages[pageIndex]) {
      // Update the page image
      pages[pageIndex].reviewImage = newImageUrl;
      
      // Update used images list
      let updatedUsedImages = [...(formData.usedReviewImages || [])];
      
      // Remove old image from used list
      if (oldImageUrl) {
        updatedUsedImages = updatedUsedImages.filter(img => img !== oldImageUrl);
      }
      
      // Add new image to used list
      if (!updatedUsedImages.includes(newImageUrl)) {
        updatedUsedImages.push(newImageUrl);
      }
      
      updateFormData({
        repairEstimatePages: pages,
        usedReviewImages: updatedUsedImages
      });
    }
  };

  const handleImageSelection = (selectedImages: ImageItem[]) => {
    setFormData(prev => ({ ...prev, selectedImages }));
  };

  const handleCustomRecommendationChange = (customRecommendation: string) => {
    const pages = [...(formData.repairEstimatePages || [])];
    if (pages[currentRecommendationPageIndex]) {
      pages[currentRecommendationPageIndex].customRecommendation = customRecommendation;
      updateFormData({ repairEstimatePages: pages });
    }
  };

  const handleDataExtracted = (data: {
    clientName: string;
    clientAddress: string;
    chimneyType: string;
    reportDate: string;
    timelineCoverImage: string;
    scrapedImages: ImageItem[];
  }) => {
    setFormData({
      ...formData,
      clientName: data.clientName,
      clientAddress: data.clientAddress,
      chimneyType: data.chimneyType,
      reportDate: data.reportDate,
      timelineCoverImage: data.timelineCoverImage,
      scrapedImages: data.scrapedImages,
      selectedImages: [] // Initialize empty selection
    });
    setCurrentStep('form');
  };

  const handleManualEntry = () => {
    setFormData({
      clientName: '',
      clientAddress: '',
      chimneyType: '',
      reportDate: new Date().toISOString().split('T')[0],
      timelineCoverImage: '',
      scrapedImages: [],
      selectedImages: [],
      invoiceData: {
        invoiceNumber: '',
        paymentMethod: '',
        paymentNumber: '',
        rows: []
      },
      repairEstimatePages: [],
      usedReviewImages: []
    });
    setCurrentStep('form');
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      // Find the existing preview div that contains the Page components
      const previewDiv = document.querySelector('[data-preview="true"]');
      if (!previewDiv) {
        throw new Error('Preview div not found. Please ensure you are on the form step.');
      }

      // Use state-based mobile detection
      const isMobileDevice = isMobile;
      
      // Create a temporary clone for PDF generation with adjusted positioning
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '595px';
      tempContainer.style.height = '842px';
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.overflow = 'hidden';
      tempContainer.style.margin = '0';
      tempContainer.style.padding = '0';
      tempContainer.style.border = 'none';
      tempContainer.style.outline = 'none';
      
      // Clone the preview content
      const clonedContent = previewDiv.cloneNode(true) as HTMLElement;
      
      // Adjust the text position for PDF generation (move up by 5px)
      const titleText = clonedContent.querySelector('.absolute.w-\\[402px\\]');
      if (titleText) {
        (titleText as HTMLElement).style.top = '-5px'; // Override the top-1.5 class, move up by 5px
      }
      
      // Mobile-specific adjustments for PDF generation
      if (isMobileDevice) {
        // Force desktop-like scaling and positioning for mobile PDF generation
        const page1Element = clonedContent.querySelector('[data-preview="true"] > div') as HTMLElement;
        if (page1Element) {
          // Reset any mobile-specific transforms
          page1Element.style.transform = 'none';
          page1Element.style.scale = '1';
          page1Element.style.width = '595px';
          page1Element.style.height = '842px';
          page1Element.style.maxWidth = '595px';
          page1Element.style.maxHeight = '842px';
          
          // Ensure proper positioning
          page1Element.style.position = 'relative';
          page1Element.style.left = '0';
          page1Element.style.top = '0';
          
          // Remove any margins that might cause extra spacing
          page1Element.style.margin = '0';
          page1Element.style.padding = '0';
        }
        
        // Reset any mobile-specific styles on child elements
        const allElements = clonedContent.querySelectorAll('*');
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          // Remove mobile-specific transforms and positioning
          if (element.style.transform && element.style.transform.includes('scale')) {
            element.style.transform = 'none';
          }
          if (element.style.scale) {
            element.style.scale = '1';
          }
          
          // Remove any margins and padding that could cause extra spacing
          element.style.margin = '0';
          element.style.padding = '0';
          
          // Ensure no border spacing
          if (element.tagName === 'TABLE') {
            element.style.borderCollapse = 'collapse';
            element.style.borderSpacing = '0';
          }
        });
      }
      
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);
      
      // Wait a moment for rendering
      await new Promise(resolve => setTimeout(resolve, 100));
      

      
      // Convert to PDF using jsPDF
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
      
      // Generate PDF with both pages
      await generateMultiPagePDF(pdf, isMobileDevice);
      
      // Save PDF directly (no Google Docs viewer)
        const fileName = `chimney_report_${formData.clientName || 'client'}_${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again. Make sure all components are visible in the preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    
    // Check if required fields are filled
    if (!formData.clientName || !formData.clientAddress || !formData.chimneyType) {
      alert('Please fill in all required fields before generating the report.');
      return;
    }
    
    // Generate PDF
    await generatePDF();
  };

  const handleBackToScrape = () => {
    setCurrentStep('scrape');
  };

  const handleCropImage = () => {
    setIsCropping(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    updateFormData({ timelineCoverImage: croppedImageUrl });
    setIsCropping(false);
    setCropData(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setCropData(null);
  };

  // Calculate total pages including invoice pages
  const MAX_TABLE_HEIGHT = 400; // Max height for table container
  const ROW_HEIGHT = 50; // Estimated row height
  
  const maxRowsPerPage = Math.floor(MAX_TABLE_HEIGHT / ROW_HEIGHT);
  const ITEMS_PER_PAGE = Math.max(1, maxRowsPerPage); // At least 1 row per page
  
  // Smart pagination: ensure no row is cut off
  const calculateSmartInvoicePages = () => {
    const totalRows = formData.invoiceData?.rows?.length || 0;
    if (totalRows === 0) return 1;
    
    // Use 5 rows per page to ensure no cut-offs
    const ROWS_PER_PAGE = 5;
    return Math.ceil(totalRows / ROWS_PER_PAGE);
  };
  
  const totalInvoicePages = calculateSmartInvoicePages();
    const totalRecommendationPages = formData.repairEstimatePages?.length || 0;
    
    // Get unused images for Page8
    const getUnusedImages = () => {
      const allImages = formData.scrapedImages || [];
      const usedImages = new Set<string>();
      
      // Collect all images used in recommendation pages
      formData.repairEstimatePages?.forEach(page => {
        if (page.reviewImage) {
          usedImages.add(page.reviewImage);
        }
      });
      
      // Return images that are not used
      return allImages.filter(img => !usedImages.has(img.url));
    };

    // Calculate total image pages needed (9 images per page)
    const getTotalImagePages = () => {
      const unusedImages = getUnusedImages();
      return Math.max(1, Math.ceil(unusedImages.length / 9));
    };
    
    // Always include at least one page for step 7 (recommendation setup), plus any additional recommendation pages
    const totalImagePages = getTotalImagePages();
    const totalPages = 4 + totalInvoicePages + 1 + Math.max(1, totalRecommendationPages) + totalImagePages + (formData.chimneyType === 'prefabricated' ? 4 : 3) + 2; // Pages 1-4 + invoice pages + Page 6 (images) + recommendation pages (min 1) + image pages + Page9 parts (3 for masonry, 4 for prefabricated) + Step10 parts (2 for both types)
  
  // Helper function to determine the logical step (1-10) based on current page
  const getLogicalStep = (pageNum: number): number => {
    if (pageNum <= 4) return pageNum; // Pages 1-4 are steps 1-4
    if (pageNum <= 4 + totalInvoicePages) return 5; // All invoice pages are step 5
    if (pageNum === 4 + totalInvoicePages + 1) return 6; // Image page is step 6
    if (isRecommendationPage(pageNum)) return 7; // Recommendation pages are step 7
    if (isImagePage(pageNum)) return 8; // Image pages are step 8
    if (pageNum >= totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4) && pageNum < totalPages - 1) return 9; // Page9 parts are step 9 (3 parts for masonry, 4 parts for prefabricated)
    if (pageNum >= totalPages - 1) return 10; // Step10 parts are step 10 (2 parts for both types)
    return 7; // Default to recommendation pages
  };
  
  // Helper function to check if we're on an invoice page
  const isInvoicePage = (pageNum: number): boolean => {
    return pageNum >= 5 && pageNum <= 4 + totalInvoicePages;
  };
  
  // Helper function to check if we're on the image page (Page 6)
  const isImagePage6 = (pageNum: number): boolean => {
    return pageNum === 4 + totalInvoicePages + 1;
  };
  
  // Helper function to check if we're on a recommendation page
  const isRecommendationPage = (pageNum: number): boolean => {
    const imagePageNum = 4 + totalInvoicePages + 1;
    const recommendationPageStart = imagePageNum + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    return pageNum >= recommendationPageStart && pageNum < imagePageStart;
  };
  
  // Helper function to get recommendation page index
  const getRecommendationPageIndex = (pageNum: number): number => {
    const imagePageNum = 4 + totalInvoicePages + 1;
    const index = pageNum - imagePageNum - 1; // Zero-based index
    return Math.max(0, index); // Ensure non-negative
  };
  
  // Helper function to check if we're on the first recommendation page (setup page)
  const isRecommendationSetupPage = (pageNum: number): boolean => {
    const imagePageNum = 4 + totalInvoicePages + 1;
    return pageNum === imagePageNum + 1 && totalRecommendationPages === 0; // First page after images, no pages created
  };

  // Helper function to check if we're on an image page (step 8)
  const isImagePage = (pageNum: number): boolean => {
    const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    const imagePageEnd = totalPages - (formData.chimneyType === 'prefabricated' ? 6 : 5); // Exclude Page9 parts (last 3 pages for masonry, last 4 pages for prefabricated) + Step10 parts (2 pages)
    return pageNum >= imagePageStart && pageNum <= imagePageEnd;
  };

  // Helper function to get image page index
  const getImagePageIndex = (pageNum: number): number => {
    const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    return pageNum - imagePageStart;
  };
  
  const currentLogicalStep = getLogicalStep(currentPage);

  // Debug helper to understand page structure
  const debugPageStructure = () => {
    console.log('=== PAGE STRUCTURE DEBUG ===');
    console.log('totalInvoicePages:', totalInvoicePages);
    console.log('totalRecommendationPages:', totalRecommendationPages);
    console.log('totalImagePages:', getTotalImagePages());
    console.log('totalPages:', totalPages);
    console.log('currentPage:', currentPage);
    console.log('currentLogicalStep:', currentLogicalStep);
    
    const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    const lastImagePage = totalPages - (formData.chimneyType === 'prefabricated' ? 6 : 5);
    
    console.log('Pages 1-4: Client Info, Company Info, Service Report, Chimney Type');
    console.log(`Pages 5-${4 + totalInvoicePages}: Invoice pages`);
    console.log(`Page ${4 + totalInvoicePages + 1}: Image selection`);
    console.log(`Pages ${recommendationPageStart}-${imagePageStart - 1}: Recommendation pages`);
    console.log(`Pages ${imagePageStart}-${lastImagePage}: Image pages`);
    console.log(`Page ${totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4)}: Page9-part1`);
    console.log(`Page ${totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3)}: Page9-part2`);
    console.log(`Page ${totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2)}: Page9-part3`);
    if (formData.chimneyType === 'prefabricated') {
      console.log(`Page ${totalPages - 2}: Page9-part4`);
    }
    console.log(`Page ${totalPages - 1}: Step10-part1`);
    console.log(`Page ${totalPages}: Step10-part2`);
    console.log('isImagePage(currentPage):', isImagePage(currentPage));
    console.log('Step 10 Debug - currentPage:', currentPage, 'totalPages:', totalPages);
    console.log('Step 10 Debug - getLogicalStep(currentPage):', getLogicalStep(currentPage));
    console.log('Step 10 Debug - pageNum >= totalPages - 1:', currentPage >= totalPages - 1);
    console.log('================================');
  };

  // Function to navigate to a specific step
  const navigateToStep = (targetStep: number) => {
    if (targetStep < 1 || targetStep > 10) return;
    
    // Special handling for step 9 - go to Page9-part1
    if (targetStep === 9) {
      setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4));
      return;
    }
    
    // Special handling for step 10 - go to Step10-part1
    if (targetStep === 10) {
      setCurrentPage(totalPages - 1);
      return;
    }
    
    // Find the first page that corresponds to the target step
    for (let page = 1; page <= totalPages; page++) {
      if (getLogicalStep(page) === targetStep) {
        setCurrentPage(page);
        break;
      }
    }
  };

  const handleNextPage = () => {
    // Debug page structure when navigating
    if (currentLogicalStep >= 7) {
      debugPageStructure();
    }
    
    if (currentLogicalStep === 7) {
      // If we're on recommendation pages, navigate through recommendation pages
      if (currentRecommendationPageIndex < (formData.repairEstimatePages?.length || 0) - 1) {
        // Move to next recommendation page
        setCurrentRecommendationPageIndex(currentRecommendationPageIndex + 1);
      } else {
        // If we're on the last recommendation page, go to first image page
        const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
        const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
        setCurrentPage(imagePageStart);
        setCurrentRecommendationPageIndex(0); // Reset for future use
      }
    } else if (isImagePage(currentPage)) {
      // If we're on image pages, navigate through image pages
      const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
      const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
      const lastImagePage = totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3); // Last image page before Page9
      
      if (currentPage < lastImagePage) {
        setCurrentPage(currentPage + 1);
      } else {
        // If we're on the last image page, go to Page9-part1
        setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4));
      }
    } else if (currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4)) {
      // If we're on Page9-part1, go to Page9-part2
      setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3));
    } else if (currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3)) {
      // If we're on Page9-part2, go to Page9-part3
      setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2));
    } else if (formData.chimneyType === 'prefabricated' && currentPage === totalPages - 3) {
      // If we're on Page9-part3 and it's prefabricated, go to Page9-part4
      setCurrentPage(totalPages - 2);
    } else if (currentPage === totalPages - 2) {
      // If we're on Page9-part4 (prefabricated) or Page9-part3 (masonry), go to Step10-part1
      setCurrentPage(totalPages - 1);
    } else if (currentPage === totalPages - 1) {
      // If we're on Step10-part1, go to Step10-part2
      setCurrentPage(totalPages);
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (isImagePage(currentPage)) {
      // If we're on image pages, navigate through image pages
      const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
      const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
      const currentImagePageIndex = getImagePageIndex(currentPage);
      
      if (currentImagePageIndex > 0) {
        // Move to previous image page
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the first image page, go to last recommendation page
        setCurrentPage(imagePageStart - 1);
        setCurrentRecommendationPageIndex((formData.repairEstimatePages?.length || 0) - 1);
      }
    } else if (currentLogicalStep === 7) {
      // If we're on recommendation pages, navigate through recommendation pages
      if (currentRecommendationPageIndex > 0) {
        // Move to previous recommendation page
        setCurrentRecommendationPageIndex(currentRecommendationPageIndex - 1);
      } else {
        // If we're on the first recommendation page, go to image page
        const imagePageNum = 4 + totalInvoicePages + 1;
        setCurrentPage(imagePageNum);
        setCurrentRecommendationPageIndex(0);
      }
    } else if (currentPage === totalPages) {
      // If we're on Step10-part2, go to Step10-part1
      setCurrentPage(totalPages - 1);
    } else if (currentPage === totalPages - 1) {
      // If we're on Step10-part1, go to Page9-part4 (prefabricated) or Page9-part3 (masonry)
      setCurrentPage(totalPages - 2);
    } else if (formData.chimneyType === 'prefabricated' && currentPage === totalPages - 2) {
      // If we're on Page9-part4 and it's prefabricated, go to Page9-part3
      setCurrentPage(totalPages - 3);
    } else if (currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2)) {
      // If we're on Page9-part3, go to Page9-part2
      setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3));
    } else if (currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3)) {
      // If we're on Page9-part2, go to Page9-part1
      setCurrentPage(totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4));
    } else if (currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4)) {
      // If we're on Page9-part1, go to last image page
      const recommendationPageStart = 4 + totalInvoicePages + 1 + 1;
      const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
      const lastImagePage = totalPages - (formData.chimneyType === 'prefabricated' ? 6 : 5); // Last image page before Page9
      setCurrentPage(lastImagePage);
    } else if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to compress images before PDF generation
  const compressImage = async (canvas: HTMLCanvasElement, format: 'JPEG' | 'PNG', quality: number): Promise<string> => {
    return new Promise((resolve) => {
      if (format === 'JPEG') {
        // Compress to JPEG with specified quality
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      } else {
        // PNG compression (PNG is already compressed, but we can optimize)
        const compressedDataUrl = canvas.toDataURL('image/png');
        resolve(compressedDataUrl);
      }
    });
  };

  // Function to create optimized canvas for better compression
  const createOptimizedCanvas = (originalCanvas: HTMLCanvasElement, targetWidth: number, targetHeight: number): HTMLCanvasElement => {
    const optimizedCanvas = document.createElement('canvas');
    const ctx = optimizedCanvas.getContext('2d');
    
    if (ctx) {
      optimizedCanvas.width = targetWidth;
      optimizedCanvas.height = targetHeight;
      
      // Use high-quality image smoothing for better results
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Draw the original canvas onto the optimized one
      ctx.drawImage(originalCanvas, 0, 0, targetWidth, targetHeight);
    }
    
    return optimizedCanvas;
  };

  // Function to generate multi-page PDF
  const generateMultiPagePDF = async (pdf: any, isMobileDevice: boolean) => {
    const imgWidth = 210; // A4 width in mm
    const imgHeight = 297; // A4 height in mm (full page)
    
    console.log('PDF Generation - Total Pages:', totalPages);
    console.log('PDF Generation - Invoice Data Rows:', formData.invoiceData?.rows?.length || 0);
    
    // Generate all pages dynamically
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      console.log('Generating PDF Page:', pageNum);
      const pageCanvas = await generatePageCanvas(pageNum);
      const optimizedCanvas = createOptimizedCanvas(pageCanvas, 842, 1190);
      
      // Use different compression for page 4 (chimney images)
      const compressionQuality = pageNum === 4 ? 0.9 : 0.78;
      const pageImgData = await compressImage(optimizedCanvas, 'JPEG', compressionQuality);
      
      if (pageNum > 1) {
        pdf.addPage();
      }
      
    if (isMobileDevice) {
        pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, imgHeight, '', 'FAST');
    } else {
        pdf.addImage(pageImgData, 'JPEG', 0, 0, imgWidth, imgHeight);
      }
    }
  };

  // Function to generate canvas for specific page
  const generatePageCanvas = async (pageNumber: number) => {
    // Create temporary container for the specific page
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '595px';
    tempContainer.style.height = '842px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.overflow = 'hidden';
    tempContainer.style.margin = '0';
    tempContainer.style.padding = '0';
    tempContainer.style.border = 'none';
    tempContainer.style.outline = 'none';
    
    // Add PDF-specific classes and attributes
    tempContainer.className = 'pdf-generation';
    tempContainer.setAttribute('data-pdf', 'true');
    
    // Create the page component
    const pageElement = pageNumber === 1 ? 
      React.createElement(Page1, { formData, updateFormData, isPDF: true, timelineCoverImage: formData.timelineCoverImage }) :
      pageNumber === 2 ?
      React.createElement(Page2, { formData, updateFormData, isPDF: true }) :
      pageNumber === 3 ?
      React.createElement(Page3, { formData, updateFormData, isPDF: true }) :
      pageNumber === 4 ?
      React.createElement(Page4, { chimneyType: formData.chimneyType, isPDF: true }) :
      pageNumber >= 5 && pageNumber <= 4 + totalInvoicePages ?
      React.createElement(Page5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: pageNumber - 4 }) :
      pageNumber === 4 + totalInvoicePages + 1 ?
      React.createElement(Page6, { 
        isPDF: true, 
        scrapedImages: formData.scrapedImages || [], 
        selectedImages: formData.selectedImages || [] 
      }) :
      isRecommendationPage(pageNumber) ?
      React.createElement(Page7, { 
        isPDF: true, 
        scrapedImages: formData.scrapedImages || [], 
        selectedImages: formData.selectedImages || [],
        repairEstimateData: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.repairEstimateData || { manualEntry: false, rows: [] },
        reviewImage: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.reviewImage || '',
        customRecommendation: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.customRecommendation || ''
      }) :
      isImagePage(pageNumber) ?
      React.createElement(Page8, { 
        isPDF: true, 
        unusedImages: getUnusedImages(),
        currentPage: getImagePageIndex(pageNumber) + 1,
        totalPages: getTotalImagePages()
      }) :
      pageNumber === totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4) ?
      React.createElement(Page9Part1, { isPDF: true, chimneyType: formData.chimneyType }) :
      pageNumber === totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3) ?
      React.createElement(Page9Part2, { isPDF: true, chimneyType: formData.chimneyType }) :
      pageNumber === totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2) ?
      React.createElement(Page9Part3, { isPDF: true, chimneyType: formData.chimneyType }) :
      formData.chimneyType === 'prefabricated' && pageNumber === totalPages - 2 ?
      React.createElement(Page9Part4, { isPDF: true, chimneyType: formData.chimneyType }) :
      pageNumber === totalPages - 1 ?
      React.createElement(Step10Part1, { isPDF: true, chimneyType: formData.chimneyType }) :
      pageNumber === totalPages ?
      React.createElement(Step10Part2, { isPDF: true, chimneyType: formData.chimneyType }) :
      React.createElement(Page5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: 1 });
    
    // Render the page to the container
    const root = ReactDOM.createRoot(tempContainer);
    root.render(pageElement);
    
    document.body.appendChild(tempContainer);
    
    // Wait for rendering and CSS to be applied
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Debug: Log the positioning of key elements
    if (pageNumber === 3) {
      const overlapElement = tempContainer.querySelector('.overlap') as HTMLElement;
      const titleElement = tempContainer.querySelector('.title') as HTMLElement;
      const clientNameElement = tempContainer.querySelector('.div') as HTMLElement;
      const emailElement = tempContainer.querySelector('.email') as HTMLElement;
      
      console.log('PDF Generation Debug - Page 3:');
      console.log('Overlap position:', overlapElement?.style.left, overlapElement?.style.top);
      console.log('Title position:', titleElement?.style.left, titleElement?.style.top);
      console.log('Client name position:', clientNameElement?.style.left, clientNameElement?.style.top);
      console.log('Email position:', emailElement?.style.left, emailElement?.style.top);
    }
    
    // Use html2canvas to capture the page with optimized settings
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(tempContainer, {
      scale: 1.25, // reduce raster size for file size control
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: 595,
      height: 842,
      scrollX: 0,
      scrollY: 0,
      // Additional compression optimizations
      removeContainer: true,
      foreignObjectRendering: false
    });
    
    // Clean up
    document.body.removeChild(tempContainer);
    
    return canvas;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Mobile Blocking Overlay */}
      {isMobile && (
        <div className="mobile-block-overlay">
          <div className="mobile-block-content">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-[#722420] mb-4">Mobile Device Detected</h2>
            <p className="text-gray-700 mb-6">
              This website requires Desktop View for the best experience. Please switch your browser to Desktop Mode.
            </p>
            
            <div className="bg-red-50 rounded-lg p-4 mb-6 text-left border border-red-200">
              <h3 className="font-semibold text-black mb-2">How to switch to Desktop View:</h3>
              <div className="space-y-2 text-sm text-black">
                <div><strong>Safari:</strong> Tap AA → Request Desktop Website</div>
                <div><strong>Chrome:</strong> Tap ⋮ → Desktop Site</div>
                <div><strong>Firefox:</strong> Tap ⋮ → Desktop Site</div>
                <div><strong>Edge:</strong> Tap ⋯ → Desktop Site</div>
              </div>
            </div>
            
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#722420] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#5a1d1a] transition-colors"
            >
              I've Switched to Desktop View
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              After switching, tap this button to refresh the page
            </p>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="mb-4 sm:mb-8 text-center px-2">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">Chimney Inspection Report Generator</h1>
        <p className="text-sm sm:text-base text-gray-600">
          {currentStep === 'scrape' 
            ? 'Extract data from company sources or manually input client information' 
            : 'Review and finalize inspection report data'
          }
        </p>
      </div>

      {/* Step Indicator - Only show on scrape step */}
      {currentStep === 'scrape' && (
        <div className="mb-4 sm:mb-8 px-2">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center text-[#722420]">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium bg-[#722420] text-white">
                1
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">Data Collection</span>
            </div>
            <div className="hidden sm:block w-16 h-1 bg-gray-200"></div>
            <div className="sm:hidden w-1 h-8 bg-gray-200"></div>
            <div className="flex items-center text-gray-400">
              <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium bg-gray-200 text-gray-600">
                2
              </div>
              <span className="ml-2 text-sm sm:text-base font-medium">Report Generation ({totalPages} Pages)</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {currentStep === 'scrape' ? (
        <div className="card p-4 sm:p-8">
          <DataScraper onDataExtracted={handleDataExtracted} setCurrentStep={setCurrentStep} setFormData={setFormData} />
        </div>
      ) : (
        <>
          {/* Form Step Progress Indicator */}
          <div className="mb-6 px-2">
            {/* First Row - Steps 1-5 */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 1 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(1)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 1 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 1 ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Client Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 2 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(2)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 2 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 2 ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Company Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 3 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(3)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 3 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 3 ? '✓' : '3'}
                </div>
                <span className="ml-2 text-sm font-medium">Service Report</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 4 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(4)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 4 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 4 ? '✓' : '4'}
                </div>
                <span className="ml-2 text-sm font-medium">Chimney Type</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 5 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(5)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 5 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 5 ? '✓' : '5'}
                </div>
                <span className="ml-2 text-sm font-medium">Invoice</span>
              </div>
            </div>
            
            {/* Second Row - Steps 6-10 */}
            <div className="flex items-center justify-center space-x-4">
              <div 
                className={`flex items-center cursor-pointer ${currentLogicalStep >= 6 ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(6)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentLogicalStep >= 6 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentLogicalStep > 6 ? '✓' : '6'}
                </div>
                <span className="ml-2 text-sm font-medium">Images</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${currentLogicalStep >= 7 ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(7)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   currentLogicalStep >= 7 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   {currentLogicalStep > 7 ? '✓' : '7'}
                 </div>
                 <span className="ml-2 text-sm font-medium">Repair Est.</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${currentLogicalStep >= 8 ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(8)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   currentLogicalStep >= 8 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   8
                 </div>
                 <span className="ml-2 text-sm font-medium">Inspection Images</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${currentLogicalStep >= 9 ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(9)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   currentLogicalStep >= 9 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   9
                 </div>
                 <span className="ml-2 text-sm font-medium">Documentation</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${currentLogicalStep >= 10 ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(10)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   currentLogicalStep >= 10 ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   10
                 </div>
                 <span className="ml-2 text-sm font-medium">Final Steps</span>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Fields Section */}
          <div className="card p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {currentLogicalStep === 1 ? 'Manual Entry' : 
                 currentLogicalStep === 2 ? 'Page 2 - Static Content' : 
                 currentLogicalStep === 3 ? 'Page 3 - Service Report' : 
                 currentLogicalStep === 4 ? 'Page 4 - Chimney Type' : 
                 currentLogicalStep === 5 ? `Page ${currentPage} - Invoice${totalInvoicePages > 1 ? ` (${currentPage - 4}/${totalInvoicePages})` : ''}` : 
                 currentLogicalStep === 6 ? 'Page 6 - Project Images' :
                 currentLogicalStep === 7 ? 'Page 7 - Repair Estimate' :
                 currentLogicalStep === 8 ? 'Page 8 - Inspection Images' :
                 currentLogicalStep === 9 ? 'Page 9 - Documentation' :
                 'Step 10 - Final Steps'}
              </h3>
              <button
                onClick={handleBackToScrape}
                className="text-[#722420] hover:text-[#5a1d1a] text-sm font-medium"
              >
                ← Back to Data Extraction
              </button>
            </div>
            
            {/* Final Report Generation Indicator (now on Page 5) */}
           
            
            {currentPage === 1 ? (
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Client Name */}
                  <div>
                    <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Name
                    </label>
                    <input
                      type="text"
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => updateFormData({ clientName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>
                  
                  {/* Client Address */}
                  <div>
                    <label htmlFor="clientAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Client Address
                    </label>
                    <textarea
                      id="clientAddress"
                      value={formData.clientAddress}
                      onChange={(e) => updateFormData({ clientAddress: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                      placeholder="Enter client address"
                    />
                  </div>
                  
                  {/* Chimney Type */}
                  <div>
                    <label htmlFor="chimneyType" className="block text-sm font-medium text-gray-700 mb-2">
                      Chimney Type
                    </label>
                    <select
                      id="chimneyType"
                      value={formData.chimneyType}
                      onChange={(e) => updateFormData({ chimneyType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    >
                      <option value="">Select chimney type</option>
                      <option value="masonry">Masonry</option>
                      <option value="prefabricated">Prefabricated</option>
                    </select>
                  </div>

                  {/* Report Date */}
                  <div>
                    <label htmlFor="reportDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Report Date
                    </label>
                    <input
                      type="date"
                      id="reportDate"
                      value={formData.reportDate}
                      onChange={(e) => updateFormData({ reportDate: e.target.value })}
                      className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420] text-center font-medium cursor-pointer hover:border-gray-400 transition-colors"
                      style={{
                          fontSize: '16px',
                          minHeight: '48px'
                      }}
                    />
                  </div>

                  {/* House Image Upload - Only show if no timelineCoverImage exists */}
                  {!formData.timelineCoverImage && (
                    <div className="space-y-4">
                      
                      
                      
                      <div>
                        <label htmlFor="imageUrlInput" className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="url"
                            id="imageUrlInput"
                            placeholder="https://example.com/image.jpg"
                            className="flex-1 px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-[#722420]"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                const url = (e.target as HTMLInputElement).value.trim();
                                if (url) {
                                  updateFormData({ timelineCoverImage: url });
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const urlInput = document.getElementById('imageUrlInput') as HTMLInputElement;
                              const url = urlInput.value.trim();
                              if (url) {
                                updateFormData({ timelineCoverImage: url });
                              }
                            }}
                            className="px-4 py-2 bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors text-sm"
                          >
                            Load
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show existing image info if timelineCoverImage exists */}
                  {formData.timelineCoverImage && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-green-600">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-800">House Image Available</p>
                          <p className="text-xs text-green-600">Image has been extracted or uploaded</p>
                        </div>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleCropImage()}
                          className="ml-7 p-6 py-3 text-xs bg-[#722420] text-white rounded hover:bg-[#5a1d1a] transition-colors"
                        >
                          ✂️ Crop Image
                        </button>
                        <br />
                        <button
                          type="button"
                          onClick={() => updateFormData({ timelineCoverImage: '' })}
                          className="text-sm text-[#722420] hover:text-black underline"
                        >
                          Remove image to upload a new one
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            ) : currentPage === 2 ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 2 - Static Content</h4>
                  <p className="text-black mb-4">
                    This page contains company credentials and insurance information that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : currentPage === 3 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="page3ClientName" className="block text-sm font-medium text-gray-700 mb-2">
                    Client Name for Greeting
                  </label>
                  <input
                    type="text"
                    id="page3ClientName"
                    value={formData.clientName}
                    onChange={(e) => updateFormData({ clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter client name for greeting"
                  />
                </div>
              </div>
            ) : currentPage === 4 ? (
              <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <div className="text-red-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 4 - Static Content</h4>
                  <p className="text-black mb-4">
                    This page summarizes the chimney type selection and is not editable.
                  </p>
                  <p className="text-sm text-black">
                    The content is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : isInvoicePage(currentPage) ? (
              <div className="space-y-4">
                {/* Invoice Number */}
                <div>
                  <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    id="invoiceNumber"
                    value={formData.invoiceData?.invoiceNumber || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: e.target.value,
                        paymentMethod: formData.invoiceData?.paymentMethod || '',
                        paymentNumber: formData.invoiceData?.paymentNumber || '',
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter invoice number"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select
                    id="paymentMethod"
                    value={formData.invoiceData?.paymentMethod || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                        paymentMethod: e.target.value,
                        paymentNumber: formData.invoiceData?.paymentNumber || '',
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                  >
                    <option value="">Select payment method</option>
                    <option value="Cash">Cash</option>
                    <option value="Check">Check</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Payment Number */}
                <div>
                  <label htmlFor="paymentNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="paymentNumber"
                    value={formData.invoiceData?.paymentNumber || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                        paymentMethod: formData.invoiceData?.paymentMethod || '',
                        paymentNumber: e.target.value,
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    placeholder="Enter payment number (check #, transaction ID, etc.)"
                  />
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Invoice Items
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const newRow = {
                          id: Date.now().toString(),
                          description: '',
                          unit: '',
                          price: ''
                        };
                        updateFormData({ 
                          invoiceData: { 
                            invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                            paymentMethod: formData.invoiceData?.paymentMethod || '',
                            paymentNumber: formData.invoiceData?.paymentNumber || '',
                            rows: [...(formData.invoiceData?.rows || []), newRow]
                          } 
                        });
                      }}
                      className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(formData.invoiceData?.rows || []).map((row, index) => (
                      <div key={row.id} className="flex space-x-2 p-2 border border-gray-200 rounded-md">
                        <input
                          type="text"
                          placeholder="Description"
                          value={row.description}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, description: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={row.unit}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, unit: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <input
                          type="text"
                          placeholder="Price"
                          value={row.price}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, price: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updatedRows = (formData.invoiceData?.rows || []).filter(r => r.id !== row.id);
                            updateFormData({
                              invoiceData: {
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                rows: updatedRows
                              }
                            });
                          }}
                          className="px-2 py-1 bg-[#722420] text-white rounded hover:bg-[#5a1d1a] text-sm flex items-center justify-center"
                          title="Delete item"
                        >
                          <svg 
                            width="14" 
                            height="14" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                    {(!formData.invoiceData?.rows || formData.invoiceData.rows.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No items added yet. Click "Add Item" to add invoice items.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : isImagePage6(currentPage) ? (
              // Page 6 - Image Selection Interface
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Select Project Images (Max 4)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Selected: {formData.selectedImages?.length || 0}/4
                  </p>
                </div>
                
                {(formData.scrapedImages?.length || 0) > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
                    {formData.scrapedImages?.map((image) => {
                      const isSelected = formData.selectedImages?.some(img => img.id === image.id) || false;
                      const canSelect = (formData.selectedImages?.length || 0) < 4 || isSelected;
                      
                      return (
                        <div
                          key={image.id}
                          className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                            isSelected
                              ? 'border-[#722420] shadow-lg scale-105'
                              : 'border-gray-200 hover:border-gray-400'
                          } ${!canSelect ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (!canSelect) return;
                            
                            const currentSelected = formData.selectedImages || [];
                            let newSelection: ImageItem[];

                            if (isSelected) {
                              // Remove image from selection
                              newSelection = currentSelected.filter(img => img.id !== image.id);
                            } else {
                              // Add image to selection
                              newSelection = [...currentSelected, image];
                            }

                            handleImageSelection(newSelection);
                          }}
                        >
                          <div className="aspect-square bg-gray-100">
                            <img
                              src={image.url}
                              alt={image.alt || 'Scraped image'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#722420] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>
                          )}
                          
                          {isSelected && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#722420] text-white text-xs p-1 text-center">
                              Selected #{(formData.selectedImages?.findIndex(img => img.id === image.id) || 0) + 1}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg mb-2">No images available</p>
                      <p className="text-sm">Images will appear here after data scraping</p>
                    </div>
                  </div>
                )}

                {(formData.selectedImages?.length || 0) > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          {formData.selectedImages?.length} image{(formData.selectedImages?.length || 0) !== 1 ? 's' : ''} selected for PDF
                        </p>
                        <p className="text-xs text-green-600">Selected images will appear in the final report</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : currentLogicalStep === 7 ? (
              // Page 7 - Repair Estimate Interface
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Repair Estimate Configuration
                  </h4>
                  
                  {/* Page Management Buttons */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium text-gray-700">Page Management</h5>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowReviewImageSelector(true)}
                          disabled={getAvailableImages().length === 0}
                          className={`px-3 py-1.5 rounded text-sm transition-colors ${
                            getAvailableImages().length > 0
                              ? 'bg-[#722420] text-white hover:bg-[#5a1d1a]' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          + Add New Page
                        </button>
                        {formData.repairEstimatePages && formData.repairEstimatePages.length > 0 && (
                          <>
                            <button
                              onClick={() => setShowChangeImageModal(true)}
                              disabled={getAvailableImages().length === 0}
                              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                                getAvailableImages().length > 0
                                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              Change Image
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete page ${currentRecommendationPageIndex + 1}?`)) {
                                  deleteRecommendationPage(currentRecommendationPageIndex);
                                }
                              }}
                              className="px-3 py-1.5 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              Delete Current Page
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                  </div>
                </div>

                {/* Table Management */}
                {getCurrentRecommendationPage() && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h5 className="font-medium text-gray-700">Add Items</h5>
                      <button
                        onClick={() => setShowAddRowModal(true)}
                        className="px-3 py-1.5 bg-[#722420] text-white rounded text-sm hover:bg-[#5a1d1a] transition-colors"
                      >
                        + Add Row
                      </button>
                    </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-left">Unit</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(getCurrentRecommendationPage()?.repairEstimateData.rows || []).map((row: any, index: number) => (
                          <tr key={row.id}>
                            <td className="px-3 py-2">
                              {row.isManual ? (
                                <input
                                  type="text"
                                  value={row.description}
                                  onChange={(e) => {
                                    const currentPage = getCurrentRecommendationPage();
                                    if (currentPage) {
                                      const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                        r.id === row.id ? { ...r, description: e.target.value } : r
                                      );
                                      updateCurrentRecommendationPage({
                                        repairEstimateData: {
                                          ...currentPage.repairEstimateData,
                                          rows: updatedRows
                                        }
                                      });
                                    }
                                  }}
                                  className="w-full p-1 border rounded text-sm"
                                  placeholder="Enter description"
                                />
                              ) : (
                                <select
                                  value={row.description ? dropdownOptions.find(opt => opt.description === row.description)?.id || "" : ""}
                                  onChange={(e) => {
                                    const selectedOption = dropdownOptions.find(opt => opt.id === e.target.value);
                                    const currentPage = getCurrentRecommendationPage();
                                    if (selectedOption && currentPage) {
                                      const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                        r.id === row.id ? { 
                                          ...r, 
                                          description: selectedOption.description,
                                          unit: selectedOption.unit,
                                          price: selectedOption.price,
                                          recommendation: selectedOption.recommendation
                                        } : r
                                      );
                                      updateCurrentRecommendationPage({
                                        repairEstimateData: {
                                          ...currentPage.repairEstimateData,
                                          rows: updatedRows
                                        }
                                      });
                                    }
                                  }}
                                  className="w-full p-1 border rounded text-sm"
                                >
                                  <option value="">Select option...</option>
                                  {dropdownOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.description}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.unit}
                            onChange={(e) => {
                              const currentPage = getCurrentRecommendationPage();
                              if (currentPage) {
                                const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                  r.id === row.id ? { ...r, unit: parseInt(e.target.value) || 0 } : r
                                );
                                updateCurrentRecommendationPage({
                                  repairEstimateData: {
                                    ...currentPage.repairEstimateData,
                                    rows: updatedRows
                                  }
                                });
                              }
                            }}
                                className="w-full p-1 border rounded text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                value={row.price}
                            onChange={(e) => {
                              const currentPage = getCurrentRecommendationPage();
                              if (currentPage) {
                                const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                  r.id === row.id ? { ...r, price: parseInt(e.target.value) || 0 } : r
                                );
                                updateCurrentRecommendationPage({
                                  repairEstimateData: {
                                    ...currentPage.repairEstimateData,
                                    rows: updatedRows
                                  }
                                });
                              }
                            }}
                                className="w-full p-1 border rounded text-sm"
                                min="0"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <button
                            onClick={() => {
                              const currentPage = getCurrentRecommendationPage();
                              if (currentPage) {
                                const updatedRows = currentPage.repairEstimateData.rows.filter((r: any) => r.id !== row.id);
                                updateCurrentRecommendationPage({
                                  repairEstimateData: {
                                    ...currentPage.repairEstimateData,
                                    rows: updatedRows
                                  }
                                });
                              }
                            }}
                                className="px-2 py-1 bg-[#722420] text-white rounded hover:bg-[#5a1d1a] text-xs"
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                        {(!getCurrentRecommendationPage()?.repairEstimateData.rows || getCurrentRecommendationPage()?.repairEstimateData.rows.length === 0) && (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                              No items added yet. Click "Add Row" to add repair items.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                )}

                {/* Custom Recommendation Input - Only show when there are custom rows */}
                {getCurrentRecommendationPage()?.repairEstimateData.rows.some((row: any) => row.isManual) && (
                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Custom Recommendation</h5>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Add your custom recommendation text:
                      </label>
                      <textarea
                        value={getCurrentRecommendationPage()?.customRecommendation || ''}
                        onChange={(e) => handleCustomRecommendationChange(e.target.value)}
                        placeholder="Enter your custom recommendation here..."
                        className="w-full h-24 p-3 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ fontFamily: 'Inter, Arial, sans-serif' }}
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        This text will be displayed in the Professional Recommendations section on Recommendation Pages.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : isImagePage(currentPage) ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 8 - Inspection Images</h4>
                  <p className="text-black mb-4">
                    This page displays inspection images in a static format. Images are automatically arranged and cannot be modified in this view.
                  </p>
                  <p className="text-sm text-black">
                    Page {getImagePageIndex(currentPage) + 1} of {getTotalImagePages()}
                  </p>
                </div>
              </div>
            ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4) ? (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 9 - Documentation (Part 1)</h4>
                  <p className="text-black mb-4">
                    This page contains chimney documentation information that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3) ? (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 9 - Documentation (Part 2)</h4>
                  <p className="text-black mb-4">
                    This page contains additional chimney documentation information that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2) ? (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 9 - Documentation (Part 3)</h4>
                  <p className="text-black mb-4">
                    This page contains final chimney documentation information that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : formData.chimneyType === 'prefabricated' && currentPage === totalPages - 2 ? (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Page 9 - Documentation (Part 4)</h4>
                  <p className="text-black mb-4">
                    This page contains additional prefabricated chimney documentation that cannot be edited.
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : currentPage === totalPages - 1 ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Step 10 - Final Steps (Part 1)</h4>
                  <p className="text-black mb-4">
                    This page contains final inspection documentation and completion information.
                  </p>
                  <p className="text-sm text-black">
                    This is the first part of the final steps in your chimney inspection report.
                  </p>
                </div>
              </div>
            ) : currentPage === totalPages ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Step 10 - Final Steps (Part 2)</h4>
                  <p className="text-black mb-4">
                    This page contains the final completion documentation and summary information.
                  </p>
                  <p className="text-sm text-black">
                    This is the second part of the final steps in your chimney inspection report.
                  </p>
                </div>
              </div>
            ) : null}

             {/* Generate Button - Only show on last page */}
             <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
               {currentPage === totalPages ? (
                <button 
                  type="button"
                  onClick={handleSubmit}
                  className="w-full btn-primary"
                  disabled={isGenerating}
                >
                  {isGenerating ? 'Generating PDF...' : 'Generate Report'}
                </button>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {currentLogicalStep === 1 ? 'Fill in the client information above' : 
                     currentLogicalStep === 2 ? 'Review the static content' : 
                     currentLogicalStep === 3 ? 'Review service report details' : 
                     currentLogicalStep === 4 ? 'Review chimney type details' : 
                     currentLogicalStep === 5 ? 'Review invoice details' : 
                     currentLogicalStep === 6 ? 'Select project images for the report' :
                     currentLogicalStep === 7 ? 'Configure repair estimate table' : 
                     currentLogicalStep === 8 ? 'Review inspection images' :
                     currentLogicalStep === 9 ? 'Review chimney documentation' :
                     currentLogicalStep === 10 ? 'Review final steps and completion information' :
                     "This page is static and not editable"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {currentPage < totalPages ? 'Navigate through all pages to complete your report' : 'All pages completed - ready to generate report'}
                  </p>
                </div>
              )}
              
              {/* Mobile optimization note */}
              {isMobile && currentPage === 5 && (
                <div className="mt-3 text-xs text-gray-500 text-center">
                  📱 Mobile optimized: PDF will be generated with desktop-quality layout
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="card p-0">
            {/* Page Navigation */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                Report Preview
                
              </h3>
              <div className="flex items-center space-x-2">
                {(() => {
                  // Calculate the actual page number being displayed
                  let actualPageNumber = currentPage;
                  if (currentLogicalStep === 7) {
                    const imagePageNum = 4 + totalInvoicePages + 1;
                    actualPageNumber = imagePageNum + 1 + currentRecommendationPageIndex;
                  } else if (currentLogicalStep === 8) {
                    // For image pages, show the actual page number
                    actualPageNumber = currentPage;
                  }
                  
                  return (
                    <>
                      {(actualPageNumber > 1) && (
                        <button
                          onClick={handlePrevPage}
                          className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] transition-colors"
                        >
                          ← Page {actualPageNumber - 1}
                        </button>
                      )}
                      <span className="text-sm text-gray-600 font-medium">
                        Page {actualPageNumber} of {totalPages}
                      </span>
                      {(actualPageNumber < totalPages) && (
                        <button
                          onClick={handleNextPage}
                          className="px-3 py-1 text-sm bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] transition-colors"
                        >
                          Page {actualPageNumber + 1} →
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex justify-center overflow-x-auto" data-preview="true">
                          {currentPage === 1 ? (
              <Page1 formData={formData} updateFormData={updateFormData} timelineCoverImage={formData.timelineCoverImage} />
            ) : currentPage === 2 ? (
              <Page2 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 3 ? (
              <Page3 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 4 ? (
                <Page4 chimneyType={formData.chimneyType} />
              ) : currentPage === 5 ? (
                <Page5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={1}
                />
              ) : isInvoicePage(currentPage) ? (
                <Page5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={currentPage - 4}
                  isPDF={false}
                />
              ) : isImagePage6(currentPage) ? (
                <Page6 
                  scrapedImages={formData.scrapedImages || []}
                  selectedImages={formData.selectedImages || []}
                  onImageSelection={handleImageSelection}
                  isPDF={false}
                />
              ) : isRecommendationPage(currentPage) ? (
                getCurrentRecommendationPage() ? (
                  <Page7 
                    scrapedImages={formData.scrapedImages || []}
                    selectedImages={formData.selectedImages || []}
                    onImageSelection={handleImageSelection}
                    isPDF={false}
                    repairEstimateData={getCurrentRecommendationPage()?.repairEstimateData}
                    reviewImage={getCurrentRecommendationPage()?.reviewImage}
                    customRecommendation={getCurrentRecommendationPage()?.customRecommendation || ''}
                  />
                ) : (
                  // Show empty Page7 when no recommendation pages exist
                  <Page7 
                    scrapedImages={formData.scrapedImages || []}
                    selectedImages={formData.selectedImages || []}
                    onImageSelection={handleImageSelection}
                    isPDF={false}
                    repairEstimateData={{ manualEntry: false, rows: [] }}
                    reviewImage=""
                    customRecommendation=""
                  />
                 )
               ) : isImagePage(currentPage) ? (
                 <Page8 
                   isPDF={false} 
                   unusedImages={getUnusedImages()} 
                   currentPage={getImagePageIndex(currentPage) + 1}
                   totalPages={getTotalImagePages()}
                 />
                ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 5 : 4) ? (
                  <Page9Part1 isPDF={false} chimneyType={formData.chimneyType} />
                ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 4 : 3) ? (
                  <Page9Part2 isPDF={false} chimneyType={formData.chimneyType} />
                ) : currentPage === totalPages - (formData.chimneyType === 'prefabricated' ? 3 : 2) ? (
                  <Page9Part3 isPDF={false} chimneyType={formData.chimneyType} />
                ) : formData.chimneyType === 'prefabricated' && currentPage === totalPages - 2 ? (
                  <Page9Part4 isPDF={false} chimneyType={formData.chimneyType} />
                ) : currentPage === totalPages - 1 ? (
                  <Step10Part1 isPDF={false} chimneyType={formData.chimneyType} />
                ) : currentPage === totalPages ? (
                  <Step10Part2 isPDF={false} chimneyType={formData.chimneyType} />
                ) : null}
             </div>
            
            {/* Mobile preview instructions */}
            {isMobile && (
              <div className="p-3 text-center bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  📱 Desktop view enabled for better experience
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Full layout visible on mobile devices • Navigate between pages
                </p>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Image Cropping Modal */}
      {isCropping && formData.timelineCoverImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Crop Image</h3>
                  <p className="text-sm text-gray-600">
                    {window.innerWidth <= 768 
                      ? "Touch and drag to crop. Use corners to resize."
                      : "Drag to move, use corners to resize. Maintains aspect ratio for optimal display."
                    }
                  </p>
                </div>
                <button
                  onClick={handleCropCancel}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold p-2"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-hidden p-2 sm:p-4">
              <ImageCropper
                imageUrl={formData.timelineCoverImage}
                onCropComplete={handleCropComplete}
                onCancel={handleCropCancel}
                aspectRatio={284/220} // Match the display dimensions in Page1
              />
            </div>
          </div>
        </div>
      )}

      {/* Review Image Selection Modal */}
      {showReviewImageSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Image for New Recommendation Page</h3>
                <button
                  onClick={() => setShowReviewImageSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose an image to create a new recommendation page</p>
              {formData.usedReviewImages && formData.usedReviewImages.length > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {formData.usedReviewImages.length} image(s) already used in other pages
                </p>
              )}
            </div>
            
            <div className="p-4">
              {getAvailableImages().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getAvailableImages().map((image, index) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={`Available Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#722420] transition-colors"
                        onClick={() => {
                          addNewRecommendationPage(image.url);
                          setShowReviewImageSelector(false);
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to create page
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No more images available</p>
                  <p className="text-sm">All scraped images have been used for recommendation pages</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Change Image Modal */}
      {showChangeImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Change Image for Current Page</h3>
                <button
                  onClick={() => setShowChangeImageModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose a different image for the current recommendation page</p>
            </div>
            
            <div className="p-4">
              {getAvailableImages().length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {getAvailableImages().map((image: any, index: number) => (
                    <div key={image.id} className="relative group">
                      <img
                        src={image.url}
                        alt={`Available Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 cursor-pointer hover:border-[#722420] transition-colors"
                        onClick={() => {
                          changePageImage(currentRecommendationPageIndex, image.url);
                          setShowChangeImageModal(false);
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to change
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No available images</p>
                  <p className="text-sm">All scraped images are currently in use</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {showAddRowModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Add Repair Item</h3>
                <button
                  onClick={() => setShowAddRowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose how you want to add the repair item</p>
            </div>
            
            <div className="p-6 space-y-4">
              <button
                onClick={() => {
                        const currentPage = getCurrentRecommendationPage();
                        if (currentPage) {
                          const newRow = {
                            id: Date.now().toString(),
                            srNo: currentPage.repairEstimateData.rows.length + 1,
                            description: '',
                            unit: 1,
                            price: 0,
                            isManual: true
                          };
                          updateCurrentRecommendationPage({
                            repairEstimateData: {
                              ...currentPage.repairEstimateData,
                              rows: [...currentPage.repairEstimateData.rows, newRow]
                            }
                          });
                        }
                  setShowAddRowModal(false);
                }}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#722420] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Custom Entry</h4>
                    <p className="text-sm text-gray-600 mt-1">Enter your own description, unit, and price manually</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowAddRowModal(false);
                  setShowPredefinedModal(true);
                }}
                className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-[#722420] hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">From Predefined List</h4>
                    <p className="text-sm text-gray-600 mt-1">Choose from common repair items with preset pricing</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Predefined Options Modal */}
      {showPredefinedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh]">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Predefined Repair Item</h3>
                <button
                  onClick={() => setShowPredefinedModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Choose from {dropdownOptions.length} predefined repair items</p>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {dropdownOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      const currentPage = getCurrentRecommendationPage();
                      if (currentPage) {
                        const newRow = {
                          id: Date.now().toString(),
                          srNo: currentPage.repairEstimateData.rows.length + 1,
                          description: option.description,
                          unit: option.unit,
                          price: option.price,
                          recommendation: option.recommendation,
                          isManual: false
                        };
                        updateCurrentRecommendationPage({
                          repairEstimateData: {
                            ...currentPage.repairEstimateData,
                            rows: [...currentPage.repairEstimateData.rows, newRow]
                          }
                        });
                      }
                      setShowPredefinedModal(false);
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-[#722420] hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">
                          {option.srNo}. {option.description}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Unit: {option.unit} | Price: ${option.price}
                        </div>
                      </div>
                      <div className="ml-4 text-xs text-gray-500">
                        #{option.id}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;
