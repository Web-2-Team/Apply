export const routes = {
  login: '/',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  projects: '/projects',
  projectDetail: (projectId: string | number = ':projectId') => `/projects/${projectId}`,
  applications: '/applications',
  savedProjects: '/saved',
  postings: '/postings',
  newPosting: '/postings/new',
  editPosting: (projectId: string | number = ':projectId') => `/postings/${projectId}/edit`,
  reviewPosting: (projectId: string | number = ':projectId') => `/postings/${projectId}/review`,
  profile: '/profile',
} as const;
