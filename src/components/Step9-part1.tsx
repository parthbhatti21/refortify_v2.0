import React from "react";

interface Page9Part1Props {
  isPDF?: boolean;
  chimneyType?: string;
}

export const Page9Part1: React.FC<Page9Part1Props> = ({ isPDF = false, chimneyType = 'masonry' }) => {



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
            className="absolute w-[511px] h-[700px] top-[45px] left-[19px] flex items-center justify-center"
          >
            <img 
              src={chimneyType === 'prefabricated' ? '/Prefeb-1.png' : '/Masonry-1.png'} 
              alt={`${chimneyType} chimney documentation`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page9Part1;
