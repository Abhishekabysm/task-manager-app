'use client';

import { useEffect, useState } from 'react';
import { getUsers } from '../lib/api';
import FormField from './FormField';
// Import useAuth to get the current user
import { useAuth } from '../context/AuthContext';

const TaskModal = ({ isOpen, onClose, onSubmit, initialTask = null }) => {
  // Get the current user from AuthContext
  const { user: currentUser } = useAuth();
  // Keep your existing state variables
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [isCreator, setIsCreator] = useState(true);
  
  // Add these new state variables for user assignment
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Check if current user is the creator of the task
  useEffect(() => {
    if (initialTask && currentUser) {
      // Check if the current user is the creator of the task
      const isOwner = (currentUser.id === initialTask.createdBy?._id || 
                      currentUser._id === initialTask.createdBy?._id);
      setIsCreator(isOwner);
      
      // If not the creator and trying to edit, close the modal
      if (!isOwner && initialTask) {
        onClose();
        alert("You don't have permission to edit this task. Only the creator can modify tasks.");
      }
    }
  }, [initialTask, currentUser, onClose]);

  // Keep your existing useEffect for loading task data
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title || '');
      setDescription(initialTask.description || '');
      // Map status from backend format to UI format
      const statusMap = {
        'To Do': 'todo',
        'In Progress': 'in-progress',
        'Done': 'done'
      };
      setStatus(statusMap[initialTask.status] || 'todo');
      
      // Map priority from backend format to UI format
      const priorityMap = {
        'Low': 'low',
        'Medium': 'medium',
        'High': 'high'
      };
      setPriority(priorityMap[initialTask.priority] || 'medium');
      
      setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '');
      // Add this line to set assignedTo if it exists in the task
      setAssignedTo(initialTask.assignedTo?._id || initialTask.assignedTo || '');
    } else {
      // Reset form when creating a new task
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDueDate('');
      setAssignedTo('');
    }
  }, [initialTask, isOpen]);

  // Add this new useEffect to load users for assignment dropdown
  useEffect(() => {
    const loadUsers = async () => {
      if (!isOpen) return; // Only load when modal is open
      
      try {
        setLoadingUsers(true);
        const userData = await getUsers();
        setUsers(userData.filter(user => {
          // Correctly filter out the current user
          return user._id !== currentUser?._id && 
                 user.id !== currentUser?.id &&
                 user.userId !== currentUser?.id;
        }));
      } catch (error) {
        console.error('Failed to load users:', error);
        setUsers([]); // Set empty array on error to prevent undefined errors
      } finally {
        setLoadingUsers(false);
      }
    };
    
    loadUsers();
  }, [isOpen, currentUser]);

  // Update your existing handleSubmit function to include assignedTo
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Map status values to match the server-side validation
    const statusMapping = {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
    };

    // Map priority values to match the server-side validation
    const priorityMapping = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High'
    };
    
    onSubmit({
      title,
      description,
      status: statusMapping[status],
      priority: priorityMapping[priority],
      dueDate: dueDate || undefined,
      assignedTo: assignedTo || undefined
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {/* Keep all your existing form fields */}
            <FormField
              label="Title"
              type="text"
              id="title"
              value={title}
              onChange={setTitle}
              required
              placeholder="Task title"
              validate={(value) => value.length >= 3}
            />
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Task description"
                rows={3}
              ></textarea>
            </div>
            
            {/* Status dropdown */}
            <div className="mb-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-200 mb-2">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            
            {/* Priority dropdown */}
            <div className="mb-4">
              <label htmlFor="priority" className="block text-sm font-medium text-gray-200 mb-2">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            {/* Due date input */}
            <FormField
              label="Due Date"
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={setDueDate}
              placeholder="Select a due date"
            />
            
            {/* Add this new User Assignment dropdown */}
            <div className="mb-4">
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-200 mb-2">
                Assign To
              </label>
              <select
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={loadingUsers}
              >
                <option value="">Unassigned</option>
                {loadingUsers ? (
                  <option disabled>Loading users...</option>
                ) : (
                  users
                    .map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name || user.email || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                      </option>
                    ))
                )}
              </select>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
              >
                {initialTask ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
