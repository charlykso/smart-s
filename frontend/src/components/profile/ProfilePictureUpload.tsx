import React, { useState, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfilePictureUploadProps {
  currentPicture?: string;
  onUpload: (file: File) => Promise<string>;
  className?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  currentPicture,
  onUpload,
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const newPictureUrl = await onUpload(file);
      toast.success('Profile picture updated successfully!');
      setPreview(null);
    } catch (error) {
      toast.error('Failed to upload profile picture');
      setPreview(null);
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImage = preview || currentPicture;

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Profile Picture Display */}
      <div className="relative">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <CameraIcon className="h-8 w-8 text-primary-600" />
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-primary-600 hover:bg-primary-700 text-white rounded-full p-2 shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Change profile picture"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <CameraIcon className="h-4 w-4" />
          )}
        </button>

        {/* Remove Preview Button */}
        {preview && (
          <button
            type="button"
            onClick={handleRemovePreview}
            className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition-colors"
            title="Remove preview"
          >
            <XMarkIcon className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {/* Upload Instructions */}
      <div className="mt-2 text-center">
        <p className="text-xs text-secondary-500">
          Click to upload a new picture
        </p>
        <p className="text-xs text-secondary-400">
          Max size: 5MB
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-secondary-200 rounded-full h-1">
            <div className="bg-primary-600 h-1 rounded-full animate-pulse"></div>
          </div>
          <p className="text-xs text-secondary-500 text-center mt-1">
            Uploading...
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;
