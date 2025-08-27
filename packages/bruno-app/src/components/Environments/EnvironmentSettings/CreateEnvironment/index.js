import React, { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useFormik } from 'formik';
import { addEnvironment } from 'providers/ReduxStore/slices/collections/actions';
import * as Yup from 'yup';
import { useDispatch } from 'react-redux';
import Portal from 'components/Portal';
import Modal from 'components/Modal';
import { validateName, validateNameError } from 'utils/common/regex';
import { hasCircularInheritance, buildEnvironmentTree, flattenEnvironmentTree } from 'utils/environments';

const CreateEnvironment = ({ collection, onClose }) => {
  const dispatch = useDispatch();
  const inputRef = useRef();

  // Build hierarchical structure for display
  const environmentTree = buildEnvironmentTree(collection?.environments || []);
  const flattenedEnvironments = flattenEnvironmentTree(environmentTree);

 const validateEnvironmentName = (name) => {
   return !collection?.environments?.some((env) => env?.name?.toLowerCase().trim() === name?.toLowerCase().trim());
 };

 const validateParentEnvironment = (parentUid, context) => {
   if (!parentUid) return true;
   
   // Create a temporary environment to test for circular inheritance
   const tempEnvironment = {
     uid: 'temp',
     name: context.parent.name,
     parentEnvironmentUid: parentUid
   };
   
   const allEnvironments = [...(collection?.environments || []), tempEnvironment];
   return !hasCircularInheritance(tempEnvironment, allEnvironments);
 };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
      parentEnvironmentUid: ''
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(1, 'Must be at least 1 character')
        .max(255, 'Must be 255 characters or less')
        .test('is-valid-filename', function(value) {
          const isValid = validateName(value);
          return isValid ? true : this.createError({ message: validateNameError(value) });
        })
        .required('Name is required')
        .test('duplicate-name', 'Environment already exists', validateEnvironmentName),
      parentEnvironmentUid: Yup.string()
        .nullable()
        .test('no-circular-inheritance', 'This would create a circular inheritance', validateParentEnvironment)
    }),
    onSubmit: (values) => {
      dispatch(addEnvironment(values.name, collection.uid, values.parentEnvironmentUid || null))
        .then(() => {
          toast.success('Environment created in collection');
          onClose();
        })
        .catch(() => toast.error('An error occurred while creating the environment'));
    }
  });

  useEffect(() => {
    if (inputRef && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  const onSubmit = () => {
    formik.handleSubmit();
  };

  return (
    <Portal>
      <Modal
        size="md"
        title={'Create Environment'}
        confirmText="Create"
        handleConfirm={onSubmit}
        handleCancel={onClose}
      >
        <form className="bruno-form" onSubmit={e => e.preventDefault()}>
          <div>
            <label htmlFor="name" className="block font-semibold">
              Environment Name
            </label>
            <div className="flex items-center mt-2">
              <input
                id="environment-name"
                type="text"
                name="name"
                ref={inputRef}
                className="block textbox w-full"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                onChange={formik.handleChange}
                value={formik.values.name || ''}
              />
            </div>
            {formik.touched.name && formik.errors.name ? (
              <div className="text-red-500">{formik.errors.name}</div>
            ) : null}
          </div>
          
          <div className="mt-4">
            <label htmlFor="parentEnvironmentUid" className="block font-semibold">
              Inherit from Environment (Optional)
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
                {flattenedEnvironments?.map((env) => (
                  <option key={env.uid} value={env.uid}>
                    {'  '.repeat(env.level)}
                    {env.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              This environment will inherit variables from the selected parent environment.
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

export default CreateEnvironment;
