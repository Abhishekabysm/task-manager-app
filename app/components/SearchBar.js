const SearchBar = ({ onSearch, onFilter, onSort }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-900/40 border border-gray-800/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-150"
          onChange={(e) => onSearch(e.target.value)}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={onFilter}
          className="px-4 py-2.5 bg-gray-900/40 border border-gray-800/50 rounded-xl text-white hover:bg-gray-800 transition-colors duration-150 flex items-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
          <span>Filter</span>
        </button>
        
        <button
          onClick={onSort}
          className="px-4 py-2.5 bg-gray-900/40 border border-gray-800/50 rounded-xl text-white hover:bg-gray-800 transition-colors duration-150 flex items-center gap-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3z" />
          </svg>
          <span>Sort</span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;