import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import MfaService, {
  MfaSetupResponse,
  MfaStatusResponse,
} from "../../api/mfaService";
import { useAuth } from "../../contexts/AuthContext";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 24px;

  &:hover {
    background: #e5e7eb;
    border-color: #9ca3af;
  }

  i {
    font-size: 12px;
  }
`;

const MfaSection = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
`;

const SectionDescription = styled.p`
  margin: 0.5rem 0 0;
  color: #6b7280;
  font-size: 0.875rem;
`;

const SectionContent = styled.div`
  padding: 1.5rem;
`;

const StepContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const StepTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StepNumber = styled.span`
  background: #3b82f6;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
`;

const QrContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
`;

const QrCode = styled.img`
  width: 200px;
  height: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const SecretKey = styled.div`
  background: #f3f4f6;
  padding: 12px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 14px;
  color: #374151;
  word-break: break-all;
`;

const InputGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.75rem;

  ${({ variant }) => {
    switch (variant) {
      case "primary":
        return `
          background: #3b82f6;
          color: white;
          &:hover {
            background: #2563eb;
          }
        `;
      case "secondary":
        return `
          background: #6b7280;
          color: white;
          &:hover {
            background: #4b5563;
          }
        `;
      case "danger":
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background: #e5e7eb;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const BackupCodesContainer = styled.div`
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const BackupCodesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 12px;
`;

const BackupCodesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
`;

const BackupCode = styled.div`
  background: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-family: monospace;
  font-size: 12px;
  text-align: center;
  border: 1px solid #f59e0b;
`;

const Alert = styled.div<{ type: "success" | "error" | "warning" }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;

  ${({ type }) => {
    switch (type) {
      case "success":
        return `
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #10b981;
        `;
      case "error":
        return `
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        `;
      case "warning":
        return `
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #f59e0b;
        `;
    }
  }}
`;

const StatusBadge = styled.span<{ enabled: boolean }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ enabled }) => (enabled ? "#d1fae5" : "#fee2e2")};
  color: ${({ enabled }) => (enabled ? "#065f46" : "#991b1b")};
`;

export default function MfaSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mfaStatus, setMfaStatus] = useState<MfaStatusResponse | null>(null);
  const [setupData, setSetupData] = useState<MfaSetupResponse | null>(null);
  const [verificationToken, setVerificationToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadMfaStatus();
  }, [user, navigate]);

  const loadMfaStatus = async () => {
    try {
      setLoading(true);
      console.log("=== MFA 상태 조회 시작 ===");
      console.log("사용자 이메일:", user!.email);
      console.log("현재 토큰:", localStorage.getItem("token"));

      const status = await MfaService.getMfaStatus(user!.email);
      console.log("MFA 상태 조회 성공:", status);
      setMfaStatus(status);
    } catch (err: any) {
      console.error("=== MFA 상태 조회 실패 ===");
      console.error("에러 객체:", err);
      console.error("에러 메시지:", err.message);
      console.error("응답 데이터:", err.response?.data);
      console.error("응답 상태:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "알 수 없는 오류가 발생했습니다.";
      setError(`MFA 상태를 불러오는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupMfa = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("=== MFA 설정 시작 ===");
      console.log("사용자 정보:", user);
      console.log("사용자 이메일:", user!.email);
      console.log("현재 토큰:", localStorage.getItem("token"));

      const data = await MfaService.setupMfa(user!.email);
      console.log("MFA 설정 성공:", data);
      console.log("setupData 설정 전:", setupData);
      setSetupData(data);
      console.log("setupData 설정 후:", data);
    } catch (err: any) {
      console.error("=== MFA 설정 실패 ===");
      console.error("에러 객체:", err);
      console.error("에러 메시지:", err.message);
      console.error("응답 데이터:", err.response?.data);
      console.error("응답 상태:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "알 수 없는 오류가 발생했습니다.";
      setError(`MFA 설정을 초기화하는데 실패했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!verificationToken.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      console.log("=== 인증 코드 검증 시작 ===");
      console.log("입력된 인증 코드:", verificationToken);
      console.log("사용자 이메일:", user!.email);

      // 먼저 토큰 검증
      console.log("1단계: 토큰 검증 시작");
      const isValid = await MfaService.verifyMfa(
        user!.email,
        verificationToken
      );
      console.log("토큰 검증 결과:", isValid);

      if (!isValid) {
        setError("잘못된 인증 코드입니다.");
        return;
      }

      // MFA 활성화
      console.log("2단계: MFA 활성화 시작");
      const enabled = await MfaService.enableMfa(
        user!.email,
        verificationToken
      );
      console.log("MFA 활성화 결과:", enabled);

      if (enabled) {
        setSuccess("MFA가 성공적으로 활성화되었습니다!");
        setSetupData(null);
        setVerificationToken("");
        await loadMfaStatus();
      } else {
        setError("MFA 활성화에 실패했습니다.");
      }
    } catch (err: any) {
      console.error("=== 인증 과정 오류 ===");
      console.error("에러 객체:", err);
      console.error("에러 메시지:", err.message);
      console.error("응답 데이터:", err.response?.data);
      console.error("응답 상태:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "알 수 없는 오류가 발생했습니다.";
      setError(`인증 과정에서 오류가 발생했습니다: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (
      !window.confirm("MFA를 비활성화하시겠습니까? 보안이 약화될 수 있습니다.")
    ) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await MfaService.disableMfa(user!.email);
      setSuccess("MFA가 비활성화되었습니다.");
      await loadMfaStatus();
    } catch (err: any) {
      setError("MFA 비활성화에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSetup = () => {
    setSetupData(null);
    setVerificationToken("");
    setError("");
  };

  const handleBackToSettings = () => {
    navigate("/admin/settings");
  };

  if (loading && !mfaStatus) {
    return (
      <Container>
        <MfaSection>
          <SectionContent>
            <div style={{ textAlign: "center" }}>로딩 중...</div>
          </SectionContent>
        </MfaSection>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={handleBackToSettings}>
        <i className="fas fa-arrow-left"></i>
        관리자 설정으로 돌아가기
      </BackButton>

      {/* 현재 상태 섹션 */}
      <MfaSection>
        <SectionHeader>
          <SectionTitle>2단계 인증 현재 상태</SectionTitle>
          <SectionDescription>
            계정의 2단계 인증 설정 상태를 확인합니다
          </SectionDescription>
        </SectionHeader>
        <SectionContent>
          {error && <Alert type="error">{error}</Alert>}
          {success && <Alert type="success">{success}</Alert>}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "1rem",
            }}
          >
            <StatusBadge enabled={mfaStatus?.enabled || false}>
              {mfaStatus?.enabled ? "활성화됨" : "비활성화됨"}
            </StatusBadge>
            {mfaStatus?.setupRequired && (
              <span style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                설정이 필요합니다
              </span>
            )}
          </div>
        </SectionContent>
      </MfaSection>

      {/* MFA 설정 시작 섹션 */}
      {!mfaStatus?.enabled && !setupData && (
        <MfaSection>
          <SectionHeader>
            <SectionTitle>2단계 인증 설정</SectionTitle>
            <SectionDescription>
              Google Authenticator나 다른 TOTP 앱을 사용하여 2단계 인증을 설정할
              수 있습니다
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <Button
              variant="primary"
              onClick={handleSetupMfa}
              disabled={loading}
            >
              MFA 설정 시작
            </Button>
          </SectionContent>
        </MfaSection>
      )}

      {/* QR 코드 설정 섹션 */}
      {(() => {
        console.log("setupData 렌더링 조건 확인:", { setupData, mfaStatus });
        if (setupData) {
          return (
            <>
              <MfaSection>
                <SectionHeader>
                  <SectionTitle>QR 코드 스캔</SectionTitle>
                  <SectionDescription>
                    Google Authenticator 앱으로 QR 코드를 스캔하거나 시크릿 키를
                    수동으로 입력하세요
                  </SectionDescription>
                </SectionHeader>
                <SectionContent>
                  {(() => {
                    console.log("QR 코드 섹션 렌더링:", setupData);
                    return (
                      <QrContainer>
                        <QrCode src={setupData.qrUrl} alt="MFA QR Code" />
                        <div style={{ marginTop: "1rem", width: "100%" }}>
                          <Label>시크릿 키 (수동 입력용):</Label>
                          <SecretKey>{setupData.secret}</SecretKey>
                        </div>
                      </QrContainer>
                    );
                  })()}
                </SectionContent>
              </MfaSection>

              <MfaSection>
                <SectionHeader>
                  <SectionTitle>인증 코드 확인</SectionTitle>
                  <SectionDescription>
                    앱에서 생성된 6자리 인증 코드를 입력하여 설정을 완료하세요
                  </SectionDescription>
                </SectionHeader>
                <SectionContent>
                  <InputGroup>
                    <Label>6자리 인증 코드:</Label>
                    <Input
                      type="text"
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </InputGroup>
                  <div style={{ marginTop: "1rem" }}>
                    <Button
                      variant="primary"
                      onClick={handleVerifyAndEnable}
                      disabled={loading}
                    >
                      확인 및 활성화
                    </Button>
                    <Button onClick={handleCancelSetup} disabled={loading}>
                      취소
                    </Button>
                  </div>
                </SectionContent>
              </MfaSection>

              <MfaSection>
                <SectionHeader>
                  <SectionTitle>백업 코드</SectionTitle>
                  <SectionDescription>
                    인증 앱에 접근할 수 없을 때 사용할 수 있는 백업 코드입니다
                  </SectionDescription>
                </SectionHeader>
                <SectionContent>
                  <BackupCodesContainer>
                    <BackupCodesTitle>
                      ⚠️ 백업 코드를 안전한 곳에 보관하세요
                    </BackupCodesTitle>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#92400e",
                        marginBottom: "12px",
                      }}
                    >
                      이 코드들은 각각 한 번만 사용할 수 있습니다.
                    </p>
                    <BackupCodesList>
                      {setupData.backupCodes.map((code, index) => (
                        <BackupCode key={index}>{code}</BackupCode>
                      ))}
                    </BackupCodesList>
                  </BackupCodesContainer>
                </SectionContent>
              </MfaSection>
            </>
          );
        }
        return null;
      })()}

      {/* MFA 비활성화 섹션 */}
      {mfaStatus?.enabled && (
        <MfaSection>
          <SectionHeader>
            <SectionTitle>2단계 인증 비활성화</SectionTitle>
            <SectionDescription>
              계정 보안이 약화될 수 있으므로 신중하게 결정하세요
            </SectionDescription>
          </SectionHeader>
          <SectionContent>
            <Alert type="warning">
              MFA를 비활성화하면 계정 보안이 약화됩니다. 정말로
              비활성화하시겠습니까?
            </Alert>
            <div style={{ marginTop: "1rem" }}>
              <Button
                variant="danger"
                onClick={handleDisableMfa}
                disabled={loading}
              >
                MFA 비활성화
              </Button>
            </div>
          </SectionContent>
        </MfaSection>
      )}
    </Container>
  );
}
