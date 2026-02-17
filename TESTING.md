# Frontend Testing Guide

## Overview

This document describes the comprehensive testing suite for the RJM Frontend application. All tests follow the M5 testing requirements and ensure complete coverage of user flows and components.

## Test Structure

```
src/
├── __tests__/
│   ├── __mocks__/          # Mock implementations
│   │   ├── api.ts          # API mocks
│   │   └── context.tsx     # Context mocks
│   ├── utils/              # Test utilities
│   │   └── test-utils.tsx  # Custom render and helpers
│   └── integration/        # Integration tests
│       ├── auth-flow.test.tsx
│       ├── persona-generation-flow.test.tsx
│       ├── m4-strategy-flow.test.tsx
│       ├── document-upload-flow.test.tsx
│       ├── organization-flow.test.tsx
│       └── governance-flow.test.tsx
├── components/
│   ├── ui/__tests__/        # UI component tests
│   ├── auth/__tests__/      # Auth component tests
│   └── generator/__tests__/  # Generator component tests
└── hooks/__tests__/         # Hook tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests in CI mode
npm run test:ci
```

## Test Coverage

### Unit Tests

#### UI Components
- ✅ Button component (variants, sizes, states)
- ✅ Input component (validation, error states)
- ✅ Card, Badge, and other UI primitives

#### Auth Components
- ✅ LoginForm (validation, submission, error handling)
- ✅ RegisterForm (password validation, field requirements)

#### Generator Components
- ✅ GeneratorForm (form validation, API calls, RJM Voice)
- ✅ ProgramResult (section display, M4 strategies)

#### Hooks
- ✅ useApiQuery (data fetching, error handling, refetching)
- ✅ useApiMutation (mutations, callbacks, error handling)

### Integration Tests

#### 1. Authentication Flow ✅
- User registration with validation
- User login with credentials
- Password visibility toggle
- Error message display
- Redirect to dashboard on success

#### 2. Persona Generation Flow ✅
- Form submission with brand and brief
- Loading states with RJM Voice
- Program result display
- Category detection (Starbucks → Culinary & Dining)
- Error handling

#### 3. M4 Local/Multicultural Strategy Flow ✅
- Local strategy display for local campaigns
- Multicultural strategy display for MC campaigns
- Both strategies for combined campaigns
- Strategy sections hidden for national campaigns
- Insights and recommendations display

#### 4. Document Upload Flow ✅
- File selection and validation
- File type validation (PDF, DOCX, TXT, MD)
- File size validation (25MB limit)
- Upload progress and status tracking
- Processing state display
- Success message with RJM Voice

#### 5. Organization Management Flow ✅
- Organization listing
- Organization creation
- Member invitation
- Role updates
- Member removal

#### 6. Governance/Operationalization Flow ✅
- Program registration for governance
- State transitions (Draft → Approved → Live)
- Approval workflows
- Dashboard statistics
- Invalid transition prevention

## Testing Best Practices

### RJM Voice Testing
All tests verify that RJM Voice is used consistently:
- "Build Program" not "Generate Program"
- "Your persona program is ready" not "Program generated"
- "Please sign in to continue" not "Unauthorized"

### User Flow Testing
Each integration test follows the complete user journey:
1. User sees the initial state
2. User performs actions
3. System responds appropriately
4. User sees expected outcome

### Error Handling
All tests verify:
- User-friendly error messages
- Proper error display
- No technical jargon exposed

## Mock Data

Mock data is provided in `src/__tests__/__mocks__/`:
- API responses
- User context
- Theme context

## Continuous Integration

Tests are configured to run in CI with:
- Coverage reporting
- Parallel execution
- Fail-fast on errors

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Test Maintenance

When adding new features:
1. Write unit tests for new components
2. Write integration tests for new flows
3. Update mocks if API changes
4. Ensure RJM Voice is tested
5. Update this document

## Troubleshooting

### Tests failing with module resolution
- Check `jest.config.js` path mappings
- Verify `tsconfig.json` paths match

### Mock not working
- Ensure mocks are in `__mocks__` directory
- Check mock is imported before component

### Async test issues
- Use `waitFor` for async operations
- Increase timeout if needed
- Check for proper cleanup
