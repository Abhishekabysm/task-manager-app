'use client';

import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import { getUsers } from '../lib/api';

// Move CustomInput outside of TaskModal
const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      type="text"
      value={value || 'Select date'}
      onClick={onClick}
      readOnly
      className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer pr-10"
    />
    <CalendarIcon 
      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
    />
  </div>
));

// Set display name
CustomInput.displayName = 'CustomInput';

const TaskModal = ({ isOpen, onClose, onSave, initialTask = null }) => {  // Changed onSubmit to onSave
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [isCreator, setIsCreator] = useState(true);
  const [users, setUsers] = useState([]);
  const [assignedTo, setAssignedTo] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  // Format the date to YYYY-MM-DD for the date input
  const formatDateForInput = (date) => {
    if (!date) return '';
    return new Date(date).toISOString().split('T')[0];
  };

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
      
      setSelectedDate(initialTask.dueDate ? new Date(initialTask.dueDate) : null);
      // Add this line to set assignedTo if it exists in the task
      setAssignedTo(initialTask.assignedTo?._id || initialTask.assignedTo || '');
    } else {
      // Reset form when creating a new task
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setSelectedDate(null);
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
    
    onSave({  // Changed onSubmit to onSave here
      title,
      description,
      status: statusMapping[status],
      priority: priorityMapping[priority],
      dueDate: selectedDate ? selectedDate.toISOString() : undefined,
      assignedTo: assignedTo || undefined
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-[#1a1a2e] rounded-xl shadow-2xl w-full max-w-lg mx-auto my-2 sm:my-8 max-h-[calc(100vh-1rem)] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {initialTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-200">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 sm:p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-200">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 sm:p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-200">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-200">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full p-2 sm:p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none pr-10"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Due Date and Assign To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-200">
                Due Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                customInput={<CustomInput />}
                dateFormat="MMM dd, yyyy"
                minDate={new Date()}
                placeholderText="Select due date"
                className="datepicker-input"
                calendarClassName="custom-datepicker"
                popperClassName="custom-popper"
                wrapperClassName="w-full"
                showPopperArrow={false}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-200">
                Assign To
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={loadingUsers}
                className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {loadingUsers ? (
                  <option disabled>Loading users...</option>
                ) : (
                  users.map(user => (
                    <option 
                      key={user._id} 
                      value={user._id}
                      className="bg-[#0D0D0D] text-white"
                    >
                      {user.name || user.email || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Add Task Information Section - Only show when editing */}
          {initialTask && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-sm font-medium text-gray-200 mb-3">Task Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">
                    Created By
                  </label>
                  <input
                    type="text"
                    value={initialTask.createdBy?.name || 
                           initialTask.createdBy?.email || 
                           `${initialTask.createdBy?.firstName || ''} ${initialTask.createdBy?.lastName || ''}`.trim() || 
                           'Unknown'}
                    readOnly
                    className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-not-allowed opacity-75"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-400">
                    Assigned By
                  </label>
                  <input
                    type="text"
                    value={
                      initialTask.lastModifiedBy?.name || 
                      initialTask.lastModifiedBy?.email || 
                      `${initialTask.lastModifiedBy?.firstName || ''} ${initialTask.lastModifiedBy?.lastName || ''}`.trim() ||
                      initialTask.createdBy?.name || 
                      initialTask.createdBy?.email || 
                      `${initialTask.createdBy?.firstName || ''} ${initialTask.createdBy?.lastName || ''}`.trim() || 
                      'Unknown'
                    }
                    readOnly
                    className="w-full p-3 bg-[#0D0D0D] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-not-allowed opacity-75"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#1a1a2e] flex justify-end gap-2 pt-4 border-t border-gray-700 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {initialTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
