import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * A dedicated layout component that provides the single, authoritative
 * DndProvider for all visual editor pages.
 */
const DesignStudioLayout = ({ children }) => {
  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
};

export default DesignStudioLayout;
