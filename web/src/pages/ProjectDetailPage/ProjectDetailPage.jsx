import { useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import ProjectBookmark from "../../components/ProjectBookmark/ProjectBookmark";
import WorkspaceDialog from "../../components/WorkspaceDialog/WorkspaceDialog";
import {
  addApplication,
  deadlineLabel,
  isRecruiting,
  localDate,
} from "../../data/workspace";
import { routes } from "../../router/routes";
import "./ProjectDetailPage.styles.css";

function ApplicationForm({ project, onSubmit, onDismiss }) {
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const introduction = form.get("introduction").trim();
    const motivation = form.get("motivation").trim();
    if (!introduction || !motivation) {
      setError("자기소개와 지원 동기를 모두 입력해 주세요.");
      return;
    }

    onSubmit({
      id: crypto.randomUUID(),
      projectId: project.id,
      introduction,
      motivation,
      date: localDate(),
      status: "review",
    });
  }

  return (
    <WorkspaceDialog title="지원서 작성" onDismiss={onDismiss}>
      <p>{project.title}</p>
      <form className="workspace-dialog-form" onSubmit={handleSubmit}>
        <label className="workspace-dialog-field">
          자기소개
          <textarea name="introduction" maxLength={1000} required />
        </label>
        <label className="workspace-dialog-field">
          지원 동기
          <textarea name="motivation" maxLength={1000} required />
        </label>
        {error && (
          <p className="workspace-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="workspace-dialog-actions">
          <CommonButton variant="secondary" onClick={onDismiss}>
            취소
          </CommonButton>
          <CommonButton type="submit">지원서 제출</CommonButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { workspace, setWorkspace } = useOutletContext();
  const [applyingTo, setApplyingTo] = useState(null);
  const project = workspace.projects.find(({ id }) => id === projectId);
  const applications = workspace.applications.filter(
    (item) => item.projectId === projectId,
  );

  if (!project) {
    return (
      <main className="project-content">
        <h1>공고를 찾을 수 없어요.</h1>
        <Link to={routes.projects}>프로젝트 찾기</Link>
      </main>
    );
  }

  const recruiting = isRecruiting(project);
  const applied = applications.length > 0;
  const isPublisher = workspace.mode === "publisher";
  const canApply = recruiting && !applied && !isPublisher;

  function submitApplication(application) {
    setWorkspace((current) => addApplication(current, application));
    setApplyingTo(null);
    navigate(routes.applications);
  }

  return (
    <main className="project-content">
      <p className="project-breadcrumb">
        프로젝트 찾기&nbsp; / &nbsp;프로젝트 상세
      </p>
      <div className="project-heading-row">
        <div>
          <h1>{project.title}</h1>
          <p className="project-subtitle">{project.description}</p>
          <div className="project-tags">
            <span>{project.category}</span>
          </div>
        </div>
        <div className="project-heading-actions">
          <span className={recruiting ? "project-status" : "project-status project-status-closed"}>
            {recruiting ? "모집 중" : "모집 마감"}
          </span>
          <ProjectBookmark project={project} />
        </div>
      </div>

      <div className="project-detail-grid">
        <div className="project-left-column">
          <section className="project-card project-overview">
            <h2>프로젝트 소개</h2>
            <p>{project.overview ?? project.description}</p>
            {project.logistics && (
              <div className="project-meta">
                {project.logistics.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            )}
          </section>

          <section className="project-card project-role-card">
            <h2>함께할 역할</h2>
            <div className="project-role-row">
              <div className="project-role-copy">
                <strong>{project.category}</strong>
                {project.roleDetails && <span>{project.roleDetails}</span>}
              </div>
              <span className="project-role-openings">
                {project.members}명 모집
              </span>
              {applied ? (
                <CommonButton
                  className="project-apply-button"
                  onClick={() => navigate(routes.applications)}
                >
                  내 지원 현황 보기
                </CommonButton>
              ) : (
                <CommonButton
                  className="project-apply-button"
                  disabled={!canApply}
                  onClick={() => setApplyingTo(project.id)}
                >
                  {!recruiting
                    ? "모집 마감"
                    : isPublisher
                      ? "사용자 모드에서 지원"
                      : "지원하기"}
                </CommonButton>
              )}
            </div>
          </section>

          <section className="project-card project-guidance">
            <h2>지원 및 진행 안내</h2>
            <p>
              간단한 소개와 관심 이유를 작성해 주세요. 운영자가 지원 내용을
              확인한 뒤 합격 여부를 안내합니다.
            </p>
          </section>

          <section className="project-stats" aria-label="프로젝트 현황">
            {project.organizer && <span>주최&nbsp; {project.organizer}</span>}
            <span>모집&nbsp; {project.members}명</span>
            <span>지원&nbsp; {applications.length}명</span>
          </section>
        </div>

        <aside className="project-card project-support-card">
          <h2>지원 정보</h2>
          <div className="project-deadline">
            <span>지원 마감</span>
            <strong>
              <time dateTime={project.deadline}>{project.deadline}</time> (
              {deadlineLabel(project)})
            </strong>
          </div>
          <hr />
          <h3>지원 전 확인해 주세요</h3>
          <ul>
            <li>역할과 주간 참여 시간을 확인했어요</li>
            <li>프로젝트 소개와 목표를 읽었어요</li>
            <li>지원 후 결과 안내를 기다려요</li>
          </ul>
          <p className="project-support-note">
            지원 후에는 ‘내 지원 현황’에서 진행 상태를 확인할 수 있어요.
          </p>
        </aside>
      </div>
      {applyingTo === project.id && canApply && (
        <ApplicationForm
          project={project}
          onSubmit={submitApplication}
          onDismiss={() => setApplyingTo(null)}
        />
      )}
    </main>
  );
}

export default ProjectDetailPage;
