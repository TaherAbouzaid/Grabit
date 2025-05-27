import { createRoot } from 'react-dom/client';
import SimpleToast from './SimpleToast';

export const showToast = (message, type, duration) => {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toastId = `toast-${Date.now()}`;
  const toastElement = document.createElement('div');
  toastElement.id = toastId;
  document.getElementById('toast-container').appendChild(toastElement);

  const root = createRoot(toastElement);
  root.render(
    <SimpleToast 
      message={message} 
      type={type} 
      duration={duration} 
      onClose={() => {
        root.unmount();
        toastElement.remove();
      }} 
    />
  );
};
