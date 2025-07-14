import React, { useEffect } from 'react';
import { UploadedImage, Category } from '../types';
import { getFullCategoryPath } from '../App'; // Import helper

interface ImageModalProps {
  image: UploadedImage;
  allCategories: Category[];
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ image, allCategories, onClose }) => {
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const fullCategoryPath = getFullCategoryPath(image.categoryId, allCategories);

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose} // Close on overlay click
      role="dialog"
      aria-modal="true"
      aria-labelledby="image-modal-title"
      aria-describedby="image-modal-description"
    >
      <div 
        className="bg-slate-800/80 border border-purple-700/50 p-4 sm:p-6 rounded-xl shadow-2xl shadow-purple-500/30 max-w-3xl w-full max-h-[90vh] flex flex-col text-gray-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
      >
        <header className="flex items-center justify-between mb-4">
          <h2 id="image-modal-title" className="text-xl sm:text-2xl font-semibold text-purple-300 truncate" title={image.name}>
            {image.name}
          </h2>
          <button 
            onClick={onClose} 
            className="text-purple-400 hover:text-pink-400 transition-colors p-1 rounded-full hover:bg-slate-700/50"
            aria-label="Close image viewer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="flex-grow overflow-auto mb-4 rounded-md">
          <img 
            src={image.url} 
            alt={`Large view of ${image.name}`} 
            className="w-full h-auto max-h-[70vh] object-contain rounded-md"
          />
        </div>

        <footer id="image-modal-description" className="text-sm text-indigo-300 text-center">
          Category: {fullCategoryPath}
        </footer>
      </div>
    </div>
  );
};

export default ImageModal;