import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
console.log('Preload script loaded - Version: 1.0.1 (Deletion Feature Active)');
const api = {
  getCategories: () => ipcRenderer.invoke('get-categories'),
  createCategory: (data: any) => ipcRenderer.invoke('create-category', data),
  getSubcategories: (categoryId?: number) => ipcRenderer.invoke('get-subcategories', categoryId),
  createSubcategory: (data: any) => ipcRenderer.invoke('create-subcategory', data),
  getProducts: (filter?: any) => ipcRenderer.invoke('get-products', filter),
  createProduct: (data: any) => ipcRenderer.invoke('create-product', data),
  updateProductStock: (data: any) => ipcRenderer.invoke('update-product-stock', data),
  createReceipt: (data: any) => ipcRenderer.invoke('create-receipt', data),
  getLowStockProducts: (threshold?: number) => ipcRenderer.invoke('get-low-stock-products', threshold),
  deleteCategory: (id: number) => ipcRenderer.invoke('delete-category', id),
  deleteSubcategory: (id: number) => ipcRenderer.invoke('delete-subcategory', id),
  deleteProduct: (id: number) => ipcRenderer.invoke('delete-product', id),
  clearAllData: () => ipcRenderer.invoke('clear-all-data'),
  uploadProductImage: () => ipcRenderer.invoke('upload-product-image'),
  getReceipts: () => ipcRenderer.invoke('get-receipts'),
  getReceiptItems: (receiptId: number) => ipcRenderer.invoke('get-receipt-items', receiptId),
  deleteReceipt: (id: number) => ipcRenderer.invoke('delete-receipt', id)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    console.log('Exposing API with keys:', Object.keys(api))
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
