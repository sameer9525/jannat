

import React, { useState, useEffect, ChangeEvent } from 'react';
import { Category } from '../types';
import { getHierarchicalCategoriesForSelect } from '../App'; // Assuming this stays in App or is moved to utils

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCategory: (name: string, parentId?: string) => boolean; // Returns true on success, false on failure
  existingCategories: Category[];
  error: string | null;
  clearError: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({
  isOpen,
  onClose,
  onCreateCategory,
  existingCategories,
  error,
  clearError,
}) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCategoryName('');
      setSelectedParentId('');
      clearError(); // Clear errors when modal opens
    }
  }, [isOpen, clearError]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCreateCategory(categoryName, selectedParentId || undefined)) {
      onClose(); // Close only on success
    }
  };

  const hierarchicalCategoriesForParentSelect = getHierarchicalCategoriesForSelect(existingCategories, true);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-category-modal-title"
    >
      <div
        className="bg-slate-800 border border-purple-700/60 p-6 rounded-xl shadow-2xl shadow-purple-500/40 max-w-md w-full text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between mb-6">
          <h2 id="create-category-modal-title" className="text-2xl font-semibold text-purple-300">
            Create New Category
          </h2>
          <button
            onClick={onClose}
            className="text-purple-400 hover:text-pink-400 transition-colors p-1 rounded-full hover:bg-slate-700/50"
            aria-label="Close create category modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="new-category-name" className="block text-sm font-medium text-purple-300 mb-1">
              Category Name
            </label>
            <input
              id="new-category-name"
              type="text"
              value={categoryName}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setCategoryName(e.target.value);
                if (error) clearError(); // Clear error on input change
              }}
              placeholder="e.g., Landscapes, Portraits, Summer 2024"
              className="w-full p-3 bg-slate-700/60 border border-purple-600 rounded-md text-gray-100 placeholder-purple-400/50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors"
              required
              aria-required="true"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="parent-category-modal-select" className="block text-sm font-medium text-purple-300 mb-1">
              Parent Category (optional for subcategory)
            </label>
            <select
              id="parent-category-modal-select"
              value={selectedParentId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                setSelectedParentId(e.target.value);
                if (error) clearError();
              }}
              className="w-full p-3 bg-slate-700/60 border border-purple-600 rounded-md text-gray-100 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem',
              }}
            >
              {/* <option value="">-- Create as Top-Level Category --</option> already included by helper if flag is true */}
              {hierarchicalCategoriesForParentSelect.map(cat => (
                <option key={cat.id} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="my-3 p-3 bg-red-500/20 border border-red-600 text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-purple-300 bg-slate-700/70 hover:bg-slate-600/90 border border-purple-700/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-md shadow-md hover:shadow-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 focus:ring-offset-slate-800"
            >
              Create Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;