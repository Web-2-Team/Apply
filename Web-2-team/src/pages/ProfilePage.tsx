import { PageHeader } from '../components/PageHeader'

export function ProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="MY PROFILE"
        title="내 프로필"
        description="취업 준비에 필요한 기본 정보를 정리해 보세요."
      />
      <section className="dashboard-panel profile-panel">
        <span className="profile-avatar">나</span>
        <div>
          <h2>프로필을 준비 중이에요</h2>
          <p>이력서와 연락처 등 나를 소개하는 정보를 모아둘 수 있어요.</p>
        </div>
      </section>
    </>
  )
}
