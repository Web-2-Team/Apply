import { NavLink, Outlet } from 'react-router-dom'

const navigation = [
  { to: '/', label: '대시보드', icon: '▦', end: true },
  { to: '/applications', label: '지원 관리', icon: '▤' },
  { to: '/profile', label: '내 프로필', icon: '◉' },
]

export function AppLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink className="brand" to="/" aria-label="Apply 홈">
          <span className="brand-mark">A</span>
          <span>apply</span>
        </NavLink>

        <p className="nav-heading">워크스페이스</p>
        <nav className="main-nav" aria-label="주 메뉴">
          {navigation.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link${isActive ? ' active' : ''}`
              }
            >
              <span className="nav-icon" aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-note">
          <span className="note-icon" aria-hidden="true">✦</span>
          <p>차근차근 준비하면<br />좋은 결과가 따라와요.</p>
        </div>
        <div className="sidebar-user">
          <span className="avatar">나</span>
          <span className="user-copy">
            <strong>내 워크스페이스</strong>
            <span>취업 준비 중</span>
          </span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>나의 취업 준비 공간</span>
          <span className="topbar-date">
            {new Intl.DateTimeFormat('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }).format(new Date())}
          </span>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
