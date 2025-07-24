// stores/shopify.ts
import { defineStore } from "pinia";
import { useRuntimeConfig } from "nuxt/app";
import type {
  ProductFilterOptions,
  ShopifyProduct,
} from "~/types/domain/shopify";

export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: string;
  productsCount?: number;
}

interface ShopifyState {
  products: Map<string, ShopifyProduct>;
  collections: Map<string, ShopifyProduct[]>;
  collectionsData: Map<string, ShopifyCollection>;
  allCollections: ShopifyCollection[];
  isLoading: boolean;
  error: string | null;
}

// Definieren Sie den Shopify Store
export const useShopifyStore = defineStore("shopifyStore", {
  // State
  state: (): ShopifyState => ({
    products: new Map(),
    collections: new Map(),
    collectionsData: new Map(),
    allCollections: [],
    isLoading: false,
    error: null,
  }),

  // Getters
  getters: {
    getProduct:
      (state) =>
      (productId: string): ShopifyProduct | undefined => {
        return state.products.get(productId);
      },

    getProductsByCollection:
      (state) =>
      (collectionHandle: string): ShopifyProduct[] | undefined => {
        return state.collections.get(collectionHandle);
      },

    getCollection:
      (state) =>
      (collectionHandle: string): ShopifyCollection | undefined => {
        return state.collectionsData.get(collectionHandle);
      },

    getAllCollections: (state): ShopifyCollection[] => {
      return state.allCollections;
    },
  },

  // Actions
  actions: {
    /**
     * Lädt die Shopify-Konfiguration für den aktuellen Mandanten
     */
    async getShopifyConfig() {
      const config = useRuntimeConfig();
      const tenantId = config.public.TENANT_ID;
      console.log("Tenant ID:", tenantId);
      console.log("Shopify config:", config.public.shopify);
      console.log("Shopify Access Token:", config.shopifyAccessToken);
      console.log("Shopify API Version:", config.public.shopify.apiVersion);
      console.log("Shopify Domain:", config.public.shopify.domain);

      return {
        shopifyDomain:
          config.public.shopify.domain || "flash-reflex-training.myshopify.com",
        shopifyAccessToken:
          config.public.shopifyAccessToken || "0c54fa2544bf3c6ce9b1fe8d03e79f5e",
        shopifyApiVersion: config.public.shopify.apiVersion || "2025-01",
      };
    },

    /**
     * Führt eine GraphQL-Abfrage an die Shopify Storefront API durch
     */
    async shopifyFetch(query: string, variables: Record<string, any> = {}) {
      const { shopifyDomain, shopifyAccessToken, shopifyApiVersion } =
        await this.getShopifyConfig();

      if (!shopifyDomain || !shopifyAccessToken) {
        this.error = "Shopify configuration is missing";
        console.error(this.error);
        return null;
      }

      const url = `https://${shopifyDomain}/api/${shopifyApiVersion}/graphql.json`;

      try {
        this.isLoading = true;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": shopifyAccessToken,
          },
          body: JSON.stringify({ query, variables }),
        });

        if (!response.ok) {
          throw new Error(`Shopify API error: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        this.error = `Error fetching from Shopify: ${error}`;
        console.error(this.error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Holt ein einzelnes Produkt anhand seiner ID
     */
    async fetchProduct(productId: string): Promise<ShopifyProduct | null> {
      // Prüfen auf Cache-Treffer
      if (this.products.has(productId)) {
        return this.products.get(productId) as ShopifyProduct;
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
            images(first: 10) {
                edges {
                  node {
                    url
                    altText
                    width
                    height
                  }
                }
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
            variants(first: 5) {  # Hier werden die Varianten abgerufen
              edges {
                node {
                  id  # Die Varianten-ID, die du für den Warenkorb benötigst
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                  image {
                    url
                    altText
                    width
                    height
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                }
              }
            }  
          }
        }
      `;
      console.log("Fetching product:", productId);
      const response = await this.shopifyFetch(query, { productId });
      console.log("Product response:", response);
      if (!response?.data?.product) {
        return null;
      }

      // Transformieren der Produktdaten in ein einfacheres Format
      const shopifyProduct = response.data.product;
      /* const firstVariant = shopifyProduct.variants.edges[0]?.node */

      const product: ShopifyProduct = {
        id: shopifyProduct.id,
        variant_id: shopifyProduct.variants.edges[0]?.node.id,
        title: shopifyProduct.title,
        description: shopifyProduct.description,
        handle: shopifyProduct.handle,
        featured_image: shopifyProduct.featuredImage?.url,
        on_sale: false,
        available: shopifyProduct.variants.edges[0]?.node.availableForSale || false,
        price: parseFloat(shopifyProduct.variants.edges[0]?.node.price.amount || 0),
        images: shopifyProduct.images.edges.map((edge: any) => edge.node.url),
        /*  price: parseFloat(firstVariant?.price || 0),
        compare_at_price: parseFloat(firstVariant?.compareAtPrice || 0),
        on_sale: firstVariant?.compareAtPrice && firstVariant.compareAtPrice > firstVariant.price,
        available: firstVariant?.availableForSale || false */
      };

      // Im Cache speichern
      this.products.set(productId, product);

      return product;
    },

    /**
     * Holt Produkte aus einer bestimmten Sammlung
     */
    async fetchProductsByCollection(
      collectionHandle: string,
      limit: number = 8
    ): Promise<ShopifyProduct[]> {
      // Generiere Cache-Schlüssel
      const cacheKey = collectionHandle;

      // Prüfen auf Cache-Treffer
      if (this.collections.has(cacheKey)) {
        return this.collections.get(cacheKey) as ShopifyProduct[];
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
                  maxVariantPrice {
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
                        price {
                      amount
                      currencyCode
                    }
                      compareAtPrice {
                      amount
                      currencyCode
                    }
                        availableForSale
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const response = await this.shopifyFetch(query, {
        collectionHandle,
        numProducts: limit,
      });

      console.log("Collection response:", response);

      if (!response?.data?.collection?.products?.edges) {
        return [];
      }

      // Transformieren der Produktdaten
      const products = response.data.collection.products.edges.map(
        ({ node }: any) => {
          const firstVariant = node.variants.edges[0]?.node;

          const product: ShopifyProduct = {
            id: node.id,
            title: node.title,
            handle: node.handle,
            featured_image: node.featuredImage?.url,
            price: parseFloat(firstVariant?.price.amount || 0),
            compare_at_price: parseFloat(firstVariant?.compareAtPrice || 0),
            on_sale:
              firstVariant?.compareAtPrice &&
              firstVariant.compareAtPrice > firstVariant.price,
            available: firstVariant?.availableForSale || false,
          };

          // Produkt auch im Produkt-Cache speichern
          this.products.set(product.id, product);

          return product;
        }
      );

      // Im Collection-Cache speichern
      this.collections.set(cacheKey, products);

      return products;
    },

    /**
     * Holt alle Collections von Shopify
     */
    async fetchAllCollections(): Promise<ShopifyCollection[]> {
      // Prüfen auf Cache-Treffer
      if (this.allCollections.length > 0) {
        return this.allCollections;
      }

      const query = `
        query getAllCollections($numCollections: Int!) {
          collections(first: $numCollections) {
            edges {
              node {
                id
                title
                handle
                description
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      `;

      const response = await this.shopifyFetch(query, {
        numCollections: 50,
      });

      if (!response?.data?.collections?.edges) {
        return [];
      }

      const collections = response.data.collections.edges.map(({ node }: any) => {
        const collection: ShopifyCollection = {
          id: node.id,
          title: node.title,
          handle: node.handle,
          description: node.description,
          image: node.image?.url,
          productsCount: 0, // Note: productsCount not available in Storefront API
        };

        // Collection auch im Collections-Cache speichern
        this.collectionsData.set(collection.handle, collection);

        return collection;
      });

      // Im State speichern
      this.allCollections = collections;

      return collections;
    },

    /**
     * Holt eine spezifische Collection anhand des Handles
     */
    async fetchCollection(collectionHandle: string): Promise<ShopifyCollection | null> {
      // Prüfen auf Cache-Treffer
      if (this.collectionsData.has(collectionHandle)) {
        return this.collectionsData.get(collectionHandle) as ShopifyCollection;
      }

      const query = `
        query getCollection($collectionHandle: String!) {
          collection(handle: $collectionHandle) {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      `;

      const response = await this.shopifyFetch(query, {
        collectionHandle,
      });

      if (!response?.data?.collection) {
        return null;
      }

      const collectionData = response.data.collection;
      const collection: ShopifyCollection = {
        id: collectionData.id,
        title: collectionData.title,
        handle: collectionData.handle,
        description: collectionData.description,
        image: collectionData.image?.url,
        productsCount: 0, // Note: productsCount not available in Storefront API
      };

      // Im Cache speichern
      this.collectionsData.set(collectionHandle, collection);

      return collection;
    },

    async fetchProducts(
      options: ProductFilterOptions = {}
    ): Promise<ShopifyProduct[]> {
      // Default-Werte
      const {
        minPrice = 0,
        maxPrice = 1000000,
        available = true,
        sortBy = "price-desc",
        filterQuery = "",
        tags = [],
        productType = "",
        limit = 10,
        cursor = "",
      } = options;

      // Cache-Schlüssel basierend auf Filteroptionen generieren
      const cacheKey = `all_products_${minPrice}_${maxPrice}_${available}_${sortBy}_${filterQuery}_${tags.join(
        "_"
      )}_${productType}_${limit}_${cursor}`;

      // Prüfen auf Cache-Treffer
      if (this.collections.has(cacheKey)) {
        return this.collections.get(cacheKey) as ShopifyProduct[];
      }

      // Sortierungsoption für GraphQL umwandeln
      let sortKey, reverse;
      switch (sortBy) {
        case "price-asc":
          sortKey = "PRICE";
          reverse = false;
          break;
        case "price-desc":
          sortKey = "PRICE";
          reverse = true;
          break;
        case "title-asc":
          sortKey = "TITLE";
          reverse = false;
          break;
        case "title-desc":
          sortKey = "TITLE";
          reverse = true;
          break;
        case "created-desc":
          sortKey = "CREATED_AT";
          reverse = true;
          break;
        case "created-asc":
          sortKey = "CREATED_AT";
          reverse = false;
          break;
        default:
          sortKey = "RELEVANCE";
          reverse = false;
      }

      // Filter für Verfügbarkeit (currently unused in this implementation)
      // let availabilityFilter = "";
      // if (available !== undefined) {
      //   availabilityFilter = `, availableForSale: ${available}`;
      // }

      // Filter für Tags
      let tagsFilter = "";
      if (tags.length > 0) {
        tagsFilter = `, tag: "${tags[0]}"`;
      }

      // Filter für Produkttyp
      let productTypeFilter = "";
      if (productType) {
        productTypeFilter = `, productType: "${productType}"`;
      }

      // Pagination mit Cursor
      let afterCursor = "";
      if (cursor) {
        afterCursor = `, after: "${cursor}"`;
      }

      // GraphQL-Abfrage mit allen Filtern
      const query = `
        query getProducts(
          $numProducts: Int!
        ) {
          products(
            first: $numProducts
            sortKey: ${sortKey}
            reverse: ${reverse}
            ${afterCursor}
            ${tagsFilter}
            ${productTypeFilter}
          ) {
            pageInfo {
              hasNextPage
              endCursor
            }
            edges {
              node {
                id
                title
                description
                handle
                productType
                tags
                createdAt
                collections(first: 5) {
                  edges {
                    node {
                      id
                      title
                      handle
                    }
                  }
                }
                featuredImage {
                  url
                  altText
                }
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                  maxVariantPrice {
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
                      price {
                      amount
                      currencyCode
                    }
                      compareAtPrice {
                      amount
                      currencyCode
                    }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      `;

      // Suchquery erstellen
      let searchQuery = query ? `title:*${query}*` : "";

      // Preisfilter hinzufügen
      if (minPrice > 0 || maxPrice < 1000000) {
        const priceQuery = `variants.price:>=${minPrice} variants.price:<=${maxPrice}`;
        searchQuery = searchQuery
          ? `${searchQuery} AND ${priceQuery}`
          : priceQuery;
      }

      // API-Anfrage senden
      const response = await this.shopifyFetch(query, {
        query: searchQuery,
        numProducts: limit,
      });

      console.log("Shopify response:", response);

      if (!response?.data?.products?.edges) {
        return [];
      }

      // Pagination-Informationen extrahieren (currently unused)
      // const pageInfo = response.data.products.pageInfo;

      // Produktdaten transformieren
      const products = response.data.products.edges.map(({ node }: any) => {
        const firstVariant = node.variants.edges[0]?.node;

        const product: ShopifyProduct = {
          id: node.id,
          title: node.title,
          description: node.description,
          handle: node.handle,
          featured_image: node.featuredImage?.url,
          price: parseFloat(firstVariant?.price.amount || 0),
          compare_at_price: parseFloat(firstVariant?.compareAtPrice || 0),
          on_sale:
            firstVariant?.compareAtPrice &&
            parseFloat(firstVariant.compareAtPrice) >
              parseFloat(firstVariant.price),
          available: firstVariant?.availableForSale || false,
          variant_id: firstVariant?.id,
          collections: node.collections.edges.map(
            (edge: any) => edge.node.handle
          ),
        };

        // Produkt auch im Produkt-Cache speichern
        this.products.set(product.id, product);

        return product;
      });

      // Im Collection-Cache speichern
      this.collections.set(cacheKey, products);

      return products;
    },

    /*
    Add to cart 
     */

    /**
     * Den Cache für eine bestimmte Sammlung leeren
     */
    clearCollectionCache(collectionHandle: string) {
      this.collections.delete(collectionHandle);
    },

    /**
     * Den Cache für ein bestimmtes Produkt leeren
     */
    clearProductCache(productId: string) {
      this.products.delete(productId);
    },

    /**
     * Den gesamten Cache leeren
     */
    clearCache() {
      this.products.clear();
      this.collections.clear();
    },
  },
});
