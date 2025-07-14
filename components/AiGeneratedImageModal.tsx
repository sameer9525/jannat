
import React, { useEffect } from 'react';
import { GeneratedAiImage } from '../types';

interface AiGeneratedImageModalProps {
  image: GeneratedAiImage;
  onClose: () => void;
}

const AiGeneratedImageModal: React.FC<AiGeneratedImageModalProps> = ({ image, onClose }) => {
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

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]" // Higher z-index
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-image-modal-title"
      aria-describedby="ai-image-modal-description"
    >
      <div 
        className="bg-slate-800/90 border border-pink-700/60 p-4 sm:p-6 rounded-xl shadow-2xl shadow-pink-500/30 max-w-4xl w-full max-h-[90vh] flex flex-col text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
             <h2 id="ai-image-modal-title" className="text-lg sm:text-xl font-semibold text-pink-300 break-words">
                AI Generated Image
             </h2>
             <p id="ai-image-modal-description" className="text-xs sm:text-sm text-indigo-300 mt-1 break-words">
                <span className="font-medium">Original Prompt:</span> {image.originalPrompt}
             </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-pink-400 hover:text-purple-400 transition-colors p-1 rounded-full hover:bg-slate-700/50 ml-2 flex-shrink-0"
            aria-label="Close image viewer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        
        <div className="flex-grow overflow-auto mb-4 rounded-md bg-slate-900/50 flex items-center justify-center">
          <img 
            src={image.src} 
            alt={`AI Generated: ${image.originalPrompt}`} 
            className="max-w-full max-h-[70vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
};

export default AiGeneratedImageModal;
