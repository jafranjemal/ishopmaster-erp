import { useEffect, useRef } from 'react';
import { Group, Image, Line, Rect, Text, Transformer } from 'react-konva';

const ElementRenderer = ({ element, isSelected, onSelect, onUpdate, onDelete }) => {
  const shapeRef = useRef();
  const transformerRef = useRef();

  useEffect(() => {
    if (isSelected && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onUpdate({
      position: {
        x: node.x(),
        y: node.y(),
      },
      dimensions: {
        width: node.width() * scaleX,
        height: node.height() * scaleY,
      },
      rotation: node.rotation(),
    });
  };

  const renderElement = () => {
    switch (element.type) {
      case 'text':
        return (
          <Text
            ref={shapeRef}
            x={element.position.x}
            y={element.position.y}
            width={element.dimensions.width}
            height={element.dimensions.height}
            text={element.content.staticText || element.content.dataKey || 'Text Field'}
            fontSize={element.style?.fontSize || 8}
            fontFamily={element.style?.fontFamily}
            fill={element.style?.color}
            align={element.style?.textAlign}
            rotation={element.rotation || 0}
            draggable
            onDragEnd={handleTransformEnd}
            onClick={onSelect}
            onTap={onSelect}
          />
        );

      case 'line':
        return (
          <Line
            ref={shapeRef}
            x={element.position.x}
            y={element.position.y}
            points={[0, 0, element.dimensions.width, 0]}
            stroke={element.style.color}
            strokeWidth={1}
            rotation={element.rotation || 0}
            draggable
            onDragEnd={handleTransformEnd}
            onClick={onSelect}
            onTap={onSelect}
          />
        );

      case 'image':
        return (
          <Image
            ref={shapeRef}
            x={element.position.x}
            y={element.position.y}
            width={element.dimensions.width}
            height={element.dimensions.height}
            image={new window.Image()}
            fillPatternRepeat='no-repeat'
            rotation={element.rotation || 0}
            draggable
            onDragEnd={handleTransformEnd}
            onClick={onSelect}
            onTap={onSelect}
          />
        );

      case 'table':
        return (
          <Group
            ref={shapeRef}
            x={element.position.x}
            y={element.position.y}
            rotation={element.rotation || 0}
            draggable
            onDragEnd={handleTransformEnd}
            onClick={onSelect}
            onTap={onSelect}
          >
            <Rect
              width={element.dimensions.width}
              height={element.dimensions.height}
              fill='#ffffff'
              stroke='#e5e7eb'
              strokeWidth={1}
            />
            <Text x={10} y={10} text='Items Table' fontSize={12} fontStyle='bold' fill='#000000' />
          </Group>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {renderElement()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => newBox}
          rotateEnabled={true}
          rotationSnaps={[0, 90, 180, 270]}
          onTransformEnd={handleTransformEnd}
          onDelete={() => onDelete()}
          anchorRenderer={(anchorProps) => {
            if (anchorProps.name === 'top-right') {
              return (
                // In a real Konva implementation, this would be a Konva shape
                // that calls the onDelete handler.
                // For simplicity, we'll add the button logic to the PropertiesPanel.
                <Rect {...anchorProps} fill='red' />
              );
            }
            return <Rect {...anchorProps} />;
          }}
        />
      )}
    </>
  );
};

export default ElementRenderer;
