import { useState } from "react";
import { FiBriefcase, FiLink, FiSend, FiX } from "react-icons/fi";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import ProjectBookmark from "../../components/ProjectBookmark/ProjectBookmark";
import WorkspaceDialog from "../../components/WorkspaceDialog/WorkspaceDialog";
import useProjectDetail from "../../data/useProjectDetail";
import {
  addApplication,
  createLocalId,
  deadlineLabel,
  getProjectCategories,
  getProjectRoles,
  isRecruiting,
  localDate,
} from "../../data/workspace";
import { routes } from "../../router/routes";
import "./ProjectDetailPage.styles.css";
import "./ApplicationForm.styles.css";

const applicationTextLimit = 1000;

function ApplicationTextField({ name, label, placeholder }) {
  const [length, setLength] = useState(0);

  return (
    <label className="application-form-field">
      <span>
        {label}{" "}
        <span className="application-required" aria-hidden="true">
          *
        </span>
      </span>
      <textarea
        name={name}
        placeholder={placeholder}
        maxLength={applicationTextLimit}
        onChange={(event) => setLength(event.target.value.length)}
        required
      />
      <small className="application-char-count" aria-hidden="true">
        {length} / {applicationTextLimit}
      </small>
    </label>
  );
}

function ApplicationSummary({ project, role }) {
  return (
    <div className="application-project-summary">
      <span className="application-project-icon" aria-hidden="true">
        <FiBriefcase />
      </span>
      <div>
        <strong>{project.title}</strong>
        <span>{role.title}</span>
      </div>
      <span className="application-deadline">{deadlineLabel(project)}</span>
    </div>
  );
}

function ApplicationForm({ project, role, onSubmit, onDismiss }) {
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const introduction = form.get("introduction").trim();
    const motivation = form.get("motivation").trim();
    const portfolioUrl = form.get("portfolioUrl").trim();
    if (!introduction || !motivation) {
      setError("자기소개와 지원 동기를 모두 입력해 주세요.");
      return;
    }
    if (portfolioUrl && !/^https?:\/\//i.test(portfolioUrl)) {
      setError("포트폴리오 링크는 http 또는 https 주소를 입력해 주세요.");
      return;
    }

    const submissionError = onSubmit({
      id: createLocalId(),
      projectId: project.id,
      roleId: role.id,
      introduction,
      motivation,
      portfolioUrl,
      date: localDate(),
      status: "review",
    });
    if (submissionError) setError(submissionError);
  }

  return (
    <WorkspaceDialog
      title="지원서 작성"
      onDismiss={onDismiss}
      className="project-application-dialog"
    >
      <button
        className="application-close"
        type="button"
        aria-label="지원서 닫기"
        onClick={onDismiss}
      >
        <FiX aria-hidden="true" />
      </button>
      <form
        className="project-application-form"
        onSubmit={handleSubmit}
        onChange={() => setError("")}
      >
        <div className="application-form-body">
          <p className="application-form-description">
            제출한 지원서는 공고 운영자가 확인해요.
          </p>
          <ApplicationSummary project={project} role={role} />
          <ApplicationTextField
            name="introduction"
            label="자기소개"
            placeholder="어떤 경험과 기술을 가지고 있는지 소개해 주세요."
          />
          <ApplicationTextField
            name="motivation"
            label="지원 동기"
            placeholder="이 프로젝트에 관심을 가진 이유와 함께하고 싶은 일을 적어 주세요."
          />
          <label className="application-form-field">
            <span>
              포트폴리오 <small className="application-optional">선택</small>
            </span>
            <span className="application-link-field">
              <FiLink aria-hidden="true" />
              <input
                name="portfolioUrl"
                type="url"
                placeholder="https://"
                autoComplete="url"
              />
            </span>
          </label>
          {error && (
            <p className="workspace-form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="workspace-dialog-actions application-form-actions">
          <CommonButton variant="secondary" onClick={onDismiss}>
            취소
          </CommonButton>
          <CommonButton type="submit">
            <FiSend aria-hidden="true" /> 지원서 제출
          </CommonButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}

function ApplicationConfirmation({ project, role, onSubmit, onDismiss }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await onSubmit();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "지원 요청을 완료하지 못했어요.",
      );
      setSubmitting(false);
    }
  }

  function dismiss() {
    if (!submitting) onDismiss();
  }

  return (
    <WorkspaceDialog
      title="프로젝트 지원"
      onDismiss={dismiss}
      className="project-application-dialog"
    >
      <form className="project-application-form" onSubmit={handleSubmit}>
        <div className="application-form-body">
          <p className="application-form-description">
            선택한 역할로 지원할까요?
          </p>
          <ApplicationSummary project={project} role={role} />
          {error && (
            <p className="workspace-form-error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="workspace-dialog-actions application-form-actions">
          <CommonButton
            variant="secondary"
            disabled={submitting}
            onClick={dismiss}
          >
            취소
          </CommonButton>
          <CommonButton type="submit" loading={submitting}>
            <FiSend aria-hidden="true" /> 지원하기
          </CommonButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}

function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { workspace, setWorkspace, projectApi } = useOutletContext();
  const [applyingTo, setApplyingTo] = useState(null);
  const { project, loading, error, reload } = useProjectDetail(projectId);
  const applications = workspace.applications.filter(
    (item) => item.projectId === projectId,
  );

  if (loading || error || !project) {
    return (
      <main className="project-content">
        <h1>프로젝트 상세</h1>
        {loading ? (
          <p role="status">공고를 불러오는 중이에요.</p>
        ) : (
          <p role={error ? "alert" : undefined}>
            {error || "공고를 찾을 수 없어요."}
          </p>
        )}
        {error && (
          <CommonButton variant="secondary" onClick={reload}>
            다시 시도
          </CommonButton>
        )}
        <Link to={routes.projects}>프로젝트 찾기</Link>
      </main>
    );
  }

  const recruiting = isRecruiting(project);
  const roles = getProjectRoles(project);
  const selectedRole =
    applyingTo?.projectId === project.id
      ? roles.find(({ id }) => id === applyingTo.roleId)
      : null;
  const applied = applications.some((item) => !item.isReviewSample);
  const isPublisher = workspace.mode === "publisher";
  const ownProject = Boolean(projectApi && project.managed);
  const canApply = recruiting && !applied && !isPublisher && !ownProject;
  const deadlineTime = project.deadlineHour ? `${project.deadlineHour}:00` : "";

  function submitApplication(application) {
    const updated = addApplication(workspace, application);
    if (updated === workspace) {
      return isRecruiting(project)
        ? "지원서를 접수할 수 없어요. 이미 지원했는지 확인해 주세요."
        : "모집이 마감되어 지원서를 제출할 수 없어요.";
    }
    setWorkspace(updated);
    setApplyingTo(null);
    navigate(routes.applications);
  }

  async function submitRemoteApplication() {
    if (!isRecruiting(project)) {
      throw new Error("모집이 마감되어 지원할 수 없어요.");
    }
    const receipt = {
      id: createLocalId(),
      projectId: project.id,
      projectTitle: project.title,
      roleId: selectedRole.id,
      role: selectedRole.title,
      date: localDate(),
      status: "review",
      applicant: workspace.profile.name,
    };
    await projectApi.apply(project.id, selectedRole.spec);
    setWorkspace((current) => ({
      ...current,
      applications: [receipt, ...current.applications],
    }));
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
            {getProjectCategories(project).map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        </div>
        <div className="project-heading-actions">
          <span
            className={
              recruiting
                ? "project-status"
                : "project-status project-status-closed"
            }
          >
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
            {(project.duration || project.logistics?.length > 0) && (
              <div className="project-meta">
                {project.duration && <span>기간 {project.duration}</span>}
                {project.logistics
                  ?.filter(
                    (item) => !project.duration || !item.startsWith("기간 "),
                  )
                  .map((item) => (
                    <span key={item}>{item}</span>
                  ))}
              </div>
            )}
          </section>

          <section className="project-card project-role-card">
            <h2>함께할 역할</h2>
            {!roles.length && <p>등록된 모집 역할이 없어요.</p>}
            <ul className="project-role-list">
              {roles.map((role) => (
                <li className="project-role-row" key={role.id}>
                  <div className="project-role-copy">
                    <strong>{role.title}</strong>
                    {role.id === "default" && project.roleDetails && (
                      <span>{project.roleDetails}</span>
                    )}
                  </div>
                  <span className="project-role-openings">
                    {role.members}명 모집
                  </span>
                  {!applied && (
                    <CommonButton
                      className="project-apply-button"
                      disabled={!canApply}
                      aria-label={
                        canApply ? `${role.title} 지원하기` : undefined
                      }
                      onClick={() =>
                        setApplyingTo({
                          projectId: project.id,
                          roleId: role.id,
                        })
                      }
                    >
                      {!recruiting
                        ? "모집 마감"
                        : ownProject
                          ? "내가 등록한 공고"
                          : isPublisher
                            ? "사용자 모드에서 지원"
                            : "지원하기"}
                    </CommonButton>
                  )}
                </li>
              ))}
            </ul>
            {applied && (
              <div className="project-role-actions">
                <CommonButton
                  className="project-apply-button"
                  onClick={() => navigate(routes.applications)}
                >
                  내 지원 현황 보기
                </CommonButton>
              </div>
            )}
          </section>

          <section className="project-card project-guidance">
            <h2>지원 및 진행 안내</h2>
            <p>
              {project.applicationGuide ||
                (projectApi
                  ? "모집 역할을 선택해 지원할 수 있어요."
                  : "간단한 소개와 관심 이유를 작성해 주세요. 운영자가 지원 내용을 확인한 뒤 합격 여부를 안내합니다.")}
            </p>
          </section>

          <section className="project-stats" aria-label="프로젝트 현황">
            {project.organizer && <span>주최&nbsp; {project.organizer}</span>}
            {Number.isFinite(project.members) && (
              <span>모집&nbsp; {project.members}명</span>
            )}
            {!projectApi && <span>지원&nbsp; {applications.length}명</span>}
          </section>
        </div>

        <aside className="project-card project-support-card">
          <h2>지원 정보</h2>
          <div className="project-deadline">
            <span>지원 마감</span>
            <strong>
              <time
                dateTime={
                  deadlineTime
                    ? `${project.deadline}T${deadlineTime}`
                    : project.deadline
                }
              >
                {deadlineTime
                  ? `${project.deadline} ${deadlineTime}`
                  : project.deadline}
              </time>{" "}
              ({deadlineLabel(project)})
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
            {projectApi
              ? "이 브라우저에서 제출한 지원은 ‘내 지원 현황’에서 확인할 수 있어요."
              : "지원 후에는 ‘내 지원 현황’에서 진행 상태를 확인할 수 있어요."}
          </p>
        </aside>
      </div>
      {selectedRole &&
        (projectApi ? (
          <ApplicationConfirmation
            project={project}
            role={selectedRole}
            onSubmit={submitRemoteApplication}
            onDismiss={() => setApplyingTo(null)}
          />
        ) : (
          <ApplicationForm
            project={project}
            role={selectedRole}
            onSubmit={submitApplication}
            onDismiss={() => setApplyingTo(null)}
          />
        ))}
    </main>
  );
}

export default ProjectDetailPage;
