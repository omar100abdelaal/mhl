import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import POS from './views/POS'
import Inventory from './views/Inventory'
import Categories from './views/Categories'
import SalesHistory from './views/SalesHistory'
import { Product } from './types'

function App(): React.JSX.Element {
  const [activeView, setActiveView] = useState('pos')
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

  // Basic mock for browser testing
  useEffect(() => {
    if (!window.api) {
      console.warn('Electron API not found. Using mocks.')
      window.api = {
        getCategories: async () => [],
        createCategory: async () => ({ id: 1, name: 'Mock' }),
        getSubcategories: async () => [],
        createSubcategory: async () => ({ id: 1, name: 'Mock' }),
        getProducts: async () => [],
        createProduct: async () => ({ id: 1, name: 'Mock' }),
        updateProductStock: async () => ({ id: 1, name: 'Mock' }),
        createReceipt: async () => ({ receiptId: 1 }),
        getLowStockProducts: async () => [],
        deleteCategory: async () => {},
        deleteSubcategory: async () => {},
        deleteProduct: async () => {},
        clearAllData: async () => {},
        uploadProductImage: async () => null,
        getReceipts: async () => [],
        getReceiptItems: async () => [],
        deleteReceipt: async () => {}
      }
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      try {
        fetchLowStock()
      } catch (err) {
        console.error('Initialization error:', err)
      }
    }
    
    const fetchLowStock = async () => {
      try {
        const products = await window.api.getLowStockProducts(5)
        setLowStockProducts(products)
      } catch (err) {
        console.error('Failed to fetch low stock:', err)
      }
    }

    init()
    const interval = setInterval(fetchLowStock, 60000)
    return () => clearInterval(interval)
  }, [])

  const renderView = () => {
    switch (activeView) {
      case 'pos':
        return <POS />
      case 'inventory':
        return <Inventory />
      case 'categories':
        return <Categories />
      case 'receipts':
        return <SalesHistory />
      default:
        return <POS />
    }
  }

  return (
    <div className="app-container">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        lowStockCount={lowStockProducts.length} 
      />
      <main className="main-content">
        {renderView()}
      </main>
    </div>
  )
}

export default App
