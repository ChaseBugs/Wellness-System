interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

/**
 * Shared modal wrapper.
 * - Clicking the dark backdrop calls onClose.
 * - Clicking inside the white card does nothing.
 * - The inner card scrolls independently (max-h-[90vh] + overflow-y-auto).
 */
export default function Modal({ onClose, children, maxWidth = 'max-w-2xl' }: ModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
