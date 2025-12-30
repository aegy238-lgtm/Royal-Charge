
import React, { useState } from 'react';
import { Save, Settings as SettingsIcon, Globe, Image as ImageIcon, Camera, Palette, Type, Trash2, ShieldAlert, MessageCircle } from 'lucide-react';
import { AppConfig } from '../../types';

interface SettingsTabProps {
  appConfig: AppConfig;
  setAppConfig: (cfg: AppConfig) => Promise<void>;
  onDeleteAllOrders?: () => Promise<void>;
}

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 500;
      let width = img.width;
      let height = img.height;
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

const SettingsTab: React.FC<SettingsTabProps> = ({ appConfig, setAppConfig, onDeleteAllOrders }) => {
  const [temp, setTemp] = useState<AppConfig>({...appConfig});
  const [isSaving, setIsSaving] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'backgroundUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setTemp({ ...temp, [field]: compressed });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = () => {
    setTemp({ ...temp, backgroundUrl: '' });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setAppConfig(temp);
      alert('تم حفظ كافة التغييرات بنجاح ✅');
    } catch (e) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setIsSaving(false);
    }
  };

  const ColorInput = ({ label, color, onChange }: { label: string, color: string, onChange: (val: string) => void }) => (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={color} 
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
        />
        <span className="text-xs font-black text-slate-700">{label}</span>
      </div>
      <span className="text-[10px] font-mono text-slate-400 uppercase">{color}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
      
      {/* قسم الهوية والاسم */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Type size={18} className="text-indigo-500" /> هوية الموقع
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-2">اسم التطبيق الرسمي</label>
            <input 
              type="text" 
              value={temp.appName} 
              onChange={(e) => setTemp({...temp, appName: e.target.value})} 
              className="w-full h-14 bg-slate-50 rounded-2xl px-6 font-black text-slate-800 border-2 border-slate-100 outline-none focus:border-yellow-400 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block">لوجو الموقع (Image)</label>
              <label className="relative block w-full h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-yellow-400 transition-all">
                {temp.logoUrl ? <img src={temp.logoUrl} className="w-full h-full object-contain p-4" alt="logo" /> : <div className="flex flex-col items-center justify-center h-full"><Camera className="text-slate-300" /><span className="text-[9px] font-black mt-1 text-slate-400">اختر صورة</span></div>}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
              </label>
            </div>
            
            <div className="space-y-2 text-right">
              <label className="text-[10px] font-black text-slate-400 uppercase mr-2 block">خلفية الموقع (Background)</label>
              <div className="relative group">
                <label className="relative block w-full h-32 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 overflow-hidden cursor-pointer hover:border-yellow-400 transition-all">
                  {temp.backgroundUrl ? <img src={temp.backgroundUrl} className="w-full h-full object-cover" alt="bg" /> : <div className="flex flex-col items-center justify-center h-full"><ImageIcon className="text-slate-300" /><span className="text-[9px] font-black mt-1 text-slate-400">اختر صورة</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'backgroundUrl')} />
                </label>
                {temp.backgroundUrl && (
                  <button 
                    onClick={removeBackground}
                    className="absolute -top-2 -left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* قسم التواصل */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <MessageCircle size={18} className="text-green-500" /> إعدادات التواصل
        </h3>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase mr-2">رقم الواتساب (بالكود الدولي بدون +)</label>
          <div className="relative">
            <input 
              type="text" 
              value={temp.whatsappNumber || ''} 
              onChange={(e) => setTemp({...temp, whatsappNumber: e.target.value})} 
              placeholder="مثال: 201000000000"
              className="w-full h-14 bg-slate-50 rounded-2xl px-12 font-black text-slate-800 border-2 border-slate-100 outline-none focus:border-green-400 transition-all"
            />
            <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={20} />
          </div>
        </div>
      </div>

      {/* قسم الألوان */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Palette size={18} className="text-pink-500" /> ألوان الموقع
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          <ColorInput 
            label="اللون الأساسي (Primary)" 
            color={temp.themeColors.primary} 
            onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, primary: val}})} 
          />
          <ColorInput 
            label="لون الخلفية الأساسي" 
            color={temp.themeColors.background} 
            onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, background: val}})} 
          />
          <ColorInput 
            label="لون النصوص" 
            color={temp.themeColors.text} 
            onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, text: val}})} 
          />
          <ColorInput 
            label="لون الأسطح (Cards)" 
            color={temp.themeColors.surface} 
            onChange={(val) => setTemp({...temp, themeColors: {...temp.themeColors, surface: val}})} 
          />
        </div>
      </div>

      {/* قسم الإعدادات المالية */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-6">
        <h3 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-4">
          <Globe size={18} className="text-emerald-500" /> إعدادات الصرف
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-2">سعر الدولار (EGP)</label>
            <input type="number" value={temp.usdToEgpRate} onChange={(e) => setTemp({...temp, usdToEgpRate: parseFloat(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl px-4 font-black text-center text-indigo-600" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase mr-2">سعر الألماس ($)</label>
            <input type="number" step="0.001" value={temp.diamondPriceUSD} onChange={(e) => setTemp({...temp, diamondPriceUSD: parseFloat(e.target.value)})} className="w-full h-12 bg-slate-50 rounded-xl px-4 font-black text-center text-blue-600" />
          </div>
        </div>

        <div className="space-y-1">
           <label className="text-[10px] font-black text-slate-400 uppercase mr-2">شريط الإعلانات الترحيبي</label>
           <textarea value={temp.welcomeAnnouncement} onChange={(e) => setTemp({...temp, welcomeAnnouncement: e.target.value})} className="w-full h-20 bg-slate-50 rounded-xl p-4 font-bold text-xs border border-slate-100 resize-none text-right" />
        </div>
      </div>

      {/* قسم صيانة النظام */}
      <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 space-y-6">
        <h3 className="font-black text-red-600 flex items-center gap-2 border-b border-red-100 pb-4">
          <ShieldAlert size={18} /> صيانة النظام
        </h3>
        
        <div className="space-y-3">
          <p className="text-[10px] font-bold text-red-400 text-right px-2 leading-relaxed">
            استخدم هذه الخيارات بحذر شديد. حذف الطلبات سيؤدي لمسح كافة العمليات السابقة من سجلات المستخدمين.
          </p>
          <button 
            onClick={onDeleteAllOrders}
            className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> تصفير جميع الطلبات نهائياً
          </button>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-[120]">
        <button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full h-16 bg-slate-900 text-yellow-400 rounded-[2rem] font-black text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <div className="w-6 h-6 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
          ) : (
            <>
              <Save size={20} /> حفظ كافة التغييرات
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
