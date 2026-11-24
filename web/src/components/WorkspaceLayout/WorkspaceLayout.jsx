import { useEffect, useState } from 'react';
import { FiBookmark, FiBriefcase, FiClipboard, FiCompass, FiSearch, FiSettings, FiUser } from 'react-icons/fi';
import { Link, NavLink, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom';
import CommonButton from '../Button/Button';
import WorkspaceDialog from '../WorkspaceDialog/WorkspaceDialog';
import { loadWorkspace, saveWorkspace } from '../../data/workspace';
import { routes } from '../../router/routes';
import './WorkspaceLayout.styles.css';

function WorkspaceLayout() {
  const [workspace, setWorkspace] = useState(loadWorkspace);
  const [modeSwitch, setModeSwitch] = useState(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const onPostings = Boolean(useMatch(routes.postings));
  const isPublisher = workspace.mode === 'publisher';
  const name = workspace.profile.name;
  const pendingCount = workspace.applications.filter(({ status }) => status === 'review').length;

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const requestPublisherMode = () => setModeSwitch({ mode: 'publisher', destination: routes.postings });

  function openProjects(event) {
    if (!isPublisher) return;
    event.preventDefault();
    setModeSwitch({ mode: 'applicant', destination: routes.projects });
  }

  function changeMode() {
    const { mode, destination } = modeSwitch;
    setWorkspace((current) => ({ ...current, mode }));
    setModeSwitch(null);
    if (destination && destination !== pathname) navigate(destination);
  }

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <Link
          className="workspace-logo"
          to={routes.projects}
          aria-label="Apply 프로젝트 찾기"
          aria-haspopup={isPublisher ? 'dialog' : undefined}
          onClick={openProjects}
        >
          <img src="/assets/apply-logo.svg" alt="Apply" />
        </Link>

        <nav aria-label="주 메뉴">
          <p className="workspace-nav-heading">WORKSPACE</p>
          <NavLink
            className="workspace-nav-item"
            to={routes.projects}
            aria-haspopup={isPublisher ? 'dialog' : undefined}
            onClick={openProjects}
          >
            <FiCompass className="workspace-icon" aria-hidden="true" />
            프로젝트 찾기
          </NavLink>
          <NavLink className="workspace-nav-item" to={routes.applications}>
            <FiClipboard className="workspace-icon" aria-hidden="true" />
            내 지원 현황 <span className="workspace-nav-count">{pendingCount}</span>
          </NavLink>
          <NavLink className="workspace-nav-item" to={routes.savedProjects}>
            <FiBookmark className="workspace-icon" aria-hidden="true" />
            저장한 공고
          </NavLink>
          <NavLink
            className="workspace-nav-item"
            to={routes.postings}
            onClick={(event) => {
              if (isPublisher) return;
              event.preventDefault();
              requestPublisherMode();
            }}
          >
            <FiBriefcase className="workspace-icon" aria-hidden="true" />
            공고 관리
          </NavLink>

          <p className="workspace-nav-heading workspace-personal-heading">내 작업</p>
          <NavLink className="workspace-nav-item" to={routes.profile}>
            <FiSettings className="workspace-icon" aria-hidden="true" />
            프로필 설정
          </NavLink>
        </nav>

        <div className="workspace-sidebar-user">
          <span className="workspace-avatar" aria-hidden="true"><FiUser className="workspace-icon" /></span>
          <span className="workspace-profile-name" title={name}>{name} · 사용자</span>
        </div>
      </aside>

      <div className="workspace-main">
        <header className="workspace-topbar">
          <label className="workspace-search">
            <FiSearch className="workspace-icon" aria-hidden="true" />
            <input type="search" placeholder="프로젝트, 분야, 키워드 검색" aria-label="프로젝트 검색" />
          </label>
          <button
            type="button"
            className="workspace-user-mode"
            aria-haspopup="dialog"
            onClick={() => {
              if (isPublisher) {
                setModeSwitch({ mode: 'applicant', destination: onPostings ? routes.projects : undefined });
              } else {
                requestPublisherMode();
              }
            }}
          >
            {isPublisher ? '공고자 모드' : '사용자 모드'}
            <span className="workspace-avatar" aria-hidden="true"><FiUser className="workspace-icon" /></span>
          </button>
        </header>

        <Outlet context={{ workspace, setWorkspace, requestPublisherMode, openProjects }} />
      </div>

      {modeSwitch && (
        <WorkspaceDialog
          title={modeSwitch.mode === 'publisher' ? '공고자 모드로 바꾸시겠습니까?' : '다시 사용자 모드로 바꾸시겠습니까?'}
          onDismiss={() => setModeSwitch(null)}
        >
          <div className="workspace-dialog-actions">
            <CommonButton variant="secondary" autoFocus onClick={() => setModeSwitch(null)}>아니요</CommonButton>
            <CommonButton onClick={changeMode}>네</CommonButton>
          </div>
        </WorkspaceDialog>
      )}
    </div>
  );
}

export default WorkspaceLayout;
