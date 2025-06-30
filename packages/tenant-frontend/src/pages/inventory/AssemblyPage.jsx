import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { tenantAssemblyService, tenantLocationService } from "../../services/api";
import AssemblyForm from "../../components/inventory/assemblies/AssemblyForm";
import { Combine } from "lucide-react";

/**
 * A "smart" page component that orchestrates the kitting and assembly workflow.
 * It fetches necessary data and handles the final API submission.
 */
const AssemblyPage = () => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch prerequisite data for the form (e.g., branches)
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const branchesRes = await tenantLocationService.getAllBranches();
      setBranches(branchesRes.data.data);
    } catch (error) {
      toast.error("Could not load necessary data for assemblies.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Handles the final submission of the assembly job to the backend.
   * @param {object} payload - The complete assembly data from the form.
   * @returns {boolean} - True if the save was successful, false otherwise.
   */
  const handleSaveAssembly = async (payload) => {
    setIsSaving(true);
    try {
      await toast.promise(tenantAssemblyService.create(payload), {
        loading: "Processing assembly...",
        success: "Kits assembled and stock updated successfully!",
        error: (err) => err.response?.data?.error || "Assembly failed.",
      });
      // Indicate success so the form can reset itself
      return true;
    } catch (error) {
      // Error is handled by the toast promise
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading Assembly Workspace...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="p-2 bg-slate-800 rounded-lg">
          <Combine className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Kitting & Assembly</h1>
          <p className="mt-1 text-slate-400">Assemble bundle products from their individual component parts.</p>
        </div>
      </div>

      <AssemblyForm branches={branches} onSave={handleSaveAssembly} isSaving={isSaving} />
    </div>
  );
};

export default AssemblyPage;
