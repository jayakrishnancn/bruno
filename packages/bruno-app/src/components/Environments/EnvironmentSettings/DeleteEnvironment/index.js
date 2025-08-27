import React from 'react';
import Portal from 'components/Portal/index';
import toast from 'react-hot-toast';
import Modal from 'components/Modal/index';
import { deleteEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import { useDispatch } from 'react-redux';
import { getAllDescendantEnvironments } from 'utils/environments';
import StyledWrapper from './StyledWrapper';

const DeleteEnvironment = ({ onClose, environment, collection }) => {
  const dispatch = useDispatch();
  
  // Get all descendant environments that will be deleted
  const descendantEnvironments = getAllDescendantEnvironments(environment, collection.environments || []);
  const hasChildren = descendantEnvironments.length > 0;
  
  const onConfirm = () => {
    dispatch(deleteEnvironment(environment.uid, collection.uid))
      .then(() => {
        const deleteMessage = hasChildren 
          ? `Environment "${environment.name}" and ${descendantEnvironments.length} child environment(s) deleted successfully`
          : 'Environment deleted successfully';
        toast.success(deleteMessage);
        onClose();
      })
      .catch(() => toast.error('An error occurred while deleting the environment'));
  };

  return (
    <Portal>
      <StyledWrapper>
        <Modal
          size={hasChildren ? "md" : "sm"}
          title={'Delete Environment'}
          confirmText="Delete"
          handleConfirm={onConfirm}
          handleCancel={onClose}
        >
          <div>
            <p>Are you sure you want to delete <span className="font-semibold">{environment.name}</span>?</p>
            
            {hasChildren && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Warning: Cascade Deletion
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                      <p>This environment has {descendantEnvironments.length} child environment(s) that will also be deleted:</p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        {descendantEnvironments.map(child => (
                          <li key={child.uid} className="font-medium">{child.name}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </StyledWrapper>
    </Portal>
  );
};

export default DeleteEnvironment;
