import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

// Styled Components
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
  
  &:hover {
    color: #333;
  }
  
  i {
    font-size: 12px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const ProfileSection = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
`;

const SectionDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
`;

const SectionContent = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
`;

const ProfileImageSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const ProfileImage = styled.div<{ $imageUrl?: string }>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#e9ecef'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  i {
    font-size: 40px;
    color: #adb5bd;
  }
`;

const ImageUploadButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #0056b3;
  }
`;

const ImageDeleteButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #c82333;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
      case 'secondary':
        return `
          background: #6c757d;
          color: white;
          &:hover { background: #545b62; }
        `;
      case 'danger':
        return `
          background: #dc3545;
          color: white;
          &:hover { background: #c82333; }
        `;
      default:
        return `
          background: #007bff;
          color: white;
          &:hover { background: #0056b3; }
        `;
    }
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Alert = styled.div<{ type: 'success' | 'error' | 'info' }>`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  font-size: 14px;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'error':
        return `
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'info':
        return `
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
    }
  }}
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.span`
  font-weight: 500;
  color: #333;
`;

const InfoValue = styled.span`
  color: #666;
`;

const Badge = styled.span<{ type: 'admin' | 'active' | 'inactive' }>`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => {
    switch (props.type) {
      case 'admin':
        return `
          background: #007bff;
          color: white;
        `;
      case 'active':
        return `
          background: #28a745;
          color: white;
        `;
      case 'inactive':
        return `
          background: #6c757d;
          color: white;
        `;
    }
  }}
`;

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    profileImage: null as File | null,
    profileImageUrl: ""
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    // Initialize form data
    setFormData(prev => ({
      ...prev,
      name: user.name,
      email: user.email
    }));
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file,
        profileImageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleImageDelete = () => {
    setFormData(prev => ({
      ...prev,
      profileImage: null,
      profileImageUrl: ""
    }));
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // TODO: API 호출로 프로필 업데이트
      // await updateAdminProfile(formData);
      
      // 임시로 성공 메시지 표시
      setSuccess("프로필이 성공적으로 업데이트되었습니다.");
      
      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = () => {
    // TODO: 비밀번호 변경 모달 또는 페이지로 이동
    alert("비밀번호 변경 기능은 추후 구현 예정입니다.");
  };

  const handleMfaSetup = () => {
    navigate("/mfa-setup");
  };

  const handleBackToSettings = () => {
    navigate("/admin/settings");
  };

  const handleLogoutAllDevices = () => {
    if (window.confirm("모든 기기에서 로그아웃하시겠습니까?")) {
      logout();
      navigate("/login");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Container>
      <BackButton onClick={handleBackToSettings}>
        <i className="fas fa-arrow-left"></i>
        관리자 설정으로 돌아가기
      </BackButton>

      <Header>
        <Title>관리자 프로필</Title>
        <Subtitle>계정 정보를 관리하고 보안 설정을 변경하세요</Subtitle>
      </Header>

      {error && <Alert type="error">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      {/* 프로필 이미지 섹션 */}
      <ProfileSection>
        <SectionHeader>
          <SectionTitle>프로필 이미지</SectionTitle>
          <SectionDescription>계정을 대표하는 프로필 이미지를 설정하세요</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <ProfileImageSection>
            <ProfileImage $imageUrl={formData.profileImageUrl}>
              {!formData.profileImageUrl && <i className="fas fa-user"></i>}
            </ProfileImage>
            <div>
              <input
                type="file"
                id="profile-image"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              <label htmlFor="profile-image">
                <ImageUploadButton as="span">이미지 업로드</ImageUploadButton>
              </label>
              {formData.profileImageUrl && (
                <ImageDeleteButton onClick={handleImageDelete} style={{ marginLeft: '10px' }}>
                  삭제
                </ImageDeleteButton>
              )}
            </div>
          </ProfileImageSection>
        </SectionContent>
      </ProfileSection>

      {/* 기본 정보 섹션 */}
      <ProfileSection>
        <SectionHeader>
          <SectionTitle>기본 정보</SectionTitle>
          <SectionDescription>개인 정보를 수정하고 관리하세요</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <FormGroup>
            <Label htmlFor="name">이름</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="email">이메일</Label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="이메일을 입력하세요"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="phone">전화번호</Label>
            <Input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="전화번호를 입력하세요"
            />
          </FormGroup>

          <ButtonGroup>
            <Button onClick={handleSaveProfile} disabled={loading}>
              {loading ? "저장 중..." : "저장"}
            </Button>
          </ButtonGroup>
        </SectionContent>
      </ProfileSection>

      {/* 계정 정보 섹션 */}
      <ProfileSection>
        <SectionHeader>
          <SectionTitle>계정 정보</SectionTitle>
          <SectionDescription>계정의 현재 상태와 권한을 확인하세요</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <InfoRow>
            <InfoLabel>사용자 ID</InfoLabel>
            <InfoValue>{user.nickname}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>계정 유형</InfoLabel>
            <InfoValue>
              <Badge type="admin">관리자</Badge>
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>계정 상태</InfoLabel>
            <InfoValue>
              <Badge type="active">활성</Badge>
            </InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>가입일</InfoLabel>
            <InfoValue>2024년 1월 1일</InfoValue>
          </InfoRow>
        </SectionContent>
      </ProfileSection>

      {/* 보안 설정 섹션 */}
      <ProfileSection>
        <SectionHeader>
          <SectionTitle>보안 설정</SectionTitle>
          <SectionDescription>계정 보안을 강화하고 관리하세요</SectionDescription>
        </SectionHeader>
        <SectionContent>
          <ButtonGroup>
            <Button variant="primary" onClick={handlePasswordChange}>
              <i className="fas fa-key" style={{ marginRight: '8px' }}></i>
              비밀번호 변경
            </Button>
            <Button variant="secondary" onClick={handleMfaSetup}>
              <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>
              2단계 인증 설정
            </Button>
            <Button variant="danger" onClick={handleLogoutAllDevices}>
              <i className="fas fa-sign-out-alt" style={{ marginRight: '8px' }}></i>
              모든 기기 로그아웃
            </Button>
          </ButtonGroup>
        </SectionContent>
      </ProfileSection>
    </Container>
  );
}
