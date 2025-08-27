# Environment Inheritance Feature Implementation

This document outlines the implementation of environment inheritance in Bruno, allowing environments to inherit variables from parent environments in a hierarchical tree structure, similar to how Collection > Folder > Subfolder > Request works in Bruno's collections.

## Overview

The environment inheritance feature allows you to:
- Create environments that inherit variables from parent environments
- Visualize environments in a tree structure with proper indentation and expand/collapse functionality
- Override parent variables in child environments
- Manage inheritance relationships through a dedicated UI
- Prevent circular dependencies
- Display inheritance chains and variable resolution

## Key Features Implemented

### 🌳 Tree Structure UX (Like Collection Folders)

#### Visual Hierarchy
- **Indented Layout**: Child environments are visually indented under their parents
- **Expand/Collapse**: Parent environments can be expanded/collapsed to show/hide children
- **Tree Icons**: Chevron icons (▶ ▼) indicate expandable environments
- **Inheritance Indicators**: Special visual cues show which environments inherit from others

#### Navigation Experience
- **Auto-Expansion**: Parent environments automatically expand when containing the selected environment
- **Visual Nesting**: Clear visual hierarchy with proper indentation levels
- **Hierarchical Dropdowns**: Parent selection dropdowns show the tree structure with indentation

### 📊 Enhanced Variable Display

#### Inheritance Chain Visualization
- **Chain Display**: Shows the complete inheritance path (Base → Dev → Staging)
- **Badge Layout**: Each environment in the chain is shown as a styled badge
- **Clear Flow**: Visual arrows (→) show the inheritance direction

#### Variable Resolution
- **Inherited Variables Section**: Read-only table showing variables from parent environments
- **Source Attribution**: Each inherited variable shows which environment it comes from
- **Override Highlighting**: Local variables that override inherited ones are clearly distinguished
- **Visual Separation**: Inherited and local variables are shown in separate, styled sections

## Technical Implementation

### 1. Tree Structure Utilities

**File**: `packages/bruno-app/src/utils/environments.js`

New functions added:
- `buildEnvironmentTree()`: Constructs hierarchical tree from flat environment list
- `flattenEnvironmentTree()`: Flattens tree back to list with level information
- Enhanced existing utilities for inheritance chain management

### 2. Enhanced UI Components

#### EnvironmentList Component (Tree View)
**File**: `packages/bruno-app/src/components/Environments/EnvironmentSettings/EnvironmentList/index.js`

**Features**:
- Tree structure rendering with proper indentation
- Expand/collapse functionality with state management  
- Auto-expansion of parent environments containing selected item
- Chevron icons for expandable items
- Inheritance indicators (↳) for child environments

#### Enhanced Variable Display
**File**: `packages/bruno-app/src/components/Environments/EnvironmentSettings/EnvironmentList/EnvironmentDetails/EnvironmentVariables/index.js`

**Features**:
- Inheritance chain visualization with styled badges
- Separate tables for inherited vs local variables
- Color-coded source attribution for inherited variables
- Enhanced styling with borders and background colors
- Read-only display for inherited variables

#### Improved Dropdowns
**Files**: 
- `CreateEnvironment/index.js`
- `EditInheritance/index.js`

**Features**:
- Hierarchical dropdown options with indentation
- Tree structure preserved in selection UI
- Visual nesting using spaces for indentation levels

### 3. Styling Enhancements

**File**: `packages/bruno-app/src/components/Environments/EnvironmentSettings/EnvironmentList/StyledWrapper.js`

**Features**:
- Expand/collapse icon styling with hover effects
- Inheritance indicator styling
- Tree indentation support
- Visual hierarchy preservation

## User Experience Flow

### 1. Environment Tree Navigation
```
Base Environment                    [▼] (expanded)
  ├── Development Environment       [▶] (collapsed) ↳
  └── Staging Environment          [▼] (expanded) ↳
      └── Staging-US Environment   [ ] (no children) ↳
Production Environment             [ ] (no children)
```

### 2. Creating Child Environments
When creating a new environment:
- Dropdown shows hierarchical structure:
  ```
  None (No inheritance)
  Base Environment
    Development Environment  
      Staging Environment
        Staging-US Environment
  Production Environment
  ```

### 3. Variable Inheritance Display
```
┌─ Inheritance Chain ─────────────────┐
│ [Base] → [Development] → [Staging]   │
└─────────────────────────────────────┘

🔗 Inherited Variables (Read-only)
┌──────────────────────────────────────┐
│ API_HOST    | api.example.com  | Base │
│ TIMEOUT     | 5000            | Base │
│ DEBUG_MODE  | true       | Development │
└──────────────────────────────────────┘

Local Variables
┌──────────────────────────────────────┐
│ API_HOST    | staging-api.example.com │ (overrides parent)
│ LOG_LEVEL   | info                    │ (new variable)
└──────────────────────────────────────┘
```

## Benefits of Tree Structure UX

1. **Familiar Navigation**: Mirrors the collection folder structure users already know
2. **Clear Hierarchy**: Visual indentation makes relationships immediately obvious
3. **Efficient Management**: Expand/collapse reduces clutter for large environment sets
4. **Intuitive Creation**: Hierarchical dropdowns make parent selection natural
5. **Visual Context**: Users can see the complete inheritance structure at a glance

## File Format Support

The .bru environment files support the inheritance directive:

```
inherit: parent-environment-uid

vars {
  LOCAL_VAR: local_value
  OVERRIDE_VAR: child_override_value
}

vars:secret [
  SECRET_LOCAL_VAR
]
```

## Advanced Features

### Auto-Expansion Logic
- Parent environments containing the selected environment auto-expand
- Environments with children are expanded by default
- User expansion preferences are maintained during session

### Circular Dependency Prevention
- Real-time validation during parent selection
- Visual feedback for invalid selections
- Safe tree traversal algorithms

### Variable Resolution Priority
1. Local environment variables (highest priority)
2. Immediate parent variables
3. Grandparent variables
4. Root parent variables (lowest priority)

## Example Usage Scenarios

### Scenario 1: Multi-Stage Deployment
```
Base Configuration
├── Development
│   ├── Dev-Feature-Branch
│   └── Dev-Integration
├── Staging
│   ├── Staging-US
│   ├── Staging-EU
│   └── Staging-Asia
└── Production
    ├── Prod-Primary
    └── Prod-Backup
```

### Scenario 2: Multi-Tenant Environment
```
Common Settings
├── Tenant-A
│   ├── Tenant-A-Dev
│   ├── Tenant-A-Staging
│   └── Tenant-A-Prod
└── Tenant-B
    ├── Tenant-B-Dev
    ├── Tenant-B-Staging
    └── Tenant-B-Prod
```

This implementation provides a powerful, intuitive environment management system that scales well with complex inheritance hierarchies while maintaining the familiar Bruno UX patterns.
