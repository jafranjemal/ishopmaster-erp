import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { tenantStockService, tenantProductService } from "../../services/api"; // Add tenantProductService
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  Pagination,
  Modal,
  CardHeader,
  CardTitle,
} from "ui-library";
import StockDetailHeader from "../../components/inventory/StockDetailHeader";
import StockMovementList from "../../components/inventory/StockMovementList";
import SourceDocumentViewer from "../../components/inventory/SourceDocumentViewer";

const StockDetailPage = () => {
  const { variantId } = useParams();
  const [variant, setVariant] = useState(null);
  const [details, setDetails] = useState(null);
  const [movements, setMovements] = useState([]);
  const [paginationData, setPaginationData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [modalContent, setModalContent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page: currentPage, limit: 20 };

      const [detailsRes, movementsRes, variantRes] = await Promise.all([
        tenantStockService.getDetails(variantId),
        tenantStockService.getMovements(variantId, params),
        currentPage === 1
          ? tenantProductService.getVariantById(variantId)
          : Promise.resolve(null), // Fetch variant details only once
      ]);

      if (detailsRes) setDetails(detailsRes.data.data);
      if (variantRes) setVariant(variantRes.data.data);
      setMovements(movementsRes.data.data);
      setPaginationData(movementsRes.data.pagination);
    } catch (error) {
      toast.error("Failed to load stock details.");
    } finally {
      setIsLoading(false);
    }
  }, [variantId, currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePageChange = (newPage) => {
    if (newPage !== currentPage) setCurrentPage(newPage);
  };

  const handleViewSourceOld = (movement) => {
    // For now, we just show the raw data in a modal.
    // In a future step, this would render a proper component.
    setModalContent(
      movement.relatedPurchaseId ||
        movement.relatedSaleId || { info: "No detailed source document." }
    );
  };

  const handleViewSource = (movement) => {
    // --- 2. UPDATE THIS HANDLER to set both the document and its type ---
    if (movement.relatedPurchaseId) {
      setModalContent({
        isOpen: true,
        doc: movement.relatedPurchaseId,
        type: "PurchaseOrder",
      });
    } else if (movement.relatedSaleId) {
      // This logic is for the future
      setModalContent({
        isOpen: true,
        doc: movement.relatedSaleId,
        type: "SalesInvoice",
      });
    } else {
      toast.error("No source document found for this movement.");
    }
  };

  if (isLoading && !variant)
    return <p className="p-8 text-center">Loading Stock Details...</p>;

  return (
    <div className="space-y-6">
      <Link
        to="/inventory/stock-levels"
        className="flex items-center text-sm text-indigo-400 hover:underline"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Stock Levels
      </Link>

      {details && <StockDetailHeader details={details} variant={variant} />}

      <Card>
        <CardContent className="p-0">
          <h3 className="p-4 font-semibold text-lg border-b border-slate-700">
            Movement History
          </h3>
          {isLoading ? (
            <p className="p-4">Loading movements...</p>
          ) : (
            <StockMovementList
              movements={movements}
              onViewSource={handleViewSource}
            />
          )}
          {paginationData && (
            <Pagination
              paginationData={paginationData}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
      {modalContent && (
        <Modal
          isOpen={modalContent?.isOpen}
          onClose={() =>
            setModalContent({ isOpen: false, doc: null, type: "" })
          }
          title="Source Document Details"
        >
          {modalContent.type && modalContent.doc && (
            <SourceDocumentViewer
              document={modalContent.doc}
              type={modalContent.type}
            />
          )}
        </Modal>
      )}

      {/* <Modal
        isOpen={!!modalContent}
        onClose={() => setModalContent(null)}
        title="Source Document Details"
      >
        <div className="space-y-4 text-sm text-slate-200">
          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-medium text-slate-400">PO Number</span>
            <span className="font-mono text-slate-100">
              {modalContent?.poNumber}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-medium text-slate-400">Supplier</span>
            <span className="font-mono text-slate-100">
              {modalContent?.supplierId?.name}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-700 pb-2">
            <span className="font-medium text-slate-400">Total Amount</span>
            <span className="font-mono text-green-400">
              Rs. {modalContent?.totalAmount?.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium text-slate-400">Document ID</span>
            <span className="font-mono text-xs text-slate-500">
              {modalContent?._id}
            </span>
          </div>
        </div>
      </Modal> */}
    </div>
  );
};

export default StockDetailPage;
