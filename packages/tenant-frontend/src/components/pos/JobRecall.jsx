import React, { useState } from "react";
import { Input, Button } from "ui-library";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import { tenantSearchService } from "../../services/api";

const JobRecall = ({ onJobFound }) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await tenantSearchService.findDocument(query);
      onJobFound(res.data.data); // Pass the found document up
      toast.success(`Loaded ${res.data.data.type} #${query}`);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to find job.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-grow">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Scan or Enter Ticket/Invoice ID..." className="pl-9 h-10" />
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Searching..." : "Re-open"}
      </Button>
    </form>
  );
};
export default JobRecall;
