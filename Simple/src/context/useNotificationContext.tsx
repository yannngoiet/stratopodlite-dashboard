import { createContext, useContext, useState } from 'react';
import { ToastBody, ToastHeader } from 'react-bootstrap';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

interface ToastrProps {
  show: boolean
  title?: string
  message: string
  onClose?: () => void
  variant?: string
  delay?: number
}

interface NotificationConfig {
  show: boolean
  message: string
  title: string
  delay: number
  variant?: string
  onClose?: () => void
}

const NotificationContext = createContext<any>(undefined);

function Toastr({ show, title, message, onClose, variant = 'light', delay }: ToastrProps) {
  return <ToastContainer className="m-3 position-fixed" position="top-end">
      <Toast bg={variant} delay={delay} show={show} onClose={onClose} autohide>
        {title && <ToastHeader className={`text-${variant}`}>
            <strong className="me-auto">{title}</strong>
          </ToastHeader>}
        <ToastBody className={['dark', 'danger', 'success', 'primary'].includes(variant) ? 'text-white' : ''}>{message}</ToastBody>
      </Toast>
    </ToastContainer>;
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within an NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const defaultConfig: NotificationConfig = {
    show: false,
    message: '',
    title: '',
    delay: 2000
  };

  const [config, setConfig] = useState<NotificationConfig>(defaultConfig);

  const hideNotification = () => {
    setConfig({
      show: false,
      message: '',
      title: '',
      delay: 2000
    });
  };

  const showNotification = ({ title, message, variant, delay = 2000 }: { title: string, message: string, variant?: string, delay?: number }) => {
    setConfig({
      show: true,
      title,
      message,
      variant: variant ?? 'light',
      onClose: hideNotification,
      delay
    });
    setTimeout(() => {
      setConfig(defaultConfig);
    }, delay);
  };

  return <NotificationContext.Provider value={{ showNotification }}>
      <Toastr {...config} />
      {children}
    </NotificationContext.Provider>;
}