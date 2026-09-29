/// <reference types="vite/client" />

import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getCategories: () => Promise<any[]>
      createCategory: (data: any) => Promise<any>
      getSubcategories: (categoryId?: number) => Promise<any[]>
      createSubcategory: (data: any) => Promise<any>
      getProducts: (filter?: any) => Promise<any[]>
      createProduct: (data: any) => Promise<any>
      updateProductStock: (data: any) => Promise<any>
      createReceipt: (data: any) => Promise<any>
      getLowStockProducts: (threshold?: number) => Promise<any[]>
      deleteCategory: (id: number) => Promise<void>
      deleteSubcategory: (id: number) => Promise<void>
      deleteProduct: (id: number) => Promise<void>
      clearAllData: () => Promise<void>
      uploadProductImage: () => Promise<string | null>;
      getReceipts: () => Promise<any[]>;
      getReceiptItems: (receiptId: number) => Promise<any[]>;
      deleteReceipt: (id: number) => Promise<void>;
    }
  }
}
