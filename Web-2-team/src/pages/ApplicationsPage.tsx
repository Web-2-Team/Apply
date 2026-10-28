import { PageHeader } from '../components/PageHeader'

export function ApplicationsPage() {
  return (
    <>
      <PageHeader
        eyebrow="APPLICATIONS"
        title="지원 관리"
        description="관심 있는 공고와 지원 현황을 모아 관리해요."
      />
      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <h2>내 지원 목록</h2>
            <p>지원한 공고와 진행 상태를 확인할 수 있어요.</p>
          </div>
          <button className="primary-button" type="button" disabled>
            + 지원 추가
          </button>
        </div>
        <div className="empty-state compact">
          <span className="empty-illustration" aria-hidden="true">▤</span>
          <h3>아직 지원 내역이 없어요</h3>
          <p>지원 내역을 추가하면 이곳에서 확인할 수 있어요.</p>
        </div>
      </section>
    </>
  )
}
