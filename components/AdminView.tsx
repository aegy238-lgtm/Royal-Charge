
import React, { useState } from 'react';
import { 
  ArrowRight, Package, ShoppingCart, LayoutGrid, Settings, 
  Users, ShieldAlert, BarChart3, CreditCard, ShieldCheck
} from 'lucide-react';
import { Product, Category, AppConfig, Order, UserState, RechargeMethod } from '../types';

// استيراد الأقسام المستقلة
import OrdersTab from './admin/OrdersTab';
import ProductsTab from './admin/ProductsTab';
import CategoriesTab from './admin/CategoriesTab';
import UsersTab from './admin/UsersTab';
import SettingsTab from './admin/SettingsTab';
import StatsTab from './admin/StatsTab';
import RechargeMethodsTab from './admin/RechargeMethodsTab';
import AdminsTab from './admin/AdminsTab';

interface AdminViewProps {
  products: Product[];
  setProducts: (id: string | null, data: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<void>;
  categories: Category[];
  addCategory: (data: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<void>;
  rechargeMethods: RechargeMethod[];
  setRechargeMethod: (id: string | null, data: any) => Promise<any>;
  deleteRechargeMethod: (id: string) => Promise<void>;
  orders: Order[];
  allUsers: UserState[];
  updateAnyUser: (email: string, data: any) => Promise<void>;
  deleteAnyUser: (email: string) => Promise<void>;
  appConfig: AppConfig;
  setAppConfig: (cfg: AppConfig) => Promise<void>;
  onBack: () => void;
  onUpdateOrder: (orderId: string, status: 'completed' | 'rejected', reply: string) => void;
  onDeleteAllOrders?: () => Promise<void>;
}

const AdminView: React.FC<AdminViewProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'products' | 'categories' | 'orders' | 'users' | 'settings' | 'recharge_methods' | 'admins'>('stats');

  const tabs = [
    { id: 'stats', label: 'الرئيسية', icon: <BarChart3 size={18} /> },
    { id: 'orders', label: 'الطلبات', icon: <ShoppingCart size={18} /> },
    { id: 'products', label: 'المنتجات', icon: <Package size={18} /> },
    { id: 'categories', label: 'الأقسام', icon: <LayoutGrid size={18} /> },
    { id: 'recharge_methods', label: 'طرق الشحن', icon: <CreditCard size={18} /> },
    { id: 'admins', label: 'المشرفين', icon: <ShieldCheck size={18} /> },
    { id: 'users', label: 'الأعضاء', icon: <Users size={18} /> },
    { id: 'settings', label: 'الإعدادات', icon: <Settings size={18} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc] pb-24 rtl w-full font-['Cairo']" dir="rtl">
      {/* Admin Header */}
      <div className="h-20 bg-slate-900 flex items-center justify-between px-6 sticky top-0 z-[100] shadow-xl">
         <button onClick={props.onBack} className="p-2 bg-white/10 rounded-xl text-white active:scale-90 transition-transform">
            <ArrowRight size={24} />
         </button>
         <div className="text-center">
            <h2 className="text-white font-black text-lg">{props.appConfig.appName}</h2>
            <p className="text-[10px] text-yellow-400 font-bold uppercase tracking-widest">إدارة النظام الذكي</p>
         </div>
         <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-slate-900">
            <ShieldAlert size={22} />
         </div>
      </div>

      {/* Tabs Navigation */}
      <div className="sticky top-20 z-[90] bg-white border-b border-slate-200 w-full overflow-x-auto no-scrollbar shadow-sm">
        <div className="flex py-2 px-4 gap-2 min-w-max">
           {tabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-900 text-yellow-400 shadow-lg scale-105' : 'bg-slate-50 text-slate-400'}`}
             >
               {tab.icon}
               <span className="text-xs font-black">{tab.label}</span>
             </button>
           ))}
        </div>
      </div>

      <div className="p-4 mt-4 w-full">
        
        {activeTab === 'stats' && (
          <StatsTab totalUsers={props.allUsers.length} totalOrders={props.orders.length} />
        )}

        {activeTab === 'orders' && (
          <OrdersTab orders={props.orders} allUsers={props.allUsers} onUpdateOrder={props.onUpdateOrder} />
        )}

        {activeTab === 'products' && (
          <ProductsTab products={props.products} categories={props.categories} setProducts={props.setProducts} deleteProduct={props.deleteProduct} usdToEgpRate={props.appConfig.usdToEgpRate} />
        )}

        {activeTab === 'categories' && (
          <CategoriesTab categories={props.categories} addCategory={props.addCategory} deleteCategory={props.deleteCategory} />
        )}

        {activeTab === 'recharge_methods' && (
          <RechargeMethodsTab 
            rechargeMethods={props.rechargeMethods} 
            setRechargeMethod={props.setRechargeMethod} 
            deleteRechargeMethod={props.deleteRechargeMethod} 
          />
        )}

        {activeTab === 'admins' && (
          <AdminsTab allUsers={props.allUsers} updateAnyUser={props.updateAnyUser} deleteAnyUser={props.deleteAnyUser} />
        )}

        {activeTab === 'users' && (
          <UsersTab allUsers={props.allUsers} updateAnyUser={props.updateAnyUser} deleteAnyUser={props.deleteAnyUser} />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            appConfig={props.appConfig} 
            setAppConfig={props.setAppConfig} 
            onDeleteAllOrders={props.onDeleteAllOrders} 
          />
        )}

      </div>
    </div>
  );
};

export default AdminView;
