import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { saveEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import Portal from 'components/Portal';
import Modal from 'components/Modal';
import { hasCircularInheritance, buildEnvironmentTree, flattenEnvironmentTree } from 'utils/environments';

const EditInheritance = ({ environment, collection, onClose }) => {
  const dispatch = useDispatch();

  // Build hierarchical structure for display
  const environmentTree = buildEnvironmentTree(collection?.environments || []);
  const flattenedEnvironments = flattenEnvironmentTree(environmentTree);

  const validateParentEnvironment = (parentUid) => {
    if (!parentUid) return true;
    
    // Create a copy of the environment with the new parent
    const tempEnvironment = {
      ...environment,
      parentEnvironmentUid: parentUid
    };
    
    const allEnvironments = collection?.environments || [];
    return !hasCircularInheritance(tempEnvironment, allEnvironments);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      parentEnvironmentUid: environment.parentEnvironmentUid || ''
    },
    validationSchema: Yup.object({
      parentEnvironmentUid: Yup.string()
        .nullable()
        .test('no-circular-inheritance', 'This would create a circular inheritance', validateParentEnvironment)
    }),
    onSubmit: (values) => {
      const updatedEnvironment = {
        ...environment,
        parentEnvironmentUid: values.parentEnvironmentUid || null
      };

      dispatch(saveEnvironment(updatedEnvironment.variables, environment.uid, collection.uid, updatedEnvironment.parentEnvironmentUid))
        .then(() => {
          toast.success('Inheritance settings updated');
          onClose();
        })
        .catch(() => toast.error('An error occurred while updating inheritance settings'));
    }
  });

  const onSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <Portal>
      <Modal
        size="md"
        title={'Edit Environment Inheritance'}
        confirmText="Save"
        handleConfirm={onSubmit}
        handleCancel={onClose}
      >
        <form className="bruno-form" onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor="parentEnvironmentUid" className="block font-semibold">
              Inherit from Environment
            </label>
            <div className="flex items-center mt-2">
              <select
                id="parentEnvironmentUid"
                name="parentEnvironmentUid"
                className="block textbox w-full"
                onChange={formik.handleChange}
                value={formik.values.parentEnvironmentUid || ''}
              >
                <option value="">None (No inheritance)</option>
                {flattenedEnvironments
                  ?.filter(env => env.uid !== environment.uid) // Don't allow self-inheritance
                  ?.map((env) => (
                    <option key={env.uid} value={env.uid}>
                      {'  '.repeat(env.level)}
                      {env.name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This environment will inherit variables from the selected parent environment.
              Local variables will override inherited ones.
            </div>
            {formik.touched.parentEnvironmentUid && formik.errors.parentEnvironmentUid ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.parentEnvironmentUid}</div>
            ) : null}
          </div>
        </form>
      </Modal>
    </Portal>
  );
};

export default EditInheritance;
