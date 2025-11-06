import React, { useState, ReactNode } from 'react';
import { Sun, Moon, User, FileText, Menu, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DashboardLayoutProps {
    children: ReactNode;
    onSearch?: (query: string) => void;
}

const DashboardLayout = ({ children, onSearch }: DashboardLayoutProps) => {
    const { isDark, toggleTheme } = useTheme();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (onSearch) {
            onSearch(query);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-slate-950">
            {/* Sidebar */}
            <aside
                className={`flex-shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 p-0 hidden md:flex flex-col transition-all duration-500 ease-in-out ${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } relative shadow-sm`}
            >
                {/* Logo Section */}
                <div className="p-6 border-b border-gray-200 dark:border-slate-700">
                    <div className={`flex items-center ${!isSidebarOpen ? 'justify-center' : 'justify-start'}`}>
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center shadow-lg">
                                <span className="text-white text-xl font-bold">⚡</span>
                            </div>
                        </div>
                        <div className={`ml-3 transition-all duration-500 overflow-hidden ${
                            isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                        }`}>
                            <h1 className="text-lg font-bold text-gray-900 dark:text-white whitespace-nowrap">Recall AI</h1>
                            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Memory Assistant</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 p-4 space-y-2">
                    <a
                        href="#"
                        className={`sidebar-item relative flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:shadow-md group ${
                            !isSidebarOpen ? 'justify-center' : ''
                        }`}
                    >
                        <FileText className="h-5 w-5 flex-shrink-0" />
                        <span className={`transition-all duration-500 whitespace-nowrap overflow-hidden ${
                            isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                        }`}>
                            Daily Scroll
                        </span>
                        {!isSidebarOpen && (
                            <span className="sidebar-tooltip">Daily Scroll</span>
                        )}
                    </a>
                    
                    {/* Add spacing element when collapsed for better visual balance */}
                    {!isSidebarOpen && (
                        <div className="h-2"></div>
                    )}
                </nav>

                {/* User Profile Section */}
                <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                    <div className={`flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 cursor-pointer ${
                        !isSidebarOpen ? 'justify-center' : ''
                    }`}>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                            <span className="text-white text-sm font-semibold">JD</span>
                        </div>
                        <div className={`transition-all duration-500 overflow-hidden ${
                            isSidebarOpen ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
                        }`}>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">Jane Doe</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Premium</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Toggle - Redesigned */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-8 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 shadow-lg hover:shadow-xl rounded-full p-1.5 transition-all duration-300 z-20 border border-gray-200 dark:border-slate-600 group"
                    title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isSidebarOpen ? (
                        <ChevronLeft className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                    )}
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-sm transition-all duration-300">
                    <div className="flex items-center gap-4 flex-1">
                        {/* Mobile Sidebar Toggle */}
                        <button
                            onClick={toggleMobileSidebar}
                            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-all duration-300"
                        >
                            {isMobileSidebarOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>

                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Search memories..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-300"
                                />
                            </div>
                        </form>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center gap-4 ml-4">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300 group"
                            title="Toggle dark mode"
                        >
                            {isDark ? (
                                <Sun className="h-5 w-5 text-yellow-500 group-hover:rotate-90 transition-transform duration-300" />
                            ) : (
                                <Moon className="h-5 w-5 text-gray-600 group-hover:rotate-90 transition-transform duration-300" />
                            )}
                        </button>

                        {/* User Menu */}
                        <button 
                            className="hidden md:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-all duration-300"
                            title="User profile"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                                <span className="text-sm font-bold text-white">JD</span>
                            </div>
                        </button>
                    </div>
                </header>

                {/* Mobile Sidebar */}
                {isMobileSidebarOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4 animate-slideIn shadow-lg">
                        <nav className="space-y-2">
                            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-medium">
                                <FileText className="h-5 w-5" /> Daily Scroll
                            </a>
                        </nav>
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-400 to-pink-500 flex items-center justify-center shadow-md">
                                    <span className="text-white text-sm font-semibold">JD</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Jane Doe</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Premium</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;