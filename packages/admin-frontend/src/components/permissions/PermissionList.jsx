import React from "react";
import { FilePenLine, Trash2 } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "ui-library";

const PermissionList = ({
  groupedPermissions,
  onEdit,
  onDelete,
  onModuleAdd,
}) => {
  const moduleOrder = [
    "inventory",
    "sales",
    "crm",
    "service",
    "accounting",
    "hr",
    "settings",
  ];

  const sortedModuleKeys = Object.keys(groupedPermissions).sort((a, b) => {
    return moduleOrder.indexOf(a) - moduleOrder.indexOf(b);
  });

  return (
    <div className="space-y-6">
      {sortedModuleKeys.map((moduleName) => (
        <Card key={moduleName}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="capitalize">{moduleName} Module</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onModuleAdd(moduleName)}
            >
              + Add
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-700">
              {groupedPermissions[moduleName].map((permission) => (
                <div
                  key={permission._id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex flex-col">
                    <span className="font-mono text-sm text-amber-300">
                      {permission.key}
                    </span>
                    <p className="text-sm text-slate-400">
                      {permission.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(permission)}
                    >
                      <FilePenLine className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(permission)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PermissionList;
