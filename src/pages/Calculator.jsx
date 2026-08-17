import React from 'react';
import { CalcPopover } from '../components/CalcPopover';
import GlobalHistory from '../components/GlobalHistory';

export default function Calculator() {
  return (
    <div className="flex flex-col xl:flex-row justify-center h-auto min-h-[calc(100vh-8rem)] p-4 sm:p-8 gap-6 max-w-[1300px] mx-auto w-full">
      <div className="hidden xl:block flex-shrink-0 w-full xl:w-auto xl:h-[calc(100vh-8rem)]">
        <GlobalHistory />
      </div>
      
      <div className="flex-1 w-full max-w-4xl bg-white dark:bg-gray-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-none border border-gray-200 dark:border-gray-700 rounded-[24px] overflow-hidden flex flex-col xl:h-[calc(100vh-8rem)] transition-colors">
        <CalcPopover isInline={true} />
      </div>
    </div>
  );
}
