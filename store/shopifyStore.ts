// stores/shopify.ts
import { defineStore } from 'pinia'
import { useRuntimeConfig } from 'nuxt/app'
import type { ShopifyProduct } from '~/types/domain/shopify'

interface ShopifyState {
  products: Map<string, ShopifyProduct>;
  collections: Map<string, ShopifyProduct[]>;
  isLoading: boolean;
  error: string | null;
}

// Definieren Sie den Shopify Store
export const useShopifyStore = defineStore('shopifyStore', {
  // State
  state: (): ShopifyState => ({
    products: new Map(),
    collections: new Map(),
    isLoading: false,
    error: null
  }),

  // Getters
  getters: {
    getProduct: (state) => (productId: string): ShopifyProduct | undefined => {
      return state.products.get(productId)
    },
    
    getProductsByCollection: (state) => (collectionHandle: string): ShopifyProduct[] | undefined => {
      return state.collections.get(collectionHandle)
    }
  },

  // Actions
  actions: {
    /**
     * Lädt die Shopify-Konfiguration für den aktuellen Mandanten
     */
    async getShopifyConfig() {
      const config = useRuntimeConfig()
      const tenantId = config.public.TENANT_ID
      
      return {
        shopifyDomain: config.public.shopify.domain || '',
        shopifyAccessToken: config.shopifyAccessToken || '',
        shopifyApiVersion: config.public.shopify.apiVersion || '2023-10'
      }
    },

    /**
     * Führt eine GraphQL-Abfrage an die Shopify Storefront API durch
     */
    async shopifyFetch(query: string, variables: Record<string, any> = {}) {
      const { shopifyDomain, shopifyAccessToken, shopifyApiVersion } = await this.getShopifyConfig()
      
      if (!shopifyDomain || !shopifyAccessToken) {
        this.error = 'Shopify configuration is missing'
        console.error(this.error)
        return null
      }
      
      const url = `https://${shopifyDomain}/api/${shopifyApiVersion}/graphql.json`
      
      try {
        this.isLoading = true
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': shopifyAccessToken
          },
          body: JSON.stringify({ query, variables })
        })
        
        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`)
        }
        
        return await response.json()
      } catch (error) {
        this.error = `Error fetching from Shopify: ${error}`
        console.error(this.error)
        return null
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Holt ein einzelnes Produkt anhand seiner ID
     */
    async fetchProduct(productId: string): Promise<ShopifyProduct | null> {
      // Prüfen auf Cache-Treffer
      if (this.products.has(productId)) {
        return this.products.get(productId) as ShopifyProduct
      }
      
      // GraphQL-Abfrage für ein einzelnes Produkt
      const query = `
        query getProduct($productId: ID!) {
          product(id: $productId) {
            id
            title
            description
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            variants(first: 1) {
              edges {
                node {
                  id
                  price
                  compareAtPrice
                  availableForSale
                }
              }
            }
          }
        }
      `
      
      const response = await this.shopifyFetch(query, { productId })
      
      if (!response?.data?.product) {
        return null
      }
      
      // Transformieren der Produktdaten in ein einfacheres Format
      const shopifyProduct = response.data.product
      const firstVariant = shopifyProduct.variants.edges[0]?.node
      
      const product: ShopifyProduct = {
        id: shopifyProduct.id,
        title: shopifyProduct.title,
        description: shopifyProduct.description,
        handle: shopifyProduct.handle,
        featured_image: shopifyProduct.featuredImage?.url,
        price: parseFloat(firstVariant?.price || 0),
        compare_at_price: parseFloat(firstVariant?.compareAtPrice || 0),
        on_sale: firstVariant?.compareAtPrice && firstVariant.compareAtPrice > firstVariant.price,
        available: firstVariant?.availableForSale || false
      }
      
      // Im Cache speichern
      this.products.set(productId, product)
      
      return product
    },

    /**
     * Holt Produkte aus einer bestimmten Sammlung
     */
    async fetchProductsByCollection(collectionHandle: string, limit: number = 8): Promise<ShopifyProduct[]> {
      // Generiere Cache-Schlüssel
      const cacheKey = collectionHandle
      
      // Prüfen auf Cache-Treffer
      if (this.collections.has(cacheKey)) {
        return this.collections.get(cacheKey) as ShopifyProduct[]
      }
      
      // GraphQL-Abfrage für Produkte in einer Sammlung
      const query = `
        query getProductsByCollection($collectionHandle: String!, $numProducts: Int!) {
          collection(handle: $collectionHandle) {
            products(first: $numProducts) {
              edges {
                node {
                  id
                  title
                  handle
                  featuredImage {
                    url
                    altText
                  }
                  priceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  compareAtPriceRange {
                    minVariantPrice {
                      amount
                      currencyCode
                    }
                  }
                  variants(first: 1) {
                    edges {
                      node {
                        id
                        price
                        compareAtPrice
                        availableForSale
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `
      
      const response = await this.shopifyFetch(query, { 
        collectionHandle, 
        numProducts: limit 
      })
      
      if (!response?.data?.collection?.products?.edges) {
        return []
      }
      
      // Transformieren der Produktdaten
      const products = response.data.collection.products.edges.map(({ node }: any) => {
        const firstVariant = node.variants.edges[0]?.node
        
        const product: ShopifyProduct = {
          id: node.id,
          title: node.title,
          handle: node.handle,
          featured_image: node.featuredImage?.url,
          price: parseFloat(firstVariant?.price || 0),
          compare_at_price: parseFloat(firstVariant?.compareAtPrice || 0),
          on_sale: firstVariant?.compareAtPrice && firstVariant.compareAtPrice > firstVariant.price,
          available: firstVariant?.availableForSale || false
        }

        // Produkt auch im Produkt-Cache speichern
        this.products.set(product.id, product)

        return product
      })
      
      // Im Collection-Cache speichern
      this.collections.set(cacheKey, products)
      
      return products
    },

    /**
     * Den Cache für eine bestimmte Sammlung leeren
     */
    clearCollectionCache(collectionHandle: string) {
      this.collections.delete(collectionHandle)
    },

    /**
     * Den Cache für ein bestimmtes Produkt leeren
     */
    clearProductCache(productId: string) {
      this.products.delete(productId)
    },

    /**
     * Den gesamten Cache leeren
     */
    clearCache() {
      this.products.clear()
      this.collections.clear()
    }
  }
})