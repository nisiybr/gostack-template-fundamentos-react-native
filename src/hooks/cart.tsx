import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE - OK
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }
    loadProducts();
  }, []);
  useEffect(() => {
    async function setAsyncStorage(): Promise<void> {
      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    }
    setAsyncStorage();
  }, [products]);

  const increment = useCallback(
    async id => {
      const incrementIndex = products.findIndex(product => product.id === id);

      const { quantity, ...rest } = products[incrementIndex];

      const productIncremented: Product = {
        ...rest,
        quantity: quantity + 1,
      };
      const newProducts = products;
      newProducts.splice(incrementIndex, 1, productIncremented);
      setProducts([...newProducts]);
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART - OK

      const { id } = product;
      const quantity = 1;

      const productIndex = products.findIndex(
        (item: Product) => item.id === id,
      );
      if (productIndex === -1) {
        const newProducts = [
          ...products,
          {
            ...product,
            quantity,
          },
        ];
        setProducts([...newProducts]);
      } else {
        increment(id);
      }
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART

      const [productSelected] = products.filter(product => product.id === id);
      const { quantity } = productSelected;

      if (quantity - 1 >= 0) {
        const decrementIndex = products.findIndex(product => product.id === id);

        const { quantity, ...rest } = products[decrementIndex];

        const productDecremented: Product = {
          ...rest,
          quantity: quantity - 1,
        };
        const newProducts = products;
        newProducts.splice(decrementIndex, 1, productDecremented);
        setProducts([...newProducts]);
      }
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
