import { useDrop } from 'react-dnd';
import { Group, Layer, Rect, Stage, Text } from 'react-konva';
import ElementRenderer from './ElementRenderer';

const Band = ({ band, elements, selectedId, onSelect, onChange, onAddElement }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ['text', 'line', 'image', 'table'],
    drop: (item, monitor) => {
      const canvasRect = document.getElementById('canvas-container').getBoundingClientRect();
      const dropPoint = monitor.getClientOffset();
      const x = dropPoint.x - canvasRect.left;
      const y = dropPoint.y - canvasRect.top - band.y; // Position relative to the band
      onAddElement(band.field, item, { x, y });
    },
    collect: (monitor) => ({ isOver: !!monitor.isOver() }),
  });

  return (
    <Group id={`band-${band.id}`} ref={drop} y={band.y}>
      <Rect
        x={0}
        y={0}
        width={band.width}
        height={band.height}
        fill={isOver ? '#f0f9ff' : '#f9fafb'}
        stroke={band.id === 'detail' ? '#0369a1' : '#e5e7eb'}
        strokeWidth={1}
      />
      <Text
        x={5}
        y={-12}
        text={band.title}
        fontSize={10}
        fontStyle='bold'
        fill={band.id === 'detail' ? '#0369a1' : '#4b5563'}
      />
      {elements.map((el) => (
        <ElementRenderer
          key={el.id}
          element={el}
          isSelected={el.id === selectedId}
          onSelect={() => onSelect(el.id)}
          onChange={(newAttrs) => onChange(band.field, el.id, newAttrs)}
        />
      ))}
    </Group>
  );
};

const BandedCanvas = ({ template, onAddElement, onSelect, onChange, onDelete, selectedId }) => {
  const bands = [
    { id: 'reportHeader', title: 'Report Header', field: 'reportHeaderElements', height: 100 },
    { id: 'pageHeader', title: 'Page Header', field: 'pageHeaderElements', height: 50 },
    { id: 'detail', title: 'Detail (Repeats)', field: 'detailElements', height: 80 },
    { id: 'reportFooter', title: 'Report Footer', field: 'reportFooterElements', height: 100 },
    { id: 'pageFooter', title: 'Page Footer', field: 'pageFooterElements', height: 50 },
  ];

  let yOffset = 15; // Initial top margin
  const positionedBands = bands.map((band) => {
    const position = { ...band, y: yOffset, width: 800 };
    yOffset += band.height + 15; // Add margin between bands
    return position;
  });
  const canvasHeight = yOffset;

  return (
    <div id='canvas-container' className='bg-gray-300 p-4 rounded shadow-inner overflow-auto'>
      <Stage width={800} height={canvasHeight}>
        <Layer>
          {positionedBands.map((band) => (
            <Band
              key={band.id}
              band={band}
              elements={template[band.field] || []}
              selectedId={selectedId}
              onSelect={onSelect}
              onChange={onChange}
              onAddElement={onAddElement}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};
export default BandedCanvas;
