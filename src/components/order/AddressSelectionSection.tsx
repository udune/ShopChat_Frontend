import React, { useState } from "react";
import styled from "styled-components";
import { AddressResponse } from "../../types/types";

const AddressContainer = styled.div`
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

const AddressSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AddressOption = styled.div<{ selected?: boolean }>`
  padding: 16px;
  border: 2px solid ${props => props.selected ? '#007bff' : '#e9ecef'};
  border-radius: 8px;
  background: ${props => props.selected ? '#f0f8ff' : 'white'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
`;

const AddressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const RecipientName = styled.span`
  font-weight: 600;
  color: #333;
  margin-right: 8px;
`;

const RecipientPhone = styled.span`
  color: #666;
  font-size: 14px;
`;

const DefaultBadge = styled.span`
  background: #28a745;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-left: auto;
`;

const AddressText = styled.div`
  color: #666;
  font-size: 14px;
  line-height: 1.4;
`;

const NewAddressButton = styled.button`
  width: 100%;
  padding: 12px;
  border: 2px dashed #ccc;
  background: transparent;
  color: #666;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;

  &:hover {
    border-color: #007bff;
    color: #007bff;
  }
`;

interface AddressSelectionSectionProps {
  addresses: AddressResponse[];
  selectedAddress: AddressResponse | null;
  onAddressSelect: (address: AddressResponse) => void;
}

export const AddressSelectionSection: React.FC<AddressSelectionSectionProps> = ({
  addresses,
  selectedAddress,
  onAddressSelect,
}) => {
  if (addresses.length === 0) {
    return null; // 배송지가 없으면 섹션 자체를 숨김
  }

  return (
    <AddressContainer>
      <SectionTitle>배송지 선택</SectionTitle>
      <AddressSelector>
        {addresses.map((address) => (
          <AddressOption
            key={address.addressId}
            selected={selectedAddress?.addressId === address.addressId}
            onClick={() => onAddressSelect(address)}
          >
            <AddressHeader>
              <div>
                <RecipientName>{address.recipientName}</RecipientName>
                <RecipientPhone>{address.recipientPhone}</RecipientPhone>
              </div>
              {address.isDefault && <DefaultBadge>기본 배송지</DefaultBadge>}
            </AddressHeader>
            <AddressText>
              ({address.zipCode}) {address.addressLine1}
              {address.addressLine2 && `, ${address.addressLine2}`}
            </AddressText>
          </AddressOption>
        ))}
      </AddressSelector>
    </AddressContainer>
  );
};