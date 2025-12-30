
import React, { useState } from 'react';
import { UserPlus, ShieldCheck, Trash2, Mail, Lock, User, ShieldAlert, Search, Key, CheckCircle, AlertTriangle } from 'lucide-react';
import { UserState } from '../../types';

interface AdminsTabProps {
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
}

const AdminsTab: React.FC<AdminsTabProps> = ({ allUsers, updateAnyUser, deleteAnyUser }) => {
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // حالات إدارة كلمات المرور
  const [userSearch, setUserSearch] = useState('');
  const [selectedUserForPass, setSelectedUserForPass] = useState<UserState | null>(null);
  const [newPasswordForUser, setNewPasswordForUser] = useState('');
  const [isUpdatingPass, setIsUpdatingPass] = useState(false);

  // تصفية المستخدمين للحصول على المشرفين فقط
  const admins = allUsers.filter(u => u?.isAdmin);

  // البحث عن أي مستخدم لتغيير كلمة مروره (مع استثناء المدير العام الرئيسي)
  const foundUsers = (userSearch && userSearch.trim() !== '') 
    ? allUsers.filter(u => {
        if (!u || !u.email) return false;
        // استثناء المدير العام الرئيسي من البحث تماماً لزيادة الأمان
        if (u.email === 'admin@royal.com') return false;
        
        const searchLower = userSearch.toLowerCase();
        return (
          u.email.toLowerCase().includes(searchLower) || 
          (u.id && u.id.includes(userSearch)) || 
          (u.name && u.name.toLowerCase().includes(searchLower))
        );
      }).slice(0, 5) 
    : [];

  const handleCreateAdmin = async () => {
    if (!newAdmin.name || !newAdmin.email || !newAdmin.password) {
      alert('يرجى ملء جميع الحقول');
      return;
    }
    if (newAdmin.password.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanEmail = newAdmin.email.toLowerCase().trim();
      
      const adminData = {
        name: newAdmin.name,
        email: cleanEmail,
        password: newAdmin.password,
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        profilePic: 'https://cdn-icons-png.flaticon.com/512/2206/2206248.png',
        country: 'إدارة النظام 🛠️',
        balanceUSD: 0,
        vip: 99,
        isVerified: true,
        theme: 'light',
        isAdmin: true,
        isBlocked: false,
        isFrozen: false
      };

      await updateAnyUser(cleanEmail, adminData);
      alert('تم إنشاء حساب المشرف بنجاح ✅');
      setNewAdmin({ name: '', email: '', password: '' });
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUserPassword = async () => {
    if (!selectedUserForPass || !newPasswordForUser) return;
    
    // حماية إضافية في الوظيفة نفسها
    if (selectedUserForPass.email === 'admin@royal.com') {
      alert('⚠️ خطأ أمني: لا يمكن تعديل بيانات المدير العام الرئيسي.');
      setSelectedUserForPass(null);
      return;
    }

    if (newPasswordForUser.length < 6) {
      alert('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsUpdatingPass(true);
    try {
      await updateAnyUser(selectedUserForPass.email, { password: newPasswordForUser });
      alert(`تم تحديث كلمة مرور ${selectedUserForPass.name} بنجاح ✅`);
      setSelectedUserForPass(null);
      setNewPasswordForUser('');
      setUserSearch('');
    } catch (error) {
      alert('حدث خطأ أثناء تحديث كلمة المرور');
    } finally {
      setIsUpdatingPass(false);
    }
  };

  const handleRevokeAdmin = async (user: UserState) => {
    if (user.email === 'admin@royal.com') {
      alert('⚠️ خطأ: لا يمكن سحب صلاحيات المدير العام الرئيسي (المؤسس).');
      return;
    }
    if (confirm(`هل أنت متأكد من سحب صلاحيات الإدارة من ${user.name}؟ سيعود مستخدماً عادياً.`)) {
      await updateAnyUser(user.email, { isAdmin: false, vip: 1 });
      alert('تم سحب الصلاحيات بنجاح ✅');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* 1. قسم إدارة كلمات مرور المستخدمين */}
      <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-white/5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-500/10 blur-3xl -z-10"></div>
        
        <div className="flex items-center justify-between mb-2">
          <div className="text-right">
            <h3 className="font-black text-white text-sm">ربط حساب بكلمة سر</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تغيير كلمة مرور أي عضو في الموقع</p>
          </div>
          <div className="w-10 h-10 bg-white/10 text-yellow-400 rounded-xl flex items-center justify-center">
            <Key size={20} />
          </div>
        </div>

        {!selectedUserForPass ? (
          <div className="relative">
            <input 
              type="text" 
              placeholder="ابحث عن المستخدم (Email أو ID)..." 
              value={userSearch} 
              onChange={(e) => setUserSearch(e.target.value)} 
              className="w-full h-12 bg-white/5 rounded-xl px-4 pr-10 text-right font-bold text-white border border-white/10 outline-none focus:border-indigo-400 transition-all text-xs" 
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            
            {/* نتائج البحث السريع */}
            {foundUsers.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-2 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                {foundUsers.map(u => (
                  <button 
                    key={u.email} 
                    onClick={() => setSelectedUserForPass(u)}
                    className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-right"
                  >
                    <span className="text-[10px] text-slate-400 font-bold">#{u.id}</span>
                    <div className="text-right">
                      <p className="text-xs font-black text-white">{u.name}</p>
                      <p className="text-[9px] text-slate-500">{u.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            
            {userSearch.trim() === 'admin@royal.com' && (
              <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-amber-500 text-[10px] font-bold animate-pulse">
                <AlertTriangle size={12} />
                <span>لا يمكن تعديل بيانات المدير العام الرئيسي من هنا</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
               <button onClick={() => { setSelectedUserForPass(null); setNewPasswordForUser(''); }} className="text-[10px] text-red-400 font-black px-2 py-1 bg-red-400/10 rounded-lg">إلغاء</button>
               <div className="text-right">
                  <p className="text-xs font-black text-white">{selectedUserForPass.name}</p>
                  <p className="text-[9px] text-slate-500">{selectedUserForPass.email}</p>
               </div>
            </div>
            <div className="relative">
              <input 
                type="password" 
                placeholder="كلمة المرور الجديدة" 
                value={newPasswordForUser} 
                onChange={(e) => setNewPasswordForUser(e.target.value)} 
                className="w-full h-12 bg-white/5 rounded-xl px-4 pr-10 text-right font-bold text-white border border-white/10 outline-none focus:border-emerald-400 transition-all" 
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            </div>
            <button 
              onClick={handleUpdateUserPassword}
              disabled={isUpdatingPass}
              className="w-full h-12 bg-emerald-500 text-white rounded-xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isUpdatingPass ? 'جاري التحديث...' : 'تأكيد تغيير كلمة المرور'}
              <CheckCircle size={16} />
            </button>
          </div>
        )}
      </div>

      {/* 2. نموذج إضافة مشرف جديد */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-md border border-slate-100 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-right">
            <h3 className="font-black text-slate-800 text-sm">إضافة مشرف عام جديد</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">سيملك صلاحية دخول لوحة التحكم</p>
          </div>
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <UserPlus size={20} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="الاسم الكامل للمشرف" 
              value={newAdmin.name} 
              onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})} 
              className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 outline-none focus:border-indigo-400 transition-all" 
            />
            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>

          <div className="relative">
            <input 
              type="email" 
              placeholder="البريد الإلكتروني (Gmail)" 
              value={newAdmin.email} 
              onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} 
              className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 outline-none focus:border-indigo-400 transition-all" 
            />
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="كلمة السر للمشرف" 
              value={newAdmin.password} 
              onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})} 
              className="w-full h-12 bg-slate-50 rounded-xl px-4 pr-10 text-right font-bold border border-slate-100 outline-none focus:border-indigo-400 transition-all" 
            />
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
          </div>
        </div>

        <button 
          onClick={handleCreateAdmin}
          disabled={isSubmitting}
          className="w-full h-14 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'جاري الإنشاء...' : 'تعيين كمشرف عام'}
          <ShieldCheck size={20} />
        </button>
      </div>

      {/* 3. قائمة المشرفين الحاليين */}
      <div className="space-y-4">
        <h4 className="font-black text-slate-800 text-xs px-2 flex items-center gap-2">
          <ShieldAlert size={16} className="text-amber-500" /> المشرفين الحاليين ({admins.length})
        </h4>
        
        {admins.map(admin => (
          <div key={admin.email} className="bg-white p-4 rounded-[2rem] shadow-sm border border-indigo-50 flex items-center justify-between">
            <div className="flex gap-2">
              {admin.email !== 'admin@royal.com' ? (
                <button 
                  onClick={() => handleRevokeAdmin(admin)}
                  className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                  title="سحب الصلاحيات"
                >
                  <Trash2 size={18} />
                </button>
              ) : (
                <div className="p-2 bg-slate-50 text-slate-300 rounded-xl cursor-not-allowed" title="المدير العام محمي">
                   <ShieldCheck size={18} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <h5 className="font-black text-sm text-slate-800">{admin.name}</h5>
                <p className="text-[10px] font-bold text-slate-400">{admin.email}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                   {admin.email === 'admin@royal.com' && <ShieldCheck size={10} className="text-amber-500" />}
                   <span className={`inline-block px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${admin.email === 'admin@royal.com' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                     {admin.email === 'admin@royal.com' ? 'المدير العام' : 'مشرف عام'}
                   </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-2xl border-2 overflow-hidden shadow-inner ${admin.email === 'admin@royal.com' ? 'border-amber-400' : 'border-indigo-100'}`}>
                <img src={admin.profilePic} className="w-full h-full object-cover" alt="" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminsTab;
