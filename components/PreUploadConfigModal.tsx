
import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { Category } from '../types';

// Re-define CREATE_NEW_CATEGORY_SENTINEL if not globally available
const CREATE_NEW_CATEGORY_ACTION = 'CREATE_NEW_CATEGORY_ACTION_VALUE';

interface PreUploadConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: Category[];
  onCreateCategoryInModal: (name: string, parentId?: string) => string | null; // Returns new category ID or null
  onUpload: (files: FileList, categoryId?: string) => void;
  getHierarchicalCategoriesForSelect: (categories: Category[], includeSelectParentOption?: boolean, includeUncategorized?: boolean) => Array<{ value: string; label: string; id: string; parentId?: string }>;
  getFullCategoryPath: (categoryId: string | undefined, allCategories: Category[]) => string;
  externalError: string | null;
  clearExternalError: () => void;
}

const PreUploadConfigModal: React.FC<PreUploadConfigModalProps> = ({
  isOpen,
  onClose,
  existingCategories,
  onCreateCategoryInModal,
  onUpload,
  getHierarchicalCategoriesForSelect,
  getFullCategoryPath,
  externalError,
  clearExternalError,
}) => {
  const [selectedCategoryIdForUpload, setSelectedCategoryIdForUpload] = useState<string>('uncategorized'); // Default to uncategorized
  const [showNewCategoryForm, setShowNewCategoryForm] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryParentId, setNewCategoryParentId] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setSelectedCategoryIdForUpload('uncategorized');
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      setNewCategoryParentId('');
      setLocalError(null);
      setSelectedFiles(null);
      if(externalError) clearExternalError();
      if (fileInputRef.current) { // Clear file input
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, externalError, clearExternalError]);

  if (!isOpen) {
    return null;
  }

  const handleCategorySelectionChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === CREATE_NEW_CATEGORY_ACTION) {
      setShowNewCategoryForm(true);
      setSelectedCategoryIdForUpload(''); // Clear selection as we are creating new
      setLocalError(null);
    } else {
      setShowNewCategoryForm(false);
      setSelectedCategoryIdForUpload(value);
      setLocalError(null);
    }
     if(externalError) clearExternalError();
  };

  const handleCreateAndSelectCategory = () => {
    if (!newCategoryName.trim()) {
      setLocalError("New category name cannot be empty.");
      return;
    }
    setLocalError(null);
    if(externalError) clearExternalError();

    const newCatId = onCreateCategoryInModal(newCategoryName, newCategoryParentId || undefined);
    if (newCatId) {
      setSelectedCategoryIdForUpload(newCatId);
      setShowNewCategoryForm(false);
      setNewCategoryName('');
      setNewCategoryParentId('');
    } else {
      // Error is handled by App.tsx setting externalError if onCreateCategoryInModal fails
      // We can also set localError if externalError isn't immediately available or for specific UI
      // setLocalError("Failed to create category. It might already exist.");
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
      setLocalError(null); // Clear any previous file errors
    } else {
      setSelectedFiles(null);
    }
  };

  const handleSubmitUpload = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setLocalError("Please select photo(s) to upload.");
      return;
    }
    if (!selectedCategoryIdForUpload && !showNewCategoryForm) {
        setLocalError("Please select or create a category.");
        return;
    }
    if (showNewCategoryForm) {
        setLocalError("Please finish creating or cancel creating the new category.");
        return;
    }
    
    setLocalError(null);
    onUpload(selectedFiles, selectedCategoryIdForUpload);
  };
  
  const categoryOptions = getHierarchicalCategoriesForSelect(existingCategories, false, true); // include uncategorized for selection
  const parentCategoryOptions = getHierarchicalCategoriesForSelect(existingCategories, true); // include "top-level" for parent selection

  const currentError = localError || externalError;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-upload-modal-title"
    >
      <div
        className="bg-slate-800 border border-purple-700/60 p-6 rounded-xl shadow-2xl shadow-purple-500/40 max-w-lg w-full text-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-6">
          <h2 id="pre-upload-modal-title" className="text-2xl font-semibold text-purple-300">
            Upload Photos
          </h2>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-pink-400 transition-colors p-1 rounded-full hover:bg-slate-700/50"
            aria-label="Close upload modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmitUpload} className="flex-grow flex flex-col overflow-y-auto max-h-[70vh]">
          {/* Category Selection/Creation Part */}
          {!showNewCategoryForm ? (
            <div className="mb-4">
              <label htmlFor="upload-category-select" className="block text-sm font-medium text-purple-300 mb-1">
                Assign to Category
              </label>
              <select
                id="upload-category-select"
                value={selectedCategoryIdForUpload}
                onChange={handleCategorySelectionChange}
                className="w-full p-3 bg-slate-700/60 border border-purple-600 rounded-md text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors appearance-none"
                 style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
              >
                {categoryOptions.map(cat => (
                  <option key={cat.id} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
                <option value={CREATE_NEW_CATEGORY_ACTION}>✨ Create New Category...</option>
              </select>
            </div>
          ) : (
            // New Category Form
            <div className="mb-4 p-3 border border-purple-600/50 rounded-md bg-slate-700/30">
              <h3 className="text-lg font-medium text-pink-300 mb-3">Create New Category</h3>
              <div className="mb-3">
                <label htmlFor="new-upload-category-name" className="block text-xs font-medium text-purple-300 mb-1">
                  New Category Name
                </label>
                <input
                  id="new-upload-category-name"
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    if(localError || externalError) { setLocalError(null); clearExternalError(); }
                  }}
                  placeholder="e.g., Events"
                  className="w-full p-2.5 bg-slate-600/50 border border-purple-500 rounded-md text-gray-100 placeholder-purple-400/50 focus:ring-1 focus:ring-pink-400"
                  required={showNewCategoryForm}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="new-upload-parent-category" className="block text-xs font-medium text-purple-300 mb-1">
                  Parent Category (optional)
                </label>
                <select
                  id="new-upload-parent-category"
                  value={newCategoryParentId}
                  onChange={(e) => {
                    setNewCategoryParentId(e.target.value);
                     if(localError || externalError) { setLocalError(null); clearExternalError(); }
                  }}
                  className="w-full p-2.5 bg-slate-600/50 border border-purple-500 rounded-md text-gray-100 focus:ring-1 focus:ring-pink-400 appearance-none"
                   style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  {parentCategoryOptions.map(opt => (
                    <option key={opt.id} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateAndSelectCategory}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-pink-500 hover:bg-pink-600 rounded-md transition-colors"
                >
                  Create & Use
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowNewCategoryForm(false);
                    setNewCategoryName('');
                    setNewCategoryParentId('');
                    setLocalError(null);
                    if(externalError) clearExternalError();
                    // Optionally revert to previously selected category or 'uncategorized'
                    setSelectedCategoryIdForUpload('uncategorized'); 
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-purple-300 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors"
                >
                  Cancel Creation
                </button>
              </div>
            </div>
          )}

          {/* File Input Part */}
          <div className="mb-4">
            <label htmlFor="photo-upload-input" className="block text-sm font-medium text-purple-300 mb-1">
                { selectedCategoryIdForUpload && !showNewCategoryForm ? 
                    `Selected Category: ${getFullCategoryPath(selectedCategoryIdForUpload === 'uncategorized' ? undefined : selectedCategoryIdForUpload, existingCategories)}` 
                    : (showNewCategoryForm ? 'Define category first' : 'Select category first')
                }
            </label>
            <input
              id="photo-upload-input"
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-purple-50 hover:file:bg-purple-700 disabled:opacity-50"
              disabled={showNewCategoryForm || !selectedCategoryIdForUpload}
            />
             {selectedFiles && <p className="text-xs text-indigo-300 mt-1">{selectedFiles.length} file(s) selected.</p>}
          </div>

          {currentError && (
            <div className="my-3 p-3 bg-red-500/20 border border-red-600 text-red-300 rounded-md text-sm">
              {currentError}
            </div>
          )}
          
          <div className="mt-auto pt-4 border-t border-slate-700/50">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-sm font-medium text-purple-300 bg-slate-700/70 hover:bg-slate-600/90 border border-purple-700/50 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-md shadow-md hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-60 disabled:transform-none disabled:shadow-none"
                disabled={showNewCategoryForm || !selectedFiles || !selectedCategoryIdForUpload}
              >
                Upload Photos
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PreUploadConfigModal;
