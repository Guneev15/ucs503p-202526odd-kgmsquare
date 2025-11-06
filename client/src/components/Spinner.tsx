import React from 'react';

const Spinner = ({ label }: { label?: string }) => (
    <div className="flex flex-col justify-center items-center h-full space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        {label && <p className="text-purple-300">{label}</p>}
    </div>
);

export default Spinner;