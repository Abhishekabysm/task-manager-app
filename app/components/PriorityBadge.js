const PriorityBadge = ({ priority }) => {
  const getPriorityStyles = () => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityStyles()}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;