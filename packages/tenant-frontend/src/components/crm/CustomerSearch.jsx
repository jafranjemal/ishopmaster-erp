import { LoaderCircle, Search, User, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, Card, CardContent, Input } from 'ui-library';
import { useDebounce } from '../../hooks/useDebounce';
import { tenantCustomerService } from '../../services/api';

/**
 * The definitive, self-contained component for searching and selecting a customer.
 * It manages its own search state and communicates the final selection back to its parent.
 */
const CustomerSearch = ({ onSelectCustomer, initialCustomer = null }) => {
  const [selectedCustomer, setSelectedCustomer] = useState(initialCustomer);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const searchContainerRef = useRef(null);

  const searchCustomers = useCallback(async () => {
    if (debouncedSearchTerm.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await tenantCustomerService.getAll({ search: debouncedSearchTerm, limit: 10 });
      setResults(res.data.data);
    } catch (error) {
      console.error('Customer search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    searchCustomers();
  }, [searchCustomers]);

  // Handle clicks outside the component to close the results dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (customer) => {
    setSearchTerm('');
    setResults([]);
    setSelectedCustomer(customer);
    onSelectCustomer(customer); // Notify parent component
    setIsFocused(false);
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    onSelectCustomer(null); // Notify parent component
  };

  // If a customer is already selected, show their details and a "Change" button.
  if (selectedCustomer) {
    return (
      <Card>
        <CardContent className='p-3 flex justify-between items-center'>
          <div className='flex items-center gap-3'>
            <User className='h-6 w-6 text-indigo-400 flex-shrink-0' />
            <div>
              <p className='font-semibold'>{selectedCustomer.name}</p>
              <p className='text-sm text-slate-400'>{selectedCustomer.phone}</p>
            </div>
          </div>
          <Button variant='outline' size='sm' onClick={handleClear}>
            <X className='h-4 w-4 mr-2' /> Change Customer
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Otherwise, show the search input and results.
  return (
    <div className='relative' ref={searchContainerRef}>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none' />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder='Search by name or phone number...'
          className='pl-9'
          required
        />
      </div>

      {isFocused && searchTerm.length > 1 && (
        <div className='absolute z-30 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
          {isLoading && (
            <div className='p-4 text-center text-slate-400 flex items-center justify-center'>
              <LoaderCircle className='h-5 w-5 animate-spin mr-2' /> Searching...
            </div>
          )}
          {!isLoading && results.length === 0 && debouncedSearchTerm.length > 1 && (
            <div className='p-4 text-center text-slate-500'>No customers found.</div>
          )}
          {!isLoading &&
            results.map((customer) => (
              <div
                key={customer._id}
                onClick={() => handleSelect(customer)}
                className='p-3 hover:bg-indigo-600/20 cursor-pointer border-b border-slate-700 last:border-b-0'
              >
                <p className='font-semibold'>{customer.name}</p>
                <p className='text-sm text-slate-400'>{customer.phone}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CustomerSearch;
