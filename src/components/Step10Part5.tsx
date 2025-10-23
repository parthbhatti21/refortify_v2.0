import React from 'react';

interface Step10Part5Props {
  isPDF?: boolean;
  chimneyType?: string;
}

export const Step10Part5: React.FC<Step10Part5Props> = ({ isPDF = false, chimneyType = 'masonry' }) => {
  return (
    <div className="bg-white grid justify-items-center [align-items:start] w-full">
      <div className="bg-white w-[590px] h-[842px]">
        <div 
          className="relative w-[590px] h-[842px] "
          // style={isPDF ? {
          //   left: '22.5px'
          // } : {
          //   left: '25px'
          // }}
        >
          
          <div 
            className="absolute w-[590px] h-[842px] top-[0px] left-[0px] flex items-center justify-center"
          >
            <img 
              src="/page17.png" 
              alt="Step 10 Part 2 documentation"
              className="w-[100%] h-[100%] object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step10Part5;
