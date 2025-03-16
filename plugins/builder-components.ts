import ProductGrid from '~/components/product/ProductGrid.vue'

export const registeredComponents = [
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