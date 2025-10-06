import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { CloseIcon, ImageIcon } from './icons';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  productToEdit?: Product | null;
  initialData?: Partial<Product> | null;
}

const defaultCategories = ['نوشیدنی‌ها', 'تنقلات', 'لبنیات', 'نظافتی', 'میوه و سبزیجات', 'نانوایی', 'گوشت', 'متفرقه'];

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, productToEdit, initialData }) => {
  const [product, setProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: defaultCategories[0],
    quantity: 0,
    notes: '',
    isFavorite: false,
    lowStockThreshold: 10,
    imageUrl: '',
    barcode: '',
  });
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
      const isCustomCategory = !defaultCategories.includes(productToEdit.category);
      setIsNewCategory(isCustomCategory);
      if(isCustomCategory) setNewCategory(productToEdit.category);
    } else {
      setProduct({
        name: initialData?.name || '',
        category: initialData?.category || defaultCategories[0],
        quantity: initialData?.quantity ?? 0,
        notes: initialData?.notes || '',
        isFavorite: initialData?.isFavorite || false,
        lowStockThreshold: initialData?.lowStockThreshold ?? 10,
        imageUrl: initialData?.imageUrl || '',
        barcode: initialData?.barcode || '',
      });
      setIsNewCategory(false);
      setNewCategory('');
    }
  }, [productToEdit, initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (name === 'category' && value === 'new') {
        setIsNewCategory(true);
    } else if (name === 'category') {
        setIsNewCategory(false);
        setProduct(prev => ({ ...prev, [name]: value }));
    } else {
        setProduct(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value,
        }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isNewCategory ? newCategory.trim() : product.category;
    if (product.name.trim() === '' || finalCategory === '') return;

    onSave({
      ...productToEdit,
      ...product,
      id: productToEdit?.id || new Date().toISOString(),
      category: finalCategory,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">{productToEdit ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">نام محصول</label>
              <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
             <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">آدرس تصویر (اختیاری)</label>
              <input type="url" name="imageUrl" id="imageUrl" value={product.imageUrl} onChange={handleChange} placeholder="https://example.com/image.png" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
             <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-gray-700">بارکد (اختیاری)</label>
              <input type="text" name="barcode" id="barcode" value={product.barcode} onChange={handleChange} placeholder="مثال: 1234567890123" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">دسته‌بندی</label>
              <select name="category" id="category" value={isNewCategory ? 'new' : product.category} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm">
                {defaultCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                <option value="new">افزودن دسته‌بندی جدید...</option>
              </select>
              {isNewCategory && (
                <input type="text" placeholder="نام دسته‌بندی جدید" value={newCategory} onChange={e => setNewCategory(e.target.value)} required className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">تعداد</label>
                <input type="number" name="quantity" id="quantity" value={product.quantity} onChange={handleChange} min="0" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
              </div>
              <div>
                <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-gray-700">آستانه کمبود</label>
                <input type="number" name="lowStockThreshold" id="lowStockThreshold" value={product.lowStockThreshold} onChange={handleChange} min="0" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">یادداشت (اختیاری)</label>
              <textarea name="notes" id="notes" value={product.notes} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-brand-primary focus:border-brand-primary sm:text-sm" />
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
                ذخیره محصول
              </button>
              <button type="button" onClick={onClose} className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                انصراف
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
