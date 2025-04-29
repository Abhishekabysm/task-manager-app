import { useState } from 'react';
import { HiCalendar, HiDotsVertical, HiUser } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

const TaskList = ({ tasks, onEdit, onDelete }) => {
  const { user: currentUser } = useAuth();

  const MobileTaskCard = ({ task }) => {
    const [showActions, setShowActions] = useState(false);
    const assignedUserDisplay = task.assignedTo?.name || task.assignedTo?.email || '-';
    
    const isCreator = currentUser && 
      (currentUser.id === task.createdBy?._id || currentUser._id === task.createdBy?._id);

    const handleActionClick = (e) => {
      e.stopPropagation();
      setShowActions(!showActions);
    };

    const handleClickOutside = () => {
      setShowActions(false);
    };

    return (
      <div className="bg-gray-800/40 rounded-lg p-4 mb-3 border border-gray-700/50">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-gray-200 font-medium">{task.title}</h3>
          <div className="relative">
            <button 
              onClick={handleActionClick}
              className="p-1 hover:bg-gray-700/50 rounded-full"
            >
              <HiDotsVertical className="w-5 h-5 text-gray-400" />
            </button>
            
            {showActions && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={handleClickOutside}
                />
                <div className="absolute right-0 mt-1 w-28 rounded-lg bg-[#1a1a2e] shadow-xl z-20 border border-gray-700/50">
                  <div className="py-1" role="menu">
                    {isCreator ? (
                      <>
                        <button
                          onClick={() => {
                            onEdit(task);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/50 flex items-center border-b border-gray-700/50"
                        >
                          <svg 
                            className="h-4 w-4 mr-2" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            onDelete(task._id);
                            setShowActions(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800/50 flex items-center"
                        >
                          <svg 
                            className="h-4 w-4 mr-2" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          onEdit(task); // You might want to create a separate onView handler
                          setShowActions(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-200 hover:bg-gray-800/50 flex items-center"
                      >
                        <svg 
                          className="h-4 w-4 mr-2" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          {task.dueDate && (
            <div className="flex items-center gap-2">
              <HiCalendar className="w-4 h-4" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <HiUser className="w-4 h-4" />
            <span>{assignedUserDisplay}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Mobile View */}
      <div className="md:hidden">
        {tasks.map((task) => (
          <MobileTaskCard key={task._id} task={task} />
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-8 bg-gray-800/20 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-300">No tasks</h3>
            <p className="mt-1 text-sm text-gray-400">Get started by creating a new task.</p>
          </div>
        )}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-gray-900/60 rounded-xl overflow-hidden backdrop-blur-sm border border-gray-700/50 shadow-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700/50 bg-gray-800/40">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Task Title</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => {
              const isCreator = currentUser && 
                (currentUser.id === task.createdBy?._id || currentUser._id === task.createdBy?._id);

              return (
                <tr key={task._id} className="border-b border-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{task.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={task.status} /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><PriorityBadge priority={task.priority} /></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {task.assignedTo?.name || task.assignedTo?.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {isCreator ? (
                      <>
                        <button
                          onClick={() => onEdit(task)}
                          className="text-indigo-400 hover:text-indigo-300 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(task._id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => onEdit(task)} // You might want to create a separate onView handler
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;


