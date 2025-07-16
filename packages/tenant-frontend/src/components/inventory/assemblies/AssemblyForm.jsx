import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from 'ui-library';

import SerialSelectorModal from '../printing/SerialSelectorModal';
import { Edit, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ProductVariantSearch from '../../procurement/ProductVariantSearch';

const AssemblyForm = ({ branches, onSave, isSaving }) => {
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [fromBranchId, setFromBranchId] = useState('');
  const [quantityToAssemble, setQuantityToAssemble] = useState(1);
  // State to hold the selected serials for each component, e.g., { 'componentVariantId': ['SERIAL1', 'SERIAL2'] }
  const [componentSelections, setComponentSelections] = useState({});
  const [serialModalState, setSerialModalState] = useState({ isOpen: false, component: null });

  // When the user changes the quantity to assemble, we must reset the serial number selections
  // as the required number has now changed.
  useEffect(() => {
    setComponentSelections({});
  }, [quantityToAssemble, selectedBundle]);

  const handleProductSelect = (variant) => {
    if (variant.templateId?.type !== 'bundle') {
      toast.error("Please select a 'Bundle' type product to assemble.");
      return;
    }
    setSelectedBundle(variant);
    setQuantityToAssemble(1); // Reset quantity on new bundle selection
    setComponentSelections({});
  };

  const handleEditSerials = (component) => {
    setSerialModalState({
      isOpen: true,
      component: component,
      initialSelection: componentSelections[component._id] || [],
    });
  };

  const handleSerialsConfirm = (selectedSerials) => {
    const { component } = serialModalState;
    setComponentSelections((prev) => ({
      ...prev,
      [component._id]: selectedSerials,
    }));
    setSerialModalState({ isOpen: false, component: null });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      bundleVariantId: selectedBundle._id,
      branchId: fromBranchId,
      quantityToAssemble,
      componentSelections,
    };
    onSave(payload);
  };

  // This validation logic is the "brain" of the form.
  const isFormInvalid = useMemo(() => {
    if (isSaving || !selectedBundle || !fromBranchId || !quantityToAssemble || quantityToAssemble <= 0) return true;

    // Check if every serialized component has the correct number of serials selected
    for (const component of selectedBundle.templateId.bundleItems) {
      const isSerialized = component.productVariantId.templateId?.type === 'serialized';
      if (isSerialized) {
        const requiredQty = component.quantity * quantityToAssemble;
        const selectedQty = componentSelections[component._id]?.length || 0;
        if (requiredQty !== selectedQty) return true; // If any serialized component is not fully selected, form is invalid
      }
    }
    return false; // If all checks pass, the form is valid
  }, [selectedBundle, fromBranchId, quantityToAssemble, componentSelections, isSaving]);

  return (
    <>
      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid md:grid-cols-2 gap-4'>
          <div>
            <Label>1. Select Bundle to Assemble</Label>
            {selectedBundle ? (
              <div className='flex items-center justify-between p-3 bg-slate-800 rounded-md mt-1'>
                <span className='font-medium'>{selectedBundle.variantName}</span>
                <Button size='sm' variant='link' onClick={() => setSelectedBundle(null)}>
                  Change
                </Button>
              </div>
            ) : (
              <ProductVariantSearch onProductSelect={handleProductSelect} />
            )}
          </div>
          <div>
            <Label htmlFor='fromBranchId'>2. Assemble at Branch</Label>
            <Select onValueChange={setFromBranchId} value={fromBranchId} required>
              <SelectTrigger id='fromBranchId'>
                <SelectValue placeholder='Select location...' />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b._id} value={b._id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className={!selectedBundle || !fromBranchId ? 'opacity-50 pointer-events-none' : ''}>
          <Card>
            <CardHeader>
              <CardTitle>3. Configure Assembly</CardTitle>
              <CardDescription>Specify quantity and select specific components if required.</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='quantityToAssemble'>Quantity of Kits to Assemble</Label>
                <Input
                  id='quantityToAssemble'
                  type='number'
                  min='1'
                  value={quantityToAssemble}
                  onChange={(e) => setQuantityToAssemble(Math.max(1, Number(e.target.value)))}
                />
              </div>
              <div className='border-t border-slate-700 pt-4'>
                <h4 className='font-semibold mb-2 text-slate-300'>
                  Required Components for {quantityToAssemble} Kit(s):
                </h4>
                <div className='space-y-2'>
                  {selectedBundle?.templateId.bundleItems.map((component) => {
                    console.log({ component });
                    const isSerialized = component.templateId?.type === 'serialized';
                    const requiredQty = component.quantity * quantityToAssemble;
                    const selectedQty = componentSelections[component._id]?.length || 0;
                    const isComponentComplete = requiredQty === selectedQty;

                    return (
                      <div
                        key={component._id}
                        className='flex justify-between items-center p-3 bg-slate-900/50 rounded-md'
                      >
                        <div>
                          <p className='font-medium'>{component.variantName}</p>
                          <p className='text-xs text-slate-400'>Total Required: {requiredQty}</p>
                        </div>
                        {isSerialized ? (
                          <div className='flex items-center gap-2'>
                            <Badge variant={isComponentComplete ? 'success' : 'destructive'}>
                              {isComponentComplete ? (
                                <CheckCircle className='h-3 w-3 mr-1' />
                              ) : (
                                <XCircle className='h-3 w-3 mr-1' />
                              )}
                              {selectedQty} / {requiredQty} Selected
                            </Badge>
                            <Button
                              type='button'
                              size='sm'
                              variant='outline'
                              onClick={() => handleEditSerials(component)}
                            >
                              <Edit className='h-3 w-3 mr-1' /> Select Serials
                            </Button>
                          </div>
                        ) : (
                          <Badge variant='secondary'>Non-Serialized</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='pt-4 flex justify-end'>
          <Button type='submit' disabled={isFormInvalid}>
            <CheckCircle className='h-4 w-4 mr-2' />
            {isSaving ? 'Assembling...' : 'Complete Assembly'}
          </Button>
        </div>
      </form>

      {serialModalState.isOpen && (
        <SerialSelectorModal
          isOpen={true}
          onClose={() => setSerialModalState({ isOpen: false, component: null })}
          onConfirm={handleSerialsConfirm}
          productVariantId={serialModalState.component._id}
          branchId={fromBranchId}
          initialSelection={serialModalState.initialSelection}
          allowMultiple={true}
          maxSelection={serialModalState.component.quantity * quantityToAssemble}
        />
      )}
    </>
  );
};
export default AssemblyForm;
