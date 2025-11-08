# planYedu Architecture

## Project Structure

```
├── app/                    # Expo Router screens
│   └── (tabs)/            # Tab navigation screens
│       ├── index.tsx      # Main overview screen
│       ├── budget.tsx      # Budget management screen
│       ├── ai.tsx          # AI assistant screen
│       └── shared.tsx      # Shared/collaboration screen
├── components/            # Reusable components
│   ├── common/           # Common UI components
│   ├── events/            # Event-related components
│   │   ├── EventSelector.tsx
│   │   ├── EventSheet.tsx
│   │   └── CreateEventSheet.tsx
│   └── tasks/             # Task-related components
│       ├── TaskCard.tsx
│       ├── TaskList.tsx
│       └── AddTaskSheet.tsx
├── contexts/              # React Context providers
│   └── PlannerContext.tsx # Main app state management
├── hooks/                 # Custom React hooks
│   ├── useTasks.ts        # Task-related logic
│   └── useBudget.ts       # Budget-related logic
├── constants/             # App constants
│   ├── colors.ts          # Color scheme
│   ├── eventTypes.ts      # Event type definitions
│   └── smartTasks.ts      # Smart task templates
├── lib/                   # Utility libraries
│   ├── exportBudget.ts    # Excel export functionality
│   └── rork-toolkit.tsx   # AI toolkit integration
└── types/                 # TypeScript type definitions
    └── index.ts
```

## Key Features

### 1. Event Management
- Create multiple events (Wedding, Birthday, Corporate, etc.)
- Select active event to filter tasks and budget
- Event-specific smart task templates

### 2. Task Management
- Create, edit, and delete tasks
- Task status tracking (todo, in_progress, completed)
- Priority levels (low, medium, high)
- Price tracking for budget integration
- Duplicate detection
- Smart task templates based on event type

### 3. Budget Management
- Automatic budget sync from tasks
- Budget categories with allocations
- Expense tracking
- Excel export functionality
- Budget overview with progress indicators

### 4. Project Organization
- Tasks organized by projects
- Projects linked to events
- Visual project indicators

## Architecture Patterns

### Component Structure
- **Separation of Concerns**: UI components separated from business logic
- **Reusability**: Components are modular and reusable
- **Type Safety**: Full TypeScript support

### State Management
- **Context API**: Centralized state via PlannerContext
- **Custom Hooks**: Business logic extracted to hooks (useTasks, useBudget)
- **Local State**: Component-specific state managed locally

### Data Flow
1. User interactions trigger actions
2. Actions update context state
3. Context state persists to AsyncStorage
4. Components re-render with updated state

### Performance Optimizations
- **Memoization**: useMemo for expensive calculations
- **Lazy Loading**: Components loaded on demand
- **Efficient Filtering**: Optimized data filtering in hooks

## Best Practices

1. **Type Safety**: All components and functions are fully typed
2. **Error Handling**: Try-catch blocks and user-friendly error messages
3. **User Feedback**: Haptic feedback and visual indicators
4. **Accessibility**: Proper labels and semantic HTML
5. **Code Organization**: Clear folder structure and naming conventions

## Future Improvements

- [ ] Add data validation schemas (Zod)
- [ ] Implement error boundaries
- [ ] Add loading states for async operations
- [ ] Improve offline support
- [ ] Add data backup/restore functionality
- [ ] Implement search and filtering
- [ ] Add task due date reminders
- [ ] Improve AI assistant capabilities

