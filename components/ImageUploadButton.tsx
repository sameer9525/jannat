
import React from 'react';

interface ImageUploadButtonProps {
  onTriggerUploadFlow: () => void; // Changed from onImageUpload
}

// Upload Icon SVG
const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={`w-6 h-6 ${className}`}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 011.336 11.095" />
  </svg>
);


const ImageUploadButton: React.FC<ImageUploadButtonProps> = ({ onTriggerUploadFlow }) => {
  // File input is now handled by the PreUploadConfigModal
  // const fileInputRef = useRef<HTMLInputElement>(null);

  // const handleButtonClick = () => {
  //   fileInputRef.current?.click();
  // };

  // const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   onImageUpload(event.target.files);
  //   if (event.target) {
  //       event.target.value = '';
  //   }
  // };

  return (
    <div className="my-6 flex flex-col items-center">
      {/* Input is removed, button now triggers modal via onTriggerUploadFlow */}
      <button
        id="upload-button-label"
        onClick={onTriggerUploadFlow} // Changed from handleButtonClick
        className="group relative inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 text-lg font-medium text-white bg-gradient-to-br from-purple-600 to-indigo-700 rounded-lg shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-600/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-purple-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"></span>
        <span className="relative flex items-center">
          <UploadIcon className="w-6 h-6 mr-2 group-hover:animate-pulse" />
          Add Mystic Photos
        </span>
      </button>
       <p className="mt-3 text-sm text-indigo-400/80">Supports PNG, JPG, GIF, WEBP</p>
    </div>
  );
};

export default ImageUploadButton;
