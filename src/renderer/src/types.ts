export interface Category {
  id: number;
  name: string;
  image?: string;
}

export interface Subcategory {
  id: number;
  name: string;
  image?: string;
  category_id: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  size?: string;
  image?: string;
  category_id?: number;
  subcategory_id?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Receipt {
  id: number;
  total: number;
  date: string;
}
