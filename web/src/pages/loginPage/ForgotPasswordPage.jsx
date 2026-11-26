import { Link } from "react-router-dom";
import { routes } from "../../router/routes";
import "./LoginPage.styles.css";

function ForgotPasswordPage() {
  return (
    <main className="login-page">
      <div className="login-container">
        <h1>비밀번호 재설정</h1>
        <p className="login-description">
          비밀번호 재설정은 계정 인증 기능이 연결되면 사용할 수 있어요.
        </p>
        <Link className="login-link" to={routes.login}>
          로그인으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
