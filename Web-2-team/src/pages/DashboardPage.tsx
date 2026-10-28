import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'

export function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="MY DASHBOARD"
        title="오늘도 한 걸음씩!"
        description="지원 현황을 확인하고 다음 목표를 준비해 보세요."
      />

      <section className="stats-grid" aria-label="지원 현황 요약">
        <StatCard label="전체 지원" value="0건" detail="지금까지 지원한 공고" />
        <StatCard
          label="진행 중"
          value="0건"
          detail="결과를 기다리고 있어요"
          tone="orange"
        />
        <StatCard
          label="합격"
          value="0건"
          detail="새로운 시작을 응원해요"
          tone="green"
        />
      </section>

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <h2>최근 지원</h2>
            <p>지원한 공고를 한눈에 관리해요.</p>
          </div>
          <Link className="text-link" to="/applications">
            전체 보기 <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="empty-state">
          <span className="empty-illustration" aria-hidden="true">✦</span>
          <h3>아직 등록된 지원 내역이 없어요</h3>
          <p>첫 지원을 기록하고 준비 과정을 관리해 보세요.</p>
          <Link className="primary-button" to="/applications">
            지원 관리 시작하기
          </Link>
        </div>
      </section>
    </>
  )
}
