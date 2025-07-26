import { Group, Image as KonvaImage, Line, Rect, Text } from 'react-konva';

/**
 * Renders a table given its dimensions, style, and tableContent spec
 */
const TableRenderer = ({ dimensions, style, tableContent, data }) => {
  const { columns, dataKey } = tableContent;

  // Determine rows: use real data if present, otherwise generate 5 dummy rows
  const realRows = Array.isArray(data?.[dataKey]) && data[dataKey].length > 0 ? data[dataKey] : null;

  const rows =
    realRows ||
    Array.from({ length: 5 }, () =>
      // each dummy row has an empty string for every column
      columns.reduce((r, col) => {
        r[col.dataKey] = '';
        return r;
      }, {}),
    );

  const headerHeight = 25;
  const rowHeight = (dimensions.height - headerHeight) / rows.length;

  return (
    <Group>
      {/* Outer border */}
      <Rect
        width={dimensions.width}
        height={dimensions.height}
        stroke={style.border.color}
        strokeWidth={style.border.width}
      />

      {/* Header */}
      {columns.map((col, i) => {
        const x = columns.slice(0, i).reduce((sum, c) => sum + c.width, 0);
        return (
          <Group key={`hdr-${i}`}>
            <Rect
              x={x}
              width={col.width}
              height={headerHeight}
              stroke={style.border.color}
              strokeWidth={style.border.width}
              fill={style.headerFill || '#f0f0f0'}
            />
            <Text
              x={x + 5}
              y={5}
              text={col.header}
              width={col.width - 10}
              height={headerHeight - 10}
              fontSize={style.fontSize}
              align={col.align}
            />
          </Group>
        );
      })}

      {/* Data rows (real or dummy) */}
      {rows.map((row, rowIndex) =>
        columns.map((col, colIndex) => {
          const x = columns.slice(0, colIndex).reduce((sum, c) => sum + c.width, 0);
          const y = headerHeight + rowIndex * rowHeight;
          // For dummy rows, row[col.dataKey] will be '', for real it'll be the actual value
          const rawValue = row[col.dataKey];
          const text =
            rawValue != null && rawValue !== ''
              ? col.format === 'currency'
                ? new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: 'USD',
                  }).format(rawValue)
                : String(rawValue)
              : '—';

          return (
            <Group key={`cell-${rowIndex}-${colIndex}`}>
              <Rect
                x={x}
                y={y}
                width={col.width}
                height={rowHeight}
                stroke={style.border.color}
                strokeWidth={style.border.width}
              />
              <Text
                x={x + 5}
                y={y + 5}
                text={text}
                width={col.width - 10}
                height={rowHeight - 10}
                fontSize={style.fontSize}
                align={col.align}
              />
            </Group>
          );
        }),
      )}
    </Group>
  );
};

const ElementRenderer = ({ element, isSelected, onSelect, onChange, onDelete, isPartOfGroup, draggable = true }) => {
  const { id, type, position, dimensions, style, content, tableContent } = element;

  const renderElement = () => {
    switch (type) {
      case 'text':
        return (
          <Text
            text={content.staticText || content.template || ''}
            width={dimensions.width}
            height={dimensions.height}
            fontSize={style.fontSize}
            fontFamily={style.fontFamily || 'Helvetica'}
            fill={style.fillColor || '#000000'}
            align={style.textAlign || 'left'}
            verticalAlign={style.verticalAlign || 'top'}
            padding={5}
            wrap='word'
            fontStyle={[
              style.fontWeight === 'bold' ? 'bold' : '',
              style.fontStyle === 'italic' ? 'italic' : '',
              style.textDecoration === 'underline' ? 'underline' : '',
            ].join(' ')}
          />
        );

      case 'image':
        return (
          <KonvaImage
            width={dimensions.width}
            height={dimensions.height}
            fill='#e2e8f0'
            stroke='#94a3b8'
            strokeWidth={1}
            dash={[5, 5]}
          />
        );

      case 'line':
        return (
          <Line
            points={[0, 0, dimensions.width, 0]}
            stroke={style.strokeColor || '#000000'}
            strokeWidth={style.borderWidth || 1}
          />
        );

      case 'table': {
        return <TableRenderer dimensions={dimensions} style={style} tableContent={tableContent} data={null} />;
      }

      default:
        return null;
    }
  };

  return (
    <Group
      id={id}
      x={position.x}
      y={position.y}
      draggable={draggable && !isPartOfGroup}
      onDragEnd={(e) => {
        onChange({
          position: {
            x: e.target.x(),
            y: e.target.y(),
          },
        });
      }}
      onClick={(e) => {
        e.cancelBubble = isPartOfGroup;
        onSelect(e);
      }}
      onTap={onSelect}
    >
      {renderElement()}

      {isSelected && !isPartOfGroup && (
        <Rect width={dimensions.width} height={dimensions.height} stroke='#3b82f6' strokeWidth={1} dash={[4, 2]} />
      )}
    </Group>
  );
};

export default ElementRenderer;
