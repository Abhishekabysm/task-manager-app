'use client'; // Required for hooks and client-side interactions

import { useEffect, useState } from 'react';
import TaskModal from '../components/TaskModal'; // Import the modal
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';

// Placeholder icons (replace with actual SVGs or library)
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>;
const FilterIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>;
const SortIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;


// Helper function to format date nicely (optional)
const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    } catch (error) {
      return 'Invalid Date';
    }
};

// Helper function to get priority styling
const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-500';
    }
};

// Helper function to get status styling
const getStatusClass = (status) => {
    switch (status) {
      case 'Done': return 'bg-gray-200 text-gray-600';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'To Do': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-500';
    }
};


export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth(); // User might be needed later
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState(null);

  // State for filters and search (can be simplified or expanded)
  const [view, setView] = useState('all'); // Example filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // --- Fetch Tasks ---
  useEffect(() => {
    const fetchTasks = async () => {
      if (authLoading) return; // Wait for auth check

      setLoadingTasks(true);
      setError(null);
      const params = {};
      // Adapt params based on actual filter UI implementation
      if (view !== 'all') params.view = view; // Example
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (searchTerm) params.search = searchTerm;

      try {
        const response = await api.get('/tasks', { params });
        setTasks(response.data);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        setError('Could not load tasks.');
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [authLoading, view, statusFilter, priorityFilter, searchTerm]); // Refetch on filter change

  // --- Modal and Task Action Handlers ---
  const openCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  const handleSaveTask = async (taskData) => {
    try {
      let savedTask;
      
      if (taskToEdit) {
        // Update existing task
        const response = await api.put(`/tasks/${taskToEdit._id}`, taskData);
        savedTask = response.data;
        setTasks(tasks.map(task => task._id === savedTask._id ? savedTask : task));
      } else {
        // Create new task
        const response = await api.post('/tasks', taskData);
        savedTask = response.data;
        setTasks([savedTask, ...tasks]);
      }
      
      return savedTask;
    } catch (err) {
      console.error('Failed to save task:', err);
      // More detailed error logging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error data:', err.response.data);
        console.error('Error status:', err.response.status);
        setError(`Failed to save task. Server responded with: ${err.response.data?.message || err.response.status}`);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request:', err.request);
        setError('Failed to save task. No response received from server.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(`Failed to save task: ${err.message}`);
      }
      return null;
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        try {
            await api.delete(`/tasks/${taskId}`);
            setTasks(tasks.filter(task => task._id !== taskId));
        } catch (err) {
            console.error("Failed to delete task:", err);
            setError("Failed to delete task.");
        }
    }
  };

  // --- Render Logic ---
  // No ProtectedRoute needed here, handled by layout
  return (
    <div className="p-4 md:p-6 lg:p-8"> {/* Padding for content */}
        {/* Header Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-800">
                My Tasks
            </h1>
            <div className="flex space-x-2">
                {/* Placeholder Buttons */}
                <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Import
                </button>
                 <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                    Export
                </button>
                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-1 rounded-md border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                    <PlusIcon /> Add Task
                </button>
            </div>
        </div>

        {/* Filter/Search Bar */}
        <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                 {/* Example Filter Tabs (replace with actual implementation) */}
                 <div className="flex space-x-4 md:col-span-3 lg:col-span-2">
                    <button onClick={() => setView('all')} className={`rounded-md px-3 py-1 text-sm ${view === 'all' ? 'bg-gray-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>All Tasks</button>
                    <button onClick={() => setView('assignedToMe')} className={`rounded-md px-3 py-1 text-sm ${view === 'assignedToMe' ? 'bg-gray-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Assigned</button>
                    <button onClick={() => setView('createdByMe')} className={`rounded-md px-3 py-1 text-sm ${view === 'createdByMe' ? 'bg-gray-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Created</button>
                    <button onClick={() => setView('overdue')} className={`rounded-md px-3 py-1 text-sm ${view === 'overdue' ? 'bg-gray-200 text-gray-800 font-semibold' : 'text-gray-600 hover:bg-gray-100'}`}>Overdue</button>
                 </div>

                 {/* Search Input */}
                 <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search tasks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full rounded-md border-gray-300 py-1.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                 </div>

                 {/* Other Filters/Sort (Placeholders) */}
                 <div className="flex items-center justify-end space-x-2">
                    <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        <FilterIcon /> Filters
                    </button>
                    <button className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                        <SortIcon /> Sort
                    </button>
                 </div>
            </div>
        </div>

        {/* Task Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Add Checkbox column if needed */}
                        {/* <th scope="col" className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></th> */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Task Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Created By</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assigned To</th>
                        <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loadingTasks ? (
                        <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading tasks...</td></tr>
                    ) : error ? (
                         <tr><td colSpan="6" className="px-6 py-4 text-center text-red-600">{error}</td></tr>
                    ) : tasks.length === 0 ? (
                         <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">No tasks found.</td></tr>
                    ) : (
                        tasks.map((task) => (
                            <tr key={task._id} className="hover:bg-gray-50">
                                {/* Checkbox */}
                                {/* <td className="p-4"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /></td> */}
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                    {task.description && <div className="text-xs text-gray-500 truncate max-w-xs">{task.description}</div>}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold leading-5 ${getStatusClass(task.status)}`}>
                                        {task.status}
                                    </span>
                                </td>
                                <td className={`whitespace-nowrap px-6 py-4 text-sm font-medium ${getPriorityClass(task.priority)}`}>{task.priority}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{formatDate(task.dueDate)}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {task.createdBy?.name || task.createdBy?.email || '-'}
                                    {user && task.createdBy && (user.id === task.createdBy._id || user._id === task.createdBy._id) && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                                            You
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.assignedTo?.name || task.assignedTo?.email || '-'}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    {/* Only show edit/delete buttons if the user is the creator */}
                                    {user && task.createdBy && (user.id === task.createdBy._id || user._id === task.createdBy._id) ? (
                                        <>
                                            <button onClick={() => openEditModal(task)} className="text-indigo-600 hover:text-indigo-900 mr-3"><EditIcon /></button>
                                            <button onClick={() => handleDeleteTask(task._id)} className="text-red-600 hover:text-red-900"><DeleteIcon /></button>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">View only</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

        {/* Task Modal */}
        <TaskModal
            isOpen={isModalOpen}
            onClose={closeModal}
            initialTask={taskToEdit}
            onSubmit={handleSaveTask}
        />
    </div>
  );
}
