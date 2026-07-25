import { createSlice, type PayloadAction, type Action } from '@reduxjs/toolkit';
import { BonusProgram } from '@/types';

const matchesType =
  <P>(type: string) =>
  (action: Action): action is PayloadAction<P> =>
    action.type === type;

interface BonusProgramsState {
  programs: BonusProgram[];
  myBusinessPrograms: BonusProgram[];
  currentProgram: BonusProgram | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BonusProgramsState = {
  programs: [],
  myBusinessPrograms: [],
  currentProgram: null,
  isLoading: false,
  error: null,
};

// Helper function to normalize ID for comparison
const normalizeId = (id: string | number): string => String(id);

const bonusProgramsSlice = createSlice({
  name: 'bonusPrograms',
  initialState,
  reducers: {
    setPrograms: (state, action: PayloadAction<BonusProgram[]>) => {
      state.programs = action.payload;
    },
    setMyBusinessPrograms: (state, action: PayloadAction<BonusProgram[]>) => {
      state.myBusinessPrograms = action.payload;
    },
    setCurrentProgram: (state, action: PayloadAction<BonusProgram | null>) => {
      state.currentProgram = action.payload;
    },
    addMyBusinessProgram: (state, action: PayloadAction<BonusProgram>) => {
      const programId = normalizeId(action.payload.id);
      const exists = state.myBusinessPrograms.some((p) => normalizeId(p.id) === programId);
      if (!exists) {
        state.myBusinessPrograms.push(action.payload);
      }
    },
    updateProgram: (state, action: PayloadAction<{ id: string | number; updates: Partial<BonusProgram> }>) => {
      const targetId = normalizeId(action.payload.id);
      
      // Update in programs array
      const index = state.programs.findIndex((p) => normalizeId(p.id) === targetId);
      if (index !== -1) {
        state.programs[index] = { ...state.programs[index], ...action.payload.updates };
      }
      
      // Update in myBusinessPrograms array
      const myIndex = state.myBusinessPrograms.findIndex((p) => normalizeId(p.id) === targetId);
      if (myIndex !== -1) {
        state.myBusinessPrograms[myIndex] = { ...state.myBusinessPrograms[myIndex], ...action.payload.updates };
      }
      
      // Update current program if it matches
      if (state.currentProgram && normalizeId(state.currentProgram.id) === targetId) {
        state.currentProgram = { ...state.currentProgram, ...action.payload.updates };
      }
    },
    deleteProgram: (state, action: PayloadAction<string | number>) => {
      const targetId = normalizeId(action.payload);
      state.programs = state.programs.filter((p) => normalizeId(p.id) !== targetId);
      state.myBusinessPrograms = state.myBusinessPrograms.filter((p) => normalizeId(p.id) !== targetId);
      if (state.currentProgram && normalizeId(state.currentProgram.id) === targetId) {
        state.currentProgram = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      if (action.payload) {
        state.isLoading = false;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(matchesType('bonusPrograms/getBonusPrograms/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        matchesType<BonusProgram[]>('bonusPrograms/getBonusPrograms/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.error = null;
          state.programs = Array.isArray(action.payload) ? action.payload : [];
        },
      )
      .addMatcher(
        matchesType<string>('bonusPrograms/getBonusPrograms/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to load programs';
        },
      )
      .addMatcher(matchesType('bonusPrograms/getMyBusinessPrograms/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        matchesType<BonusProgram[]>('bonusPrograms/getMyBusinessPrograms/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.error = null;
          state.myBusinessPrograms = Array.isArray(action.payload) ? action.payload : [];
        },
      )
      .addMatcher(
        matchesType<string>('bonusPrograms/getMyBusinessPrograms/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to load programs';
        },
      )
      .addMatcher(matchesType('bonusPrograms/createBonusProgram/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        matchesType<BonusProgram>('bonusPrograms/createBonusProgram/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.error = null;
          const programId = normalizeId(action.payload.id);
          const exists = state.myBusinessPrograms.some((p) => normalizeId(p.id) === programId);
          if (!exists) {
            state.myBusinessPrograms.push(action.payload);
          }
        },
      )
      .addMatcher(
        matchesType<string>('bonusPrograms/createBonusProgram/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to create program';
        },
      )
      .addMatcher(matchesType('bonusPrograms/updateBonusProgram/fulfilled'), (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(matchesType('bonusPrograms/deleteBonusProgram/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(matchesType('bonusPrograms/deleteBonusProgram/fulfilled'), (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addMatcher(
        matchesType<string>('bonusPrograms/deleteBonusProgram/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload || 'Failed to delete program';
        },
      );
  },
});

export const {
  setPrograms,
  setMyBusinessPrograms,
  setCurrentProgram,
  addMyBusinessProgram,
  updateProgram,
  deleteProgram,
  setLoading,
  setError,
  clearError,
} = bonusProgramsSlice.actions;

export default bonusProgramsSlice.reducer;
