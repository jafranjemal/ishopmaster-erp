import React from "react";
import { Button, Card, CardContent, CardHeader, CardTitle } from "ui-library";
import { FileUploader } from "ui-library";
import { tenantUploadService } from "../../../../services/api";
import { Trash2, FileText } from "lucide-react";

const EmployeeDocumentManager = ({ documents = [], onChange, onSave, isSaving }) => {
  const handleUploadComplete = (uploadedFiles) => {
    onChange([...documents, ...uploadedFiles]);
  };

  const handleRemoveDocument = (urlToRemove) => {
    onChange(documents.filter((doc) => doc.url !== urlToRemove));
  };

  const handleSaveChanges = () => {
    onSave({ documents });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Uploaded Documents</h4>
          <div className="space-y-2">{documents.length === 0 && <p className="text-xs text-slate-400">No documents uploaded yet.</p>}</div>
          {documents.map((doc, index) => {
            const fileExtension = doc.url?.split(".").pop().toLowerCase();
            const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(fileExtension);
            const isPDF = fileExtension === "pdf";

            return (
              <div key={index} className="flex items-start gap-4 p-3 bg-slate-800 rounded-md">
                <div className="w-20 h-20 flex-shrink-0 border border-slate-700 rounded overflow-hidden bg-slate-900">
                  {isImage ? (
                    <img src={doc.url} alt={doc.name} className="object-cover w-full h-full" />
                  ) : isPDF ? (
                    <iframe src={doc.url} title={doc.name} className="w-full h-full" />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full">
                      <FileText className="h-6 w-6 text-slate-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-indigo-400 hover:underline truncate"
                    title={doc.name}
                  >
                    {doc.name}
                  </a>
                  <Button variant="ghost" size="icon" className="mt-1 h-7 w-7" onClick={() => handleRemoveDocument(doc.url)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Upload New Document</h4>
          <FileUploader onUploadComplete={handleUploadComplete} getSignatureFunc={tenantUploadService.getCloudinarySignature} multiple />
        </div>

        <div className="pt-4 flex justify-end">
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Document Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeDocumentManager;
