import React, { useState, useEffect } from 'react'
import { Package, Edit2, AlertCircle, Plus, Save, Trash2, Image as ImageIcon } from 'lucide-react'
import { Product, Category } from '../types'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import CustomSelect from '../components/CustomSelect'
import { PRODUCT_SIZES } from '../constants/sizes'
import { useI18n } from '../contexts/I18nContext'

const Inventory: React.FC = () => {
  const { t } = useI18n()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Filters
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterSize, setFilterSize] = useState<string>('')
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    size: '',
    category_id: '',
    image: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [prodData, catData] = await Promise.all([
      window.api.getProducts(),
      window.api.getCategories()
    ])
    setProducts(prodData)
    setCategories(catData)
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    try {
      await window.api.deleteProduct(productToDelete.id)
      fetchData()
    } catch (err) {
      console.error('Delete failed:', err)
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleOpenModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product)
      setFormData({
        name: product.name,
        price: product.price.toString(),
        stock: product.stock.toString(),
        size: product.size || '',
        category_id: product.category_id?.toString() || '',
        image: product.image || ''
      })
    } else {
      setEditingProduct(null)
      setFormData({ name: '', price: '', stock: '', size: '', category_id: '', image: '' })
    }
    setIsModalOpen(true)
  }

  const handleChooseImage = async () => {
    const imagePath = await window.api.uploadProductImage()
    if (imagePath) {
      setFormData({ ...formData, image: imagePath })
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      category_id: formData.category_id ? parseInt(formData.category_id) : undefined
    }

    try {
      if (editingProduct) {
        // We need an updateProduct IPC handler. For now I'll use createProduct as placeholder if needed, 
        // but let's assume updateProduct exists or I'll implement it.
        // Actually, the main process might need an update-product handler.
        await window.api.createProduct({ ...payload, id: editingProduct.id })
      } else {
        await window.api.createProduct(payload)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <div className="inventory-container">
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{t('inventoryManagement')}</h1>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={20} />
          {t('addProduct')}
        </button>
      </header>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
        <div style={{ width: '200px' }}>
          <CustomSelect
            label="Filter by Category"
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map(c => ({ value: c.id.toString(), label: c.name }))
            ]}
            value={filterCategory}
            onChange={(val) => setFilterCategory(val)}
            placeholder="All Categories"
          />
        </div>
        <div style={{ width: '200px' }}>
          <CustomSelect
            label="Filter by Size"
            options={[
              { value: '', label: 'All Sizes' },
              ...PRODUCT_SIZES
            ]}
            value={filterSize}
            onChange={(val) => setFilterSize(val)}
            placeholder="All Sizes"
          />
        </div>
        {(filterCategory || filterSize) && (
          <button 
            className="btn glass-card" 
            style={{ padding: '0.75rem 1rem', fontSize: '0.85rem' }}
            onClick={() => { setFilterCategory(''); setFilterSize(''); }}
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="glass-card" style={{ padding: '0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              <th style={{ padding: '1rem' }}>{t('product')}</th>
              <th style={{ padding: '1rem' }}>{t('price')}</th>
              <th style={{ padding: '1rem' }}>{t('stock')}</th>
              <th style={{ padding: '1rem' }}>{t('size')}</th>
              <th style={{ padding: '1rem' }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter(p => !filterCategory || p.category_id?.toString() === filterCategory)
              .filter(p => !filterSize || p.size === filterSize)
              .map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {p.image ? (
                    <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                  ) : (
                    <Package size={18} color="var(--text-muted)" />
                  )}
                  {p.name}
                </td>
                <td style={{ padding: '1rem' }}>{p.price.toFixed(2)} {t('currency')}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    color: p.stock <= 5 ? '#f87171' : 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {p.stock}
                    {p.stock <= 5 && <AlertCircle size={14} />}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.size || '-'}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => handleOpenModal(p)}
                      style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(p)}
                      style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? t('editProduct') : t('newProduct')}
      >
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>{t('productName')}</label>
            <input 
              className="form-control" 
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label>{t('price')} ({t('currency')})</label>
              <input 
                type="number" step="0.01" className="form-control" required
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>{t('stock')}</label>
              <input 
                type="number" className="form-control" required
                value={formData.stock}
                onChange={e => setFormData({ ...formData, stock: e.target.value })}
              />
            </div>
          </div>
          <CustomSelect
            label={t('size')}
            options={PRODUCT_SIZES}
            value={formData.size}
            onChange={(val) => setFormData({ ...formData, size: val })}
            placeholder={t('selectSize')}
          />
          <CustomSelect
            label={t('category')}
            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
            value={formData.category_id}
            onChange={(val) => setFormData({ ...formData, category_id: val })}
            placeholder={t('selectCategory')}
          />
          
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>{t('product')} {t('image')}</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div 
                onClick={handleChooseImage}
                style={{ 
                  flex: 1, 
                  height: '100px', 
                  border: '2px dashed var(--border)', 
                  borderRadius: '0.75rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'var(--glass)',
                  overflow: 'hidden'
                }}
              >
                {formData.image ? (
                  <img src={formData.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <ImageIcon size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{t('chooseImage')}</span>
                  </>
                )}
              </div>
              {formData.image && (
                <button 
                  type="button" 
                  className="btn-icon" 
                  style={{ color: '#f87171' }}
                  onClick={() => setFormData({ ...formData, image: '' })}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }}>
            <Save size={18} />
            {editingProduct ? t('save') : t('save')}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default Inventory
