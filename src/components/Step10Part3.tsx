import React, { FunctionComponent } from 'react';
import styles from './Step10Part3.module.css';

interface Step10Part3Props {
  isPDF?: boolean;
  chimneyType?: string;
}

export const Step10Part3: React.FC<Step10Part3Props> = ({ isPDF = false, chimneyType = 'masonry' }) => {
  return (
    <div className="bg-white grid justify-items-center [align-items:start] w-full">
      <div className="bg-white w-[595px] h-[842px]">
        <div
          className="relative w-[546px] h-[790px] top-[26px]"
          style={isPDF ? {
            left: '22.5px'
          } : {
            left: '25px'
          }}
        >
          <div className="absolute w-[546px] h-[790px] top-0 left-0 border-2 border-solid border-[#722420]">
            <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
          </div>

          <div
            className="absolute w-[511px] h-[700px] top-[45px] left-[19px] flex items-center justify-center overflow-y-auto"
          >
            <div
              className={styles.termsAndConditionsOfYourIParent}
              style={isPDF ? { padding: '15px' } : {}}
            >
              <b
                className={styles.termsAndConditions}
                style={isPDF ? { marginBottom: '20px' } : {}}
              >Terms and Conditions of Your Inspection Report</b>
              {isPDF && <><p className="termsAndConditions">&nbsp;</p></>}
              <div className={styles.disclaimerThisReportContainer}>
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Disclaimer</b>
                  <span>{`: This report is a result of a visual inspection done at the time of service. It is intended as a convenience to our customers, not a certification of fire worthiness, safety or any guarantee of functionality. Since conditions of use and hidden construction defects are beyond our control, no warranty is made for the safety or function of any items inspected and none is to be implied. The services you are provided may be performed by an independent contractor. Your inspection is an opinion based upon Virginia building codes regarding the chimney industry. Since experience, education and understanding of the chimney industry is extremely important, we advise an engineering review of any inspection that requires repair.
`}</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Warranty</b>
                  <span>: The products installed in the chimney industry typically reference warranty and other guarantees. These warrantees are usually provided by the manufactures of these products and sometimes only offer material replacement. These manufactures sometimes do not honor labor warranties. The contractor guarantees all workmanship (labor) of any service provided for a period of 365 days from the date of service, unless otherwise stated on the work order/invoice or provisions of this agreement. Warranties of products are the responsibility of the product manufacturer and labor warranties will be the responsibility of the contractor. Labor warranties will be stated as "labor warranty". If only "warranty" is stated, then coverage is limited to the manufacturer's warranty. All warranties are void if payment is not made when due.</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span>&nbsp;</span>  */}
                  <b className={styles.disclaimer}>Extended warranty</b>
                  <span >: In order to provide the best warranties in the business, A Step in Time will extend warranties on repairs for a period of 10 years as long as annual inspections are performed. Warranties are not transferable unless stated on invoice. If a covered defect occurs, the contractor will repair defect with reasonable promptness, upon notification, within normal business hours. In no event shall the contractor be held liable for water damage or other consequential damages caused by delays in remedying a defect. Warranty does not cover damage caused from mistreatment, work performed by others or items covered in "Responsibilities of Customer".</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span className={styles.disclaimer}>&nbsp;< //span> */}
                  <b className={styles.disclaimer}>Responsibilities of Customer</b>
                  <span>: Customer represents all mechanical and structural systems are in good repair except for conditions stated in written work order/invoice. Customer shall indemnify and hold "contractor" harmless of all claims, defenses, losses, liabilities, personal injuries, property damages, direct and consequential damages, costs and expenses (including reasonable attorneys' fees) incurred by "contractor" due to each pre-existing defective, harmful, wrongful or unsafe conditions of customer's property including but not limited to the following: existing code violations, roofing defects, electrical defects, acts of nature including hail, wind, rain and/or structural defects. Due to unforeseen drafts, air flow of the chimney, mechanical malfunctions and nature of our business, "contractor" shall not be held responsible for damage to personal or real property caused by soot debris or dusting of any portion of the residence. The inspection and report are performed and prepared for the sole, confidential and exclusive use and possession of the customer. The homeowner agrees not to provide this report to a third party without the written consent of "contractor". The customer shall indemnify and hold harmless "contractor" from losses, liabilities, damages, penalties and all related costs and expenses (including reasonable attorneys' fees) related to third party lawsuits. The total reimbursement of any claim by owner or third party shall be limited to the total cost of services performed at the property.</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span>&nbsp;</span> */}
                  <b className={styles.disclaimer}>Payment Terms</b>
                  <span >: Customer agrees payment is due upon completion of work, unless otherwise stated on written work order/invoice. Customer agrees that any unpaid balance due shall bear a service charge of 1.5% per month (18% per annum) from date of service until paid. In addition, customer agrees to pay all costs of collection, including reasonable attorneys fees, court costs, mechanic's lien recording fees and other related expenses incurred. Customer agrees any discounts are voided if payment is not paid when due and total invoice will not allow coupons or discounts.</span>
                </p>
                {/* <p className={styles.disclaimerThisReportIsAR}>&nbsp;</p> */}
               
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step10Part3;
