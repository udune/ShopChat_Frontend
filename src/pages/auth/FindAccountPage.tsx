import { useState } from "react";
import axios from "axios";
import {
  AuthCard,
  AuthForm,
  AuthFormGroup,
  AuthLabel,
  AuthInput,
  AuthButton,
  AuthLink,
  SuccessMessage,
  ErrorMessage,
} from "../../components/auth/AuthCard";

// UserResponse 객체의 타입을 정의합니다.
// 이 타입은 백엔드 API에서 반환하는 데이터 구조와 일치해야 합니다.
interface UserResponse {
  userId: number;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  message?: string;
}

// 새로운 컴포넌트를 위한 Styled-Component (AuthCard.js에 추가되어 있다고 가정)
// const AccountList = styled.ul`...`
// const AccountItem = styled.li`...`

// 백엔드 API 변경에 따라 프론트엔드 코드를 수정합니다.
export default function FindAccountPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  // 찾은 계정 목록을 저장할 새로운 상태를 UserResponse[] 타입으로 추가합니다.
  const [foundAccounts, setFoundAccounts] = useState<UserResponse[]>([]);

  // 휴대폰 번호 포맷팅 함수 (변경 없음)
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^\d]/g, "");
    if (numbers.length > 11) {
      return phone;
    }
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(
        7
      )}`;
    }
  };

  // 휴대폰 번호 유효성 검사 (변경 없음)
  const validatePhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^010-\d{4}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
  };

  // 이름 유효성 검사 (변경 없음)
  const validateName = (name: string) => {
    const nameRegex = /^[가-힣]{2,10}$/;
    return nameRegex.test(name);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setPhone(formattedPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setFoundAccounts([]); // 검색 시마다 목록 초기화

    if (!validateName(name)) {
      setIsSuccess(false);
      setMessage("이름은 2-10자의 한글만 입력 가능합니다.");
      setLoading(false);
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setIsSuccess(false);
      setMessage("휴대폰 번호는 010-XXXX-XXXX 형식으로 입력해주세요.");
      setLoading(false);
      return;
    }

    try {
      const baseURL = process.env.REACT_APP_API_URL || "https://localhost:8443";
      const response = await axios.get(`${baseURL}/api/auth/find-account`, {
        params: {
          username: name,
          phoneNumber: phone,
        },
      });

      // API 응답 데이터가 배열임을 가정하고 처리
      const apiResponse = response.data;
      const accountsList = apiResponse.data as UserResponse[]; // 타입 단언 추가

      if (accountsList && accountsList.length > 0) {
        setIsSuccess(true);
        setFoundAccounts(accountsList); // 찾은 계정 목록을 상태에 저장

        // 메시지는 계정 수에 따라 다르게 설정
        if (accountsList.length === 1) {
            setMessage(`입력하신 정보로 가입된 이메일 주소는 '${accountsList[0].email}' 입니다.`);
        } else {
            setMessage(`입력하신 정보로 여러 개의 계정이 발견되었습니다.`);
        }
      } else {
          // 백엔드에서 예외를 던지지 않고 빈 배열을 반환할 경우를 대비
          setIsSuccess(false);
          setMessage("입력하신 정보와 일치하는 계정을 찾을 수 없습니다.");
      }
    } catch (error: any) {
      setIsSuccess(false);
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          "입력하신 정보와 일치하는 계정을 찾을 수 없습니다.";
        setMessage(errorMessage);
      } else if (error.request) {
        setMessage("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        setMessage("요청 처리 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="계정 찾기" subtitle="가입 시 입력한 정보를 입력해주세요">
      <AuthForm onSubmit={handleSubmit}>
        {/* 메시지 렌더링 로직은 그대로 유지 */}
        {message && (
          isSuccess ? (
            <SuccessMessage>{message}</SuccessMessage>
          ) : (
            <ErrorMessage>{message}</ErrorMessage>
          )
        )}
        
        {/* 여러 계정이 발견되었을 경우 목록을 렌더링 */}
        {isSuccess && foundAccounts.length > 1 && (
            <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">다음 중 본인의 계정을 선택하세요:</p>
                <ul className="mt-2 space-y-2">
                    {foundAccounts.map((account) => (
                        <li key={account.userId} className="bg-gray-100 p-3 rounded-lg text-sm text-gray-800">
                            <strong>이메일:</strong> {account.email}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {/* 폼 입력 필드와 버튼 */}
        <AuthFormGroup>
          <AuthLabel htmlFor="name">이름</AuthLabel>
          <AuthInput
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="실명을 입력해주세요"
            required
          />
        </AuthFormGroup>

        <AuthFormGroup>
          <AuthLabel htmlFor="phone">휴대폰 번호</AuthLabel>
          <AuthInput
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="010-1234-5678"
            maxLength={13}
            required
          />
        </AuthFormGroup>

        <AuthButton type="submit" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              찾는 중...
            </>
          ) : (
            <>
              <i className="fas fa-search"></i>
              계정 찾기
            </>
          )}
        </AuthButton>
      </AuthForm>

      <AuthLink to="/login">
        <i className="fas fa-arrow-left"></i>
        로그인으로 돌아가기
      </AuthLink>
    </AuthCard>
  );
}
