
import React, { useState, useEffect } from 'react';
import { Heart, Zap, Clock, AlertTriangle, XCircle, Wallet } from 'lucide-react';
import { Product, AppConfig } from '../types';

interface PurchaseModalProps {
  product: Product | null;
  isOpen: boolean;
  appConfig: AppConfig;
  userBalance: number;
  onClose: () => void;
  onConfirm: (product: Product, idValue: string, customPriceUSD?: number, coins?: number) => boolean;
}

const PurchaseModal: React.FC<PurchaseModalProps> = ({ product, isOpen, userBalance, onClose, onConfirm, appConfig }) => {
  const [idValue, setIdValue] = useState('');
  const [customPriceUSD, setCustomPriceUSD] = useState<string>('');
  const [calculatedCoins, setCalculatedCoins] = useState<number>(0);

  useEffect(() => {
    if (product) {
      if (product.isCustomAmount) {
        setCustomPriceUSD(product.priceUSD.toString());
        setCalculatedCoins(product.priceUSD * (product.usdToCoinRate || 100));
      } else {
        setCalculatedCoins(product.amount);
      }
    }
  }, [product]);

  useEffect(() => {
    if (product?.isCustomAmount && customPriceUSD) {
      const priceInUSD = parseFloat(customPriceUSD);
      if (!isNaN(priceInUSD) && priceInUSD > 0) {
        const coins = priceInUSD * (product.usdToCoinRate || 100);
        setCalculatedCoins(Math.floor(coins));
      } else {
        setCalculatedCoins(0);
      }
    }
  }, [customPriceUSD, product]);

  if (!isOpen || !product) return null;

  const currentPriceUSD = product.isCustomAmount ? (parseFloat(customPriceUSD) || 0) : product.priceUSD;

  const handleBuy = () => {
    if (!idValue.trim()) {
      alert('يرجى إدخال معرّف اللاعب');
      return;
    }
    if (product.isCustomAmount && (!customPriceUSD || parseFloat(customPriceUSD) < product.priceUSD)) {
      alert(`أقل مبلغ للشراء هو ${product.priceUSD}$`);
      return;
    }
    const success = onConfirm(product, idValue, currentPriceUSD, calculatedCoins);
    if (success) {
      onClose();
      setIdValue('');
      setCustomPriceUSD('');
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center px-4 py-6 overflow-y-auto no-scrollbar">
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-[360px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-slate-100 my-auto">
        <div className="p-5 md:p-6">
          <div className="flex justify-between items-start mb-5">
            <div className="bg-yellow-400 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-md">
               <Wallet size={14} className="text-slate-900" />
               <span className="text-slate-900 font-black text-xs">${userBalance.toLocaleString()}</span>
            </div>
            <div className="text-right">
               <h3 className="text-slate-800 font-black text-base leading-tight">{product.name}</h3>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">تأكيد عملية الشراء</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
             <div className="bg-blue-50/50 rounded-2xl p-4 text-center border border-blue-100/50">
                <span className="text-[8px] font-black text-blue-400 block mb-1 uppercase">ستستلم كوينز</span>
                <span className="text-xl font-black text-blue-700">{calculatedCoins.toLocaleString()}</span>
             </div>
             <div className="bg-emerald-50/50 rounded-2xl p-4 text-center border border-emerald-100/50">
                <span className="text-[8px] font-black text-emerald-400 block mb-1 uppercase">الإجمالي للدفع</span>
                <span className="text-xl font-black text-emerald-700">${currentPriceUSD.toLocaleString()}</span>
             </div>
          </div>

          <div className="space-y-3 mb-6">
             {product.isCustomAmount && (
               <div className="space-y-1.5 animate-in slide-in-from-top-2">
                  <p className="text-right text-[9px] font-black text-slate-400 px-3 uppercase">أدخل مبلغ الشحن بالدولار ($)</p>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={customPriceUSD}
                      onChange={(e) => setCustomPriceUSD(e.target.value)}
                      className="w-full h-14 bg-slate-50 rounded-xl px-4 text-center font-black text-slate-800 border-2 border-slate-100 outline-none focus:border-yellow-400 transition-all text-lg"
                      placeholder="0.00"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-300">$</div>
                  </div>
                  <p className="text-[8px] text-slate-400 text-center font-bold">معدل الصرف: {product.usdToCoinRate} لكل 1$</p>
               </div>
             )}
             
             <div className="space-y-1.5 text-right">
                <p className="text-right text-[9px] font-black text-slate-400 px-3 uppercase">معرف اللاعب الـ (ID)</p>
                <input 
                  type="text" 
                  value={idValue}
                  onChange={(e) => setIdValue(e.target.value)}
                  placeholder="أدخل الـ ID هنا..."
                  className="w-full h-14 bg-slate-900 rounded-xl px-4 text-center font-black text-yellow-400 outline-none shadow-lg placeholder:text-slate-600 text-lg"
                />
             </div>
          </div>

          <div className="flex gap-3 mb-4">
             <button onClick={handleBuy} className="flex-1 h-14 bg-yellow-400 text-slate-900 rounded-xl font-black text-base shadow-lg shadow-yellow-400/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Zap size={18}/> إتمام الشراء
             </button>
             <button onClick={onClose} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                <XCircle size={22} />
             </button>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
             <div className="flex items-center justify-center gap-2 text-right">
                <span className="text-[9px] font-black text-slate-400">نظام التنفيذ آلي وفوري 24/7</span>
                <Clock size={12} className="text-slate-300" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
