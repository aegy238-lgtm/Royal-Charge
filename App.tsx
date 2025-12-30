
import React, { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc,
  getDocs,
  query, 
  orderBy,
  where
} from 'firebase/firestore';
import { db } from './lib/firebase';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import HomeView from './components/HomeView';
import WalletView from './components/WalletView';
import OrdersView from './components/OrdersView';
import SearchView from './components/SearchView';
import NotificationsView from './components/NotificationsView';
import ProfileEditView from './components/ProfileEditView';
import CartView from './components/CartView';
import RechargeView, { RECHARGE_METHODS as DEFAULT_METHODS } from './components/RechargeView';
import RechargeDetailsView from './components/RechargeDetailsView';
import AdminView from './components/AdminView';
import PurchaseModal from './components/PurchaseModal';
import LoginView from './components/LoginView';
import { ViewType, UserState, Order, Product, Category, AppConfig, RechargeMethod, Notification } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedRechargeMethod, setSelectedRechargeMethod] = useState<RechargeMethod | null>(null);
  const [selectedProductForPurchase, setSelectedProductForPurchase] = useState<Product | null>(null);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [appConfig, setAppConfig] = useState<AppConfig>({
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/9402/9402325.png',
    appName: 'ROYAL-CHARGE',
    usdToEgpRate: 50,
    globalUsdToCoinRate: 100,
    diamondPriceUSD: 0.01,
    welcomeAnnouncement: 'مرحباً بك في ROYAL-CHARGE، منصة شحن الألعاب الأولى!',
    banners: [],
    whatsappNumber: '', // القيمة الافتراضية
    themeColors: {
      primary: '#facc15',
      secondary: '#0f172a',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#000000'
    }
  });

  const [user, setUser] = useState<UserState | null>(() => {
    const saved = localStorage.getItem('royal_user');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      return (parsed && parsed.email) ? parsed : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rechargeMethods, setRechargeMethods] = useState<RechargeMethod[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allUsers, setAllUsers] = useState<UserState[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', appConfig.themeColors.primary);
    root.style.setProperty('--color-secondary', appConfig.themeColors.secondary);
    root.style.setProperty('--color-background', appConfig.themeColors.background);
    root.style.setProperty('--color-surface', appConfig.themeColors.surface);
    root.style.setProperty('--color-text', appConfig.themeColors.text);
  }, [appConfig.themeColors]);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "settings", "appConfig"), (docSnap) => {
      if (docSnap.exists()) {
        setAppConfig(docSnap.data() as AppConfig);
      }
    });
    const unsubCats = onSnapshot(collection(db, "categories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category)));
    });
    return () => { unsubConfig(); unsubCats(); };
  }, []);

  useEffect(() => {
    const unsubProds = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    });
    const unsubMethods = onSnapshot(collection(db, "rechargeMethods"), (snap) => {
      setRechargeMethods(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
    });
    return () => { unsubProds(); unsubMethods(); };
  }, []);

  useEffect(() => {
    if (!user || !user.email) return;
    const emailKey = user.email.toLowerCase().trim();
    const unsubUser = onSnapshot(doc(db, "users", emailKey), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as UserState;
        if (data.isBlocked) {
          alert("تم حظر حسابك.");
          setUser(null);
          localStorage.removeItem('royal_user');
          return;
        }
        setUser(data);
        localStorage.setItem('royal_user', JSON.stringify(data));
      }
    });

    let unsubOrders: () => void;
    if (user.isAdmin) {
      const q = query(collection(db, "orders"), orderBy("date", "desc"));
      unsubOrders = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
      });
      onSnapshot(collection(db, "users"), (snap) => {
        setAllUsers(snap.docs.map(doc => doc.data() as UserState));
      });
    } else {
      const q = query(collection(db, "orders"), where("userId", "==", emailKey), orderBy("date", "desc"));
      unsubOrders = onSnapshot(q, (snap) => {
        setOrders(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as any)));
      });
    }
    return () => { unsubUser(); unsubOrders && unsubOrders(); };
  }, [user?.email, user?.isAdmin]);

  const handleUpdateProfile = async (updatedFields: Partial<UserState>) => {
    if (!user?.email) return;
    const emailKey = user.email.toLowerCase().trim();
    await updateDoc(doc(db, "users", emailKey), updatedFields);
  };

  const handleLogin = async (email: string, password: string, extraData?: Partial<UserState>, isSignup?: boolean) => {
    const cleanEmail = email?.toLowerCase()?.trim();
    const userRef = doc(db, "users", cleanEmail);
    const userSnap = await getDoc(userRef);

    if (isSignup) {
      if (userSnap.exists()) {
        alert("مسجل مسبقاً");
        return;
      }
      const newUser: UserState = {
        name: extraData?.name || 'مستخدم', email: cleanEmail, password,
        id: Math.floor(1000 + Math.random() * 9000).toString(),
        profilePic: extraData?.profilePic || '', country: extraData?.country || 'مصر 🇪🇬',
        balanceUSD: 0, vip: 1, isVerified: true, theme: 'light',
        isAdmin: cleanEmail === 'admin@royal.com', isBlocked: false, isFrozen: false
      };
      await setDoc(userRef, newUser);
      setUser(newUser);
    } else {
      if (!userSnap.exists()) {
        alert("غير موجود");
        return;
      }
      const userData = userSnap.data() as UserState;
      if (userData.password !== password) {
        alert("كلمة السر خطأ");
        return;
      }
      setUser(userData);
    }
  };

  const handlePurchase = async (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => {
    if (!user) return false;
    const finalPrice = customPriceUSD || product.priceUSD;
    if (user.balanceUSD < finalPrice) {
      alert('رصيدك غير كافٍ');
      return false;
    }

    await updateDoc(doc(db, "users", user.email), { balanceUSD: user.balanceUSD - finalPrice });
    await addDoc(collection(db, "orders"), {
      productName: product.name, priceUSD: finalPrice, priceEGP: finalPrice * appConfig.usdToEgpRate,
      coinsAmount: coins || product.amount, date: new Date().toISOString(), status: 'pending',
      playerId: idValue, userId: user.email, type: 'product'
    });
    alert('تم الطلب بنجاح ✅');
    return true;
  };

  const handleDeleteAllOrders = async () => {
    if (!confirm('⚠️ تحذير نهائي: هل أنت متأكد من حذف كافة الطلبات من السجل تماماً؟ لا يمكن استرجاع البيانات بعد الحذف.')) return;
    if (!confirm('هل أنت متأكد حقاً؟ سيتم تصفير قائمة الطلبات لجميع المستخدمين.')) return;

    try {
      const ordersSnap = await getDocs(collection(db, "orders"));
      const deletePromises = ordersSnap.docs.map(d => deleteDoc(doc(db, "orders", d.id)));
      await Promise.all(deletePromises);
      alert('تم حذف جميع الطلبات بنجاح ✅');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء محاولة الحذف.');
    }
  };

  if (!user) return <LoginView onLogin={handleLogin} appName={appConfig.appName} logoUrl={appConfig.logoUrl} />;

  const mainContainerStyle: React.CSSProperties = {
    backgroundColor: appConfig.backgroundUrl ? 'transparent' : 'var(--color-background)',
    backgroundImage: appConfig.backgroundUrl ? `url(${appConfig.backgroundUrl})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    color: 'var(--color-text)'
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[500px] mx-auto relative overflow-hidden font-['Cairo'] shadow-2xl transition-all" style={mainContainerStyle}>
      {appConfig.backgroundUrl && currentView !== 'admin' && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] pointer-events-none -z-10"></div>
      )}

      {currentView !== 'admin' && <Header onMenuClick={() => setIsSidebarOpen(true)} currentView={currentView} onBack={() => setCurrentView('home')} appConfig={appConfig} />}
      
      <main className="flex-1 overflow-y-auto no-scrollbar w-full relative z-10">
        {currentView === 'home' && <HomeView user={user} appConfig={appConfig} onPurchase={handlePurchase} products={products} banners={appConfig.banners} categories={categories} />}
        {currentView === 'wallet' && <WalletView user={user} orders={orders} appConfig={appConfig} />}
        {currentView === 'orders' && <OrdersView orders={orders} />}
        {currentView === 'notifications' && <NotificationsView notifications={notifications} />}
        {currentView === 'recharge' && <RechargeView rechargeMethods={rechargeMethods} onSelectMethod={(m) => { setSelectedRechargeMethod(m); setCurrentView('recharge_details'); }} />}
        {currentView === 'recharge_details' && selectedRechargeMethod && <RechargeDetailsView method={selectedRechargeMethod} onConfirm={async (amt, sender, pId, img) => {
           await addDoc(collection(db, "orders"), { productName: 'إيداع', priceUSD: amt, date: new Date().toISOString(), status: 'pending', type: 'recharge', userId: user.email, playerId: pId, screenshot: img });
           alert('قيد المراجعة ✅'); setCurrentView('home');
        }} />}
        {currentView === 'search' && <SearchView products={products} onPurchase={handlePurchase} appConfig={appConfig} user={user} />}
        {currentView === 'cart' && <CartView cartItems={cartItems} setCartItems={setCartItems} onCheckout={(p) => { setSelectedProductForPurchase(p); setIsPurchaseModalOpen(true); }} appConfig={appConfig} />}
        {currentView === 'profile_edit' && <ProfileEditView user={user} appConfig={appConfig} setUser={handleUpdateProfile} onBack={() => setCurrentView('home')} />}
        {currentView === 'admin' && (
           <AdminView 
             products={products} setProducts={async (id, data) => id ? updateDoc(doc(db, "products", id), data) : addDoc(collection(db, "products"), data)} deleteProduct={id => deleteDoc(doc(db, "products", id))}
             categories={categories} addCategory={data => addDoc(collection(db, "categories"), data)} deleteCategory={id => deleteDoc(doc(db, "categories", id))}
             rechargeMethods={rechargeMethods} setRechargeMethod={async (id, data) => id ? updateDoc(doc(db, "rechargeMethods", id), data) : addDoc(collection(db, "rechargeMethods"), data)} deleteRechargeMethod={id => deleteDoc(doc(db, "rechargeMethods", id))}
             orders={orders} allUsers={allUsers} 
             updateAnyUser={(email, data) => updateDoc(doc(db, "users", email), data)} deleteAnyUser={email => deleteDoc(doc(db, "users", email))}
             appConfig={appConfig} setAppConfig={cfg => updateDoc(doc(db, "settings", "appConfig"), cfg as any)}
             onBack={() => setCurrentView('home')}
             onDeleteAllOrders={handleDeleteAllOrders}
             onUpdateOrder={async (id, status, reply) => {
                const orderRef = doc(db, "orders", id);
                const oData = (await getDoc(orderRef)).data() as Order;
                await updateDoc(orderRef, { status, adminReply: reply });
                if (status === 'completed' && oData.type === 'recharge') {
                  const uRef = doc(db, "users", oData.userId);
                  const uSnap = await getDoc(uRef);
                  if (uSnap.exists()) await updateDoc(uRef, { balanceUSD: uSnap.data().balanceUSD + oData.priceUSD });
                }
             }}
           />
        )}
      </main>

      {isPurchaseModalOpen && selectedProductForPurchase && (
        <PurchaseModal 
          isOpen={isPurchaseModalOpen} 
          product={selectedProductForPurchase} 
          appConfig={appConfig}
          userBalance={user.balanceUSD}
          onClose={() => {
            setIsPurchaseModalOpen(false);
            setSelectedProductForPurchase(null);
          }} 
          onConfirm={handlePurchase} 
        />
      )}
      
      {currentView !== 'admin' && <div className="shrink-0 z-50"><BottomNav currentView={currentView} onViewChange={setCurrentView} /></div>}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} setView={setCurrentView} user={user} setUser={() => {}} appConfig={appConfig} onLogout={() => { setUser(null); localStorage.removeItem('royal_user'); }} />
    </div>
  );
};

export default App;
