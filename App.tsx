
import React, { useState, useCallback, useMemo, ChangeEvent, useRef } from 'react';
import { UploadedImage, Category, OverlayImageState, AppView } from './types';
import ImageUploadButton from './components/ImageUploadButton';
import ImageGrid from './components/ImageGrid';
import ImageModal from './components/ImageModal';
import CreateCategoryModal from './components/CreateCategoryModal';
import PreUploadConfigModal from './components/PreUploadConfigModal';
import GlobalOverlayImage from './components/GlobalOverlayImage';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import AiImageGeneratorPage from './components/AiImageGeneratorPage'; // New Import

// Simple Sparkle SVG Icon component
const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`w-6 h-6 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.511 1.709-6.625 4.373-8.552a.75.75 0 01.819.162zM10.06 4.94a.75.75 0 01.592-1.014 7.472 7.472 0 013.828.096.75.75 0 01.592 1.015 7.473 7.473 0 01-3.828-.096.75.75 0 01-1.014-.592zM14.25 12a.75.75 0 01-.75-.75 2.25 2.25 0 00-2.25-2.25.75.75 0 010-1.5 3.75 3.75 0 013.75 3.75.75.75 0 01-.75.75zm0 0V12a2.25 2.25 0 002.25 2.25.75.75 0 010 1.5A3.75 3.75 0 0112 12a2.25 2.25 0 00-2.25-2.25.75.75 0 01-.75-.75A3.75 3.75 0 0112.75 12H12a2.25 2.25 0 00-2.25 2.25.75.75 0 01-1.5 0A3.75 3.75 0 0112 10.5v.75a2.25 2.25 0 002.25 2.25.75.75 0 01.75.75z"
      clipRule="evenodd"
    />
  </svg>
);

// Overlay Icon SVG
const PngOverlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
  </svg>
);


export const getFullCategoryPath = (categoryId: string | undefined, allCategories: Category[]): string => {
  if (!categoryId) return "Uncategorized";
  const category = allCategories.find(c => c.id === categoryId);
  if (!category) return "Unknown Category";

  let path = category.name;
  let currentParentId = category.parentId;
  while (currentParentId) {
    const parent = allCategories.find(p => p.id === currentParentId);
    if (parent) {
      path = `${parent.name} > ${path}`;
      currentParentId = parent.parentId;
    } else {
      break;
    }
  }
  return path;
};

export const getHierarchicalCategoriesForSelect = (categories: Category[], includeSelectParentOption: boolean = false, includeUncategorized: boolean = false) => {
  const options: { value: string; label: string; id: string, parentId?: string }[] = [];

  if (includeSelectParentOption) {
      options.push({value: "", label: "-- Create as Top-Level Category --", id: "top-level-option"});
  }
  if (includeUncategorized) {
     options.push({ value: "uncategorized", label: "Uncategorized", id: "uncategorized-opt" });
  }

  const buildHierarchy = (parentId?: string, depth = 0) => {
    categories
      .filter(cat => cat.parentId === parentId)
      .sort((a,b) => a.name.localeCompare(b.name))
      .forEach(cat => {
        options.push({
          value: cat.id,
          label: `${'  '.repeat(depth)}↳ ${cat.name}`.trimStart(),
          id: cat.id,
          parentId: cat.parentId
        });
        buildHierarchy(cat.id, depth + 1);
      });
  };
  buildHierarchy(undefined);
  return options;
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('gallery');
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | 'all' | 'uncategorized'>('all');

  const [selectedImageForModal, setSelectedImageForModal] = useState<UploadedImage | null>(null);

  const [isCreateCategoryModalOpen, setIsCreateCategoryModalOpen] = useState<boolean>(false);
  const [creatingCategoryForImageId, setCreatingCategoryForImageId] = useState<string | null>(null);

  const [isPreUploadModalOpen, setIsPreUploadModalOpen] = useState<boolean>(false);

  const [overlayImages, setOverlayImages] = useState<OverlayImageState[]>([]);
  const overlayFileInputRef = useRef<HTMLInputElement>(null);
  const MAX_OVERLAYS = 5;

  const handleAssignCategoryToImage = useCallback((imageId: string, newCategoryId?: string) => {
    setImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId ? { ...img, categoryId: newCategoryId } : img
      )
    );
  }, []);

  const handleToggleSticker = useCallback((imageId: string) => {
    setImages(prevImages =>
      prevImages.map(img =>
        img.id === imageId ? { ...img, hasSticker: !img.hasSticker } : img
      )
    );
  }, []);

  const handleCreateCategory = useCallback((name: string, parentId?: string): string | null => {
    setCategoryError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setCategoryError("Category name cannot be empty.");
      return null;
    }

    const siblingCategories = categories.filter(cat => cat.parentId === (parentId || undefined));
    if (siblingCategories.some(cat => cat.name.toLowerCase() === trimmedName.toLowerCase())) {
      setCategoryError(`A category or subcategory named "${trimmedName}" already exists ${parentId ? 'under the selected parent' : 'at the top level'}.`);
      return null;
    }

    const newCategory: Category = {
      id: crypto.randomUUID(),
      name: trimmedName,
      parentId: parentId || undefined
    };
    setCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));

    if (creatingCategoryForImageId) {
      handleAssignCategoryToImage(creatingCategoryForImageId, newCategory.id);
      setCreatingCategoryForImageId(null);
    }

    setCategoryError(null);
    return newCategory.id;
  }, [categories, creatingCategoryForImageId, handleAssignCategoryToImage]);

  const handleOpenCreateCategoryModal = useCallback((imageId: string) => {
    setCreatingCategoryForImageId(imageId);
    setCategoryError(null);
    setIsCreateCategoryModalOpen(true);
  }, []);

  const handleCloseCreateCategoryModal = useCallback(() => {
    setIsCreateCategoryModalOpen(false);
    setCreatingCategoryForImageId(null);
    setCategoryError(null);
  }, []);

  const handleOpenPreUploadModal = useCallback(() => {
    setUploadError(null);
    setCategoryError(null);
    setIsPreUploadModalOpen(true);
  }, []);

  const handleClosePreUploadModal = useCallback(() => {
    setIsPreUploadModalOpen(false);
  }, []);

  const handleUploadWithCategoryAndFiles = useCallback((files: FileList | null, categoryIdForUpload?: string) => {
    if (!files || files.length === 0) {
      setUploadError("No files selected for upload.");
      return;
    }

    setUploadError(null);
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      setUploadError("No valid image files selected. Please upload PNG, JPG, GIF, etc.");
      return;
    }

    const newUploadedImages: UploadedImage[] = imageFiles.map(file => ({
      id: crypto.randomUUID(),
      name: file.name,
      url: URL.createObjectURL(file),
      file: file,
      categoryId: categoryIdForUpload === 'uncategorized' ? undefined : categoryIdForUpload,
      hasSticker: false,
    }));

    setImages(prevImages => [...prevImages, ...newUploadedImages]);
    handleClosePreUploadModal();
  }, [handleClosePreUploadModal]);


  const handleImageClick = useCallback((image: UploadedImage) => {
    setSelectedImageForModal(image);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImageForModal(null);
  }, []);

  const handleTriggerOverlayUpload = () => {
    overlayFileInputRef.current?.click();
  };

  const handleOverlayFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "image/png") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgSrc = e.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const defaultWidth = 200;
          const aspectRatio = img.naturalWidth / img.naturalHeight;
          const newOverlayData = {
            src: imgSrc,
            x: window.innerWidth / 2 - defaultWidth / 2,
            y: window.innerHeight / 2 - (defaultWidth / aspectRatio) / 2,
            width: defaultWidth,
            height: defaultWidth / aspectRatio,
            rotation: 0,
            originalWidth: img.naturalWidth,
            originalHeight: img.naturalHeight,
            isVisible: true,
          };

          setOverlayImages(prevOverlays => {
            const reusableOverlayIndex = prevOverlays.findIndex(ov => !ov.isVisible);
            if (reusableOverlayIndex !== -1) {
              const updatedOverlays = [...prevOverlays];
              updatedOverlays[reusableOverlayIndex] = {
                ...prevOverlays[reusableOverlayIndex],
                ...newOverlayData,
                id: prevOverlays[reusableOverlayIndex].id // Keep original ID
              };
              return updatedOverlays;
            } else if (prevOverlays.length < MAX_OVERLAYS) {
              return [...prevOverlays, { ...newOverlayData, id: crypto.randomUUID() }];
            } else {
              alert(`Maximum ${MAX_OVERLAYS} overlays reached. Please close one to add a new one.`);
              return prevOverlays;
            }
          });
        };
        img.src = imgSrc;
      };
      reader.readAsDataURL(file);
    } else if (file) {
      alert("Please select a PNG file for the overlay.");
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const handleUpdateOverlay = (id: string, updatedProps: Partial<OverlayImageState>) => {
    setOverlayImages(prevs =>
      prevs.map(prevImg =>
        prevImg.id === id ? { ...prevImg, ...updatedProps } : prevImg
      )
    );
  };

  const handleCloseOverlay = (id: string) => {
    setOverlayImages(prevs =>
      prevs.map(prevImg =>
        prevImg.id === id ? { ...prevImg, isVisible: false } : prevImg
      )
    );
  };

  const filteredImages = useMemo(() => {
    let imagesToDisplay: UploadedImage[];

    if (selectedCategoryId === 'all') {
      imagesToDisplay = images;
    } else if (selectedCategoryId === 'uncategorized') {
      imagesToDisplay = images.filter(img => !img.categoryId);
    } else {
      const getSubCategoryIdsRecursive = (parentId: string): string[] => {
          let ids = [parentId];
          const children = categories.filter(c => c.parentId === parentId);
          children.forEach(child => {
              ids = [...ids, ...getSubCategoryIdsRecursive(child.id)];
          });
          return ids;
      };
      const categoryAndSubCategoryIds = getSubCategoryIdsRecursive(selectedCategoryId);
      imagesToDisplay = images.filter(img => img.categoryId && categoryAndSubCategoryIds.includes(img.categoryId));
    }
    return imagesToDisplay;

  }, [images, selectedCategoryId, categories]);

  const GalleryView: React.FC = () => (
    <>
      <header className="mb-8 sm:mb-12 text-center w-full">
        <div className="flex items-center justify-center space-x-3">
          <SparkleIcon className="text-purple-400 h-8 w-8 sm:h-10 sm:w-10" />
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 filter drop-shadow-md">
            Jannat
          </h1>
          <SparkleIcon className="text-pink-400 h-8 w-8 sm:h-10 sm:w-10" />
        </div>
        <p className="mt-3 text-lg text-indigo-300">Upload your magical moments and watch them appear!</p>

        <input
          type="file"
          accept="image/png"
          ref={overlayFileInputRef}
          onChange={handleOverlayFileChange}
          style={{ display: 'none' }}
          aria-label="Upload PNG overlay image"
        />
        <button
          onClick={handleTriggerOverlayUpload}
          title="Add a movable PNG overlay to the page"
          className="mt-4 group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-br from-pink-500 to-orange-500 rounded-md shadow-md hover:shadow-lg shadow-pink-500/30 hover:shadow-pink-600/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-pink-500 transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-pink-400 to-orange-400 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></span>
          <span className="relative flex items-center">
            <PngOverlayIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />
            Add PNG Overlay
          </span>
        </button>
      </header>

      <ImageUploadButton onTriggerUploadFlow={handleOpenPreUploadModal} />

      {uploadError && (
        <div className="my-4 p-3 bg-red-500/20 border border-red-700 text-red-300 rounded-md w-full max-w-md text-sm">
          {uploadError}
        </div>
      )}

      <ImageGrid
        images={filteredImages}
        categories={categories}
        onAssignCategory={handleAssignCategoryToImage}
        onImageClick={handleImageClick}
        onOpenCreateCategoryModal={handleOpenCreateCategoryModal}
        onToggleSticker={handleToggleSticker}
      />

      {filteredImages.length === 0 && !uploadError && images.length > 0 && (
        <div className="mt-12 text-center text-purple-300/70">
          <p className="text-2xl mb-2">No photos match this filter.</p>
          <p>Try a different filter or upload more photos.</p>
        </div>
      )}

      {images.length === 0 && !uploadError && (
        <div className="mt-12 text-center text-purple-300/70">
          <p className="text-2xl mb-2">Your gallery is empty.</p>
          <p>Click the button to add your first enchanted photo!</p>
        </div>
      )}
    </>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 via-60% to-indigo-900 text-gray-100 selection:bg-purple-500 selection:text-white">
      <div className="flex flex-row min-h-screen">
        <LeftSidebar
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          currentView={currentView}
          setCurrentView={setCurrentView}
        />

        <main className="flex-grow p-4 sm:p-8 overflow-y-auto flex flex-col items-center">
          {currentView === 'gallery' && <GalleryView />}
          {currentView === 'aiImageGenerator' && <AiImageGeneratorPage />}
        </main>

        <RightSidebar />
      </div>

      {/* Modals common to gallery view or potentially reusable */}
      {selectedImageForModal && currentView === 'gallery' && (
        <ImageModal
          image={selectedImageForModal}
          allCategories={categories}
          onClose={handleCloseModal}
        />
      )}

      {isCreateCategoryModalOpen && currentView === 'gallery' && (
        <CreateCategoryModal
          isOpen={isCreateCategoryModalOpen}
          onClose={handleCloseCreateCategoryModal}
          onCreateCategory={(name, parentId) => {
            const newCatId = handleCreateCategory(name, parentId);
            if (newCatId && creatingCategoryForImageId) {
                handleAssignCategoryToImage(creatingCategoryForImageId, newCatId);
                setCreatingCategoryForImageId(null);
            }
            return !!newCatId;
          }}
          existingCategories={categories}
          error={categoryError}
          clearError={() => setCategoryError(null)}
        />
      )}

      {isPreUploadModalOpen && currentView === 'gallery' && (
        <PreUploadConfigModal
          isOpen={isPreUploadModalOpen}
          onClose={handleClosePreUploadModal}
          existingCategories={categories}
          onCreateCategoryInModal={handleCreateCategory}
          onUpload={handleUploadWithCategoryAndFiles}
          getHierarchicalCategoriesForSelect={getHierarchicalCategoriesForSelect}
          getFullCategoryPath={getFullCategoryPath}
          externalError={categoryError}
          clearExternalError={() => setCategoryError(null)}
        />
      )}
      
      {overlayImages.map(overlay =>
        overlay.isVisible && (
          <GlobalOverlayImage
            key={overlay.id}
            initialState={overlay}
            onUpdate={(updatedProps) => handleUpdateOverlay(overlay.id, updatedProps)}
            onClose={() => handleCloseOverlay(overlay.id)}
          />
        )
      )}
    </div>
  );
};

export default App;
