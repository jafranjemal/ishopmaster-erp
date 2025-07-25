import { History, User, X } from 'lucide-react';
import { Button, Card, CardContent } from 'ui-library';
import CustomerSearch from '../crm/CustomerSearch';

const CustomerContext = ({ customer, onSelectCustomer, onClearCustomer, onViewHistory, onEdit, onNew }) => {
  if (customer && customer.name !== 'Walking Customer') {
    return (
      <Card>
        <CardContent className='p-3 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <User className='h-6 w-6 text-indigo-400' />
            <div>
              <p className='font-semibold'>{customer.name}</p>
              <p className='text-sm text-slate-400'>{customer.phone}</p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <div className='flex items-center flex-shrink-0'>
              <Button variant='ghost' size='sm' onClick={onEdit}>
                Edit
              </Button>
              <Button variant='ghost' size='sm' onClick={onNew}>
                New
              </Button>
            </div>
            <Button variant='outline' size='sm' onClick={onViewHistory}>
              <History className='h-4 w-4 mr-2' />
              View History
            </Button>
            <Button variant='ghost' size='icon' onClick={onClearCustomer}>
              <X className='h-4 w-4' />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  return <CustomerSearch onSelectCustomer={onSelectCustomer} />;
};
export default CustomerContext;
