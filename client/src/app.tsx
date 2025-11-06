import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './components/DashboardLayout';
import SummaryPage from './pages/SummaryPage';

function App() {
    const [searchQuery, setSearchQuery] = useState<string>('');

    useEffect(() => {
        console.log('App component mounted successfully');
    }, []);

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <ThemeProvider>
            <DashboardLayout onSearch={handleSearch}>
                <SummaryPage searchQuery={searchQuery} />
            </DashboardLayout>
        </ThemeProvider>
    );
}

export default App;