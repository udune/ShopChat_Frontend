import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { AddressService } from "../../api/addressService";
import { AddressResponse, AddressRequest } from "../../types/types";
import AddressModal from "../../components/address/AddressModal";

const Container = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 2rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: white;
`;

const AddressList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const AddressCard = styled.div<{ isDefault?: boolean }>`
  background: ${(props) =>
    props.isDefault
      ? "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(0, 0, 0, 0.2) 100%)"
      : "rgba(0, 0, 0, 0.2)"};
  border: ${(props) =>
    props.isDefault ? "2px solid rgba(249, 115, 22, 0.3)" : "none"};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;

  ${(props) =>
    props.isDefault &&
    `
    &:hover {
      border-color: rgba(249, 115, 22, 0.5);
      box-shadow: 0 4px 8px rgba(249, 115, 22, 0.2);
    }
  `}
`;

const AddressInfo = styled.div`
  p {
    margin: 0.5rem 0;
    color: rgba(255, 255, 255, 0.9);
  }
  strong {
    color: white;
  }
`;

const AddressName = styled.span`
  font-weight: 700;
  font-size: 1.2rem;
  margin-right: 1rem;
`;

const DefaultBadge = styled.span`
  background: #f97316;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 0.5rem;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(249, 115, 22, 0.3);
  animation: pulse 2s infinite;

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #f97316;
  color: #f97316;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s, color 0.3s;

  &:hover {
    background: #f97316;
    color: white;
  }
`;

const AddButton = styled(ActionButton)`
  background: #f97316;
  color: white;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #9ca3af;

  p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
`;

const AddressManagementPage = () => {
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressResponse | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 배송지 목록 조회
  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📂 배송지 목록 조회 시작...");
      const data = await AddressService.getAddresses();
      // console.log("📂 백엔드에서 받은 배송지 데이터:", data);
      setAddresses(data);
    } catch (err) {
      setError("배송지 목록을 불러오는 중 오류가 발생했습니다.");
      console.error("❌ 배송지 조회 실패:", err);

      // 개발 환경에서 테스트 데이터 사용
      if (process.env.NODE_ENV === "development") {
        console.warn("개발 환경: 테스트 배송지 데이터를 사용합니다.");
        const testData = [
          {
            addressId: 1,
            recipientName: "홍길동",
            recipientPhone: "010-1234-5678",
            zipCode: "06240",
            addressLine1: "서울특별시 강남구 테헤란로 123",
            addressLine2: "ABC빌딩 10층",
            isDefault: true,
          },
          {
            addressId: 2,
            recipientName: "김영희",
            recipientPhone: "010-8765-4321",
            zipCode: "06611",
            addressLine1: "서울특별시 서초구 서초대로 456",
            addressLine2: "XYZ오피스텔 503호",
            isDefault: false,
          },
        ];
        setAddresses(testData);
        console.log(
          "📂 테스트 데이터 설정:",
          testData.map((a) => ({
            id: a.addressId,
            name: a.recipientName,
            isDefault: a.isDefault,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect를 사용하여 상태 변경 후 로깅
  useEffect(() => {
    fetchAddresses();
  }, []);

  // 배송지 저장 (추가 또는 수정)
  const handleSaveAddress = async (addressData: AddressRequest) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (editingAddress) {
        // 수정
        await AddressService.updateAddress(editingAddress.addressId, addressData);
      } else {
        // 추가
        await AddressService.addAddress(addressData);
      }

      await fetchAddresses();
      setIsModalOpen(false);
      setEditingAddress(null);
    } catch (err) {
      setError(
        editingAddress
          ? "배송지 수정 중 오류가 발생했습니다."
          : "배송지 추가 중 오류가 발생했습니다."
      );
      console.error("배송지 저장 실패:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 배송지 삭제
  const handleDelete = async (id: number) => {
    if (!window.confirm("정말로 이 배송지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setError(null);
      await AddressService.deleteAddress(id);
      await fetchAddresses();
    } catch (err) {
      setError("배송지 삭제 중 오류가 발생했습니다.");
      console.error("배송지 삭제 실패:", err);
    }
  };

  // 수정 모달 열기
  const handleEdit = (address: AddressResponse) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  // 새 배송지 추가 모달 열기
  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
  };

  // 기본 배송지 설정
  const handleSetDefault = async (addressId: number) => {
    try {
      setError(null);
      console.log("🔧 기본 배송지 설정 시작:", addressId);

      // 설정할 배송지 정보 찾기
      const targetAddress = addresses.find((addr) => addr.addressId === addressId);
      if (!targetAddress) {
        setError("배송지 정보를 찾을 수 없습니다.");
        return;
      }

      // 백엔드 updateAddress API를 사용하여 isDefault 값을 true로 변경
      // 백엔드에서 자동으로 기존 기본 배송지를 해제해줌
      console.log("🚀 updateAddress API 호출 시작...");

      // AddressRequest 타입에 맞춰 데이터를 준비
      const requestData: AddressRequest = {
        recipientName: targetAddress.recipientName,
        recipientPhone: targetAddress.recipientPhone,
        zipCode: targetAddress.zipCode,
        addressLine1: targetAddress.addressLine1,
        addressLine2: targetAddress.addressLine2,
        isDefault: true, // ✅ 이 부분이 핵심
      };

      await AddressService.updateAddress(addressId, requestData);
      console.log("✅ API 호출 완료");

      console.log("🔄 배송지 목록 새로고침...");
      await fetchAddresses(); // 목록 새로고침
      console.log("✅ 새로고침 완료");
    } catch (err) {
      setError("기본 배송지 설정 중 오류가 발생했습니다.");
      console.error("❌ 기본 배송지 설정 실패:", err);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <Container>
        <Title>주소록 관리</Title>
        <LoadingMessage>배송지 목록을 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Title>주소록 관리</Title>

      {/* 에러 메시지 */}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* 기본 배송지 없음 경고 */}
      {addresses.length > 0 && !addresses.some((addr) => addr.isDefault) && (
        <ErrorMessage
          style={{ background: "rgba(251, 191, 36, 0.1)", color: "#f59e0b" }}
        >
          ⚠️ 기본 배송지가 설정되지 않았습니다. 하나의 배송지를 기본으로
          설정해주세요.
        </ErrorMessage>
      )}

      {/* 배송지 목록 */}
      {addresses.length === 0 ? (
        <EmptyMessage>
          <p>등록된 배송지가 없습니다.</p>
          <p>새로운 배송지를 추가해 보세요.</p>
        </EmptyMessage>
      ) : (
        <AddressList>
          {addresses.map((addr) => (
            <AddressCard key={addr.addressId} isDefault={addr.isDefault}>
              <AddressInfo>
                <div>
                  <AddressName>{addr.recipientName}</AddressName>
                  {addr.isDefault && <DefaultBadge>기본 배송지</DefaultBadge>}
                  {/* 개발환경에서 디버깅용 */}
                  {process.env.NODE_ENV === "development" && (
                    <span
                      style={{
                        marginLeft: "10px",
                        fontSize: "12px",
                        color: addr.isDefault ? "#f97316" : "#666",
                        fontWeight: "bold",
                      }}
                    ></span>
                  )}
                </div>
                <p>
                  <strong>받는 분:</strong> {addr.recipientName}
                </p>
                <p>
                  <strong>주소:</strong> ({addr.zipCode}) {addr.addressLine1}
                  {addr.addressLine2 && `, ${addr.addressLine2}`}
                </p>
                <p>
                  <strong>연락처:</strong> {addr.recipientPhone}
                </p>
              </AddressInfo>
              <ButtonGroup>
                {!addr.isDefault && (
                  <ActionButton onClick={() => handleSetDefault(addr.addressId)}>
                    기본으로 설정
                  </ActionButton>
                )}
                <ActionButton onClick={() => handleEdit(addr)}>
                  수정
                </ActionButton>
                <ActionButton onClick={() => handleDelete(addr.addressId)}>
                  삭제
                </ActionButton>
              </ButtonGroup>
            </AddressCard>
          ))}
        </AddressList>
      )}

      {/* 새 배송지 추가 버튼 */}
      <AddButton onClick={handleAddNew}>새 배송지 추가</AddButton>

      {/* 배송지 추가/수정 모달 */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        editingAddress={editingAddress}
        isLoading={isSubmitting}
      />
    </Container>
  );
};

export default AddressManagementPage;
