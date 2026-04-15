import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface CheckIn {
  id: string;
  timestamp: Date;
  status: 'ok' | 'missed';
  note?: string;
}

interface CheckInHistoryProps {
  checkins: CheckIn[];
}

export default function CheckInHistory({ checkins }: CheckInHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-serif italic text-calm-900">Recent Check-ins</h2>
        <p className="text-[10px] font-bold text-calm-400 uppercase tracking-widest">Last 7 Days</p>
      </div>
      
      <div className="space-y-3">
        {checkins.map((checkin) => (
          <div 
            key={checkin.id} 
            className="p-4 rounded-2xl border border-calm-100 bg-white flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  checkin.status === 'ok' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                }`}>
                  {checkin.status === 'ok' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-sm text-calm-900">
                    {checkin.status === 'ok' ? 'Safe Check-in' : 'Missed Check-in'}
                  </p>
                  <p className="text-[10px] text-calm-400 font-medium">
                    {format(checkin.timestamp, 'EEEE, MMM d • h:mm a')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-calm-300 uppercase tracking-tighter">
                <Clock className="w-3 h-3" />
                {format(checkin.timestamp, 'HH:mm')}
              </div>
            </div>

            {checkin.note && (
              <div className="px-4 py-3 bg-calm-50 rounded-xl border border-calm-100">
                <p className="text-xs text-calm-600 italic">"{checkin.note}"</p>
              </div>
            )}
          </div>
        ))}
        
        {checkins.length === 0 && (
          <div className="text-center py-12 text-calm-400 font-serif italic bg-white rounded-3xl border border-dashed border-calm-200">
            No check-in history yet.
          </div>
        )}
      </div>
    </div>
  );
}
