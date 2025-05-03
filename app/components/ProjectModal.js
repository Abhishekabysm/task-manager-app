'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';
import { useProjects } from '../context/ProjectContext';

const ProjectModal = ({ isOpen, onClose, project = null }) => {
  const modalRef = useRef(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const { createProject, updateProject } = useProjects();

  // Load initial project data when editing
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setDescription(project.description || '');
    } else {
      // Reset form for new project
      setName('');
      setDescription('');
    }
  }, [project, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!name.trim()) {
      setFormError('Project name is required');
      return;
    }

    try {
      if (project) {
        // Update existing project
        await updateProject(project._id, { name, description });
      } else {
        // Create new project
        await createProject({ name, description });
      }

      onClose();
    } catch (error) {
      setFormError('Failed to save project. Please try again.');
    }
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      {/* Modal Container - Centered and responsive */}
      <div ref={modalRef} className="bg-gray-900/95 w-full max-w-md mx-auto rounded-xl shadow-2xl overflow-hidden border border-gray-700/50 m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-900/95 flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {project ? 'Edit Project' : 'Create New Project'}
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
          {/* Error message */}
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {formError}
            </div>
          )}

          {/* Project Name */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/40 border border-gray-700/50 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-colors"
              placeholder="Enter project name"
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
              placeholder="Enter project description (optional)"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-lg hover:shadow-purple-500/20 text-base font-semibold"
            >
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
