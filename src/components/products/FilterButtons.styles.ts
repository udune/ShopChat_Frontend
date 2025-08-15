import styled from "styled-components";

export const FilterContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  }
`;

export const FilterRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: stretch;

  &:last-child {
    margin-bottom: 0;
  }

  &:first-child {
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid #f1f5f9;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
    
    &:first-child {
      margin-bottom: 24px;
      padding-bottom: 16px;
    }
  }
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 160px;
  flex: 1;

  @media (max-width: 768px) {
    min-width: auto;
    flex: none;
  }
`;

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  text-transform: capitalize;
  letter-spacing: 0.025em;
`;

export const FilterDropdown = styled.select<{ $hasValue?: boolean }>`
  padding: 10px 12px;
  border: 1px solid ${props => props.$hasValue ? '#3b82f6' : '#d1d5db'};
  border-radius: 8px;
  background: ${props => props.$hasValue ? '#eff6ff' : 'white'};
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 140px;
  height: 40px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover:not(:disabled) {
    border-color: #9ca3af;
  }

  &:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

export const FilterInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.2s ease;
  width: 120px;
  height: 40px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:hover {
    border-color: #9ca3af;
  }

  &::placeholder {
    color: #9ca3af;
    font-size: 0.8rem;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const PriceRangeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  span {
    color: #6b7280;
    font-size: 0.875rem;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;

    span {
      display: none;
    }
  }
`;

export const ClearButton = styled.button`
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  height: 36px;
  align-self: flex-end;
  white-space: nowrap;

  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ClearButtonContainer = styled.div`
  display: flex;
  align-items: flex-end;
  padding-left: 20px;
  
  @media (max-width: 768px) {
    padding-left: 0;
    margin-top: 16px;
    justify-content: center;
  }
`;