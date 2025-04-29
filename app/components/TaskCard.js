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
    <div className="task-card group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-gray-400 hover:text-white mr-2">
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <h3 className="text-white font-medium mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-400">
            {formatDate(dueDate)}
          </span>
        </div>
        <span className={`text-sm font-medium ${getPriorityColor(priority)}`}>
          {priority}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
