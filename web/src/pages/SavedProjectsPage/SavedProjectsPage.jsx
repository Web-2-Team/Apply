import { Link, useOutletContext } from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { routes } from "../../router/routes";
import "./SavedProjectsPage.styles.css";

function SavedProjectsPage() {
  const {
    workspace: { projects, savedProjectIds },
    openProjects,
    projectList,
  } = useOutletContext();
  const projectsById = new Map(
    projects.map((project) => [project.id, project]),
  );
  const savedProjects = savedProjectIds
    .map((id) => projectsById.get(id))
    .filter(Boolean);

  return (
    <main className="saved-projects">
      <h1>저장한 공고</h1>
      {projectList.loading ? (
        <p role="status">공고를 불러오는 중이에요.</p>
      ) : projectList.error ? (
        <div className="saved-projects-empty">
          <p role="alert">{projectList.error}</p>
          <CommonButton variant="secondary" onClick={projectList.reload}>
            다시 불러오기
          </CommonButton>
        </div>
      ) : (
        <>
          <h2 aria-live="polite">총 {savedProjects.length}개</h2>
          {savedProjects.length > 0 ? (
            <section
              className="project-card-grid"
              aria-label="저장한 공고 목록"
            >
              {savedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </section>
          ) : (
            <div className="saved-projects-empty">
              <p>아직 저장한 공고가 없어요.</p>
              <Link to={routes.projects} onClick={openProjects}>
                프로젝트 찾기
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default SavedProjectsPage;
