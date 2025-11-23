import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="toast-container">
            <div className="toast-message">
                {message}
            </div>
        </div>
    );
};

export default Toast;
