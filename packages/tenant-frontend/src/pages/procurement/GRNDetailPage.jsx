import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantGrnService } from "../../services/api";
import { ArrowLeft } from "lucide-react";
import GRNDetailView from "../../components/procurement/GRNDetailView";

const GRNDetailPage = () => {
  const { id: grnId } = useParams();
  const [grn, setGrn] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantGrnService.getById(grnId);
      setGrn(response.data.data);
    } catch (error) {
      toast.error("Failed to load GRN details.");
    } finally {
      setIsLoading(false);
    }
  }, [grnId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading)
    return <div className="p-8 text-center">Loading Goods Receipt Note...</div>;
  if (!grn)
    return (
      <div className="p-8 text-center text-red-400">
        Goods Receipt Note not found.
      </div>
    );

  return (
    <div className="space-y-6">
      <Link
        to="/procurement/receipts"
        className="flex items-center text-sm text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to All Goods Receipts
      </Link>
      <GRNDetailView grn={grn} />
    </div>
  );
};
export default GRNDetailPage;
