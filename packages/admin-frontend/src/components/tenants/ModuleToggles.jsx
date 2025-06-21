import React, { useEffect, useState } from "react";
import { adminModuleService } from "../../services/api";
// This could be imported from a shared constants file
//const ALL_MODULES = ["pos", "inventory", "repairs", "accounting", "crm", "hr"];

const ModuleToggles = ({ selectedModules, onSelectionChange }) => {
  const [availableModules, setAvailableModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await adminModuleService.getAll();
        // We only want to show modules that are globally active
        setAvailableModules(response.data.filter((m) => m.isGloballyActive));
      } catch (error) {
        console.error("Failed to fetch available modules", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (isLoading) {
    return <p>Loading modules...</p>;
  }

  const handleToggle = (moduleKey) => {
    const newModules = selectedModules.includes(moduleKey)
      ? selectedModules.filter((key) => key !== moduleKey)
      : [...selectedModules, moduleKey];
    onSelectionChange(newModules);
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-slate-100 mb-4">
        Module Access
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
        {availableModules.map((module) => (
          <label
            key={module.key}
            className="flex items-center space-x-3 cursor-pointer p-2 rounded-md hover:bg-slate-700/50 transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedModules?.includes(module.key)}
              onChange={() => handleToggle(module.key)}
              className="h-5 w-5 rounded border-slate-500 bg-slate-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-800"
            />
            <span className="text-sm font-medium capitalize text-slate-100">
              {module.name}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ModuleToggles;
