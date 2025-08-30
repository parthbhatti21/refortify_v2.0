import React from 'react';

interface Page2Props {
  formData: {
    clientName: string;
    clientAddress: string;
    chimneyType: string;
    reportDate: string;
  };
  updateFormData: (data: Partial<{ clientName: string; clientAddress: string; chimneyType: string; reportDate: string }>) => void;
  isPDF?: boolean; // Flag to indicate if this is for PDF generation
}

const Page2: React.FC<Page2Props> = ({ formData, updateFormData, isPDF = false }) => {
  return (
    <div className="bg-white grid justify-items-center [align-items:start] w-full">
      <div className="bg-white w-[595px] h-[842px]">
        <div className="relative w-[546px] h-[790px] top-[26px] left-[25px]">
          <p className="absolute w-[487px] top-[370px] left-12 [font-family:'Instrument_Sans-Regular',Helvetica] font-normal text-black text-[15px] tracking-[0] leading-[21px]">
            Virginia Class A Contractor # 2705139016 (Expires March 31,
            <br />
            2027) Master H.V.A.C. # 2710076347 (Expires September 30,
            <br />
            2027)
            <br />
            License Professional Engineer # 0402032901 (Expires January 31,
            <br />
            2027)
            <br />
            Business Engineering Entity # 0407004891 (Expires December 31,
            <br />
            2027)
            <br />
            Fireplace Research Investigation Research &amp; Education Certified
            Inspector
            <br />
            Workers Comp: Brickfield Mutual Insurance Co. WCS3014610
            <br />
            (Expires July 1, 2027)
            <br />
            Commercial General Liability Insurance: Selective Insurance
            <br />S 2447314 (Expires July 1, 2027)
            <br />
            Automobile Liability Insurance: Selective Insurance S 2447314
            <br />
            (Expires July 1, 2027)
            <br />
            Umbrella Liability Insurance: Selective Insurance S 2447314
            <br />
            (Expires July 1, 2027)
            <br />
            State Corporation Commission: Entity ID: 05700364: A Step in
            <br />
            Time, Incorporate
          </p>

          <img
            className="absolute w-[406px] h-[209px] top-[147px] left-[70px] aspect-[1.94] object-cover"
            alt="Screenshot"
            src="/screenshot-2025-08-25-at-09-56-19-1.png"
          />

          <div className="absolute w-[393px] h-[106px] top-[25px] left-[77px]">
            <div className="absolute w-[391px] h-[54px] top-[52px] left-0 bg-black rounded-[36px] border-[6px] border-solid border-[#722420]">
              <div className={`absolute w-[344px] left-4 [font-family:'Inter-Bold',Helvetica] font-bold text-white text-2xl text-center tracking-[0.48px] leading-[normal] whitespace-nowrap ${
                isPDF ? 'top-[-3px]' : 'top-[7px]'
              }`}>
                Service Provided By:
              </div>
            </div>

            <img
              className="absolute w-[124px] h-[52px] top-0 left-[134px] aspect-[2.4] object-cover"
              alt="Logo"
              src="/logo.webp"
            />
          </div>

          <div className="absolute w-[546px] h-[790px] top-0 left-0 border-2 border-solid border-[#722420]">
            <div className="relative w-[536px] h-[780px] top-[3px] left-[3px] border-2 border-solid border-[#722420]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page2;
