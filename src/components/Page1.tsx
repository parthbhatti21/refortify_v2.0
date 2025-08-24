import React from 'react';

interface Page1Props {
  formData: {
    clientName: string;
    clientAddress: string;
    chimneyType: string;
  };
  updateFormData: (data: Partial<{ clientName: string; clientAddress: string; chimneyType: string }>) => void;
}

const Page1: React.FC<Page1Props> = ({ formData, updateFormData }) => {
  return (
    <div className="bg-white grid justify-items-center [align-items:start] w-full">
    <div className="bg-white overflow-hidden w-full max-w-[595px] h-auto aspect-[595/842] relative scale-75 sm:scale-90 lg:scale-100">
        <header className="absolute w-[687px] h-[188px] top-[-34px] left-[-46px] bg-transparent">
            <img
                className="absolute w-[238px] h-[99px] top-[53px] left-[225px] aspect-[2.4] object-cover"
                alt="Logo"
                src={"/logo.webp"}
            />

            <div className="absolute w-[203px] h-[188px] top-0 left-0">
                <div className="relative w-[199px] h-[188px] bg-[#722420] rounded-[48px]">
                    <div className="w-[114px] top-20 left-[71px] [font-family:'Inter-Bold',Helvetica] font-bold text-[23px] absolute text-white tracking-[0] leading-[normal]">
                        Chimney
                        <br />
                        Report
                    </div>

                    <div className="absolute w-11 top-36 left-[71px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-sm tracking-[0] leading-[normal] whitespace-nowrap">
                        {(() => {
                            const date = new Date();
                            const day = date.getDate().toString().padStart(2, '0');
                            const month = date.toLocaleDateString('en-GB', { month: 'short' });
                            const year = date.getFullYear();
                            return `${day}-${month}-${year}`;
                        })()}
                    </div>
                </div>
            </div>

            <div className="absolute w-[199px] h-[188px] top-0 left-[488px]">
                <div className="relative h-[188px] rounded-[48px]">
                    <div className="absolute w-[199px] h-[188px] top-0 left-0 bg-[#722420] rounded-[48px] rotate-180" />

                    <img
                        className="absolute w-[126px] h-[120px] top-[47px] left-[19px] aspect-[1.05] rounded-full"
                        alt="License"
                        src={"/license.webp"}
                    />
                </div>
            </div>
        </header>

        <div className="absolute w-[465px] h-[67px] top-[175px] left-[66px]">
            <div className="relative w-[463px] h-[67px] bg-black rounded-[36px] border-[12px] border-solid border-[#722420]">
                <div className="absolute w-[402px] top-1.5 left-[19px] [font-family:'Inter-Bold',Helvetica] font-bold text-white text-[25px] text-center tracking-[0] leading-[normal] whitespace-nowrap">
                    Chimney&nbsp;&nbsp;Inspection&nbsp;&nbsp;Report
                </div>
            </div>
        </div>

        <div className="absolute w-[595px] h-[318px] top-[255px] left-0">
            {formData.chimneyType === "masonry" ? (
              <div className="absolute w-[284px] h-[318px] top-0 left-[0] bg-[#d9d9d9]" style={{ position: 'relative' }}>
                <img 
                  className="w-full h-full" 
                  src="/masonry.webp" 
                  alt="Masonry Chimney"
                  style={{ display: 'block' }} 
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    backgroundColor: 'white',
                  }}
                />
              </div>
            ) : (
              <img 
                className="absolute w-[284px] h-[318px] top-0 left-[0] bg-[#d9d9d9]" 
                src="/prefabricated.webp" 
                alt="Prefabricated Chimney"
              />
            )}

            <div className="absolute w-[284px] h-[220px] top-[49px] left-[311px] bg-[#d9d9d9]" />
        </div>

        <footer className="absolute w-[711px] h-[325px] top-[645px] left-[-53px] bg-transparent">
            <div className="relative w-[699px] h-[327px]">
                <div className="absolute w-[595px] h-[196px] top-0 left-[53px] bg-[#722420] rounded-t-[102px]" />

                <p className="absolute w-[310px] top-12 left-[196px] [font-family:'Inter-Regular',Helvetica] font-normal text-white text-[17px] text-center tracking-[0] leading-[normal]">
                    3500 Virginia Beach, Virginia 23452
                    <br />
                    833-244-6639
                </p>

                <div className="absolute w-[220px] top-5 left-[241px] [font-family:'Inter-SemiBold',Helvetica] font-semibold text-white text-[22px] text-center tracking-[0] leading-[normal]">
                    A Step In Time
                </div>

                <div className="absolute w-[225px] top-[136px] left-[30px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[0] leading-[normal] whitespace-nowrap">
                    Services We Offer
                </div>

                <div className="absolute w-[225px] top-[130px] left-[443px] [font-family:'Inter-Medium',Helvetica] font-medium text-white text-sm text-center tracking-[0] leading-[normal] whitespace-nowrap">
                    Report generated by
                </div>

                <p className="w-[263px] top-[130px] left-[219px] [font-family:'Inter-Medium',Helvetica] font-medium text-sm text-center absolute text-white tracking-[0] leading-[normal]">
                    Chimney Inspections, Cleaning
                    <br />
                    &amp; Chimney Repairs
                </p>

                <div className="w-[263px] top-[150px] left-[425px] [font-family:'Inter-ExtraBold',Helvetica] font-extrabold text-sm text-center absolute text-white tracking-[0] leading-[normal]">
                    ChimneySweeps.com
                </div>

                <div className="absolute w-[235px] h-[110px] top-[103px] left-[232px] border-t-[3px] border-l-[3px] border-r-[3px] border-solid border-white" />

                <div className="absolute w-[235px] h-[110px] top-[103px] left-[0] border-l-[3px] border-t-[3px] border-r-[3px] border-solid border-white" />

                <div className="absolute w-[235px] h-[110px] top-[103px] left-[464px] border-l-[3px] border-t-[3px] border-r-[3px] border-solid border-white" />
            </div>
        </footer>

        <div className="absolute w-[80%] h-[49px] top-[583px] left-1/2 transform -translate-x-1/2 flex flex-col items-center justify-center">
            <div className="w-full h-[25px] [font-family:'Inter-Bold',Helvetica] font-bold text-black text-[25px] text-center tracking-[0] leading-[normal] flex items-center justify-center">
                {formData.clientName || 'C1'}
            </div>

            <div className="w-full h-[17px] mt-2 [font-family:'Inter-Regular',Helvetica] font-normal text-black text-[17px] text-center tracking-[0] leading-[normal] flex items-center justify-center">
                {formData.clientAddress || 'a1'}
            </div>
        </div>
    </div>
</div>
  );
};

export default Page1;
