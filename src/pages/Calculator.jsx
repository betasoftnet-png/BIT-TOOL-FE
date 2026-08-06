import React from 'react';
import { CalcPopover } from '../components/CalcPopover';

export default function Calculator() {
  return (
    <div className="flex justify-center h-[calc(100vh-8rem)] p-4 sm:p-8">
      <div className="w-full max-w-5xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-gray-200 rounded-[24px] overflow-hidden flex flex-col h-full">
        <CalcPopover isInline={true} />
      </div>
    </div>
  );
}
