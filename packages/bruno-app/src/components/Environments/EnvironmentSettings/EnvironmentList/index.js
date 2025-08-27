import React, { useEffect, useState } from 'react';
import { findEnvironmentInCollection } from 'utils/collections';
import { buildEnvironmentTree, flattenEnvironmentTree } from 'utils/environments';
import usePrevious from 'hooks/usePrevious';
import EnvironmentDetails from './EnvironmentDetails';
import CreateEnvironment from '../CreateEnvironment';
import { IconDownload, IconShieldLock, IconChevronRight, IconChevronDown } from '@tabler/icons';
import ImportEnvironment from '../ImportEnvironment';
import ManageSecrets from '../ManageSecrets';
import StyledWrapper from './StyledWrapper';
import ConfirmSwitchEnv from './ConfirmSwitchEnv';
import ToolHint from 'components/ToolHint';
import { isEqual } from 'lodash';

const EnvironmentList = ({ selectedEnvironment, setSelectedEnvironment, collection, isModified, setIsModified, onClose }) => {
  const { environments } = collection;
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [openManageSecretsModal, setOpenManageSecretsModal] = useState(false);
  const [expandedEnvironments, setExpandedEnvironments] = useState(new Set());

  const [switchEnvConfirmClose, setSwitchEnvConfirmClose] = useState(false);
  const [originalEnvironmentVariables, setOriginalEnvironmentVariables] = useState([]);

  // Build hierarchical structure
  const environmentTree = buildEnvironmentTree(environments || []);
  const flattenedEnvironments = flattenEnvironmentTree(environmentTree);

  const envUids = environments ? environments.map((env) => env.uid) : [];
  const prevEnvUids = usePrevious(envUids);

  useEffect(() => {
    if (selectedEnvironment) {
      const _selectedEnvironment = environments?.find(env => env?.uid === selectedEnvironment?.uid);
      const hasSelectedEnvironmentChanged = !isEqual(selectedEnvironment, _selectedEnvironment);
      if (hasSelectedEnvironmentChanged) {
        setSelectedEnvironment(_selectedEnvironment);
      }
      setOriginalEnvironmentVariables(selectedEnvironment.variables);
      
      // Auto-expand parent environments of the selected environment
      const newExpanded = new Set(expandedEnvironments);
      let currentEnv = selectedEnvironment;
      while (currentEnv && currentEnv.parentEnvironmentUid) {
        const parentEnv = environments?.find(env => env.uid === currentEnv.parentEnvironmentUid);
        if (parentEnv) {
          newExpanded.add(parentEnv.uid);
          currentEnv = parentEnv;
        } else {
          break;
        }
      }
      setExpandedEnvironments(newExpanded);
      
      return;
    }

    const environment = findEnvironmentInCollection(collection, collection.activeEnvironmentUid);
    if (environment) {
      setSelectedEnvironment(environment);
    } else {
      setSelectedEnvironment(environments && environments.length ? environments[0] : null);
    }
  }, [collection, environments, selectedEnvironment]);

  // Auto-expand environments that have children when the tree structure changes
  useEffect(() => {
    const newExpanded = new Set(expandedEnvironments);
    environmentTree.forEach(env => {
      if (env.children && env.children.length > 0) {
        newExpanded.add(env.uid);
      }
    });
    setExpandedEnvironments(newExpanded);
  }, [environmentTree]);

  useEffect(() => {
    if (prevEnvUids && prevEnvUids.length && envUids.length > prevEnvUids.length) {
      const newEnv = environments.find((env) => !prevEnvUids.includes(env.uid));
      if (newEnv) {
        setSelectedEnvironment(newEnv);
      }
    }

    if (prevEnvUids && prevEnvUids.length && envUids.length < prevEnvUids.length) {
      setSelectedEnvironment(environments && environments.length ? environments[0] : null);
    }
  }, [envUids, environments, prevEnvUids]);

  const handleEnvironmentClick = (env) => {
    if (!isModified) {
      setSelectedEnvironment(env);
    } else {
      setSwitchEnvConfirmClose(true);
    }
  };

  if (!selectedEnvironment) {
    return null;
  }

  const handleCreateEnvClick = () => {
    if (!isModified) {
      setOpenCreateModal(true);
    } else {
      setSwitchEnvConfirmClose(true);
    }
  };

  const handleImportClick = () => {
    if (!isModified) {
      setOpenImportModal(true);
    } else {
      setSwitchEnvConfirmClose(true);
    }
  };

  const handleSecretsClick = () => {
    setOpenManageSecretsModal(true);
  };

  const handleConfirmSwitch = (saveChanges) => {
    if (!saveChanges) {
      setSwitchEnvConfirmClose(false);
    }
  };

  const toggleEnvironmentExpansion = (envUid) => {
    const newExpanded = new Set(expandedEnvironments);
    if (newExpanded.has(envUid)) {
      newExpanded.delete(envUid);
    } else {
      newExpanded.add(envUid);
    }
    setExpandedEnvironments(newExpanded);
  };

  const renderEnvironmentItem = (env, isVisible = true) => {
    if (!isVisible) return null;
    
    const hasChildren = env.children && env.children.length > 0;
    const isExpanded = expandedEnvironments.has(env.uid);
    const indentLevel = env.level || 0;
    
    return (
      <React.Fragment key={env.uid}>
        <ToolHint text={env.name} toolhintId={env.uid} place="right">
          <div
            id={env.uid}
            className={selectedEnvironment.uid === env.uid ? 'environment-item active' : 'environment-item'}
            style={{ paddingLeft: `${12 + (indentLevel * 16)}px` }}
            onClick={() => handleEnvironmentClick(env)}
          >
            <div className="flex items-center w-full">
              {hasChildren ? (
                <span 
                  className="expand-icon mr-1 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleEnvironmentExpansion(env.uid);
                  }}
                >
                  {isExpanded ? (
                    <IconChevronDown size={12} strokeWidth={2} />
                  ) : (
                    <IconChevronRight size={12} strokeWidth={2} />
                  )}
                </span>
              ) : (
                <span className="expand-icon-placeholder mr-1" style={{ width: '12px' }}></span>
              )}
              <span className="break-all flex-1">{env.name}</span>
              {env.parentEnvironmentUid && (
                <span className="inheritance-indicator text-xs text-gray-500 ml-2">↳</span>
              )}
            </div>
          </div>
        </ToolHint>
        
        {hasChildren && isExpanded && env.children.map(child => 
          renderEnvironmentItem(child, true)
        )}
      </React.Fragment>
    );
  };

  return (
    <StyledWrapper>
      {openCreateModal && <CreateEnvironment collection={collection} onClose={() => setOpenCreateModal(false)} />}
      {openImportModal && <ImportEnvironment collection={collection} onClose={() => setOpenImportModal(false)} />}
      {openManageSecretsModal && <ManageSecrets onClose={() => setOpenManageSecretsModal(false)} />}

      <div className="flex">
        <div>
          {switchEnvConfirmClose && (
            <div className="flex items-center justify-between tab-container px-1">
              <ConfirmSwitchEnv onCancel={() => handleConfirmSwitch(false)} />
            </div>
          )}
          <div className="environments-sidebar flex flex-col">
            {environmentTree &&
              environmentTree.length > 0 &&
              environmentTree.map((env) => renderEnvironmentItem(env))}
            <div className="btn-create-environment" onClick={() => handleCreateEnvClick()}>
              + <span>Create</span>
            </div>

            <div className="mt-auto btn-import-environment">
              <div className="flex items-center" onClick={() => handleImportClick()}>
                <IconDownload size={12} strokeWidth={2} />
                <span className="label ml-1 text-xs">Import</span>
              </div>
              <div className="flex items-center mt-2" onClick={() => handleSecretsClick()}>
                <IconShieldLock size={12} strokeWidth={2} />
                <span className="label ml-1 text-xs">Managing Secrets</span>
              </div>
            </div>
          </div>
        </div>
        <EnvironmentDetails
          environment={selectedEnvironment}
          collection={collection}
          setIsModified={setIsModified}
          originalEnvironmentVariables={originalEnvironmentVariables}
          onClose={onClose}
        />
      </div>
    </StyledWrapper>
  );
};

export default EnvironmentList;
