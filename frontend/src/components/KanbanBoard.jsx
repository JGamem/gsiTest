
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { boardsApi, columnsApi, tasksApi } from '../services/api';
import KanbanColumn from './KanbanColumn';
import LoadingSpinner from './LoadingSpinner';

const KanbanBoard = () => {
    const { boardId } = useParams();
    const navigate = useNavigate();
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showNewColumnModal, setShowNewColumnModal] = useState(false);
    const [newColumn, setNewColumn] = useState({ name: '', board_id: boardId });
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    useEffect(() => {
        fetchBoardData();
    }, [boardId]);

    const fetchBoardData = async () => {
        try {
            setLoading(true);
            const boardResponse = await boardsApi.getBoard(boardId);
            setBoard(boardResponse.data);
            setColumns(boardResponse.data.columns.sort((a, b) => a.order - b.order));
            setLoading(false);
        } catch (error) {
            console.error('Error fetching board data:', error);
            setLoading(false);
            if (error.response && error.response.status === 404) {
                navigate('/');
            }
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            if (active.data.current?.type === 'column') {
                const oldIndex = columns.findIndex(col => col.id.toString() === active.id);
                const newIndex = columns.findIndex(col => col.id.toString() === over.id);

                const newColumns = arrayMove(columns, oldIndex, newIndex);

                const updatedColumns = newColumns.map((col, index) => ({
                    ...col,
                    order: index
                }));

                setColumns(updatedColumns);

                // Actualizar orden en el back
                try {
                    await columnsApi.updateColumn(active.id, { order: newIndex });
                } catch (error) {
                    console.error('Error updating column order:', error);
                    fetchBoardData(); // Revert on error
                }
            }
            // Maneja el movimiento de tasks
            else if (active.data.current?.type === 'task') {
                const activeTaskId = active.id;
                const sourceColumnId = active.data.current.columnId;
                const destinationColumnId = over.data.current?.columnId;

                if (destinationColumnId) {

                    const newColumns = JSON.parse(JSON.stringify(columns));

                    const sourceColumn = newColumns.find(col => col.id === parseInt(sourceColumnId));
                    const destinationColumn = newColumns.find(col => col.id === parseInt(destinationColumnId));

                    if (!sourceColumn || !destinationColumn) return;

                    const taskIndex = sourceColumn.tasks.findIndex(t => t.id.toString() === activeTaskId);
                    const task = sourceColumn.tasks[taskIndex];

                    if (!task) return;

                    sourceColumn.tasks.splice(taskIndex, 1);

                    task.column_id = parseInt(destinationColumnId);
                    destinationColumn.tasks.push(task);

                    destinationColumn.tasks.forEach((t, index) => {
                        t.order = index;
                    });

                    setColumns(newColumns);

                    // Actualizar task en el back
                    try {
                        await tasksApi.updateTask(activeTaskId, {
                            column_id: parseInt(destinationColumnId),
                            order: destinationColumn.tasks.length - 1
                        });
                    } catch (error) {
                        console.error('Error updating task:', error);
                        fetchBoardData(); 
                    }
                }
            }
        }

        setActiveId(null);
    };

    const handleCreateColumn = async (e) => {
        e.preventDefault();
        try {
            const newColumnData = {
                ...newColumn,
                order: columns.length,
            };
            await columnsApi.createColumn(newColumnData);
            setNewColumn({ name: '', board_id: boardId });
            setShowNewColumnModal(false);
            fetchBoardData();
        } catch (error) {
            console.error('Error creating column:', error);
        }
    };

    const handleDeleteColumn = async (columnId) => {
        if (window.confirm('Are you sure you want to delete this column? All tasks will be deleted.')) {
            try {
                await columnsApi.deleteColumn(columnId);
                fetchBoardData();
            } catch (error) {
                console.error('Error deleting column:', error);
            }
        }
    };

    const handleUpdateColumnName = async (columnId, newName) => {
        try {
            await columnsApi.updateColumn(columnId, { name: newName });
            fetchBoardData();
        } catch (error) {
            console.error('Error updating column name:', error);
        }
    };

    const addTaskToColumn = async (columnId, task) => {
        try {
            const column = columns.find(col => col.id === columnId);
            const newTask = {
                ...task,
                column_id: columnId,
                order: column.tasks.length,
            };
            await tasksApi.createTask(newTask);
            fetchBoardData();
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const updateTask = async (taskId, taskData) => {
        try {
            await tasksApi.updateTask(taskId, taskData);
            fetchBoardData();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await tasksApi.deleteTask(taskId);
                fetchBoardData();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!board) {
        return <div className="text-center py-10">Board not found</div>;
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{board.name}</h1>
                        <p className="text-gray-600">{board.description}</p>
                    </div>
                    <button
                        onClick={() => setShowNewColumnModal(true)}
                        className="btn btn-primary"
                    >
                        Add Column
                    </button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={columns.map(col => col.id.toString())}
                    strategy={horizontalListSortingStrategy}
                >
                    <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
                        {columns.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                onDelete={handleDeleteColumn}
                                onUpdateName={handleUpdateColumnName}
                                onAddTask={addTaskToColumn}
                                onUpdateTask={updateTask}
                                onDeleteTask={deleteTask}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* New Column Modal */}
            {showNewColumnModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Column</h2>
                        <form onSubmit={handleCreateColumn}>
                            <div className="mb-4">
                                <label htmlFor="name" className="form-label">
                                    Column Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newColumn.name}
                                    onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewColumnModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Column
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanBoard;