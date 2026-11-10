import { useState } from "react";
import CommonInput from "../../components/Input/Input";
import CommonButton from "../../components/Button /Button";
import "./LoginPage.styles.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log("이메일:", email);
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>로그인</h1>
        <p className="login-description">
          계정에 로그인하고 프로젝트를 이어가세요.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <CommonInput
            label="이메일"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            required
          />

          <CommonInput
            label="비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="비밀번호를 입력해 주세요"
            required
          />

          <a className="login-link" href="/forgot-password">
            비밀번호를 잊으셨나요?
          </a>

          <CommonButton type="submit">로그인</CommonButton>
        </form>

        <p className="signup-text">아직 계정이 없으신가요?</p>
        <a className="login-link" href="/signup">
          회원가입
        </a>
      </div>
    </main>
  );
}

export default LoginPage;
