import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Modal, Input, Button } from "ui-library";
import { tenantCustomerService } from "../../services/api";
import { Search, LoaderCircle } from "lucide-react";
import { useDebounce } from "../../hooks/useDebounce";

const CustomerSearchModal = ({ isOpen, onClose, onSelectCustomer }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const searchCustomers = useCallback(async () => {
    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await tenantCustomerService.getAll({ search: debouncedSearchTerm, limit: 50 });
      setResults(res.data.data);
    } catch (error) {
      // handle error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    searchCustomers();
  }, [searchCustomers]);

  const handleSelect = (customer) => {
    onSelectCustomer(customer);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search for Customer">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          autoFocus
        />
      </div>
      <div className="mt-4 max-h-80 overflow-y-auto border border-slate-700 rounded-lg">
        {isLoading && (
          <div className="flex justify-center p-4">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        )}
        {!isLoading &&
          results.map((cust) => (
            <div key={cust._id} onClick={() => handleSelect(cust)} className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700">
              <p className="font-medium">{cust.name}</p>
              <p className="text-sm text-slate-400">{cust.phone}</p>
            </div>
          ))}
      </div>
    </Modal>
  );
};
export default CustomerSearchModal;
