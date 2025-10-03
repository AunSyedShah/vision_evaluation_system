// LocalStorage keys
const KEYS = {
  USERS: 'project_eval_users',
  PROJECTS: 'project_eval_projects',
  EVALUATIONS: 'project_eval_evaluations',
  CURRENT_USER: 'project_eval_current_user'
};

// Seed data - hardcoded Super Admin and Admin
const SEED_USERS = [
  {
    id: 'sa-001',
    email: 'superadmin@system.com',
    password: 'SuperAdmin@123',
    role: 'superadmin',
    name: 'Super Administrator',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-001',
    email: 'admin@system.com',
    password: 'Admin@123',
    role: 'admin',
    name: 'System Administrator',
    createdAt: new Date().toISOString()
  }
];

// Initialize localStorage with seed data
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
  }
  if (!localStorage.getItem(KEYS.PROJECTS)) {
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.EVALUATIONS)) {
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify([]));
  }
};

// User operations
export const getUsers = () => {
  const users = localStorage.getItem(KEYS.USERS);
  return users ? JSON.parse(users) : [];
};

export const addUser = (user) => {
  const users = getUsers();
  const newUser = {
    ...user,
    id: `eval-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  return newUser;
};

export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

export const authenticateUser = (email, password) => {
  const users = getUsers();
  return users.find(user => user.email === email && user.password === password);
};

// Current user session
export const setCurrentUser = (user) => {
  const { password, ...userWithoutPassword } = user;
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));
};

export const getCurrentUser = () => {
  const user = localStorage.getItem(KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : null;
};

export const clearCurrentUser = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

// Project operations
export const getProjects = () => {
  const projects = localStorage.getItem(KEYS.PROJECTS);
  return projects ? JSON.parse(projects) : [];
};

export const addProject = (project) => {
  const projects = getProjects();
  const newProject = {
    ...project,
    id: `proj-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedEvaluators: [],
    createdBy: getCurrentUser()?.id
  };
  projects.push(newProject);
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  return newProject;
};

export const updateProject = (id, updatedData) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === id);
  if (index !== -1) {
    projects[index] = {
      ...projects[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }
  return null;
};

export const deleteProject = (id) => {
  const projects = getProjects();
  const filtered = projects.filter(p => p.id !== id);
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(filtered));
  
  // Also delete related evaluations
  const evaluations = getEvaluations();
  const filteredEvals = evaluations.filter(e => e.projectId !== id);
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify(filteredEvals));
  
  return true;
};

export const getProjectById = (id) => {
  const projects = getProjects();
  return projects.find(p => p.id === id);
};

export const assignEvaluatorsToProject = (projectId, evaluatorIds) => {
  const projects = getProjects();
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].assignedEvaluators = evaluatorIds.slice(0, 2); // Max 2 evaluators
    projects[index].updatedAt = new Date().toISOString();
    localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    return projects[index];
  }
  return null;
};

export const getProjectsForEvaluator = (evaluatorId) => {
  const projects = getProjects();
  return projects.filter(p => p.assignedEvaluators?.includes(evaluatorId));
};

// Evaluation operations
export const getEvaluations = () => {
  const evaluations = localStorage.getItem(KEYS.EVALUATIONS);
  return evaluations ? JSON.parse(evaluations) : [];
};

export const addEvaluation = (evaluation) => {
  const evaluations = getEvaluations();
  const newEvaluation = {
    ...evaluation,
    id: `eval-${Date.now()}`,
    submittedAt: new Date().toISOString()
  };
  evaluations.push(newEvaluation);
  localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify(evaluations));
  return newEvaluation;
};

export const getEvaluationsByProject = (projectId) => {
  const evaluations = getEvaluations();
  return evaluations.filter(e => e.projectId === projectId);
};

export const getEvaluationByProjectAndEvaluator = (projectId, evaluatorId) => {
  const evaluations = getEvaluations();
  return evaluations.find(e => e.projectId === projectId && e.evaluatorId === evaluatorId);
};

export const updateEvaluation = (id, updatedData) => {
  const evaluations = getEvaluations();
  const index = evaluations.findIndex(e => e.id === id);
  if (index !== -1) {
    evaluations[index] = {
      ...evaluations[index],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(KEYS.EVALUATIONS, JSON.stringify(evaluations));
    return evaluations[index];
  }
  return null;
};

// Get evaluators only
export const getEvaluators = () => {
  const users = getUsers();
  return users.filter(user => user.role === 'evaluator');
};

// Bulk import projects from CSV/Excel (will be array of objects)
export const bulkImportProjects = (projectsArray) => {
  const projects = getProjects();
  const currentUser = getCurrentUser();
  
  const newProjects = projectsArray.map(project => ({
    ...project,
    id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedEvaluators: [],
    createdBy: currentUser?.id
  }));
  
  projects.push(...newProjects);
  localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
  return newProjects;
};
