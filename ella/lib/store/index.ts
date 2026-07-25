import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';
import authReducer, { setTokens } from './slices/authSlice';
import businessesReducer from './slices/businessesSlice';
import bonusProgramsReducer from './slices/bonusProgramsSlice';
import loyaltyCardsReducer from './slices/loyaltyCardsSlice';
import categoriesReducer from './slices/categoriesSlice';
import appReducer from './slices/appSlice';
import employeesReducer from './slices/employeesSlice';
import { authMiddleware } from './middleware/authMiddleware';
import { apiClient } from '@/lib/api/client';
import { logout as logoutThunk } from '@/lib/api/services/authService';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth', 'app'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  businesses: businessesReducer,
  bonusPrograms: bonusProgramsReducer,
  loyaltyCards: loyaltyCardsReducer,
  categories: categoriesReducer,
  app: appReducer,
  employees: employeesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(authMiddleware),
});

// Wire up 401 handler: try refresh, or logout on invalid token
apiClient.setAuthProvider({
  getRefreshToken: () => store.getState().auth.refreshToken,
  setToken: (token) => store.dispatch(setTokens({ token })),
  onLogout: () => store.dispatch(logoutThunk()),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
