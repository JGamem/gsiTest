import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BoardList from './components/BoardList';
import KanbanBoard from './components/KanbanBoard';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="pt-4">
                    <Routes>
                        <Route path="/" element={<BoardList />} />
                        <Route path="/boards/:boardId" element={<KanbanBoard />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;