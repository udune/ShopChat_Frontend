/**
 * SelectedOptions 컴포넌트
 *
 * 사이즈, 수량, 재고 정보를 포함한 사용자가 선택한 상품 옵션을 표시하고
 * 관리하는 포괄적인 컴포넌트입니다. 이 컴포넌트는 수량 조정, 제거 기능,
 * 수량과 가격에 대한 실시간 총계 계산을 통해 선택된 항목에 대한
 * 완전한 제어를 제공합니다.
 *
 * 주요 기능:
 * - 사이즈와 재고 정보가 있는 선택된 상품 옵션 표시
 * - 유효성 검사 제한이 있는 수량 조정 컨트롤
 * - 재고 인식을 위한 낮은 재고 경고 표시기
 * - 개별 옵션 제거 기능
 * - 실시간 총 수량 및 가격 계산
 * - 한국어 현지화된 라벨과 포맷팅
 * - 조건부 렌더링 (옵션이 선택되지 않았을 때 숨김)
 *
 * 사용 위치:
 * - 상품 상세 페이지 (DetailPage.tsx)
 * - 쇼핑 카트 인터페이스
 * - 결제 과정 옵션 검토
 *
 * UX 고려사항:
 * - 서로 다른 선택된 옵션 간의 명확한 시각적 분리
 * - 제한에 대한 비활성화 상태가 있는 직관적인 수량 컨트롤
 * - 재고 정보로 사용자가 정보에 기반한 수량 결정 도움
 * - 제거 버튼으로 쉬운 옵션 관리 제공
 * - 총 요약으로 사용자의 선택 사항 안내
 * - 낮은 재고 경고로 결제 시 실망 방지
 */

import React from "react"; // 컴포넌트 생성을 위한 핵심 React 라이브러리
import { SelectedOptions as SelectedOptionsType } from "../../hooks/products/useProductOptions"; // 선택된 상품 옵션을 위한 커스텀 훅 타입
import {
  SelectedOptionsContainer,
  SelectedOptionsTitle,
  SelectedOptionItem,
  OptionInfo,
  SizeText,
  StockInfo,
  QuantityControls,
  QuantityButton,
  QuantityDisplay,
  RemoveButton,
  TotalSummary,
  TotalRow,
} from "../../pages/products/DetailPage.styles"; // 선택된 옵션 UI 요소를 위한 스타일된 컴포넌트

/**
 * SelectedOptions 컴포넌트의 Props 인터페이스
 *
 * @interface SelectedOptionsProps
 * @property {SelectedOptionsType[]} selectedOptions - 수량이 포함된 사용자가 선택한 상품 옵션 배열
 * @property {function} onQuantityChange - 특정 옵션의 수량 변경을 처리하는 콜백 함수
 * @property {function} onRemoveOption - 특정 옵션 제거를 처리하는 콜백 함수
 * @property {function} getTotalQuantity - 모든 선택된 옵션의 총 수량을 계산하는 함수
 * @property {function} getTotalPrice - 모든 선택된 옵션의 총 가격을 계산하는 함수
 * @property {function} formatPrice - 적절한 현지화로 가격 숫자를 포맷하는 함수
 */
interface SelectedOptionsProps {
  selectedOptions: SelectedOptionsType[];
  onQuantityChange: (optionId: number, newQuantity: number) => void;
  onRemoveOption: (optionId: number) => void;
  getTotalQuantity: () => number;
  getTotalPrice: () => number;
  formatPrice: (price: number) => string;
}

/**
 * SelectedOptions 함수형 컴포넌트
 *
 * 수량 컨트롤, 재고 정보, 총계 계산을 포함한 선택된 상품 옵션을
 * 관리하기 위한 완전한 인터페이스를 렌더링합니다. 수량 조정과
 * 원하지 않는 옵션 제거를 위한 직관적인 컨트롤을 제공합니다.
 *
 * @param {SelectedOptionsProps} props - 컴포넌트 props
 * @returns {JSX.Element | null} 렌더링된 선택된 옵션 인터페이스 또는 옵션이 선택되지 않았을 경우 null
 */
export const SelectedOptions: React.FC<SelectedOptionsProps> = ({
  selectedOptions,
  onQuantityChange,
  onRemoveOption,
  getTotalQuantity,
  getTotalPrice,
  formatPrice,
}) => {
  // 옵션이 선택되지 않았으면 컴포넌트를 완전히 숨김
  if (selectedOptions.length === 0) return null;

  return (
    <SelectedOptionsContainer>
      {/* 섹션 제목 - 콘텐츠 목적을 명확히 식별 */}
      <SelectedOptionsTitle>선택된 옵션</SelectedOptionsTitle>

      {/* 선택된 옵션을 매핑하여 개별 옵션 컨트롤 렌더링 */}
      {selectedOptions.map((option) => (
        <SelectedOptionItem key={option.optionId}>
          {/* 옵션 정보 섹션 - 사이즈와 재고 세부 정보 표시 */}
          <OptionInfo>
            {/* 옵션 표시 - 선택된 상품 옵션 정보 표시 */}
            <SizeText>
              {option.gender === "MEN" ? "남성" : option.gender === "WOMEN" ? "여성" : "공용"} / {option.color} / {option.size}
            </SizeText>

            {/* 낮은 재고 경고가 있는 재고 정보 */}
            <StockInfo $lowStock={option.stock < 5}>
              재고 {option.stock}개 {/* 한국어: "재고 X개" */}
            </StockInfo>
          </OptionInfo>

          {/* 수량 컨트롤 섹션 - 옵션 조정 및 제거를 위한 버튼 */}
          <QuantityControls>
            {/* 수량 감소 버튼 - 수량이 최소값일 때 비활성화 */}
            <QuantityButton
              onClick={() =>
                onQuantityChange(option.optionId, option.quantity - 1)
              }
              disabled={option.quantity <= 1} // 1개 미만으로 내려가지 않도록 방지
            >
              -
            </QuantityButton>

            {/* 현재 수량 표시 - 선택된 수량 표시 */}
            <QuantityDisplay>{option.quantity}</QuantityDisplay>

            {/* 수량 증가 버튼 - 한계에 도달했을 때 비활성화 */}
            <QuantityButton
              onClick={() =>
                onQuantityChange(option.optionId, option.quantity + 1)
              }
              disabled={option.quantity >= 5 || option.quantity >= option.stock} // 5개 또는 사용 가능한 재고로 제한
            >
              +
            </QuantityButton>

            {/* 옵션 제거 버튼 - 이 옵션을 선택에서 완전히 제거 */}
            <RemoveButton onClick={() => onRemoveOption(option.optionId)}>
              ✕
            </RemoveButton>
          </QuantityControls>
        </SelectedOptionItem>
      ))}

      {/* 총 요약 섹션 - 결합된 수량과 가격 정보 표시 */}
      <TotalSummary>
        {/* 총 수량 행 - 모든 선택된 항목 수량의 합계 표시 */}
        <TotalRow>
          <span>총 수량</span> {/* 한국어: "총 수량" */}
          <span>{getTotalQuantity()}개</span> {/* 한국어: "X개" */}
        </TotalRow>

        {/* 총 가격 행 - 모든 선택된 항목 가격의 합계 표시 */}
        <TotalRow>
          <span>총 금액</span> {/* 한국어: "총 금액" */}
          <span>{formatPrice(getTotalPrice())}원</span> {/* 한국어: "X원" */}
        </TotalRow>
      </TotalSummary>
    </SelectedOptionsContainer>
  );
};
