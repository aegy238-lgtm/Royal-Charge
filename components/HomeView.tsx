
import React, { useState, useEffect } from 'react';
import { Megaphone, PlusCircle, LayoutGrid } from 'lucide-react';
import PurchaseModal from './PurchaseModal';
import { Product, UserState, Banner, Category, AppConfig } from '../types';

interface HomeViewProps {
  user: UserState;
  appConfig: AppConfig;
  onPurchase: (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => boolean;
  products: Product[];
  banners: Banner[];
  categories: Category[];
}

const HomeView: React.FC<HomeViewProps> = ({ user, appConfig, onPurchase, products, banners, categories }) => {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(categories[0]?.id || null);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => setCurrentBanner((prev) => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const filteredProducts = activeCategoryId 
    ? products.filter(p => p.categoryId === activeCategoryId)
    : products;

  const activeCategory = categories.find(c => c.id === activeCategoryId);

  return (
    <div className="pb-32 animate-in fade-in duration-500 min-h-screen bg-transparent">
      
      {/* القسم الثابت العلوي: يشمل الإعلان، البنر، والأقسام */}
      <div className="sticky top-0 z-30 bg-white/10 backdrop-blur-xl border-b border-white/5 shadow-xl">
        
        {/* شريط الإعلان */}
        <div className="bg-[#fbbf24] px-4 py-2 flex items-center justify-between text-white font-bold text-[10px]">
          <div className="flex items-center gap-2 overflow-hidden flex-row-reverse w-full">
            <Megaphone size={12} className="shrink-0" />
            <p className="truncate text-right flex-1">{appConfig.welcomeAnnouncement}</p>
          </div>
          <button className="bg-[#1e293b] text-white px-2 py-0.5 rounded-md text-[9px] font-black shrink-0 mr-2">النظام</button>
        </div>

        {/* البنر المصغر h-28 */}
        <div className="pt-3 pb-1 px-4">
          <div className="relative h-28 w-full overflow-hidden rounded-[1.5rem] shadow-lg border border-white/10 bg-slate-900">
            {banners.length > 0 ? banners.map((banner, index) => (
              <div key={banner.id} className={`absolute inset-0 transition-all duration-1000 transform ${index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}>
                <img src={banner.url} alt={banner.title} className="w-full h-full object-cover" />
                {banner.title && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-right">
                    <h2 className="text-white text-[10px] font-black">{banner.title}</h2>
                  </div>
                )}
              </div>
            )) : (
              <div className="w-full h-full flex items-center justify-center text-white/20 text-[10px]">JENTEL-CASH</div>
            )}
          </div>
        </div>

        {/* قسم تصفح الأقسام (ثابت الآن) */}
        <div className="py-2 px-4">
          <div className="flex items-center justify-between mb-2 px-1">
             <h3 className="text-[10px] font-black text-white text-right uppercase">تصفح الأقسام</h3>
             <LayoutGrid size={12} className="text-yellow-400" />
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setActiveCategoryId(cat.id)} 
                className={`flex flex-col items-center shrink-0 transition-all ${activeCategoryId === cat.id ? 'scale-105' : 'opacity-50 scale-95'}`}
              >
                <div className={`w-12 h-12 rounded-[1.1rem] overflow-hidden border-2 transition-all ${activeCategoryId === cat.id ? 'border-yellow-400 shadow-lg shadow-yellow-400/20' : 'border-white/10 bg-white/5'}`}>
                  <img src={cat.image} className="w-full h-full object-cover" alt={cat.title} />
                </div>
                <span className={`text-[7px] font-black mt-1 ${activeCategoryId === cat.id ? 'text-yellow-400' : 'text-slate-400'}`}>
                  {cat.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى القابل للتمرير: قائمة المنتجات فقط */}
      <div className="px-4 mt-6 relative z-10">
        <div className="flex items-center justify-between mb-4 px-1">
           <div className="flex flex-col items-end">
              <h3 className="text-xs font-black text-white text-right uppercase tracking-widest">{activeCategory?.title || 'المنتجات'}</h3>
              <div className="w-6 h-0.5 bg-yellow-400 rounded-full mt-1"></div>
           </div>
           <span className="text-[8px] font-black bg-white/10 text-white/60 px-2 py-0.5 rounded-full">{filteredProducts.length} عنصر</span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-4 gap-3 animate-slide-up">
            {filteredProducts.map((product) => (
              <div 
                key={product.id} 
                onClick={() => { setSelectedProduct(product); setTimeout(() => setIsModalOpen(true), 10); }}
                className="relative group cursor-pointer active:scale-90 transition-all duration-300"
              >
                <div className="w-full aspect-square rounded-[1rem] overflow-hidden shadow-lg relative border border-white/5 bg-slate-800">
                    <img 
                      src={product.image} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      alt={product.name} 
                    />
                    <div className="absolute bottom-1 inset-x-1 bg-black/50 backdrop-blur-sm rounded-[0.7rem] py-1 px-1 border border-white/10">
                        <p className="text-[6px] font-black text-white text-center truncate uppercase tracking-tighter">
                          {product.name}
                        </p>
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10">
             <p className="text-[10px] font-black text-white/30">لا توجد منتجات حالياً</p>
          </div>
        )}
      </div>
      
      {isModalOpen && selectedProduct && (
        <PurchaseModal 
          isOpen={isModalOpen} 
          product={selectedProduct} 
          appConfig={appConfig}
          userBalance={user.balanceUSD}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }} 
          onConfirm={onPurchase} 
        />
      )}
    </div>
  );
};

export default HomeView;
