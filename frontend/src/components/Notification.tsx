import React, { useEffect } from "react";

interface NotificationProps {
  message: string | null;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

const typeToClass: Record<string, string> = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning",
};

const Notification: React.FC<NotificationProps> = ({ message, type = "info", onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      className={`alert ${typeToClass[type]} fixed top-4 left-1/2 transform -translate-x-1/2 shadow-lg max-w-md w-full z-[9999] flex justify-between items-center`}
      style={{ pointerEvents: "auto" }}
    >
      <span>{message}</span>
      <button className="btn btn-xs ml-2" onClick={onClose}>X</button>
    </div>
  );
};

export default Notification; 