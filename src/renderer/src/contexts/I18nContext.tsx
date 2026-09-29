import React, { createContext, useContext, useState, useEffect } from 'react'

type Language = 'en' | 'ar'

interface Translations {
  [key: string]: {
    [key in Language]: string
  }
}

export const translations: Translations = {
  // Sidebar
  pos: { en: 'Point of Sale', ar: 'نقطة البيع' },
  inventory: { en: 'Inventory', ar: 'المخزون' },
  categories: { en: 'Categories', ar: 'الأقسام' },
  history: { en: 'Sales History', ar: 'سجل المبيعات' },
  lowStock: { en: 'Low Stock Items', ar: 'عناصر مخزنة منخفضة' },
  
  // General Buttons
  add: { en: 'Add', ar: 'إضافة' },
  save: { en: 'Save', ar: 'حفظ' },
  cancel: { en: 'Cancel', ar: 'إلغاء' },
  delete: { en: 'Delete', ar: 'حذف' },
  edit: { en: 'Edit', ar: 'تعديل' },
  search: { en: 'Search...', ar: 'بحث...' },
  
  // POS
  currentOrder: { en: 'Current Order', ar: 'الطلب الحالي' },
  emptyOrder: { en: 'Order is empty', ar: 'الطلب فارغ' },
  subtotal: { en: 'Subtotal', ar: 'المجموع الفرعي' },
  total: { en: 'Total', ar: 'المجموع الكلي' },
  completeOrder: { en: 'Complete Order', ar: 'إتمام الطلب' },
  allCategories: { en: 'All Categories', ar: 'جميع الأقسام' },
  allSizes: { en: 'All Sizes', ar: 'جميع المقاسات' },
  stock: { en: 'Stock', ar: 'المخزون' },
  outOfStock: { en: 'Out of Stock', ar: 'نفد من المخزون' },
  size: { en: 'Size', ar: 'المقاس' },
  
  // Inventory
  inventoryManagement: { en: 'Inventory Management', ar: 'إدارة المخزون' },
  addProduct: { en: 'Add Product', ar: 'إضافة منتج' },
  product: { en: 'Product', ar: 'المنتج' },
  price: { en: 'Price', ar: 'السعر' },
  actions: { en: 'Actions', ar: 'الإجراءات' },
  filterCategory: { en: 'Filter by Category', ar: 'تصفية حسب القسم' },
  filterSize: { en: 'Filter by Size', ar: 'تصفية حسب المقاس' },
  clearFilters: { en: 'Clear Filters', ar: 'مسح التصنيفات' },
  
  // Product Modal
  newProduct: { en: 'New Product', ar: 'منتج جديد' },
  editProduct: { en: 'Edit Product', ar: 'تعديل المنتج' },
  productName: { en: 'Product Name', ar: 'اسم المنتج' },
  category: { en: 'Category', ar: 'القسم' },
  subcategory: { en: 'Subcategory', ar: 'القسم الفرعي' },
  selectCategory: { en: 'Select Category', ar: 'اختر القسم' },
  selectSubcategory: { en: 'Select Subcategory', ar: 'اختر القسم الفرعي' },
  selectSize: { en: 'Select Size', ar: 'اختر المقاس' },
  chooseImage: { en: 'Choose Image', ar: 'اختر صورة' },
  noSales: { en: 'No recent sales', ar: 'لا توجد مبيعات حديثة' },
  salesDescription: { en: 'Orders will appear here once you complete a checkout.', ar: 'ستظهر الطلبات هنا بمجرد إتمام عملية الدفع.' },
  items: { en: 'Items', ar: 'العناصر' },
  filterByDay: { en: 'Filter by Day', ar: 'تصفية حسب اليوم' },
  allDays: { en: 'All Days', ar: 'كل الأيام' },
  
  // Categories View
  manageCategories: { en: 'Manage Categories', ar: 'إدارة الأقسام' },
  newCategory: { en: 'New Category', ar: 'قسم جديد' },
  newSubcategory: { en: 'New Subcategory', ar: 'قسم فرعي جديد' },
  name: { en: 'Name', ar: 'الاسم' },
  noSubcategoriesFound: { en: 'No subcategories found', ar: 'لا توجد أقسام فرعية' },
  selectCategoryToViewSubcategories: { en: 'Select a category to view subcategories', ar: 'اختر قسماً لعرض الأقسام الفرعية' },
  currency: { en: 'EGP', ar: 'ج.مصرى' },
  receiptNo: { en: 'Receipt #', ar: 'رقم الفاتورة' },
  date: { en: 'Date', ar: 'التاريخ' },
  item: { en: 'Item', ar: 'العنصر' },
  qty: { en: 'Qty', ar: 'الكمية' },
  thankYou: { en: 'Thank you for your business!', ar: 'شكراً لتعاملكم معنا!' },
  printReceipt: { en: 'Print Receipt', ar: 'طباعة الفاتورة' },
  confirmDeleteReceipt: { en: 'Are you sure you want to delete this receipt?', ar: 'هل أنت متأكد من حذف هذه الفاتورة؟' },
  confirmDeleteTitle: { en: 'Confirm Deletion', ar: 'تأكيد الحذف' },
  deleteError: { en: 'Failed to delete. Please try again.', ar: 'فشل الحذف. يرجى المحاولة مرة أخرى.' },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('app-lang')
    return (saved as Language) || 'en'
  })

  useEffect(() => {
    localStorage.setItem('app-lang', language)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  const t = (key: string) => {
    const translation = translations[key]
    if (!translation) return key
    return translation[language] || key
  }

  const isRTL = language === 'ar'

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, isRTL }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n must be used within I18nProvider')
  return context
}
