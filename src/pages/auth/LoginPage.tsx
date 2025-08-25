import { useAuth } from "../../contexts/AuthContext";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { validateEmail } from "../../utils/auth/auth";
import axios from "axios";
import {
  AuthCard,
  AuthForm as BaseAuthForm,
  AuthFormGroup as BaseAuthFormGroup,
  AuthLabel,
  AuthInput,
  AuthButton,
  AuthLink,
  ErrorMessage,
} from "../../components/auth/AuthCard";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const AuthForm = styled(BaseAuthForm)`
  gap: 0;
`;

const AuthFormGroup = styled(BaseAuthFormGroup)`
  margin-bottom: 24px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.1rem;
`;

const SocialLoginButton = styled.button`
  width: 100%;
  padding: 14px;
  background: white;
  color: #374151;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  color: #9ca3af;
  font-size: 0.9rem;
  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  &::before {
    margin-right: 16px;
  }
  &::after {
    margin-left: 16px;
  }
`;

const SignUpLink = styled(Link)`
  display: block;
  text-align: center;
  margin-top: 24px;
  color: #f97316;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  &:hover {
    color: #ea580c;
    transform: translateY(-1px);
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isEmailValid = validateEmail(email);
  const { login: authLogin } = useAuth();

  const { executeRecaptcha } = useGoogleReCaptcha();
  const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);

  useEffect(() => {
    // executeRecaptcha 함수가 준비되면 상태를 true로 변경
    if (executeRecaptcha) {
      setIsRecaptchaReady(true);
    }
  }, [executeRecaptcha]);

  // 소셜 로그인 콜백에서 전달된 에러 처리
  useEffect(() => {
    const state = location.state as { error?: string } | null;
    if (state?.error) {
      setError(state.error);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit 함수가 호출되었습니다.");

    if (!isRecaptchaReady || !executeRecaptcha) {
      // alert()를 setError로 변경
      setError("reCAPTCHA 로딩 중입니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
      return;
    }
    console.log("reCAPTCHA가 준비되었습니다.");

    setError("");
    setLoading(true);

    try {
      if (!isEmailValid) throw new Error("올바른 이메일 형식을 입력해주세요.");

      const recaptchaToken = await executeRecaptcha("login_submit");
      // console.log('생성된 reCAPTCHA 토큰:', recaptchaToken);

      if (!recaptchaToken) {
        throw new Error("reCAPTCHA 인증에 실패했습니다. 다시 시도해주세요.");
      }

      const baseURL = process.env.REACT_APP_API_URL || "https://localhost:8443";
      // console.log('로그인 요청 전송:', {
      //   url: `${baseURL}/api/auth/login`,
      //   data: { email, password, recaptchaToken }
      // });

      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email,
        password,
        recaptchaToken,
      });

      // --- 로그인 성공 시 추가된 로직 ---
      // console.log('로그인 성공 응답:', response.data);
      const loginData = response.data.data;

      // 백엔드에서 MFA 상태를 확인하여 응답에 포함시켰으므로 직접 확인
      if (loginData && loginData.requiresMfa) {
        // MFA가 활성화된 경우 2단계 인증 페이지로 이동
        console.log("MFA가 활성화되어 2단계 인증이 필요합니다.");
        navigate("/mfa-verification", {
          state: {
            email: loginData.email,
            tempToken: loginData.tempToken,
          },
        });
        return;
      }

      if (loginData && loginData.token) {
        // 일반 로그인 성공
        authLogin(
          loginData.nickname,
          loginData.name || loginData.nickname,
          loginData.email || email,
          loginData.role,
          loginData.token
        );
        navigate("/");
      } else {
        throw new Error("로그인 응답 형식이 올바르지 않습니다.");
      }
      // --- 추가된 로직 끝 ---
    } catch (err: any) {
      console.error(
        "로그인 에러:",
        err.response ? err.response.data : err.message
      );
      // alert()를 setError로 변경
      const errorMessage =
        err.response && err.response.data && err.response.data.message
          ? err.response.data.message
          : "로그인 중 알 수 없는 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 소셜 로그인 핸들러
  const handleGoogleLogin = () => {
    const baseURL = process.env.REACT_APP_API_URL || "https://localhost:8443";
    window.location.href = `${baseURL}/oauth2/authorization/google`;
  };

  const handleKakaoLogin = () => {
    const baseURL = process.env.REACT_APP_API_URL || "https://localhost:8443";
    window.location.href = `${baseURL}/oauth2/authorization/kakao`;
  };

  return (
    <AuthCard title="FeedShop" subtitle="스마트한 쇼핑 경험을 위한 최고의 선택">
      <AuthForm onSubmit={handleSubmit}>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <AuthFormGroup>
          <AuthLabel htmlFor="email">이메일</AuthLabel>
          <InputWrapper>
            <AuthInput
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              autoComplete="username"
            />
            <InputIcon>
              <i className="fas fa-envelope"></i>
            </InputIcon>
          </InputWrapper>
        </AuthFormGroup>
        <AuthFormGroup>
          <AuthLabel htmlFor="password">비밀번호</AuthLabel>
          <InputWrapper>
            <AuthInput
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              autoComplete="current-password"
            />
            <InputIcon>
              <i className="fas fa-lock"></i>
            </InputIcon>
          </InputWrapper>
        </AuthFormGroup>
        <AuthButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <i
                className="fas fa-spinner fa-spin"
                style={{ marginRight: "8px" }}
              ></i>
              로그인 중...
            </>
          ) : (
            <>
              <i
                className="fas fa-sign-in-alt"
                style={{ marginRight: "8px" }}
              ></i>
              로그인
            </>
          )}
        </AuthButton>

        <Divider>또는</Divider>

        <SocialLoginButton
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <i className="fab fa-google" style={{ color: "#DB4437" }}></i>
          구글로 로그인
        </SocialLoginButton>

        <SocialLoginButton
          type="button"
          onClick={handleKakaoLogin}
          disabled={loading}
        >
          <i className="fas fa-comment" style={{ color: "#FEE500" }}></i>
          카카오로 로그인
        </SocialLoginButton>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <AuthLink to="/find-account">계정 찾기</AuthLink>
          <AuthLink to="/find-password">비밀번호 찾기</AuthLink>
        </div>

        <SignUpLink to="/signup">
          <i className="fas fa-user-plus" style={{ marginRight: "8px" }}></i>
          계정이 없으신가요? 회원가입
        </SignUpLink>
      </AuthForm>
    </AuthCard>
  );
}
