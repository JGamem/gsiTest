import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanTask from './KanbanTask';

const KanbanColumn = ({
    column,
    onDelete,
    onUpdateName,
    onAddTask,
    onUpdateTask,
    onDeleteTask
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [columnName, setColumnName] = useState(column.name);
    const [showNewTaskModal, setShowNewTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo'
    });

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: column.id.toString(),
        data: {
            type: 'column',
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const handleNameSubmit = (e) => {
        e.preventDefault();
        onUpdateName(column.id, columnName);
        setIsEditing(false);
    };

    const handleCreateTask = (e) => {
        e.preventDefault();
        onAddTask(column.id, newTask);
        setNewTask({
            title: '',
            description: '',
            priority: 'medium',
            status: 'todo'
        });
        setShowNewTaskModal(false);
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="kanban-column"
        >
            <div className="flex justify-between items-center mb-4" {...attributes} {...listeners}>
                {isEditing ? (
                    <form onSubmit={handleNameSubmit} className="flex-1">
                        <input
                            type="text"
                            value={columnName}
                            onChange={(e) => setColumnName(e.target.value)}
                            className="form-input py-1 text-lg font-medium"
                            autoFocus
                            onBlur={handleNameSubmit}
                        />
                    </form>
                ) : (
                    <h3
                        className="text-lg font-medium cursor-pointer"
                        onClick={() => setIsEditing(true)}
                    >
                        {column.name} ({column.tasks.length})
                    </h3>
                )}
                <div className="flex space-x-1">
                    <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="p-1 text-gray-600 hover:text-primary-600"
                        title="Add Task"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(column.id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete Column"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            <SortableContext
                items={column.tasks.map(task => task.id.toString())}
                strategy={verticalListSortingStrategy}
            >
                <div className="min-h-[200px]">
                    {column.tasks
                        .sort((a, b) => a.order - b.order)
                        .map((task) => (
                            <KanbanTask
                                key={task.id}
                                task={task}
                                columnId={column.id}
                                onUpdate={onUpdateTask}
                                onDelete={onDeleteTask}
                            />
                        ))}
                </div>
            </SortableContext>

            {/* New Task Modal */}
            {showNewTaskModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div className="mb-4">
                                <label htmlFor="title" className="form-label">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
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
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="priority" className="form-label">
                                    Priority
                                </label>
                                <select
                                    id="priority"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                    className="form-input"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="urgent">Urgent</option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowNewTaskModal(false)}
                                    className="btn btn-secondary"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanColumn;