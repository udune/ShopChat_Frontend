import React, { useState, useEffect } from "react";
import styled from "styled-components";
import MfaService from "../../api/mfaService";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  margin-bottom: 24px;
`;

const InputGroup = styled.div`
  margin-bottom: 24px;
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
  font-size: 18px;
  text-align: center;
  letter-spacing: 4px;
  font-family: monospace;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Button = styled.button<{ variant?: "primary" | "secondary" }>`
  width: 100%;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;

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
      default:
        return `
          background: #f3f4f6;
          color: #374151;
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

const Alert = styled.div<{ type: "error" | "info" }>`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;

  ${({ type }) => {
    switch (type) {
      case "error":
        return `
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #ef4444;
        `;
      case "info":
        return `
          background: #dbeafe;
          color: #1e40af;
          border: 1px solid #3b82f6;
        `;
    }
  }}
`;

const Timer = styled.div`
  text-align: center;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
`;

const BackupCodeSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const BackupCodeToggle = styled.button`
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  margin-bottom: 12px;

  &:hover {
    color: #2563eb;
  }
`;

interface MfaVerificationModalProps {
  isOpen: boolean;
  email: string;
  onVerify: (token: string) => Promise<boolean>;
  onCancel: () => void;
}

export default function MfaVerificationModal({
  isOpen,
  email,
  onVerify,
  onCancel,
}: MfaVerificationModalProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isOpen) {
      setToken("");
      setError("");
      setShowBackupCode(false);
      setTimeLeft(30);
      return;
    }

    // 30초 타이머 시작
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 30; // 30초마다 리셋
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError("인증 코드를 입력해주세요.");
      return;
    }

    if (token.length !== 6) {
      setError("6자리 인증 코드를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const success = await onVerify(token);
      if (!success) {
        setError("잘못된 인증 코드입니다.");
      }
    } catch (err: any) {
      setError("인증 과정에서 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <Title>2단계 인증</Title>
        <Subtitle>
          {email} 계정의 보안을 위해 인증 코드를 입력해주세요
        </Subtitle>

        {error && <Alert type="error">{error}</Alert>}

        <InputGroup>
          <Label>6자리 인증 코드</Label>
          <Input
            type="text"
            value={token}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setToken(value);
            }}
            placeholder="000000"
            maxLength={6}
            onKeyPress={handleKeyPress}
            autoFocus
          />
        </InputGroup>

        <Timer>
          다음 코드까지: {formatTime(timeLeft)}
        </Timer>

        <Button onClick={handleVerify} disabled={loading}>
          {loading ? "인증 중..." : "확인"}
        </Button>

        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          취소
        </Button>

        <BackupCodeSection>
          <BackupCodeToggle
            onClick={() => setShowBackupCode(!showBackupCode)}
          >
            {showBackupCode ? "인증 코드 입력" : "백업 코드 사용"}
          </BackupCodeToggle>

          {showBackupCode && (
            <Alert type="info">
              백업 코드를 사용하여 로그인할 수 있습니다. 
              백업 코드는 한 번만 사용할 수 있습니다.
            </Alert>
          )}
        </BackupCodeSection>
      </ModalContent>
    </ModalOverlay>
  );
}
