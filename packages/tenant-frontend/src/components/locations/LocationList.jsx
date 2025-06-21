import React from "react";
import {
  FilePenLine,
  Trash2,
  CheckCircle2,
  Building,
  Warehouse as WarehouseIcon,
} from "lucide-react";
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "ui-library";

const LocationList = ({ branches, warehouses, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Branches List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="mr-2 h-5 w-5" /> Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Linked Warehouse</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {branch.name}
                      {branch.isPrimary && (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {branch.linkedWarehouseId?.name || "N/A"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit("branch", branch)}
                    >
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete("branch", branch)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Warehouses List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <WarehouseIcon className="mr-2 h-5 w-5" /> Warehouses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse) => (
                <TableRow key={warehouse._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {warehouse.name}
                      {warehouse.isPrimary && (
                        <Badge
                          variant="success"
                          className="flex items-center gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" /> Primary
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {warehouse.address?.city || "N/A"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit("warehouse", warehouse)}
                    >
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete("warehouse", warehouse)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationList;
