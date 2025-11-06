import React from 'react';

type AlertProps = {
    children: React.ReactNode;
    kind?: 'info' | 'success' | 'warning' | 'error';
};

const Alert = ({ children, kind: type = 'info' }: AlertProps) => {
    const baseClasses = "p-4 rounded-lg mb-4 text-sm";
    const typeClasses = {
        info: "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        success: "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300",
        warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300",
        error: "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300",
    };
    return (
        <div className={`${baseClasses} ${typeClasses[type]}`} role="alert">
            {children}
        </div>
    );
};

export default Alert;