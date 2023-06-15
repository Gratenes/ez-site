import { AnimatePresence, motion } from "framer-motion";
import { createContext, useContext, useState, useEffect } from "react";

interface setAlertSettings {
  duration?: number;
  type?: "success" | "error" | "warning" | "info" | undefined;
  linkto?: string;
}

interface Alert {
  id: string;
  title: string;
  settings?: setAlertSettings;
}

export const AlertContext = createContext<{
  alerts: Alert[];
  setAlert: (title: string, settings?: setAlertSettings) => void;
}>({
  alerts: [],
  setAlert: (title: string, settings?: setAlertSettings): void => {},
});

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = (title: string, settings?: setAlertSettings): void => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      title,
      settings: settings || {},
    };
    setAlerts([...alerts, newAlert]);

    if (newAlert.settings?.duration) {
      setTimeout(() => closeAlert(newAlert.id), newAlert.settings.duration);
    }
  };

  const closeAlert = (id: string) => {
    setAlerts(alerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, setAlert: showAlert }}>
      <AlertComponent closeAlert={closeAlert} />
      {children}
    </AlertContext.Provider>
  );
};

const AlertComponent = ({
  closeAlert,
}: {
  closeAlert: (id: string) => void;
}) => {
  const { alerts } = useContext(AlertContext);

  useEffect(() => {
    alerts.forEach((alert) => {
      if (alert.settings?.duration) {
        const timeout = setTimeout(
          () => closeAlert(alert.id),
          alert.settings.duration
        );
        return () => clearTimeout(timeout);
      }
    });
  }, [alerts, closeAlert]);

  return (
    <div className="absolute w-full z-50">
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{
              opacity: 0,
              x: -100,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: 100,
            }}
            className="w-full p-2"
          >
            <div
              className={`glass-${alert?.settings?.type || 'error'} glass-error px-2 w-full flex justify-between items-center`}
            >
              <div
                className={`${alert.settings?.linkto ? "cursor-pointer" : ""}`}
                onClick={() => {
                  if (alert.settings?.linkto) {
                    window.location.href = alert.settings.linkto;
                  }
                }}
              >
                {alert.title}
              </div>
              <button
                className="ml-2 focus:outline-none"
                onClick={() => closeAlert(alert.id)}
              >
                ✖
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
