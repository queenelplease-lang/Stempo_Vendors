import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Business } from '@/types';

interface AppState {
  isInitialized: boolean;
  isBusinessOwner: boolean;
  myBusiness: Business | null;
}

const initialState: AppState = {
  isInitialized: false,
  isBusinessOwner: false,
  myBusiness: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setIsBusinessOwner: (state, action: PayloadAction<boolean>) => {
      state.isBusinessOwner = action.payload;
    },
    setMyBusiness: (state, action: PayloadAction<Business | null>) => {
      state.myBusiness = action.payload;
      state.isBusinessOwner = action.payload !== null;
    },
    updateMyBusiness: (state, action: PayloadAction<Partial<Business>>) => {
      if (state.myBusiness) {
        state.myBusiness = { ...state.myBusiness, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // getMyBusiness thunk is handled dynamically to avoid circular dependency
    builder.addMatcher(
      (action) => action.type === 'businesses/getMyBusiness/fulfilled',
      (state, action: PayloadAction<Business | null>) => {
        state.myBusiness = action.payload;
        state.isBusinessOwner = action.payload !== null;
      }
    );
  },
});

export const { setInitialized, setIsBusinessOwner, setMyBusiness, updateMyBusiness } = appSlice.actions;
export default appSlice.reducer;
