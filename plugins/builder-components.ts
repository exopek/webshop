import ProductGrid from '~/components/product/ProductGrid.vue'
import Cart from '~/components/global/Cart.vue'
import CustomCart from '~/components/global/CustomCart.vue'
import ProductSlider from '~/components/product/ProductSlider.vue'
import ProductCard2 from '~/components/product/ProductCard2.vue';
import ImageSlider from '~/components/global/ImageSlider.vue'
import ProductDetailsLayout from '~/components/productDetails/ProductDetailsLayout.vue'
import Header from '~/components/global/Header.vue'

type ComponentInput = {
    name: string;
    type: string;
    defaultValue?: any;
};

type RegisteredComponent = {
    component: any;
    name: string;
    inputs: ComponentInput[];
};

export const registeredComponents: RegisteredComponent[] = [
    {
        component: ProductGrid,
        name: 'ProductGrid',
        inputs: [
        {
            name: 'collection',
            type: 'string',
            defaultValue: 'featured'
        },
        {
            name: 'productsPerRow',
            type: 'number',
            defaultValue: 4
        },
        {
            name: 'maxProducts',
            type: 'number',
            defaultValue: 8
        },
        {
            name: 'price',
            type: 'number',
            defaultValue: 0
        }
    ]
    },
    {
        component: Cart,
        name: 'Cart',
        inputs: []
    },
    {
        component: CustomCart,
        name: 'CustomCart',
        inputs: []
    },
    {
        component: ProductSlider,
        name: 'ProductSlider',
        inputs: [
            {
                name: 'collection',
                type: 'string',
                defaultValue: 'featured'
            },
            {
                name: 'productsPerRow',
                type: 'number',
                defaultValue: 4
            },
            {
                name: 'maxProducts',
                type: 'number',
                defaultValue: 8
            },
            {
                name: 'price',
                type: 'number',
                defaultValue: 0
            }
        ]
    },
    {
        component: ImageSlider,
        name: 'ImageSlider',
        inputs: [
            {
                name: 'images',
                type: 'Array',
                defaultValue: []
            }
        ]
    },
    {
        component: ProductCard2,
        name: 'ProductCard2',
        inputs: [
        ]
    },
    {
        component: ProductDetailsLayout,
        name: 'ProductDetailsLayout',
        inputs: [
            {
                name: 'product',
                type: 'object',
                defaultValue: null
            },
            {
                name: 'selectedOptions',
                type: 'object',
                defaultValue: {}
            },
            {
                name: 'selectedVariant',
                type: 'object',
                defaultValue: null
            },
            {
                name: 'quantity',
                type: 'number',
                defaultValue: 1
            },
            {
                name: 'isLoading',
                type: 'boolean',
                defaultValue: false
            }
        ]
    },
    {
        component: Header,
        name: 'Header',
        inputs: [
            {
                name: 'logo',
                type: 'string',
                defaultValue: ''
            },
            {
                name: 'siteName',
                type: 'string',
                defaultValue: 'My Store'
            },
            {
                name: 'showSearch',
                type: 'boolean',
                defaultValue: true
            },
            {
                name: 'showAccount',
                type: 'boolean',
                defaultValue: true
            },
            {
                name: 'showCart',
                type: 'boolean',
                defaultValue: true
            },
            {
                name: 'cartCount',
                type: 'number',
                defaultValue: 0
            },
            {
                name: 'backgroundColor',
                type: 'string',
                defaultValue: '#ffffff'
            },
            {
                name: 'textColor',
                type: 'string',
                defaultValue: '#1f2937'
            },
            {
                name: 'accentColor',
                type: 'string',
                defaultValue: '#3b82f6'
            }
        ]
    }
]

export default defineNuxtPlugin(() => {
    return {
        provide: {
          // Sie können hier Werte bereitstellen, falls nötig
          builderComponents: registeredComponents
        }
      }
})