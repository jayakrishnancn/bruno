/**
 * Test file for environment inheritance functionality
 */

import {
  resolveEnvironmentVariables,
  getInheritanceChain,
  hasCircularInheritance,
  getChildEnvironments
} from '../environments';

// Mock environments for testing
const environments = [
  {
    uid: 'env1',
    name: 'Base Environment',
    variables: [
      { name: 'BASE_URL', value: 'https://api.example.com', enabled: true },
      { name: 'API_VERSION', value: 'v1', enabled: true }
    ]
  },
  {
    uid: 'env2',
    name: 'Development Environment',
    parentEnvironmentUid: 'env1',
    variables: [
      { name: 'BASE_URL', value: 'https://dev-api.example.com', enabled: true },
      { name: 'DEBUG', value: 'true', enabled: true }
    ]
  },
  {
    uid: 'env3',
    name: 'Staging Environment',
    parentEnvironmentUid: 'env2',
    variables: [
      { name: 'BASE_URL', value: 'https://staging-api.example.com', enabled: true },
      { name: 'LOG_LEVEL', value: 'info', enabled: true }
    ]
  },
  {
    uid: 'env4',
    name: 'Independent Environment',
    variables: [
      { name: 'INDEPENDENT_VAR', value: 'independent_value', enabled: true }
    ]
  }
];

// Test resolveEnvironmentVariables
console.log('Testing resolveEnvironmentVariables...');

const stagingResolved = resolveEnvironmentVariables(environments[2], environments);
console.log('Staging environment resolved variables:', stagingResolved.map(v => `${v.name}=${v.value}`));
// Expected: ['API_VERSION=v1', 'DEBUG=true', 'BASE_URL=https://staging-api.example.com', 'LOG_LEVEL=info']

const devResolved = resolveEnvironmentVariables(environments[1], environments);
console.log('Development environment resolved variables:', devResolved.map(v => `${v.name}=${v.value}`));
// Expected: ['API_VERSION=v1', 'BASE_URL=https://dev-api.example.com', 'DEBUG=true']

// Test getInheritanceChain
console.log('\nTesting getInheritanceChain...');

const stagingChain = getInheritanceChain(environments[2], environments);
console.log('Staging inheritance chain:', stagingChain.map(e => e.name));
// Expected: ['Base Environment', 'Development Environment', 'Staging Environment']

// Test hasCircularInheritance
console.log('\nTesting hasCircularInheritance...');

// Create a circular dependency scenario
const circularEnvs = [
  ...environments,
  {
    uid: 'env5',
    name: 'Circular Environment',
    parentEnvironmentUid: 'env3',
    variables: []
  }
];

// Modify env1 to create circular dependency: env1 -> env5 -> env3 -> env2 -> env1
const testCircularEnv = {
  ...circularEnvs[0],
  parentEnvironmentUid: 'env5'
};

const hasCircular = hasCircularInheritance(testCircularEnv, circularEnvs);
console.log('Has circular inheritance:', hasCircular);
// Expected: true

// Test getChildEnvironments
console.log('\nTesting getChildEnvironments...');

const baseChildren = getChildEnvironments(environments[0], environments);
console.log('Base environment children:', baseChildren.map(e => e.name));
// Expected: ['Development Environment']

const devChildren = getChildEnvironments(environments[1], environments);
console.log('Development environment children:', devChildren.map(e => e.name));
// Expected: ['Staging Environment']

export default function runTests() {
  console.log('Environment inheritance utility tests completed!');
}
