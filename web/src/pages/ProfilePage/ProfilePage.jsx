import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import CommonButton from '../../components/Button/Button';
import CommonInput from '../../components/Input/Input';
import './ProfilePage.styles.css';

const majors = [
  '프론트엔드',
  '백엔드',
  'UI/UX',
  'AI',
  '정보보안',
  'Flutter',
  '안드로이드',
  'iOS',
  'DevOps',
];

function ProfilePage() {
  const { workspace: { profile }, setWorkspace } = useOutletContext();
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const majorOptions = profile.major && !majors.includes(profile.major)
    ? [...majors, profile.major]
    : majors;

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextProfile = {
      name: form.get('name').trim(),
      studentId: form.get('studentId').trim(),
      email: form.get('email').trim(),
      major: form.get('major')?.trim() ?? '',
    };

    if (Object.values(nextProfile).some((value) => !value)) {
      setError('실명, 학번, 이메일, 전공을 모두 입력해 주세요.');
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
          <fieldset className="profile-major-field">
            <legend className="common-input-label">전공</legend>
            <div className="profile-major-options">
              {majorOptions.map((major) => (
                <label className="profile-major-chip" key={major}>
                  <input type="radio" name="major" value={major} defaultChecked={major === profile.major} required />
                  <span>{major}</span>
                </label>
              ))}
            </div>
          </fieldset>
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
