"use client"
// store/productStore.ts
import { create } from 'zustand';
import { ProductData } from '../types/product';

interface ProductStore {
    products: ProductData[];
    currentProduct: ProductData | null;
    addProduct: (productData: ProductData) => void;
    updateOperator: (productId: string, operatorName: string) => void;
    setCurrentProduct: (productData: ProductData | null) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
    products: [],
    currentProduct: null,

    addProduct: (productData: ProductData) =>
        set((state) => {
            // Añadir el producto al principio del arreglo
            const newProducts = [productData, ...state.products];

            // También establecer como el producto actual
            return {
                products: newProducts,
                currentProduct: productData
            };
        }),

    updateOperator: (productId: string, operatorName: string) =>
        set((state) => {
            const updatedProducts = state.products.map((item) => {
                if (item.product.id === productId) {
                    return {
                        ...item,
                        product: {
                            ...item.product,
                            operator: operatorName,
                            status: 'success' as const
                        }
                    };
                }
                return item;
            });

            // También actualizar el producto actual si coincide
            let updatedCurrentProduct = state.currentProduct;
            if (state.currentProduct?.product.id === productId) {
                updatedCurrentProduct = {
                    ...state.currentProduct,
                    product: {
                        ...state.currentProduct.product,
                        operator: operatorName,
                        status: 'success' as const
                    }
                };
            }

            return {
                products: updatedProducts,
                currentProduct: updatedCurrentProduct
            };
        }),

    setCurrentProduct: (productData) =>
        set(() => ({
            currentProduct: productData
        }))

}));