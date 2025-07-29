import { Tabs, TabsContent, TabsList, TabsTrigger } from '@radix-ui/react-tabs';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Modal, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'ui-library';
import useAuth from '../../context/useAuth';
import { tenantHrService, tenantRepairService } from '../../services/api';
import DiscoveryPanel from '../pos/DiscoveryPanel';
import AddLaborForm from './AddLaborForm';

/**
 * The definitive, interactive "workbench" for a technician to manage a repair's job sheet.
 * It allows adding parts, services, and labor, and removing any item.
 *
 * @param {object} props
 * @param {object} props.ticket - The full repair ticket object.
 * @param {Function} props.onUpdate - Callback to notify the parent page of any changes to the ticket.
 */
const JobSheetEditor = ({ ticket, onUpdate, isLocked = false }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const { user, formatCurrency } = useAuth();

  // Fetch the list of technicians only when the user intends to open the modal.
  useEffect(() => {
    if (isAddModalOpen && technicians.length === 0) {
      tenantHrService
        .getAllEmployees()
        .then((res) => {
          // Pre-filter for employees who are technicians to populate the labor form.
          const techEmployees = res.data.data.employees.filter((emp) =>
            emp.jobPositionId?.title.toLowerCase().includes('technician'),
          );
          setTechnicians(techEmployees);
        })
        .catch(() => toast.error('Could not load list of technicians.'));
    }
  }, [isAddModalOpen, technicians.length]);

  /**
   * Handles adding any type of item (part, service, or labor) to the job sheet.
   * This single function is used by both the DiscoveryPanel and the AddLaborForm.
   */
  const handleAddItem = async (itemData) => {
    setIsSaving(true);

    // Normalize to array for uniform handling
    const items = Array.isArray(itemData) ? itemData : [itemData];

    try {
      for (const item of items) {
        console.log('Processing item:', item);

        const isLabor = item.itemType === 'labor';

        const payload =
          isLabor || (item && item.productVariantId)
            ? item
            : {
                itemType: item.templateId?.type === 'service' ? 'service' : 'part',
                productVariantId: item._id,
                description: item.variantName,
                quantity: 1,
                serialNumber: item.serialNumber,
              };

        console.log('Payload to send:', payload);

        if (!ticket?._id) {
          throw new Error('Ticket ID is missing.');
        }

        await toast.promise(tenantRepairService.addItemToJobSheet(ticket._id, payload), {
          loading: 'Adding item to job sheet...',
          success: 'Item added successfully!',
          error: (err) => err.response?.data?.error || 'Failed to add item.',
        });
      }

      onUpdate(); // optionally refresh the whole ticket data after all additions
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Error adding items:', err);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handles removing an item from the job sheet.
   */
  const handleRemoveItem = async (itemId) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this item from the job sheet? This will release any stock reservation.',
      )
    )
      return;

    setIsSaving(true);
    try {
      const res = await toast.promise(tenantRepairService.removeItemFromJobSheet(ticket._id, itemId), {
        loading: 'Removing item...',
        success: 'Item removed successfully!',
        error: (err) => err.response?.data?.error || 'Failed to remove item.',
      });
      onUpdate(res.data.data);
    } catch (err) {
      // Error is handled by the toast promise.
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className='flex justify-end mb-4'>
        <Button onClick={() => setIsAddModalOpen(true)} disabled={isSaving || isLocked}>
          <PlusCircle className='h-4 w-4 mr-2' />
          Add Part / Labor
        </Button>
      </div>

      <div className='border border-slate-700 rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item/Service/Labor</TableHead>
              <TableHead className='text-center'>Qty</TableHead>
              <TableHead className='text-right'>Price</TableHead>
              <TableHead className='w-12'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ticket.jobSheet.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className='text-center h-24 text-slate-400'>
                  No parts or services added yet.
                </TableCell>
              </TableRow>
            )}
            {ticket.jobSheet &&
              ticket.jobSheet.map((item, i) => (
                <TableRow key={item._id || i}>
                  <TableCell className='font-medium'>{item.description}</TableCell>
                  <TableCell className='text-center'>{item.quantity || item.laborHours}</TableCell>
                  <TableCell className='text-right font-mono'>
                    {(() => {
                      const total = (item.unitPrice || item.laborRate || 0) * (item.quantity || item.laborHours || 0);
                      return total > 0 ? formatCurrency(total) : 'free';
                    })()}
                  </TableCell>
                  <TableCell>
                    {item._id}
                    <Button
                      disabled={isSaving || isLocked}
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveItem(item.description)}
                    >
                      <Trash2 className='h-4 w-4 text-red-500' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title='Add to Job Sheet' size='3xl'>
        <Tabs defaultValue='part' className='w-full'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='part'>Add Part / Service</TabsTrigger>
            <TabsTrigger value='labor'>Add Labor</TabsTrigger>
          </TabsList>
          <TabsContent value='part' className='h-[60vh] mt-4'>
            <DiscoveryPanel onAddItem={handleAddItem} />
          </TabsContent>
          <TabsContent value='labor' className='mt-4'>
            <AddLaborForm
              onSave={handleAddItem}
              onCancel={() => setIsAddModalOpen(false)}
              isSaving={isSaving}
              technicians={technicians}
              defaultEmployeeId={ticket.assignedTo?._id || user.employeeId}
            />
          </TabsContent>
        </Tabs>
      </Modal>
    </div>
  );
};

export default JobSheetEditor;
