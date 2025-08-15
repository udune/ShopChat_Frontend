import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
// 모달 컴포넌트들
import Fail from "../../components/modal/Fail"; // 에러 알림 모달
import CartSuccessModal from "components/modal/CartSuccessModal"; // 장바구니 담기 성공 모달
// 상품 관련 커스텀 훅들
import { useProductDetail } from "../../hooks/products/useProductDetail"; // 상품 상세 데이터 관리
import { useProductOptions } from "../../hooks/products/useProductOptions"; // 옵션 선택 및 수량 관리
import { useProductActions } from "../../hooks/products/useProductActions"; // 장바구니/주문 액션 관리
// 상품 상세 UI 컴포넌트들
import { ProductImages } from "../../components/products/ProductImages"; // 상품 이미지 슬라이더
import { ProductInfo } from "../../components/products/ProductInfo"; // 상품 기본 정보 (이름, 가격 등)
import { ModernOptionSelector } from "../../components/products/ModernOptionSelector"; // 모던 옵션 선택 컴포넌트 (성별, 색상, 사이즈)
import { SelectedOptions } from "../../components/products/SelectedOptions"; // 선택된 옵션 표시 및 수량 조절
import { ProductDescription } from "../../components/products/ProductDescription"; // 상품 상세 설명
import { ProductReviews } from "../../components/review/ProductReviews"; // 상품 리뷰 섹션
// 유틸리티 함수들
import {
  formatPrice, // 가격 포맷팅 (예: 50000 -> "50,000")
  getDiscountRate, // 할인율 계산
} from "../../utils/products/productUtils";
// 스타일 컴포넌트들
import {
  Container,
  ProductSection,
  ActionButtons,
  ActionButton,
  LoadingContainer,
  ErrorContainer,
} from "./DetailPage.styles";

/**
 * 상품 상세 페이지 컴포넌트
 * 
 * 기능:
 * - 상품 상세 정보 표시 (이미지, 이름, 가격, 설명 등)
 * - 사이즈/옵션 선택 및 수량 조절
 * - 장바구니 담기 / 바로 주문하기 기능
 * - 상품 리뷰 표시 및 작성
 * - 로딩, 에러 상태 처리
 * 
 * 라우팅:
 * - URL: /products/:id
 * - 장바구니 담기 성공 시 -> 장바구니 페이지로 이동 가능
 * - 바로 주문 시 -> 결제 페이지로 이동
 * 
 * 사용되는 커스텀 훅:
 * - useProductDetail: 상품 정보 패칭
 * - useProductOptions: 옵션 선택 상태 관리
 * - useProductActions: 장바구니/주문 처리
 */
const DetailPage: React.FC = () => {
  // URL에서 상품 ID 추출 및 네비게이션 훅
  const { id } = useParams<{ id: string }>(); // URL 파라미터에서 상품 ID 가져오기
  const navigate = useNavigate(); // 페이지 이동 함수

  // 상품 상세 정보 관리 훅
  const { product, loading, error } = useProductDetail(id);

  // 상품 옵션 선택 및 관리 훅
  const {
    selectedOptions,      // 현재 선택된 옵션들 (성별, 색상, 사이즈, 수량 포함)
    selectedGender,       // 선택된 성별
    selectedColor,        // 선택된 색상
    handleGenderSelect,   // 성별 선택 핸들러
    handleColorSelect,    // 색상 선택 핸들러
    handleSizeSelect,     // 사이즈 선택 핸들러
    handleQuantityChange, // 수량 변경 핸들러
    handleRemoveOption,   // 선택된 옵션 제거 핸들러
    clearSelectedOptions, // 모든 선택 옵션 초기화
    getTotalQuantity,     // 전체 선택 수량 계산
    getTotalPrice,        // 전체 선택 가격 계산
    getAvailableGenders,  // 선택 가능한 성별 목록
    getAvailableColors,   // 선택 가능한 색상 목록
    getAvailableSizes,    // 선택 가능한 사이즈 목록
  } = useProductOptions(product);

  // 장바구니 및 주문 액션 관리 훅
  const { handleAddToCart, handleDirectOrder } = useProductActions(
    product,
    selectedOptions
  );

  // 컴포넌트 로컬 상태들
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // 현재 선택된 이미지 인덱스
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 성공 모달 표시 여부
  const [showErrorModal, setShowErrorModal] = useState(false); // 에러 모달 표시 여부
  const [modalMessage, setModalMessage] = useState(""); // 모달에 표시할 메시지

  // 에러 처리 핸들러 - 에러 메시지를 받아서 에러 모달을 표시
  const handleError = (message: string) => {
    setModalMessage(message);
    setShowErrorModal(true);
  };

  // 성공 처리 핸들러 - 성공 메시지를 받아서 성공 모달을 표시
  const handleSuccess = (message: string) => {
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  // 로딩 상태일 때 로딩 메시지 표시
  if (loading) {
    return (
      <Container>
        <LoadingContainer>상품 정보를 불러오는 중...</LoadingContainer>
      </Container>
    );
  }

  // 에러 발생 또는 상품이 없을 때 에러 메시지와 이전 페이지로 돌아가기 버튼 표시
  if (error || !product) {
    return (
      <Container>
        <ErrorContainer>
          <h3>오류가 발생했습니다</h3>
          <p>{error}</p>
          <button onClick={() => navigate("/products")}>
            상품 목록으로 돌아가기
          </button>
        </ErrorContainer>
      </Container>
    );
  }

  // 메인 렌더링: 상품 정보와 관련 UI 요소들
  return (
    <Container>
      {/* 상품 이미지와 기본 정보 섹션 */}
      <ProductSection>
        {/* 상품 이미지 슬라이더 */}
        <ProductImages
          product={product}
          selectedImageIndex={selectedImageIndex}
          onImageSelect={setSelectedImageIndex}
        />

        {/* 상품 정보 및 옵션 선택 영역 */}
        <div>
          {/* 상품 기본 정보 (이름, 가격, 할인율 등) */}
          <ProductInfo
            product={product}
            formatPrice={formatPrice}
            getDiscountRate={() => getDiscountRate(product)}
          />

          {/* 모던 옵션 선택 컴포넌트 (성별, 색상, 사이즈) */}
          <ModernOptionSelector
            product={product}
            selectedOptions={selectedOptions}
            selectedGender={selectedGender}
            selectedColor={selectedColor}
            onGenderSelect={handleGenderSelect}
            onColorSelect={handleColorSelect}
            onSizeSelect={(optionId) => handleSizeSelect(optionId, handleError)}
            getAvailableGenders={getAvailableGenders}
            getAvailableColors={getAvailableColors}
            getAvailableSizes={getAvailableSizes}
          />

          {/* 선택된 옵션 표시 및 수량 조절 */}
          <SelectedOptions
            selectedOptions={selectedOptions}
            onQuantityChange={(optionId, quantity) =>
              handleQuantityChange(optionId, quantity, handleError)
            }
            onRemoveOption={handleRemoveOption}
            getTotalQuantity={getTotalQuantity}
            getTotalPrice={getTotalPrice}
            formatPrice={formatPrice}
          />

          {/* 장바구니 담기 / 바로 주문하기 버튼들 */}
          <ActionButtons>
            {/* 장바구니 담기 버튼 */}
            <ActionButton
              $variant="secondary"
              onClick={() =>
                handleAddToCart(
                  handleSuccess,  // 성공 시 성공 모달 표시
                  handleError,    // 실패 시 에러 모달 표시
                  clearSelectedOptions // 성공 시 선택된 옵션 초기화
                )
              }
              disabled={selectedOptions.length === 0} // 옵션이 선택되지 않으면 비활성화
            >
              장바구니 담기{" "}
              {selectedOptions.length > 0 && `(${getTotalQuantity()}개)`}
            </ActionButton>
            
            {/* 바로 주문하기 버튼 */}
            <ActionButton
              $variant="primary"
              onClick={() => handleDirectOrder(handleError)} // 결제 페이지로 이동
              disabled={selectedOptions.length === 0} // 옵션이 선택되지 않으면 비활성화
            >
              바로 주문하기{" "}
              {selectedOptions.length > 0 &&
                `(${formatPrice(getTotalPrice())}원)`}
            </ActionButton>
          </ActionButtons>
        </div>
      </ProductSection>

      {/* 상품 상세 설명 섹션 */}
      <ProductDescription product={product} />

      {/* 상품 리뷰 섹션 */}
      <ProductReviews
        productId={product.productId}
        productImage={product.images?.[0].url}
      />

      {/* 장바구니 담기 성공 모달 */}
      <CartSuccessModal
        open={showSuccessModal}
        message={modalMessage}
        onClose={() => setShowSuccessModal(false)}
        onGoToCart={() => navigate("/cart")} // 장바구니 페이지로 이동
      />

      {/* 에러 알림 모달 */}
      {showErrorModal && (
        <Fail
          title="알림"
          message={modalMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </Container>
  );
};

export default DetailPage;
