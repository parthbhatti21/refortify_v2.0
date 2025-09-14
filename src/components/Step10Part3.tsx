import React from 'react';

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
            className="absolute w-[511px] h-[700px] top-[45px] left-[19px] flex items-center justify-center"
          >
            <img 
              src="/Step10-3.png" 
              alt="Step 10 Part 2 documentation"
              className="w-[100%] h-[100%] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step10Part3;
