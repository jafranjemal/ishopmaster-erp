import React, { useState, useEffect, useMemo } from "react";
import { Modal, Input, Button } from "ui-library";
import { tenantLocationService } from "../../services/api";
import { toast } from "react-hot-toast";
import { Search, LoaderCircle } from "lucide-react";

/**
 * A reusable modal for searching and selecting a branch.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls if the modal is visible.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {Function} props.onSelectBranch - Callback function that receives the selected branch object.
 * @param {string} [props.title="Select a Branch"] - Optional title for the modal.
 */
const BranchSelectorModal = ({
  isOpen,
  onClose,
  onSelectBranch,
  title = "Select a Branch",
}) => {
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Fetch branches only when the modal is opened for the first time
    if (isOpen && branches.length === 0) {
      setIsLoading(true);
      tenantLocationService
        .getAllBranches()
        .then((res) => {
          setBranches(res.data.data);
        })
        .catch(() => toast.error("Failed to load branch locations."))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, branches.length]);

  const filteredBranches = useMemo(() => {
    if (!searchTerm) {
      return branches;
    }
    return branches.filter((branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, branches]);

  const handleSelect = (branch) => {
    onSelectBranch(branch);
    onClose(); // Automatically close after selection
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by branch name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="max-h-80 overflow-y-auto border border-slate-700 rounded-lg">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoaderCircle className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <ul className="divide-y divide-slate-700">
              {filteredBranches.length > 0 ? (
                filteredBranches.map((branch) => (
                  <li
                    key={branch._id}
                    onClick={() => handleSelect(branch)}
                    className="p-3 hover:bg-slate-700 cursor-pointer transition-colors"
                  >
                    <p className="font-medium text-slate-100">{branch.name}</p>
                    <p className="text-sm text-slate-400">
                      {branch.address?.city}, {branch.address?.state}
                    </p>
                  </li>
                ))
              ) : (
                <li className="p-8 text-center text-slate-500">
                  No branches found.
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default BranchSelectorModal;
