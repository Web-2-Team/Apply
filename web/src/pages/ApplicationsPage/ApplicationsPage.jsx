import { Link, useOutletContext } from "react-router-dom";
import { applicationStatuses, getOwnApplications } from "../../data/workspace";
import { routes } from "../../router/routes";
import "./ApplicationsPage.styles.css";

function ApplicationsPage() {
  const { workspace, projectApi } = useOutletContext();
  const { projects } = workspace;
  const applications = getOwnApplications(workspace);

  return (
    <main className="applications-content">
      <p className="applications-breadcrumb">
        지원자 공간&nbsp; / &nbsp;내 지원 현황
      </p>
      <h1>내 지원 현황</h1>
      <p className="applications-description">
        {projectApi
          ? "이 브라우저에서 접수한 지원을 표시해요. 심사 결과 조회는 아직 연결되지 않았어요."
          : "지원한 프로젝트의 검토 상태와 다음 단계를 확인하세요."}
      </p>

      <section className="applications-summary" aria-label="지원 요약">
        <article>
          <span>전체 지원</span>
          <strong>{applications.length}</strong>
        </article>
        {!projectApi && Object.entries(applicationStatuses).map(([status, { label }]) => (
          <article key={status}>
            <span>{label}</span>
            <strong>
              {
                applications.filter(
                  (application) => application.status === status,
                ).length
              }
            </strong>
          </article>
        ))}
      </section>

      <div className="applications-list-heading">
        <h2>지원 목록</h2>
        <span>총 {applications.length}건</span>
      </div>
      <section className="applications-list" aria-label="지원 목록">
        {applications.length === 0 && <p>지원 내역이 없어요.</p>}
        {applications.map((application) => {
          const project = projects.find(
            ({ id }) => id === application.projectId,
          );
          const { tone, label } = applicationStatuses[application.status];
          return (
            <article className="application-item" key={application.id}>
              <div className="application-copy">
                <h3>{project?.title ?? application.projectTitle ?? "프로젝트 공고"}</h3>
                {application.role && <span>{application.role}</span>}
                <time dateTime={application.date}>
                  {application.date.replaceAll("-", ".")}
                </time>
              </div>
              <Link
                className="application-post-link"
                to={routes.projectDetail(application.projectId)}
              >
                공고 보기&nbsp; ›
              </Link>
              <span className={`application-status ${tone}`}>{projectApi ? "지원 완료" : label}</span>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default ApplicationsPage;
