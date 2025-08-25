import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import MfaService from "../../api/mfaService";
import {
  AuthCard,
  AuthForm,
  AuthFormGroup,
  AuthLabel,
  AuthInput,
  AuthButton,
  ErrorMessage,
} from "../../components/auth/AuthCard";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%);
  padding: 20px;
`;

const MfaCard = styled(AuthCard)`
  max-width: 400px;
  width: 100%;
`;

const CodeInput = styled(AuthInput)`
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.5rem;
  padding: 16px;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: underline;
  margin-top: 16px;

  &:hover {
    color: #2563eb;
  }

  &:disabled {
    color: #9ca3af;
    cursor: not-allowed;
    text-decoration: none;
  }
`;

interface LocationState {
  email: string;
  tempToken?: string;
}

export default function MfaVerificationPage() {
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const state = location.state as LocationState;
  const email = state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login");
      return;
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (verificationCode.length !== 6) {
      setError("6자리 인증 코드를 입력해주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // MFA 토큰 검증
      const isValid = await MfaService.verifyMfa(email, verificationCode);

      if (isValid) {
        // MFA 검증 성공 - 최종 로그인 완료
        try {
          const loginData = await MfaService.completeMfaLogin(
            email,
            verificationCode
          );

          if (loginData && loginData.data && loginData.data.token) {
            // 최종 로그인 성공
            login(
              loginData.data.nickname,
              loginData.data.name || loginData.data.nickname,
              loginData.data.email || email,
              loginData.data.role,
              loginData.data.token
            );
            setError("MFA 인증이 완료되었습니다. 로그인을 완료합니다...");
            setTimeout(() => {
              navigate("/");
            }, 1000);
          } else {
            setError("로그인 완료에 실패했습니다.");
          }
        } catch (loginErr: any) {
          console.error("최종 로그인 실패:", loginErr);
          setError("로그인 완료에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        setError("잘못된 인증 코드입니다.");
      }
    } catch (err: any) {
      console.error("MFA 인증 실패:", err);
      setError("인증 코드 검증에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60);

    try {
      // 백엔드에서 새로운 인증 코드를 재전송하는 API 호출
      // await MfaService.resendCode(email);
      setError("새로운 인증 코드가 전송되었습니다.");
    } catch (err: any) {
      setError("인증 코드 재전송에 실패했습니다.");
    }
  };

  if (!email) {
    return null;
  }

  return (
    <Container>
      <MfaCard
        title="2단계 인증"
        subtitle={`Google Authenticator 앱에서 생성된 6자리 인증 코드를 입력해주세요`}
      >
        <AuthForm onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <AuthFormGroup>
            <AuthLabel>인증 코드</AuthLabel>
            <CodeInput
              type="text"
              value={verificationCode}
              onChange={handleCodeChange}
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              autoFocus
            />
          </AuthFormGroup>

          <AuthButton type="submit" disabled={loading}>
            {loading ? "인증 중..." : "인증하기"}
          </AuthButton>

          <ResendButton
            type="button"
            onClick={handleResendCode}
            disabled={resendDisabled}
          >
            {resendDisabled ? `재전송 (${countdown}초)` : "인증 코드 재전송"}
          </ResendButton>
        </AuthForm>
      </MfaCard>
    </Container>
  );
}
