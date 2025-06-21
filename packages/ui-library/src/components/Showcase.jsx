import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Button } from "./Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "./Card";
import { Badge } from "./Badge";
import { Input } from "./Input";
import { Label } from "./Label";
import Modal from "./Modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";

import {
  Home,
  Settings,
  Users,
  PlusCircle,
  Trash2,
  FilePenLine,
} from "lucide-react";

const invoices = [
  {
    invoice: "INV001",
    status: "Paid",
    method: "Credit Card",
    amount: "$250.00",
  },
  { invoice: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  {
    invoice: "INV003",
    status: "Paid",
    method: "Bank Transfer",
    amount: "$350.00",
  },
];
const Showcase = () => {
  const notify = () => toast.success("Action completed successfully!");
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="p-10 space-y-8">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e293b", // slate-800
            color: "#f1f5f9", // slate-100
            border: "1px solid #334155", // slate-700
          },
        }}
      />

      <h1 className="text-3xl font-bold">Component Showcase</h1>

      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </CardContent>
      </Card>

      {/* NEW Iconography Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Iconography & Visual Language</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <h4 className="font-semibold text-slate-100">Guiding Rules:</h4>
            <ul className="list-disc list-inside mt-2 text-sm text-slate-400">
              <li>Default Size: 20px (uses `h-5 w-5` Tailwind classes)</li>
              <li>Default Stroke Width: 1.5px</li>
              <li>
                Import icons individually for tree-shaking: `import {"{ Home }"}{" "}
                from 'lucide-react'`
              </li>
            </ul>
          </div>
          <div className="mt-6 grid grid-cols-6 gap-6 text-slate-300">
            <div className="flex flex-col items-center gap-2">
              <Home size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">Home</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Users size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">Users</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Settings size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">Settings</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <PlusCircle size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">PlusCircle</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FilePenLine size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">FilePenLine (Edit)</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Trash2 size={24} strokeWidth={1.5} />{" "}
              <span className="text-xs">Trash2 (Delete)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Updated Buttons Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons (with Icons)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Create New
          </Button>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" /> Delete Item
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Badge>Default</Badge>
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Canceled</Badge>
          <Badge variant="outline">Outline</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={notify}>Show Notification</Button>
        </CardContent>
      </Card>

      {/* New Form Elements Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" placeholder="email@example.com" />
          </div>
        </CardContent>
      </Card>

      {/* New Modal Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </CardContent>
      </Card>

      {/* New Table Showcase */}
      <Card>
        <CardHeader>
          <CardTitle>Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice}>
                  <TableCell className="font-medium">
                    {invoice.invoice}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "Paid" ? "success" : "warning"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.method}</TableCell>
                  <TableCell className="text-right">{invoice.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Item"
        description="Fill in the details below to create a new item in your inventory."
        footer={
          <div className="flex justify-end space-x-4 w-full">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                notify();
              }}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name</Label>
            <Input id="name" placeholder="e.g., iPhone Screen Protector" />
          </div>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" placeholder="e.g., A-123-XYZ" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Showcase;
