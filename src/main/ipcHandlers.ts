import { ipcMain, dialog, app } from 'electron'
import { join, basename } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'
import db, { resetDb } from './db'

export function setupIpcHandlers(): void {
  // --- Categories ---
  ipcMain.handle('get-categories', () => {
    return db.prepare('SELECT * FROM categories').all()
  })

  ipcMain.handle('create-category', (_, { name, image, id }) => {
    if (id) {
      db.prepare('UPDATE categories SET name = ?, image = ? WHERE id = ?').run(name, image, id)
      return { id, name, image }
    }
    const info = db.prepare('INSERT INTO categories (name, image) VALUES (?, ?)').run(name, image)
    return { id: info.lastInsertRowid, name, image }
  })

  // --- Subcategories ---
  ipcMain.handle('get-subcategories', (_, categoryId) => {
    if (categoryId) {
      return db.prepare('SELECT * FROM subcategories WHERE category_id = ?').all(categoryId)
    }
    return db.prepare('SELECT * FROM subcategories').all()
  })

  ipcMain.handle('create-subcategory', (_, { name, image, category_id, id }) => {
    if (id) {
      db.prepare('UPDATE subcategories SET name = ?, image = ?, category_id = ? WHERE id = ?').run(name, image, category_id, id)
      return { id, name, image, category_id }
    }
    const info = db.prepare('INSERT INTO subcategories (name, image, category_id) VALUES (?, ?, ?)').run(name, image, category_id)
    return { id: info.lastInsertRowid, name, image, category_id }
  })

  // --- Products ---
  ipcMain.handle('get-products', (_, { categoryId, subcategoryId } = {}) => {
    let query = 'SELECT * FROM products'
    const params: any[] = []

    if (subcategoryId) {
      query += ' WHERE subcategory_id = ?'
      params.push(subcategoryId)
    } else if (categoryId) {
      query += ' WHERE category_id = ?'
      params.push(categoryId)
    }

    return db.prepare(query).all(...params)
  })

  ipcMain.handle('create-product', (_, product) => {
    const { name, price, stock, size, image, category_id, subcategory_id, id } = product
    if (id) {
       db.prepare(`
        UPDATE products SET name = ?, price = ?, stock = ?, size = ?, image = ?, category_id = ?, subcategory_id = ?
        WHERE id = ?
      `).run(name, price, stock, size, image, category_id, subcategory_id, id)
      return product
    }
    const info = db.prepare(`
      INSERT INTO products (name, price, stock, size, image, category_id, subcategory_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, price, stock, size, image, category_id, subcategory_id)
    return { id: info.lastInsertRowid, ...product }
  })

  ipcMain.handle('update-product-stock', (_, { id, quantity }) => {
    db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(quantity, id)
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id)
  })

  // --- Receipts (Sales) ---
  ipcMain.handle('create-receipt', (_, { items, total }) => {
    const transaction = db.transaction(() => {
      const date = new Date().toISOString()
      const receiptInfo = db.prepare('INSERT INTO receipts (total, date) VALUES (?, ?)').run(total, date)
      const receiptId = receiptInfo.lastInsertRowid

      const insertItem = db.prepare(`
        INSERT INTO receipt_items (receipt_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `)

      const updateStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')

      for (const item of items) {
        insertItem.run(receiptId, item.product_id, item.quantity, item.price)
        updateStock.run(item.quantity, item.product_id)
      }

      return { receiptId, total, date }
    })

    return transaction()
  })

  ipcMain.handle('get-receipts', () => {
    return db.prepare('SELECT * FROM receipts ORDER BY date DESC').all()
  })

  ipcMain.handle('get-receipt-items', (_, receiptId) => {
    return db.prepare(`
      SELECT ri.*, p.name as product_name 
      FROM receipt_items ri
      LEFT JOIN products p ON ri.product_id = p.id
      WHERE ri.receipt_id = ?
    `).all(receiptId)
  })
  
  ipcMain.handle('delete-receipt', (_, id) => {
    try {
      console.log('Main: Deleting receipt with ID:', id)
      return db.prepare('DELETE FROM receipts WHERE id = ?').run(id)
    } catch (err) {
      console.error('Main: Failed to delete receipt:', err)
      throw err
    }
  })

  ipcMain.handle('get-low-stock-products', (_, threshold = 5) => {
    return db.prepare('SELECT * FROM products WHERE stock <= ?').all(threshold)
  })

  ipcMain.handle('clear-all-data', () => {
    resetDb()
    return { success: true }
  })

  // --- Deletion Handlers ---
  ipcMain.handle('delete-product', (_, id) => {
    try {
      return db.prepare('DELETE FROM products WHERE id = ?').run(id)
    } catch (err) {
      if (err instanceof Error && err.message.includes('FOREIGN KEY constraint failed')) {
        throw new Error('Cannot delete product because it has been sold (history exists in receipts).')
      }
      throw err
    }
  })

  ipcMain.handle('delete-subcategory', (_, id) => {
    return db.prepare('DELETE FROM subcategories WHERE id = ?').run(id)
  })

  ipcMain.handle('delete-category', (_, id) => {
    return db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  })

  ipcMain.handle('upload-product-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'gif', 'webp', 'jpeg'] }]
    })

    if (result.canceled || result.filePaths.length === 0) return null

    const sourcePath = result.filePaths[0]
    const destDir = join(app.getPath('userData'), 'product_images')
    
    if (!existsSync(destDir)) {
      mkdirSync(destDir, { recursive: true })
    }

    const fileName = `${Date.now()}-${basename(sourcePath)}`
    const destPath = join(destDir, fileName)
    
    copyFileSync(sourcePath, destPath)
    
    // Return the custom protocol URL with 3 slashes
    return `app-img:///${destPath.replace(/\\/g, '/')}`
  })
}
