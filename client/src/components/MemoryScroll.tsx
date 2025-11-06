import React from 'react';
import { Globe, MessageSquare, CheckCircle, FileText, Clock } from 'lucide-react';
import Alert from './Alert'; // Assuming Alert.tsx is in the same folder

export type Memory = {
    id: string | number;
    color: 'blue' | 'purple' | 'green' | 'red';
    type: string;
    title: string;
    timestamp: string;
    source: string;
    content: string;
};

const MemoryCard = ({ chunk }: { chunk: Memory }) => {
    const colorVariants = {
        blue: 'border-l-blue-500',
        purple: 'border-l-purple-500',
        green: 'border-l-green-500',
        red: 'border-l-red-500',
        default: 'border-l-gray-500',
    };
    
    const getIcon = (type: string): React.ReactNode => {
      switch(type) {
        case 'website': return <Globe className="h-5 w-5 text-blue-500" />;
        case 'conversation': return <MessageSquare className="h-5 w-5 text-purple-500" />;
        case 'task-reminder': return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'document': return <FileText className="h-5 w-5 text-red-500" />;
        default: return <FileText className="h-5 w-5 text-gray-500" />;
      }
    };

    return (
        <div className={`bg-white dark:bg-slate-800/50 p-5 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border-l-4 ${colorVariants[chunk.color] || colorVariants.default}`}>
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getIcon(chunk.type)}</div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{chunk.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>{chunk.timestamp}</span>
                        </div>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{chunk.content}</p>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Source: {chunk.source}</p>
                </div>
            </div>
        </div>
    );
};

const MemoryScroll = ({ memories }: { memories: Memory[] }) => {
    if (memories.length === 0) {
        return <Alert>No memories recorded for today. Your AI is listening in the background.</Alert>
    }
    return (
        <div className="space-y-6">
            {memories.map((chunk) => (
                <MemoryCard key={chunk.id} chunk={chunk} />
            ))}
        </div>
    );
}

export default MemoryScroll;