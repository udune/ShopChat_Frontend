import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  FC,
  useMemo,
  useCallback,
} from "react";
import FeedService from "../api/feedService";
import { UserProfileService } from "../api/userProfileService";

interface User {
  nickname: string;
  name: string;
  email: string;
  userType: "user" | "admin" | "seller";
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (
    nickname: string,
    name: string,
    email: string,
    userType: "user" | "admin" | "seller",
    token: string
  ) => void;
  logout: () => void;
  updateUserType: (userType: "seller" | "admin" | "user") => void;
  handleUnauthorized: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedNickname = localStorage.getItem("nickname");
      const storedName = localStorage.getItem("name");
      const storedEmail = localStorage.getItem("email");
      const storedToken = localStorage.getItem("token");
      const storedUserType = localStorage.getItem("userType");

      // 모든 필수 정보가 있으면 토큰 유효성 검증
      if (storedToken && storedNickname && storedUserType) {
        try {
          // 토큰 유효성 검증을 위해 프로필 정보 요청
          // 만약 토큰이 유효하지 않으면 401 에러가 발생하고 axios 인터셉터가 처리
          await UserProfileService.getUserProfile();

          // 토큰이 유효하면 사용자 정보 설정
          setUser({
            nickname: storedNickname,
            name: storedName || storedNickname, // name이 없으면 nickname 사용
            email: storedEmail || `${storedNickname}@example.com`, // email이 없으면 임시 이메일 생성
            userType: storedUserType as "admin" | "seller" | "user",
            token: storedToken,
          });

          // 좋아요한 피드 목록 조회 (선택사항)
          try {
            await FeedService.getMyLikedFeeds(0, 20);
            // 좋아요 목록은 각 컴포넌트에서 백엔드 응답의 isLiked 필드를 사용하므로
            // 여기서는 별도로 저장하지 않음
          } catch (error) {
            console.error("초기화 시 좋아요한 피드 목록 조회 실패:", error);
          }
        } catch (error: any) {
          console.error("토큰 유효성 검증 실패:", error);
          // 토큰이 유효하지 않거나 네트워크 오류 시 로그아웃 처리
          // (axios 인터셉터가 이미 localStorage를 정리했을 수 있음)
          localStorage.removeItem("nickname");
          localStorage.removeItem("name");
          localStorage.removeItem("email");
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          localStorage.removeItem("likedPosts");
          setUser(null);
        }
      } else {
        // 필수 정보가 없으면 로그인 상태가 아니므로 localStorage 정리
        localStorage.removeItem("nickname");
        localStorage.removeItem("name");
        localStorage.removeItem("email");
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("likedPosts");
        setUser(null);
      }
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    (
      nickname: string,
      name: string,
      email: string,
      userType: "admin" | "seller" | "user",
      token: string
    ) => {
      const userTypeLower = userType.toLowerCase() as
        | "admin"
        | "seller"
        | "user";
      const userData = {
        nickname,
        name,
        email,
        userType: userTypeLower,
        token,
      };
      setUser(userData);
      localStorage.setItem("nickname", nickname);
      localStorage.setItem("name", name);
      localStorage.setItem("email", email);
      localStorage.setItem("userType", userTypeLower);
      localStorage.setItem("token", token);

      // 로그인 후 사용자가 좋아요한 피드 목록을 가져오기 (백엔드에서 isLiked 필드 사용)
      FeedService.getMyLikedFeeds(0, 20)
        .then(() => {
          // 좋아요 목록은 각 컴포넌트에서 백엔드 응답의 isLiked 필드를 사용하므로
          // 여기서는 별도로 저장하지 않음
        })
        .catch((error) => {
          console.error("좋아요한 피드 목록 조회 실패:", error);
        });
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("nickname");
    localStorage.removeItem("name"); // name도 제거
    localStorage.removeItem("email"); // email도 제거
    localStorage.removeItem("token");
    localStorage.removeItem("userType");
    // 로그아웃 시 좋아요 상태는 백엔드에서 관리하므로 별도 정리 불필요
  }, []);

  // 401 에러 시 자동 로그아웃 처리
  const handleUnauthorized = useCallback(() => {
    console.log("401 에러 감지: 자동 로그아웃 처리");
    logout();
    // 로그인 페이지로 리다이렉트
    window.location.href = "/login";
  }, [logout]);

  const updateUserType = useCallback(
    (userType: "admin" | "seller" | "user") => {
      if (user) {
        const updatedUser = { ...user, userType };
        setUser(updatedUser);
        localStorage.setItem("userType", userType);
      }
    },
    [user]
  );

  const contextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      updateUserType,
      handleUnauthorized,
    }),
    [user, login, logout, updateUserType, handleUnauthorized]
  );

  // 초기화가 완료될 때까지 로딩 표시
  if (!isInitialized) {
    return <div>로딩중...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
