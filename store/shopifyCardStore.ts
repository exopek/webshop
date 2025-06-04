import { defineStore } from 'pinia'

export interface ShopifyCartItem {
  id: string;
  variantId: string;
  productId: string;
  title: string;
  quantity: number;
  price: number;
  featuredImage?: string;
}

export interface ShopifyCart {
  id: string;
  items: ShopifyCartItem[];
  totalQuantity: number;
  totalAmount: number;
  currencyCode: string;
  checkoutUrl: string;
}

export const useShopifyCardStore = defineStore('shopifyCardStore', {
  state: () => ({
    cart: {
      id: '',
      items: [],
      totalQuantity: 0,
      totalAmount: 0,
      currencyCode: 'EUR',
      checkoutUrl: ''
    } as ShopifyCart,
    loading: false,
    error: null as Error | null
  }),
  
  getters: {
    getCartItemCount: (state) => state.cart.totalQuantity,
    getCartTotal: (state) => state.cart.totalAmount,
    getFormattedTotal: (state) => {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: state.cart.currencyCode
      }).format(state.cart.totalAmount)
    }
  },
  
  actions: {
    async initCart() {
      if (process.server) return
      
      // Falls wir bereits eine Cart-ID haben, direkt abrufen
      let cartId = null
      if (typeof window !== 'undefined') {
        cartId = localStorage.getItem('shopifyCartId')
      }
      
      if (cartId) {
        await this.fetchCart(cartId)
      } else {
        await this.createCart()
      }
    },
    
    async fetchCart(cartId: string) {
      this.loading = true
      this.error = null
      
      try {
        const query = `
          query getCart($cartId: ID!) {
            cart(id: $cartId) {
              id
              checkoutUrl
              estimatedCost {
                totalAmount {
                  amount
                  currencyCode
                }
              }
              lines(first: 100) {
                edges {
                  node {
                    id
                    quantity
                    merchandise {
                      ... on ProductVariant {
                        id
                        product {
                          id
                          title
                          featuredImage {
                            url
                          }
                        }
                        price {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
        
        const response = await this.shopifyFetch(query, { cartId })
        
        // Prüfen, ob der Cart existiert
        if (!response?.data?.cart) {
          // Falls nicht, erstellen wir einen neuen Cart
          await this.createCart()
          return
        }
        
        // Cart in strukturiertes Format umwandeln
        this.updateCartState(response.data.cart)
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err))
        console.error('Error fetching cart:', err)
      } finally {
        this.loading = false
      }
    },
    
    async createCart() {
      this.loading = true
      this.error = null
      
      try {
        const query = `
          mutation createCart {
            cartCreate {
              cart {
                id
                checkoutUrl
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          product {
                            id
                            title
                            featuredImage {
                              url
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
        
        const response = await this.shopifyFetch(query)
        
        if (!response?.data?.cartCreate?.cart) {
          throw new Error('Failed to create cart')
        }
        
        // Cart in strukturiertes Format umwandeln
        this.updateCartState(response.data.cartCreate.cart)
        
        // Cart-ID im localStorage speichern
        if (typeof window !== 'undefined') {
          localStorage.setItem('shopifyCartId', this.cart.id)
        }
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err))
        console.error('Error creating cart:', err)
      } finally {
        this.loading = false
      }
    },
    
    async addToCart(variantId: string, quantity: number = 1) {
      this.loading = true
      this.error = null
      
      try {
        // Sicherstellen, dass wir einen Cart haben
        if (!this.cart.id) {
          await this.initCart()
        }
        
        const query = `
          mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          product {
                            id
                            title
                            featuredImage {
                              url
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
        
        const variables = {
          cartId: this.cart.id,
          lines: [
            {
              merchandiseId: variantId,
              quantity
            }
          ]
        }
        
        const response = await this.shopifyFetch(query, variables)

        console.log('Response:', response)
        
        if (!response?.data?.cartLinesAdd?.cart) {
          throw new Error('Failed to add item to cart')
        }
        
        // Cart aktualisieren
        this.updateCartState(response.data.cartLinesAdd.cart)
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err))
        console.error('Error adding to cart:', err)
      } finally {
        this.loading = false
      }
    },
    
    async updateCartItemQuantity(lineId: string, quantity: number) {
      this.loading = true
      this.error = null
      
      try {
        const query = `
          mutation updateCartLines($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
            cartLinesUpdate(cartId: $cartId, lines: $lines) {
              cart {
                id
                checkoutUrl
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          product {
                            id
                            title
                            featuredImage {
                              url
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
        
        const variables = {
          cartId: this.cart.id,
          lines: [
            {
              id: lineId,
              quantity
            }
          ]
        }
        
        const response = await this.shopifyFetch(query, variables)
        
        if (!response?.data?.cartLinesUpdate?.cart) {
          throw new Error('Failed to update cart')
        }
        
        // Cart aktualisieren
        this.updateCartState(response.data.cartLinesUpdate.cart)
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err))
        console.error('Error updating cart item:', err)
      } finally {
        this.loading = false
      }
    },
    
    async removeCartItem(lineId: string) {
      this.loading = true
      this.error = null
      
      try {
        const query = `
          mutation removeCartLines($cartId: ID!, $lineIds: [ID!]!) {
            cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
              cart {
                id
                checkoutUrl
                estimatedCost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                lines(first: 100) {
                  edges {
                    node {
                      id
                      quantity
                      merchandise {
                        ... on ProductVariant {
                          id
                          product {
                            id
                            title
                            featuredImage {
                              url
                            }
                          }
                          price {
                            amount
                            currencyCode
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `
        
        const variables = {
          cartId: this.cart.id,
          lineIds: [lineId]
        }
        
        const response = await this.shopifyFetch(query, variables)
        
        if (!response?.data?.cartLinesRemove?.cart) {
          throw new Error('Failed to remove item from cart')
        }
        
        // Cart aktualisieren
        this.updateCartState(response.data.cartLinesRemove.cart)
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err))
        console.error('Error removing cart item:', err)
      } finally {
        this.loading = false
      }
    },

    async getCartData(): Promise<ShopifyCart | null> {
      // Wenn wir noch keinen Warenkorb haben, initialisieren wir ihn
      if (!this.cart.id) {
        await this.initCart();
      }
    
      // Wenn immer noch kein Warenkorb existiert, gibt es wahrscheinlich ein Problem
      if (!this.cart.id) {
        this.error = new Error('Failed to initialize cart');
        return null;
      }
    
      try {
        // Aktuellen Warenkorb vom Server abrufen
        await this.fetchCart(this.cart.id);
        
        // Den aktualisierten Warenkorb zurückgeben
        return {...this.cart}; // Eine Kopie zurückgeben, um Mutationen zu vermeiden
      } catch (err) {
        this.error = err instanceof Error ? err : new Error(String(err));
        console.error('Error getting cart data:', err);
        return null;
      }
    },

    /**
         * Lädt die Shopify-Konfiguration für den aktuellen Mandanten
         */
        async getShopifyConfig() {
          const config = useRuntimeConfig()
          const tenantId = config.public.TENANT_ID
          console.log('Tenant ID:', tenantId)
          console.log('Shopify config:', config.public.shopify)
          
          return {
            shopifyDomain: config.public.shopify.domain || 'flash-reflex-training.myshopify.com',
            shopifyAccessToken: config.shopifyAccessToken || '0c54fa2544bf3c6ce9b1fe8d03e79f5e',
            shopifyApiVersion: config.public.shopify.apiVersion || '2025-01'
          }
        },
    
    // GraphQL-Anfragen an Shopify senden
    async shopifyFetch(query: string, variables: Record<string, any> = {}) {
        const { shopifyDomain, shopifyAccessToken, shopifyApiVersion } = await this.getShopifyConfig()
        
        if (!shopifyDomain || !shopifyAccessToken) {
          this.error = new Error(String('Shopify config missing'))
          console.error(this.error)
          return null
        }
        
        const url = `https://${shopifyDomain}/api/${shopifyApiVersion}/graphql.json`
        
        try {
          this.loading = true
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': shopifyAccessToken
            },
            body: JSON.stringify({ query, variables })
          })

          console.log('Response immer:', response)
          
          if (!response.ok) {
            throw new Error(`Shopify API error: ${response.status}`)
          }
          //const data = await response.json()
          console.log('Data immer:', response)
          
          const data = await response.json()
          console.log('Data immer:', data)
          return data
        } catch (error) {
          console.log('Error immer:', error)
          this.error = error instanceof Error ? error : new Error(String(error))
          console.error(this.error)
          return null
        } finally {
          this.loading = false
        }
      },
    
    // Cart-Zustand aktualisieren
    updateCartState(shopifyCart: any) {
      const items: ShopifyCartItem[] = shopifyCart.lines.edges.map((edge: any) => {
        const node = edge.node
        const merchandise = node.merchandise
        const product = merchandise.product
        
        return {
          id: node.id,
          variantId: merchandise.id,
          productId: product.id,
          title: product.title,
          quantity: node.quantity,
          price: parseFloat(merchandise.price.amount),
          featuredImage: product.featuredImage?.url
        }
      })
      
      this.cart = {
        id: shopifyCart.id,
        items,
        totalQuantity: items.reduce((sum: number, item: ShopifyCartItem) => sum + item.quantity, 0),
        totalAmount: parseFloat(shopifyCart.estimatedCost.totalAmount.amount),
        currencyCode: shopifyCart.estimatedCost.totalAmount.currencyCode,
        checkoutUrl: shopifyCart.checkoutUrl
      }
    },
    
    formatMoney(amount: number) {
      return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: this.cart.currencyCode
      }).format(amount)
    }
  }
})