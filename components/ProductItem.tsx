import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { PlusIcon, MinusIcon, EditIcon, DeleteIcon, StarIcon, ImageIcon, CheckCircleIcon, DotsVerticalIcon } from './icons';

interface ProductItemProps {
  product: Product;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onRestock: (id: string) => void;
  isRestockMode: boolean;
  recentlyUpdatedId: string | null;
  isRestocked: boolean;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, onUpdateQuantity, onEdit, onDelete, onToggleFavorite, onRestock, isRestockMode, recentlyUpdatedId, isRestocked }) => {
  const isLowStock = product.quantity < product.lowStockThreshold;
  const [isFlashing, setIsFlashing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (recentlyUpdatedId === product.id) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [recentlyUpdatedId, product.id]);

  const handleQuantityChange = (amount: number) => {
    onUpdateQuantity(product.id, Math.max(0, product.quantity + amount));
  };
  
  return (
    <div className={`relative flex items-center p-3 transition-all duration-300 ease-in-out rounded-lg shadow-sm hover:shadow-md border-r-4 ${isLowStock ? 'border-brand-danger' : 'border-transparent'} ${isFlashing ? 'bg-green-100' : 'bg-white'} ${isRestocked ? 'opacity-50' : ''}`}>
      <div className="flex-1 min-w-0 flex items-center">
         <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
            {product.imageUrl && !imageError ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" onError={() => setImageError(true)} />
            ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center">
            <button onClick={() => onToggleFavorite(product.id)} className="ml-3 text-gray-400 hover:text-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isRestockMode}>
                <StarIcon className="w-6 h-6" filled={product.isFavorite} />
            </button>
            <div>
                <p className={`truncate ${isRestockMode ? 'text-xl font-bold text-gray-900' : 'text-lg font-semibold text-gray-800'} ${isRestocked ? 'line-through' : ''}`}>{product.name}</p>
                {isRestockMode ? (
                    <p className="text-md text-gray-600 font-medium">{product.category}</p>
                ) : (
                    <p className="text-sm text-gray-500">{product.notes || 'بدون یادداشت'}</p>
                )}
            </div>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6 mr-4">
        {isRestockMode ? (
            <div className="flex items-center gap-3">
                 <span className={`text-2xl font-bold w-12 text-center text-brand-danger`}>{product.quantity}</span>
                 <button onClick={() => onRestock(product.id)} disabled={isRestocked} className="flex items-center gap-2 px-3 py-2 bg-brand-success text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-medium text-sm">شارژ شد</span>
                 </button>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2">
                    <button onClick={() => handleQuantityChange(1)} className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">
                        <PlusIcon className="w-5 h-5" />
                    </button>
                    <span className={`text-2xl font-bold w-12 text-center ${isLowStock ? 'text-brand-danger' : 'text-gray-800'}`}>{product.quantity}</span>
                    <button onClick={() => handleQuantityChange(-1)} className="p-1 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50" disabled={product.quantity <= 0}>
                        <MinusIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="hidden sm:flex items-center gap-2">
                    <button onClick={() => onEdit(product)} className="p-2 text-gray-500 hover:text-brand-primary">
                        <EditIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(product.id)} className="p-2 text-gray-500 hover:text-brand-danger">
                        <DeleteIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="sm:hidden">
                    <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 text-gray-500 hover:text-brand-primary">
                        <DotsVerticalIcon className="w-5 h-5" />
                    </button>
                    {menuOpen && (
                        <div className="absolute left-0 top-full mt-2 w-32 bg-white rounded-md shadow-lg z-20 border" onMouseLeave={() => setMenuOpen(false)}>
                            <button
                            onClick={() => { onEdit(product); setMenuOpen(false); }}
                            className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                <EditIcon className="w-4 h-4" />
                                <span>ویرایش</span>
                            </button>
                            <button
                            onClick={() => { onDelete(product.id); setMenuOpen(false); }}
                            className="flex items-center gap-2 w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                <DeleteIcon className="w-4 h-4" />
                                <span>حذف</span>
                            </button>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>
    </div>
  );
};