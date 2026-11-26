import { FiBookmark } from 'react-icons/fi';
import { useOutletContext } from 'react-router-dom';
import CommonButton from '../Button/Button';
import { toggleSavedProject } from '../../data/workspace';
import './ProjectBookmark.styles.css';

function ProjectBookmark({ project, className = '' }) {
  const { workspace, setWorkspace, projectApi } = useOutletContext();
  const saved = workspace.savedProjectIds.includes(project.id);

  return (
    <CommonButton
      variant="secondary"
      className={`project-bookmark ${className}`.trim()}
      aria-label={`${project.title} 공고 저장`}
      aria-pressed={saved}
      title={saved ? '저장 해제' : '공고 저장'}
      onClick={() => setWorkspace((current) => toggleSavedProject(current, project.id, Boolean(projectApi)))}
    >
      <FiBookmark aria-hidden="true" />
    </CommonButton>
  );
}

export default ProjectBookmark;
