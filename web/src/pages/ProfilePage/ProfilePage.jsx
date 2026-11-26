import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommonButton from '../../components/Button/Button';
import CommonInput from '../../components/Input/Input';
import BadgeChoices from '../../components/BadgeChoices/BadgeChoices';
import { majorChoices } from '../../data/workspace';
import './ProfilePage.styles.css';

function ProfilePage() {
  const { workspace: { profile }, setWorkspace } = useOutletContext();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const majorOptions = [...new Set([...majorChoices, ...profile.majors])];

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextProfile = {
      name: form.get('name').trim(),
      studentId: form.get('studentId').trim(),
      email: form.get('email').trim(),
      majors: form.getAll('majors'),
    };

    if (!nextProfile.name || !nextProfile.studentId || !nextProfile.email) {
      setError('실명, 학번, 이메일을 모두 입력해 주세요.');
      return;
    }
    if (nextProfile.majors.length === 0) {
      setError('전공을 하나 이상 선택해 주세요.');
      return;
    }

    setWorkspace((current) => ({ ...current, profile: nextProfile }));
    setFeedback('프로필 정보를 저장했어요.');
    setError('');
  }

  return (
    <main className="profile-settings">
      <h1>프로필 설정</h1>
      <section className="profile-settings-card" aria-labelledby="profile-details">
        <h2 id="profile-details">사용자 정보</h2>
        <form className="profile-settings-form" onSubmit={handleSubmit} onChange={() => {
          setFeedback('');
          setError('');
        }}>
          <CommonInput label="실명" name="name" defaultValue={profile.name} autoComplete="name" maxLength={50} required />
          <CommonInput label="학번" name="studentId" defaultValue={profile.studentId} maxLength={30} required />
          <CommonInput label="이메일" name="email" type="email" defaultValue={profile.email} autoComplete="email" maxLength={254} required />
          <BadgeChoices label="전공" name="majors" options={majorOptions} defaultValues={profile.majors} />
          {error && <p className="profile-settings-error" role="alert">{error}</p>}
          <div className="profile-settings-actions">
            <CommonButton type="submit">저장</CommonButton>
            <span role="status">{feedback}</span>
          </div>
        </form>
      </section>

      <section className="profile-settings-card" aria-labelledby="profile-password">
        <h2 id="profile-password">비밀번호</h2>
        <p>계정 인증 기능이 연결되면 비밀번호를 변경할 수 있어요.</p>
        <CommonButton disabled>비밀번호 변경</CommonButton>
      </section>
    </main>
  );
}

export default ProfilePage;
