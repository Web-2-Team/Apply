import { useState } from "react";
import { FiArrowLeft, FiExternalLink, FiUser } from "react-icons/fi";
import { Link, useOutletContext, useParams } from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import WorkspaceDialog from "../../components/WorkspaceDialog/WorkspaceDialog";
import { projectIdString } from "../../data/projectContract";
import useProjectDetail from "../../data/useProjectDetail";
import { applicationStatuses, getProjectRoles, reviewApplication } from "../../data/workspace";
import { routes } from "../../router/routes";
import "./ApplicantReviewPage.styles.css";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

function portfolioLink(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url : null;
  } catch {
    return null;
  }
}

function ApplicantReview({ project, applications, onDecision, remote }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sort, setSort] = useState("recent");
  const [selectedId, setSelectedId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [pendingDecision, setPendingDecision] = useState(null);

  const [firstRole] = getProjectRoles(project);
  const getRole = (application) => application.role || (remote ? undefined : firstRole?.title);
  const roles = [...new Set(applications.map(getRole))].filter(Boolean);
  const selected = applications.find(({ id }) => id === selectedId);
  const visible = applications
    .filter((item) => !statusFilter || item.status === statusFilter)
    .filter((item) => !roleFilter || getRole(item) === roleFilter)
    .sort((a, b) => sort === "oldest"
      ? (a.date ?? "").localeCompare(b.date ?? "")
      : (b.date ?? "").localeCompare(a.date ?? ""));

  async function decide(application, status) {
    if (pendingDecision) return;
    setPendingDecision({ id: application.id, status });
    setDecisionError("");
    setFeedback("");
    try {
      await onDecision(application, status);
      setFeedback(`${application.applicant} 지원자를 ${applicationStatuses[status].label} 처리했어요.`);
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : "심사 결과를 저장하지 못했어요.");
    } finally {
      setPendingDecision(null);
    }
  }

  const listUnavailable = remote && applications.length === 0;

  return (
    <main className="creator-page applicant-review-page">
      <Link className="creator-back" to={routes.postings}><FiArrowLeft aria-hidden="true" /> 공고 관리</Link>
      <h1>지원자 심사</h1>

      <section className="review-posting-summary" aria-label="검토 중인 공고">
        <div>
          <span>검토 중인 공고</span>
          <h2>{project.title}</h2>
        </div>
        <p>
          {!listUnavailable && <span>{remote ? "확인된 지원자" : "지원자"} {applications.length}명 · </span>}
          모집 {project.members}명
        </p>
      </section>

      {!listUnavailable && (
        <dl className="review-statistics" aria-label="지원자 심사 현황">
          <div><dt>{remote ? "확인된 지원자" : "지원자 전체"}</dt><dd>{applications.length}</dd></div>
          {Object.entries(applicationStatuses).map(([status, { label }]) => (
            <div key={status}>
              <dt>{label}</dt>
              <dd className={`review-count--${status}`}>
                {applications.filter((item) => item.status === status).length}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <section aria-labelledby="applicant-review-list">
        <div className="review-toolbar">
          <h2 id="applicant-review-list">지원자 목록</h2>
          {!listUnavailable && <div className="review-filters">
            <select aria-label="심사 상태" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">전체 상태</option>
              {Object.entries(applicationStatuses).map(([status, { label }]) => (
                <option key={status} value={status}>{label}</option>
              ))}
            </select>
            <select aria-label="지원 역할" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">역할 전체</option>
              {roles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
            <select aria-label="지원일 정렬" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recent">최신 지원순</option>
              <option value="oldest">오래된 지원순</option>
            </select>
          </div>}
        </div>

        {visible.length ? (
          <table className="review-table">
            <thead>
              <tr>
                <th scope="col">지원자</th>
                <th scope="col">지원 역할</th>
                <th scope="col">지원일</th>
                <th scope="col">포트폴리오</th>
                <th scope="col">심사 결정</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((application) => {
                const portfolio = portfolioLink(application.portfolioUrl);
                const status = applicationStatuses[application.status];
                const date = Date.parse(application.date);
                return (
                  <tr key={application.id}>
                    <td>
                      <div className="review-person">
                        <span className="review-person-icon" aria-hidden="true"><FiUser /></span>
                        <div>
                          <button type="button" className="review-person-name" aria-haspopup="dialog" onClick={() => setSelectedId(application.id)}>
                            {application.applicant}
                          </button>
                          {application.experience && <span className="review-experience">{application.experience}</span>}
                        </div>
                      </div>
                    </td>
                    <td data-label="지원 역할">{getRole(application) || "—"}</td>
                    <td data-label="지원일">
                      {Number.isFinite(date) ? <time dateTime={application.date}>{dateFormatter.format(date)}</time> : "—"}
                    </td>
                    <td data-label="포트폴리오">
                      {portfolio ? (
                        <a
                          className="creator-secondary review-portfolio"
                          href={portfolio.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${application.applicant} 포트폴리오 보기 (새 탭)`}
                        >
                          포트폴리오 보기
                          <FiExternalLink aria-hidden="true" />
                        </a>
                      ) : "—"}
                    </td>
                    <td data-label="심사 결정">
                      {application.status === "review" ? (
                        <div className="review-decisions">
                          <CommonButton className="creator-secondary review-decision" variant="secondary" aria-label={`${application.applicant} 합격`} disabled={Boolean(pendingDecision)} loading={pendingDecision?.id === application.id && pendingDecision.status === "accepted"} onClick={() => decide(application, "accepted")}>합격</CommonButton>
                          <CommonButton className="creator-secondary review-decision review-decision--reject" variant="secondary" aria-label={`${application.applicant} 불합격`} disabled={Boolean(pendingDecision)} loading={pendingDecision?.id === application.id && pendingDecision.status === "rejected"} onClick={() => decide(application, "rejected")}>불합격</CommonButton>
                        </div>
                      ) : (
                        <span className={`review-result review-result--${application.status}`}>{status?.label ?? "—"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="review-empty">{listUnavailable
            ? "지원자 목록을 불러오려면 지원자 조회 API 연결이 필요해요."
            : applications.length ? "조건에 맞는 지원자가 없어요." : "아직 받은 지원서가 없어요."}</p>
        )}
        {decisionError && <p className="workspace-form-error" role="alert">{decisionError}</p>}
        <p className="review-feedback" role="status">{feedback}</p>
        {!listUnavailable && <p className="review-guide">{remote
          ? "합격 또는 불합격을 선택하면 심사 결과가 서버에 저장돼요."
          : "지원자 이름을 누르면 지원서를 확인할 수 있어요. 심사 결과는 지원 현황에 반영돼요."}</p>}
      </section>

      {selected && (
        <WorkspaceDialog title={`${selected.applicant} 지원서`} onDismiss={() => setSelectedId(null)}>
          <dl className="review-application-detail">
            <dt>지원 역할</dt><dd>{getRole(selected) || "—"}</dd>
            <dt>자기소개</dt><dd>{selected.introduction || "작성된 자기소개가 없어요."}</dd>
            <dt>지원 동기</dt><dd>{selected.motivation || "작성된 지원 동기가 없어요."}</dd>
          </dl>
          <div className="workspace-dialog-actions">
            <CommonButton variant="secondary" autoFocus onClick={() => setSelectedId(null)}>닫기</CommonButton>
          </div>
        </WorkspaceDialog>
      )}
    </main>
  );
}

function ApplicantReviewPage() {
  const { projectId } = useParams();
  const { workspace, setWorkspace, projectApi } = useOutletContext();
  const { project, loading, error, reload } = useProjectDetail(projectId);

  if (loading || error || !project?.managed) {
    return (
      <main className="creator-page applicant-review-page">
        <Link className="creator-back" to={routes.postings}><FiArrowLeft aria-hidden="true" /> 공고 관리</Link>
        <h1>지원자 심사</h1>
        {loading ? <p className="review-empty" role="status">공고를 불러오는 중이에요.</p> : (
          <p className="review-empty" role={error ? "alert" : undefined}>{error || "심사할 수 있는 공고를 찾을 수 없어요."}</p>
        )}
        {error && <CommonButton variant="secondary" onClick={reload}>다시 시도</CommonButton>}
      </main>
    );
  }

  const applications = workspace.applications.filter((application) => (
    application.projectId === project.id && (!projectApi || (
      !application.isReviewSample && projectIdString(application.userId)
    ))
  ));

  async function recordDecision(application, status) {
    if (projectApi) {
      await projectApi.decide(project.id, application.userId, status === "accepted");
      setWorkspace((current) => ({
        ...current,
        applications: current.applications.map((item) => item.id === application.id ? { ...item, status } : item),
      }));
      return;
    }
    setWorkspace((current) => reviewApplication(current, application.id, status));
  }

  return (
    <ApplicantReview
      key={project.id}
      project={project}
      applications={applications}
      onDecision={recordDecision}
      remote={Boolean(projectApi)}
    />
  );
}

export default ApplicantReviewPage;
