import React from "react";
import styled from "styled-components";
import { UserLevelInfo } from "../../api/levelService";

const LevelContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  color: white;
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const LevelInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LevelEmoji = styled.span`
  font-size: 32px;
`;

const LevelText = styled.div`
  display: flex;
  flex-direction: column;
`;

const LevelName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
`;

const TotalPoints = styled.span`
  font-size: 14px;
  opacity: 0.9;
`;

const ProgressContainer = styled.div`
  margin-top: 12px;
`;

const ProgressBar = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  height: 8px;
  margin-bottom: 8px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  background: white;
  height: 100%;
  width: ${props => props.progress * 100}%;
  transition: width 0.3s ease;
`;

const NextLevelInfo = styled.div`
  font-size: 12px;
  opacity: 0.9;
  text-align: center;
`;

const LevelBenefit = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 12px;
  font-size: 13px;
  text-align: center;
`;

interface UserLevelSectionProps {
  userLevel: UserLevelInfo;
}

export const UserLevelSection: React.FC<UserLevelSectionProps> = ({
  userLevel,
}) => {
  return (
    <LevelContainer>
      <LevelHeader>
        <LevelInfo>
          <LevelEmoji>{userLevel.levelEmoji}</LevelEmoji>
          <LevelText>
            <LevelName>{userLevel.levelDisplayName}</LevelName>
            <TotalPoints>{userLevel.totalPoints.toLocaleString()}P</TotalPoints>
          </LevelText>
        </LevelInfo>
      </LevelHeader>

      <ProgressContainer>
        <ProgressBar>
          <ProgressFill progress={userLevel.levelProgress} />
        </ProgressBar>
        <NextLevelInfo>
          다음 레벨까지 {userLevel.pointsToNextLevel.toLocaleString()}P
        </NextLevelInfo>
      </ProgressContainer>

      {userLevel.currentLevel.discountRate > 0 && (
        <LevelBenefit>
          🎁 {(userLevel.currentLevel.discountRate * 100).toFixed(1)}% 할인 혜택
        </LevelBenefit>
      )}
    </LevelContainer>
  );
};