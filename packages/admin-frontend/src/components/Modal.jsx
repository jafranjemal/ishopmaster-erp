import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * A reusable, accessible Modal component that renders its children into a portal.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls whether the modal is visible.
 * @param {Function} props.onClose - Function to call when the modal should be closed.
 * @param {React.ReactNode} props.children - The content to display inside the modal.
 * @param {string} props.title - The title to display in the modal header.
 */
function Modal({ isOpen, onClose, children, title }) {
  // Effect to handle closing the modal when the 'Escape' key is pressed.
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    // Cleanup function to remove the event listener when the component unmounts or modal closes.
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Return null if the modal is not open, so it doesn't render anything.
  if (!isOpen) {
    return null;
  }

  // We use createPortal to render the modal's JSX into a specific DOM node
  // outside of the main component tree. This is crucial for handling z-index and accessibility.
  return createPortal(
    // Modal overlay: covers the entire screen with a semi-transparent background.
    // Clicking the overlay will close the modal.
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal content: styled panel for the modal's content. */}
      {/* e.stopPropagation() prevents a click inside the modal from closing it. */}
      <div
        className="relative w-full max-w-lg p-6 mx-4 bg-gray-800 rounded-lg shadow-xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-600">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Modal Body: This is where the children passed to the component will be rendered. */}
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>,
    // The second argument to createPortal is the DOM element to render into.
    // We assume an element with id 'modal-root' exists in your public/index.html.
    document.getElementById('modal-root')
  );
}

export default Modal;
