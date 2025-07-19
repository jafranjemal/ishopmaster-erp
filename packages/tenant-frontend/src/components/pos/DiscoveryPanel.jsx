import React, { useState } from 'react';
import WorkspaceTabs from './WorkspaceTabs';
import HierarchyWizard from './wizard/HierarchyWizard';
import { Skeleton } from 'ui-library';

import { tenantCategoryService } from '../../services/api';
import useAuth from '../../context/useAuth';

const DiscoveryPanel = ({ onItemsSelected, onAddItem }) => {
  const [activeTab, setActiveTab] = useState('REPAIRS');
  const { tenantProfile } = useAuth();
  const [rootCategories, setRootCategories] = useState(null);
  const [loadingRoots, setLoadingRoots] = useState(true);

  // Fetch root categories once on mount
  React.useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        // This should be implemented in your api.js
        const response = await tenantCategoryService.getChildren('root');
        console.log('response ', response);
        setRootCategories({
          REPAIRS: response.data.find((cat) => cat.name === 'Services'),
          ACCESSORIES: response.data.find((cat) => cat.name === 'Products'),
          TRADE_IN: response.data.find((cat) => cat.name === 'Trade-Ins'),
          MISCELLANEOUS: response.data.find((cat) => cat.name === 'Miscellaneous'),
        });
      } catch (error) {
        console.error('Failed to load root categories:', error);
      } finally {
        setLoadingRoots(false);
      }
    };

    fetchRootCategories();
  }, [tenantProfile]);

  if (loadingRoots) {
    return (
      <div className='bg-slate-800 rounded-lg h-full flex flex-col p-4 gap-4'>
        <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className='flex-grow overflow-y-auto pt-4 border-t border-slate-700 flex items-center justify-center'>
          <Skeleton className='w-full h-64' />
        </div>
      </div>
    );
  }

  return (
    <div className='bg-slate-800 rounded-lg h-full flex flex-col p-4 gap-4'>
      <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />
      <div className='flex-grow overflow-y-auto pt-4 border-t border-slate-700'>
        <HierarchyWizard
          key={activeTab}
          startMode={activeTab}
          rootCategory={rootCategories[activeTab]}
          onItemsSelected={onItemsSelected}
          onAddItem={onAddItem}
        />
      </div>
    </div>
  );
};

export default DiscoveryPanel;
