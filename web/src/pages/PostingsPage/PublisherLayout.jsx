import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import CommonButton from '../../components/Button/Button';

function PublisherLayout() {
  const context = useOutletContext();
  const { pathname } = useLocation();

  if (context.workspace.mode !== 'publisher') {
    return (
      <main className="creator-page">
        <h1>공고 관리</h1>
        <p className="creator-description">공고자 모드에서 공고를 등록하고 지원서를 심사할 수 있어요.</p>
        <CommonButton className="creator-primary" onClick={() => context.requestPublisherMode(pathname)}>
          공고자 모드로 전환
        </CommonButton>
      </main>
    );
  }

  return <Outlet context={context} />;
}

export default PublisherLayout;
