import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommonInput from "../../components/Input/Input";
import CommonButton from "../../components/Button/Button";
import { loadWorkspace, saveWorkspace } from "../../data/workspace";
import { routes } from "../../router/routes";
import "./SignupPage.styles.css";

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("이름을 입력해 주세요.");
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("비밀번호가 일치하지 않습니다.");
      return;
    }

    const workspace = loadWorkspace();
    const saved = saveWorkspace({
      ...workspace,
      profile: { ...workspace.profile, name: name.trim(), email: email.trim() },
    });
    if (!saved) {
      setMessage("이 브라우저에 데모 프로필을 저장하지 못했어요.");
      return;
    }
    navigate(routes.projects);
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <h1>회원가입</h1>
        <p className="signup-description">
          이름과 이메일을 이 브라우저의 데모 프로필에 저장해요.
        </p>

        <form className="signup-form" onSubmit={handleSubmit}>
          <CommonInput
            label="이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="예: 김지우"
            autoComplete="name"
            required
          />
          <CommonInput
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
          <CommonInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="데모용 비밀번호를 8자 이상 입력해 주세요"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <CommonInput
            label="비밀번호 확인"
            type="password"
            value={passwordConfirm}
            onChange={(event) => setPasswordConfirm(event.target.value)}
            placeholder="비밀번호를 다시 입력해 주세요"
            autoComplete="new-password"
            required
          />

          {message && (
            <p className="signup-message" role="alert">
              {message}
            </p>
          )}
          <CommonButton type="submit" className="signup-submit">
            데모 프로필 만들기
          </CommonButton>
        </form>

        <p className="signup-login-text">이미 계정이 있으신가요?</p>
        <Link className="signup-login-link" to={routes.login}>
          로그인
        </Link>
      </div>
    </main>
  );
}

export default SignupPage;
