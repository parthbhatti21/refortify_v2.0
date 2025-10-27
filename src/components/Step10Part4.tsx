import React from 'react';
import styles from './Step10Part3.module.css';

interface Step10Part4Props {
  isPDF?: boolean;
  chimneyType?: string;
}

export const Step10Part4: React.FC<Step10Part4Props> = ({ isPDF = false, chimneyType = 'masonry' }) => {
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
             
              <div className={styles.disclaimerThisReportContainer}>
              <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Discounts</b>
                  <span>: All discounts including coupons must be presented at time of service.</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Bad Checks</b>
                  <span>{`: Customer understands that if customer's check does not clear, a $35 return check fee will apply.
`}</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Delays: </b>
                  <span>: Any delay caused by events beyond the control of the contractor shall not constitute abandonment and shall not be included in calculating time frames for payment or performances.</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span>&nbsp;</span>  */}
                  <b className={styles.disclaimer}>Cancellation</b>
                  <span >: All sales are final upon signed written work order/invoice. If customer cancels work order, the entire amount of contract is due. Additionally, no refunds of deposit money will be provided if customer cancels work order.</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span className={styles.disclaimer}>&nbsp;< //span> */}
                  <b className={styles.disclaimer}>Customer agreement</b>
                  <span>: Customer acknowledges work provided was not the result of a door-to-door home solicitation sale.
</span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  {/* <span>&nbsp;</span> */}
                  <b className={styles.disclaimer}>Governing Law</b>
                  <span >
                  : This agreement will be governed by, construed and enforced in accordance with the laws of the state where the service is performed. Only written and no verbal agreements will be honoured. This service and agreement are between the "contractor" listed on the top right-hand portion of the service report and the customer listed above the contractor. A Step in Time is a contractor matching service, matching the contractor to the customer and is not part of this agreement. The parties agree that the courts in the state of where the service is performed shall have exclusive jurisdiction over any disputes under or related to this agreement.
                  </span>
                </p>
                {/* <p className={styles.disclaimerThisReportIsAR}>&nbsp;</p> */}
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Date work begins/ends</b>
                  <span>: Date begins at time of proposal acceptance and deposit is made and ends no later than 90 days after deposit unless otherwise noted.
                  </span>
                </p>
                <p className={styles.disclaimerThisReportIsAR}>
                  <b className={styles.disclaimer}>Total cost & payments</b>
                  <span>
                  : Total cost of job and deposit required (no deposit required if not specified on front of invoice) is listed on front of invoice and final payment minus any deposit is due at completion of job unless otherwise noted on front of invoice.
 </span><span><br /> Listing of Specified Materials and detailed work to be performed is available at owner's specified request.
 </span>
                </p>
                 <p className={styles.disclaimerThisReportIsAR}>
                   <b className={styles.disclaimer}>Delays</b>
                   <span>: Any delay caused by events beyond the control of the contractor shall not constitute abandonment and shall not be included in calculating time frames for payment or performances. Contractor will comply with all local building code requirements for permits, inspection and zoning.</span>
                 </p>
                 <p className={styles.disclaimerThisReportIsAR}>
                   <b className={styles.disclaimer}>Cancellation</b>
                   <span>: All sales are final upon signed written work order invoice. If customer cancels work order, the entire amount of contract is due. Additionally, no refunds of deposit money will be provided if customer cancels work order.</span>
                 </p>
                 <p className={styles.disclaimerThisReportIsAR}>
                   <b className={styles.disclaimer}>Customer Acknowledgements</b>
                   <span>: Customer acknowledges work provided was not the result of a door-to-door home solicitation sale.</span>
                 </p>
                 <p className={styles.disclaimerThisReportIsAR}>
                   <b className={styles.disclaimer}>Contractor information</b>
                   <span>: A Step in Time, Inc/349 Dorsey Ln. Virginia Beach Va. 23451/Lic #2705139016/CBC & RBC & HVAC.</span>
                 </p>
                 <p className={styles.disclaimerThisReportIsAR}>
                   <b className={styles.disclaimer}>Changes</b>
                   <span>: any modification to the contract, which changes the cost, materials, work to be performed, or estimated completion date, must be in writing and signed by all parties Notice: Virginia Contractor Transaction Recovery Fund can be contacted at (804) 367-1559 and e-mail address is RecoveryFund@dpor.virginia.gov</span>
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step10Part4;


