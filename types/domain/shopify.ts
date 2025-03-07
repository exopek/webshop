export interface ShopifyProduct {
    id: string;
    title: string;
    description?: string;
    handle: string;
    featured_image?: string;
    price: number;
    compare_at_price?: number;
    on_sale: boolean;
    available: boolean;
  }
  
  export interface ShopifyCollection {
    id: string;
    title: string;
    handle: string;
    products: ShopifyProduct[];
  }
  
  export interface ShopifyConfig {
    shopifyDomain: string;
    shopifyAccessToken: string;
    shopifyApiVersion: string;
  }