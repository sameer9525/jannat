
import React, { ChangeEvent, useMemo } from 'react';
import { UploadedImage, Category } from '../types';
import { getFullCategoryPath, getHierarchicalCategoriesForSelect } from '../App';

const CREATE_NEW_CATEGORY_SENTINEL = 'CREATE_NEW_CATEGORY_SENTINEL_VALUE';

// TrashIcon SVG is removed as it's no longer used

interface ImageCardProps {
  image: UploadedImage;
  categories: Category[];
  onAssignCategory: (imageId: string, categoryId?: string) => void;
  onImageClick: (image: UploadedImage) => void;
  onOpenCreateCategoryModal: (imageId: string) => void;
  onToggleSticker: (imageId: string) => void;
  // Admin related props removed
}

const ImageCard: React.FC<ImageCardProps> = ({
  image,
  categories,
  onAssignCategory,
  onImageClick,
  onOpenCreateCategoryModal,
  onToggleSticker,
  // Admin related props destructured and removed
}) => {
  const fullCategoryPath = useMemo(() => getFullCategoryPath(image.categoryId, categories), [image.categoryId, categories]);

  const categorySelectOptions = useMemo(() => {
    const hierarchical = getHierarchicalCategoriesForSelect(categories);
    return [
      { value: "uncategorized", label: "Uncategorized", id: "uncategorized-opt" },
      ...hierarchical,
      { value: CREATE_NEW_CATEGORY_SENTINEL, label: "✨ Create New Category...", id: "create-new-opt" }
    ];
  }, [categories]);

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    if (value === CREATE_NEW_CATEGORY_SENTINEL) {
      onOpenCreateCategoryModal(image.id);
    } else {
      const newCategoryId = value === 'uncategorized' ? undefined : value;
      onAssignCategory(image.id, newCategoryId);
    }
  };

  const handleStickerToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    onToggleSticker(image.id);
  };

  // handleDeleteClick function removed

  return (
    <div
      className="group relative bg-slate-800/60 backdrop-blur-sm border border-purple-700/50 rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-600/40 overflow-hidden transition-all duration-300 ease-in-out flex flex-col"
    >
      <div
        className="relative w-full overflow-hidden cursor-pointer"
        style={{ paddingTop: '150%' }} // 2:3 aspect ratio
        onClick={() => onImageClick(image)}
        onKeyUp={(e) => e.key === 'Enter' && onImageClick(image)}
        tabIndex={0}
        role="button"
        aria-label={`View larger image of ${image.name}`}
      >
        <img
          src={image.url}
          alt={image.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        {image.hasSticker && (
          <div
            className="absolute top-2 right-2 text-3xl sm:text-4xl"
            role="img"
            aria-label="Sticker applied"
            style={{ textShadow: '0 0 5px rgba(0,0,0,0.7)' }}
          >
            💋
          </div>
        )}
        {/* Admin delete button removed */}
      </div>
      <div className="p-3 flex flex-col flex-grow bg-gradient-to-t from-slate-900/95 via-slate-900/80 to-slate-800/60">
        <div className="flex justify-between items-start mb-1">
          <p
            className="text-sm font-medium text-purple-200 truncate group-hover:text-purple-100 transition-colors flex-1"
            title={image.name}
          >
            {image.name}
          </p>
          <button
            onClick={handleStickerToggle}
            className="p-1 text-xl text-pink-400 hover:text-pink-300 transition-colors rounded-full hover:bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-pink-500"
            aria-label={image.hasSticker ? `Remove sticker from ${image.name}` : `Add sticker to ${image.name}`}
            title={image.hasSticker ? "Remove Sticker" : "Add Sticker"}
          >
            ✨
          </button>
        </div>

        <p className="text-xs text-pink-300/90 mb-2 truncate" title={`Category: ${fullCategoryPath}`}>
          {fullCategoryPath}
        </p>

        <div className="mt-auto">
          <label htmlFor={`category-select-${image.id}`} className="sr-only">
            Assign category to {image.name}
          </label>
          <select
            id={`category-select-${image.id}`}
            value={image.categoryId || 'uncategorized'}
            onChange={handleCategoryChange}
            onClick={(e) => e.stopPropagation()}
            className="w-full p-2 text-xs bg-slate-700/80 border border-purple-600/70 rounded-md text-gray-200 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23a855f7' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem',
            }}
            aria-label={`Assign ${image.name} to a category`}
          >
            {categorySelectOptions.map(catOpt => (
              <option key={catOpt.id} value={catOpt.value}>
                {catOpt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
