'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

// Create the context
const ProjectContext = createContext(null);

// Create the provider component
export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  // Fetch all projects
  const fetchProjects = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated yet, skipping project fetch');
      return;
    }

    console.log('Fetching projects...');
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/projects');
      console.log('Projects fetched:', response.data);
      setProjects(response.data);

      // If there are projects and no current project is selected, select the first one
      if (response.data.length > 0 && !currentProject) {
        setCurrentProject(response.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentProject]);

  // Fetch a single project with its tasks
  const fetchProject = useCallback(async (projectId) => {
    if (!isAuthenticated || !projectId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/projects/${projectId}`);
      setCurrentProject(response.data.project);
      return response.data; // Return both project and tasks
    } catch (err) {
      console.error(`Failed to fetch project ${projectId}:`, err);
      setError('Failed to load project details. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Create a new project
  const createProject = async (projectData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/projects', projectData);
      setProjects([...projects, response.data]);
      setCurrentProject(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err.response?.data?.message || 'Failed to create project. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update a project
  const updateProject = async (projectId, projectData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/projects/${projectId}`, projectData);

      // Update projects list
      setProjects(projects.map(project =>
        project._id === projectId ? response.data : project
      ));

      // Update current project if it's the one being edited
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(response.data);
      }

      return response.data;
    } catch (err) {
      console.error(`Failed to update project ${projectId}:`, err);
      setError('Failed to update project. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Delete a project
  const deleteProject = async (projectId) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/projects/${projectId}`);

      // Remove from projects list
      const updatedProjects = projects.filter(project => project._id !== projectId);
      setProjects(updatedProjects);

      // If the deleted project was the current one, select another one
      if (currentProject && currentProject._id === projectId) {
        setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
      }

      return true;
    } catch (err) {
      console.error(`Failed to delete project ${projectId}:`, err);
      setError('Failed to delete project. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load projects on initial mount and when auth state changes
  useEffect(() => {
    console.log('Auth state changed in ProjectContext:', isAuthenticated);
    if (isAuthenticated) {
      // Add a small delay to ensure auth is fully established
      const timer = setTimeout(() => {
        fetchProjects();
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setProjects([]);
      setCurrentProject(null);
    }
  }, [isAuthenticated, fetchProjects]);

  // Context value
  const value = {
    projects,
    currentProject,
    setCurrentProject,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

// Custom hook to use the context
export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
