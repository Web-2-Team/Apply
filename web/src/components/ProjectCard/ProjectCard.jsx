import { Link } from 'react-router-dom';
import { deadlineLabel } from '../../data/workspace';
import { routes } from '../../router/routes';
import ProjectBookmark from '../ProjectBookmark/ProjectBookmark';
import './ProjectCard.styles.css';

function ProjectCard({ project }) {
  return (
    <article className="project-tile">
      <Link className="project-tile-link" to={routes.projectDetail(project.id)}>
        <span className="project-tile-deadline">{deadlineLabel(project)}</span>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="project-tile-meta">
          <span>{project.category}</span>
          <small>모집 {project.members}명</small>
        </div>
      </Link>
      <ProjectBookmark className="project-tile-bookmark" project={project} />
    </article>
  );
}

export default ProjectCard;
