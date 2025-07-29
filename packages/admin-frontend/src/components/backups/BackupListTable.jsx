import { RotateCcw } from "lucide-react";
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "ui-library";
import { formatDate } from "../../lib/formatters";

const getStatusVariant = (status) => {
  switch (status) {
    case "success":
      return "success";
    case "restore_success":
      return "success";
    default:
      return "destructive";
  }
};
const BackupListTable = ({ records, onRestore }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tenant</TableHead>
          <TableHead>Backup Date</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Trigger</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {records.map((record) => (
          <BackupRow key={record._id} record={record} onRestore={onRestore} />
        ))}
      </TableBody>
    </Table>
  );
};

const BackupRow = ({ record, onRestore }) => (
  <TableRow>
    <TableCell className="font-medium text-white">{record.tenant?.companyName || "N/A"}</TableCell>
    <TableCell>{formatDate(record.createdAt)}</TableCell>
    <TableCell className="font-mono">{formatBytes(record.fileSize)}</TableCell>
    <TableCell className="capitalize">{record.triggeredBy.replace("_", " ")}</TableCell>
    <TableCell className="text-center">
      <Badge variant={getStatusVariant(record.status)}>{record.status}</Badge>
    </TableCell>
    <TableCell className="text-right">{record.status === "success" && <RestoreButton record={record} onRestore={onRestore} />}</TableCell>
  </TableRow>
);

const RestoreButton = ({ record, onRestore }) => (
  <Button variant="outline" size="sm" onClick={() => onRestore(record)}>
    <RotateCcw size={14} className="mr-2" />
    Restore
  </Button>
);

// Helper function (could be moved to formatters.js)
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals) + " " + sizes[i]);
};

export default BackupListTable;
