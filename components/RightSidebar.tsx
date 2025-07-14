
import React from 'react';

const RightSidebar: React.FC = () => {
  return (
    <aside className="hidden md:block w-60 h-screen sticky top-0 bg-slate-800/50 backdrop-blur-md border-l border-purple-700/30 p-6 shadow-lg shadow-purple-900/20 overflow-y-auto">
      <h2 className="text-2xl font-semibold text-pink-300 mb-6">Details</h2>
      <div>
        <p className="text-sm text-indigo-300 mb-2">
          Welcome to your magical gallery! This sidebar can show details about selected items, trends, or offer contextual actions.
        </p>
        <div className="mt-4 p-3 bg-slate-700/40 rounded-lg border border-purple-600/50">
            <h4 className="font-medium text-purple-300 mb-1">Tip of the Day</h4>
            <p className="text-xs text-indigo-400">
                Try combining PNG overlays with different stickers for unique effects!
            </p>
        </div>
      </div>
      <div className="mt-10 pt-6 border-t border-purple-700/30">
        <h3 className="text-lg font-medium text-pink-400 mb-3">Recent Activity</h3>
        <ul className="text-xs text-indigo-400 space-y-2">
            <li>Photo "Sunset Bliss" uploaded.</li>
            <li>Category "Travel" created.</li>
            <li>Sticker added to "My Cat".</li>
            <li>PNG Overlay "Sparkles" added.</li>
        </ul>
      </div>
    </aside>
  );
};

export default RightSidebar;
