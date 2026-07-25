import { createSlice, type PayloadAction, type Action } from '@reduxjs/toolkit';
import { Business, PaginatedResponse } from '@/types';

const matchesType =
  <P>(type: string) =>
  (action: Action): action is PayloadAction<P> =>
    action.type === type;

interface BusinessesState {
  businesses: Business[];
  featuredBusinesses: Business[];
  newestBusinesses: Business[];
  currentBusiness: Business | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  } | null;
}

const initialState: BusinessesState = {
  businesses: [],
  featuredBusinesses: [],
  newestBusinesses: [],
  currentBusiness: null,
  isLoading: false,
  error: null,
  pagination: null,
};

const businessesSlice = createSlice({
  name: 'businesses',
  initialState,
  reducers: {
    setBusinesses: (state, action: PayloadAction<Business[]>) => {
      state.businesses = action.payload;
    },
    setFeaturedBusinesses: (state, action: PayloadAction<Business[]>) => {
      state.featuredBusinesses = action.payload;
    },
    setNewestBusinesses: (state, action: PayloadAction<Business[]>) => {
      state.newestBusinesses = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPaginatedBusinesses: (state, action: PayloadAction<PaginatedResponse<Business>>) => {
      state.businesses = action.payload.items;
      state.pagination = {
        page: action.payload.page,
        pageSize: action.payload.pageSize,
        total: action.payload.total,
      };
    },
    setCurrentBusiness: (state, action: PayloadAction<Business | null>) => {
      state.currentBusiness = action.payload;
    },
    addBusiness: (state, action: PayloadAction<Business>) => {
      state.businesses.push(action.payload);
    },
    updateBusiness: (state, action: PayloadAction<{ id: string; updates: Partial<Business> }>) => {
      const index = state.businesses.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) {
        state.businesses[index] = { ...state.businesses[index], ...action.payload.updates };
      }
      if (state.currentBusiness?.id === action.payload.id) {
        state.currentBusiness = { ...state.currentBusiness, ...action.payload.updates };
      }
    },
    deleteBusiness: (state, action: PayloadAction<string>) => {
      state.businesses = state.businesses.filter((b) => b.id !== action.payload);
      if (state.currentBusiness?.id === action.payload) {
        state.currentBusiness = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(matchesType('businesses/getBusinessesByCategory/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(matchesType('businesses/getBusinessesByCategory/fulfilled'), (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(
        matchesType<string>('businesses/getBusinessesByCategory/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to load businesses by category';
        },
      );
  },
});

export const {
  setBusinesses,
  setFeaturedBusinesses,
  setNewestBusinesses,
  setPaginatedBusinesses,
  setCurrentBusiness,
  addBusiness,
  updateBusiness,
  deleteBusiness,
  setLoading,
  setError,
} = businessesSlice.actions;
export default businessesSlice.reducer;
