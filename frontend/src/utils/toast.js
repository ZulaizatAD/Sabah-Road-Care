import { toast } from 'react-toastify';

export const showSuccessToast = (message) => {
  toast.success(message, {
    icon: "✅",
    className: 'success-toast',
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    icon: "❌",
    className: 'error-toast',
  });
};

export const showWarningToast = (message) => {
  toast.warning(message, {
    icon: "⚠️",
    className: 'warning-toast',
  });
};

export const showInfoToast = (message) => {
  toast.info(message, {
    icon: "ℹ️",
    className: 'info-toast',
  });
};