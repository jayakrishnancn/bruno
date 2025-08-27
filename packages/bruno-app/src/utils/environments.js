/**
 * Utility functions for environment management and inheritance
 */

/**
 * Resolves environment variables with inheritance
 * Variables in child environments override parent environment variables
 * @param {Object} environment - The environment object
 * @param {Array} allEnvironments - All environments in the collection
 * @returns {Array} Resolved variables array
 */
export const resolveEnvironmentVariables = (environment, allEnvironments) => {
  if (!environment) {
    return [];
  }

  const resolvedVariables = new Map();
  
  // Helper function to resolve variables recursively
  const resolveVariablesRecursive = (env, visited = new Set()) => {
    if (!env || visited.has(env.uid)) {
      // Prevent circular dependencies
      return;
    }
    
    visited.add(env.uid);
    
    // If this environment has a parent, resolve parent first
    if (env.parentEnvironmentUid) {
      const parentEnv = allEnvironments.find(e => e.uid === env.parentEnvironmentUid);
      if (parentEnv) {
        resolveVariablesRecursive(parentEnv, visited);
      }
    }
    
    // Add/override variables from current environment
    if (env.variables) {
      env.variables.forEach(variable => {
        resolvedVariables.set(variable.name, variable);
      });
    }
  };
  
  resolveVariablesRecursive(environment);
  
  return Array.from(resolvedVariables.values());
};

/**
 * Gets the inheritance chain for an environment
 * @param {Object} environment - The environment object
 * @param {Array} allEnvironments - All environments in the collection
 * @returns {Array} Array of environments in inheritance order (parent to child)
 */
export const getInheritanceChain = (environment, allEnvironments) => {
  if (!environment) {
    return [];
  }
  
  const chain = [];
  const visited = new Set();
  
  let currentEnv = environment;
  
  while (currentEnv && !visited.has(currentEnv.uid)) {
    visited.add(currentEnv.uid);
    chain.unshift(currentEnv);
    
    if (currentEnv.parentEnvironmentUid) {
      currentEnv = allEnvironments.find(e => e.uid === currentEnv.parentEnvironmentUid);
    } else {
      currentEnv = null;
    }
  }
  
  return chain;
};

/**
 * Checks if an environment has circular inheritance
 * @param {Object} environment - The environment object
 * @param {Array} allEnvironments - All environments in the collection
 * @returns {boolean} True if there's a circular dependency
 */
export const hasCircularInheritance = (environment, allEnvironments) => {
  if (!environment || !environment.parentEnvironmentUid) {
    return false;
  }
  
  const visited = new Set();
  let currentEnv = environment;
  
  while (currentEnv && currentEnv.parentEnvironmentUid) {
    if (visited.has(currentEnv.parentEnvironmentUid)) {
      return true;
    }
    
    visited.add(currentEnv.uid);
    currentEnv = allEnvironments.find(e => e.uid === currentEnv.parentEnvironmentUid);
  }
  
  return false;
};

/**
 * Gets all child environments of a given environment
 * @param {Object} environment - The parent environment object
 * @param {Array} allEnvironments - All environments in the collection
 * @returns {Array} Array of child environments
 */
export const getChildEnvironments = (environment, allEnvironments) => {
  if (!environment) {
    return [];
  }
  
  return allEnvironments.filter(env => env.parentEnvironmentUid === environment.uid);
};

/**
 * Gets all descendant environments (children, grandchildren, etc.) of a given environment
 * @param {Object} environment - The parent environment object
 * @param {Array} allEnvironments - All environments in the collection
 * @returns {Array} Array of all descendant environments
 */
export const getAllDescendantEnvironments = (environment, allEnvironments) => {
  if (!environment) {
    return [];
  }
  
  const descendants = [];
  const directChildren = getChildEnvironments(environment, allEnvironments);
  
  for (const child of directChildren) {
    descendants.push(child);
    // Recursively get descendants of each child
    const grandchildren = getAllDescendantEnvironments(child, allEnvironments);
    descendants.push(...grandchildren);
  }
  
  return descendants;
};

/**
 * Builds a hierarchical tree structure of environments
 * @param {Array} environments - All environments in the collection
 * @returns {Array} Array of environment tree nodes
 */
export const buildEnvironmentTree = (environments) => {
  if (!environments || !environments.length) {
    return [];
  }

  // Create a map for quick lookup
  const envMap = new Map();
  environments.forEach(env => {
    envMap.set(env.uid, {
      ...env,
      children: [],
      level: 0
    });
  });

  // Build parent-child relationships
  const rootEnvironments = [];
  
  environments.forEach(env => {
    const envNode = envMap.get(env.uid);
    
    if (env.parentEnvironmentUid) {
      const parent = envMap.get(env.parentEnvironmentUid);
      if (parent) {
        parent.children.push(envNode);
        envNode.level = parent.level + 1;
      } else {
        // Parent not found, treat as root
        rootEnvironments.push(envNode);
      }
    } else {
      // No parent, this is a root environment
      rootEnvironments.push(envNode);
    }
  });

  // Function to calculate levels recursively
  const calculateLevels = (node, level = 0) => {
    node.level = level;
    node.children.forEach(child => calculateLevels(child, level + 1));
  };

  // Calculate levels for all root environments
  rootEnvironments.forEach(root => calculateLevels(root));

  return rootEnvironments;
};

/**
 * Flattens the environment tree into a list with proper ordering and levels
 * @param {Array} environmentTree - The tree structure from buildEnvironmentTree
 * @returns {Array} Flattened array with level information
 */
export const flattenEnvironmentTree = (environmentTree) => {
  const flattened = [];
  
  const traverse = (nodes) => {
    nodes.forEach(node => {
      flattened.push(node);
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    });
  };
  
  traverse(environmentTree);
  return flattened;
};
