"use client"

import React from "react"
import NearbyMatching from "./NearbyMatching";

interface SidePanelProps {
  isDarkMode: boolean;
}

const SidePanel = React.memo(({ isDarkMode }: SidePanelProps) => {
  return (
    <div className="col-span-6 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar flex flex-col items-center justify-center">
      {/* 지도만 단독으로 표시 */}
      <NearbyMatching isDarkMode={isDarkMode} />
    </div>
  );
});

export default SidePanel;
