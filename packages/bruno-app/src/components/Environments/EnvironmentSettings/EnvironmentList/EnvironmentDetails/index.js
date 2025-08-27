import { IconCopy, IconDatabase, IconEdit, IconTrash, IconLink } from '@tabler/icons';
import { useState } from 'react';
import CopyEnvironment from '../../CopyEnvironment';
import DeleteEnvironment from '../../DeleteEnvironment';
import RenameEnvironment from '../../RenameEnvironment';
import EditInheritance from '../../EditInheritance';
import EnvironmentVariables from './EnvironmentVariables';

const EnvironmentDetails = ({ environment, collection, setIsModified, onClose }) => {
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openCopyModal, setOpenCopyModal] = useState(false);
  const [openInheritanceModal, setOpenInheritanceModal] = useState(false);

  // Find parent environment if it exists
  const parentEnvironment = environment.parentEnvironmentUid 
    ? collection.environments?.find(env => env.uid === environment.parentEnvironmentUid)
    : null;

  return (
    <div className="px-6 flex-grow flex flex-col pt-6" style={{ maxWidth: '700px' }}>
      {openEditModal && (
        <RenameEnvironment onClose={() => setOpenEditModal(false)} environment={environment} collection={collection} />
      )}
      {openDeleteModal && (
        <DeleteEnvironment
          onClose={() => setOpenDeleteModal(false)}
          environment={environment}
          collection={collection}
        />
      )}
      {openCopyModal && (
        <CopyEnvironment onClose={() => setOpenCopyModal(false)} environment={environment} collection={collection} />
      )}
      {openInheritanceModal && (
        <EditInheritance onClose={() => setOpenInheritanceModal(false)} environment={environment} collection={collection} />
      )}
      <div className="flex">
        <div className="flex flex-grow items-center">
          <IconDatabase className="cursor-pointer" size={20} strokeWidth={1.5} />
          <span className="ml-1 font-semibold break-all">{environment.name}</span>
        </div>
        <div className="flex gap-x-4 pl-4">
          <IconEdit className="cursor-pointer" size={20} strokeWidth={1.5} onClick={() => setOpenEditModal(true)} title="Rename environment" />
          <IconLink className="cursor-pointer" size={20} strokeWidth={1.5} onClick={() => setOpenInheritanceModal(true)} title="Manage inheritance" />
          <IconCopy className="cursor-pointer" size={20} strokeWidth={1.5} onClick={() => setOpenCopyModal(true)} title="Copy environment" />
          <IconTrash className="cursor-pointer" size={20} strokeWidth={1.5} onClick={() => setOpenDeleteModal(true)} title="Delete environment" />
        </div>
      </div>

      {parentEnvironment && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Inherits from:</span> {parentEnvironment.name}
        </div>
      )}

      <div>
        <EnvironmentVariables environment={environment} collection={collection} setIsModified={setIsModified} onClose={onClose} />
      </div>
    </div>
  );
};

export default EnvironmentDetails;
