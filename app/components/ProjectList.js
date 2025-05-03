'use client';

import { HiDotsVertical, HiFolder, HiPlus } from 'react-icons/hi';
import { useState } from 'react';
import { useProjects } from '../context/ProjectContext';
import ProjectModal from './ProjectModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

const ProjectList = () => {
  const { projects, currentProject, setCurrentProject, loading, deleteProject } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [showActionsFor, setShowActionsFor] = useState(null);

  const handleCreateProject = () => {
    setProjectToEdit(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setIsModalOpen(true);
    setShowActionsFor(null);
  };

  const handleDeleteProject = (project) => {
    setProjectToDelete(project);
    setIsDeleteModalOpen(true);
    setShowActionsFor(null);
  };

  const handleConfirmDelete = async () => {
    if (projectToDelete) {
      await deleteProject(projectToDelete._id);
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const handleSelectProject = (project) => {
    setCurrentProject(project);
  };

  const toggleActions = (projectId) => {
    setShowActionsFor(showActionsFor === projectId ? null : projectId);
  };

  if (loading && projects.length === 0) {
    return (
      <div className="p-4 bg-gray-900/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <button 
            onClick={handleCreateProject}
            className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all duration-200"
            disabled={loading}
          >
            <HiPlus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center py-6">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-solid border-purple-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900/60 rounded-xl backdrop-blur-sm border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Projects</h2>
        <button 
          onClick={handleCreateProject}
          className="p-2 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg transition-all duration-200"
          title="Create new project"
        >
          <HiPlus className="w-5 h-5" />
        </button>
      </div>
      
      {projects.length === 0 ? (
        <div className="text-center py-6 bg-gray-800/20 rounded-lg">
          <HiFolder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-300">No projects</h3>
          <p className="mt-1 text-sm text-gray-400">Get started by creating a new project.</p>
          <div className="mt-6">
            <button
              onClick={handleCreateProject}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-200 text-sm font-medium"
            >
              Create Project
            </button>
          </div>
        </div>
      ) : (
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project._id} className="relative">
              <div 
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  currentProject && currentProject._id === project._id 
                    ? 'bg-purple-600/20 border border-purple-500/30' 
                    : 'hover:bg-gray-800/40 border border-transparent'
                }`}
                onClick={() => handleSelectProject(project)}
              >
                <div className="flex items-center">
                  <HiFolder className={`w-5 h-5 mr-3 ${
                    currentProject && currentProject._id === project._id 
                      ? 'text-purple-400' 
                      : 'text-gray-400'
                  }`} />
                  <span className={`font-medium ${
                    currentProject && currentProject._id === project._id 
                      ? 'text-white' 
                      : 'text-gray-300'
                  }`}>
                    {project.name}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleActions(project._id);
                  }}
                  className="p-1 hover:bg-gray-700/50 rounded-full"
                >
                  <HiDotsVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              {/* Actions dropdown */}
              {showActionsFor === project._id && (
                <div className="absolute right-0 mt-1 w-36 rounded-lg bg-[#1a1a2e] shadow-xl z-20 border border-gray-700/50">
                  <div className="py-1" role="menu">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 flex items-center cursor-pointer transition-all duration-200"
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
                      onClick={() => handleDeleteProject(project)}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center cursor-pointer transition-all duration-200"
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
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      
      {/* Project Modal */}
      {isModalOpen && (
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setProjectToEdit(null);
          }}
          project={projectToEdit}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will also delete all tasks associated with this project.`}
        confirmButtonText="Delete Project"
      />
    </div>
  );
};

export default ProjectList;
