import React, { useState, useEffect } from 'react'
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2,
  Package
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Category, Subcategory, Product, CartItem } from '../types'
import Modal from '../components/Modal'
import ReceiptView from '../components/ReceiptView'
import CustomSelect from '../components/CustomSelect'
import { PRODUCT_SIZES } from '../constants/sizes'
import { useI18n } from '../contexts/I18nContext'

const POS: React.FC = () => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sizeFilter, setSizeFilter] = useState<string>('')
  
  // Receipt State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [currentReceipt, setCurrentReceipt] = useState<{ id: number, items: CartItem[], total: number, date: Date } | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const cats = await window.api.getCategories()
      setCategories(cats)
      const prods = await window.api.getProducts()
      setProducts(prods)
    } catch (err) {
      console.error('Data fetch failed:', err)
    }
  }

  const handleCategoryClick = async (cat: Category) => {
    setSelectedCategory(cat)
    setSelectedSubcategory(null)
    const subs = await window.api.getSubcategories(cat.id)
    setSubcategories(subs)
    const prods = await window.api.getProducts({ categoryId: cat.id })
    setProducts(prods)
  }

  const handleSubcategoryClick = async (sub: Subcategory) => {
    setSelectedSubcategory(sub)
    const prods = await window.api.getProducts({ subcategoryId: sub.id })
    setProducts(prods)
  }

  const addToCart = (product: Product) => {
    if (product.stock <= 0) return
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = products.find(p => p.id === id)
        const maxStock = product ? product.stock : 999
        const newQty = Math.min(Math.max(0, item.quantity + delta), maxStock)
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    try {
      const savedCart = [...cart] // Copy for receipt
      const receipt = await window.api.createReceipt({
        items: savedCart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total
      })
      
      console.log('Checkout result:', receipt)
      
      setCurrentReceipt({
        id: receipt.receiptId,
        items: savedCart,
        total: total,
        date: receipt.date
      })
      setIsReceiptModalOpen(true)
      
      setCart([])
      fetchData() // Refresh stock
    } catch (err) {
      console.error('Checkout failed in POS.tsx:', err)
      alert('Checkout failed: ' + (err instanceof Error ? err.message : String(err)))
    }
  }

  return (
    <div className="pos-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: '100%' }}>
      {/* Left Side: Products */}
      <div className="products-section">
        <header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('pos')}</h1>
          <div className="search-box" style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" 
              placeholder={t('search')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid var(--border)', background: 'var(--glass)', color: 'white', outline: 'none', width: '300px' }}
            />
          </div>
        </header>

        {/* Breadcrumbs / Filters */}
        <div className="no-print" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '1.5rem', paddingBottom: '0.5rem' }}>
          <button 
            className={`btn ${!selectedCategory ? 'btn-primary' : 'glass-card'}`}
            style={{ padding: '0.5rem 1rem' }}
            onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); fetchData(); }}
          >
            {t('allCategories')}
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`btn ${selectedCategory?.id === cat.id ? 'btn-primary' : 'glass-card'}`}
              style={{ padding: '0.5rem 1rem' }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {selectedCategory && subcategories.length > 0 && (
          <div className="no-print" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', marginBottom: '1rem' }}>
            {subcategories.map(sub => (
              <button 
                key={sub.id}
                className={`btn ${selectedSubcategory?.id === sub.id ? 'btn-primary' : 'glass-card'}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        <div className="no-print" style={{ width: '250px', marginBottom: '1.5rem' }}>
          <CustomSelect
            label={t('filterSize')}
            options={[
              { value: '', label: t('allSizes') },
              ...PRODUCT_SIZES
            ]}
            value={sizeFilter}
            onChange={(val) => setSizeFilter(val)}
            placeholder={t('allSizes')}
          />
        </div>

        {/* Product Grid */}
        <div className="product-grid no-print">
          <AnimatePresence mode="popLayout">
            {products
              .filter(p => !sizeFilter || p.size === sizeFilter)
              .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map(product => (
              <motion.div 
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-card"
                style={{ 
                  padding: '1rem', 
                  position: 'relative', 
                  opacity: product.stock > 0 ? 1 : 0.6
                }}
              >
                <div style={{ height: '120px', background: 'var(--glass)', borderRadius: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Package size={40} color="var(--text-muted)" />
                  )}
                </div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{t('size')}: {product.size || 'N/A'}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{product.price.toFixed(2)} {t('currency')}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', background: product.stock <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: product.stock <= 5 ? '#f87171' : '#4ade80' }}>
                    {product.stock > 0 ? `${t('stock')}: ${product.stock}` : t('outOfStock')}
                  </span>
                </div>

                <div style={{ marginTop: '1rem' }}>
                  {cart.find(item => item.id === product.id) ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--glass)', borderRadius: '0.5rem', padding: '0.25rem' }}>
                      <button 
                        className="btn-icon" 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, -1); }}
                        style={{ padding: '6px' }}
                      >
                        <Minus size={16} />
                      </button>
                      <span style={{ fontWeight: 'bold' }}>
                        {cart.find(item => item.id === product.id)?.quantity}
                      </span>
                      <button 
                        className="btn-icon" 
                        onClick={(e) => { e.stopPropagation(); updateQuantity(product.id, 1); }}
                        style={{ padding: '6px' }}
                        disabled={cart.find(item => item.id === product.id)!.quantity >= product.stock}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '0.5rem', justifyContent: 'center' }}
                      disabled={product.stock <= 0}
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    >
                      <Plus size={18} />
                      {t('add')}
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side: Cart */}
      <div className="cart-section glass-card no-print" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShoppingCart size={24} />
          {t('currentOrder')}
        </h2>

        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
          <AnimatePresence>
            {cart.map(item => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '0.9rem' }}>{item.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.price.toFixed(2)} {t('currency')} x {item.quantity}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <button onClick={() => updateQuantity(item.id, -1)} className="btn-icon" style={{ padding: '4px' }}><Minus size={14} /></button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="btn-icon" style={{ padding: '4px' }}><Plus size={14} /></button>
                  <button onClick={() => updateQuantity(item.id, -item.quantity)} className="btn-icon" style={{ color: '#f87171', marginLeft: '0.5rem' }}><Trash2 size={14} /></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {cart.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              {t('emptyOrder')}
            </div>
          )}
        </div>

        <div style={{ borderTop: '2px dashed var(--border)', paddingTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{t('subtotal')}</span>
            <span>{total.toFixed(2)} {t('currency')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>
            <span>{t('total')}</span>
            <span style={{ color: 'var(--primary)' }}>{total.toFixed(2)} {t('currency')}</span>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            <CheckCircle2 size={20} />
            {t('completeOrder')}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <Modal 
        isOpen={isReceiptModalOpen} 
        onClose={() => setIsReceiptModalOpen(false)} 
        title="Order Success"
      >
        {currentReceipt && (
          <ReceiptView 
            receiptId={currentReceipt.id}
            items={currentReceipt.items}
            total={currentReceipt.total}
            date={currentReceipt.date}
          />
        )}
      </Modal>
    </div>
  )
}

export default POS
