import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setMyBusiness } from '@/lib/store/slices/appSlice';
import { getRestaurant } from '@/lib/api/services/restaurantService';
import { getMyBusinessPrograms } from '@/lib/api/services/bonusProgramsService';

/**
 * Loads the singleton restaurant and marks the current user as staff/owner
 * when their id matches restaurant.ownerId (needed for QR generation tab).
 */
export function useRestaurantRole() {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const myBusiness = useAppSelector((state) => state.app.myBusiness);
  const isBusinessOwner = useAppSelector((state) => state.app.isBusinessOwner);

  const syncRestaurantRole = useCallback(async () => {
    if (!currentUser?.id) {
      dispatch(setMyBusiness(null));
      return null;
    }

    try {
      const restaurant = await getRestaurant();
      const isOwner =
        restaurant.ownerId != null &&
        Number(restaurant.ownerId) === Number(currentUser.id);

      if (isOwner) {
        dispatch(setMyBusiness(restaurant));
        await dispatch(getMyBusinessPrograms(restaurant.id));
        return restaurant;
      }

      dispatch(setMyBusiness(null));
      return restaurant;
    } catch {
      dispatch(setMyBusiness(null));
      return null;
    }
  }, [currentUser?.id, dispatch]);

  return { myBusiness, isBusinessOwner, syncRestaurantRole };
}
