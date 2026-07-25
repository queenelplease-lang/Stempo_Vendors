# Stempo Architecture

## Overview

Stempo follows a modular, layered architecture with clear separation of concerns. The codebase is organized into distinct layers: types, API, state management, utilities, and UI.

## Project Structure

```
stempo/
├── app/                    # Expo Router screens (file-based routing)
├── components/             # Reusable UI components
├── constants/              # App constants and configuration
├── hooks/                  # Custom React hooks
├── lib/                    # Core business logic
│   ├── api/               # API client and error handling
│   ├── store/             # State management (Zustand)
│   └── utils/             # Utility functions
└── types/                  # TypeScript type definitions
```

## Layers

### Types (`/types`)
- Domain models and shared types
- API response types
- Base entities with common fields (id, timestamps)

### API Layer (`/lib/api`)
- **client.ts**: Centralized HTTP client with authentication
- **errors.ts**: Error handling and custom exceptions
- Consistent error format across all API calls

### State Management (`/lib/store`)
- Zustand stores for global state
- Persisted state using AsyncStorage
- Modular stores per domain

### Utilities (`/lib/utils`)
- Error handling utilities
- Validation helpers
- Shared business logic

### Constants (`/constants`)
- App configuration
- Theme definitions
- Storage keys

## Conventions

### Naming
- **Files**: kebab-case (e.g., `api-client.ts`)
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions/Variables**: camelCase (e.g., `getUserData`)
- **Types/Interfaces**: PascalCase (e.g., `ApiResponse`)

### API Responses
All API responses follow the `ApiResponse<T>` format:
```typescript
{
  data?: T;
  error?: ApiError;
}
```

### Error Handling
- Use `ApiException` for API errors
- Use `getErrorMessage()` and `getErrorCode()` utilities
- Always handle errors at the UI layer

### State Management
- One store per domain (e.g., `useAppStore`, `useAuthStore`)
- Use Zustand's persist middleware for persistence
- Keep stores focused and small

## MVP Principles

1. **Start Simple**: Build the smallest working version first
2. **Iterate**: Add features incrementally
3. **Consistency**: Maintain naming and patterns across layers
4. **Pragmatic**: Choose simple solutions over complex architecture

## Next Steps

As features are added:
1. Define domain types in `/types`
2. Create API methods in `/lib/api`
3. Add state management in `/lib/store`
4. Build UI components in `/components` and `/app`

