'use client';

import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { forwardRef, useEffect, useRef, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

const CustomInput = forwardRef(({ value, onClick }, ref) => (
  <div className="relative">
    <input
      ref={ref}
      type="text"
      value={value || 'Select date'}
      onClick={onClick}
      readOnly
      className="w-full px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors cursor-pointer pr-10"
    />
    <CalendarIcon
      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
    />
  </div>
));

CustomInput.displayName = 'CustomInput';

const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const modalRef = useRef(null);
  const { user: currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [selectedDate, setSelectedDate] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isCreator, setIsCreator] = useState(true);

  // Add these new states
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Add this effect to fetch users and projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingUsers(true);
        setLoadingProjects(true);

        // Fetch users
        const usersResponse = await api.get('/users');
        setUsers(usersResponse.data);

        // Fetch projects
        const projectsResponse = await api.get('/projects');
        setProjects(projectsResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoadingUsers(false);
        setLoadingProjects(false);
      }
    };

    fetchData();
  }, []);

  // Check if current user is the creator of the task
  useEffect(() => {
    if (task && currentUser) {
      const isOwner = (currentUser.id === task.createdBy?._id ||
                      currentUser._id === task.createdBy?._id);
      setIsCreator(isOwner);

      if (!isOwner && task) {
        onClose();
        alert("You don't have permission to edit this task. Only the creator can modify tasks.");
      }
    }
  }, [task, currentUser, onClose]);

  // Load initial task data when editing
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');

      // Map status from backend format to UI format
      const statusMap = {
        'To Do': 'todo',
        'In Progress': 'in-progress',
        'Done': 'done'
      };
      setStatus(statusMap[task.status] || 'todo');

      // Map priority from backend format to UI format
      const priorityMap = {
        'Low': 'low',
        'Medium': 'medium',
        'High': 'high'
      };
      setPriority(priorityMap[task.priority] || 'medium');

      // Set due date if exists
      setSelectedDate(task.dueDate ? new Date(task.dueDate) : null);

      // Set assigned user if exists
      setAssignedTo(task.assignedTo?._id || task.assignedTo || '');

      // Set project if exists
      setProjectId(task.project?._id || task.project || '');
    } else {
      // Reset form for new task
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setSelectedDate(null);
      setAssignedTo('');

      // If there are projects, select the first one by default for new tasks
      if (projects.length > 0) {
        setProjectId(projects[0]._id);
      } else {
        setProjectId('');
      }
    }
  }, [task, isOpen, projects]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim()) {
      alert('Task title is required');
      return;
    }

    if (!projectId) {
      alert('Please select a project');
      return;
    }

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

    onSave({
      title,
      description,
      status: statusMapping[status],
      priority: priorityMapping[priority],
      dueDate: selectedDate ? selectedDate.toISOString() : null,
      assignedTo: assignedTo || null,
      project: projectId
    });
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 sm:p-4">
      {/* Modal Container - Full screen on mobile, modal on desktop */}
      <div ref={modalRef} className="bg-gray-900/95 w-full h-full sm:h-auto sm:rounded-xl sm:shadow-2xl sm:max-w-2xl sm:mx-auto sm:my-8 overflow-y-auto border-0 sm:border sm:border-gray-700/50">
        {/* Header - Sticky on mobile */}
        <div className="sticky top-0 z-10 bg-gray-900/95 flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 sm:p-0"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
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

          {/* Project Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Project
            </label>
            <div className="relative">
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                disabled={loadingProjects}
                required
              >
                <option value="">Select project</option>
                {loadingProjects ? (
                  <option value="" disabled>Loading projects...</option>
                ) : (
                  projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Due Date and Assign To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Due Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                customInput={<CustomInput />}
                dateFormat="dd/MM/yyyy"
                minDate={new Date()}
                placeholderText="Select due date"
                className="datepicker-input"
                calendarClassName="custom-datepicker"
                popperClassName="custom-popper"
                wrapperClassName="w-full"
                showPopperArrow={false}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Assign To
              </label>
              <div className="relative">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors appearance-none"
                  disabled={loadingUsers}
                >
                  <option value="">Select user</option>
                  {loadingUsers ? (
                    <option value="" disabled>Loading users...</option>
                  ) : (
                    users.map((user) => (
                      <option key={user._id || user.id} value={user._id || user.id}>
                        {user.name || user.email}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button - Fixed to bottom on mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-900/95 border-t border-gray-700/50 sm:relative sm:bg-transparent sm:border-0 sm:p-0 sm:pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/20 text-base font-semibold"
            >
              {task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>

          {/* Spacer for fixed button on mobile */}
          <div className="h-20 sm:h-0"></div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
