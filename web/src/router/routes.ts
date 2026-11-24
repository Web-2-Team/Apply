export const routes = {
  login: '/',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  projects: '/projects',
  projectDetail: (projectId: string | number = ':projectId') => `/projects/${projectId}`,
  applications: '/applications',
  savedProjects: '/saved',
  postings: '/postings',
  profile: '/profile',
} as const;
