import React from 'react';

interface PlayLimitBannerProps {
  playCount: number;
  playLimit: number;
  isSharedLink: boolean;
}

export function PlayLimitBanner({ playCount, playLimit, isSharedLink }: PlayLimitBannerProps) {
  if (!isSharedLink || !playLimit || playLimit <= 0) {
    return null;
  }

  const remaining = Math.max(0, playLimit - playCount);

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-max z-50">
      <div className="px-6 py-3 bg-gray-800 rounded-t-xl border border-gray-600">
        <span className="text-yellow-400 font-medium">{remaining}</span>
        <span className="text-white ml-1">
          of {playLimit} plays remaining
        </span>
      </div>
    </div>
  );
}