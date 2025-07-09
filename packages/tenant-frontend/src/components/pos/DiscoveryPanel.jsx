import React, { useState } from "react";
import WorkspaceTabs from "./WorkspaceTabs";
import HierarchyWizard from "./wizard/HierarchyWizard";

const DiscoveryPanel = ({ onItemsSelected, onAddItem }) => {
  const [activeTab, setActiveTab] = useState("REPAIRS");

  return (
    <div className="bg-slate-800 rounded-lg h-full flex flex-col p-4 gap-4">
      <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-grow overflow-y-auto pt-4 border-t border-slate-700">
        {/* The wizard is now used for all tabs, just with a different startMode */}
        <HierarchyWizard
          key={activeTab} // The key is critical for resetting the wizard's state
          startMode={activeTab}
          onItemsSelected={onItemsSelected}
          onAddItem={onAddItem}
        />
      </div>
    </div>
  );
};
export default DiscoveryPanel;
