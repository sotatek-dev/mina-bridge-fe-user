'use client';
import dynamic from 'next/dynamic';

const HistoryContent = dynamic(() => import('./content'), { ssr: false });
const HistoryProvider = dynamic(() => import('./context'), { ssr: false });

const History = () => {
  return (
    <HistoryProvider>
      <HistoryContent />
    </HistoryProvider>
  );
};

export default History;
