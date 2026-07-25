import { createSlice, type Action, type PayloadAction } from '@reduxjs/toolkit';
import { Employee } from '@/lib/api/services/employeesService';

interface EmployeesState {
  items: Employee[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EmployeesState = {
  items: [],
  isLoading: false,
  error: null,
};

const matchesType =
  <P>(type: string) =>
  (action: Action): action is PayloadAction<P> =>
    action.type === type;

const matchesRemoveFulfilled = (
  action: Action,
): action is Action & { meta: { arg: { employeeId: string } } } =>
  action.type === 'employees/removeEmployee/fulfilled';

const employeesSlice = createSlice({
  name: 'employees',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(matchesType('employees/getEmployees/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        matchesType<Employee[]>('employees/getEmployees/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.items = action.payload;
        },
      )
      .addMatcher(
        matchesType<string>('employees/getEmployees/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      )
      .addMatcher(matchesType('employees/addEmployee/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        matchesType<Employee>('employees/addEmployee/fulfilled'),
        (state, action) => {
          state.isLoading = false;
          state.items.push(action.payload);
        },
      )
      .addMatcher(
        matchesType<string>('employees/addEmployee/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      )
      .addMatcher(matchesType('employees/removeEmployee/pending'), (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(matchesRemoveFulfilled, (state, action) => {
        state.isLoading = false;
        const employeeId = action.meta.arg.employeeId;
        state.items = state.items.filter((emp) => String(emp.id) !== employeeId);
      })
      .addMatcher(
        matchesType<string>('employees/removeEmployee/rejected'),
        (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
        },
      );
  },
});

export const { clearError } = employeesSlice.actions;
export default employeesSlice.reducer;
