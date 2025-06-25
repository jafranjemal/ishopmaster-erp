import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui-library";
import { PlusCircle, Trash2 } from "lucide-react";
import useAuth from "../../context/useAuth";

const PaymentForm = ({
  amountDue,
  paymentMethods = [],
  onSave,
  onCancel,
  isSaving,
  paymentDirection,
}) => {
  const { formatCurrency } = useAuth();
  const [paymentLines, setPaymentLines] = useState([]);
  const [notes, setNotes] = useState("");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (paymentMethods.length > 0 && paymentLines.length === 0) {
      setPaymentLines([
        {
          id: Date.now(),
          paymentMethodId: "",
          amount: parseFloat(amountDue.toFixed(2)),
          referenceNumber: "",
          bankName: "",
          chequeDate: "",
        },
      ]);
    }
  }, [paymentMethods, amountDue, paymentLines.length]);

  const totalPaid = useMemo(
    () => paymentLines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    [paymentLines]
  );
  const remainingAmount = amountDue - totalPaid;

  const isFormValid = useMemo(() => {
    if (
      paymentLines.length === 0 ||
      totalPaid <= 0 ||
      totalPaid > amountDue + 0.001
    )
      return false;
    return paymentLines.every(
      (line) => line.paymentMethodId && line.amount > 0
    );
  }, [totalPaid, amountDue, paymentLines]);

  const handleAddLine = () =>
    setPaymentLines((prev) => [
      ...prev,
      {
        id: Date.now(),
        paymentMethodId: "",
        amount: Math.max(0, parseFloat(remainingAmount.toFixed(2))),
        referenceNumber: "",
        bankName: "",
        chequeDate: "",
      },
    ]);
  const handleRemoveLine = (id) =>
    setPaymentLines((prev) => prev.filter((line) => line.id !== id));
  const handleLineChange = (id, field, value) =>
    setPaymentLines((prev) =>
      prev.map((line) => (line.id === id ? { ...line, [field]: value } : line))
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    const linesToSave = paymentLines.map(({ id, ...rest }) => rest);
    onSave({
      paymentLines: linesToSave,
      notes,
      paymentDate,
      direction: paymentDirection,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Date</Label>
          <Input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </div>
        <div className="text-right">
          <Label>Amount Due</Label>
          <div className="text-2xl font-bold font-mono">
            {formatCurrency(amountDue)}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        {paymentLines.map((line) => {
          const selectedMethod = paymentMethods.find(
            (m) => m._id === line.paymentMethodId
          );
          return (
            <div
              key={line.id}
              className="p-4 rounded-lg bg-slate-900/50 space-y-4 relative border border-slate-700"
            >
              {paymentLines.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={() => handleRemoveLine(line.id)}
                >
                  <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-500" />
                </Button>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`paymentMethodId-${line.id}`}>
                    Payment Method
                  </Label>
                  <Select
                    onValueChange={(val) =>
                      handleLineChange(line.id, "paymentMethodId", val)
                    }
                    value={line.paymentMethodId}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor={`amount-${line.id}`}>Amount</Label>
                  <Input
                    id={`amount-${line.id}`}
                    type="number"
                    step="0.01"
                    value={line.amount}
                    onChange={(e) =>
                      handleLineChange(line.id, "amount", e.target.value)
                    }
                    required
                  />
                </div>
              </div>
              {selectedMethod?.type === "cheque" && (
                <div className="space-y-4 border-t border-slate-700 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-slate-300">
                    Cheque Details
                  </h4>
                  <div>
                    <Label htmlFor={`referenceNumber-${line.id}`}>
                      Cheque Number
                    </Label>
                    <Input
                      id={`referenceNumber-${line.id}`}
                      value={line.referenceNumber}
                      onChange={(e) =>
                        handleLineChange(
                          line.id,
                          "referenceNumber",
                          e.target.value
                        )
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`bankName-${line.id}`}>Bank Name</Label>
                      <Input
                        id={`bankName-${line.id}`}
                        value={line.bankName}
                        onChange={(e) =>
                          handleLineChange(line.id, "bankName", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor={`chequeDate-${line.id}`}>
                        Cheque Date
                      </Label>
                      <Input
                        id={`chequeDate-${line.id}`}
                        type="date"
                        value={line.chequeDate}
                        onChange={(e) =>
                          handleLineChange(
                            line.id,
                            "chequeDate",
                            e.target.value
                          )
                        }
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
              {selectedMethod?.type === "card" && (
                <div>
                  <Label htmlFor={`referenceNumber-${line.id}`}>
                    Card TXN ID (Optional)
                  </Label>
                  <Input
                    id={`referenceNumber-${line.id}`}
                    value={line.referenceNumber}
                    onChange={(e) =>
                      handleLineChange(
                        line.id,
                        "referenceNumber",
                        e.target.value
                      )
                    }
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddLine}
          disabled={remainingAmount <= 0}
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Split Payment
        </Button>
        <div className="text-right">
          <p className="text-sm text-slate-400">Total Paid / Remaining</p>
          <p
            className={`font-bold text-lg font-mono ${
              !isFormValid && totalPaid > 0 ? "text-red-500" : "text-slate-100"
            }`}
          >
            {formatCurrency(totalPaid)} / {formatCurrency(remainingAmount)}
          </p>
        </div>
      </div>
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          name="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div className="pt-4 flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSaving || !isFormValid}>
          {isSaving ? "Saving..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
};
export default PaymentForm;
