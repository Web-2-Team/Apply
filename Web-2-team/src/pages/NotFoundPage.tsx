import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span className="brand-mark">A</span>
      <p className="eyebrow">404 ERROR</p>
      <h1>페이지를 찾을 수 없어요</h1>
      <p className="page-description">주소를 확인하거나 대시보드로 이동해 주세요.</p>
      <Link className="primary-button" to="/">
        대시보드로 이동
      </Link>
    </main>
  )
}
