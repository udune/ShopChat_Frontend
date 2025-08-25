import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { PointBalance } from "../../api/pointService";

const PointContainer = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const PointBalanceInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #e8f4fd;
  border-radius: 6px;
  margin-bottom: 16px;
`;

const BalanceText = styled.span`
  font-size: 14px;
  color: #333;
`;

const BalanceAmount = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #007bff;
`;

const PointToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const ToggleSwitch = styled.input`
  width: 44px;
  height: 24px;
  appearance: none;
  background: #ccc;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;

  &:checked {
    background: #007bff;
  }

  &::before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
  }

  &:checked::before {
    transform: translateX(20px);
  }
`;

const ToggleLabel = styled.label`
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

const PointInputSection = styled.div<{ enabled: boolean }>`
  opacity: ${props => props.enabled ? 1 : 0.5};
  transition: opacity 0.3s ease;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const PointInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    border-color: #007bff;
    outline: none;
  }

  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
  }
`;

const QuickButtons = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
`;

const QuickButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const ValidationMessage = styled.div<{ show: boolean }>`
  display: ${props => props.show ? 'block' : 'none'};
  color: #dc3545;
  font-size: 12px;
  margin-top: 8px;
`;

const PointRestrictionInfo = styled.div`
  margin-top: 12px;
  padding: 8px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  font-size: 12px;
  color: #856404;
`;

interface EnhancedPointSectionProps {
  usePoint: boolean;
  usedPoints: number;
  pointBalance: PointBalance | null;
  isProcessing: boolean;
  formatPrice: (price: number) => string;
  onPointToggle: (enabled: boolean) => void;
  onPointsChange: (value: string) => void;
  onUseAllPoints: () => void;
}

export const EnhancedPointSection: React.FC<EnhancedPointSectionProps> = ({
  usePoint,
  usedPoints,
  pointBalance,
  isProcessing,
  formatPrice,
  onPointToggle,
  onPointsChange,
  onUseAllPoints,
}) => {
  const [inputValue, setInputValue] = useState(usedPoints.toString());
  const [validationMessage, setValidationMessage] = useState("");

  useEffect(() => {
    setInputValue(usedPoints.toString());
  }, [usedPoints]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const numValue = parseInt(value) || 0;
    
    // 실시간 유효성 검사
    if (numValue > 0 && numValue % 100 !== 0) {
      setValidationMessage("포인트는 100원 단위로만 사용 가능합니다.");
    } else {
      setValidationMessage("");
    }

    onPointsChange(value);
  };

  const handleInputBlur = () => {
    const numValue = parseInt(inputValue) || 0;
    if (numValue > 0 && numValue % 100 !== 0) {
      const adjustedValue = Math.floor(numValue / 100) * 100;
      setInputValue(adjustedValue.toString());
      onPointsChange(adjustedValue.toString());
      setValidationMessage("");
    }
  };

  const availablePoints = pointBalance?.currentPoints || 0;

  const setQuickAmount = (amount: number) => {
    const actualAmount = Math.min(amount, availablePoints);
    setInputValue(actualAmount.toString());
    onPointsChange(actualAmount.toString());
  };

  return (
    <PointContainer>
      <SectionTitle>포인트 사용</SectionTitle>
      
      <PointBalanceInfo>
        <BalanceText>보유 포인트</BalanceText>
        <BalanceAmount>{formatPrice(availablePoints)}</BalanceAmount>
      </PointBalanceInfo>

      <PointToggle>
        <ToggleSwitch
          type="checkbox"
          id="usePointToggle"
          checked={usePoint}
          onChange={(e) => onPointToggle(e.target.checked)}
          disabled={isProcessing}
        />
        <ToggleLabel htmlFor="usePointToggle">
          포인트 사용하기
        </ToggleLabel>
      </PointToggle>

      <PointInputSection enabled={usePoint}>
        <InputWrapper>
          <PointInput
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="사용할 포인트를 입력하세요"
            min="0"
            step="100"
            max={availablePoints}
            disabled={!usePoint || isProcessing}
          />
        </InputWrapper>

        <QuickButtons>
          <QuickButton
            onClick={() => setQuickAmount(100)}
            disabled={!usePoint || availablePoints < 100 || isProcessing}
          >
            100P
          </QuickButton>
          <QuickButton
            onClick={() => setQuickAmount(500)}
            disabled={!usePoint || availablePoints < 500 || isProcessing}
          >
            500P
          </QuickButton>
          <QuickButton
            onClick={() => setQuickAmount(1000)}
            disabled={!usePoint || availablePoints < 1000 || isProcessing}
          >
            1000P
          </QuickButton>
          <QuickButton
            onClick={onUseAllPoints}
            disabled={!usePoint || availablePoints === 0 || isProcessing}
          >
            전액 사용
          </QuickButton>
        </QuickButtons>

        <ValidationMessage show={!!validationMessage}>
          {validationMessage}
        </ValidationMessage>

        <PointRestrictionInfo>
          💡 포인트는 100원 단위로만 사용 가능하며, 구매금액의 10%까지 사용할 수 있습니다.
        </PointRestrictionInfo>
      </PointInputSection>
    </PointContainer>
  );
};