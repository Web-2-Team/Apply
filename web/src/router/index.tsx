import { createBrowserRouter, Navigate } from 'react-router-dom';
import WorkspaceLayout from '../components/WorkspaceLayout/WorkspaceLayout';
import ApplicationsPage from '../pages/ApplicationsPage/ApplicationsPage';
import ProjectDetailPage from '../pages/ProjectDetailPage/ProjectDetailPage';
import PostingsPage from '../pages/PostingsPage/PostingsPage';
import PublisherLayout from '../pages/PostingsPage/PublisherLayout';
import PostingEditorPage from '../pages/PostingEditorPage/PostingEditorPage';
import ApplicantReviewPage from '../pages/ApplicantReviewPage/ApplicantReviewPage';
import ProfilePage from '../pages/ProfilePage/ProfilePage';
import ProjectsPage from '../pages/ProjectsPage/ProjectsPage';
import SavedProjectsPage from '../pages/SavedProjectsPage/SavedProjectsPage';
import SignupPage from '../pages/SignupPage/SignupPage';
import LoginPage from '../pages/loginPage/LoginPage';
import ForgotPasswordPage from '../pages/loginPage/ForgotPasswordPage';
import { routes } from './routes';

export const router = createBrowserRouter([
  { path: routes.login, element: <LoginPage /> },
  { path: routes.signup, element: <SignupPage /> },
  { path: routes.forgotPassword, element: <ForgotPasswordPage /> },
  {
    element: <WorkspaceLayout />,
    children: [
      { path: routes.projects, element: <ProjectsPage /> },
      { path: routes.projectDetail(), element: <ProjectDetailPage /> },
      { path: routes.applications, element: <ApplicationsPage /> },
      { path: routes.savedProjects, element: <SavedProjectsPage /> },
      {
        element: <PublisherLayout />,
        children: [
          { path: routes.postings, element: <PostingsPage /> },
          { path: routes.newPosting, element: <PostingEditorPage /> },
          { path: routes.editPosting(), element: <PostingEditorPage /> },
          { path: routes.reviewPosting(), element: <ApplicantReviewPage /> },
        ],
      },
      { path: routes.profile, element: <ProfilePage /> },
    ],
  },
  { path: '*', element: <Navigate to={routes.projects} replace /> },
]);
