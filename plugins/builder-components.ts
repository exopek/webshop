import ProductGrid from '~/components/product/ProductGrid.vue'
import Cart from '~/components/global/Cart.vue'
import CustomCart from '~/components/global/CustomCart.vue'
import ProductSlider from '~/components/product/ProductSlider.vue'
import ProductCard2 from '~/components/product/ProductCard2.vue';

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
        component: ProductCard2,
        name: 'ProductCard2',
        inputs: [
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