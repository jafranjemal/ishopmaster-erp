// BreadcrumbNavigator.jsx
import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Button } from 'ui-library';

const BreadcrumbNavigator = ({ path, onNavigate }) => {
  // Create a deduplicated path array
  const deduplicatedPath = [];
  const seenIds = new Set();

  for (const item of path) {
    const itemId = item.item._id || item.item.name;
    if (!seenIds.has(itemId)) {
      seenIds.add(itemId);
      deduplicatedPath.push(item);
    }
  }

  return (
    <div className='flex items-center overflow-x-auto py-1 scrollbar-hide'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => onNavigate(-1)}
        className='px-2 py-1 text-sm text-slate-300 hover:text-blue-300'
      >
        ERP Root
      </Button>

      {deduplicatedPath.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className='h-4 w-4 mx-1 text-slate-500 flex-shrink-0' />
          <Button
            variant='ghost'
            size='sm'
            onClick={() => onNavigate(index)}
            className={`px-2 py-1 text-sm truncate max-w-[140px] ${
              index === deduplicatedPath.length - 1
                ? 'text-blue-400 font-semibold'
                : 'text-slate-400 hover:text-blue-300'
            }`}
          >
            {item.item.name || 'Untitled'}
          </Button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default BreadcrumbNavigator;
