import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LoyaltyCard } from '@/types';

interface LoyaltyCardsState {
  cards: LoyaltyCard[];
  currentCard: LoyaltyCard | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: LoyaltyCardsState = {
  cards: [],
  currentCard: null,
  isLoading: false,
  error: null,
};

const loyaltyCardsSlice = createSlice({
  name: 'loyaltyCards',
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<LoyaltyCard[]>) => {
      state.cards = action.payload;
    },
    setCurrentCard: (state, action: PayloadAction<LoyaltyCard | null>) => {
      state.currentCard = action.payload;
    },
    addCard: (state, action: PayloadAction<LoyaltyCard>) => {
      state.cards.push(action.payload);
    },
    updateCard: (state, action: PayloadAction<{ id: string; updates: Partial<LoyaltyCard> }>) => {
      const index = state.cards.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = { ...state.cards[index], ...action.payload.updates };
      }
      if (state.currentCard?.id === action.payload.id) {
        state.currentCard = { ...state.currentCard, ...action.payload.updates };
      }
    },
    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
      if (state.currentCard?.id === action.payload) {
        state.currentCard = null;
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
});

export const {
  setCards,
  setCurrentCard,
  addCard,
  updateCard,
  deleteCard,
  setLoading,
  setError,
} = loyaltyCardsSlice.actions;
export default loyaltyCardsSlice.reducer;
