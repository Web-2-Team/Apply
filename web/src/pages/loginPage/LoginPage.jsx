import { useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommonInput from "../../components/Input/Input";
import CommonButton from "../../components/Button/Button";
import {
  getProjectSession,
  projectApiBaseUrl,
  subscribeProjectSession,
} from "../../data/projectSession";
import { routes } from "../../router/routes";
import "./LoginPage.styles.css";

function LoginPage() {
  const navigate = useNavigate();
  const session = useSyncExternalStore(
    subscribeProjectSession,
    getProjectSession,
  );

  const handleSubmit = (event) => {
    event.preventDefault();

    navigate(routes.projects);
  };

  if (projectApiBaseUrl) {
    return (
      <main className="login-page">
        <div className="login-container">
          <h1>로그인</h1>
          {!session && (
            <p className="login-description">
              공고는 바로 둘러볼 수 있어요. 공고 등록과 지원에는 로그인이
              필요해요.
            </p>
          )}
          <Link className="login-link" to={routes.projects}>
            프로젝트 둘러보기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>로그인</h1>
        <p className="login-description">
          데모용 이메일과 비밀번호를 입력하면 프로젝트를 둘러볼 수 있어요.
        </p>

        <form className="login-form" onSubmit={handleSubmit} autoComplete="off">
          <CommonInput
            label="이메일"
            type="email"
            placeholder="name@example.com"
            required
          />

          <CommonInput
            label="비밀번호"
            type="password"
            placeholder="데모용 비밀번호를 입력해 주세요"
            required
          />

          <Link className="login-link" to={routes.forgotPassword}>
            비밀번호를 잊으셨나요?
          </Link>

          <CommonButton type="submit">데모 로그인</CommonButton>
        </form>

        <p className="signup-text">아직 계정이 없으신가요?</p>
        <Link className="login-link" to={routes.signup}>
          회원가입
        </Link>
      </div>
    </main>
  );
}

export default LoginPage;
