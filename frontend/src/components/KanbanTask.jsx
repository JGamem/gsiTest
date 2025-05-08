import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

const priorityColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
};

const KanbanTask = ({ task, columnId, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState({ ...task });

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: task.id.toString(),
        data: {
            type: 'task',
            task,
            columnId
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(task.id, editedTask);
        setIsEditing(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedTask({ ...editedTask, [name]: value });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="kanban-task"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="form-label" htmlFor="title">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={editedTask.title}
                            onChange={handleChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={editedTask.description || ''}
                            onChange={handleChange}
                            className="form-input"
                            rows="2"
                        />
                    </div>
                    <div>
                        <label className="form-label" htmlFor="priority">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={editedTask.priority}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn btn-secondary text-sm py-1 px-3"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary text-sm py-1 px-3">
                            Save
                        </button>
                    </div>
                </form>
            ) : (
                <div>
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium">{task.title}</h4>
                        <div className="flex space-x-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-gray-500 hover:text-gray-700"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => onDelete(task.id)}
                                className="text-gray-500 hover:text-red-600"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {task.description && (
                        <p className="text-gray-600 text-sm my-2">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-2 text-xs">
                        <span className={`px-2 py-1 rounded-full ${priorityColors[task.priority]}`}>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        {task.due_date && (
                            <span className="text-gray-500">
                                Due: {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanTask;