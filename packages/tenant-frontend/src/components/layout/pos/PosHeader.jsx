import { Box, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from 'ui-library';
import { usePosSession } from '../../../context/PosSessionContext';
import { tenantSalesService } from '../../../services/api';

const PosHeader = () => {
  const [heldSales, setHeldSales] = useState([]);
  const { handleRecallSale, handleDeleteHeldSale } = usePosSession(); // Get delete handler from context

  const fetchHeldSales = async () => {
    const res = await tenantSalesService.getHeldSales();
    setHeldSales(res.data.data);
  };

  return (
    <DropdownMenu onOpenChange={fetchHeldSales}>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Box className='h-4 w-4 mr-2' />
          Held Sales ({heldSales.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {heldSales.length === 0 && <DropdownMenuItem disabled>No sales on hold</DropdownMenuItem>}
        {heldSales.map((sale) => (
          <DropdownMenuItem key={sale._id} onSelect={(e) => e.preventDefault()}>
            <div className='flex justify-between items-center w-full'>
              <span onClick={() => handleRecallSale(sale)} className='flex-grow cursor-pointer'>
                {sale.customerId?.name || 'Walk-in'} - {sale.invoiceNumber || sale.draftId}
              </span>
              {/* --- THE DEFINITIVE FIX: DELETE BUTTON --- */}
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-red-500 hover:bg-red-500/10'
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteHeldSale(sale._id);
                }}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default PosHeader;
