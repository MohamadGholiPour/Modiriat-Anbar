import React, { useState, useMemo, useEffect } from 'react';
import { Product, SortOption } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { ProductItem } from './components/ProductItem';
import { ProductModal } from './components/ProductModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import {
  PlusIcon,
  SearchIcon,
  UploadIcon,
  DownloadIcon,
  ResetIcon,
  BarcodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ImageIcon,
} from './components/icons';

const sampleProducts: Product[] = [
    { id: '1', name: 'شیر', category: 'لبنیات', quantity: 5, lowStockThreshold: 10, isFavorite: true, barcode: '111222333', imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b210?q=80&w=1287&auto=format&fit=crop' },
    { id: '2', name: 'چیپس', category: 'تنقلات', quantity: 25, lowStockThreshold: 15, isFavorite: false, notes: 'طعم سرکه نمکی' },
    { id: '3', name: 'مایع ظرفشویی', category: 'نظافتی', quantity: 2, lowStockThreshold: 5, isFavorite: false },
    { id: '4', name: 'سیب', category: 'میوه و سبزیجات', quantity: 12, lowStockThreshold: 5, isFavorite: true },
    { id: '5', name: 'نان تست', category: 'نانوایی', quantity: 8, lowStockThreshold: 3, isFavorite: false },
];


function App() {
  const [products, setProducts] = useLocalStorage<Product[]>('products', []);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.Name);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanMode, setScanMode] = useState<'add' | 'search'>('add');
  const [recentlyUpdatedId, setRecentlyUpdatedId] = useState<string | null>(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [isRestockMode, setIsRestockMode] = useState(false);
  const [restockedIds, setRestockedIds] = useState<Set<string>>(new Set());
  const [zeroedOutIds, setZeroedOutIds] = useState<Set<string>>(new Set());
  const [initialModalData, setInitialModalData] = useState<Partial<Product> | null>(null);

  useEffect(() => {
      if (recentlyUpdatedId) {
          const timer = setTimeout(() => setRecentlyUpdatedId(null), 1500);
          return () => clearTimeout(timer);
      }
  }, [recentlyUpdatedId]);

  const handleSaveProduct = (productData: Product) => {
    setProducts(prevProducts => {
      const existingIndex = prevProducts.findIndex(p => p.id === productData.id);
      if (existingIndex > -1) {
        const newProducts = [...prevProducts];
        newProducts[existingIndex] = productData;
        return newProducts;
      }
      return [...prevProducts, productData];
    });
    setProductToEdit(null);
    setInitialModalData(null);
    setIsProductModalOpen(false);
  };

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    setProducts(products =>
      products.map(p => (p.id === id ? { ...p, quantity: newQuantity } : p))
    );
    setRecentlyUpdatedId(id);
  };

  const handleToggleFavorite = (id: string) => {
    setProducts(products =>
      products.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      setProducts(products => products.filter(p => p.id !== id));
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductToEdit(product);
    setInitialModalData(null);
    setIsProductModalOpen(true);
  };
  
  const handleAddNewProduct = () => {
    setProductToEdit(null);
    setInitialModalData(null);
    setIsProductModalOpen(true);
  };
  
  const handleScanForAdd = () => {
    setScanMode('add');
    setIsScannerOpen(true);
  };

  const handleSearchWithBarcode = () => {
    setScanMode('search');
    setIsScannerOpen(true);
  };

  const handleScan = (scannedData: string) => {
    const foundProduct = products.find(p => p.barcode === scannedData);

    if (scanMode === 'search') {
      if (foundProduct) {
        setSearchQuery(foundProduct.barcode || '');
      } else {
        alert('محصولی با این بارکد یافت نشد.');
        setSearchQuery('');
      }
    } else { // 'add' mode
      if (foundProduct) {
        handleUpdateQuantity(foundProduct.id, foundProduct.quantity + 1);
      } else {
        alert('محصولی با این بارکد یافت نشد. می‌توانید آن را اضافه کنید.');
        setProductToEdit(null);
        setInitialModalData({ barcode: scannedData });
        setIsProductModalOpen(true);
      }
    }
  };

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowercasedQuery) ||
        p.category.toLowerCase().includes(lowercasedQuery) ||
        p.notes?.toLowerCase().includes(lowercasedQuery) ||
        p.barcode?.includes(searchQuery)
      );
    }
    
    if (showLowStock) {
        filtered = filtered.filter(p => p.quantity > 0 && p.quantity < p.lowStockThreshold);
    }

    return filtered;
  }, [products, searchQuery, showLowStock, selectedCategory]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
        case SortOption.Name:
          return a.name.localeCompare(b.name);
        case SortOption.Category:
          return a.category.localeCompare(b.category);
        case SortOption.QuantityAsc:
          return a.quantity - b.quantity;
        case SortOption.QuantityDesc:
          return b.quantity - a.quantity;
        case SortOption.Favorites:
          return (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortOption]);
  
  const handleZeroOut = (id: string) => {
      setZeroedOutIds(prev => new Set(prev).add(id));
  };
  
  const handleExitAndSaveChanges = () => {
      if (zeroedOutIds.size > 0) {
          if (window.confirm(`آیا می‌خواهید موجودی ${zeroedOutIds.size} محصول انتخاب شده را صفر کنید؟`)) {
              setProducts(prev => prev.map(p => 
                  zeroedOutIds.has(p.id) ? { ...p, quantity: 0 } : p
              ));
          }
      }
      setIsRestockMode(false);
      setZeroedOutIds(new Set());
  };
  
  const loadSampleData = () => {
    if (window.confirm('این عمل تمام داده‌های فعلی شما را پاک کرده و داده‌های نمونه را بارگذاری می‌کند. آیا مطمئن هستید؟')) {
      setProducts(sampleProducts);
    }
  };

  const exportData = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(products, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "inventory-data.json";
    link.click();
  };
  
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = e => {
        try {
          const importedProducts = JSON.parse(e.target?.result as string);
          if (Array.isArray(importedProducts) && importedProducts.every(p => 'name' in p && 'quantity' in p)) {
            if (window.confirm('آیا می‌خواهید داده‌های فعلی را با داده‌های وارد شده جایگزین کنید؟')) {
               setProducts(importedProducts);
            }
          } else {
            throw new Error('Invalid file format');
          }
        } catch (error) {
          alert('خطا در خواندن فایل. لطفاً از یک فایل JSON معتبر استفاده کنید.');
        }
      };
    }
  };

  const restockableProducts = useMemo(() => products.filter(p => p.quantity > 0), [products]);

  if (isRestockMode) {
    return (
        <div dir="rtl" className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-yellow-600">حالت شارژ مجدد (انبارگردانی)</h1>
                    <button onClick={handleExitAndSaveChanges} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                        <CheckCircleIcon className="w-5 h-5"/>
                        <span>اتمام و ذخیره</span>
                    </button>
                </div>
            </header>
            <main className="container mx-auto p-4">
                <div className="mb-4 text-center p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                    <p className="font-semibold text-yellow-800">
                        محصولات موجود در انبار را شمارش کنید. با دکمه "صفر کردن"، موجودی آن محصول پس از ذخیره نهایی، صفر خواهد شد.
                    </p>
                </div>
                <div className="space-y-3">
                    {restockableProducts.map(product => (
                        <div key={product.id} className={`flex items-center p-3 rounded-lg shadow-sm transition-all ${zeroedOutIds.has(product.id) ? 'bg-gray-200 opacity-60' : 'bg-white'}`}>
                            <div className="w-12 h-12 mr-3 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover"/> : <ImageIcon className="w-6 h-6 text-gray-400"/>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-semibold text-gray-800 ${zeroedOutIds.has(product.id) ? 'line-through' : ''}`}>{product.name}</p>
                                <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                            <div className="flex items-center gap-4 mr-4">
                                <span className="text-xl font-bold w-10 text-center">{product.quantity}</span>
                                <button
                                    onClick={() => handleZeroOut(product.id)}
                                    disabled={zeroedOutIds.has(product.id)}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    <XCircleIcon className="w-5 h-5"/>
                                    <span className="text-sm font-medium">صفر کردن</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
  }

  return (
    <div dir="rtl" className="bg-gray-50 min-h-screen font-sans">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-brand-primary">مدیریت انبار</h1>
            <div className="flex items-center gap-2">
                <button onClick={handleAddNewProduct} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>محصول جدید</span>
                </button>
                 <button onClick={handleScanForAdd} className="flex items-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
                    <BarcodeIcon className="w-5 h-5" />
                    <span>اسکن برای افزودن</span>
                </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-center gap-4">
            <div className="relative w-full lg:col-span-2">
                <input
                    type="text"
                    placeholder="جستجو بر اساس نام، بارکد، دسته‌بندی..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <SearchIcon className="w-5 h-5" />
                </div>
                <button 
                  onClick={handleSearchWithBarcode}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-primary"
                  aria-label="جستجو با بارکد"
                >
                    <BarcodeIcon className="w-5 h-5" />
                </button>
            </div>
            <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
            >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat === 'all' ? 'همه دسته‌بندی‌ها' : cat}</option>
                ))}
            </select>
            <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary bg-white"
            >
                <option value={SortOption.Name}>مرتب‌سازی بر اساس نام</option>
                <option value={SortOption.Category}>مرتب‌سازی بر اساس دسته‌بندی</option>
                <option value={SortOption.QuantityAsc}>تعداد (صعودی)</option>
                <option value={SortOption.QuantityDesc}>تعداد (نزولی)</option>
                <option value={SortOption.Favorites}>موردعلاقه‌ها</option>
            </select>
            <div className="w-full flex items-center gap-4 lg:col-span-4 justify-center">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={showLowStock} onChange={e => setShowLowStock(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" />
                    <span className="text-sm font-medium text-gray-700">فقط کالاهای رو به اتمام (با موجودی بالای صفر)</span>
                </label>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              {`لیست محصولات (${sortedProducts.length} مورد)`}
            </h2>
            <button onClick={() => setIsRestockMode(true)} className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600">
                حالت شارژ مجدد
            </button>
        </div>
        
        {products.length > 0 ? (
          sortedProducts.length > 0 ? (
            <div className="space-y-4">
              {sortedProducts.map(product => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onUpdateQuantity={handleUpdateQuantity}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleFavorite={handleToggleFavorite}
                  isRestockMode={false} // This prop is now obsolete but kept for component compatibility
                  onRestock={() => {}} // Dummy prop
                  recentlyUpdatedId={recentlyUpdatedId}
                  isRestocked={false} // Dummy prop
                />
              ))}
            </div>
           ) : (
             <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-700">هیچ محصولی با فیلترهای انتخابی یافت نشد.</h3>
                <p className="mt-2 text-gray-500">فیلترها را تغییر دهید یا یک محصول جدید اضافه کنید.</p>
             </div>
           )
        ) : (
          <div className="text-center py-16 px-6 bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">هیچ محصولی یافت نشد.</h3>
            <p className="mt-2 text-gray-500">برای شروع، یک محصول جدید اضافه کنید یا داده‌های نمونه را بارگذاری کنید.</p>
             <div className="mt-6 flex justify-center gap-4">
               <button onClick={loadSampleData} className="flex items-center gap-2 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                    <ResetIcon className="w-5 h-5" />
                    <span>بارگذاری داده‌های نمونه</span>
                </button>
                <button onClick={handleAddNewProduct} className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                    <PlusIcon className="w-5 h-5" />
                    <span>افزودن محصول جدید</span>
                </button>
             </div>
          </div>
        )}
        
        <div className="mt-8 p-4 bg-white rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">مدیریت داده‌ها</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <button onClick={exportData} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    <DownloadIcon className="w-5 h-5" />
                    <span>خروجی گرفتن (JSON)</span>
                </button>
                <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    <span>ورودی گرفتن (JSON)</span>
                    <input type="file" accept=".json" onChange={importData} className="hidden" />
                </label>
                 <button onClick={loadSampleData} className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    <ResetIcon className="w-5 h-5" />
                    <span>بارگذاری داده نمونه</span>
                </button>
            </div>
        </div>

      </main>

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setProductToEdit(null);
          setInitialModalData(null);
        }}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
        initialData={initialModalData}
      />
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScan}
      />
    </div>
  );
}

export default App;