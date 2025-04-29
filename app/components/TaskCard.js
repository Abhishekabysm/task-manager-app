'use client'; // Component includes interactive elements (buttons)


// Helper function to format date nicely (optional)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

// Helper function to get priority color
const getPriorityColor = (priority) => {
  switch (priority) {
    case 'High': return 'text-red-600 bg-red-100';
    case 'Medium': return 'text-yellow-600 bg-yellow-100';
    case 'Low': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

// Helper function to get status color
const getStatusColor = (status) => {
    switch (status) {
      case 'Done': return 'text-gray-500 bg-gray-200 line-through'; // Add line-through for done tasks
      case 'In Progress': return 'text-blue-600 bg-blue-100';
      case 'To Do': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };


const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  if (!task) return null; // Handle case where task is somehow null

  const { _id, title, description, dueDate, priority, status, assignedTo, user } = task;

  const handleEditClick = () => {
    if (onEdit) onEdit(_id); // Pass task ID to edit handler
    // TODO: Implement modal or navigation for editing
    console.log(`Edit task clicked: ${_id}`);
  };

  const handleDeleteClick = () => {
    if (onDelete) onDelete(_id); // Pass task ID to delete handler
    // TODO: Implement confirmation and API call for deletion
    console.log(`Delete task clicked: ${_id}`);
  };

  const isOverdue = !['Done'].includes(status) && dueDate && new Date(dueDate) < new Date();

  return (
    <div className="bg-gray-800 rounded-lg shadow p-4 border-l-4 border-blue-500">
      <div className="flex items-start justify-between">
        <h3 className="text-lg font-medium text-white">{task.title}</h3>
        <div className="flex space-x-2">
          {/* Placeholder Edit/Delete Buttons */}
          <button
            onClick={handleEditClick}
            className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            aria-label={`Edit task ${title}`}
          >
            Edit {/* Replace with Icon later */}
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
            aria-label={`Delete task ${title}`}
          >
            Delete {/* Replace with Icon later */}
          </button>
        </div>
      </div>

      {description && (
        <p className={`mt-1 text-sm ${status === 'Done' ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        {/* Status Badge */}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(status)} border ${status === 'Done' ? 'border-gray-300' : 'border-transparent'}`}>
          {status}
        </span>

        {/* Priority Badge */}
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityColor(priority)}`}>
          Priority: {priority}
        </span>

        {/* Due Date */}
        {dueDate && (
          <span className={`flex items-center ${isOverdue ? 'font-bold text-orange-600' : 'text-gray-500'}`}>
            {/* Optional: Add Calendar Icon */}
            Due: {formatDate(dueDate)} {isOverdue && "(Overdue)"}
          </span>
        )}

        {/* Assigned User */}
        {assignedTo && (
          <span className="text-gray-500">
            {/* Optional: Add User Icon */}
            Assigned: {assignedTo.name || assignedTo.email || 'Unknown'}
          </span>
        )}

         {/* Creator User (Optional display) */}
         {/* <span className="text-gray-500">
             Created By: {user?.name || user?.email || 'Unknown'}
         </span> */}
      </div>

      {/* Add this section to show assignment info */}
      {task.assignedTo && (
        <div className="mt-2 flex items-center text-xs text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <span>
            Assigned to: {
              typeof task.assignedTo === 'object' 
                ? (task.assignedTo.name || `${task.assignedTo.firstName || ''} ${task.assignedTo.lastName || ''}`.trim())
                : 'Someone'
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
