'use client';

import { useEffect, useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { ProjectProvider } from '../context/ProjectContext';
import api from '../lib/api';

// Import our components
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import ProjectList from '../components/ProjectList';
import TaskList from '../components/TaskList';
import TaskModal from '../components/TaskModal';

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will be redirected by auth system)
  if (!isAuthenticated) {
    return null;
  }

  // Only render the dashboard content when authenticated
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // State for Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Fetch tasks when component mounts
  useEffect(() => {
    const fetchTasks = async () => {
      console.log('Fetching tasks...');
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/tasks');
        console.log('Tasks fetched:', response.data);
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError(`Failed to load tasks. ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Show loading spinner while fetching tasks
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  // Handler functions
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleEditTask = async (task) => {
    // Check if current user is the creator
    if (user.id !== task.createdBy?._id && user._id !== task.createdBy?._id) {
      alert("You don't have permission to edit this task. Only the creator can modify tasks.");
      return;
    }
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find(t => t._id === taskId);
    if (!taskToDelete ||
        (user.id !== taskToDelete.createdBy?._id &&
         user._id !== taskToDelete.createdBy?._id)) {
      alert("You don't have permission to delete this task. Only the creator can delete tasks.");
      return;
    }

    setTaskToDelete(taskToDelete);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/tasks/${taskToDelete._id}`);
      setTasks(tasks.filter(task => task._id !== taskToDelete._id));
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);

      // Refresh the task list to ensure we have the latest data
      setLoading(true);
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (refreshErr) {
        console.error('Failed to refresh tasks:', refreshErr);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setError(`Failed to delete task. ${err.message}`);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (taskToEdit) {
        // Editing existing task
        const response = await api.put(`/tasks/${taskToEdit._id}`, taskData);
        setTasks(tasks.map(task =>
          task._id === response.data._id ? response.data : task
        ));
      } else {
        // Creating new task
        const response = await api.post('/tasks', taskData);
        setTasks([response.data, ...tasks]);
      }
      setIsModalOpen(false);
      setTaskToEdit(null);

      // Refresh the task list to ensure we have the latest data
      setLoading(true);
      try {
        const response = await api.get('/tasks');
        setTasks(response.data);
      } catch (refreshErr) {
        console.error('Failed to refresh tasks:', refreshErr);
      } finally {
        setLoading(false);
      }
    } catch (err) {
      setError(`Failed to save task. ${err.message}`);
    }
  };

  return (
    <div className="max-w-[98%] mx-auto px-1 sm:px-2 lg:px-3 py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-gray-900/60 backdrop-blur-sm rounded-xl border border-gray-700/50 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">Dashboard</h1>
          <p className="text-gray-400 text-lg">Welcome back, {user?.name || 'User'}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/20 cursor-pointer"
        >
          <HiPlus className="w-6 h-6" />
          <span className="font-semibold">New Task</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Projects */}
        <div className="lg:col-span-1">
          <ProjectList />
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
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
                  className="px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filter
                </button>

                <button
                  className="px-4 py-2 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-800/60 transition-colors flex items-center gap-2 cursor-pointer"
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
          <div className="relative z-[2]">
            <TaskList
              tasks={tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setTaskToEdit(null);
          }}
          task={taskToEdit}  // Make sure this matches
          onSave={handleSaveTask}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        taskTitle={taskToDelete?.title || ''}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500">
          {error}
        </div>
      )}
    </div>
  );
}

