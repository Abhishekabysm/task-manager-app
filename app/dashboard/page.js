'use client';

import { useCallback, useEffect, useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Import our components
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and search
  const [view, setView] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt_desc');

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchTasks = useCallback(async () => {
    if (authLoading) return;

    setLoadingTasks(true);
    setError(null);

    const params = new URLSearchParams();
    if (view !== 'all') params.append('view', view);
    if (statusFilter) params.append('status', statusFilter);
    if (priorityFilter) params.append('priority', priorityFilter);
    if (searchTerm) params.append('search', searchTerm);
    if (sortBy) {
      const [field, direction] = sortBy.split('_');
      params.append('sortField', field);
      params.append('sortOrder', direction);
    }

    try {
      const response = await api.get('/tasks', { params });
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(`Failed to load tasks. ${err.response?.data?.message || err.message}`);
    } finally {
      setLoadingTasks(false);
    }
  }, [authLoading, view, statusFilter, priorityFilter, searchTerm, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Loading state check
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Auth guard
  if (!user) {
    return null;
  }

  // Handler functions
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilter = () => {
    // Implement filter modal or dropdown logic
    console.log('Filter clicked');
  };

  const handleSort = () => {
    // Implement sort modal or dropdown logic
    console.log('Sort clicked');
  };

  const handleEditTask = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/tasks/${taskId}`);
        setTasks(tasks.filter(task => task._id !== taskId));
      } catch (err) {
        setError(`Failed to delete task. ${err.message}`);
      }
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        const response = await api.put(`/tasks/${taskToEdit._id}`, taskData);
        setTasks(tasks.map(task => task._id === response.data._id ? response.data : task));
      } else {
        const response = await api.post('/tasks', taskData);
        setTasks([response.data, ...tasks]);
      }
      setIsModalOpen(false);
      setTaskToEdit(null);
    } catch (err) {
      setError(`Failed to save task. ${err.message}`);
    }
  };

  return (
    <div className="max-w-[98%] mx-auto px-1 sm:px-2 lg:px-3 py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">My Tasks</h1>
          <p className="text-gray-400 text-lg">Welcome back, {user?.name || 'User'}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/20"
        >
          <HiPlus className="w-6 h-6" />
          <span className="font-semibold">New Task</span>
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="bg-gray-900/60 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tasks..."
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={handleFilter}
              className="px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filter
            </button>
            
            <button 
              onClick={handleSort}
              className="px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              Sort
            </button>
          </div>
        </div>
      </div>

      {/* Task List Component */}
      <TaskList 
        tasks={tasks}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          task={taskToEdit}
          onSave={handleSaveTask}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}

