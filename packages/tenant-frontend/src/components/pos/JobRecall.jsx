import { Search } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Input } from 'ui-library';
import { tenantSearchService } from '../../services/api';

const JobRecall = ({ onJobFound }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    try {
      const res = await tenantSearchService.findDocument(query);
      onJobFound(res.data.data); // Pass the found { type, document } object up
      setQuery(''); // Clear search on success
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to find document.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className='flex gap-2'>
      <div className='relative flex-grow'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400' />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder='Scan or Enter Ticket/Invoice ID...'
          className='pl-9 h-10'
        />
      </div>
      <Button type='submit' disabled={isLoading}>
        {isLoading ? 'Searching...' : 'Find'}
      </Button>
    </form>
  );
};
export default JobRecall;
