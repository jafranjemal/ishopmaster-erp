import { Loader2, PlusCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Button, Card, CardContent, Pagination } from "ui-library";
import { adminBackupService, adminTenantService } from "../../services/api";

// Components
import BackupListTable from "../../components/backups/BackupListTable";
import RestoreConfirmationModal from "../../components/backups/RestoreConfirmationModal";
import TriggerBackupModal from "../../components/backups/TriggerBackupModal";

const BackupsPage = () => {
  // State management
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [backupToRestore, setBackupToRestore] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [tenants, setTenants] = useState([]);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);

  // Fetch data handler
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: currentPage, limit: 20 };
      const [backups, tenantList] = await Promise.all([adminBackupService.getAllBackups(params), adminTenantService.getAll()]);

      setRecords(backups.data.data);
      setPagination(backups.data.pagination);
      setTenants(tenantList.data.data);
    } catch (error) {
      toast.error("Failed to load backup records");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle backup restoration
  const handleRestoreClick = (backupRecord) => {
    setBackupToRestore(backupRecord);
    setIsModalOpen(true);
  };

  // Handle manual backup trigger
  const handleTriggerBackup = async (tenantId) => {
    if (!tenantId) {
      toast.error("Please select a tenant");
      return;
    }

    setIsTriggering(true);
    try {
      await toast.promise(adminBackupService.triggerManualBackup(tenantId), {
        loading: "Sending backup request...",
        success: (res) => res.data.message,
        error: (err) => err.response?.data?.error || "Backup trigger failed",
      });
      setIsTriggerModalOpen(false);
      setTimeout(fetchData, 2000); // Refresh after delay
    } finally {
      setIsTriggering(false);
    }
  };

  // Confirm restoration
  const handleConfirmRestore = async () => {
    if (!backupToRestore) return;

    setIsRestoring(true);
    try {
      await toast.promise(adminBackupService.restoreBackup(backupToRestore._id), {
        loading: `Restoring ${backupToRestore.tenant.companyName}...`,
        success: "Restore process started!",
        error: (err) => err.response?.data?.error || "Restore failed",
      });
      setIsModalOpen(false);
      setBackupToRestore(null);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <HeaderSection onTrigger={() => setIsTriggerModalOpen(true)} />

      <BackupContent
        isLoading={isLoading}
        records={records}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onRestore={handleRestoreClick}
      />

      {/* Modals */}
      <RestoreConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRestore}
        isRestoring={isRestoring}
        backupDetails={backupToRestore}
      />

      <TriggerBackupModal
        isOpen={isTriggerModalOpen}
        onClose={() => setIsTriggerModalOpen(false)}
        onConfirm={handleTriggerBackup}
        isTriggering={isTriggering}
        tenants={tenants}
      />
    </div>
  );
};

// Sub-components
const HeaderSection = ({ onTrigger }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold">Database Backups</h1>
      <p className="mt-1 text-slate-400">Manage and restore tenant database backups</p>
    </div>
    <Button onClick={onTrigger}>
      <PlusCircle className="mr-2 h-4 w-4" />
      Trigger Manual Backup
    </Button>
  </div>
);

const BackupContent = ({ isLoading, records, pagination, currentPage, setCurrentPage, onRestore }) => (
  <Card>
    <CardContent className="p-0">
      {isLoading ? (
        <div className="p-8 text-center flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <BackupListTable records={records} onRestore={onRestore} />
          {pagination?.totalPages > 1 && <Pagination paginationData={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />}
        </>
      )}
    </CardContent>
  </Card>
);

export default BackupsPage;
