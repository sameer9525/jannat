
import React from 'react';
import { UploadedImage, Category } from '../types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: UploadedImage[];
  categories: Category[];
  onAssignCategory: (imageId: string, categoryId?: string) => void;
  onImageClick: (image: UploadedImage) => void;
  onOpenCreateCategoryModal: (imageId: string) => void;
  onToggleSticker: (imageId: string) => void;
  // Admin related props removed
}

const ImageGrid: React.FC<ImageGridProps> = ({
  images,
  categories,
  onAssignCategory,
  onImageClick,
  onOpenCreateCategoryModal,
  onToggleSticker,
  // Admin related props destructured and removed
}) => {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 sm:mt-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-2">
        {images.map(image => (
          <ImageCard
            key={image.id}
            image={image}
            categories={categories}
            onAssignCategory={onAssignCategory}
            onImageClick={onImageClick}
            onOpenCreateCategoryModal={onOpenCreateCategoryModal}
            onToggleSticker={onToggleSticker}
            // Admin related props removed
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;
