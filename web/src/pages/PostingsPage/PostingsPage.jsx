import { useRef, useState } from 'react';
import { FiChevronRight, FiClipboard, FiFolder, FiMoreHorizontal, FiPlus } from 'react-icons/fi';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import CommonButton from '../../components/Button/Button';
import WorkspaceDialog from '../../components/WorkspaceDialog/WorkspaceDialog';
import { matchesProjectSearch } from '../../data/projectSearch';
import { closePosting, getProjectCategories, isRecruiting, localDate } from '../../data/workspace';
import { routes } from '../../router/routes';
import './PostingsPage.styles.css';

const postingStates = { open: '모집 중', review: '심사 중', closed: '마감' };

function PostingsPage() {
  const { workspace, setWorkspace, projectApi, projectList, apiUserId } = useOutletContext();
  const navigate = useNavigate();
  const [closing, setClosing] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const removing = useRef(false);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('recent');
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const today = localDate();
  const weekStart = localDate(-6);
  const loading = Boolean(projectApi && projectList.loading);
  const listError = projectApi ? projectList.error : '';
  const missingOwner = projectApi && !apiUserId && !loading && !listError;

  const postings = workspace.projects.filter(({ managed }) => managed).map((project) => {
    const applications = projectApi ? [] : workspace.applications.filter(({ projectId }) => projectId === project.id);
    const pending = applications.filter((application) => application.status === 'review').length;
    const state = isRecruiting(project) ? 'open' : pending > 0 ? 'review' : 'closed';
    const recent = applications.filter(({ date }) => date >= weekStart && date <= today).length;
    return { project, state, pending, recent, applications };
  });

  const total = postings.reduce((sum, posting) => sum + posting.applications.length, 0);
  const pending = postings.reduce((sum, posting) => sum + posting.pending, 0);
  const recent = postings.reduce((sum, posting) => sum + posting.recent, 0);
  const active = postings.filter(({ state }) => state === 'open').length;
  const nextReview = postings.find((posting) => posting.pending > 0);
  const canShowList = !loading && !listError && !missingOwner;
  const visible = postings
    .filter(({ project, state, applications }) => (
      (status === 'all' || state === status) &&
      matchesProjectSearch(project, query, applications.map(({ applicant }) => applicant))
    ))
    .sort((first, second) => {
      if (sort === 'deadline') {
        const firstDeadline = `${first.project.deadline}-${first.project.deadlineHour ?? ''}`;
        const secondDeadline = `${second.project.deadline}-${second.project.deadlineHour ?? ''}`;
        return firstDeadline.localeCompare(secondDeadline);
      }
      return projectApi ? 0 : (second.project.updatedAt ?? '').localeCompare(first.project.updatedAt ?? '');
    });

  function updateSearch(value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set('q', value);
    else next.delete('q');
    setSearchParams(next, { replace: true });
  }

  async function confirmDeletion() {
    if (removing.current) return;
    removing.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      await projectApi.remove(deletingProject.id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : '공고를 삭제하지 못했어요. 다시 시도해 주세요.');
      return;
    } finally {
      removing.current = false;
      setDeleting(false);
    }
    setDeletingProject(null);
    projectList.reload();
  }

  return (
    <main className="creator-page creator-dashboard">
      <div className="creator-dashboard-heading">
        <div>
          <p className="creator-eyebrow">CREATOR WORKSPACE</p>
          <h1>공고 관리</h1>
          <p className="creator-description">등록한 프로젝트 공고를 관리하고 지원자를 검토하세요.</p>
        </div>
        <CommonButton className="creator-primary creator-register-button" onClick={() => navigate(routes.newPosting)}>
          <FiPlus aria-hidden="true" /> 공고 등록하기
        </CommonButton>
      </div>

      {canShowList && (
        <section className={projectApi ? 'creator-overview creator-overview--single' : 'creator-overview'} aria-label="공고 요약">
          <div><span>전체 공고</span><strong>{postings.length}</strong><small>{active}개 모집 중</small></div>
          {!projectApi && <div><span>신규 지원</span><strong>{recent}</strong><small>전체 {total}건</small></div>}
          {!projectApi && <div><span>검토 대기</span><strong>{pending}</strong><small>{pending > 0 ? '확인 필요' : '검토 완료'}</small></div>}
        </section>
      )}

      <section aria-labelledby="creator-posting-list">
        <div className="creator-list-top">
          <h2 id="creator-posting-list">내 프로젝트 공고</h2>
          {canShowList && <div className="creator-filters">
            <select aria-label="공고 상태" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">전체 상태</option>
              {Object.entries(postingStates).map(([value, label]) => (
                (!projectApi || value !== 'review') && <option value={value} key={value}>{label}</option>
              ))}
            </select>
            <select aria-label="공고 정렬" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="recent">{projectApi ? '기본 순서' : '최근 수정순'}</option>
              <option value="deadline">마감 임박순</option>
            </select>
            <input type="search" maxLength={120} value={query} onChange={(event) => updateSearch(event.target.value)} aria-label={projectApi ? '내 공고 검색' : '내 공고 또는 지원자 검색'} placeholder={projectApi ? '공고 검색' : '공고·지원자 검색'} />
          </div>}
        </div>
        {canShowList && query.trim() && <p className="creator-search-results" role="status">검색 결과 {visible.length}개</p>}
        {loading && <p className="creator-empty" role="status">공고 목록을 불러오는 중이에요.</p>}
        {listError && (
          <div className="creator-empty">
            <p className="workspace-form-error" role="alert">{listError}</p>
            <CommonButton variant="secondary" onClick={projectList.reload}>다시 불러오기</CommonButton>
          </div>
        )}
        {missingOwner && <p className="creator-empty">내 공고를 확인하려면 로그인한 계정의 사용자 ID가 필요해요.</p>}

        {canShowList && (visible.length > 0 ? (
          <ul className="creator-posting-list">
            <li className="creator-list-labels" aria-hidden="true">
              <span>공고명</span><span>상태</span><span>지원자</span><span>마감일</span><span />
            </li>
            {visible.map(({ project, state, applications }) => (
              <li className="creator-posting-row" key={project.id}>
                <div className="creator-row-title">
                  <span className="creator-row-icon"><FiFolder aria-hidden="true" /></span>
                  <div>
                    <Link to={routes.projectDetail(project.id)}>{project.title}</Link>
                    {projectApi
                      ? project.description && <span>{project.description}</span>
                      : <span>{getProjectCategories(project).join(' · ')} · 모집 {project.members}명</span>}
                  </div>
                </div>
                <span className={`creator-posting-state creator-posting-state--${state}`}>{postingStates[state]}</span>
                <Link
                  className="creator-secondary creator-row-review"
                  to={routes.reviewPosting(project.id)}
                  aria-label={`${project.title} 지원자 심사`}
                >
                  {projectApi ? '지원자 심사' : `${applications.length}명 지원`} <FiChevronRight aria-hidden="true" />
                </Link>
                <time dateTime={project.deadlineHour ? `${project.deadline}T${project.deadlineHour}:00` : project.deadline}>
                  {project.deadline}{project.deadlineHour && <span>{project.deadlineHour}:00</span>}
                </time>
                <details className="creator-row-menu">
                  <summary aria-label={`${project.title} 관리 메뉴`}><FiMoreHorizontal aria-hidden="true" /></summary>
                  <div>
                    <Link to={routes.reviewPosting(project.id)}>지원자 심사</Link>
                    <Link to={routes.editPosting(project.id)}>공고 수정</Link>
                    {!projectApi && state === 'open' && (
                      <button type="button" onClick={(event) => {
                        event.currentTarget.closest('details').open = false;
                        setClosing(project);
                      }}>모집 마감</button>
                    )}
                    {projectApi && (
                      <button type="button" onClick={(event) => {
                        event.currentTarget.closest('details').open = false;
                        setDeleteError('');
                        setDeletingProject(project);
                      }}>공고 삭제</button>
                    )}
                  </div>
                </details>
              </li>
            ))}
          </ul>
        ) : (
          <p className="creator-empty">{postings.length ? '조건에 맞는 공고가 없어요.' : '등록한 공고가 아직 없어요.'}</p>
        ))}
      </section>

      {nextReview && (
        <aside className="creator-review-notice">
          <span><FiClipboard aria-hidden="true" /></span>
          <div>
            <strong>지원자 심사가 기다리고 있어요</strong>
            <p>{nextReview.project.title} · 검토 대기 {nextReview.pending}명</p>
          </div>
          <Link className="creator-secondary" to={routes.reviewPosting(nextReview.project.id)}>결과 검토하기</Link>
        </aside>
      )}

      {closing && (
        <WorkspaceDialog title="모집을 마감하시겠습니까?" onDismiss={() => setClosing(null)}>
          <p>{closing.title}의 새 지원을 받지 않아요. 받은 지원서는 계속 검토할 수 있어요.</p>
          <div className="workspace-dialog-actions">
            <CommonButton variant="secondary" autoFocus onClick={() => setClosing(null)}>취소</CommonButton>
            <CommonButton onClick={() => {
              setWorkspace((current) => closePosting(current, closing.id));
              setClosing(null);
            }}>마감하기</CommonButton>
          </div>
        </WorkspaceDialog>
      )}

      {deletingProject && (
        <WorkspaceDialog title="공고를 삭제하시겠습니까?" onDismiss={() => !deleting && setDeletingProject(null)}>
          <p>‘{deletingProject.title}’ 공고를 삭제합니다.</p>
          {deleteError && <p className="workspace-form-error" role="alert">{deleteError}</p>}
          <div className="workspace-dialog-actions">
            <CommonButton variant="secondary" autoFocus disabled={deleting} onClick={() => setDeletingProject(null)}>취소</CommonButton>
            <CommonButton variant="danger" className="creator-delete-button" loading={deleting} onClick={confirmDeletion}>삭제하기</CommonButton>
          </div>
        </WorkspaceDialog>
      )}
    </main>
  );
}

export default PostingsPage;
