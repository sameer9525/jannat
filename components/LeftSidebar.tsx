

import React, { useMemo } from 'react';
import { Category, AppView } from '../types';
import { getHierarchicalCategoriesForSelect } from '../App';

// New Icon for AI Generator
const AiGeneratorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 ${className}`}>
    <path d="M14.25 9.75A3.75 3.75 0 0010.5 6h-3a3.75 3.75 0 00-3.75 3.75v3A3.75 3.75 0 007.5 16.5h3a3.75 3.75 0 003.75-3.75v-3zm-3.75 5.25h-3a2.25 2.25 0 01-2.25-2.25v-3a2.25 2.25 0 012.25-2.25h3a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25z" />
    <path d="M14.25 3.093a.75.75 0 01.008 1.06l-.008.008L12 6.337l-2.25-2.176a.75.75 0 01.008-1.06l.008-.008a.75.75 0 011.06-.008l.008.008L12 4.2l1.172-1.125a.75.75 0 011.078 1.018zM12 21a.75.75 0 01-.75-.75v-2.558a.75.75 0 011.5 0V20.25a.75.75 0 01-.75.75zM16.5 19.125a.75.75 0 01-.75-.75v-1.51a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75zM7.5 19.125a.75.75 0 01-.75-.75v-1.51a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75zM19.125 16.5a.75.75 0 01-.75-.75v-1.51a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75zM4.875 16.5a.75.75 0 01-.75-.75v-1.51a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75zM16.5 4.875a.75.75 0 01-.75-.75V2.615a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75zM7.5 4.875a.75.75 0 01-.75-.75V2.615a.75.75 0 011.5 0v1.51a.75.75 0 01-.75.75z" />
    <path d="M12 1.5a.75.75 0 01.75.75V4.8a.75.75 0 01-1.5 0V2.25A.75.75 0 0112 1.5zM3.093 7.5a.75.75 0 011.06-.008L4.16 7.5l2.176 2.25a.75.75 0 11-1.06 1.06L3.094 8.568a.75.75 0 010-1.06zM20.907 7.5a.75.75 0 010 1.06l-.008.008L18.72 10.75a.75.75 0 11-1.06-1.06l2.176-2.25a.75.75 0 011.07-.008z" />
  </svg>
);


interface LeftSidebarProps {
  categories: Category[];
  selectedCategoryId: string | 'all' | 'uncategorized';
  onSelectCategory: (id: string | 'all' | 'uncategorized') => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  currentView,
  setCurrentView,
}) => {
  const hierarchicalCategoriesForFilter = useMemo(() =>
    getHierarchicalCategoriesForSelect(categories, false, false)
  , [categories]);

  const filterButtonClass = (isActive: boolean): string =>
    `w-full text-left px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800/80 flex items-center justify-between group ${
      isActive
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-[1.02]'
        : 'bg-slate-700/60 hover:bg-slate-600/80 text-purple-300 hover:text-purple-100 border border-transparent hover:border-purple-600/70 focus:ring-purple-500'
    }`;
  
  const navLinkBaseClass = "flex items-center space-x-3 text-indigo-300 hover:text-pink-400 transition-colors duration-200 py-2.5 block rounded-md hover:bg-slate-700/50 px-3 text-sm font-medium";
  const navLinkActiveClass = "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm scale-[1.01]";


  return (
    <aside className="hidden md:block w-64 h-screen sticky top-0 bg-slate-800/50 backdrop-blur-md border-r border-purple-700/30 p-4 shadow-lg shadow-purple-900/20 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-purple-300 mb-4 px-1">Navigation</h2>
        <nav>
          <ul>
            <li className="mb-1.5">
              <button 
                onClick={() => setCurrentView('gallery')} 
                className={`${navLinkBaseClass} w-full ${currentView === 'gallery' ? navLinkActiveClass : ''}`}
                aria-current={currentView === 'gallery' ? 'page' : undefined}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 3.75a2 2 0 100 4 2 2 0 000-4zM4.25 3.75a2 2 0 100 4 2 2 0 000-4zM15.75 3.75a2 2 0 100 4 2 2 0 000-4zM4.25 9.75a2 2 0 100 4 2 2 0 000-4zM10 9.75a2 2 0 100 4 2 2 0 000-4zM15.75 9.75a2 2 0 100 4 2 2 0 000-4z" /></svg>
                <span>Photo Gallery</span>
              </button>
            </li>
            <li className="mb-1.5">
              <button 
                onClick={() => setCurrentView('aiImageGenerator')} 
                className={`${navLinkBaseClass} w-full ${currentView === 'aiImageGenerator' ? navLinkActiveClass : ''}`}
                aria-current={currentView === 'aiImageGenerator' ? 'page' : undefined}
              >
                 <AiGeneratorIcon className="w-5 h-5" />
                <span>AI Image Generator</span>
              </button>
            </li>
             {/* Placeholder navigation items, if any */}
            {['Discover', 'Settings'].map(item => (
              <li key={item} className="mb-1.5 opacity-60">
                <a href="#" className={`${navLinkBaseClass} pointer-events-none`} onClick={(e) => { e.preventDefault(); alert('Navigation is for demonstration purposes.'); }}>
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h7.5E" /></svg>
                  <span>{item}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {currentView === 'gallery' && (
        <div className="pt-4 border-t border-purple-700/30 flex-grow overflow-y-auto">
          <h3 className="text-lg font-semibold text-pink-300 mb-3 px-1">Filter by Category</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                onClick={() => onSelectCategory('all')}
                aria-pressed={selectedCategoryId === 'all'}
                className={filterButtonClass(selectedCategoryId === 'all')}
              >
                <span>All Photos</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => onSelectCategory('uncategorized')}
                aria-pressed={selectedCategoryId === 'uncategorized'}
                className={filterButtonClass(selectedCategoryId === 'uncategorized')}
              >
                <span>Uncategorized</span>
              </button>
            </li>
            {hierarchicalCategoriesForFilter.map(catOpt => {
               if (catOpt.id === 'top-level-option' || catOpt.id === 'uncategorized-opt') return null;
              const isSelected = selectedCategoryId === catOpt.id;
              const paddingClass = catOpt.label.startsWith('↳') ? 'pl-6' : 'pl-3';
              return (
                <li key={catOpt.id}>
                  <button
                    onClick={() => onSelectCategory(catOpt.id)}
                    aria-pressed={isSelected}
                    className={`${filterButtonClass(isSelected)}`}
                    title={catOpt.label.replace(/↳\s*/, '')}
                  >
                    <span className={`flex-grow ${paddingClass}`}>{catOpt.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </aside>
  );
};

export default LeftSidebar;