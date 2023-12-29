import { Cart, CartData, CartResponse, CartUpdateItemResponse, MutationCartAddItemArgs, MutationCartUpdateItemArgs } from '~/graphql';
import { MutationName } from '~/server/mutations';
import { QueryName } from '~/server/queries';
import { useToast } from 'vue-toastification';

export const useCart = () => {
  const { $sdk } = useNuxtApp();
  const cartCounter = useCookie<number>('cart-counter');
  const toast = useToast();
  const cart = useState<Cart>('cart', () => ({} as Cart));

  const loading = ref(false);

  const loadCart = async () => {
    loading.value = true;
    const { data } = await $sdk().odoo.query<null, CartResponse >({queryName: QueryName.LoadCart});
    loading.value = false;

    cart.value = data.value.cart;
    cartCounter.value = Number(data.value.cart.order?.orderLines?.length);
  };

  const cartAdd = async (productId: number, quantity: number) => {
    loading.value = true;

    const { data, error } = await $sdk().odoo.mutation<MutationCartAddItemArgs, CartResponse >({ mutationName: MutationName.CartAddItem }, { productId, quantity });
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cart;
    cartCounter.value = (Number(cartCounter?.value) || 0) + 1;
    toast.success('Product has been added to cart');
  };

  const updateItemQuantity = async (lineId: number, quantity: number) => {
    loading.value = true;
    const { data, error } = await $sdk().odoo.mutation<MutationCartUpdateItemArgs, CartUpdateItemResponse >({ mutationName: MutationName.CartUpdateQuantity }, { lineId, quantity: Number(quantity) });
    loading.value = false;

    if (error.value) {
      return toast.error(error.value.data.message);
    }

    cart.value = data.value.cartUpdateItem;
    cartCounter.value = Number(data.value.cartUpdateItem.order?.orderLines?.length);
    toast.success('Product updated successfully');
  };

  return {
    loading,
    loadCart,
    cartAdd,
    updateItemQuantity,
    cart
  };
};
