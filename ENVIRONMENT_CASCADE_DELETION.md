# Environment Cascade Deletion

## Overview
When an environment with child environments is deleted, all descendant environments (children, grandchildren, etc.) are automatically deleted to maintain data consistency.

## Features
- **Cascade Deletion**: Deleting a parent environment automatically removes all its descendant environments
- **Warning UI**: The delete confirmation dialog shows a warning when child environments will be affected
- **Comprehensive List**: All environments that will be deleted are listed in the warning message
- **Enhanced Feedback**: Success message indicates how many child environments were deleted

## Implementation Details

### Core Functions
- `getAllDescendantEnvironments()`: Recursively finds all descendant environments
- `deleteEnvironment()`: Modified to delete parent and all descendants
- Enhanced `DeleteEnvironment` component with cascade warning UI

### User Experience
1. When clicking delete on an environment with children, a warning dialog appears
2. The dialog lists all child environments that will be deleted
3. User can proceed with full understanding of the consequences
4. Success message confirms deletion count

### Example Scenarios

#### Scenario 1: Environment with Children
```
Production (Parent)
├── Production-US (Child)
├── Production-EU (Child)
└── Production-ASIA (Child)
    └── Production-ASIA-Dev (Grandchild)
```

Deleting "Production" will remove all 4 environments.

#### Scenario 2: Environment without Children
```
Development (Standalone)
```

Deleting "Development" only removes that single environment.

## Technical Notes
- Only applies to collection-level environments (not global environments)
- Uses recursive deletion to handle deep inheritance hierarchies
- File system cleanup handled by existing IPC mechanisms
- Redux state automatically updated through existing event system
