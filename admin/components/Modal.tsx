type Props = {
  children: React.ReactNode;
  onClose: () => void;
};

export default function Modal({ children, onClose }: Props) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
