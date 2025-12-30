
import React, { useState } from 'react';
import { Mail, User, MapPin, Camera, Lock, ShieldCheck, UserPlus, LogIn, Loader2 } from 'lucide-react';
import { UserState } from '../types';

interface LoginViewProps {
  onLogin: (email: string, password: string, userData?: Partial<UserState>, isSignup?: boolean) => Promise<void>;
  appName: string;
  logoUrl: string;
}

const compressImage = (base64Str: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 400;
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  });
};

const LoginView: React.FC<LoginViewProps> = ({ onLogin, appName, logoUrl }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('مصر 🇪🇬');
  const [profilePic, setProfilePic] = useState('https://picsum.photos/seed/user/200');
  const [isLoading, setIsLoading] = useState(false);

  const countries = [
    { name: 'مصر 🇪🇬', value: 'مصر 🇪🇬' },
    { name: 'السعودية 🇸🇦', value: 'السعودية 🇸🇦' },
    { name: 'العراق 🇮🇶', value: 'العراق 🇮🇶' },
    { name: 'تركيا 🇹🇷', value: 'تركيا 🇹🇷' },
    { name: 'الإمارات 🇦🇪', value: 'الإمارات 🇦🇪' },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string);
        setProfilePic(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    
    const cleanEmail = email?.toLowerCase()?.trim();
    
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert('يرجى إدخال بريد إلكتروني صحيح');
      return;
    }
    if (password.length < 6) {
      alert('كلمة السر يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    try {
      if (activeTab === 'signup') {
        if (username.length < 3) {
          alert('اسم المستخدم قصير جداً');
          setIsLoading(false);
          return;
        }
        await onLogin(cleanEmail, password, {
          name: username,
          profilePic: profilePic,
          country: country,
        }, true);
      } else {
        await onLogin(cleanEmail, password, undefined, false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0000FF] flex flex-col items-center justify-start overflow-y-auto no-scrollbar py-10 px-6 rtl font-['Cairo'] relative" dir="rtl">
      <div className="fixed top-[-5%] right-[-5%] w-80 h-80 bg-yellow-400/20 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-80 h-80 bg-red-600/20 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] z-10 my-auto animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          {/* تعديل مقاس اللوجو ليكون كبيراً وواضحاً وبدون خلفية بيضاء */}
          <div className="w-32 h-32 mb-6 relative flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden shadow-[0_0_40px_rgba(250,204,21,0.4)] border-4 border-white/20 transition-transform hover:scale-105 duration-300">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">{appName}</h1>
          <div className="w-12 h-1 bg-yellow-400 rounded-full mt-2 shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
        </div>

        <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-[2rem] mb-6 border border-white/10 w-full shadow-lg">
          <button 
            disabled={isLoading}
            onClick={() => setActiveTab('signup')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] font-black text-xs transition-all ${activeTab === 'signup' ? 'bg-yellow-400 text-slate-900 shadow-xl scale-105' : 'text-white/60 hover:text-white disabled:opacity-50'}`}
          >
            <UserPlus size={16} /> إنشاء حساب
          </button>
          <button 
            disabled={isLoading}
            onClick={() => setActiveTab('login')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.8rem] font-black text-xs transition-all ${activeTab === 'login' ? 'bg-yellow-400 text-slate-900 shadow-xl scale-105' : 'text-white/60 hover:text-white disabled:opacity-50'}`}
          >
            <LogIn size={16} /> تسجيل دخول
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/20 shadow-2xl relative overflow-hidden w-full">
          {activeTab === 'signup' && (
            <div className="flex flex-col items-center mb-6 animate-in slide-in-from-top-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-[2rem] border-4 border-yellow-400 overflow-hidden bg-white/5 shadow-2xl">
                  <img src={profilePic} className="w-full h-full object-cover" alt="Avatar" />
                </div>
                <label className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 p-2 rounded-2xl shadow-xl cursor-pointer border-4 border-[#0000FF] active:scale-90 transition-transform">
                  <Camera size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              <p className="text-white/60 font-black text-[10px] mt-3 uppercase tracking-widest">الصورة الشخصية</p>
            </div>
          )}

          <div className="space-y-4">
            {activeTab === 'signup' && (
              <div className="relative group animate-in slide-in-from-right-4">
                <input 
                  type="text" 
                  disabled={isLoading}
                  placeholder="اسم المستخدم" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/30 disabled:opacity-50"
                />
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400" size={18} />
              </div>
            )}

            <div className="relative group">
              <input 
                type="email" 
                disabled={isLoading}
                placeholder="البريد الإلكتروني" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/30 disabled:opacity-50"
              />
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400" size={18} />
            </div>

            <div className="relative group">
              <input 
                type="password" 
                disabled={isLoading}
                placeholder="كلمة السر" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all placeholder:text-white/30 disabled:opacity-50"
              />
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400" size={18} />
            </div>

            {activeTab === 'signup' && (
              <div className="relative group animate-in slide-in-from-right-4">
                <select 
                  disabled={isLoading}
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-12 text-right text-white text-sm font-bold outline-none focus:border-yellow-400 transition-all appearance-none disabled:opacity-50"
                >
                  {countries.map((c, idx) => (
                    <option key={idx} value={c.value} className="text-slate-900">
                      {c.name}
                    </option>
                  ))}
                </select>
                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400" size={18} />
              </div>
            )}

            <button 
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full h-16 bg-yellow-400 text-slate-900 rounded-2xl font-black text-base shadow-2xl shadow-yellow-400/30 active:scale-95 transition-all mt-6 flex items-center justify-center gap-3 disabled:bg-yellow-400/50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  {activeTab === 'signup' ? 'إكمال التسجيل' : 'دخول للمنصة'} 
                  <ShieldCheck size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-2 opacity-50">
          <p className="text-white text-[10px] font-black uppercase tracking-[0.4em]">Securely Powered By Royal Charge</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
