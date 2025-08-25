import React from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
`;

const SettingCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 25px rgba(0, 0, 0, 0.15);
    border-color: #3b82f6;
  }
`;

const CardHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
`;

const CardIcon = styled.div<{ bgColor: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ bgColor }) => bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  i {
    font-size: 20px;
    color: white;
  }
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
`;

const CardDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
`;

const CardBody = styled.div`
  padding: 24px;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  color: #374151;

  &:before {
    content: "✓";
    color: #10b981;
    font-weight: bold;
    margin-right: 8px;
  }
`;

const StatusBadge = styled.span<{
  status: "active" | "inactive" | "recommended";
}>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  margin-top: 12px;

  ${({ status }) => {
    switch (status) {
      case "active":
        return `
          background: #d1fae5;
          color: #065f46;
        `;
      case "inactive":
        return `
          background: #fee2e2;
          color: #991b1b;
        `;
      case "recommended":
        return `
          background: #dbeafe;
          color: #1e40af;
        `;
    }
  }}
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

export default function AdminSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleAdminProfile = () => {
    navigate("/admin/profile");
  };

  const handleMfaSetup = () => {
    navigate("/mfa-setup");
  };

  const handleUserManagement = () => {
    navigate("/user-manage");
  };

  const handleReportManagement = () => {
    navigate("/report-manage");
  };

  const handleDashboard = () => {
    navigate("/admin/dashboard");
  };

  const handleStatsManagement = () => {
    navigate("/stats-dashboard");
  };

  const handleBackToDashboard = () => {
    navigate("/admin/dashboard");
  };

  return (
    <Container>
      <BackButton onClick={handleBackToDashboard}>
        <i className="fas fa-arrow-left"></i>
        대시보드로 돌아가기
      </BackButton>

      <Header>
        <Title>관리자 설정</Title>
        <Subtitle>시스템 보안 및 관리 기능을 설정하고 관리하세요</Subtitle>
      </Header>

      <SettingsGrid>
        {/* 관리자 프로필 */}
        <SettingCard onClick={handleAdminProfile}>
          <CardHeader>
            <CardIcon bgColor="#3b82f6">
              <i className="fas fa-user-cog"></i>
            </CardIcon>
            <CardTitle>관리자 프로필</CardTitle>
            <CardDescription>
              개인 정보 관리 및 보안 설정을 변경합니다
            </CardDescription>
            <StatusBadge status="active">활성</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>프로필 이미지 업로드/변경</FeatureItem>
              <FeatureItem>개인 정보 수정</FeatureItem>
              <FeatureItem>비밀번호 변경</FeatureItem>
              <FeatureItem>보안 설정 관리</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* MFA 설정 */}
        <SettingCard onClick={handleMfaSetup}>
          <CardHeader>
            <CardIcon bgColor="#ef4444">
              <i className="fas fa-shield-alt"></i>
            </CardIcon>
            <CardTitle>2단계 인증 (MFA)</CardTitle>
            <CardDescription>
              계정 보안을 강화하기 위한 2단계 인증을 설정합니다
            </CardDescription>
            <StatusBadge status="recommended">권장</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>QR 코드 기반 TOTP 인증</FeatureItem>
              <FeatureItem>Google Authenticator 지원</FeatureItem>
              <FeatureItem>백업 코드 제공</FeatureItem>
              <FeatureItem>관리자 계정 보안 강화</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* 사용자 관리 */}
        <SettingCard onClick={handleUserManagement}>
          <CardHeader>
            <CardIcon bgColor="#3b82f6">
              <i className="fas fa-users"></i>
            </CardIcon>
            <CardTitle>사용자 관리</CardTitle>
            <CardDescription>
              등록된 사용자들을 관리하고 권한을 설정합니다
            </CardDescription>
            <StatusBadge status="active">활성</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>사용자 목록 조회</FeatureItem>
              <FeatureItem>권한 변경 및 관리</FeatureItem>
              <FeatureItem>계정 활성/비활성화</FeatureItem>
              <FeatureItem>사용자 통계 확인</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* 신고 관리 */}
        <SettingCard onClick={handleReportManagement}>
          <CardHeader>
            <CardIcon bgColor="#f59e0b">
              <i className="fas fa-flag"></i>
            </CardIcon>
            <CardTitle>신고 관리</CardTitle>
            <CardDescription>
              사용자 신고 내용을 검토하고 처리합니다
            </CardDescription>
            <StatusBadge status="active">활성</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>신고 내용 검토</FeatureItem>
              <FeatureItem>적절한 조치 시행</FeatureItem>
              <FeatureItem>신고 처리 현황 관리</FeatureItem>
              <FeatureItem>커뮤니티 가이드라인 관리</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* 통계 대시보드 */}
        <SettingCard onClick={handleStatsManagement}>
          <CardHeader>
            <CardIcon bgColor="#10b981">
              <i className="fas fa-chart-bar"></i>
            </CardIcon>
            <CardTitle>통계 대시보드</CardTitle>
            <CardDescription>
              시스템 사용 현황과 통계를 확인합니다
            </CardDescription>
            <StatusBadge status="active">활성</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>사용자 활동 통계</FeatureItem>
              <FeatureItem>매출 및 주문 현황</FeatureItem>
              <FeatureItem>상품 및 리뷰 통계</FeatureItem>
              <FeatureItem>실시간 모니터링</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* 대시보드 */}
        <SettingCard onClick={handleDashboard}>
          <CardHeader>
            <CardIcon bgColor="#8b5cf6">
              <i className="fas fa-tachometer-alt"></i>
            </CardIcon>
            <CardTitle>메인 대시보드</CardTitle>
            <CardDescription>
              전체적인 시스템 현황을 한눈에 확인합니다
            </CardDescription>
            <StatusBadge status="active">활성</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>실시간 시스템 현황</FeatureItem>
              <FeatureItem>주요 지표 모니터링</FeatureItem>
              <FeatureItem>빠른 액세스 메뉴</FeatureItem>
              <FeatureItem>알림 및 이벤트 관리</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>

        {/* 시스템 설정 (향후 확장) */}
        <SettingCard style={{ opacity: 0.6, cursor: "not-allowed" }}>
          <CardHeader>
            <CardIcon bgColor="#6b7280">
              <i className="fas fa-cog"></i>
            </CardIcon>
            <CardTitle>시스템 설정</CardTitle>
            <CardDescription>
              시스템 전반적인 설정을 관리합니다 (준비 중)
            </CardDescription>
            <StatusBadge status="inactive">개발 예정</StatusBadge>
          </CardHeader>
          <CardBody>
            <FeatureList>
              <FeatureItem>사이트 기본 설정</FeatureItem>
              <FeatureItem>이메일 템플릿 관리</FeatureItem>
              <FeatureItem>백업 및 복원</FeatureItem>
              <FeatureItem>로그 관리</FeatureItem>
            </FeatureList>
          </CardBody>
        </SettingCard>
      </SettingsGrid>
    </Container>
  );
}
