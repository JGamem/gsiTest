import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { boardsApi } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

const BoardList = () => {
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewBoardModal, setShowNewBoardModal] = useState(false);
    const [newBoard, setNewBoard] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            setLoading(true);
            const response = await boardsApi.getBoards();
            setBoards(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching boards:', error);
            setLoading(false);
        }
    };

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        try {
            await boardsApi.createBoard(newBoard);
            setNewBoard({ name: '', description: '' });
            setShowNewBoardModal(false);
            fetchBoards();
        } catch (error) {
            console.error('Error creating board:', error);
        }
    };

    const handleDeleteBoard = async (id) => {
        if (window.confirm('Are you sure you want to delete this board?')) {
            try {
                await boardsApi.deleteBoard(id);
                fetchBoards();
            } catch (error) {
                console.error('Error deleting board:', error);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Kanban Boards</h1>
                <button
                    onClick={() => setShowNewBoardModal(true)}
                    className="btn btn-primary"
                >
                    Create New Board
                </button>
            </div>

            {boards.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You don't have any boards yet.</p>
                    <button
                        onClick={() => setShowNewBoardModal(true)}
                        className="btn btn-primary"
                    >
                        Create your first board
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                        <div key={board.id} className="card hover:shadow-lg transition-shadow">
                            <h2 className="text-xl font-semibold mb-2">{board.name}</h2>
                            <p className="text-gray-600 mb-4 line-clamp-2">{board.description || 'No description'}</p>
                            <p className="text-sm text-gray-500 mb-4">
                                Created: {new Date(board.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex justify-between">
                                <Link to={`/boards/${board.id}`} className="btn btn-primary">
                                    Open Board
                                </Link>
                                <button
                                    onClick={() => handleDeleteBoard(board.id)}
                                    className="btn btn-danger"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* New Board Modal */}
            {showNewBoardModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Board</h2>
                        <form onSubmit={handleCreateBoard}>
                            <div className="mb-4">
                                <label htmlFor="name" className="form-label">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newBoard.name}
                                    onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="description" className="form-label">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={newBoard.description}
                                    onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewBoardModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BoardList;