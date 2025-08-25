import { useState, useRef, useEffect, FC, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import * as echarts from "echarts";
import { useAuth } from "../../contexts/AuthContext";

// 애니메이션 정의
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInSmooth = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(135, 206, 235, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(135, 206, 235, 0.6);
  }
`;

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  color: white;
  font-family: "Pretendard", sans-serif;
  overflow-x: hidden;
`;

const Header = styled.header`
  height: 70px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  animation: ${fadeInUp} 0.4s ease-out;
`;

const LogoWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.h1`
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    filter: drop-shadow(0 4px 8px rgba(249, 115, 22, 0.4));
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 32px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled.a`
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(249, 115, 22, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    color: white;
    background: rgba(249, 115, 22, 0.1);
    transform: translateY(-2px);

    &::before {
      left: 100%;
    }
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  padding: 10px;
  border-radius: 12px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    color: white;
    background: rgba(249, 115, 22, 0.2);
    border-color: rgba(249, 115, 22, 0.3);
    transform: scale(1.1);
    animation: ${glow} 1s ease-in-out;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
  transition: all 0.3s ease;
  white-space: nowrap;
  cursor: pointer;
  border: none;
  font-weight: 600;
  backdrop-filter: blur(10px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(249, 115, 22, 0.4);
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

const MobileMenuButton = styled(IconButton)`
  display: none;
  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 50;
  transition: opacity 0.3s;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileMenuDrawer = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.3);
  transform: translateX(${(props) => (props.$isOpen ? "0" : "100%")});
  transition: transform 0.3s;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
`;

const MobileMenuHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MobileMenuTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: bold;
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const MobileMenuNav = styled.nav`
  padding: 20px;
`;

const MobileMenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  space-y: 16px;
`;

const MobileMenuListItem = styled.li`
  a {
    display: block;
    padding: 12px 0;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      color: white;
      background: rgba(249, 115, 22, 0.1);
      padding-left: 12px;
    }
  }
`;

const MobileMenuLoginSection = styled.div`
  margin-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
`;

const FlexContainer = styled.div`
  display: flex;
  flex: 1;
  margin-top: 70px;
  position: relative;
`;

const Sidebar = styled.aside<{ $isOpen: boolean }>`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.3);
  position: fixed;
  left: 0;
  top: 70px;
  bottom: 0;
  width: ${(props) => (props.$isOpen ? "280px" : "60px")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 40;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.2);
    border-radius: 2px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.4);
  }

  @media (min-width: 769px) {
    width: ${(props) => (props.$isOpen ? "280px" : "60px")};
    transform: translateX(0);
  }
`;

const SidebarToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 20px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 8px 25px rgba(249, 115, 22, 0.3);
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  z-index: 45;

  &:hover {
    transform: scale(1.1);
    animation: ${pulse} 0.6s ease-in-out;
    box-shadow: 0 12px 35px rgba(249, 115, 22, 0.4);
  }
`;

const SidebarNav = styled.nav`
  padding: 20px 0;
  animation: ${slideInSmooth} 0.4s ease-out;
`;

const SidebarList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SidebarItem = styled.li`
  margin-bottom: 8px;
  padding: 0 15px;
`;

const SidebarLink = styled.a`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(249, 115, 22, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover {
    background: linear-gradient(
      135deg,
      rgba(249, 115, 22, 0.15),
      rgba(249, 115, 22, 0.05)
    );
    color: white;
    transform: translateX(8px);

    &::before {
      left: 100%;
    }
  }

  &:hover .sidebar-icon {
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

const SidebarIcon = styled.i`
  width: 24px;
  margin-right: 15px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;

  &.sidebar-icon {
    transition: all 0.3s ease;
  }
`;

const SidebarText = styled.span<{ $isOpen: boolean }>`
  flex: 1;
  transition: all 0.3s ease;
  display: ${(props) => (props.$isOpen ? "block" : "none")};
  @media (min-width: 769px) {
    display: ${(props) => (props.$isOpen ? "block" : "none")};
  }
`;

const MainContent = styled.main<{ $sidebarOpen: boolean }>`
  flex: 1;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-left: ${({ $sidebarOpen }) => ($sidebarOpen ? "280px" : "60px")};
  min-height: calc(100vh - 70px);
  position: relative;

  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const ContentPadding = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 32px;

  @media (max-width: 768px) {
    padding: 16px 20px;
  }
`;

const Breadcrumb = styled.div`
  margin-bottom: 20px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  animation: ${fadeInUp} 0.6s ease-out;
`;

const BreadcrumbLink = styled.span`
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #f97316;
    transform: translateX(2px);
  }
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 800;
  background: linear-gradient(135deg, #f97316, #ea580c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  animation: ${fadeInUp} 0.6s ease-out 0.1s both;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out 0.2s both;
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, #f97316, #ea580c)"
      : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.8)")};
  box-shadow: ${(props) =>
    props.$active
      ? "0 6px 20px rgba(249, 115, 22, 0.3)"
      : "0 2px 10px rgba(0, 0, 0, 0.2)"};
  border: 1px solid
    ${(props) =>
      props.$active ? "rgba(249, 115, 22, 0.3)" : "rgba(255, 255, 255, 0.1)"};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${(props) =>
      props.$active
        ? "0 8px 25px rgba(249, 115, 22, 0.4)"
        : "0 4px 15px rgba(0, 0, 0, 0.3)"};
  }
`;

const StatCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.75rem;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeInUp} 0.6s ease-out;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
    border-color: rgba(249, 115, 22, 0.3);

    &::before {
      transform: scaleX(1);
    }
  }

  &:hover .stat-icon {
    animation: ${pulse} 0.6s ease-in-out;
  }
`;

const StatTitle = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.25rem;
`;

const StatChange = styled.div<{ $positive: boolean }>`
  font-size: 0.75rem;
  color: ${(props) => (props.$positive ? "#10b981" : "#ef4444")};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const StatIconWrapper = styled.div<{ $bgColor: string }>`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${(props) => props.$bgColor};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;

  &::before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 50%;
    background: linear-gradient(135deg, #f97316, #ea580c);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: scale(1.05);
    animation: ${pulse} 0.6s ease-in-out;

    &::before {
      opacity: 0.3;
    }
  }
`;

const RecentActivityCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  animation: ${fadeInUp} 0.6s ease-out 0.3s both;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const CardTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const ViewAllButton = styled.button`
  color: #f97316;
  text-decoration: none;
  font-size: 0.875rem;
  background: none;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(249, 115, 22, 0.1);
    transform: translateY(-2px);
  }
`;

const ActivityList = styled.div`
  space-y: 16px;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.875rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 0.75rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(249, 115, 22, 0.2);
    transform: translateX(4px);
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ActivityIconWrapper = styled.div<{ $bgColor: string }>`
  background: ${(props) => props.$bgColor};
  padding: 10px;
  border-radius: 12px;
  margin-right: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    animation: ${pulse} 0.6s ease-in-out;
  }

  i {
    color: inherit;
    font-size: 1.1rem;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ActivityTitle = styled.p`
  font-weight: 600;
  color: white;
  margin: 0;
`;

const ActivityTime = styled.span`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
`;

const ActivityDescription = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
`;

const TwoColumnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const TableCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 2rem;
`;

const StyledTable = styled.table`
  width: 100%;
  text-align: center;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 16px 0;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const TableRow = styled.tr`
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const TableCell = styled.td`
  padding: 20px 0;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
`;

const OrderIdCell = styled(TableCell)`
  font-weight: 600;
  color: white;
`;

const StatusSpan = styled.span<{ $status: string }>`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) => {
    switch (props.$status) {
      case "완료":
        return "rgba(16, 185, 129, 0.2)";
      case "처리중":
        return "rgba(59, 130, 246, 0.2)";
      case "배송중":
        return "rgba(245, 158, 11, 0.2)";
      case "취소":
        return "rgba(239, 68, 68, 0.2)";
      default:
        return "rgba(255, 255, 255, 0.1)";
    }
  }};
  color: ${(props) => {
    switch (props.$status) {
      case "완료":
        return "#10b981";
      case "처리중":
        return "#3b82f6";
      case "배송중":
        return "#f59e0b";
      case "취소":
        return "#ef4444";
      default:
        return "white";
    }
  }};
  border: 1px solid
    ${(props) => {
      switch (props.$status) {
        case "완료":
          return "rgba(16, 185, 129, 0.3)";
        case "처리중":
          return "rgba(59, 130, 246, 0.3)";
        case "배송중":
          return "rgba(245, 158, 11, 0.3)";
        case "취소":
          return "rgba(239, 68, 68, 0.3)";
        default:
          return "rgba(255, 255, 255, 0.2)";
      }
    }};
`;

const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
`;

const QuickActionCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-4px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
  }
`;

const QuickActionIconWrapper = styled.div<{ $bgColor: string }>`
  width: 50px;
  height: 50px;
  background: ${(props) => props.$bgColor};
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    animation: ${pulse} 0.6s ease-in-out;
  }

  i {
    color: inherit;
    font-size: 1.2rem;
  }
`;

const QuickActionTitle = styled.h3`
  font-weight: 600;
  color: white;
  font-size: 1rem;
`;

const StyledFooter = styled.footer`
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 120px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const FooterContent = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const CopyrightText = styled.p`
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  margin-bottom: 16px;
  @media (min-width: 768px) {
    margin-bottom: 0;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 24px;
`;

const FooterLink = styled.a`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: #f97316;
    transform: translateY(-2px);
  }
`;

const ToastNotification = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 90px;
  right: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  max-width: 300px;
  z-index: 50;
  transform: translateX(${(props) => (props.$show ? "0" : "100%")});
  transition: transform 0.3s;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;

const ToastIconWrapper = styled.div`
  flex-shrink: 0;
  padding-top: 2px;
  i {
    color: #10b981;
    font-size: 1.2rem;
  }
`;

const ToastContent = styled.div`
  margin-left: 12px;
  width: 0;
  flex: 1;
`;

const ToastTitle = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const ToastMessage = styled.p`
  margin-top: 4px;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
`;

const ToastCloseButton = styled.button`
  margin-left: 16px;
  flex-shrink: 0;
  display: flex;
  background: none;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// 리뷰 관리 관련 styled-components
const ReviewStatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const ReviewStatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  padding: 1.25rem;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(249, 115, 22, 0.3);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  }
`;

const ReviewStatIcon = styled.div<{ $bgColor: string; $textColor: string }>`
  background: ${(props) => props.$bgColor};
  color: ${(props) => props.$textColor};
  padding: 0.875rem;
  border-radius: 12px;
  margin-right: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    animation: ${pulse} 0.6s ease-in-out;
  }

  i {
    font-size: 1.25rem;
  }
`;

const ReviewStatContent = styled.div`
  flex: 1;
`;

const ReviewStatTitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
`;

const ReviewStatValue = styled.h3`
  font-size: 2rem;
  font-weight: 800;
  color: white;
`;

const FilterSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
`;

const FilterHeader = styled.div`
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const FilterTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
`;

const FilterContent = styled.div`
  padding: 1.75rem;
`;

// 빠른 액세스 관련 styled-components
const QuickAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const QuickAccessCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    border-color: rgba(249, 115, 22, 0.3);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  }
`;

const QuickAccessIcon = styled.div<{ $bgColor: string }>`
  background: ${(props) => props.$bgColor};
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.1);
    animation: ${pulse} 0.6s ease-in-out;
  }

  i {
    font-size: 1.5rem;
  }
`;

const QuickAccessTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
`;

const QuickAccessDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.875rem;
  line-height: 1.4;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.25rem;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.625rem 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  option {
    background: #1f2937;
    color: white;
  }
`;

const FilterInput = styled.input`
  padding: 0.625rem 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ReviewTableContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  overflow: hidden;
`;

const ReviewTableHeader = styled.div`
  padding: 1.25rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReviewTableTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
`;

const ReviewCount = styled.p`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const ReviewTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const ReviewTableHead = styled.thead`
  background: rgba(255, 255, 255, 0.03);
`;

const ReviewTableHeaderCell = styled.th`
  padding: 0.875rem 1.25rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ReviewTableBody = styled.tbody`
  background: transparent;
`;

const ReviewTableRow = styled.tr<{ $isHidden?: boolean }>`
  background: ${(props) =>
    props.$isHidden ? "rgba(255, 255, 255, 0.02)" : "transparent"};
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const ReviewTableCell = styled.td`
  padding: 1.25rem;
  vertical-align: top;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 50px;
  height: 50px;
  border-radius: 12px;
  object-fit: cover;
  margin-right: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.25rem;
`;

const ProductId = styled.div`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const RatingDisplay = styled.div`
  display: flex;
  align-items: center;
`;

const RatingValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  margin-right: 0.5rem;
`;

const StarContainer = styled.div`
  display: flex;
  gap: 2px;
`;

const Star = styled.i<{ $filled: boolean }>`
  color: ${(props) => (props.$filled ? "#fbbf24" : "rgba(255, 255, 255, 0.3)")};
  font-size: 0.875rem;
`;

const ReviewContent = styled.div`
  max-width: 300px;
`;

const ReviewText = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReviewImages = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
`;

const ImageIcon = styled.div`
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;

  i {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
  }
`;

const ImageCount = styled.span`
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.6);
`;

const StatusBadge = styled.span<{ $status: string }>`
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${(props) =>
    props.$status === "answered"
      ? "rgba(16, 185, 129, 0.2)"
      : "rgba(245, 158, 11, 0.2)"};
  color: ${(props) => (props.$status === "answered" ? "#10b981" : "#f59e0b")};
  border: 1px solid
    ${(props) =>
      props.$status === "answered"
        ? "rgba(16, 185, 129, 0.3)"
        : "rgba(245, 158, 11, 0.3)"};
`;

const HiddenBadge = styled.span`
  padding: 0.5rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  margin-left: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ $variant: "view" | "hide" | "delete" }>`
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.05);

  ${(props) => {
    switch (props.$variant) {
      case "view":
        return `
          color: #3b82f6;
          &:hover { 
            color: #1d4ed8; 
            background: rgba(59, 130, 246, 0.1);
            transform: scale(1.05);
          }
        `;
      case "hide":
        return `
          color: #f59e0b;
          &:hover { 
            color: #d97706; 
            background: rgba(245, 158, 11, 0.1);
            transform: scale(1.05);
          }
        `;
      case "delete":
        return `
          color: #ef4444;
          &:hover { 
            color: #dc2626; 
            background: rgba(239, 68, 68, 0.1);
            transform: scale(1.05);
          }
        `;
    }
  }}
`;

const PaginationContainer = styled.div`
  padding: 1.25rem 1.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PaginationInfo = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ItemsPerPageSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #f97316;
  }

  option {
    background: #1f2937;
    color: white;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const PaginationButton = styled.button<{
  $active?: boolean;
  $disabled?: boolean;
}>`
  padding: 0.5rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: ${(props) =>
    props.$active ? "#f97316" : "rgba(255, 255, 255, 0.05)"};
  color: ${(props) =>
    props.$active
      ? "white"
      : props.$disabled
      ? "rgba(255, 255, 255, 0.3)"
      : "rgba(255, 255, 255, 0.8)"};
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: ${(props) =>
      props.$active ? "#ea580c" : "rgba(255, 255, 255, 0.1)"};
    transform: translateY(-2px);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
`;

const ModalHeader = styled.div`
  padding: 1.75rem 1.75rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const ModalCloseButton = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const ModalBody = styled.div`
  padding: 1.75rem;
`;

const ModalFooter = styled.div`
  padding: 0 1.75rem 1.75rem;
  display: flex;
  gap: 0.875rem;
  justify-content: flex-end;
`;

const ModalButton = styled.button<{
  $variant: "primary" | "secondary" | "danger";
}>`
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  ${(props) => {
    switch (props.$variant) {
      case "primary":
        return `
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          border-color: #f97316;
          &:hover { 
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
          }
        `;
      case "secondary":
        return `
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.8);
          border-color: rgba(255, 255, 255, 0.2);
          &:hover { 
            background: rgba(255, 255, 255, 0.1);
            transform: translateY(-1px);
          }
        `;
      case "danger":
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          &:hover { 
            background: rgba(239, 68, 68, 0.2);
            transform: translateY(-1px);
          }
        `;
    }
  }}
`;

const ReviewDetailSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const ReviewDetailHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ReviewDetailInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ReviewDetailContent = styled.div`
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  white-space: pre-line;
`;

const ReviewDetailImages = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ReviewDetailImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
`;

const ReplyTextarea = styled.textarea`
  width: 100%;
  padding: 0.875rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  padding: 1.75rem;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
`;

const ChartWrapper = styled.div`
  height: 300px;
`;

const AdminDashboardPage: FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // 리뷰 관리 관련 상태
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'reviews', 'coupons'
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    rating: "all",
    dateRange: "all",
    keyword: "",
    status: "all",
  });

  // 쿠폰 관리 관련 상태
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponForm, setCouponForm] = useState({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minAmount: "",
    expiryDate: "",
    maxUses: "",
    isActive: true,
  });

  // 리뷰 데이터
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      productId: 101,
      productName: "프리미엄 무선 이어폰",
      productImage:
        "https://readdy.ai/api/search-image?query=premium%2520wireless%2520earbuds%2520with%2520charging%2520case%2520on%2520clean%2520white%2520background%2520professional%2520product%2520photography%2520with%2520soft%2520shadows%2520high%2520resolution%2520detailed%2520image%2520showing%2520sleek%2520modern%2520design&width=80&height=80&seq=101&orientation=squarish",
      customerName: "김민준",
      rating: 5,
      content:
        "음질이 정말 좋아요! 노이즈 캔슬링 기능도 뛰어나고 배터리 수명도 만족스럽습니다. 디자인도 세련되고 착용감도 편안해서 장시간 사용해도 불편함이 없어요.",
      date: "2025-06-25",
      status: "answered",
      images: [
        "https://readdy.ai/api/search-image?query=person%2520wearing%2520wireless%2520earbuds%2520lifestyle%2520photo%2520showing%2520earbuds%2520in%2520ear%2520clean%2520background%2520natural%2520lighting%2520casual%2520portrait%2520showing%2520comfort%2520and%2520fit%2520of%2520earbuds&width=120&height=120&seq=201&orientation=squarish",
      ],
      reply:
        "김민준 고객님, 저희 제품에 만족해주셔서 감사합니다. 앞으로도 좋은 제품으로 보답하겠습니다.",
    },
    {
      id: 2,
      productId: 102,
      productName: "스마트 워치 프로",
      productImage:
        "https://readdy.ai/api/search-image?query=smart%2520watch%2520with%2520fitness%2520tracking%2520features%2520on%2520clean%2520white%2520background%2520professional%2520product%2520photography%2520with%2520soft%2520shadows%2520high%2520resolution%2520detailed%2520image%2520showing%2520modern%2520sleek%2520design&width=80&height=80&seq=102&orientation=squarish",
      customerName: "이서연",
      rating: 4,
      content:
        "기능이 다양하고 배터리가 오래 가서 좋아요. 심박수 측정이나 수면 패턴 분석 기능이 정확한 것 같아요. 다만 앱 연동 시 가끔 끊김 현상이 있어서 별 하나 뺐습니다.",
      date: "2025-06-24",
      status: "unanswered",
    },
    {
      id: 3,
      productId: 103,
      productName: "초경량 노트북",
      productImage:
        "https://readdy.ai/api/search-image?query=ultra%2520thin%2520lightweight%2520laptop%2520computer%2520on%2520clean%2520white%2520background%2520professional%2520product%2520photography%2520with%2520soft%2520shadows%2520high%2520resolution%2520detailed%2520image%2520showing%2520sleek%2520modern%2520design&width=80&height=80&seq=103&orientation=squarish",
      customerName: "박지훈",
      rating: 2,
      content:
        "디자인은 좋은데 발열이 심하고 배터리가 너무 빨리 닳아요. 광고에서 본 것과 실제 성능 차이가 있어서 실망스럽습니다.",
      date: "2025-06-23",
      status: "answered",
      reply:
        "박지훈 고객님, 불편을 드려 죄송합니다. 발열 문제는 최신 펌웨어 업데이트로 개선될 수 있습니다.",
    },
    {
      id: 4,
      productId: 104,
      productName: "스마트 홈 스피커",
      productImage:
        "https://readdy.ai/api/search-image?query=smart%2520home%2520speaker%2520with%2520voice%2520assistant%2520on%2520clean%2520white%2520background%2520professional%2520product%2520photography%2520with%2520soft%2520shadows%2520high%2520resolution%2520detailed%2520image%2520showing%2520modern%2520design&width=80&height=80&seq=104&orientation=squarish",
      customerName: "최수아",
      rating: 5,
      content:
        "음질도 좋고 AI 비서 기능이 정말 편리해요! 집안 전체 IoT 기기와 연동이 잘 되어서 만족스럽습니다.",
      date: "2025-06-22",
      status: "unanswered",
      images: [
        "https://readdy.ai/api/search-image?query=smart%2520home%2520speaker%2520in%2520living%2520room%2520setting%2520lifestyle%2520photo%2520showing%2520speaker%2520on%2520coffee%2520table%2520modern%2520interior%2520design%2520natural%2520lighting&width=120&height=120&seq=204&orientation=squarish",
      ],
    },
    {
      id: 5,
      productId: 105,
      productName: "프리미엄 블루투스 헤드폰",
      productImage:
        "https://readdy.ai/api/search-image?query=premium%2520over%2520ear%2520bluetooth%2520headphones%2520on%2520clean%2520white%2520background%2520professional%2520product%2520photography%2520with%2520soft%2520shadows%2520high%2520resolution%2520detailed%2520image%2520showing%2520luxury%2520design&width=80&height=80&seq=105&orientation=squarish",
      customerName: "정현우",
      rating: 1,
      content:
        "배송 중 파손되어 왔고, 소리도 한쪽에서만 나와요. 교환 요청했는데 처리가 너무 느립니다.",
      date: "2025-06-21",
      status: "answered",
      reply:
        "정현우 고객님, 불편을 드려 대단히 죄송합니다. 즉시 교환 처리해드리겠습니다.",
    },
  ]);

  // 쿠폰 데이터
  const [coupons, setCoupons] = useState([
    {
      id: 1,
      name: "신규가입 15% 할인",
      description: "전 상품 적용 가능",
      discountType: "percentage",
      discountValue: 15,
      minAmount: 0,
      expiryDate: "2025-08-31",
      maxUses: 1000,
      usedCount: 245,
      isActive: true,
      createdAt: "2025-01-15",
    },
    {
      id: 2,
      name: "여름 시즌 10,000원 할인",
      description: "50,000원 이상 구매 시",
      discountType: "fixed",
      discountValue: 10000,
      minAmount: 50000,
      expiryDate: "2025-09-15",
      maxUses: 500,
      usedCount: 123,
      isActive: true,
      createdAt: "2025-06-01",
    },
    {
      id: 3,
      name: "VIP 무료배송",
      description: "배송비 무료",
      discountType: "shipping",
      discountValue: 0,
      minAmount: 30000,
      expiryDate: "2025-12-31",
      maxUses: 200,
      usedCount: 67,
      isActive: true,
      createdAt: "2025-03-10",
    },
  ]);

  // 차트 참조
  const ratingChartRef = useRef<HTMLDivElement>(null);

  // 리뷰 데이터 타입 정의
  interface Review {
    id: number;
    productId: number;
    productName: string;
    productImage: string;
    customerName: string;
    rating: number;
    content: string;
    date: string;
    status: "answered" | "unanswered";
    images?: string[];
    reply?: string;
    isHidden?: boolean;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Function to show toast for demonstration
  const handleShowToast = () => {
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleHomeClick = () => {
    navigate("/");
  };

  const handleProductsClick = () => {
    navigate("/products");
  };

  const handleChatClick = () => {
    navigate("/chatrooms");
  };

  // 리뷰 관리 관련 함수들
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters({
      ...filters,
      [filterType]: value,
    });
    setCurrentPage(1);
  };

  const openReviewModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText(review.reply || "");
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReview(null);
    setReplyText("");
  };

  const saveReply = () => {
    if (selectedReview) {
      const updatedReviews = reviews.map((review) =>
        review.id === selectedReview.id
          ? { ...review, reply: replyText, status: "answered" as "answered" }
          : review
      );
      setReviews(updatedReviews);
      closeReviewModal();
    }
  };

  const toggleHideReview = (reviewId: number) => {
    const updatedReviews = reviews.map((review) =>
      review.id === reviewId
        ? { ...review, isHidden: !review.isHidden }
        : review
    );
    setReviews(updatedReviews);
  };

  const deleteReview = (reviewId: number) => {
    if (window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
      const updatedReviews = reviews.filter((review) => review.id !== reviewId);
      setReviews(updatedReviews);
    }
  };

  // 필터링된 리뷰 목록
  const filteredReviews = reviews.filter((review) => {
    if (
      filters.rating !== "all" &&
      review.rating !== parseInt(filters.rating)
    ) {
      return false;
    }

    if (filters.status !== "all" && review.status !== filters.status) {
      return false;
    }

    if (
      filters.keyword &&
      !review.content.toLowerCase().includes(filters.keyword.toLowerCase()) &&
      !review.productName
        .toLowerCase()
        .includes(filters.keyword.toLowerCase()) &&
      !review.customerName.toLowerCase().includes(filters.keyword.toLowerCase())
    ) {
      return false;
    }

    if (filters.dateRange !== "all") {
      const reviewDate = new Date(review.date);
      const today = new Date();

      if (filters.dateRange === "today") {
        const isToday =
          reviewDate.getDate() === today.getDate() &&
          reviewDate.getMonth() === today.getMonth() &&
          reviewDate.getFullYear() === today.getFullYear();
        if (!isToday) return false;
      } else if (filters.dateRange === "week") {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(today.getDate() - 7);
        if (reviewDate < oneWeekAgo) return false;
      } else if (filters.dateRange === "month") {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        if (reviewDate < oneMonthAgo) return false;
      }
    }

    return true;
  });

  // 페이지네이션 계산
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReviews = filteredReviews.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // 리뷰 통계 데이터
  const reviewStats = {
    totalReviews: reviews.length,
    averageRating: (
      reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    ).toFixed(1),
    unansweredReviews: reviews.filter(
      (review) => review.status === "unanswered"
    ).length,
    reportedReviews: 2,
    ratingDistribution: {
      5: reviews.filter((review) => review.rating === 5).length,
      4: reviews.filter((review) => review.rating === 4).length,
      3: reviews.filter((review) => review.rating === 3).length,
      2: reviews.filter((review) => review.rating === 2).length,
      1: reviews.filter((review) => review.rating === 1).length,
    },
  };

  // 별점 차트 초기화
  useEffect(() => {
    if (ratingChartRef.current && activeTab === "reviews") {
      const chart = echarts.init(ratingChartRef.current);

      const option = {
        animation: false,
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: [
          {
            type: "category",
            data: ["1점", "2점", "3점", "4점", "5점"],
            axisTick: {
              alignWithLabel: true,
            },
          },
        ],
        yAxis: [
          {
            type: "value",
          },
        ],
        series: [
          {
            name: "리뷰 수",
            type: "bar",
            barWidth: "60%",
            data: [
              {
                value: reviewStats.ratingDistribution[1],
                itemStyle: { color: "#F87171" },
              },
              {
                value: reviewStats.ratingDistribution[2],
                itemStyle: { color: "#FBBF24" },
              },
              {
                value: reviewStats.ratingDistribution[3],
                itemStyle: { color: "#60A5FA" },
              },
              {
                value: reviewStats.ratingDistribution[4],
                itemStyle: { color: "#34D399" },
              },
              {
                value: reviewStats.ratingDistribution[5],
                itemStyle: { color: "#10B981" },
              },
            ],
          },
        ],
      };

      chart.setOption(option);

      const resizeChart = () => {
        chart.resize();
      };

      window.addEventListener("resize", resizeChart);

      return () => {
        chart.dispose();
        window.removeEventListener("resize", resizeChart);
      };
    }
  }, [reviewStats.ratingDistribution, activeTab]);

  // 쿠폰 관리 관련 함수들
  const handleCouponFormChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setCouponForm({
      ...couponForm,
      [field]: value,
    });
  };

  const createCoupon = () => {
    if (
      !couponForm.name ||
      !couponForm.discountValue ||
      !couponForm.expiryDate
    ) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    const newCoupon = {
      id: Date.now(),
      ...couponForm,
      discountValue: parseFloat(couponForm.discountValue),
      minAmount: parseFloat(couponForm.minAmount) || 0,
      maxUses: parseInt(couponForm.maxUses) || 1000,
      usedCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCoupons([...coupons, newCoupon]);
    setShowCouponModal(false);
    setCouponForm({
      name: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      minAmount: "",
      expiryDate: "",
      maxUses: "",
      isActive: true,
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleCouponStatus = (couponId: number) => {
    setCoupons(
      coupons.map((coupon) =>
        coupon.id === couponId
          ? { ...coupon, isActive: !coupon.isActive }
          : coupon
      )
    );
  };

  const deleteCoupon = (couponId: number) => {
    if (window.confirm("정말로 이 쿠폰을 삭제하시겠습니까?")) {
      setCoupons(coupons.filter((coupon) => coupon.id !== couponId));
    }
  };

  return (
    <Container>
      <Header>
        <LogoWrapper>
          <Logo onClick={handleHomeClick} style={{ cursor: "pointer" }}>
            FeedShop
          </Logo>
        </LogoWrapper>
        <Nav>
          <NavLink onClick={handleHomeClick} style={{ cursor: "pointer" }}>
            홈
          </NavLink>
          <NavLink onClick={handleProductsClick} style={{ cursor: "pointer" }}>
            상품
          </NavLink>
          <NavLink onClick={handleChatClick} style={{ cursor: "pointer" }}>
            채팅
          </NavLink>
          <NavLink href="#" style={{ cursor: "pointer" }}>
            고객지원
          </NavLink>
          <NavLink href="#" style={{ cursor: "pointer" }}>
            회사소개
          </NavLink>
        </Nav>
        <UserMenu>
          <IconButton onClick={handleShowToast}>
            <i className="fas fa-bell"></i>
          </IconButton>
          <IconButton onClick={() => navigate("/admin/settings")}>
            <i className="fas fa-cog"></i>
          </IconButton>
          {user && user.nickname ? (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {user.nickname}님
              </span>
              <LoginButton
                onClick={handleLogout}
                style={{
                  backgroundColor: "rgba(220, 53, 69, 0.8)",
                  borderColor: "rgba(220, 53, 69, 0.3)",
                  fontSize: "12px",
                  padding: "6px 12px",
                }}
              >
                로그아웃
              </LoginButton>
            </div>
          ) : (
            <LoginButton onClick={() => navigate("/login")}>로그인</LoginButton>
          )}
          <MobileMenuButton onClick={toggleMobileMenu}>
            <i className="fas fa-bars text-xl"></i>
          </MobileMenuButton>
        </UserMenu>
      </Header>

      <MobileMenuOverlay $isOpen={mobileMenuOpen}>
        <MobileMenuDrawer $isOpen={mobileMenuOpen}>
          <MobileMenuHeader>
            <MobileMenuTitle>메뉴</MobileMenuTitle>
            <IconButton onClick={toggleMobileMenu}>
              <i className="fas fa-times"></i>
            </IconButton>
          </MobileMenuHeader>
          <MobileMenuNav>
            <MobileMenuList>
              <MobileMenuListItem>
                <NavLink
                  onClick={() => {
                    handleHomeClick();
                    toggleMobileMenu();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  홈
                </NavLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <NavLink
                  onClick={() => {
                    handleProductsClick();
                    toggleMobileMenu();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  상품
                </NavLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <NavLink
                  onClick={() => {
                    handleChatClick();
                    toggleMobileMenu();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  채팅
                </NavLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <NavLink href="#" style={{ cursor: "pointer" }}>
                  고객지원
                </NavLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <NavLink href="#" style={{ cursor: "pointer" }}>
                  회사소개
                </NavLink>
              </MobileMenuListItem>
              <MobileMenuListItem>
                <NavLink
                  onClick={() => {
                    navigate("/admin/settings");
                    toggleMobileMenu();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  관리자 설정
                </NavLink>
              </MobileMenuListItem>
            </MobileMenuList>
            <MobileMenuLoginSection>
              {user && user.nickname ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <span
                    style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                    }}
                  >
                    {user.nickname}님
                  </span>
                  <LoginButton
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    style={{ width: "100%", backgroundColor: "#dc3545" }}
                  >
                    로그아웃
                  </LoginButton>
                </div>
              ) : (
                <LoginButton
                  onClick={() => {
                    navigate("/login");
                    toggleMobileMenu();
                  }}
                  style={{ width: "100%" }}
                >
                  로그인
                </LoginButton>
              )}
            </MobileMenuLoginSection>
          </MobileMenuNav>
        </MobileMenuDrawer>
      </MobileMenuOverlay>

      <FlexContainer>
        <Sidebar $isOpen={sidebarOpen}>
          <SidebarToggleButton onClick={toggleSidebar}>
            <i
              className={`fas ${
                sidebarOpen ? "fa-chevron-left" : "fa-chevron-right"
              }`}
            ></i>
          </SidebarToggleButton>
          <SidebarNav>
            <SidebarList>
              <SidebarItem>
                <SidebarLink onClick={() => setActiveTab("dashboard")}>
                  <SidebarIcon className="fas fa-home sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>대시보드</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => setActiveTab("reviews")}>
                  <SidebarIcon className="fas fa-star sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>리뷰 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => setActiveTab("coupons")}>
                  <SidebarIcon className="fas fa-ticket-alt sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>쿠폰 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/user-manage")}>
                  <SidebarIcon className="fas fa-user sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>사용자 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/report-manage")}>
                  <SidebarIcon className="fas fa-flag sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>신고 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/admin/feed-rewards")}>
                  <SidebarIcon className="fas fa-gift sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>피드 리워드</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/store")}>
                  <SidebarIcon className="fas fa-store sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>가게 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/products")}>
                  <SidebarIcon className="fas fa-chart-bar sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>상품 관리</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/admin/settings")}>
                  <SidebarIcon className="fas fa-cog sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>관리자 설정</SidebarText>
                </SidebarLink>
              </SidebarItem>
              <SidebarItem>
                <SidebarLink onClick={() => navigate("/stats-dashboard")}>
                  <SidebarIcon className="fas fa-chart-line sidebar-icon"></SidebarIcon>
                  <SidebarText $isOpen={sidebarOpen}>상세 통계</SidebarText>
                </SidebarLink>
              </SidebarItem>
            </SidebarList>
          </SidebarNav>
        </Sidebar>

        <MainContent $sidebarOpen={sidebarOpen}>
          <ContentPadding>
            <Breadcrumb>
              <BreadcrumbLink
                onClick={handleHomeClick}
                style={{ cursor: "pointer" }}
              >
                홈
              </BreadcrumbLink>{" "}
              <span className="mx-2">/</span>{" "}
              <BreadcrumbLink>
                {activeTab === "dashboard"
                  ? "대시보드"
                  : activeTab === "reviews"
                  ? "리뷰 관리"
                  : "쿠폰 관리"}
              </BreadcrumbLink>
            </Breadcrumb>

            <PageTitle>
              {activeTab === "dashboard"
                ? "대시보드"
                : activeTab === "reviews"
                ? "리뷰 관리"
                : "쿠폰 관리"}
            </PageTitle>

            {/* 탭 컨테이너 */}
            <TabContainer>
              <TabButton
                $active={activeTab === "dashboard"}
                onClick={() => setActiveTab("dashboard")}
              >
                대시보드
              </TabButton>
              <TabButton
                $active={activeTab === "reviews"}
                onClick={() => setActiveTab("reviews")}
              >
                리뷰 관리
              </TabButton>
              <TabButton
                $active={activeTab === "coupons"}
                onClick={() => setActiveTab("coupons")}
              >
                쿠폰 관리
              </TabButton>
            </TabContainer>

            {/* 대시보드 탭 내용 */}
            {activeTab === "dashboard" && (
              <>
                <StatCardsGrid>
                  <StatCard>
                    <div>
                      <StatTitle>총 사용자</StatTitle>
                      <StatValue>3,721</StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-arrow-up"></i>
                        12.5% 증가
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#e3f2fd">
                      <i
                        className="fas fa-users"
                        style={{ color: "#87ceeb" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>총 매출</StatTitle>
                      <StatValue>₩12,721,000</StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-arrow-up"></i>
                        8.2% 증가
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#e8f5e9">
                      <i
                        className="fas fa-won-sign"
                        style={{ color: "#28a745" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>신규 주문</StatTitle>
                      <StatValue>352</StatValue>
                      <StatChange $positive={false}>
                        <i className="fas fa-arrow-down"></i>
                        3.1% 감소
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#ede7f6">
                      <i
                        className="fas fa-shopping-cart"
                        style={{ color: "#673ab7" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>방문자</StatTitle>
                      <StatValue>8,492</StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-arrow-up"></i>
                        5.7% 증가
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#fff3e0">
                      <i
                        className="fas fa-eye"
                        style={{ color: "#ff9800" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>
                </StatCardsGrid>

                <QuickAccessGrid>
                  <QuickAccessCard onClick={() => navigate("/admin/settings")}>
                    <QuickAccessIcon $bgColor="#3b82f6">
                      <i className="fas fa-user-cog"></i>
                    </QuickAccessIcon>
                    <QuickAccessTitle>관리자 프로필</QuickAccessTitle>
                    <QuickAccessDescription>
                      개인 정보 및 보안 설정
                    </QuickAccessDescription>
                  </QuickAccessCard>

                  <QuickAccessCard onClick={() => navigate("/mfa-setup")}>
                    <QuickAccessIcon $bgColor="#ef4444">
                      <i className="fas fa-shield-alt"></i>
                    </QuickAccessIcon>
                    <QuickAccessTitle>2단계 인증</QuickAccessTitle>
                    <QuickAccessDescription>
                      계정 보안 강화
                    </QuickAccessDescription>
                  </QuickAccessCard>

                  <QuickAccessCard onClick={() => navigate("/user-manage")}>
                    <QuickAccessIcon $bgColor="#10b981">
                      <i className="fas fa-users"></i>
                    </QuickAccessIcon>
                    <QuickAccessTitle>사용자 관리</QuickAccessTitle>
                    <QuickAccessDescription>
                      사용자 권한 및 계정 관리
                    </QuickAccessDescription>
                  </QuickAccessCard>

                  <QuickAccessCard onClick={() => navigate("/report-manage")}>
                    <QuickAccessIcon $bgColor="#f59e0b">
                      <i className="fas fa-flag"></i>
                    </QuickAccessIcon>
                    <QuickAccessTitle>신고 관리</QuickAccessTitle>
                    <QuickAccessDescription>
                      신고 내용 검토 및 처리
                    </QuickAccessDescription>
                  </QuickAccessCard>
                </QuickAccessGrid>

                <RecentActivityCard>
                  <CardHeader>
                    <CardTitle>최근 활동</CardTitle>
                    <ViewAllButton>모두 보기</ViewAllButton>
                  </CardHeader>
                  <ActivityList>
                    {[1, 2, 3, 4, 5].map((item) => (
                      <ActivityItem key={item}>
                        <ActivityIconWrapper $bgColor="rgba(135,206,235,0.2)">
                          <i
                            className="fas fa-user-circle"
                            style={{ color: "#87ceeb" }}
                          ></i>
                        </ActivityIconWrapper>
                        <ActivityContent>
                          <ActivityRow>
                            <ActivityTitle>새로운 사용자 가입</ActivityTitle>
                            <ActivityTime>2시간 전</ActivityTime>
                          </ActivityRow>
                          <ActivityDescription>
                            김민수님이 새로 가입했습니다.
                          </ActivityDescription>
                        </ActivityContent>
                      </ActivityItem>
                    ))}
                  </ActivityList>
                </RecentActivityCard>
              </>
            )}

            {/* 리뷰 관리 탭 내용 */}
            {activeTab === "reviews" && (
              <>
                {/* 리뷰 통계 */}
                <ReviewStatsGrid>
                  <ReviewStatCard>
                    <ReviewStatIcon $bgColor="#dbeafe" $textColor="#3b82f6">
                      <i className="fas fa-star"></i>
                    </ReviewStatIcon>
                    <ReviewStatContent>
                      <ReviewStatTitle>평균 별점</ReviewStatTitle>
                      <ReviewStatValue>
                        {reviewStats.averageRating}
                      </ReviewStatValue>
                    </ReviewStatContent>
                  </ReviewStatCard>

                  <ReviewStatCard>
                    <ReviewStatIcon $bgColor="#dcfce7" $textColor="#16a34a">
                      <i className="fas fa-comments"></i>
                    </ReviewStatIcon>
                    <ReviewStatContent>
                      <ReviewStatTitle>전체 리뷰</ReviewStatTitle>
                      <ReviewStatValue>
                        {reviewStats.totalReviews}
                      </ReviewStatValue>
                    </ReviewStatContent>
                  </ReviewStatCard>

                  <ReviewStatCard>
                    <ReviewStatIcon $bgColor="#fef3c7" $textColor="#d97706">
                      <i className="fas fa-clock"></i>
                    </ReviewStatIcon>
                    <ReviewStatContent>
                      <ReviewStatTitle>미답변 리뷰</ReviewStatTitle>
                      <ReviewStatValue>
                        {reviewStats.unansweredReviews}
                      </ReviewStatValue>
                    </ReviewStatContent>
                  </ReviewStatCard>

                  <ReviewStatCard>
                    <ReviewStatIcon $bgColor="#fee2e2" $textColor="#dc2626">
                      <i className="fas fa-flag"></i>
                    </ReviewStatIcon>
                    <ReviewStatContent>
                      <ReviewStatTitle>신고된 리뷰</ReviewStatTitle>
                      <ReviewStatValue>
                        {reviewStats.reportedReviews}
                      </ReviewStatValue>
                    </ReviewStatContent>
                  </ReviewStatCard>
                </ReviewStatsGrid>

                {/* 별점 분포 차트 */}
                <ChartContainer>
                  <ChartTitle>별점 분포</ChartTitle>
                  <ChartWrapper ref={ratingChartRef}></ChartWrapper>
                </ChartContainer>

                {/* 리뷰 필터 */}
                <FilterSection>
                  <FilterHeader>
                    <FilterTitle>리뷰 필터</FilterTitle>
                  </FilterHeader>
                  <FilterContent>
                    <FilterGrid>
                      <FilterGroup>
                        <FilterLabel>별점</FilterLabel>
                        <FilterSelect
                          value={filters.rating}
                          onChange={(e) =>
                            handleFilterChange("rating", e.target.value)
                          }
                        >
                          <option value="all">전체 별점</option>
                          <option value="5">5점</option>
                          <option value="4">4점</option>
                          <option value="3">3점</option>
                          <option value="2">2점</option>
                          <option value="1">1점</option>
                        </FilterSelect>
                      </FilterGroup>

                      <FilterGroup>
                        <FilterLabel>날짜 범위</FilterLabel>
                        <FilterSelect
                          value={filters.dateRange}
                          onChange={(e) =>
                            handleFilterChange("dateRange", e.target.value)
                          }
                        >
                          <option value="all">전체 기간</option>
                          <option value="today">오늘</option>
                          <option value="week">최근 7일</option>
                          <option value="month">최근 30일</option>
                        </FilterSelect>
                      </FilterGroup>

                      <FilterGroup>
                        <FilterLabel>답변 상태</FilterLabel>
                        <FilterSelect
                          value={filters.status}
                          onChange={(e) =>
                            handleFilterChange("status", e.target.value)
                          }
                        >
                          <option value="all">전체 상태</option>
                          <option value="answered">답변 완료</option>
                          <option value="unanswered">미답변</option>
                        </FilterSelect>
                      </FilterGroup>
                    </FilterGrid>

                    <FilterGroup>
                      <FilterLabel>키워드 검색</FilterLabel>
                      <FilterInput
                        type="text"
                        value={filters.keyword}
                        onChange={(e) =>
                          handleFilterChange("keyword", e.target.value)
                        }
                        placeholder="상품명, 리뷰 내용, 작성자 검색"
                      />
                    </FilterGroup>
                  </FilterContent>
                </FilterSection>

                {/* 리뷰 테이블 */}
                <ReviewTableContainer>
                  <ReviewTableHeader>
                    <ReviewTableTitle>리뷰 목록</ReviewTableTitle>
                    <ReviewCount>
                      총 {filteredReviews.length}개의 리뷰
                    </ReviewCount>
                  </ReviewTableHeader>

                  <div style={{ overflowX: "auto" }}>
                    <ReviewTable>
                      <ReviewTableHead>
                        <tr>
                          <ReviewTableHeaderCell>
                            상품 정보
                          </ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>별점</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>
                            리뷰 내용
                          </ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>작성자</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>작성일</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>상태</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell style={{ textAlign: "right" }}>
                            관리
                          </ReviewTableHeaderCell>
                        </tr>
                      </ReviewTableHead>
                      <ReviewTableBody>
                        {currentReviews.length > 0 ? (
                          currentReviews.map((review) => (
                            <ReviewTableRow
                              key={review.id}
                              $isHidden={review.isHidden}
                            >
                              <ReviewTableCell>
                                <ProductInfo>
                                  <ProductImage
                                    src={review.productImage}
                                    alt={review.productName}
                                  />
                                  <ProductDetails>
                                    <ProductName>
                                      {review.productName}
                                    </ProductName>
                                    <ProductId>
                                      상품 ID: {review.productId}
                                    </ProductId>
                                  </ProductDetails>
                                </ProductInfo>
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <RatingDisplay>
                                  <RatingValue>{review.rating}</RatingValue>
                                  <StarContainer>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className="fas fa-star"
                                        $filled={review.rating >= star}
                                      />
                                    ))}
                                  </StarContainer>
                                </RatingDisplay>
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <ReviewContent>
                                  <ReviewText>{review.content}</ReviewText>
                                  {review.images &&
                                    review.images.length > 0 && (
                                      <ReviewImages>
                                        <ImageIcon>
                                          <i className="fas fa-image"></i>
                                        </ImageIcon>
                                        <ImageCount>
                                          {review.images.length}개의 이미지
                                        </ImageCount>
                                      </ReviewImages>
                                    )}
                                </ReviewContent>
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <div
                                  style={{ fontWeight: 500, color: "#111827" }}
                                >
                                  {review.customerName}
                                </div>
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <div style={{ color: "#6b7280" }}>
                                  {review.date}
                                </div>
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <StatusBadge $status={review.status}>
                                  {review.status === "answered"
                                    ? "답변 완료"
                                    : "미답변"}
                                </StatusBadge>
                                {review.isHidden && (
                                  <HiddenBadge>숨김</HiddenBadge>
                                )}
                              </ReviewTableCell>
                              <ReviewTableCell>
                                <ActionButtons>
                                  <ActionButton
                                    $variant="view"
                                    onClick={() => openReviewModal(review)}
                                    title="상세 보기"
                                  >
                                    <i className="fas fa-eye"></i>
                                  </ActionButton>
                                  <ActionButton
                                    $variant="hide"
                                    onClick={() => toggleHideReview(review.id)}
                                    title={
                                      review.isHidden ? "표시하기" : "숨기기"
                                    }
                                  >
                                    <i
                                      className={`fas ${
                                        review.isHidden
                                          ? "fa-eye"
                                          : "fa-eye-slash"
                                      }`}
                                    ></i>
                                  </ActionButton>
                                  <ActionButton
                                    $variant="delete"
                                    onClick={() => deleteReview(review.id)}
                                    title="삭제"
                                  >
                                    <i className="fas fa-trash-alt"></i>
                                  </ActionButton>
                                </ActionButtons>
                              </ReviewTableCell>
                            </ReviewTableRow>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              style={{
                                padding: "40px 16px",
                                textAlign: "center",
                                color: "#6b7280",
                              }}
                            >
                              <i
                                className="fas fa-search"
                                style={{
                                  fontSize: "2rem",
                                  marginBottom: "12px",
                                  display: "block",
                                }}
                              ></i>
                              검색 결과가 없습니다.
                            </td>
                          </tr>
                        )}
                      </ReviewTableBody>
                    </ReviewTable>
                  </div>

                  {/* 페이지네이션 */}
                  {filteredReviews.length > 0 && (
                    <PaginationContainer>
                      <PaginationInfo>
                        전체 <strong>{filteredReviews.length}</strong>개 중{" "}
                        <strong>{indexOfFirstItem + 1}</strong>-
                        <strong>
                          {indexOfLastItem > filteredReviews.length
                            ? filteredReviews.length
                            : indexOfLastItem}
                        </strong>
                        번
                      </PaginationInfo>
                      <PaginationControls>
                        <ItemsPerPageSelect
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                        >
                          <option value={5}>5개씩 보기</option>
                          <option value={10}>10개씩 보기</option>
                          <option value={20}>20개씩 보기</option>
                        </ItemsPerPageSelect>
                        <PaginationButtons>
                          <PaginationButton
                            onClick={() =>
                              paginate(currentPage > 1 ? currentPage - 1 : 1)
                            }
                            disabled={currentPage === 1}
                            $disabled={currentPage === 1}
                          >
                            <i className="fas fa-chevron-left"></i>
                          </PaginationButton>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((number) => (
                            <PaginationButton
                              key={number}
                              onClick={() => paginate(number)}
                              $active={currentPage === number}
                            >
                              {number}
                            </PaginationButton>
                          ))}

                          <PaginationButton
                            onClick={() =>
                              paginate(
                                currentPage < totalPages
                                  ? currentPage + 1
                                  : totalPages
                              )
                            }
                            disabled={currentPage === totalPages}
                            $disabled={currentPage === totalPages}
                          >
                            <i className="fas fa-chevron-right"></i>
                          </PaginationButton>
                        </PaginationButtons>
                      </PaginationControls>
                    </PaginationContainer>
                  )}
                </ReviewTableContainer>
              </>
            )}

            {/* 쿠폰 관리 탭 내용 */}
            {activeTab === "coupons" && (
              <>
                {/* 쿠폰 통계 */}
                <StatCardsGrid>
                  <StatCard>
                    <div>
                      <StatTitle>총 쿠폰 수</StatTitle>
                      <StatValue>{coupons.length}</StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-arrow-up"></i>
                        활성 쿠폰
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#e3f2fd">
                      <i
                        className="fas fa-ticket-alt"
                        style={{ color: "#87ceeb" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>총 사용 횟수</StatTitle>
                      <StatValue>
                        {coupons.reduce(
                          (sum, coupon) => sum + coupon.usedCount,
                          0
                        )}
                      </StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-arrow-up"></i>
                        이번 달
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#e8f5e9">
                      <i
                        className="fas fa-chart-line"
                        style={{ color: "#28a745" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>활성 쿠폰</StatTitle>
                      <StatValue>
                        {coupons.filter((c) => c.isActive).length}
                      </StatValue>
                      <StatChange $positive={true}>
                        <i className="fas fa-check"></i>
                        사용 가능
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#ede7f6">
                      <i
                        className="fas fa-check-circle"
                        style={{ color: "#673ab7" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>

                  <StatCard>
                    <div>
                      <StatTitle>만료 예정</StatTitle>
                      <StatValue>
                        {
                          coupons.filter((c) => {
                            const expiry = new Date(c.expiryDate);
                            const today = new Date();
                            const diffDays = Math.ceil(
                              (expiry.getTime() - today.getTime()) /
                                (1000 * 60 * 60 * 24)
                            );
                            return diffDays <= 30 && diffDays > 0;
                          }).length
                        }
                      </StatValue>
                      <StatChange $positive={false}>
                        <i className="fas fa-exclamation-triangle"></i>
                        30일 이내
                      </StatChange>
                    </div>
                    <StatIconWrapper $bgColor="#fff3e0">
                      <i
                        className="fas fa-clock"
                        style={{ color: "#ff9800" }}
                      ></i>
                    </StatIconWrapper>
                  </StatCard>
                </StatCardsGrid>

                {/* 쿠폰 생성 버튼 */}
                <div
                  style={{
                    marginBottom: "1.5rem",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setShowCouponModal(true)}
                    style={{
                      background: "linear-gradient(135deg, #f97316, #ea580c)",
                      color: "white",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      fontSize: "0.875rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: "0 6px 20px rgba(249, 115, 22, 0.3)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(249, 115, 22, 0.4)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(249, 115, 22, 0.3)";
                    }}
                  >
                    <i
                      className="fas fa-plus"
                      style={{ marginRight: "8px" }}
                    ></i>
                    새 쿠폰 생성
                  </button>
                </div>

                {/* 쿠폰 목록 */}
                <ReviewTableContainer>
                  <ReviewTableHeader>
                    <ReviewTableTitle>쿠폰 목록</ReviewTableTitle>
                    <ReviewCount>총 {coupons.length}개의 쿠폰</ReviewCount>
                  </ReviewTableHeader>

                  <div style={{ overflowX: "auto" }}>
                    <ReviewTable>
                      <ReviewTableHead>
                        <tr>
                          <ReviewTableHeaderCell>쿠폰명</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>
                            할인 정보
                          </ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>
                            사용 조건
                          </ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>만료일</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>
                            사용 현황
                          </ReviewTableHeaderCell>
                          <ReviewTableHeaderCell>상태</ReviewTableHeaderCell>
                          <ReviewTableHeaderCell style={{ textAlign: "right" }}>
                            관리
                          </ReviewTableHeaderCell>
                        </tr>
                      </ReviewTableHead>
                      <ReviewTableBody>
                        {coupons.map((coupon) => (
                          <ReviewTableRow key={coupon.id}>
                            <ReviewTableCell>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 600,
                                    color: "white",
                                    marginBottom: "4px",
                                  }}
                                >
                                  {coupon.name}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.875rem",
                                    color: "rgba(255, 255, 255, 0.7)",
                                  }}
                                >
                                  {coupon.description}
                                </div>
                              </div>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <div
                                style={{ fontWeight: 600, color: "#f97316" }}
                              >
                                {coupon.discountType === "percentage" &&
                                  `${coupon.discountValue}%`}
                                {coupon.discountType === "fixed" &&
                                  `${coupon.discountValue.toLocaleString()}원`}
                                {coupon.discountType === "shipping" &&
                                  "무료배송"}
                              </div>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "rgba(255, 255, 255, 0.8)",
                                }}
                              >
                                {coupon.minAmount > 0
                                  ? `${coupon.minAmount.toLocaleString()}원 이상`
                                  : "조건 없음"}
                              </div>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <div
                                style={{ color: "rgba(255, 255, 255, 0.8)" }}
                              >
                                {coupon.expiryDate}
                              </div>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <div
                                style={{
                                  fontSize: "0.875rem",
                                  color: "rgba(255, 255, 255, 0.8)",
                                }}
                              >
                                {coupon.usedCount} / {coupon.maxUses}
                              </div>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <StatusBadge
                                $status={
                                  coupon.isActive ? "answered" : "unanswered"
                                }
                              >
                                {coupon.isActive ? "활성" : "비활성"}
                              </StatusBadge>
                            </ReviewTableCell>
                            <ReviewTableCell>
                              <ActionButtons>
                                <ActionButton
                                  $variant="view"
                                  onClick={() => toggleCouponStatus(coupon.id)}
                                  title={
                                    coupon.isActive ? "비활성화" : "활성화"
                                  }
                                >
                                  <i
                                    className={`fas ${
                                      coupon.isActive ? "fa-pause" : "fa-play"
                                    }`}
                                  ></i>
                                </ActionButton>
                                <ActionButton
                                  $variant="delete"
                                  onClick={() => deleteCoupon(coupon.id)}
                                  title="삭제"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </ActionButton>
                              </ActionButtons>
                            </ReviewTableCell>
                          </ReviewTableRow>
                        ))}
                      </ReviewTableBody>
                    </ReviewTable>
                  </div>
                </ReviewTableContainer>
              </>
            )}
          </ContentPadding>
        </MainContent>
      </FlexContainer>

      {/* 쿠폰 생성 모달 */}
      {showCouponModal && (
        <ModalOverlay onClick={() => setShowCouponModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>새 쿠폰 생성</ModalTitle>
              <ModalCloseButton onClick={() => setShowCouponModal(false)}>
                <i className="fas fa-times"></i>
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  >
                    쿠폰명 *
                  </label>
                  <FilterInput
                    type="text"
                    value={couponForm.name}
                    onChange={(e) =>
                      handleCouponFormChange("name", e.target.value)
                    }
                    placeholder="쿠폰명을 입력하세요"
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  >
                    설명
                  </label>
                  <FilterInput
                    type="text"
                    value={couponForm.description}
                    onChange={(e) =>
                      handleCouponFormChange("description", e.target.value)
                    }
                    placeholder="쿠폰 설명을 입력하세요"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "white",
                        fontSize: "0.875rem",
                      }}
                    >
                      할인 유형
                    </label>
                    <FilterSelect
                      value={couponForm.discountType}
                      onChange={(e) =>
                        handleCouponFormChange("discountType", e.target.value)
                      }
                    >
                      <option value="percentage">퍼센트 할인</option>
                      <option value="fixed">정액 할인</option>
                      <option value="shipping">무료배송</option>
                    </FilterSelect>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "white",
                        fontSize: "0.875rem",
                      }}
                    >
                      할인 값 *
                    </label>
                    <FilterInput
                      type="number"
                      value={couponForm.discountValue}
                      onChange={(e) =>
                        handleCouponFormChange("discountValue", e.target.value)
                      }
                      placeholder={
                        couponForm.discountType === "percentage"
                          ? "15"
                          : "10000"
                      }
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "white",
                        fontSize: "0.875rem",
                      }}
                    >
                      최소 구매 금액
                    </label>
                    <FilterInput
                      type="number"
                      value={couponForm.minAmount}
                      onChange={(e) =>
                        handleCouponFormChange("minAmount", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        color: "white",
                        fontSize: "0.875rem",
                      }}
                    >
                      최대 사용 횟수
                    </label>
                    <FilterInput
                      type="number"
                      value={couponForm.maxUses}
                      onChange={(e) =>
                        handleCouponFormChange("maxUses", e.target.value)
                      }
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      color: "white",
                      fontSize: "0.875rem",
                    }}
                  >
                    만료일 *
                  </label>
                  <FilterInput
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) =>
                      handleCouponFormChange("expiryDate", e.target.value)
                    }
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={couponForm.isActive}
                    onChange={(e) =>
                      handleCouponFormChange("isActive", e.target.checked)
                    }
                    style={{ width: "16px", height: "16px" }}
                  />
                  <label
                    htmlFor="isActive"
                    style={{ color: "white", fontSize: "0.875rem" }}
                  >
                    즉시 활성화
                  </label>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <ModalButton
                $variant="secondary"
                onClick={() => setShowCouponModal(false)}
              >
                취소
              </ModalButton>
              <ModalButton $variant="primary" onClick={createCoupon}>
                쿠폰 생성
              </ModalButton>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      <ToastNotification $show={showToast}>
        <ToastIconWrapper>
          <i className="fas fa-check-circle"></i>
        </ToastIconWrapper>
        <ToastContent>
          <ToastTitle>성공적으로 저장되었습니다</ToastTitle>
          <ToastMessage>변경사항이 적용되었습니다.</ToastMessage>
        </ToastContent>
        <ToastCloseButton onClick={() => setShowToast(false)}>
          <i className="fas fa-times"></i>
        </ToastCloseButton>
      </ToastNotification>
    </Container>
  );
};

export default AdminDashboardPage;
