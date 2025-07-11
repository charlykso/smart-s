import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XMarkIcon, PhotoIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useSchoolStore } from '../../store/schoolStore';
import type { CreateGroupSchoolData, UpdateGroupSchoolData, GroupSchool } from '../../types/school';

const groupSchoolSchema = z.object({
  name: z.string().min(1, 'Group school name is required'),
  description: z.string().min(1, 'Description is required'),
  logo: z.string().optional(),
});

type GroupSchoolFormData = z.infer<typeof groupSchoolSchema>;

interface GroupSchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupSchool?: GroupSchool | null;
}

const GroupSchoolModal: React.FC<GroupSchoolModalProps> = ({
  isOpen,
  onClose,
  groupSchool,
}) => {
  const { createGroupSchool, updateGroupSchool, isLoading } = useSchoolStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GroupSchoolFormData>({
    resolver: zodResolver(groupSchoolSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (groupSchool) {
        reset({
          name: groupSchool.name,
          description: groupSchool.description,
          logo: groupSchool.logo || '',
        });
        setPreviewUrl(groupSchool.logo || '');
        setUploadMethod('url');
      } else {
        reset({
          name: '',
          description: '',
          logo: '',
        });
        setPreviewUrl('');
        setUploadMethod('file');
      }
      setSelectedFile(null);
    }
  }, [isOpen, groupSchool, reset]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    // Reset file input
    const fileInput = document.getElementById('logo-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleFormSubmit = async (data: GroupSchoolFormData) => {
    try {
      if (groupSchool) {
        // Update existing group school
        const updateData: UpdateGroupSchoolData = {
          _id: groupSchool._id,
          name: data.name,
          description: data.description,
          logo: uploadMethod === 'url' ? data.logo : undefined,
          logoFile: uploadMethod === 'file' ? selectedFile : undefined,
        };
        await updateGroupSchool(updateData);
      } else {
        // Create new group school
        const createData: CreateGroupSchoolData = {
          name: data.name,
          description: data.description,
          logo: uploadMethod === 'url' ? data.logo || '' : '',
          logoFile: uploadMethod === 'file' ? selectedFile : undefined,
        };
        await createGroupSchool(createData);
      }

      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-50 transition-opacity cursor-pointer"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl dark:shadow-gray-900 transform transition-all sm:my-8 sm:align-middle w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {groupSchool ? 'Edit Group School' : 'Create New Group School'}
              </h3>
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Group School Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., ABC Education Group"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Brief description of the group school"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Logo
                    </legend>

                  {/* Upload Method Toggle */}
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="file"
                        checked={uploadMethod === 'file'}
                        onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                        className="mr-2"
                      />
                      <CloudArrowUpIcon className="h-4 w-4 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300">Upload File</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="url"
                        checked={uploadMethod === 'url'}
                        onChange={(e) => setUploadMethod(e.target.value as 'file' | 'url')}
                        className="mr-2"
                      />
                      <PhotoIcon className="h-4 w-4 mr-1" />
                      <span className="text-gray-700 dark:text-gray-300">Use URL</span>
                    </label>
                  </div>

                  {uploadMethod === 'file' ? (
                    <div>
                      {/* File Upload */}
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                        <div className="space-y-1 text-center">
                          {previewUrl ? (
                            <div className="relative">
                              <img
                                src={previewUrl}
                                alt="Logo preview"
                                className="mx-auto h-32 w-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={handleRemoveFile}
                                aria-label="Remove uploaded image"
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                <label
                                  htmlFor="logo-file"
                                  className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                >
                                  <span>Upload a file</span>
                                  <input
                                    id="logo-file"
                                    name="logo-file"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={handleFileSelect}
                                  />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
                            </>
                          )}
                        </div>
                      </div>
                      {selectedFile && (
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {/* URL Input */}
                      <input
                        type="url"
                        {...register('logo')}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://example.com/logo.png"
                        onChange={(e) => setPreviewUrl(e.target.value)}
                      />
                      {errors.logo && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.logo.message}</p>
                      )}
                      {previewUrl && (
                        <div className="mt-3">
                          <img
                            src={previewUrl}
                            alt="Logo preview"
                            className="h-20 w-20 object-cover rounded-lg"
                            onError={() => setPreviewUrl('')}
                          />
                        </div>
                      )}
                    </div>
                  )}
                  </fieldset>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {(() => {
                  if (isLoading) return 'Saving...';
                  return groupSchool ? 'Update Group School' : 'Create Group School';
                })()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupSchoolModal;
