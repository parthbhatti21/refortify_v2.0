import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import Step5Part2 from './Step5-part2';
import Step6 from './Step6';
import Step7 from './Step7';
import Step8 from './Step8';
import Step9Part1 from './Step9-part1';
import Step9Part2 from './Step9-part2';
import Step9Part3 from './Step9-part3';
import AutocompleteInput from './AutocompleteInput';
import { SheetRow } from '../lib/googleSheetsService';
import Step10Part1 from './Step10Part1';
import Step10Part2 from './Step10Part2';
import Step10Part3 from './Step10Part3';
import Step10Part4 from './Step10Part4';
import Step10Part5 from './Step10Part5';
import DataScraper from './DataScraper';
import ImageCropper from './ImageCropper';
import { supabase } from '../lib/supabaseClient';

export interface ImageItem {
  id: string;
  url: string;
  alt?: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
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
  step6TextPositionX?: number; // Text position X for Step 6
  step6TextPositionY?: number; // Text position Y for Step 6
  dataSourceUrl?: string; // Data source URL from DataScraper
  invoiceData?: {
    invoiceNumber: string;
    paymentMethod: string;
    paymentNumber: string;
    notes?: string;
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
    }>;
  };
  repairEstimateData?: {
    estimateNumber: string;
    paymentMethod: string;
    paymentNumber: string;
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
    }>;
  };
  // Recommendations (Step5-part2) multi-section support
  recommendationSection1Title?: string;
  showRecommendationSection2?: boolean;
  recommendationSection2Title?: string;
  recommendationSection2?: {
    rows: Array<{
      id: string;
      description: string;
      unit: string;
      price: string;
      }>;
    };
    notes: string;
    repairEstimatePages?: Array<{
    id: string;
    reviewImage: string;
    customRecommendation?: string; // Custom recommendation text
    imagePositionX?: number; // Image X position in pixels (relative to page)
    imagePositionY?: number; // Image Y position in pixels (relative to page)
    imageWidth?: number; // Image width in pixels
    imageHeight?: number; // Image height in pixels
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
  excludedStep8Images?: string[]; // Track images excluded from Step 8
  inspectionImagesOrder?: string[]; // Track custom order of inspection images
  uploadedInspectionImages?: ImageItem[]; // Images uploaded by user for Step 8
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

// Helper function to sanitize filename
const sanitizeFileName = (text: string): string => {
  if (!text) return '';
  // First, normalize Unicode characters and convert to ASCII-safe equivalents
  // Replace common Unicode characters with ASCII equivalents
  let sanitized = text
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .replace(/[•·]/g, '-') // Replace bullet points with dash
    .replace(/[—–]/g, '-') // Replace em/en dashes with regular dash
    .replace(/[""]/g, '"') // Replace smart quotes with regular quotes
    .replace(/['']/g, "'") // Replace smart apostrophes with regular apostrophe
    .replace(/[^\x00-\x7F]/g, '') // Remove any remaining non-ASCII characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .trim();
  
  // Ensure we don't have empty result
  return sanitized || 'file';
};

const MultiStepForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<'scrape' | 'form'>('scrape');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentRecommendationPageIndex, setCurrentRecommendationPageIndex] = useState<number>(0);
  const [currentRecommendationSubPage, setCurrentRecommendationSubPage] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
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
      notes: '',
      rows: []
    },
    repairEstimateData: {
      estimateNumber: '',
      paymentMethod: '',
      paymentNumber: '',
      rows: []
    },
    repairEstimatePages: [],
    usedReviewImages: [],
    excludedStep8Images: [],
    inspectionImagesOrder: [],
    uploadedInspectionImages: [],
    notes: 'This quote is good for 30 days from date of service. Deposits for scheduled future service is non-refundable.'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'editing' | 'saving' | 'generating' | 'uploading' | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null); // Track current report ID when editing
  const [isMobile, setIsMobile] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [preferGoogleDocs, setPreferGoogleDocs] = useState(true); // User preference for PDF viewing
  const [includeRepairEstimate, setIncludeRepairEstimate] = useState(true); // Step 7 is always included
  const [includedPages, setIncludedPages] = useState<Set<number>>(new Set()); // Will be initialized in useEffect
  const hasInitializedPages = useRef(false); // Track if pages have been initialized
  const maxInitializedPage = useRef<number>(0); // Track the maximum page number that was initialized
  const newRowDescriptionRef = useRef<string | null>(null); // Track new row ID to focus after adding
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null); // Track dragged image for drag-and-drop
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input
  const [cropData, setCropData] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [croppingImageId, setCroppingImageId] = useState<string | null>(null); // Track which invoice image is being cropped
  const [showReviewImageSelector, setShowReviewImageSelector] = useState(false);
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [showPredefinedModal, setShowPredefinedModal] = useState(false);
  const [showChangeImageModal, setShowChangeImageModal] = useState(false);
  const [showInvoiceQuickAdd, setShowInvoiceQuickAdd] = useState(false);
  const [predefinedSearchTerm, setPredefinedSearchTerm] = useState('');
  
  // Date selection state for Step 8
  const [showDateSelector, setShowDateSelector] = useState(false);
  const [showPreviousJobImages, setShowPreviousJobImages] = useState(false);
  const [allJobs, setAllJobs] = useState<Array<{
    id: string;
    date: string;
    imageUrls: string[];
    scrapedImages: ImageItem[];
  }>>([]);
  const [selectedDateJob, setSelectedDateJob] = useState<{
    id: string;
    date: string;
    imageUrls: string[];
    scrapedImages: ImageItem[];
  } | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [imageForPositionMove, setImageForPositionMove] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<string>('');

  // Function to parse all jobs from HTML and extract their dates
  const parseAllJobsFromHtml = (htmlContent: string): Array<{
    id: string;
    date: string;
    imageUrls: string[];
    scrapedImages: ImageItem[];
  }> => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const jobs: Array<{
      id: string;
      date: string;
      imageUrls: string[];
      scrapedImages: ImageItem[];
    }> = [];
    
    // Look for timeline-block elements (each represents a job/date)
    const timelineBlocks = doc.querySelectorAll('div.timeline-block');
    
    timelineBlocks.forEach((timelineBlock, index) => {
      // Extract date from span.date element
      let jobDate = '';
      const dateElement = timelineBlock.querySelector('span.date');
      if (dateElement) {
        jobDate = dateElement.textContent?.trim() || '';
      }
      
      // Extract images from photo-grid
      const imageUrls: string[] = [];
      const photoItems = timelineBlock.querySelectorAll('a.photo-item[data-full]');
      
      photoItems.forEach(photoItem => {
        const dataFull = photoItem.getAttribute('data-full');
        if (dataFull) {
          imageUrls.push(dataFull);
        }
      });
      
      // Create job data
      const jobData = {
        id: `job-${index}-${Date.now()}`,
        date: jobDate || new Date().toISOString().split('T')[0],
        imageUrls: imageUrls,
        scrapedImages: imageUrls.map((url, imgIndex) => ({
          id: `job-${index}-img-${imgIndex}-${Date.now()}`,
          url: url,
          alt: `Job ${index + 1} image ${imgIndex + 1}`
        }))
      };
      
      jobs.push(jobData);
    });
    
    // Sort jobs by date (newest first)
    jobs.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    return jobs;
  };

  // Function to load jobs from data source URL
  const loadJobsFromUrl = async () => {
    if (!formData.dataSourceUrl) return;
    
    setIsLoadingJobs(true);
    try {
      const response = await fetch(formData.dataSourceUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const htmlContent = await response.text();
      const jobsData = parseAllJobsFromHtml(htmlContent);
      setAllJobs(jobsData);
      setShowDateSelector(true);
    } catch (error) {
      console.error('Failed to load jobs:', error);
      alert('Failed to load jobs from data source. Please verify the URL and try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  // Function to handle date selection
  const handleDateSelection = (job: {
    id: string;
    date: string;
    imageUrls: string[];
    scrapedImages: ImageItem[];
  }) => {
    setSelectedDateJob(job);
    setSelectedImages([]); // Reset selected images when selecting a new date
    setShowDateSelector(false);
    setShowPreviousJobImages(true);
  };

  // Function to handle date image selection
  const handleDateImageSelection = (imageUrl: string) => {
    setSelectedImages(prev => {
      if (prev.includes(imageUrl)) {
        // Remove image if already selected
        return prev.filter(url => url !== imageUrl);
      } else {
        // Add image if not selected
        return [...prev, imageUrl];
      }
    });
  };

  // Function to handle select all images
  const handleSelectAllImages = () => {
    if (!selectedDateJob) return;
    
    if (selectedImages.length === selectedDateJob.imageUrls.length) {
      // If all images are selected, deselect all
      setSelectedImages([]);
    } else {
      // Select all images
      setSelectedImages([...selectedDateJob.imageUrls]);
    }
  };

  // Function to merge selected date images
  const handleMergeSelectedDateImages = () => {
    if (!selectedDateJob || selectedImages.length === 0) return;
    
    // Convert selected image URLs to ImageItem format
    const selectedImageItems: ImageItem[] = selectedImages.map((url, index) => ({
      id: `selected-${index}-${Date.now()}`,
      url: url,
      alt: `Selected image from ${selectedDateJob.date}`
    }));
    
    // Merge selected images with current inspection images
    const currentUploaded = formData.uploadedInspectionImages || [];
    const currentImages = getUnusedImages();
    const allImages = [...currentImages, ...selectedImageItems];
    
    updateFormData({
      uploadedInspectionImages: [...currentUploaded, ...selectedImageItems],
      inspectionImagesOrder: allImages.map(img => img.id)
    });
    
    setShowPreviousJobImages(false);
    setSelectedDateJob(null);
    setSelectedImages([]);
  };

  // On refresh/load, clear previous saved snapshots for a clean session
  useEffect(() => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i) || '';
        if (key.startsWith('sumoquote_v2_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (err) {
      // Ignore storage errors
    }
  }, []);

  // Toggle current page inclusion in PDF (simplified - always toggles current page)
  const togglePageInclusion = async () => {
    const newIncluded = !isCurrentPageIncluded();
    setIncludedPages(prev => {
      const newSet = new Set(prev);
      if (newIncluded) {
        newSet.add(currentPage);
      } else {
        newSet.delete(currentPage);
      }
      return newSet;
    });
    
    // Save to database if we have a report ID
    if (currentReportId) {
      try {
        if (newIncluded) {
          // Insert or update page inclusion
          await supabase.from('page_inclusions').upsert(
            { report_id: currentReportId, page_number: currentPage },
            { onConflict: 'report_id,page_number' }
          );
        } else {
          // Delete page inclusion
          await supabase.from('page_inclusions')
            .delete()
            .eq('report_id', currentReportId)
            .eq('page_number', currentPage);
        }
      } catch (error) {
        console.error('Failed to save page inclusion:', error);
        // Revert on error
        setIncludedPages(prev => {
          const newSet = new Set(prev);
          if (newIncluded) {
            newSet.delete(currentPage);
          } else {
            newSet.add(currentPage);
          }
          return newSet;
        });
      }
    }
  };

  // Include all pages in PDF
  const includeAllPages = async () => {
    const allPages = new Set<number>();
    for (let page = 1; page <= totalPages; page++) {
      allPages.add(page);
    }
    setIncludedPages(allPages);
    
    // Save to database if we have a report ID
    if (currentReportId) {
      try {
        const inclusions = Array.from(allPages).map(pageNumber => ({
          report_id: currentReportId,
          page_number: pageNumber
        }));
        // Delete all existing and insert new ones
        await supabase.from('page_inclusions')
          .delete()
          .eq('report_id', currentReportId);
        if (inclusions.length > 0) {
          await supabase.from('page_inclusions').insert(inclusions);
        }
      } catch (error) {
        console.error('Failed to save page inclusions:', error);
      }
    }
  };

  // Exclude all pages from PDF
  const excludeAllPages = async () => {
    setIncludedPages(new Set());
    
    // Save to database if we have a report ID
    if (currentReportId) {
      try {
        await supabase.from('page_inclusions')
          .delete()
          .eq('report_id', currentReportId);
      } catch (error) {
        console.error('Failed to delete page inclusions:', error);
      }
    }
  };

  // Check if a specific page number is included in PDF
  const isPageIncluded = (pageNumber: number) => {
    return includedPages.has(pageNumber);
  };

  // Check if the current page is included in PDF
  const isCurrentPageIncluded = () => {
    return includedPages.has(currentPage);
  };

  // Get the page number for a logical step
  const getPageForLogicalStep = (logicalStep: number) => {
    switch (logicalStep) {
      case 1: return 1;
      case 2: return 2;
      case 3: return 3;
      case 4: return 4;
      case 5: return 5; // First invoice page (handled specially via currentPage toggle)
      case 6: {
        // Image selection page comes after invoices and repair estimate pages
        return 4 + totalInvoicePages + totalRepairEstimatePages + 1;
      }
      case 7: {
        // First recommendation page (or setup page if none created)
        const imageSelectionPage = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
        const recommendationStart = imageSelectionPage + 1;
        return recommendationStart;
      }
      case 8: {
        // First inspection image page (after recommendation pages)
        const imageSelectionPage = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
        const recommendationStart = imageSelectionPage + 1;
        const totalRecommendationPages = formData.repairEstimatePages?.length || 0;
        const imagePagesStart = recommendationStart + Math.max(1, totalRecommendationPages);
        return imagePagesStart;
      }
      case 9: return 0; // Not used; handled via currentPage toggle
      case 10: return totalPages - 4; // First Step 10 page (precomputed)
      default: return 1;
    }
  };

  // Get all page numbers for a logical step (for display purposes)
  const getPagesForLogicalStep = (logicalStep: number): number[] => {
    switch (logicalStep) {
      case 1:
        return [1];
      case 2:
        return [2];
      case 3:
        return [3];
      case 4:
        return [4];
      case 5: {
        // Invoice and Repair Estimate pages
        const invoiceStart = 5;
        const pages: number[] = [];
        for (let i = 0; i < totalInvoicePages + totalRepairEstimatePages; i++) {
          pages.push(invoiceStart + i);
        }
        return pages;
      }
      case 6: {
        // Image selection page
        const page = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
        return [page];
      }
      case 7: {
        // Recommendation pages
        const imageSelectionPage = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
        const recommendationStart = imageSelectionPage + 1;
        const totalRecommendationPages = formData.repairEstimatePages?.length || 0;
        const pages: number[] = [];
        for (let i = 0; i < Math.max(1, totalRecommendationPages); i++) {
          pages.push(recommendationStart + i);
        }
        return pages;
      }
      case 8: {
        // Inspection image pages
        const imageSelectionPage = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
        const recommendationStart = imageSelectionPage + 1;
        const totalRecommendationPages = formData.repairEstimatePages?.length || 0;
        const imagePagesStart = recommendationStart + Math.max(1, totalRecommendationPages);
        const totalImagePages = getTotalImagePages();
        const pages: number[] = [];
        for (let i = 0; i < totalImagePages; i++) {
          pages.push(imagePagesStart + i);
        }
        return pages;
      }
      case 9: {
        // Step 9 pages
        const step9Start = totalPages - 3;
        return [step9Start, step9Start + 1, step9Start + 2];
      }
      case 10: {
        // Step 10 pages
        const step10Start = totalPages - 4;
        return [step10Start];
      }
      default:
        return [];
    }
  };

  // Check if any page in a logical step is included (for display purposes)
  const hasAnyPageIncludedForStep = (logicalStep: number): boolean => {
    const pages = getPagesForLogicalStep(logicalStep);
    return pages.some(page => includedPages.has(page));
  };

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

  // Load existing report for editing when coming from Library
  useEffect(() => {
    const loadForEdit = async () => {
      let ctxRaw: string | null = null;
      try { ctxRaw = localStorage.getItem('edit_context'); } catch {}
      if (!ctxRaw) return;
      let ctx: any = null;
      try { ctx = JSON.parse(ctxRaw); } catch { return; }
      const clientId: string | undefined = ctx?.clientId;
      const dateISO: string | undefined = ctx?.date;
      if (!clientId || !dateISO) return;
      try {
        // Immediately switch UI to form and show loading to avoid flicker
        setCurrentStep('form');
        setCurrentPage(1);
        setIsEditLoading(true);
        setGenerationStatus('editing');
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        const userId = userData?.user?.id;
        if (!userId) throw new Error('Not signed in');

        const start = new Date(dateISO + 'T00:00:00Z').toISOString();
        const end = new Date(new Date(dateISO).getTime() + 24*60*60*1000).toISOString();

        const { data: reportsData, error: repErr } = await supabase
          .from('reports')
          .select('id, client_name, created_at')
          .eq('client_id', clientId)
          .gte('created_at', start)
          .lt('created_at', end)
          .order('created_at', { ascending: false })
          .limit(1);
        if (repErr) throw repErr;
        const report = (reportsData || [])[0];
        if (!report) return;
        const reportId = report.id as string;
        setCurrentReportId(reportId); // Store report ID for later updates

        // Fetch step JSONs and page inclusions in parallel
        const [s1, s3, s5i, s5p2, s6, s7, s8, pageInclusions] = await Promise.all([
          supabase.from('step1_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step3_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step5_invoice_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step5_part2_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step6_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step7_json').select('data').eq('report_id', reportId).single(),
          supabase.from('step8_json').select('data').eq('report_id', reportId).single(),
          supabase.from('page_inclusions').select('page_number').eq('report_id', reportId),
        ]);

        const step1 = (s1 as any)?.data?.data || {};
        const step5Inv = (s5i as any)?.data?.data || {};
        const step5p2 = (s5p2 as any)?.data?.data || {};
        const step6j = (s6 as any)?.data?.data || {};
        const step7j = (s7 as any)?.data?.data || {};
        const step8j = (s8 as any)?.data?.data || {};

        // Map to formData
        const mapped: Partial<FormData> = {
          clientName: step1['Client Name'] || report.client_name || '',
          clientAddress: step1['Client Address'] || '',
          chimneyType: (step1['Chimney Type'] || '').toString().toLowerCase(),
          reportDate: step1['Report Date'] || new Date().toISOString().split('T')[0],
          timelineCoverImage: step1['House Image Link'] || '',
          invoiceData: {
            invoiceNumber: step5Inv['Invoice Number'] || '',
            paymentMethod: step5Inv['Method of Payment'] || '',
            paymentNumber: step5Inv['Payment No'] || '',
            notes: step5Inv['Notes'] || '',
            rows: (step5Inv['Invoice Table'] || []).map((r: any) => ({
              id: r.id || String(Math.random()),
              description: r.description || '',
              unit: r.unit || '',
              price: r.price || ''
            }))
          },
          notes: step5p2['Notes'] || '',
          repairEstimateData: {
            estimateNumber: step5p2['Estimate Number'] || '',
            paymentMethod: step5p2['Method of Payment'] || '',
            paymentNumber: step5p2['Payment No'] || '',
            rows: (step5p2['Section 1 Rows'] || []).map((r: any) => ({
              id: r.id || String(Math.random()),
              description: r.description || '',
              unit: r.unit || '',
              price: r.price || ''
            }))
          },
          recommendationSection1Title: step5p2['Section 1 Title'] || 'Repair Estimate 1',
          showRecommendationSection2: !!step5p2['Section 2 Rows'],
          recommendationSection2Title: step5p2['Section 2 Title'] || '',
          recommendationSection2: step5p2['Section 2 Rows'] ? {
            rows: (step5p2['Section 2 Rows'] || []).map((r: any) => ({
              id: r.id || String(Math.random()),
              description: r.description || '',
              unit: r.unit || '',
              price: r.price || ''
            }))
          } : undefined,
          selectedImages: (step6j['Selected Images'] || []).map((img: any) => ({ 
            id: img.id, 
            url: img.url,
            positionX: img.positionX,
            positionY: img.positionY,
            width: img.width,
            height: img.height
          })),
          step6TextPositionX: step6j['Text Position']?.x,
          step6TextPositionY: step6j['Text Position']?.y,
          // Build scrapedImages from selected (step6) + inspection (step8)
          scrapedImages: (() => {
            const selected = (step6j['Selected Images'] || []).map((img: any) => ({ 
              id: img.id || `sel-${Math.random()}`, 
              url: img.url,
              positionX: img.positionX,
              positionY: img.positionY,
              width: img.width,
              height: img.height
            }));
            const inspection = (step8j['Inspection Images'] || step8j['inspectionImages'] || []).map((img: any) => ({ id: img.id || `ins-${Math.random()}`, url: img.url }));
            const uploaded = (step8j['Uploaded Images'] || []).map((img: any) => ({ id: img.id || `uploaded-${Math.random()}`, url: img.url }));
            const seen = new Set<string>();
            const merged: any[] = [];
            [...selected, ...inspection, ...uploaded].forEach((img) => {
              const key = img.url;
              if (!seen.has(key)) { seen.add(key); merged.push(img); }
            });
            return merged;
          })(),
          excludedStep8Images: [],
          inspectionImagesOrder: step8j['Inspection Images Order'] || [],
          uploadedInspectionImages: (step8j['Uploaded Images'] || []).map((img: any) => ({ 
            id: img.id || `uploaded-${Math.random()}`, 
            url: img.url 
          })),
          repairEstimatePages: (step7j['Recommendations'] || []).map((p: any) => ({
            id: String(Math.random()),
            reviewImage: p.reviewImage,
            customRecommendation: '',
            repairEstimateData: {
              manualEntry: false,
              rows: (p.rows || []).map((r: any) => ({
                id: r.id || String(Math.random()),
                description: r.description || '',
                unit: r.unit || '',
                price: r.price || '',
                recommendation: r.recommendation || ''
              }))
            }
          }))
        } as any;

        setFormData(prev => ({ ...prev, ...mapped }));
        
        // Load page inclusions from database
        const inclusionsData = (pageInclusions as any)?.data || [];
        const loadedIncludedPages = new Set<number>(
          inclusionsData.map((item: any) => item.page_number)
        );
        
        // Set page inclusions (will be updated when totalPages is calculated)
        if (loadedIncludedPages.size > 0) {
          setIncludedPages(loadedIncludedPages);
          // Set maxInitializedPage to the maximum page number found
          const maxPage = Math.max(...Array.from(loadedIncludedPages), 0);
          maxInitializedPage.current = maxPage;
          hasInitializedPages.current = true;
        }
        // If no inclusions found, the useEffect will handle default initialization
      } catch (e) {
        // ignore
      } finally {
        // Clear any step caches to avoid stale state
        try {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i) || '';
            if (k.startsWith('sumoquote_v2_')) {
              localStorage.removeItem(k);
            }
          }
          localStorage.removeItem('edit_context');
        } catch {}
        setIsEditLoading(false);
        setGenerationStatus(null);
      }
    };
    loadForEdit();
  }, []);

  // Build a labeled snapshot for specific logical steps, skipping static pages
  // May return a special key via __key to override default storage key when needed
  const buildStepSnapshot = (logicalStep: number) => {
    const formattedChimneyType = (formData.chimneyType || '').trim();
    if (logicalStep === 1) {
      return {
        'Client Name': formData.clientName || '',
        'Client Address': formData.clientAddress || '',
        'Chimney Type': formattedChimneyType ? formattedChimneyType.charAt(0).toUpperCase() + formattedChimneyType.slice(1) : '',
        'Report Date': formData.reportDate || '',
        'House Image Link': formData.timelineCoverImage || ''
      };
    }
    if (logicalStep === 3) {
      return {
        'Client Name': formData.clientName || ''
      };
    }
    if (logicalStep === 5) {
      // Distinguish between Invoice (Step 5) and Repair Estimate (Step 5 Part 2)
      if (typeof isInvoicePage === 'function' && isInvoicePage(currentPage)) {
        return {
          'Invoice Number': formData.invoiceData?.invoiceNumber || '',
          'Method of Payment': formData.invoiceData?.paymentMethod || '',
          'Payment No': formData.invoiceData?.paymentNumber || '',
          'Notes': formData.invoiceData?.notes || '',
          'Invoice Table': formData.invoiceData?.rows || []
        };
      }
      if (typeof isRepairEstimatePage === 'function' && isRepairEstimatePage(currentPage)) {
        // Step 5 Part 2 snapshot
        const section1 = {
          title: formData.recommendationSection1Title || 'Repair Estimate#1',
          rows: formData.repairEstimateData?.rows || []
        };
        const hasSection2 = !!formData.showRecommendationSection2;
        const section2 = hasSection2 ? {
          title: formData.recommendationSection2Title || 'Repair Estimate#2',
          rows: formData.recommendationSection2?.rows || []
        } : undefined;
        return {
          __key: 'sumoquote_v2_step_5_part2',
          data: {
            'Estimate Number': formData.repairEstimateData?.estimateNumber || '',
            'Method of Payment': formData.repairEstimateData?.paymentMethod || '',
            'Payment No': formData.repairEstimateData?.paymentNumber || '',
            'Section 1 Title': section1.title,
            'Section 1 Rows': section1.rows,
            ...(section2 ? {
              'Section 2 Title': section2.title,
              'Section 2 Rows': section2.rows
            } : {}),
            'Notes': formData.notes || ''
          }
        };
      }
    }
    if (logicalStep === 6) {
      // Step 6 - Selected Images
      return {
        'Selected Images': (formData.selectedImages || []).map(img => ({ id: img.id, url: img.url }))
      };
    }
    if (logicalStep === 7) {
      // Step 7 - Recommendation pages (image + table rows per recommendation)
      const pages = formData.repairEstimatePages || [];
      return {
        'Recommendations': pages.map((p: any, idx: number) => ({
          index: idx + 1,
          reviewImage: p.reviewImage,
          rows: (p.repairEstimateData?.rows) || []
        }))
      };
    }
    return null; // Do not save static or unsupported steps
  };

  // Helper functions for managing recommendation pages
  const getCurrentRecommendationPage = () => {
    const pages = formData.repairEstimatePages || [];
    // Always use currentRecommendationPageIndex for consistency
    return pages[currentRecommendationPageIndex];
  };

  // Calculate how many pages a recommendation needs based on number of rows
  const calculateRecommendationPages = (rows: any[]) => {
    if (rows.length <= 1) return 1; // 1 row or less = 1 page
    return 2; // Multiple rows = 2 pages (table + image)
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
    dataSourceUrl?: string;
  }) => {
    setFormData({
      ...formData,
      clientName: data.clientName,
      clientAddress: data.clientAddress,
      chimneyType: data.chimneyType,
      reportDate: data.reportDate,
      timelineCoverImage: data.timelineCoverImage,
      scrapedImages: data.scrapedImages,
      dataSourceUrl: data.dataSourceUrl,
      selectedImages: [], // Initialize empty selection
      excludedStep8Images: [], // Reset excluded images when new data is loaded
      inspectionImagesOrder: [], // Reset image order
      uploadedInspectionImages: [] // Reset uploaded images
    });
    setCurrentReportId(null); // Reset report ID for new report
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
        notes: '',
        rows: []
      },
      repairEstimatePages: [],
      usedReviewImages: [],
      excludedStep8Images: [],
      inspectionImagesOrder: [],
      uploadedInspectionImages: [],
      notes: 'This quote is good for 30 days from date of service. Deposits for scheduled future service is non-refundable.'
    });
    setCurrentReportId(null); // Reset report ID for new report
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
        const clientName = sanitizeFileName(formData.clientName || 'client');
        const clientAddress = sanitizeFileName(formData.clientAddress || '');
        const fileName = `A_Step_In_Time_${clientName}${clientAddress ? '_' + clientAddress : ''}.pdf`;
        pdf.save(fileName);
        
        
        // Also upload the generated PDF to the backend
        try {
          setGenerationStatus('uploading');
          const pdfBlob: Blob = pdf.output('blob');
          await uploadReportPdf(pdfBlob, fileName, formData.clientName || 'client');
          alert('Report uploaded successfully.');
        } catch (uploadError: any) {
          const message = uploadError?.message || 'Unknown error';
          alert(`Upload failed: ${message}`);
        }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again. Make sure all components are visible in the preview.');
    } finally {
      setIsGenerating(false);
      setGenerationStatus(null);
    }
  };

  // Download PDF only (no saving to database or uploading)
  const handleDownloadPDF = async () => {
    // Check if required fields are filled
    if (!formData.clientName || !formData.clientAddress || !formData.chimneyType) {
      alert('Please fill in all required fields before downloading the PDF.');
      return;
    }
    
    setIsGenerating(true);
    setGenerationStatus('generating');
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
        (titleText as HTMLElement).style.top = '-5px';
      }
      
      // Mobile-specific adjustments for PDF generation
      if (isMobileDevice) {
        const page1Element = clonedContent.querySelector('[data-preview="true"] > div') as HTMLElement;
        if (page1Element) {
          page1Element.style.transform = 'none';
          page1Element.style.scale = '1';
          page1Element.style.width = '595px';
          page1Element.style.height = '842px';
          page1Element.style.maxWidth = '595px';
          page1Element.style.maxHeight = '842px';
          page1Element.style.position = 'relative';
          page1Element.style.left = '0';
          page1Element.style.top = '0';
          page1Element.style.margin = '0';
          page1Element.style.padding = '0';
        }
        
        const allElements = clonedContent.querySelectorAll('*');
        allElements.forEach((el) => {
          const element = el as HTMLElement;
          if (element.style.transform && element.style.transform.includes('scale')) {
            element.style.transform = 'none';
          }
          if (element.style.scale) {
            element.style.scale = '1';
          }
          element.style.margin = '0';
          element.style.padding = '0';
          
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
      
      // Save PDF directly (download only, no upload)
      const clientName = sanitizeFileName(formData.clientName || 'client');
      const clientAddress = sanitizeFileName(formData.clientAddress || '');
      const fileName = `A_Step_In_Time_${clientName}${clientAddress ? '_' + clientAddress : ''}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again. Make sure all components are visible in the preview.');
    } finally {
      setIsGenerating(false);
      setGenerationStatus(null);
    }
  };

  // Upload the generated PDF to the backend using multipart/form-data
  const uploadReportPdf = async (pdfBlob: Blob, fileName: string, clientName: string) => {
    const API_BASE = process.env.REACT_APP_API_BASE || 'https://adminbackend.chimneysweeps.com';
    const API_KEY = process.env.REACT_APP_API_KEY || 'bestcompanyever23325';
    const formData = new FormData();
    formData.append('file', pdfBlob, fileName);
    formData.append('website', 'mysite');
    formData.append('prefix', 'pdfs');
    formData.append('client_name', clientName);
    
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      headers: API_KEY ? { 'X-API-Key': API_KEY } : undefined
    });
    
    
    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Upload failed: ${response.status} ${text}`);
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
    
    // Save report and step-wise data to Supabase first
    try {
      setIsGenerating(true);
      setGenerationStatus('saving');
      await saveReportToSupabase();
    } catch (err: any) {
      console.error('Failed saving to Supabase:', err);
      alert(`Failed saving to database: ${err?.message || 'Unknown error'}`);
      // Continue to generate PDF even if DB save fails
    }

    // Generate PDF
    setGenerationStatus('generating');
    await generatePDF();
  };

  const handleBackToScrape = () => {
    setCurrentStep('scrape');
  };

  const handleCropImage = () => {
    setIsCropping(true);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    if (croppingImageId) {
      // Cropping an invoice image
      const updatedImages = (formData.selectedImages || []).map(img => 
        img.id === croppingImageId ? { ...img, url: croppedImageUrl } : img
      );
      updateFormData({ selectedImages: updatedImages });
      setCroppingImageId(null);
    } else {
      // Cropping timeline cover image
      updateFormData({ timelineCoverImage: croppedImageUrl });
    }
    setIsCropping(false);
    setCropData(null);
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setCropData(null);
    setCroppingImageId(null);
  };

  const handleCropInvoiceImage = (imageId: string) => {
    const image = formData.selectedImages?.find(img => img.id === imageId);
    if (image) {
      setCroppingImageId(imageId);
      setIsCropping(true);
    }
  };

  // Calculate total pages including invoice pages
  const MAX_TABLE_HEIGHT = 400; // Max height for table container
  const ROW_HEIGHT = 50; // Estimated row height
  
  const maxRowsPerPage = Math.floor(MAX_TABLE_HEIGHT / ROW_HEIGHT);
  const ITEMS_PER_PAGE = Math.max(1, maxRowsPerPage); // At least 1 row per page
  
  // Persist the report and step-wise data to Supabase
  const saveReportToSupabase = async (): Promise<string | null> => {
    // Require authenticated user for RLS-backed writes
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    const userId = userData?.user?.id || null;
    if (!userId) {
      throw new Error('Not signed in. Please log in to save reports.');
    }

    // 1) Ensure client exists (reuse by full_name if present)
    const clientName = (formData.clientName || '').trim();
    let clientId: string | null = null;
    if (clientName) {
      // First, try to find by name only (to reuse imported clients, regardless of created_by)
      const { data: existingClients, error: findClientError } = await supabase
        .from('clients')
        .select('id')
        .eq('full_name', clientName)
        .limit(1);
      if (findClientError) throw findClientError;
      if (existingClients && existingClients.length > 0) {
        clientId = existingClients[0].id;
      } else {
        // Generate UUID for the client ID
        const newClientId = crypto.randomUUID();
        const { data: insertedClient, error: insertClientError } = await supabase
          .from('clients')
          .insert({ id: newClientId, full_name: clientName, created_by: userId })
          .select('id')
          .single();
        if (insertClientError) throw insertClientError;
        clientId = insertedClient?.id || newClientId;
      }
    }

    // 2) Create or update report (one client -> many reports)
    let reportId: string;
    if (currentReportId) {
      // Update existing report
      const { data: reportRow, error: reportErr } = await supabase
        .from('reports')
        .update({ client_name: clientName || null, client_id: clientId })
        .eq('id', currentReportId)
        .select('id')
        .single();
      if (reportErr) throw reportErr;
      reportId = reportRow?.id || currentReportId;
    } else {
      // Create new report
      const newReportId = crypto.randomUUID();
      const { data: reportRow, error: reportErr } = await supabase
        .from('reports')
        .insert({ id: newReportId, client_name: clientName || null, client_id: clientId, created_by: userId })
        .select('id')
        .single();
      if (reportErr) throw reportErr;
      reportId = reportRow?.id || newReportId;
      setCurrentReportId(reportId); // Store for future updates
    }

    // 3) JSON step tables upserts
    // Step 1 JSON
    const step1Json = {
      'Client Name': formData.clientName || '',
      'Client Address': formData.clientAddress || '',
      'Chimney Type': (formData.chimneyType || '').trim(),
      'Report Date': formData.reportDate || '',
      'House Image Link': formData.timelineCoverImage || ''
    };
    const { error: s1JsonErr } = await supabase.from('step1_json').upsert({ report_id: reportId, data: step1Json }, { onConflict: 'report_id' });
    if (s1JsonErr) throw s1JsonErr;

    // Step 3 JSON
    const step3Json = { 'Client Name': formData.clientName || '' };
    const { error: s3JsonErr } = await supabase.from('step3_json').upsert({ report_id: reportId, data: step3Json }, { onConflict: 'report_id' });
    if (s3JsonErr) throw s3JsonErr;

    // Step 5 (Invoice) JSON
    const invoice = formData.invoiceData || { rows: [] } as any;
    const step5InvoiceJson = {
      'Invoice Number': invoice.invoiceNumber || '',
      'Method of Payment': invoice.paymentMethod || '',
      'Payment No': invoice.paymentNumber || '',
      'Notes': invoice.notes || '',
      'Invoice Table': invoice.rows || []
    };
    const { error: s5InvJsonErr } = await supabase.from('step5_invoice_json').upsert({ report_id: reportId, data: step5InvoiceJson }, { onConflict: 'report_id' });
    if (s5InvJsonErr) throw s5InvJsonErr;

    // Step 5 Part 2 JSON
    const step5Part2Json = {
      'Estimate Number': formData.repairEstimateData?.estimateNumber || '',
      'Method of Payment': formData.repairEstimateData?.paymentMethod || '',
      'Payment No': formData.repairEstimateData?.paymentNumber || '',
      'Section 1 Title': (formData as any).recommendationSection1Title || 'Repair Estimate 1',
      'Section 1 Rows': formData.repairEstimateData?.rows || [],
      ...( (formData as any).showRecommendationSection2 ? {
        'Section 2 Title': (formData as any).recommendationSection2Title || 'Repair Estimate 2',
        'Section 2 Rows': ((formData as any).recommendationSection2?.rows) || []
      } : {}),
      'Notes': formData.notes || ''
    };
    const { error: s5p2JsonErr } = await supabase.from('step5_part2_json').upsert({ report_id: reportId, data: step5Part2Json }, { onConflict: 'report_id' });
    if (s5p2JsonErr) throw s5p2JsonErr;

    // Step 6 JSON (selected images with positions and text position)
    const step6Json = {
      'Selected Images': (formData.selectedImages || []).map(img => ({ 
        id: img.id, 
        url: img.url,
        positionX: img.positionX,
        positionY: img.positionY,
        width: img.width,
        height: img.height
      })),
      'Text Position': {
        x: formData.step6TextPositionX,
        y: formData.step6TextPositionY
      }
    };
    const { error: s6JsonErr } = await supabase.from('step6_json').upsert({ report_id: reportId, data: step6Json }, { onConflict: 'report_id' });
    if (s6JsonErr) throw s6JsonErr;

    // Step 7 JSON (recommendations)
    const step7Json = {
      'Recommendations': (formData.repairEstimatePages || []).map((p: any, idx: number) => ({
        index: idx + 1,
        reviewImage: p.reviewImage,
        rows: (p.repairEstimateData?.rows) || []
      }))
    };
    const { error: s7JsonErr } = await supabase.from('step7_json').upsert({ report_id: reportId, data: step7Json }, { onConflict: 'report_id' });
    if (s7JsonErr) throw s7JsonErr;

    // Step 8 JSON (inspection images)
    const inspectionImages = getUnusedImages().map((img: any) => ({ id: img.id, url: img.url }));
    const step8Json = { 
      'Inspection Images': inspectionImages,
      'Inspection Images Order': formData.inspectionImagesOrder || [],
      'Uploaded Images': formData.uploadedInspectionImages || []
    };
    const { error: s8JsonErr } = await supabase.from('step8_json').upsert({ report_id: reportId, data: step8Json }, { onConflict: 'report_id' });
    if (s8JsonErr) throw s8JsonErr;

    // Save page inclusions to database
    try {
      // Get current included pages
      const currentIncludedPages = Array.from(includedPages);
      
      // Delete all existing inclusions for this report
      await supabase.from('page_inclusions')
        .delete()
        .eq('report_id', reportId);
      
      // Insert current inclusions
      if (currentIncludedPages.length > 0) {
        const inclusions = currentIncludedPages.map(pageNumber => ({
          report_id: reportId,
          page_number: pageNumber
        }));
        const { error: inclusionsErr } = await supabase.from('page_inclusions').insert(inclusions);
        if (inclusionsErr) {
          console.error('Failed to save page inclusions:', inclusionsErr);
          // Don't throw - page inclusions are not critical for report generation
        }
      }
    } catch (error) {
      console.error('Error saving page inclusions:', error);
      // Don't throw - page inclusions are not critical for report generation
    }

    return reportId;
  };

  // Smart pagination: ensure no row is cut off
  const calculateSmartInvoicePages = () => {
    const totalRows = formData.invoiceData?.rows?.length || 0;
    if (totalRows === 0) return 1;
    
    // Use 5 rows per page to ensure no cut-offs
    const ROWS_PER_PAGE = 5;
    return Math.ceil(totalRows / ROWS_PER_PAGE);
  };

   const calculateSmartRepairEstimatePages = () => {
     // Check if summary table needs a separate page
     const SUMMARY_PAGE_THRESHOLD = 690; // Match the threshold in Step5-part2.tsx
     
     // Calculate if summary would exceed threshold
     const section1Rows = formData.repairEstimateData?.rows || [];
     const section2Rows = formData.recommendationSection2?.rows || [];
     
     // Check pagination for both summary (if Section 2 exists) and notes (always)
     const calculateTableHeight = (rows: any[]) => {
       if (rows.length === 0) return 0;
       const headerHeight = 20; // Header row height
       let totalRowHeight = 0;
       
       // Calculate height for each row based on content
       rows.forEach(row => {
         const calculateRowsNeeded = (text: string, baseLength: number = 50) => {
           const lines = text.split('\n').length;
           const wordCount = text.split(' ').length;
           const charCount = text.length;
           
           let rowsNeeded = 1;
           
           if (lines > 1) {
             rowsNeeded = Math.max(rowsNeeded, lines);
           }
           
           const charRows = Math.ceil(charCount / baseLength);
           rowsNeeded = Math.max(rowsNeeded, charRows);
           
           const wordRows = Math.ceil(wordCount / 8);
           rowsNeeded = Math.max(rowsNeeded, wordRows);
           
           return Math.min(rowsNeeded, 4);
         };
         
         const descriptionRows = calculateRowsNeeded(row.description);
         const unitRows = calculateRowsNeeded(row.unit, 10);
         const priceRows = calculateRowsNeeded(row.price, 10);
         
         const maxRowsNeeded = Math.max(descriptionRows, unitRows, priceRows);
         const rowHeight = 20 * maxRowsNeeded; // 20px per content row
         totalRowHeight += rowHeight;
       });
       
       return headerHeight + totalRowHeight;
     };
     
     const section1Top = 150;
     const section1Height = calculateTableHeight(section1Rows);
     const GAP_BETWEEN_TABLES = 80;
     
     // Calculate notes position based on what content exists
     let notesTop = 0;
     if (formData.showRecommendationSection2 && section2Rows.length > 0) {
       // Both sections exist - calculate summary and notes position
       const extraSpacing = Math.min(section1Rows.length * 2);
       const section2Top = section1Top + section1Height + GAP_BETWEEN_TABLES + extraSpacing;
       const section2Height = calculateTableHeight(section2Rows);
       const summaryTop = section2Top + section2Height + GAP_BETWEEN_TABLES + extraSpacing;
       
       const SUMMARY_TABLE_HEIGHT = 80;
       const NOTES_PAGE_THRESHOLD = 690; // Move notes to next page if it would exceed this
       notesTop = summaryTop + SUMMARY_TABLE_HEIGHT + 30;
       
       // Check if summary needs new page
       if (summaryTop > SUMMARY_PAGE_THRESHOLD || notesTop > NOTES_PAGE_THRESHOLD) {
         return 2; // Main page + summary/notes page
       }
     } else {
       // Only Section 1 exists - notes go below Section 1
       notesTop = section1Top + section1Height + GAP_BETWEEN_TABLES + 30;
     }
     
     // Check if notes need new page
     if (formData.notes && notesTop > SUMMARY_PAGE_THRESHOLD) {
       return 2; // Main page + notes page
     }
     
     return 1; // Single page
   };
  
  const totalInvoicePages = calculateSmartInvoicePages();
  const totalRepairEstimatePages = calculateSmartRepairEstimatePages();
    const totalRecommendationPages = formData.repairEstimatePages?.reduce((total, page) => {
      return total + calculateRecommendationPages(page.repairEstimateData?.rows || []);
    }, 0) || 0;
    
    // Get unused images for Page8
    const getUnusedImages = () => {
      const allImages = formData.scrapedImages || [];
      const uploadedImages = formData.uploadedInspectionImages || [];
      const usedImages = new Set<string>();
      
      // Collect all images used in recommendation pages
      formData.repairEstimatePages?.forEach(page => {
        if (page.reviewImage) {
          usedImages.add(page.reviewImage);
        }
      });
      
      // Collect all images selected in Step 6 (invoice images)
      const selectedImageIds = new Set((formData.selectedImages || []).map(img => img.id));
      
      // Collect all images excluded from Step 8
      const excludedImageIds = new Set(formData.excludedStep8Images || []);
      
      // Get filtered scraped images
      const filteredScrapedImages = allImages.filter(img => 
        !usedImages.has(img.url) && 
        !selectedImageIds.has(img.id) &&
        !excludedImageIds.has(img.id)
      );
      
      // Combine scraped and uploaded images
      const allInspectionImages = [...filteredScrapedImages, ...uploadedImages];
      
      // If custom order exists, use it; otherwise return natural order
      if (formData.inspectionImagesOrder && formData.inspectionImagesOrder.length > 0) {
        const orderMap = new Map(allInspectionImages.map(img => [img.id, img]));
        const ordered: ImageItem[] = [];
        const unordered: ImageItem[] = [];
        
        // Add images in specified order
        formData.inspectionImagesOrder.forEach(id => {
          const img = orderMap.get(id);
          if (img) {
            ordered.push(img);
            orderMap.delete(id);
          }
        });
        
        // Add any remaining images that weren't in the order
        orderMap.forEach(img => unordered.push(img));
        
        return [...ordered, ...unordered];
      }
      
      return allInspectionImages;
    };

    // Helper functions to move images up/down for easier reordering
    const moveImageUp = (imageId: string) => {
      const currentImages = getUnusedImages();
      const currentIndex = currentImages.findIndex(img => img.id === imageId);
      
      if (currentIndex <= 0) return; // Already at the top
      
      const reordered = [...currentImages];
      [reordered[currentIndex - 1], reordered[currentIndex]] = [reordered[currentIndex], reordered[currentIndex - 1]];
      
      updateFormData({
        inspectionImagesOrder: reordered.map(img => img.id)
      });
    };

    const moveImageDown = (imageId: string) => {
      const currentImages = getUnusedImages();
      const currentIndex = currentImages.findIndex(img => img.id === imageId);
      
      if (currentIndex < 0 || currentIndex >= currentImages.length - 1) return; // Already at the bottom
      
      const reordered = [...currentImages];
      [reordered[currentIndex], reordered[currentIndex + 1]] = [reordered[currentIndex + 1], reordered[currentIndex]];
      
      updateFormData({
        inspectionImagesOrder: reordered.map(img => img.id)
      });
    };

    const moveImageToTop = (imageId: string) => {
      const currentImages = getUnusedImages();
      const currentIndex = currentImages.findIndex(img => img.id === imageId);
      
      if (currentIndex <= 0) return; // Already at the top
      
      const reordered = [...currentImages];
      const [removed] = reordered.splice(currentIndex, 1);
      reordered.unshift(removed);
      
      updateFormData({
        inspectionImagesOrder: reordered.map(img => img.id)
      });
    };

    const moveImageToBottom = (imageId: string) => {
      const currentImages = getUnusedImages();
      const currentIndex = currentImages.findIndex(img => img.id === imageId);
      
      if (currentIndex < 0 || currentIndex >= currentImages.length - 1) return; // Already at the bottom
      
      const reordered = [...currentImages];
      const [removed] = reordered.splice(currentIndex, 1);
      reordered.push(removed);
      
      updateFormData({
        inspectionImagesOrder: reordered.map(img => img.id)
      });
    };

    const moveImageToPosition = (imageId: string, targetPosition: number) => {
      const currentImages = getUnusedImages();
      const currentIndex = currentImages.findIndex(img => img.id === imageId);
      
      if (currentIndex < 0) return;
      
      // Validate target position (1-based to 0-based)
      const targetIndex = Math.max(0, Math.min(targetPosition - 1, currentImages.length - 1));
      
      if (currentIndex === targetIndex) return; // Already at target position
      
      const reordered = [...currentImages];
      const [removed] = reordered.splice(currentIndex, 1);
      reordered.splice(targetIndex, 0, removed);
      
      updateFormData({
        inspectionImagesOrder: reordered.map(img => img.id)
      });
    };

    // Get excluded images for Step 8 (for display in restore section)
    const getExcludedStep8Images = () => {
      const allImages = formData.scrapedImages || [];
      const excludedImageIds = new Set(formData.excludedStep8Images || []);
      return allImages.filter(img => excludedImageIds.has(img.id));
    };

    // Calculate total image pages needed (9 images per page)
    // Return 0 if there are no images to avoid blank pages
    const getTotalImagePages = () => {
      const unusedImages = getUnusedImages();
      if (unusedImages.length === 0) return 0;
      return Math.ceil(unusedImages.length / 9);
    };
    
    // Always include at least one page for step 7 (recommendation setup), plus any additional recommendation pages
    const totalImagePages = getTotalImagePages();
    // Calculate Step 9 pages based on chimney type: 3 for both masonry and prefabricated
    const step9Pages = 3;
    // Step 10 always has 5 pages for both chimney types
    const step10Pages = 5;
    const totalPages = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + Math.max(1, totalRecommendationPages) + totalImagePages + step9Pages + step10Pages;
  
  // Initialize all pages as included by default, but preserve user exclusions when totalPages changes
  useEffect(() => {
    if (!hasInitializedPages.current) {
      // First initialization: include all pages
      const allPages = new Set<number>();
      for (let page = 1; page <= totalPages; page++) {
        allPages.add(page);
      }
      setIncludedPages(allPages);
      maxInitializedPage.current = totalPages;
      hasInitializedPages.current = true;
    } else {
      // Subsequent changes: preserve existing exclusions, only add NEW pages (beyond previous max)
      setIncludedPages(prev => {
        const updated = new Set(prev);
        // Remove pages that no longer exist
        Array.from(prev).forEach(page => {
          if (page > totalPages) {
            updated.delete(page);
          }
        });
        // Only add NEW pages (pages beyond the previously initialized max)
        // This preserves user exclusions for existing pages
        if (totalPages > maxInitializedPage.current) {
          for (let page = maxInitializedPage.current + 1; page <= totalPages; page++) {
            updated.add(page); // New pages are included by default
          }
        }
        maxInitializedPage.current = Math.max(maxInitializedPage.current, totalPages);
        return updated;
      });
    }
  }, [totalPages]);

  // Helper function to determine the logical step (1-10) based on current page
  const getLogicalStep = (pageNum: number): number => {
    if (pageNum <= 4) return pageNum; // Pages 1-4 are steps 1-4
    if (pageNum <= 4 + totalInvoicePages) return 5; // All invoice pages are step 5
    if (pageNum <= 4 + totalInvoicePages + totalRepairEstimatePages) return 5; // All repair estimate pages are also step 5
    if (pageNum === 4 + totalInvoicePages + totalRepairEstimatePages + 1) return 6; // Image page is step 6
    if (isRecommendationPage(pageNum)) return 7; // Recommendation pages are step 7
    if (isImagePage(pageNum)) return 8; // Image pages are step 8
    
    // Calculate Step 9 and Step 10 page ranges based on chimney type
    const step9Pages = 3;
    const step10Pages = 5;
    const step9Start = totalPages - step9Pages - step10Pages + 1;
    const step10Start = totalPages - step10Pages + 1;
    
    if (pageNum >= step9Start && pageNum < step10Start) return 9; // Step 9 pages
    if (pageNum >= step10Start) return 10; // Step 10 pages
    return 7; // Default to recommendation pages
  };
  
  // Helper function to check if we're on an invoice page
  const isInvoicePage = (pageNum: number): boolean => {
    return pageNum >= 5 && pageNum <= 4 + totalInvoicePages;
  };

  // Helper function to check if we're on a repair estimate page
  const isRepairEstimatePage = (pageNum: number): boolean => {
    return pageNum > 4 + totalInvoicePages && pageNum <= 4 + totalInvoicePages + totalRepairEstimatePages;
  };
  
  // Helper function to check if we're on the image page (Step 6)
  const isImagePage6 = (pageNum: number): boolean => {
    return pageNum === 4 + totalInvoicePages + totalRepairEstimatePages + 1;
  };
  
  // Helper function to check if we're on a recommendation page
  const isRecommendationPage = (pageNum: number): boolean => {
    const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
    const recommendationPageStart = imagePageNum + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    return pageNum >= recommendationPageStart && pageNum < imagePageStart;
  };
  
  // Helper function to get recommendation page index
  const getRecommendationPageIndex = (pageNum: number): number => {
    const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
    const recommendationPageStart = imagePageNum + 1;
    const relativePageNum = pageNum - recommendationPageStart; // Pages since start of recommendations
    
    // Find which recommendation this page belongs to
    let pagesAccounted = 0;
    const pages = formData.repairEstimatePages || [];
    for (let i = 0; i < pages.length; i++) {
      const rows = pages[i].repairEstimateData?.rows || [];
      const pagesNeeded = calculateRecommendationPages(rows);
      if (relativePageNum < pagesAccounted + pagesNeeded) {
        return i; // This is the recommendation index
      }
      pagesAccounted += pagesNeeded;
    }
    
    return Math.max(0, pages.length - 1); // Default to last recommendation
  };
  
  // Helper function to check if we're on the first recommendation page (setup page)
  const isRecommendationSetupPage = (pageNum: number): boolean => {
    const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
    return pageNum === imagePageNum + 1 && totalRecommendationPages === 0; // First page after images, no pages created
  };

  // Helper function to check if we're on an image page (step 8)
  const isImagePage = (pageNum: number): boolean => {
    const totalImagePages = getTotalImagePages();
    if (totalImagePages === 0) return false; // No image pages if there are no images
    const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    const step9Pages = 3;
    const step10Pages = 5;
    const step9Start = totalPages - step9Pages - step10Pages + 1;
    const imagePageEnd = step9Start - 1; // Image pages end before Step 9 starts
    return pageNum >= imagePageStart && pageNum <= imagePageEnd;
  };

  // Helper function to get image page index
  const getImagePageIndex = (pageNum: number): number => {
    const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    return pageNum - imagePageStart;
  };

  // Helper function to get the part number for Step 9
  const getStep9PartNumber = (): number => {
    if (getLogicalStep(currentPage) !== 9) return 1;
    
    const step9Pages = 3;
    const step10Pages = 5;
    const step9Start = totalPages - step9Pages - step10Pages + 1;
    
    return currentPage - step9Start + 1;
  };

  // Helper function to get the part number for Step 10
  const getStep10PartNumber = (): number => {
    if (getLogicalStep(currentPage) !== 10) return 1;
    
    const step10Pages = 5;
    const step10Start = totalPages - step10Pages + 1;
    
    return currentPage - step10Start + 1;
  };
  
  const currentLogicalStep = getLogicalStep(currentPage);

  // Mark current step as completed when page changes
  useEffect(() => {
    if (currentLogicalStep >= 1 && currentLogicalStep <= 10) {
      markStepCompleted(currentLogicalStep);
    }
  }, [currentPage, currentLogicalStep]);

  // Function to mark a step as completed
  const markStepCompleted = (stepNumber: number) => {
    setCompletedSteps(prev => new Set([...Array.from(prev), stepNumber]));
  };

  // Function to check if a step is completed
  const isStepCompleted = (stepNumber: number): boolean => {
    return completedSteps.has(stepNumber);
  };

  // Debug helper to understand page structure
  const debugPageStructure = () => {
    console.log('=== PAGE STRUCTURE DEBUG ===');
    console.log('totalInvoicePages:', totalInvoicePages);
    console.log('totalRecommendationPages:', totalRecommendationPages);
    console.log('totalImagePages:', getTotalImagePages());
    console.log('totalPages:', totalPages);
    console.log('currentPage:', currentPage);
    console.log('currentLogicalStep:', currentLogicalStep);
    console.log('chimneyType:', formData.chimneyType);
    
    const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
    const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
    const step9Pages = 3;
    const step10Pages = 5;
    const step9Start = totalPages - step9Pages - step10Pages + 1;
    const step10Start = totalPages - step10Pages + 1;
    const lastImagePage = step9Start - 1;
    
    console.log('Pages 1-4: Client Info, Company Info, Service Report, Chimney Type');
    console.log(`Pages 5-${4 + totalInvoicePages}: Invoice pages`);
    console.log(`Pages ${4 + totalInvoicePages + 1}-${4 + totalInvoicePages + totalRepairEstimatePages}: Repair estimate pages`);
    console.log(`Page ${4 + totalInvoicePages + totalRepairEstimatePages + 1}: Image selection`);
    console.log(`Pages ${recommendationPageStart}-${imagePageStart - 1}: Recommendation pages`);
    console.log(`Pages ${imagePageStart}-${lastImagePage}: Image pages`);
    console.log(`Pages ${step9Start}-${step10Start - 1}: Step 9 pages (${step9Pages} pages for ${formData.chimneyType})`);
    console.log(`Pages ${step10Start}-${totalPages}: Step 10 pages (${step10Pages} pages)`);
    console.log('isImagePage(currentPage):', isImagePage(currentPage));
    console.log('getLogicalStep(currentPage):', getLogicalStep(currentPage));
    console.log('================================');
  };

  // Function to navigate to a specific step
  const navigateToStep = (targetStep: number) => {
    if (targetStep < 1 || targetStep > 10) return;
    
    // Mark the target step as completed when navigating to it
    markStepCompleted(targetStep);
    
    // Calculate Step 9 and Step 10 page ranges based on chimney type
    const step9Pages = 3;
    const step10Pages = 5;
    const step9Start = totalPages - step9Pages - step10Pages + 1;
    const step10Start = totalPages - step10Pages + 1;
    
    // Special handling for step 9 - go to first Step 9 page
    if (targetStep === 9) {
      setCurrentPage(step9Start);
      return;
    }
    
    // Special handling for step 10 - go to first Step 10 page
    if (targetStep === 10) {
      setCurrentPage(step10Start);
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
    // Persist step-wise labeled snapshot (if applicable), and latest snapshot
    try {
      const logicalStep = getLogicalStep(currentPage);
      const stepSnapshot: any = buildStepSnapshot(logicalStep);
      if (stepSnapshot) {
        const now = new Date().toISOString();
        const keyOverride = (stepSnapshot as any).__key;
        const dataToStore = (stepSnapshot as any).data ? (stepSnapshot as any).data : stepSnapshot;
        const storageKey = keyOverride || `sumoquote_v2_step_${logicalStep}`;
        localStorage.setItem(
          storageKey,
          JSON.stringify({ step: logicalStep, data: dataToStore, savedAt: now })
        );
        // Maintain a lightweight index of saved steps
        const existingIndexRaw = localStorage.getItem('sumoquote_v2_steps_index');
        const existingIndex: number[] = existingIndexRaw ? JSON.parse(existingIndexRaw) : [];
        if (!existingIndex.includes(logicalStep)) {
          localStorage.setItem('sumoquote_v2_steps_index', JSON.stringify([...existingIndex, logicalStep].sort((a, b) => a - b)));
        }
      }
    } catch (err) {
      // Ignore storage errors (e.g., quota exceeded, private mode)
    }

    // Mark current step as completed when moving to next page
    markStepCompleted(currentLogicalStep);
    
    // Debug page structure when navigating
    if (currentLogicalStep >= 7) {
      debugPageStructure();
    }
    
    if (currentLogicalStep === 7) {
      // Check if current recommendation has multiple pages (table + image)
      const currentPage = getCurrentRecommendationPage();
      const currentRows = currentPage?.repairEstimateData?.rows || [];
      const currentRecommendationTotalPages = calculateRecommendationPages(currentRows);
      
      // If we're on page 1 of a multi-page recommendation, go to page 2 (image page)
      if (currentRecommendationTotalPages > 1 && currentRecommendationSubPage === 1) {
        // Move to page 2 (image page) of same recommendation
        setCurrentRecommendationSubPage(2);
      } else {
        // We're on page 2 or single page recommendation, move to next recommendation or next step
        setCurrentRecommendationSubPage(1); // Reset sub-page for next recommendation
        
        if (currentRecommendationPageIndex < (formData.repairEstimatePages?.length || 0) - 1) {
          // Move to next recommendation page
          setCurrentRecommendationPageIndex(currentRecommendationPageIndex + 1);
          setCurrentRecommendationSubPage(1); // Reset to page 1 of new recommendation
        } else {
          // If we're on the last recommendation page, go to first image page
          const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
          const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
          setCurrentPage(imagePageStart);
          setCurrentRecommendationPageIndex(0); // Reset for future use
        }
      }
    } else if (isImagePage(currentPage)) {
      // If we're on image pages, navigate through image pages
      const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
      const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
      const step9Pages = 3;
      const step10Pages = 5;
      const step9Start = totalPages - step9Pages - step10Pages + 1;
      const lastImagePage = step9Start - 1;
      
      if (currentPage < lastImagePage) {
        setCurrentPage(currentPage + 1);
      } else {
        // If we're on the last image page, go to first Step 9 page
        setCurrentPage(step9Start);
      }
    } else if (getLogicalStep(currentPage) === 9) {
      // If we're on Step 9 pages, navigate through them
      const step9Pages = 3;
      const step10Pages = 5;
      const step9Start = totalPages - step9Pages - step10Pages + 1;
      const step10Start = totalPages - step10Pages + 1;
      
      if (currentPage < step10Start - 1) {
        setCurrentPage(currentPage + 1);
      } else {
        // If we're on the last Step 9 page, go to first Step 10 page
        setCurrentPage(step10Start);
      }
    } else if (getLogicalStep(currentPage) === 10) {
      // If we're on Step 10 pages, navigate through them
      const step10Pages = 5;
      const step10Start = totalPages - step10Pages + 1;
      
      if (currentPage < totalPages) {
        setCurrentPage(currentPage + 1);
      }
    } else if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (isImagePage(currentPage)) {
      // If we're on image pages, navigate through image pages
      const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
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
      // Check if current recommendation has multiple pages (table + image)
      const currentPage = getCurrentRecommendationPage();
      const currentRows = currentPage?.repairEstimateData?.rows || [];
      const currentRecommendationTotalPages = calculateRecommendationPages(currentRows);
      
      // If we're on page 2 of a multi-page recommendation, go to page 1 (table page)
      if (currentRecommendationTotalPages > 1 && currentRecommendationSubPage === 2) {
        // Move to page 1 (table page) of same recommendation
        setCurrentRecommendationSubPage(1);
      } else {
        // We're on page 1, move to previous recommendation or previous step
        setCurrentRecommendationSubPage(1); // Reset sub-page for previous recommendation
        
        if (currentRecommendationPageIndex > 0) {
          // Move to previous recommendation page
          setCurrentRecommendationPageIndex(currentRecommendationPageIndex - 1);
          setCurrentRecommendationSubPage(1); // Reset to page 1 of new recommendation
        } else {
          // If we're on the first recommendation page, go to image page
          const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
          setCurrentPage(imagePageNum);
          setCurrentRecommendationPageIndex(0);
        }
      }
    } else if (getLogicalStep(currentPage) === 10) {
      // If we're on Step 10 pages, navigate through them
      const step10Pages = 5;
      const step10Start = totalPages - step10Pages + 1;
      
      if (currentPage > step10Start) {
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the first Step 10 page, go to last Step 9 page
        const step9Pages = 3;
        const step9Start = totalPages - step9Pages - step10Pages + 1;
        setCurrentPage(step9Start + step9Pages - 1);
      }
    } else if (getLogicalStep(currentPage) === 9) {
      // If we're on Step 9 pages, navigate through them
      const step9Pages = 3;
      const step10Pages = 5;
      const step9Start = totalPages - step9Pages - step10Pages + 1;
      
      if (currentPage > step9Start) {
        setCurrentPage(currentPage - 1);
      } else {
        // If we're on the first Step 9 page, go to last image page
        const recommendationPageStart = 4 + totalInvoicePages + totalRepairEstimatePages + 1 + 1;
        const imagePageStart = recommendationPageStart + Math.max(1, totalRecommendationPages);
        const lastImagePage = step9Start - 1;
        setCurrentPage(lastImagePage);
      }
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
    
    // Generate only included pages
    let pageCount = 0;
    const totalIncludedPages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => isPageIncluded(p)).length;
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      // Check if this page should be included in PDF
      if (!isPageIncluded(pageNum)) {
        console.log('Skipping PDF Page:', pageNum, '(excluded by user)');
        continue;
      }
      
      console.log('Generating PDF Page:', pageNum);
      const pageDisplayIndex = pageCount + 1;
      const pageCanvas = await generatePageCanvas(pageNum, pageDisplayIndex, totalIncludedPages);
      const isStep6ImagePage = getLogicalStep(pageNum) === 6;
      
      // For Step 6 (Invoice Images) pages, avoid compression and keep PNG
      let pageImgData: string;
      if (isStep6ImagePage) {
        // Use original canvas at full fidelity in PNG (no quality loss)
        pageImgData = pageCanvas.toDataURL('image/png');
      } else if (pageNum === 2 || pageNum === 3 || getLogicalStep(pageNum) === 9 || getLogicalStep(pageNum) === 10) {
        // Keep Page 3 as PNG to preserve text clarity
        pageImgData = pageCanvas.toDataURL('image/png');
      } else {
        // Default path: scale and compress as JPEG
        const optimizedCanvas = createOptimizedCanvas(pageCanvas, 842, 1190);
        const compressionQuality = pageNum === 4 ? 0.9 : 0.78;
        pageImgData = await compressImage(optimizedCanvas, 'JPEG', compressionQuality);
      }
      
      if (pageCount > 0) {
        pdf.addPage();
      }
      pageCount++;
      
      const imgType = (isStep6ImagePage || pageNum === 2 || pageNum === 3 || getLogicalStep(pageNum) === 7 || getLogicalStep(pageNum) === 9 || getLogicalStep(pageNum) === 10) ? 'PNG' : 'JPEG';
      if (isMobileDevice) {
        pdf.addImage(pageImgData, imgType, 0, 0, imgWidth, imgHeight, '', 'FAST');
      } else {
        pdf.addImage(pageImgData, imgType, 0, 0, imgWidth, imgHeight);
      }

      // Header: centered page number at top
      try {
        const headerY = imgHeight - 4; // mm from top
        const headerText = `Page ${pageDisplayIndex} of ${totalIncludedPages}`;
        // page number text
        // Medium gray (approx #6B7280)
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(10);
        // center align
        if (typeof (pdf as any).text === 'function') {
          (pdf as any).text(headerText, imgWidth / 2, headerY, { align: 'center' });
        } else {
          // fallback: approximate center by measuring width
          const textWidth = (pdf as any).getTextWidth ? (pdf as any).getTextWidth(headerText) : 0;
          const startX = (imgWidth - textWidth) / 2;
          (pdf as any).text(headerText, startX, headerY);
        }
      } catch {}
    }
  };

  // Function to generate canvas for specific page
  const generatePageCanvas = async (pageNumber: number, displayIndex?: number, totalIncluded?: number) => {
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
      React.createElement(Step1, { formData, updateFormData, isPDF: true, timelineCoverImage: formData.timelineCoverImage }) :
      pageNumber === 2 ?
      React.createElement(Step2, { formData, updateFormData, isPDF: true }) :
      pageNumber === 3 ?
      React.createElement(Step3, { formData, updateFormData, isPDF: true }) :
      pageNumber === 4 ?
      React.createElement(Step4, { chimneyType: formData.chimneyType, isPDF: true }) :
      pageNumber >= 5 && pageNumber <= 4 + totalInvoicePages ?
      React.createElement(Step5, { isPDF: true, invoiceData: formData.invoiceData, currentInvoicePage: pageNumber - 4 }) :
      pageNumber > 4 + totalInvoicePages && pageNumber <= 4 + totalInvoicePages + totalRepairEstimatePages ?
      React.createElement(Step5Part2, { 
        isPDF: true, 
        repairEstimateData: formData.repairEstimateData, 
        section1: { title: formData.recommendationSection1Title || 'Repair Estimate#1', rows: formData.repairEstimateData?.rows || [] },
        section2: formData.showRecommendationSection2 ? { title: formData.recommendationSection2Title || 'Repair Estimate#2', rows: formData.recommendationSection2?.rows || [] } : undefined,
        currentEstimatePage: pageNumber - 4 - totalInvoicePages,
        notes: formData.notes,
        dataSourceUrl: formData.dataSourceUrl
      }) :
      pageNumber === 4 + totalInvoicePages + totalRepairEstimatePages + 1 ?
      React.createElement(Step6, { 
        isPDF: true, 
        scrapedImages: formData.scrapedImages || [], 
        selectedImages: formData.selectedImages || [],
        textPositionX: formData.step6TextPositionX,
        textPositionY: formData.step6TextPositionY
      }) :
      isRecommendationPage(pageNumber) ?
      React.createElement(Step7, { 
        isPDF: true, 
        scrapedImages: formData.scrapedImages || [], 
        selectedImages: formData.selectedImages || [],
        repairEstimateData: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.repairEstimateData || { manualEntry: false, rows: [] },
        reviewImage: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.reviewImage || '',
        customRecommendation: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.customRecommendation || '',
        imagePositionX: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.imagePositionX,
        imagePositionY: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.imagePositionY,
        imageWidth: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.imageWidth,
        imageHeight: formData.repairEstimatePages?.[getRecommendationPageIndex(pageNumber)]?.imageHeight,
        currentPage: (() => {
          const pageIndex = getRecommendationPageIndex(pageNumber);
          const page = formData.repairEstimatePages?.[pageIndex];
          if (!page) return 1;
          const rows = page.repairEstimateData?.rows || [];
          
          // Calculate which sub-page this should be based on the actual page number
          if (rows.length <= 1) return 1; // Single page recommendation
          
          // Calculate where this recommendation starts
          const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
          const recommendationPageStart = imagePageNum + 1;
          
          // Count how many pages previous recommendations have used
          let pagesUsedByPreviousRecommendations = 0;
          for (let i = 0; i < pageIndex; i++) {
            const prevPage = formData.repairEstimatePages?.[i];
            if (prevPage) {
              const prevRows = prevPage.repairEstimateData?.rows || [];
              pagesUsedByPreviousRecommendations += calculateRecommendationPages(prevRows);
            }
          }
          
          // Calculate the start page of this specific recommendation
          const thisRecommendationStartPage = recommendationPageStart + pagesUsedByPreviousRecommendations;
          
          // Calculate which page within this recommendation
          const relativePageInRecommendation = pageNumber - thisRecommendationStartPage + 1;
          
          return relativePageInRecommendation;
        })(),
        totalPages: (() => {
          const pageIndex = getRecommendationPageIndex(pageNumber);
          const page = formData.repairEstimatePages?.[pageIndex];
          if (!page) return 1;
          const rows = page.repairEstimateData?.rows || [];
          return calculateRecommendationPages(rows);
        })()
      }) :
      isImagePage(pageNumber) && getTotalImagePages() > 0 ?
      React.createElement(Step8, { 
        isPDF: true, 
        unusedImages: getUnusedImages(),
        currentPage: getImagePageIndex(pageNumber) + 1,
        totalPages: getTotalImagePages(),
        selectedImages: formData.selectedImages || []
      }) :
      // Step 9 pages (3 pages for both chimney types)
      getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 7) ?
      React.createElement(
        Step9Part1,
        {
          chimneyType:
            (formData.chimneyType?.toLowerCase() === 'prefabricated'
              ? 'prefabricated'
              : 'masonry')
        }
      ) :
      getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 6) ?
      React.createElement(Step9Part2, {
        chimneyType:
          (formData.chimneyType?.toLowerCase() === 'prefabricated'
            ? 'prefabricated'
            : 'masonry')
      }) :
      getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 5) ?
      React.createElement(Step9Part3, {
        chimneyType:
          (formData.chimneyType?.toLowerCase() === 'prefabricated'
            ? 'prefabricated'
            : 'masonry')
      }) :
      // Step 10 pages (5 pages for both chimney types)
      getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 4) ?
      React.createElement(Step10Part1) :
      getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 3) ?
      React.createElement(Step10Part2, { chimneyType: formData.chimneyType }) :
      getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 2) ?
      React.createElement(Step10Part3, { chimneyType: formData.chimneyType }) :
      getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 1) ?
      React.createElement(Step10Part4, { chimneyType: formData.chimneyType }) :
      getLogicalStep(pageNumber) === 10 && pageNumber === totalPages ?
      React.createElement(Step10Part5) :
      React.createElement(Step5) ;
    
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
      
      console.log('PDF Generation Debug - Step 3:');
      console.log('Overlap position:', overlapElement?.style.left, overlapElement?.style.top);
      console.log('Title position:', titleElement?.style.left, titleElement?.style.top);
      console.log('Client name position:', clientNameElement?.style.left, clientNameElement?.style.top);
      console.log('Email position:', emailElement?.style.left, emailElement?.style.top);
    }
    
    // No in-canvas badge for PDF; footer added via jsPDF

    // Use html2canvas to capture the page with optimized settings
    const { default: html2canvas } = await import('html2canvas');
    // Compute per-page render scale
    const isStep1 = pageNumber === 1;
    const isInvoicePages = pageNumber >= 5 && pageNumber <= (4 + totalInvoicePages);
    const isRepairEstimatePages = pageNumber > (4 + totalInvoicePages) && pageNumber <= (4 + totalInvoicePages + totalRepairEstimatePages);
    const isStep7Page = isRecommendationPage(pageNumber);
    const isStep2 = pageNumber === 2;
    const isStep3 = pageNumber === 3;
    const isStep9Part1 = getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 7);
    const isStep9Part2 = getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 6);
    const isStep9Part3 = getLogicalStep(pageNumber) === 9 && pageNumber === (totalPages - 5);
    const isStep10Part3 = getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 2);
    const isStep10Part4 = getLogicalStep(pageNumber) === 10 && pageNumber === (totalPages - 1);
    const isStep10Part5 = getLogicalStep(pageNumber) === 10 && pageNumber === totalPages;

    const renderScale = (isStep1 || isInvoicePages || isRepairEstimatePages)
      ? 2
      : ((isStep2 || isStep3 || isStep9Part1 || isStep9Part2 || isStep9Part3 || isStep10Part3 || isStep10Part4 || isStep10Part5)
        ? 3
        : (isStep7Page ? 3 : 2)); // Step 7 at 3x, default 2x

    const canvas = await html2canvas(tempContainer, {
      scale: renderScale,
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
      {/* Generation/Upload Overlay */}
      {(isGenerating || isEditLoading) && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg px-6 py-5 border border-gray-200 max-w-sm w-full mx-4 text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full border-4 border-[#F0D8D6] border-t-[#722420] animate-spin" />
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              {generationStatus === 'editing' ? 'Loading report…' : generationStatus === 'saving' ? 'Saving data…' : generationStatus === 'uploading' ? 'Uploading report…' : 'Generating PDF…'}
            </h4>
            <p className="text-xs text-gray-500">
              {generationStatus === 'editing' ? 'Preparing your report for editing.' : generationStatus === 'saving' ? 'Writing your report data to the database.' : generationStatus === 'uploading' ? 'Please wait while we upload your report.' : 'Rendering pages into a high-quality PDF.'}
            </p>
          </div>
        </div>
      )}
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
              <span className="ml-2 text-sm sm:text-base font-medium">Report Generation</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {currentStep === 'scrape' ? (
        <div className="card p-4 sm:p-8">
          <DataScraper onDataExtracted={handleDataExtracted} setCurrentStep={setCurrentStep} setFormData={(data) => setFormData({ ...data, notes: 'This quote is good for 30 days from date of service. Deposits for scheduled future service is non-refundable.' })} />
        </div>
      ) : (
        <>
          {/* Form Step Progress Indicator */}
          <div className="mb-6 px-2">
            {/* First Row - Steps 1-5 */}
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(1) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(1)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(1) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(1) ? '✓' : '1'}
                </div>
                <span className="ml-2 text-sm font-medium">Client Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(2) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(2)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(2) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(2) ? '✓' : '2'}
                </div>
                <span className="ml-2 text-sm font-medium">Company Info</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(3) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(3)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(3) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(3) ? '✓' : '3'}
                </div>
                <span className="ml-2 text-sm font-medium">Service Report</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(4) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(4)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(4) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(4) ? '✓' : '4'}
                </div>
                <span className="ml-2 text-sm font-medium">Chimney Type</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(5) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(5)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(5) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(5) ? '✓' : '5'}
                </div>
                <span className="ml-2 text-sm font-medium">Invoice & Estimate</span>
              </div>
            </div>
            
            {/* Second Row - Steps 6-10 */}
            <div className="flex items-center justify-center space-x-4">
              <div 
                className={`flex items-center cursor-pointer ${isStepCompleted(6) ? 'text-[#722420]' : 'text-gray-400'}`}
                onClick={() => navigateToStep(6)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isStepCompleted(6) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isStepCompleted(6) ? '✓' : '6'}
                </div>
                <span className="ml-2 text-sm font-medium">Invoice Images</span>
              </div>
              <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${isStepCompleted(7) ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(7)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   isStepCompleted(7) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   {isStepCompleted(7) ? '✓' : '7'}
                 </div>
                 <span className="ml-2 text-sm font-medium">Repair Rec.</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${isStepCompleted(8) ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(8)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   isStepCompleted(8) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   {isStepCompleted(8) ? '✓' : '8'}
                 </div>
                 <span className="ml-2 text-sm font-medium">Inspection Images</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${isStepCompleted(9) ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(9)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   isStepCompleted(9) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   {isStepCompleted(9) ? '✓' : '9'}
                 </div>
                 <span className="ml-2 text-sm font-medium">Chimney Type Understanding</span>
               </div>
               <div className="w-12 h-1 bg-gray-200"></div>
               <div 
                 className={`flex items-center cursor-pointer ${isStepCompleted(10) ? 'text-[#722420]' : 'text-gray-400'}`}
                 onClick={() => navigateToStep(10)}
               >
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                   isStepCompleted(10) ? 'bg-[#722420] text-white' : 'bg-gray-200 text-gray-600'
                 }`}>
                   {isStepCompleted(10) ? '✓' : '10'}
                 </div>
                 <span className="ml-2 text-sm font-medium">Club & Terms</span>
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Input Fields Section */}
          <div className="card p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                  {currentLogicalStep === 1 ? 'Step 1 - Manual Entry' : 
                   currentLogicalStep === 2 ? 'Step 2 - Static Content' : 
                   currentLogicalStep === 3 ? 'Step 3 - Service Report' : 
                   currentLogicalStep === 4 ? 'Step 4 - Chimney Type' : 
                   currentLogicalStep === 5 ? `Step 5 - Invoice & Estimate${isInvoicePage(currentPage) ? (totalInvoicePages > 1 ? ` (Invoice ${currentPage - 4}/${totalInvoicePages})` : ' (Invoice)') : isRepairEstimatePage(currentPage) ? (totalRepairEstimatePages > 1 ? ` (Estimate ${currentPage - 4 - totalInvoicePages}/${totalRepairEstimatePages})` : ' (Estimate)') : ''}` : 
                   currentLogicalStep === 6 ? 'Step 6 - Project Images' :
                   currentLogicalStep === 7 ? 'Step 7 - Repair Estimate' :
                   currentLogicalStep === 8 ? 'Step 8 - Inspection Images' :
                  currentLogicalStep === 9 ? `Step 9 - Documentation (Part ${getStep9PartNumber()})` :
                  currentLogicalStep === 10 ? `Step 10 - Final Steps (Part ${getStep10PartNumber()})` :
                  'Unknown Step'}
                </h3>
              </div>
              <button
                onClick={handleBackToScrape}
                className="text-[#722420] hover:text-[#5a1d1a] text-sm font-medium"
              >
                ← Back to Data Extraction
              </button>
            </div>
            
            {/* Final Report Generation Indicator (now on Step 5) */}
           
            
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
                      <option value="none">None</option>
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
                  <h4 className="text-lg font-semibold text-black mb-2">Step 2 - Static Content</h4>
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
                  <h4 className="text-lg font-semibold text-black mb-2">Step 4 - Static Content</h4>
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
                        notes: formData.invoiceData?.notes || '',
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
                        notes: formData.invoiceData?.notes || '',
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
                    <option value="Billing">Billing</option>
                    <option value="Waived Off">Waived Off</option>
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
                        notes: formData.invoiceData?.notes || '',
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
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowInvoiceQuickAdd(!showInvoiceQuickAdd)}
                        className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                      >
                        + Add Item
                      </button>
                      {showInvoiceQuickAdd && (
                        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                          <div className="py-2">
                            <button
                              type="button"
                              onClick={() => {
                                const newRow = {
                                  id: Date.now().toString(),
                                  description: 'NFPA Level 1 Chimney Inspection (discounted)',
                                  unit: '1',
                                  price: '99.00'
                                };
                                updateFormData({ 
                                  invoiceData: { 
                                    invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                    paymentMethod: formData.invoiceData?.paymentMethod || '',
                                    paymentNumber: formData.invoiceData?.paymentNumber || '',
                                    notes: formData.invoiceData?.notes || '',
                                    rows: [...(formData.invoiceData?.rows || []), newRow]
                                  } 
                                });
                                setShowInvoiceQuickAdd(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Add NFPA Level 1 Chimney Inspection (discounted)($99)
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newRow = {
                                  id: Date.now().toString(),
                                  description: 'NFPA Level 1 Chimney Inspection and Sweep (discounted)',
                                  unit: '1',
                                  price: '149.00'
                                };
                                updateFormData({ 
                                  invoiceData: { 
                                    invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                    paymentMethod: formData.invoiceData?.paymentMethod || '',
                                    paymentNumber: formData.invoiceData?.paymentNumber || '',
                                    notes: formData.invoiceData?.notes || '',
                                    rows: [...(formData.invoiceData?.rows || []), newRow]
                                  } 
                                });
                                setShowInvoiceQuickAdd(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Add NFPA Level 1 Chimney Inspection and Sweep (discounted)($149)
                            </button>
                            <div className="border-t my-1" />
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
                                    notes: formData.invoiceData?.notes || '',
                                    rows: [...(formData.invoiceData?.rows || []), newRow]
                                  } 
                                });
                                setShowInvoiceQuickAdd(false);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Add Blank Item
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(formData.invoiceData?.rows || []).map((row, index) => {
                      // Function to add a new row after the current row
                      const handleAddNewRow = () => {
                        const newRow = {
                          id: Date.now().toString(),
                          description: '',
                          unit: '',
                          price: ''
                        };
                        const currentRows = formData.invoiceData?.rows || [];
                        const currentIndex = currentRows.findIndex(r => r.id === row.id);
                        const updatedRows = [
                          ...currentRows.slice(0, currentIndex + 1),
                          newRow,
                          ...currentRows.slice(currentIndex + 1)
                        ];
                        
                        updateFormData({ 
                          invoiceData: { 
                            invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                            paymentMethod: formData.invoiceData?.paymentMethod || '',
                            paymentNumber: formData.invoiceData?.paymentNumber || '',
                            notes: formData.invoiceData?.notes || '',
                            rows: updatedRows
                          } 
                        });
                        
                        // Store the new row ID to focus it after render
                        newRowDescriptionRef.current = newRow.id;
                        
                        // Focus the new row's description field after a short delay
                        setTimeout(() => {
                          const newRowInput = document.querySelector(`[data-row-id="${newRow.id}"]`) as HTMLInputElement | HTMLTextAreaElement;
                          if (newRowInput) {
                            newRowInput.focus();
                            newRowDescriptionRef.current = null;
                          }
                        }, 50);
                      };
                      
                      return (
                        <div key={row.id} className="flex space-x-2 p-2 border border-gray-200 rounded-md">
                        <AutocompleteInput
                          value={row.description}
                          onChange={(value) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, description: value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                notes: formData.invoiceData?.notes || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          onSelectRow={(selectedRow: SheetRow) => {
                            // When a row is selected from description field, populate all three fields
                            const priceValue = selectedRow.price || '';
                            // Remove $ sign and store as plain number string (e.g., "400" not "$400")
                            const priceWithoutDollar = priceValue.replace(/^\$/, '').trim();
                            
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { 
                                ...r, 
                                description: selectedRow.description,
                                unit: selectedRow.unit || '1', // Default to "1" if not provided
                                price: priceWithoutDollar // Store without $ sign
                              } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                notes: formData.invoiceData?.notes || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          dataRowId={row.id}
                          placeholder="Description"
                          field="description"
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                          sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                          sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Sheet1!A:E'}
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          value={row.unit}
                          data-row-id={row.id}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, unit: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                notes: formData.invoiceData?.notes || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewRow();
                            }
                          }}
                          className="w-10 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                        />
                        <input
                          type="text"
                          placeholder="Price"
                          value={row.price}
                          data-row-id={row.id}
                          onChange={(e) => {
                            const updatedRows = (formData.invoiceData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, price: e.target.value } : r
                            );
                            updateFormData({ 
                              invoiceData: { 
                                invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                                paymentMethod: formData.invoiceData?.paymentMethod || '',
                                paymentNumber: formData.invoiceData?.paymentNumber || '',
                                notes: formData.invoiceData?.notes || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddNewRow();
                            }
                          }}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
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
                                notes: formData.invoiceData?.notes || '',
                                rows: updatedRows
                              }
                            });
                          }}
                          className="px-2 py-1  text-red-600 hover:text-red-800 text-m flex items-center justify-center"
                          title="Delete item"
                        >
                          <svg 
                            width="17" 
                            height="17" 
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
                      );
                    })}
                    {(!formData.invoiceData?.rows || formData.invoiceData.rows.length === 0) && (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No items added yet. Click "Add Item" to add invoice items.
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes Section */}
                <div className="pt-4 border-t border-gray-200">
                  <label htmlFor="invoiceNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="invoiceNotes"
                    value={formData.invoiceData?.notes || ''}
                    onChange={(e) => updateFormData({ 
                      invoiceData: { 
                        invoiceNumber: formData.invoiceData?.invoiceNumber || '',
                        paymentMethod: formData.invoiceData?.paymentMethod || '',
                        paymentNumber: formData.invoiceData?.paymentNumber || '',
                        notes: e.target.value,
                        rows: formData.invoiceData?.rows || []
                      } 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    rows={3}
                    placeholder="Enter notes for the invoice..."
                  />
                </div>
              </div>
            ) : isRepairEstimatePage(currentPage) ? (
              <div className="space-y-4">
                {/* Repair Estimate Items */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Repair Estimate Section 1
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
                          repairEstimateData: { 
                            estimateNumber: '',
                            paymentMethod: '',
                            paymentNumber: '',
                            rows: [...(formData.repairEstimateData?.rows || []), newRow]
                          } 
                        });
                      }}
                      className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Title for Repair Estimate#1"
                      value={formData.recommendationSection1Title || 'Repair Estimate#1'}
                      onChange={(e) => updateFormData({ recommendationSection1Title: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                    />
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(formData.repairEstimateData?.rows || []).map((row, index) => {
                      // Function to add a new row after the current row
                      const handleAddNewRow = () => {
                        const newRow = {
                          id: Date.now().toString(),
                          description: '',
                          unit: '',
                          price: ''
                        };
                        const currentRows = formData.repairEstimateData?.rows || [];
                        const currentIndex = currentRows.findIndex(r => r.id === row.id);
                        const updatedRows = [
                          ...currentRows.slice(0, currentIndex + 1),
                          newRow,
                          ...currentRows.slice(currentIndex + 1)
                        ];
                        
                        updateFormData({ 
                          repairEstimateData: { 
                            estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                            paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                            paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                            rows: updatedRows
                          } 
                        });
                        
                        // Store the new row ID to focus it after render
                        newRowDescriptionRef.current = newRow.id;
                        
                        // Focus the new row's description field after a short delay
                        setTimeout(() => {
                          const newRowInput = document.querySelector(`[data-row-id="${newRow.id}"]`) as HTMLInputElement | HTMLTextAreaElement;
                          if (newRowInput) {
                            newRowInput.focus();
                            newRowDescriptionRef.current = null;
                          }
                        }, 50);
                      };
                      
                      return (
                      <div key={row.id} className="flex items-center gap-1 p-2 border border-gray-200 rounded-md w-full">
                        <AutocompleteInput
                          value={row.description}
                          onChange={(value) => {
                            const updatedRows = (formData.repairEstimateData?.rows || []).map(r => 
                              r.id === row.id ? { ...r, description: value } : r
                            );
                            updateFormData({ 
                              repairEstimateData: { 
                                estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                                paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                                paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          onSelectRow={(selectedRow: SheetRow) => {
                            // When a row is selected from description field, populate all three fields
                            const priceValue = selectedRow.price || '';
                            // Remove $ sign and store as plain number string (e.g., "400" not "$400")
                            const priceWithoutDollar = priceValue.replace(/^\$/, '').trim();
                            
                            const updatedRows = (formData.repairEstimateData?.rows || []).map(r => 
                              r.id === row.id ? { 
                                ...r, 
                                description: selectedRow.description,
                                unit: selectedRow.unit || '1', // Default to "1" if not provided
                                price: priceWithoutDollar // Store without $ sign
                              } : r
                            );
                            updateFormData({ 
                              repairEstimateData: { 
                                estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                                paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                                paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          dataRowId={row.id}
                          placeholder="Description"
                          field="description"
                          className=" w-full min-w-0 mr-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                          sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                          sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Sheet1!A:E'}
                        />
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <AutocompleteInput
                            value={row.unit}
                            onChange={(value) => {
                              const updatedRows = (formData.repairEstimateData?.rows || []).map(r => 
                                r.id === row.id ? { ...r, unit: value } : r
                              );
                              updateFormData({ 
                                repairEstimateData: { 
                                  estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                                  paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                                  paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                                  rows: updatedRows
                                } 
                              });
                            }}
                            onEnterKey={handleAddNewRow}
                            dataRowId={row.id}
                            placeholder="Unit"
                            field="unit"
                            className="w-12 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                            sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                            sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Sheet1!A:E'}
                          />
                          <input
                            type="text"
                            value={row.price}
                            data-row-id={row.id}
                            onChange={(e) => {
                              // Remove $ sign if user types it
                              const priceWithoutDollar = e.target.value.replace(/^\$/, '').trim();
                              const updatedRows = (formData.repairEstimateData?.rows || []).map(r => 
                                r.id === row.id ? { ...r, price: priceWithoutDollar } : r
                              );
                              updateFormData({ 
                                repairEstimateData: { 
                                  estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                                  paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                                  paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                                  rows: updatedRows
                                } 
                              });
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddNewRow();
                              }
                            }}
                            placeholder="Price"
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedRows = (formData.repairEstimateData?.rows || []).filter(r => r.id !== row.id);
                            updateFormData({ 
                              repairEstimateData: { 
                                estimateNumber: formData.repairEstimateData?.estimateNumber || '',
                                paymentMethod: formData.repairEstimateData?.paymentMethod || '',
                                paymentNumber: formData.repairEstimateData?.paymentNumber || '',
                                rows: updatedRows
                              } 
                            });
                          }}
                          className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                          title="Delete row"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2 Controls */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-700">Repair Estimate Section 2</div>
                    {!formData.showRecommendationSection2 ? (
                      <button
                        type="button"
                        onClick={() => updateFormData({ showRecommendationSection2: true, recommendationSection2: { rows: [] } })}
                        className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                      >
                        + Add Repair Estimate Section 2
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateFormData({ showRecommendationSection2: false, recommendationSection2: { rows: [] }, recommendationSection2Title: '' })}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                      >
                        Remove Repair Estimate Section 2
                      </button>
                    )}
                  </div>

                  {formData.showRecommendationSection2 && (
                    <div className="mt-3 space-y-3">
                      <input
                        type="text"
                        placeholder="Title for Repair Estimate#2"
                        value={formData.recommendationSection2Title !== undefined ? formData.recommendationSection2Title : 'Repair Estimate#2'}
                        onChange={(e) => updateFormData({ recommendationSection2Title: e.target.value })}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-700">Items (Repair Estimate Section 2)</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newRow = { id: Date.now().toString(), description: '', unit: '', price: '' };
                            const existing = formData.recommendationSection2?.rows || [];
                            updateFormData({ recommendationSection2: { rows: [...existing, newRow] } });
                          }}
                          className="px-3 py-1 bg-[#722420] text-white rounded-md hover:bg-[#5a1d1a] text-sm"
                        >
                          + Add Item (Section 2)
                        </button>
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {(formData.recommendationSection2?.rows || []).map((row) => {
                          // Function to add a new row after the current row for Section 2
                          const handleAddNewRowSection2 = () => {
                            const newRow = {
                              id: Date.now().toString(),
                              description: '',
                              unit: '',
                              price: ''
                            };
                            const currentRows = formData.recommendationSection2?.rows || [];
                            const currentIndex = currentRows.findIndex(r => r.id === row.id);
                            const updatedRows = [
                              ...currentRows.slice(0, currentIndex + 1),
                              newRow,
                              ...currentRows.slice(currentIndex + 1)
                            ];
                            
                            updateFormData({ recommendationSection2: { rows: updatedRows } });
                            
                            // Store the new row ID to focus it after render
                            newRowDescriptionRef.current = newRow.id;
                            
                            // Focus the new row's description field after a short delay
                            setTimeout(() => {
                              const newRowInput = document.querySelector(`[data-row-id="${newRow.id}"]`) as HTMLInputElement | HTMLTextAreaElement;
                              if (newRowInput) {
                                newRowInput.focus();
                                newRowDescriptionRef.current = null;
                              }
                            }, 50);
                          };
                          
                          return (
                          <div key={row.id} className="flex items-center gap-1 p-2 border border-gray-200 rounded-md w-full">
                            <AutocompleteInput
                              value={row.description}
                              onChange={(value) => {
                                const updatedRows = (formData.recommendationSection2?.rows || []).map(r => 
                                  r.id === row.id ? { ...r, description: value } : r
                                );
                                updateFormData({ recommendationSection2: { rows: updatedRows } });
                              }}
                              onSelectRow={(selectedRow: SheetRow) => {
                                // When a row is selected from description field, populate all three fields
                                const priceValue = selectedRow.price || '';
                                // Remove $ sign and store as plain number string (e.g., "400" not "$400")
                                const priceWithoutDollar = priceValue.replace(/^\$/, '').trim();
                                
                                const updatedRows = (formData.recommendationSection2?.rows || []).map(r => 
                                  r.id === row.id ? { 
                                    ...r, 
                                    description: selectedRow.description,
                                    unit: selectedRow.unit || '1', // Default to "1" if not provided
                                    price: priceWithoutDollar // Store without $ sign
                                  } : r
                                );
                                updateFormData({ recommendationSection2: { rows: updatedRows } });
                              }}
                              dataRowId={row.id}
                              placeholder="Description"
                              field="description"
                              className="w-full min-w-0 mr-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                              sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                              sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Sheet1!A:E'}
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <AutocompleteInput
                              value={row.unit}
                                onChange={(value) => {
                                const updatedRows = (formData.recommendationSection2?.rows || []).map(r => 
                                    r.id === row.id ? { ...r, unit: value } : r
                                );
                                updateFormData({ recommendationSection2: { rows: updatedRows } });
                              }}
                              onEnterKey={handleAddNewRowSection2}
                              dataRowId={row.id}
                                placeholder="Unit"
                                field="unit"
                              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                                sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                                sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Repairs!A:E'}
                            />
                              <input
                                type="text"
                                value={row.price}
                                data-row-id={row.id}
                                onChange={(e) => {
                                  const updatedRows = (formData.recommendationSection2?.rows || []).map(r => 
                                    r.id === row.id ? { ...r, price: e.target.value } : r
                                  );
                                  updateFormData({ recommendationSection2: { rows: updatedRows } });
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddNewRowSection2();
                                  }
                                }}
                                placeholder="Price"
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedRows = (formData.recommendationSection2?.rows || []).filter(r => r.id !== row.id);
                                updateFormData({ recommendationSection2: { rows: updatedRows } });
                              }}
                              className="px-2 py-1 text-red-600 hover:text-red-800 text-sm"
                              title="Delete row"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="pt-4 border-t border-gray-200">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    value={(() => {
                      const baseNotes = formData.notes !== undefined ? formData.notes : 'This quote is good for 30 days from date of service. Deposits for scheduled future service is non-refundable.';
                      if (formData.dataSourceUrl && !baseNotes.includes('Link to view timeline:')) {
                        return `${baseNotes}\n\nLink to view timeline: ${formData.dataSourceUrl}`;
                      }
                      return baseNotes;
                    })()}
                    onChange={(e) => {
                      const fullText = e.target.value;
                      // Extract the link part if it exists at the end
                      const linkPattern = /\n\nLink to view timeline:\s*(.+)$/;
                      const linkMatch = fullText.match(linkPattern);
                      
                      if (linkMatch) {
                        // Link found at the end - extract it and save separately
                        const url = linkMatch[1].trim();
                        const notesWithoutLink = fullText.replace(linkPattern, '').trim();
                        updateFormData({ 
                          notes: notesWithoutLink,
                          dataSourceUrl: url
                        });
                      } else {
                        // No link pattern found - check if user removed it
                        // If we had a URL before but it's not in the text now, clear it
                        if (formData.dataSourceUrl && !fullText.includes('Link to view timeline:')) {
                          updateFormData({ notes: fullText, dataSourceUrl: '' });
                        } else {
                          // Just update notes, preserve existing URL
                          updateFormData({ notes: fullText });
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                    rows={3}
                    placeholder="Enter notes for the repair estimate..."
                  />
                </div>
              </div>
            ) : isImagePage6(currentPage) ? (
              // Step 6 - Image Selection Interface
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
                            <>
                              <div className="absolute top-2 right-2 bg-[#722420] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                ✓
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCropInvoiceImage(image.id);
                                }}
                                className="absolute top-2 left-2 bg-red-900 hover:bg-red-950 text-white rounded px-2 py-1 text-xs font-medium transition-colors"
                                title="Crop this image"
                              >
                                ✂️ Crop
                              </button>
                            </>
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
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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
                    
                    {/* Selected Images with Crop Options */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Selected Images (Click to crop)</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {formData.selectedImages?.map((image, index) => (
                          <div
                            key={image.id}
                            className="relative border-2 border-[#722420] rounded-lg overflow-hidden"
                          >
                            <div className="aspect-square bg-gray-100">
                              <img
                                src={image.url}
                                alt={`Selected image ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="absolute top-1 left-1 bg-[#722420] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <button
                              onClick={() => handleCropInvoiceImage(image.id)}
                              className="absolute top-1 right-1 bg-[#722420] hover:bg-[#5a1d1a] text-white rounded px-2 py-1 text-xs font-medium transition-colors"
                              title="Crop this image"
                            >
                              ✂️ Crop
                            </button>
                            
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {(formData.selectedImages?.length || 0) > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Tip:</strong> Drag images to move them, or drag the resize handles (right edge, bottom edge, or corner) to resize them. The "Written Invoice" text can also be dragged to reposition it.
                    </p>
                  </div>
                )}

              </div>
            ) : currentLogicalStep === 7 ? (
              // Step 7 - Repair Estimate Interface
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
                                  ? 'bg-gray-800 text-white hover:bg-[black]' 
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
                              className="px-3 py-1.5 bg-[#722420] text-white rounded text-sm hover:bg-[#5a1d1a] transition-colors"
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
                    <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
                      <colgroup>
                        <col style={{ width: '65%' }} />
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '12%' }} />
                        <col style={{ width: '13%' }} />
                      </colgroup>
                      <thead className="bg-[#722420]">
                        <tr>
                          <th className="px-2 py-2 text-left text-white font-bold text-xs" style={{ borderBottom: '1px solid #722420' }}>Description</th>
                          <th className="px-1 py-2 text-center text-white font-bold text-xs" style={{ borderBottom: '1px solid #722420' }}>Unit</th>
                          <th className="px-1 py-2 text-center text-white font-bold text-xs" style={{ borderBottom: '1px solid #722420' }}>Price</th>
                          <th className="px-2 py-2 text-center text-white font-bold text-xs" style={{ borderBottom: '1px solid #722420' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(getCurrentRecommendationPage()?.repairEstimateData.rows || []).map((row: any, index: number) => (
                          <tr key={row.id}>
                            <td className="px-2 py-2" style={{ width: '65%' }}>
                              <div className="w-full">
                                <AutocompleteInput 
                                  value={row.description || ''}
                                  onChange={(value) => {
                                    const currentPage = getCurrentRecommendationPage();
                                    if (currentPage) {
                                      const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                        r.id === row.id ? { ...r, description: value } : r
                                      );
                                      updateCurrentRecommendationPage({
                                        repairEstimateData: {
                                          ...currentPage.repairEstimateData,
                                          rows: updatedRows
                                        }
                                      });
                                    }
                                  }}
                                  onSelectRow={(selectedRow: SheetRow) => {
                                    const currentPage = getCurrentRecommendationPage();
                                    if (currentPage) {
                                      // When a row is selected from description field, populate all three fields
                                      const priceValue = selectedRow.price || '';
                                      // Remove $ sign and store as plain number string (e.g., "400" not "$400")
                                      const priceWithoutDollar = priceValue.replace(/^\$/, '').trim();
                                      
                                      const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                        r.id === row.id ? { 
                                          ...r, 
                                          description: selectedRow.description,
                                          unit: selectedRow.unit || '1', // Default to "1" if not provided
                                          price: priceWithoutDollar // Store without $ sign
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
                                  placeholder="Enter description (Press Enter for new line)"
                                  field="description"
                                  className="w-full min-w-0 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                                  sheetId={process.env.REACT_APP_GOOGLE_SHEET_ID || '1Bhz4JMVaR4tGbBKrhRHwR38MTtX8MVM_0v0JV8V6R9Q'}
                                  sheetRange={process.env.REACT_APP_GOOGLE_SHEET_RANGE || 'Sheet1!A:E'}
                                />
                              </div>
                            </td>
                            <td className="px-1 py-2" style={{ width: '10%' }}>
                              <input
                                type="text"
                                value={String(row.unit || '')}
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
                                placeholder="Unit"
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                              />
                            </td>
                            <td className="px-1 py-2" style={{ width: '12%' }}>
                              <input
                                type="text"
                                value={row.price ? `$${row.price}` : ''}
                                onChange={(e) => {
                                  const currentPage = getCurrentRecommendationPage();
                                  if (currentPage) {
                                    // Remove $ and parse as float
                                    const numericValue = e.target.value.replace(/^\$/, '').trim();
                                    const updatedRows = currentPage.repairEstimateData.rows.map((r: any) => 
                                      r.id === row.id ? { ...r, price: parseFloat(numericValue) || 0 } : r
                                    );
                                    updateCurrentRecommendationPage({
                                      repairEstimateData: {
                                        ...currentPage.repairEstimateData,
                                        rows: updatedRows
                                      }
                                    });
                                  }
                                }}
                                placeholder="Price"
                                className="w-full px-1 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#722420]"
                              />
                            </td>
                            <td className="px-1 py-2" style={{ width: '13%' }}>
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
                                className="w-full py-0.5  text-red-600 hover:text-red-800 text-m whitespace-nowrap flex items-center justify-center"
                                title="Remove"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
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

                {/* Recommendation Section - Show when there are any rows */}
                {getCurrentRecommendationPage()?.repairEstimateData.rows && getCurrentRecommendationPage()?.repairEstimateData.rows.length > 0 && (
                  <div className="space-y-3 mt-4">
                    <h5 className="font-medium text-gray-700">Professional Recommendation</h5>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Recommendation Text:
                      </label>
                      <textarea
                        value={(() => {
                          const currentPage = getCurrentRecommendationPage();
                          if (!currentPage) return '';
                          // Use custom recommendation if it's explicitly set and not empty, otherwise combine from rows
                          if (currentPage.customRecommendation !== undefined && 
                              currentPage.customRecommendation !== null && 
                              currentPage.customRecommendation.trim() !== '') {
                            return currentPage.customRecommendation;
                          }
                          // Combine recommendations from all rows, preserving line breaks
                          const rowRecommendations = (currentPage.repairEstimateData.rows || [])
                            .filter((r: any) => r.recommendation)
                            .map((r: any) => r.recommendation)
                            .join('\n');
                          return rowRecommendations || '';
                        })()}
                        onChange={(e) => {
                          // Update customRecommendation when user edits
                          handleCustomRecommendationChange(e.target.value);
                        }}
                        onKeyDown={(e) => {
                          // Allow Enter key to create new lines (default behavior)
                          // No need to prevent default - let textarea handle it naturally
                        }}
                        placeholder="Enter recommendation text here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                        rows={6}
                        style={{ fontFamily: 'Inter, Arial, sans-serif', whiteSpace: 'pre-wrap' }}
                      />
                      <p className="text-xs text-blue-600 mt-2">
                        This text will be displayed in the Professional Recommendations section on Recommendation Pages.
                      </p>
                    </div>
                  </div>
                )}
                {getCurrentRecommendationPage()?.reviewImage && (
                              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                  💡 <strong>Tip:</strong> Drag the image to move it, or drag the resize handle (bottom-right corner) to resize it.
                                </p>
                              </div>
                            )}
              </div>
              
            ) : isImagePage(currentPage) ? (
              <div className="py-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="text-lg font-semibold text-black mb-2">Step 8 - Inspection Images</h4>
                  <p className="text-sm text-black mb-2">
                    Manage which images appear in the inspection images section. Remove images you don't want to include.
                  </p>
                  <p className="text-xs text-gray-600">
                    Showing {getUnusedImages().length} image(s) • Page {getImagePageIndex(currentPage) + 1} of {getTotalImagePages()}
                  </p>
                </div>
                
                {/* Upload Images Section */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">Upload Images</h5>
                  <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length === 0) return;
                        
                        // Process all files and convert to base64
                        const filePromises = files.map((file) => {
                          return new Promise<ImageItem>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const imageUrl = event.target?.result as string;
                              const newImage: ImageItem = {
                                id: `uploaded-${Date.now()}-${Math.random()}`,
                                url: imageUrl
                              };
                              resolve(newImage);
                            };
                            reader.onerror = () => resolve({ id: '', url: '' });
                            reader.readAsDataURL(file);
                          });
                        });
                        
                        const newImages = await Promise.all(filePromises);
                        const validImages = newImages.filter(img => img.url);
                        
                        if (validImages.length > 0) {
                          const currentUploaded = formData.uploadedInspectionImages || [];
                          const currentImages = getUnusedImages();
                          const allImages = [...currentImages, ...validImages];
                          
                          updateFormData({
                            uploadedInspectionImages: [...currentUploaded, ...validImages],
                            inspectionImagesOrder: allImages.map(img => img.id)
                          });
                        }
                        
                        // Reset file input
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                    />
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#722420] hover:bg-[#5a1d1a] text-white rounded-md text-sm font-medium transition-colors"
                      >
                        📤 Upload Images from PC
                      </button>
                      <button
                        type="button"
                        onClick={loadJobsFromUrl}
                        disabled={!formData.dataSourceUrl || isLoadingJobs}
                        className="px-4 py-2 bg-[#722420] hover:bg-[#5a1d1a] text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Select images from other dates"
                      >
                        {isLoadingJobs ? 'Loading...' : '📅 Select Date Images'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Click to upload images from your computer or select images from other dates. Images will be added to the inspection images section.
                    </p>
                  </div>
                </div>

                {/* All Unused Images List with Drag-and-Drop */}
                <div className="mb-4">
                  <h5 className="text-sm font-semibold text-gray-700 mb-2">
                    All Available Images (Use Up/Down for quick moves, # for specific position, or drag to reorder)
                  </h5>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white">
                    {getUnusedImages().length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No images available. Upload images or restore removed images.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-3">
                        {getUnusedImages().map((image, index) => (
                          <div
                            key={image.id}
                            className="flex flex-col"
                          >
                            {/* Image Container */}
                            <div
                              draggable
                              onDragStart={(e) => {
                                setDraggedImageId(image.id);
                                e.dataTransfer.effectAllowed = 'move';
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'move';
                                if (draggedImageId && draggedImageId !== image.id) {
                                  e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                                }
                              }}
                              onDragLeave={(e) => {
                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                                if (!draggedImageId || draggedImageId === image.id) return;
                                
                                const currentImages = getUnusedImages();
                                const draggedIndex = currentImages.findIndex(img => img.id === draggedImageId);
                                const targetIndex = currentImages.findIndex(img => img.id === image.id);
                                
                                if (draggedIndex === -1 || targetIndex === -1) return;
                                
                                // Reorder images
                                const reordered = [...currentImages];
                                const [removed] = reordered.splice(draggedIndex, 1);
                                reordered.splice(targetIndex, 0, removed);
                                
                                // Update order
                                updateFormData({
                                  inspectionImagesOrder: reordered.map(img => img.id)
                                });
                                
                                setDraggedImageId(null);
                              }}
                              onDragEnd={() => {
                                setDraggedImageId(null);
                                // Remove any drag-over classes
                                document.querySelectorAll('.border-blue-500.bg-blue-50').forEach(el => {
                                  el.classList.remove('border-blue-500', 'bg-blue-50');
                                });
                              }}
                              className={`relative aspect-square border-2 rounded overflow-hidden transition-all cursor-move ${
                                draggedImageId === image.id 
                                  ? 'border-blue-500 opacity-50' 
                                  : 'border-gray-300 hover:border-[#722420]'
                              }`}
                            >
                              <img
                                src={image.url}
                                alt="Inspection"
                                className="w-full h-full object-cover pointer-events-none"
                                draggable={false}
                              />
                              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                                {index + 1}
                              </div>
                              
                              {/* Remove button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Check if this is an uploaded image
                                  const isUploaded = formData.uploadedInspectionImages?.some(img => img.id === image.id);
                                  
                                  if (isUploaded) {
                                    // Remove uploaded image completely
                                    const updatedUploaded = (formData.uploadedInspectionImages || []).filter(img => img.id !== image.id);
                                    const currentOrder = formData.inspectionImagesOrder || [];
                                    updateFormData({
                                      uploadedInspectionImages: updatedUploaded,
                                      inspectionImagesOrder: currentOrder.filter(id => id !== image.id)
                                    });
                                  } else {
                                    // Exclude scraped image
                                    const excluded = formData.excludedStep8Images || [];
                                    if (!excluded.includes(image.id)) {
                                      const currentOrder = formData.inspectionImagesOrder || [];
                                      updateFormData({
                                        excludedStep8Images: [...excluded, image.id],
                                        inspectionImagesOrder: currentOrder.filter(id => id !== image.id)
                                      });
                                    }
                                  }
                                }}
                                className="absolute top-1 right-1 bg-[#722420] hover:bg-[#5a1d1a] text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg z-10"
                                title="Remove from Step 8"
                              >
                                ×
                              </button>
                            </div>
                            
                            {/* Reorder buttons section below image */}
                            <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-2">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                {/* Move to Top */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImageToTop(image.id);
                                  }}
                                  disabled={index === 0}
                                  className="bg-[#722420] hover:bg-[#5a1d1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded px-2 py-1 text-xs font-bold shadow transition-colors"
                                  title="Move to top"
                                >
                                  ↑↑
                                </button>
                                {/* Image Number - Click to move to position */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setImageForPositionMove(image.id);
                                    setTargetPosition(String(index + 1));
                                    setShowPositionModal(true);
                                  }}
                                  className="bg-gray-700 hover:bg-gray-800 text-white rounded px-3 py-1 text-sm font-bold shadow transition-colors"
                                  title="Click to move to specific position"
                                >
                                  {index + 1}
                                </button>
                                {/* Move to Bottom */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveImageToBottom(image.id);
                                  }}
                                  disabled={index === getUnusedImages().length - 1}
                                  className="bg-[#722420] hover:bg-[#5a1d1a] disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded px-2 py-1 text-xs font-bold shadow transition-colors"
                                  title="Move to bottom"
                                >
                                  ↓↓
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Excluded Images Section */}
                {getExcludedStep8Images().length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      Removed Images ({getExcludedStep8Images().length})
                    </h5>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
                      <div className="grid grid-cols-4 gap-2">
                        {getExcludedStep8Images().map((image) => (
                          <div
                            key={image.id}
                            className="relative aspect-square border-2 border-dashed border-gray-400 rounded overflow-hidden cursor-pointer hover:border-[#722420] transition-colors"
                            onClick={() => {
                              const excluded = formData.excludedStep8Images || [];
                              updateFormData({
                                excludedStep8Images: excluded.filter(id => id !== image.id)
                              });
                            }}
                            title="Click to restore"
                          >
                            <img
                              src={image.url}
                              alt="Excluded"
                              className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold text-gray-600 bg-white/80 px-1 rounded">
                                Restore
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : getLogicalStep(currentPage) === 9 ? (
              <div className="text-center py-8">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="text-green-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Step 9 - Documentation (Part {getStep9PartNumber()})</h4>
                  <p className="text-black mb-4">
                    {getStep9PartNumber() === 1 ? 'This page contains chimney documentation information that cannot be edited.' :
                     getStep9PartNumber() === 2 ? 'This page contains additional chimney documentation information that cannot be edited.' :
                     'This page contains final chimney documentation information that cannot be edited.' 
                      }
                  </p>
                  <p className="text-sm text-black">
                    All information is pre-filled and will be included in the final PDF report.
                  </p>
                </div>
              </div>
            ) : getLogicalStep(currentPage) === 10 ? (
              <div className="text-center py-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="text-blue-600 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-semibold text-black mb-2">Step 10 - Final Steps (Part {getStep10PartNumber()})</h4>
                  <p className="text-black mb-4">
                    {getStep10PartNumber() === 1 ? 'This page contains final inspection documentation and completion information.' :
                     getStep10PartNumber() === 2 ? 'This page contains the final completion documentation and summary information.' :
                     getStep10PartNumber() === 3 ? 'This page contains additional final documentation and verification details.' :
                     getStep10PartNumber() === 4 ? 'This page contains final quality assurance and compliance information.' :
                     'This page contains the ultimate completion and delivery information for your chimney inspection report.'}
                  </p>
                  <p className="text-sm text-black">
                    This is part {getStep10PartNumber()} of the final steps in your chimney inspection report.
                  </p>
                </div>
              </div>
            ) : null}

             {/* Generate Button - Only show on last page */}
             <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
               {currentPage === totalPages ? (
                <>
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Pages included in PDF:</span>
                      <span className="font-semibold text-[#722420]">
                        {Array.from(includedPages).length} of {totalPages}
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#722420] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(Array.from(includedPages).length / totalPages) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Page Control Buttons */}
                  <div className="flex gap-2 mb-3">
                    <button 
                      type="button"
                      onClick={includeAllPages}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#722420] border border-[#722420] rounded-md hover:bg-[#5a1d1a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#722420] transition-colors duration-200"
                    >
                      Include All
                    </button>
                    <button 
                      type="button"
                      onClick={excludeAllPages}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Exclude All
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {/* <button 
                      type="button"
                      onClick={handleDownloadPDF}
                      className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isGenerating}
                    >
                      {isGenerating && generationStatus === 'generating'
                        ? 'Generating PDF...'
                        : 'Download PDF'}
                    </button> */}
                    
                    <button 
                      type="button"
                      onClick={handleSubmit}
                      className="w-full btn-primary"
                      disabled={isGenerating}
                    >
                      {isGenerating
                        ? (generationStatus === 'saving'
                            ? 'Saving Data...'
                            : generationStatus === 'uploading'
                              ? 'Uploading Report...'
                              : 'Generating PDF...')
                        : 'Generate Report'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-600 mb-3">
                    {currentLogicalStep === 1 ? 'Fill in the client information above' : 
                     currentLogicalStep === 2 ? 'Review the static content' : 
                     currentLogicalStep === 3 ? 'Review service report details' : 
                     currentLogicalStep === 4 ? 'Review chimney type details' : 
                     currentLogicalStep === 5 ? (isInvoicePage(currentPage) ? 'Review invoice details' : 'Review repair estimate details') : 
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
          <div className="card p-0 shadow-lg">
            {/* Improved Header Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-300">
              <div className="p-4 sm:p-5">
                {/* Top Row: Title and Page Info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  {/* Left: Preview Label with Icon */}
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-[#722420] rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Preview</h3>
                      <p className="text-xs text-gray-500">Live preview of your report</p>
                    </div>
                  </div>
                  
                  {/* Right: Page Navigation */}
                  <div className="flex items-center space-x-2">
                    {(() => {
                      // Calculate the actual page number being displayed
                      let actualPageNumber = currentPage;
                      if (currentLogicalStep === 7) {
                        const imagePageNum = 4 + totalInvoicePages + totalRepairEstimatePages + 1;
                        actualPageNumber = imagePageNum + 1 + currentRecommendationPageIndex;
                      } else if (currentLogicalStep === 8) {
                        actualPageNumber = currentPage;
                      }
                      
                      return (
                        <>
                          {(actualPageNumber > 1) && (
                            <button
                              onClick={handlePrevPage}
                              className="px-3 py-2 text-sm font-medium bg-white text-[#722420] border border-[#722420] rounded-lg hover:bg-[#722420] hover:text-white transition-all duration-200 shadow-sm"
                            >
                              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Prev
                            </button>
                          )}
                          <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border border-gray-300 shadow-sm">
                            <span className="text-xs text-gray-500 hidden sm:inline">Page</span>
                            <label className="sr-only" htmlFor="jumpToPage">Jump to page</label>
                            <input
                              id="jumpToPage"
                              type="number"
                              min={1}
                              max={totalPages}
                              value={actualPageNumber}
                              onChange={(e) => {
                                const next = Number(e.target.value || 1);
                                if (!Number.isFinite(next)) return;
                                const clamped = Math.max(1, Math.min(totalPages, Math.floor(next)));
                                if (isRecommendationPage(clamped)) {
                                  const idx = getRecommendationPageIndex(clamped);
                                  setCurrentRecommendationPageIndex(idx);
                                }
                                setCurrentPage(clamped);
                              }}
                              className="w-12 text-center text-sm font-semibold text-gray-900 border-0 focus:outline-none focus:ring-0 p-0"
                              aria-label="Jump to page"
                            />
                            <span className="text-xs text-gray-400">/</span>
                            <span className="text-xs text-gray-600 font-medium">{totalPages}</span>
                          </div>
                          {(actualPageNumber < totalPages) && (
                            <button
                              onClick={handleNextPage}
                              className="px-3 py-2 text-sm font-medium bg-white text-[#722420] border border-[#722420] rounded-lg hover:bg-[#722420] hover:text-white transition-all duration-200 shadow-sm"
                            >
                              Next
                              <svg className="w-4 h-4 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Bottom Row: Include/Exclude Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <svg className={`w-5 h-5 ${isCurrentPageIncluded() ? 'text-[#722420]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-gray-700">Include Page {currentPage} in PDF</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={togglePageInclusion}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#722420] focus:ring-offset-2 shadow-md ${
                        isCurrentPageIncluded() 
                          ? 'bg-[#722420] shadow-[#722420]/50' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      role="switch"
                      aria-checked={isCurrentPageIncluded()}
                      aria-label={`${isCurrentPageIncluded() ? 'Include' : 'Exclude'} page ${currentPage} from PDF`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center ${
                          isCurrentPageIncluded() 
                            ? 'translate-x-7' 
                            : 'translate-x-1'
                        }`}
                      >
                        {isCurrentPageIncluded() ? (
                          <svg className="w-4 h-4 text-[#722420]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </span>
                    </button>
                    <span className={`text-sm font-semibold transition-colors duration-200 min-w-[3rem] ${
                      isCurrentPageIncluded() 
                        ? 'text-[#722420]' 
                        : 'text-gray-500'
                    }`}>
                      {isCurrentPageIncluded() ? 'Included' : 'Excluded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Preview Content */}
            <div className="flex justify-center overflow-x-auto" data-preview="true">
                          {currentPage === 1 ? (
              <Step1 formData={formData} updateFormData={updateFormData} timelineCoverImage={formData.timelineCoverImage} />
            ) : currentPage === 2 ? (
              <Step2 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 3 ? (
              <Step3 formData={formData} updateFormData={updateFormData} />
              ) : currentPage === 4 ? (
                <Step4 chimneyType={formData.chimneyType} />
              ) : currentPage === 5 ? (
                <Step5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={1}
                />
              ) : isInvoicePage(currentPage) ? (
                <Step5 
                  invoiceData={formData.invoiceData} 
                  updateInvoiceData={(data) => updateFormData({ invoiceData: data })}
                  currentInvoicePage={currentPage - 4}
                  isPDF={false}
                />
              ) : isRepairEstimatePage(currentPage) ? (
                <Step5Part2 
                  repairEstimateData={formData.repairEstimateData}
                  section1={{
                    title: formData.recommendationSection1Title || 'Repair Estimate#1',
                    rows: formData.repairEstimateData?.rows || []
                  }}
                  section2={formData.showRecommendationSection2 ? {
                    title: formData.recommendationSection2Title || 'Repair Estimate#2',
                    rows: formData.recommendationSection2?.rows || []
                  } : undefined}
                  updateRepairEstimateData={(data) => updateFormData({ repairEstimateData: data })}
                  currentEstimatePage={currentPage - 4 - totalInvoicePages}
                  isPDF={false}
                  notes={formData.notes}
                  dataSourceUrl={formData.dataSourceUrl}
                />
              ) : isImagePage6(currentPage) ? (
                <Step6 
                  scrapedImages={formData.scrapedImages || []}
                  selectedImages={formData.selectedImages || []}
                  onImageSelection={handleImageSelection}
                  isPDF={false}
                  onImagePositionChange={(imageId, x, y, width, height) => {
                    const updatedImages = (formData.selectedImages || []).map(img =>
                      img.id === imageId
                        ? { ...img, positionX: x, positionY: y, width, height }
                        : img
                    );
                    updateFormData({ selectedImages: updatedImages });
                  }}
                  textPositionX={formData.step6TextPositionX}
                  textPositionY={formData.step6TextPositionY}
                  onTextPositionChange={(x, y) => {
                    updateFormData({ step6TextPositionX: x, step6TextPositionY: y });
                  }}
                />
              ) : isRecommendationPage(currentPage) ? (
                getCurrentRecommendationPage() ? (
                  <Step7 
                    scrapedImages={formData.scrapedImages || []}
                    selectedImages={formData.selectedImages || []}
                    onImageSelection={handleImageSelection}
                    isPDF={false}
                    repairEstimateData={getCurrentRecommendationPage()?.repairEstimateData}
                    reviewImage={getCurrentRecommendationPage()?.reviewImage}
                    customRecommendation={getCurrentRecommendationPage()?.customRecommendation || ''}
                    currentPage={currentRecommendationSubPage}
                    totalPages={(() => {
                      const currentPage = getCurrentRecommendationPage();
                      if (!currentPage) return 1;
                      const rows = currentPage.repairEstimateData?.rows || [];
                      return calculateRecommendationPages(rows);
                    })()}
                    imagePositionX={getCurrentRecommendationPage()?.imagePositionX}
                    imagePositionY={getCurrentRecommendationPage()?.imagePositionY}
                    imageWidth={getCurrentRecommendationPage()?.imageWidth}
                    imageHeight={getCurrentRecommendationPage()?.imageHeight}
                    onImagePositionChange={(x, y, width, height) => {
                      updateCurrentRecommendationPage({
                        imagePositionX: x,
                        imagePositionY: y,
                        imageWidth: width,
                        imageHeight: height
                      });
                    }}
                  />
                ) : (
                  // Show empty Step7 when no recommendation pages exist
                  <Step7 
                    scrapedImages={formData.scrapedImages || []}
                    selectedImages={formData.selectedImages || []}
                    onImageSelection={handleImageSelection}
                    isPDF={false}
                    repairEstimateData={{ manualEntry: false, rows: [] }}
                    reviewImage=""
                    customRecommendation=""
                    currentPage={1}
                    totalPages={1}
                  />
                 )
               ) : isImagePage(currentPage) ? (
                 getTotalImagePages() > 0 ? (
                 <Step8 
                   isPDF={false} 
                   unusedImages={getUnusedImages()} 
                   currentPage={getImagePageIndex(currentPage) + 1}
                   totalPages={getTotalImagePages()}
                   selectedImages={formData.selectedImages || []}
                 />
                 ) : (
                   <div className="text-center py-8">
                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                       <p className="text-sm text-yellow-800">
                         No images available for Step 8. All images have been used in other steps or removed.
                       </p>
                     </div>
                   </div>
                 )
                ) : getLogicalStep(currentPage) === 9 && currentPage === (totalPages - 7) ? (
                  <Step9Part1 
                    chimneyType={
                      (formData.chimneyType?.toLowerCase() === 'prefabricated'
                        ? 'prefabricated'
                        : 'masonry') as any
                    }
                  />
                ) : getLogicalStep(currentPage) === 9 && currentPage === (totalPages - 6) ? (
                  <Step9Part2 
                    chimneyType={
                      (formData.chimneyType?.toLowerCase() === 'prefabricated'
                        ? 'prefabricated'
                        : 'masonry')
                    }
                  />
                ) : getLogicalStep(currentPage) === 9 && currentPage === (totalPages - 5) ? (
                  <Step9Part3 
                    chimneyType={
                      (formData.chimneyType?.toLowerCase() === 'prefabricated'
                        ? 'prefabricated'
                        : 'masonry')
                    }
                  />
                ) : getLogicalStep(currentPage) === 10 && currentPage === (totalPages - 4) ? (
                  <Step10Part1 />
                ) : getLogicalStep(currentPage) === 10 && currentPage === (totalPages - 3) ? (
                  <Step10Part2 isPDF={false} chimneyType={formData.chimneyType} />
                ) : getLogicalStep(currentPage) === 10 && currentPage === (totalPages - 2) ? (
                  <Step10Part3 isPDF={false} chimneyType={formData.chimneyType} />
                ) : getLogicalStep(currentPage) === 10 && currentPage === (totalPages - 1) ? (
                  <Step10Part4 isPDF={false} chimneyType={formData.chimneyType} />
                ) : getLogicalStep(currentPage) === 10 && currentPage === totalPages ? (
                  <Step10Part5 />
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
      {isCropping && (formData.timelineCoverImage || croppingImageId) && (() => {
        const imageUrl = croppingImageId 
          ? formData.selectedImages?.find(img => img.id === croppingImageId)?.url 
          : formData.timelineCoverImage;
        
        if (!imageUrl) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[95vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {croppingImageId ? 'Crop Invoice Image' : 'Crop Timeline Cover Image'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {window.innerWidth <= 768 
                        ? "Touch and drag to crop. Use corners to resize."
                        : "Drag to move, use corners to resize. Free-form cropping available."
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
                  imageUrl={imageUrl}
                  onCropComplete={handleCropComplete}
                  onCancel={handleCropCancel}
                  aspectRatio={croppingImageId ? 1 : 284/220} // Free-form for invoice images, fixed for timeline
                />
              </div>
            </div>
          </div>
        );
      })()}

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
                  onClick={() => {
                    setShowPredefinedModal(false);
                    setPredefinedSearchTerm('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {predefinedSearchTerm ? 
                  `Showing ${dropdownOptions.filter(option => 
                    option.description.toLowerCase().includes(predefinedSearchTerm.toLowerCase())
                  ).length} of ${dropdownOptions.length} predefined repair items` :
                  `Choose from ${dropdownOptions.length} predefined repair items`
                }
              </p>
              
              {/* Search Input */}
              <div className="mt-4">
                <input
                  type="text"
                  placeholder="Search repair items..."
                  value={predefinedSearchTerm}
                  onChange={(e) => setPredefinedSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {dropdownOptions
                  .filter(option => 
                    predefinedSearchTerm === '' || 
                    option.description.toLowerCase().includes(predefinedSearchTerm.toLowerCase())
                  )
                  .map((option) => (
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
                        isManual: true // Make predefined entries editable by default
                      };
                        // If customRecommendation is empty/undefined, set it to the new option's recommendation
                        // If it already has content, replace it with the new recommendation (user can edit if needed)
                        let updatedRecommendation: string;
                        const existingRecommendation = currentPage.customRecommendation?.trim() || '';
                        if (existingRecommendation !== '') {
                          // If there's existing content, replace it with the new recommendation
                          // (User might want to see the latest selected recommendation)
                          updatedRecommendation = option.recommendation || '';
                        } else {
                          // If empty or undefined, use the option's recommendation
                          updatedRecommendation = option.recommendation || '';
                        }
                        updateCurrentRecommendationPage({
                          repairEstimateData: {
                            ...currentPage.repairEstimateData,
                            rows: [...currentPage.repairEstimateData.rows, newRow]
                          },
                          customRecommendation: updatedRecommendation
                        });
                      }
                      setShowPredefinedModal(false);
                      setPredefinedSearchTerm('');
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
                
                {/* No Results Message */}
                {predefinedSearchTerm && dropdownOptions.filter(option => 
                  option.description.toLowerCase().includes(predefinedSearchTerm.toLowerCase())
                ).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm">
                      No repair items found matching "{predefinedSearchTerm}"
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Try searching with different keywords
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Selector Modal for Step 8 */}
      {showDateSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Select Date for Images</h3>
                <button
                  onClick={() => setShowDateSelector(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Choose a date to view and merge its images with your current job.
              </p>
            </div>
            
            <div className="p-4">
              {allJobs.length > 0 ? (
                <div className="space-y-3">
                  {allJobs.map((job, index) => (
                    <div 
                      key={job.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                      onClick={() => handleDateSelection(job)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {job.date}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {job.imageUrls.length} image{job.imageUrls.length !== 1 ? 's' : ''} available
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {index === 0 ? 'Latest' : index === 1 ? 'Previous' : `${index + 1}${index === 2 ? 'rd' : index === 3 ? 'th' : 'th'}`}
                          </span>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dates Found</h3>
                  <p className="text-sm text-gray-600 mb-4">No jobs with dates were found in the HTML content.</p>
                  <button
                    onClick={() => setShowDateSelector(false)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Date Images Modal for Step 8 */}
      {showPreviousJobImages && selectedDateJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Images from {selectedDateJob.date}</h3>
                <button
                  onClick={() => {
                    setShowPreviousJobImages(false);
                    setSelectedDateJob(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Found {selectedDateJob.imageUrls.length} image{selectedDateJob.imageUrls.length !== 1 ? 's' : ''} from {selectedDateJob.date}. 
                Select the images you want to add to your current job.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleSelectAllImages}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {selectedImages.length === selectedDateJob.imageUrls.length ? 'Deselect All' : 'Select All'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedImages.length} of {selectedDateJob.imageUrls.length} selected
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              {selectedDateJob.imageUrls.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {selectedDateJob.imageUrls.map((imageUrl, index) => {
                      const isSelected = selectedImages.includes(imageUrl);
                      return (
                        <div 
                          key={index} 
                          className={`relative group cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => handleDateImageSelection(imageUrl)}
                        >
                          <img
                            src={imageUrl}
                            alt={`Image from ${selectedDateJob.date} ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border-2 transition-all ${
                              isSelected ? 'border-blue-500' : 'border-gray-200'
                            }`}
                          />
                          
                          {/* Selection checkbox */}
                          <div className="absolute top-2 right-2">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isSelected 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'bg-white border-gray-300'
                            }`}>
                              {isSelected && (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                          
                          {/* Date overlay */}
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {selectedDateJob.date}
                          </div>
                          
                          {/* Selection indicator */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleMergeSelectedDateImages}
                      disabled={selectedImages.length === 0}
                      className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                        selectedImages.length === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      Merge Selected Images ({selectedImages.length})
                    </button>
                    <button
                      onClick={() => {
                        setShowPreviousJobImages(false);
                        setSelectedDateJob(null);
                        setSelectedImages([]);
                      }}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Images Found</h3>
                  <p className="text-sm text-gray-600 mb-4">No images were found for {selectedDateJob.date}.</p>
                  <button
                    onClick={() => {
                      setShowPreviousJobImages(false);
                      setSelectedDateJob(null);
                    }}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Move to Position Modal */}
      {showPositionModal && imageForPositionMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Move Image to Position</h3>
                <button
                  onClick={() => {
                    setShowPositionModal(false);
                    setImageForPositionMove(null);
                    setTargetPosition('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Enter the position number (1 to {getUnusedImages().length}) where you want to move this image.
              </p>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="targetPosition" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Position
                </label>
                <input
                  type="number"
                  id="targetPosition"
                  min="1"
                  max={getUnusedImages().length}
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const pos = parseInt(targetPosition);
                      if (pos >= 1 && pos <= getUnusedImages().length) {
                        moveImageToPosition(imageForPositionMove, pos);
                        setShowPositionModal(false);
                        setImageForPositionMove(null);
                        setTargetPosition('');
                      }
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#722420] focus:border-transparent"
                  placeholder={`1 - ${getUnusedImages().length}`}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current total images: {getUnusedImages().length}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    const pos = parseInt(targetPosition);
                    if (pos >= 1 && pos <= getUnusedImages().length) {
                      moveImageToPosition(imageForPositionMove, pos);
                      setShowPositionModal(false);
                      setImageForPositionMove(null);
                      setTargetPosition('');
                    } else {
                      alert(`Please enter a number between 1 and ${getUnusedImages().length}`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-[#722420] text-white rounded-lg hover:bg-[#5a1d1a] transition-colors font-medium"
                >
                  Move to Position
                </button>
                <button
                  onClick={() => {
                    setShowPositionModal(false);
                    setImageForPositionMove(null);
                    setTargetPosition('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiStepForm;

