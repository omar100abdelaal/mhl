import React, { useState, useEffect } from 'react'
import { Plus, ChevronRight, Folder, Save, Edit2, Trash2 } from 'lucide-react'
import { Category, Subcategory } from '../types'
import Modal from '../components/Modal'
import ConfirmModal from '../components/ConfirmModal'
import { useI18n } from '../contexts/I18nContext'

const Categories: React.FC = () => {
  const { t } = useI18n()
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null)
  
  // Modal states
  const [isCatModalOpen, setIsCatModalOpen] = useState(false)
  const [isSubModalOpen, setIsSubModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null)
  const [deleteData, setDeleteData] = useState<{ id: number, name: string, type: 'category' | 'subcategory' } | null>(null)

  // Form states
  const [catName, setCatName] = useState('')
  const [subName, setSubName] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const cats = await window.api.getCategories()
    setCategories(cats)
  }

  const handleCatClick = async (catId: number) => {
    setSelectedCatId(catId)
    const subs = await window.api.getSubcategories(catId)
    setSubcategories(subs)
  }

  const handleDeleteClick = (id: number, name: string, type: 'category' | 'subcategory') => {
    setDeleteData({ id, name, type })
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteData) return
    try {
      if (deleteData.type === 'category') {
        await window.api.deleteCategory(deleteData.id)
        if (selectedCatId === deleteData.id) setSelectedCatId(null)
        fetchCategories()
      } else {
        await window.api.deleteSubcategory(deleteData.id)
        if (selectedCatId) handleCatClick(selectedCatId)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  const handleOpenCatModal = (cat: Category | null = null) => {
    setEditingCat(cat)
    setCatName(cat ? cat.name : '')
    setIsCatModalOpen(true)
  }

  const handleOpenSubModal = (sub: Subcategory | null = null) => {
    setEditingSub(sub)
    setSubName(sub ? sub.name : '')
    setIsSubModalOpen(true)
  }

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await window.api.createCategory({ name: catName, id: editingCat?.id })
      setIsCatModalOpen(false)
      fetchCategories()
    } catch (err) {
      console.error('Save category failed:', err)
    }
  }

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCatId && !editingSub) return
    try {
      await window.api.createSubcategory({ 
        name: subName, 
        category_id: editingSub ? editingSub.category_id : selectedCatId,
        id: editingSub?.id 
      })
      setIsSubModalOpen(false)
      if (selectedCatId) handleCatClick(selectedCatId)
    } catch (err) {
      console.error('Save subcategory failed:', err)
    }
  }

  return (
    <div className="categories-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <section>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{t('categories')}</h2>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} onClick={() => handleOpenCatModal()}>
            <Plus size={16} /> {t('add')}
          </button>
        </header>
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          {categories.map(cat => (
            <div 
              key={cat.id} 
              style={{ 
                padding: '0.75rem 1rem', 
                borderRadius: '0.75rem', 
                background: selectedCatId === cat.id ? 'var(--primary)' : 'transparent',
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                marginBottom: '0.25rem'
              }}
              onClick={() => handleCatClick(cat.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Folder size={18} />
                {cat.name}
              </div>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                <button 
                  className="btn-icon" 
                  style={{ padding: '2px', color: 'rgba(255,255,255,0.7)' }} 
                  onClick={(e) => { e.stopPropagation(); handleOpenCatModal(cat); }}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  className="btn-icon" 
                  style={{ padding: '2px', color: '#f87171' }} 
                  onClick={(e) => { e.stopPropagation(); handleDeleteClick(cat.id, cat.name, 'category'); }}
                >
                  <Trash2 size={14} />
                </button>
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{t('subcategory')} ({categories.find(c => c.id === selectedCatId)?.name})</h2>
          <button 
            className="btn btn-primary" 
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} 
            disabled={!selectedCatId}
            onClick={() => handleOpenSubModal()}
          >
            <Plus size={16} /> {t('add')}
          </button>
        </header>
        <div className="glass-card" style={{ padding: '0.5rem', minHeight: '200px' }}>
          {selectedCatId ? (
            subcategories.length > 0 ? (
              subcategories.map(sub => (
                <div 
                  key={sub.id} 
                  style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '0.75rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <ChevronRight size={16} color="var(--text-muted)" />
                    {sub.name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn-icon" 
                      style={{ padding: '2px', color: 'rgba(255,255,255,0.7)' }} 
                      onClick={() => handleOpenSubModal(sub)}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      className="btn-icon" 
                      style={{ padding: '2px', color: '#f87171' }} 
                      onClick={() => handleDeleteClick(sub.id, sub.name, 'subcategory')}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('noSubcategoriesFound')}</div>
            )
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('selectCategoryToViewSubcategories')}</div>
          )}
        </div>
      </section>

      {/* Category Modal */}
      <Modal 
        isOpen={isCatModalOpen} 
        onClose={() => setIsCatModalOpen(false)} 
        title={editingCat ? t('manageCategories') : t('newCategory')}
      >
        <form onSubmit={handleSaveCategory}>
          <div className="form-group">
            <label>{t('name')}</label>
            <input 
              className="form-control" 
              required
              value={catName}
              onChange={e => setCatName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <Save size={18} />
            {t('save')}
          </button>
        </form>
      </Modal>

      {/* Subcategory Modal */}
      <Modal 
        isOpen={isSubModalOpen} 
        onClose={() => setIsSubModalOpen(false)} 
        title={editingSub ? t('subcategory') : t('newSubcategory')}
      >
        <form onSubmit={handleSaveSubcategory}>
          <div className="form-group">
            <label>{t('name')}</label>
            <input 
              className="form-control" 
              required
              value={subName}
              onChange={e => setSubName(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            <Save size={18} />
            {t('save')}
          </button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteData?.type === 'category' ? 'Category' : 'Subcategory'}`}
        message={`Are you sure you want to delete "${deleteData?.name}"? This action cannot be undone.`}
      />
    </div>
  )
}

export default Categories
