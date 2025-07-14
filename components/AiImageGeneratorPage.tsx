
import React, { useState, useCallback, ChangeEvent, useMemo } from 'react';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { GeneratedAiImage } from '../types';
import AiGeneratedImageModal from './AiGeneratedImageModal';

// Sparkle Icon for buttons
const SparkleIconFill: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.39-3.423 3.11a.75.75 0 00.278 1.21l3.938.711L8.29 18.25a.75.75 0 001.422 0l1.83-4.401 4.753-.39 3.423-3.11a.75.75 0 00-.278-1.21l-3.938-.711L10.868 2.884z" clipRule="evenodd" />
  </svg>
);
// Lightbulb Icon for suggestions
const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M10 3.5a5.743 5.743 0 00-5.493 4.017c-.26.793-.183 1.69.233 2.412A5.003 5.003 0 0010 16.5a5.003 5.003 0 005.26-6.571c.416-.722.493-1.619.233-2.412A5.743 5.743 0 0010 3.5ZM8.75 18a.75.75 0 001.5 0v-1.25a.75.75 0 00-1.5 0V18z" />
    <path d="M10 20a.75.75 0 01-.75-.75V18a.75.75 0 011.5 0v1.25A.75.75 0 0110 20zM5.903 17.025a.75.75 0 10-1.06-1.06l-.001.001-.885-.884a.75.75 0 10-1.06 1.06l.884.884a.75.75 0 001.06-.001l.001-.001zM16.223 14.91a.75.75 0 10-1.061-1.061l-.884.885a.75.75 0 101.06 1.06l.885-.884z" />
  </svg>
);

// Loading Spinner
const LoadingSpinner: React.FC<{ size?: string }> = ({ size = "w-6 h-6" }) => (
  <svg className={`animate-spin text-pink-400 ${size}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

type AspectRatioValue = 'auto' | '1:1' | '9:16' | '16:9' | '2:3' | '3:2';

const aspectRatioOptions: { label: string; value: AspectRatioValue }[] = [
  { label: "Auto", value: "auto" },
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (9:16)", value: "9:16" }, // Mobile
  { label: "Landscape (16:9)", value: "16:9" }, // PC/Laptop
  { label: "Portrait (2:3)", value: "2:3" },
  { label: "Landscape (3:2)", value: "3:2" },
];

const AiImageGeneratorPage: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioValue>('auto');
  const [generatedImages, setGeneratedImages] = useState<GeneratedAiImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [selectedAiImage, setSelectedAiImage] = useState<GeneratedAiImage | null>(null);

  const ai = useMemo(() => {
    if (!process.env.API_KEY) {
      setError("API Key is not configured. Please set the API_KEY environment variable.");
      return null;
    }
    try {
      return new GoogleGenAI({ apiKey: process.env.API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI:", e);
      setError(`Failed to initialize AI services: ${e instanceof Error ? e.message : String(e)}`);
      return null;
    }
  }, []);


  const handleGenerateImage = useCallback(async () => {
    if (!ai) {
      setError("AI Service not available.");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]); 

    let fullPrompt = `${prompt.trim()}`;
    if (selectedAspectRatio !== 'auto') {
      fullPrompt += `, ${selectedAspectRatio} aspect ratio`;
    }
    fullPrompt += `, Realistic, UHD, Best Quality`;

    try {
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: fullPrompt,
        config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const newImage: GeneratedAiImage = {
          id: crypto.randomUUID(),
          src: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`,
          prompt: fullPrompt,
          originalPrompt: prompt.trim(), 
        };
        setGeneratedImages([newImage]);
      } else {
        setError("No image was generated. The response might be empty or contain safety blocks.");
        console.warn("Image generation response:", response);
      }
    } catch (e) {
      console.error("Error generating image:", e);
      setError(`Error generating image: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsLoading(false);
    }
  }, [ai, prompt, selectedAspectRatio]);

  const handleEnhancePrompt = useCallback(async () => {
    if (!ai) {
      setError("AI Service not available.");
      return;
    }
    if (!prompt.trim()) {
      setError("Prompt to enhance cannot be empty.");
      return;
    }
    setIsEnhancing(true);
    setError(null);
    try {
      const systemInstruction = "You are an AI assistant that refines user prompts for image generation. Make the prompt more descriptive, vivid, and detailed, while keeping it concise. Return only the refined prompt text, without any preamble or explanation.";
      const userQuery = `Refine this image prompt: "${prompt.trim()}"`;
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: { systemInstruction },
      });
      
      setPrompt(response.text.trim());

    } catch (e) {
      console.error("Error enhancing prompt:", e);
      setError(`Error enhancing prompt: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsEnhancing(false);
    }
  }, [ai, prompt]);

  const handleGetSuggestions = useCallback(async () => {
    if (!ai) {
      setError("AI Service not available.");
      return;
    }
    setIsSuggesting(true);
    setError(null);
    setSuggestions([]);
    try {
      const systemInstruction = "You are an AI assistant. Provide 3 diverse and creative example prompts for an AI image generator. Each prompt should be on a new line. The prompts should be suitable for generating images that are realistic, UHD, and of best quality. Focus on interesting subjects, scenes, and styles. Do not add any other text, just the prompts.";
      const userQuery = "Suggest 3 image generation prompts.";

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userQuery,
        config: { systemInstruction },
      });

      const suggestedPrompts = response.text.trim().split('\n').map(s => s.trim()).filter(s => s);
      setSuggestions(suggestedPrompts);

    } catch (e) {
      console.error("Error getting suggestions:", e);
      setError(`Error getting suggestions: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsSuggesting(false);
    }
  }, [ai]);
  
  const downloadImage = (base64Image: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64Image;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6">
      <header className="mb-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 filter drop-shadow-md">
          AI Image Alchemist
        </h1>
        <p className="mt-3 text-lg text-indigo-300">Craft stunning visuals with the power of AI.</p>
      </header>

      {!ai && error && (
         <div className="my-4 p-4 bg-red-700/30 border border-red-500 text-red-200 rounded-lg shadow-md">
          <p className="font-semibold text-lg">Service Unavailable</p>
          <p>{error}</p>
        </div>
      )}

      {ai && (
        <>
        <div className="mb-6 p-4 bg-slate-800/70 border border-purple-700/50 rounded-lg shadow-xl shadow-purple-500/10">
          <label htmlFor="ai-prompt" className="block text-lg font-medium text-purple-300 mb-2">
            Enter Your Mystic Prompt
          </label>
          <textarea
            id="ai-prompt"
            rows={4}
            value={prompt}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
            placeholder="e.g., A majestic griffin soaring through a bioluminescent forest under a double moon..."
            className="w-full p-3 bg-slate-700/80 border border-purple-600 rounded-md text-gray-100 placeholder-purple-400/60 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-colors text-sm leading-relaxed"
            aria-label="AI Image Generation Prompt Input"
          />
          <div className="mt-4">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              Select Aspect Ratio (Hint):
            </label>
            <div className="flex flex-wrap gap-2">
              {aspectRatioOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedAspectRatio(option.value)}
                  className={`px-3 py-1.5 text-xs rounded-full shadow-sm transition-all duration-200 ease-in-out
                    ${selectedAspectRatio === option.value 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white scale-105 ring-2 ring-pink-400 ring-offset-2 ring-offset-slate-800' 
                      : 'bg-slate-600 hover:bg-slate-500 text-purple-200 hover:text-white'
                    }`}
                  aria-pressed={selectedAspectRatio === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-indigo-400/80 mt-2">Note: Aspect ratio is a hint to the AI. Actual results may vary.</p>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || isLoading || !prompt.trim()}
              className="flex-1 group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
            >
              {isEnhancing ? <LoadingSpinner size="w-5 h-5 mr-2"/> : <SparkleIconFill className="w-5 h-5 mr-2 group-hover:animate-pulse" />}
              Enhance Prompt
            </button>
            <button
              onClick={handleGetSuggestions}
              disabled={isSuggesting || isLoading}
              className="flex-1 group relative inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-br from-teal-500 to-cyan-600 rounded-md shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:-translate-y-0.5"
            >
              {isSuggesting ? <LoadingSpinner size="w-5 h-5 mr-2"/> : <LightbulbIcon className="w-5 h-5 mr-2 group-hover:animate-pulse" />}
              Get Suggestions
            </button>
          </div>
        </div>

        {suggestions.length > 0 && (
          <div className="mb-6 p-3 bg-slate-700/50 border border-purple-600/40 rounded-lg">
            <h3 className="text-md font-medium text-purple-300 mb-2">Prompt Suggestions:</h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="px-3 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-sm transition-colors"
                  title="Use this prompt"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <button
            onClick={handleGenerateImage}
            disabled={isLoading || isEnhancing || isSuggesting || !prompt.trim()}
            className="group relative inline-flex items-center justify-center px-8 py-3 sm:px-10 sm:py-3.5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            {isLoading ? <LoadingSpinner size="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" /> : <SparkleIconFill className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 group-hover:animate-ping" />}
            Conjure Image!
          </button>
        </div>
        </>
      )}

      {error && (
        <div className="my-4 p-3 bg-red-500/20 border border-red-700 text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center my-10 p-6 bg-slate-800/50 rounded-lg shadow-inner">
          <LoadingSpinner size="w-12 h-12" />
          <p className="mt-4 text-lg text-purple-300 animate-pulse">Generating your masterpiece...</p>
        </div>
      )}

      {generatedImages.length > 0 && !isLoading && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-pink-300 mb-4">Your Creation:</h2>
          <div className="grid grid-cols-1 gap-6">
            {generatedImages.map((img) => (
              <div key={img.id} className="bg-slate-800/60 backdrop-blur-sm border border-purple-700/50 rounded-lg shadow-lg shadow-purple-500/20 overflow-hidden">
                <img
                  src={img.src}
                  alt={img.originalPrompt}
                  className="w-full h-auto object-contain rounded-t-md cursor-pointer transition-opacity hover:opacity-90"
                  onClick={() => setSelectedAiImage(img)}
                  aria-label={`View larger image for prompt: ${img.originalPrompt}`}
                />
                <div className="p-4">
                  <p className="text-xs text-indigo-300 mb-3 truncate" title={`Full prompt used: ${img.prompt}`}>
                    <span className="font-semibold">Original Prompt:</span> {img.originalPrompt}
                  </p>
                  <button
                    onClick={() => downloadImage(img.src, `ai_image_${Date.now()}.jpg`)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-teal-600 rounded-md shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                  >
                    Save Image
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {selectedAiImage && (
        <AiGeneratedImageModal
          image={selectedAiImage}
          onClose={() => setSelectedAiImage(null)}
        />
      )}
    </div>
  );
};

export default AiImageGeneratorPage;