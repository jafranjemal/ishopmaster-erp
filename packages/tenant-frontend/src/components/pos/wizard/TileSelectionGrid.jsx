import React, { useState, useEffect } from 'react';
import { Card } from 'ui-library';
import { Folder, Wrench, Smartphone, Box, CheckCircle, Clock } from 'lucide-react';
import useAuth from '../../../context/useAuth';

const ICON_MAP = {
  category: Folder,
  device: Smartphone,
  service: Wrench,
  brand: Box,
  product: Box,
};

const STATUS_STYLES = {
  high_stock: { label: 'In Stock', color: 'bg-green-900/60 text-green-300' },
  medium_stock: { label: 'Limited', color: 'bg-yellow-900/60 text-yellow-300' },
  low_stock: { label: 'Low Stock', color: 'bg-orange-900/60 text-orange-300' },
  out_of_stock: { label: 'Out of Stock', color: 'bg-red-900/60 text-red-300' },
  default: { label: 'Check Stock', color: 'bg-slate-700 text-slate-300' },
};

const InventoryBadge = ({ status, itemType }) => {
  // For services and bundles, show availability status instead of stock
  if (itemType === 'service' || itemType === 'bundle') {
    return <span className='text-[10px] px-2 py-0.5 rounded-full bg-green-900/60 text-green-300'>Available</span>;
  }

  const { label, color } = STATUS_STYLES[status] || STATUS_STYLES.default;
  return <span className={`text-[11px] px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
};

const ReservationTimer = ({ expiresAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
      if (secondsLeft <= 0) return setTimeLeft('Expired');
      const minutes = Math.floor(secondsLeft / 60);
      const seconds = secondsLeft % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className='flex items-center text-xs text-blue-300 bg-blue-900/40 px-2 py-1 rounded mt-1'>
      <Clock className='h-3 w-3 mr-1' />
      {timeLeft}
    </div>
  );
};

const TileSelectionGrid = ({
  items = [],
  onSelect,
  itemType = 'category',
  selectedIds = [],
  showPrices = false,
  showReservationTimers = false,
}) => {
  const { formatCurrency } = useAuth();
  const Icon = ICON_MAP[itemType] || Box;

  if (!items.length) {
    return (
      <div className='flex flex-col items-center justify-center p-8 text-center text-slate-500'>
        <div className='w-12 h-12 mb-4 bg-slate-800 rounded-full flex items-center justify-center'>
          <Box className='text-slate-500' size={24} />
        </div>
        <h3 className='text-lg font-semibold text-slate-300'>No ERP items found</h3>
        <p className='text-sm mt-1 text-slate-500'>
          {itemType === 'category' ? 'Try selecting a different category' : 'No matching items in ERP system'}
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'>
      {items.map((item) => {
        const {
          _id,
          name,
          variantName,
          baseName,
          sellingPrice,
          stockStatus = 'high_stock',
          hasChildren,
          childCount,
          children,
          images,
          expiresAt,
        } = item;

        console.log('item', item);
        const isSelected = selectedIds.includes(_id);
        const displayName = name || variantName || baseName || 'Unnamed';
        // Determine actual product type
        const productType = item.template?.type || item.type || (itemType === 'service' ? 'service' : 'product');

        // Only products have inventory status
        const showInventoryBadge = ['serialized', 'non-serialized'].includes(productType);

        // Services and bundles should never be disabled
        const isDisabled = showInventoryBadge && stockStatus === 'out_of_stock';
        const isOutOfStock = showInventoryBadge && stockStatus === 'out_of_stock';

        const cardClass = `
          flex flex-col justify-between p-3 relative overflow-hidden border rounded-xl bg-slate-900/50
          transition-all duration-200
          ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-900/30 bg-blue-900/20' : ''}
          ${isOutOfStock ? 'opacity-60 cursor-not-allowed border-slate-700' : 'cursor-pointer hover:border-blue-400 hover:bg-slate-800/70 border-slate-700'}
        `;

        return (
          <Card
            key={_id}
            onClick={() => !isOutOfStock && onSelect({ ...item, type: productType })}
            className={cardClass}
          >
            {/* Selected Check Icon */}
            {isSelected && (
              <div className='absolute top-2 right-2 text-blue-400'>
                <CheckCircle className='h-5 w-5' fill='currentColor' />
              </div>
            )}

            {/* Image */}
            <div className='flex items-center justify-center h-20 mb-3'>
              {images?.[0]?.url ? (
                <img
                  src={images[0].url}
                  alt={displayName}
                  className='max-h-16 max-w-full object-contain rounded bg-slate-800 p-1'
                />
              ) : (
                <div className='w-14 h-14 bg-slate-800 rounded flex items-center justify-center'>
                  <Icon className={`h-8 w-8 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                </div>
              )}
            </div>

            {/* Name */}
            <p className='text-sm font-medium text-slate-100 leading-snug text-center line-clamp-2'>{displayName}</p>

            {showInventoryBadge && (
              <span className='text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 mb-1'>
                {productType === 'serialized' ? 'Serialized' : 'Non-Serialized'}
              </span>
            )}
            {/* Price */}
            {showPrices && sellingPrice > 0 && (
              <p
                className={`mt-2 text-base font-semibold text-center ${isSelected ? 'text-blue-300' : isOutOfStock ? 'text-slate-500' : 'text-green-300'}`}
              >
                {formatCurrency(sellingPrice)}
              </p>
            )}

            {/* Stock badge */}
            {(showPrices || showInventoryBadge) && (
              <div className='mt-1'>
                <InventoryBadge status={stockStatus} itemType={productType} />
              </div>
            )}

            {/* Reservation */}
            {isSelected && showReservationTimers && expiresAt && <ReservationTimer expiresAt={expiresAt} />}

            {/* Children badge */}
            {hasChildren && (
              <div className='absolute bottom-2 right-2 bg-blue-900/50 text-blue-200 text-xs px-2 py-0.5 rounded'>
                {childCount || children?.length || 0}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TileSelectionGrid;
