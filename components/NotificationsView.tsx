
import React from 'react';
import { Search, Bell, CheckCircle, Info } from 'lucide-react';
import { Notification } from '../types';

interface NotificationsViewProps {
  notifications: Notification[];
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications }) => {
  return (
    <div className="p-4 pb-32 animate-in fade-in duration-500 bg-white min-h-screen">
      <div className="mb-4">
         <h2 className="text-xl font-black text-slate-800 text-right">الإشعارات</h2>
      </div>

      {/* Date Filters */}
      <div className="flex gap-3 items-center mb-6">
        <div className="flex-1 relative">
           <label className="absolute -top-2 right-4 bg-white px-2 text-[9px] font-bold text-slate-400">من</label>
           <div className="w-full h-12 border-2 border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">2025-12-30</div>
        </div>
        <div className="flex-1 relative">
           <label className="absolute -top-2 right-4 bg-white px-2 text-[9px] font-bold text-slate-400">الى</label>
           <div className="w-full h-12 border-2 border-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 text-sm">2025-12-30</div>
        </div>
      </div>

      <div className="flex items-center justify-center mb-10">
        <button className="bg-[#facc15] w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-yellow-200/50">
          <Search size={24} className="text-white" />
        </button>
      </div>

      {/* Notifications List or Empty State */}
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 shadow-sm flex items-start gap-4 rtl">
              <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notif.type === 'recharge_success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                {notif.type === 'recharge_success' ? <CheckCircle size={20} /> : <Info size={20} />}
              </div>
              <div className="flex-1 text-right">
                <h4 className="font-black text-sm text-slate-800 mb-1">{notif.title}</h4>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">{notif.message}</p>
                <div className="mt-2 text-[9px] text-slate-400 font-black">{notif.date}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 opacity-60">
          <div className="relative w-32 h-32 mb-4">
             <div className="absolute top-0 right-2 w-20 h-28 bg-white border-2 border-slate-200 rounded-md shadow-sm transform -rotate-6 flex flex-col p-2">
                <div className="w-8 h-2 bg-indigo-500 rounded-full mx-auto mb-2"></div>
             </div>
             <div className="absolute top-4 left-2 w-20 h-28 bg-white border-2 border-slate-200 rounded-md shadow-md flex flex-col p-2 z-10">
                <div className="w-8 h-2 bg-indigo-500 rounded-full mx-auto mb-2"></div>
             </div>
          </div>
          <p className="font-bold text-slate-400">لا توجد إشعارات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
