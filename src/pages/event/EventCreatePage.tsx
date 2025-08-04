import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from "../../api/axios";
import { EventType } from "../../types/types";

// Add global styles for animation
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInOut {
0% { opacity: 0; transform: translateY(-10px); }
10% { opacity: 1; transform: translateY(0); }
90% { opacity: 1; transform: translateY(0); }
100% { opacity: 0; transform: translateY(-10px); }
}
.animate-fade-in-out {
animation: fadeInOut 3s ease-in-out forwards;
}
`;
document.head.appendChild(style);

// 백엔드 EventCreateRequestDto.EventRewardRequestDto와 일치하는 타입
interface EventRewardRequestDto {
  conditionValue: string;
  rewardValue: string;
}

interface EventForm {
  title: string;
  type: EventType;
  purchaseStartDate: string;
  purchaseEndDate: string;
  eventStartDate: string;
  eventEndDate: string;
  announcementDate: string;
  description: string;
  participationMethod: string;
  rewards: EventRewardRequestDto[];
  selectionCriteria: string;
  precautions: string;
  maxParticipants: number;
  image: string;
  imageFile: File | null;
  imagePreview: string;
}


const EventCreatePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [eventForm, setEventForm] = useState<EventForm>({
    title: "",
    type: "BATTLE",
    purchaseStartDate: "",
    purchaseEndDate: "",
    eventStartDate: "",
    eventEndDate: "",
          announcementDate: "",
    description: "",
    participationMethod: "",
    rewards: [
      { conditionValue: "1", rewardValue: "프리미엄 스니커즈" },
      { conditionValue: "2", rewardValue: "트렌디한 운동화" },
      { conditionValue: "3", rewardValue: "스타일리시한 슈즈" }
    ],
    selectionCriteria: "",
    precautions: "",
    maxParticipants: 100,
    image: "",
    imageFile: null,
    imagePreview: ""
  });

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // 도움말 표시 상태
  const [showHelp, setShowHelp] = useState({
    participationMethod: false,
    selectionCriteria: false,
    precautions: false
  });

  // 날짜 변환 헬퍼 함수 (백엔드 LocalDate 형식에 맞춤)
  const toLocalDateString = (dateTimeStr: string): string => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      // 한국 시간대 고려하여 YYYY-MM-DD 형식으로 변환
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('날짜 변환 오류:', error);
      return '';
    }
  };

  // 권한 체크
  useEffect(() => {
    if (!user) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    
    if (user.userType !== 'admin') {
      alert('관리자 권한이 필요합니다.');
      navigate('/events');
      return;
    }
  }, [user, navigate]);

  // 현재 날짜를 기본값으로 설정 (한국 시간대 적용)
  useEffect(() => {
    // 한국 시간대 (UTC+9) 적용
    const now = new Date();
    const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    
    const tomorrow = new Date(koreaTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(koreaTime);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const nextMonth = new Date(koreaTime);
    nextMonth.setDate(nextMonth.getDate() + 30);
    
    const formatDate = (date: Date) => {
      return date.toISOString().slice(0, 16);
    };

    setEventForm(prev => ({
      ...prev,
      purchaseStartDate: formatDate(tomorrow),
      purchaseEndDate: formatDate(nextWeek),
      eventStartDate: formatDate(nextWeek),
      eventEndDate: formatDate(nextMonth),
      announcementDate: formatDate(nextMonth)
    }));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeSelect = (type: EventType) => {
    setEventForm(prev => ({ ...prev, type }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEventForm(prev => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleImageRemove = () => {
    setEventForm(prev => ({
      ...prev,
      imageFile: null,
      imagePreview: ""
    }));
  };

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleRewardChange = (index: number, field: keyof EventRewardRequestDto, value: string) => {
    setEventForm(prev => ({
      ...prev,
      rewards: prev.rewards.map((reward, i) => 
        i === index ? { ...reward, [field]: value } : reward
      )
    }));
  };

  const addReward = () => {
    setEventForm(prev => ({
      ...prev,
      rewards: [...prev.rewards, { 
        conditionValue: `${prev.rewards.length + 1}`, 
        rewardValue: "" 
      }]
    }));
  };

  const removeReward = (index: number) => {
    setEventForm(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (!eventForm.title.trim()) {
      errors.push("이벤트 제목을 입력해주세요.");
    }

    if (!eventForm.description.trim()) {
      errors.push("이벤트 설명을 입력해주세요.");
    }

    if (!eventForm.purchaseStartDate) {
      errors.push("구매 시작일을 설정해주세요.");
    }

    if (!eventForm.purchaseEndDate) {
      errors.push("구매 종료일을 설정해주세요.");
    }

    if (!eventForm.eventStartDate) {
      errors.push("이벤트 시작일을 설정해주세요.");
    }

    if (!eventForm.eventEndDate) {
      errors.push("이벤트 종료일을 설정해주세요.");
    }

    if (!eventForm.announcementDate) {
      errors.push("발표일을 설정해주세요.");
    }

    if (!eventForm.participationMethod.trim()) {
      errors.push("참여 방법을 입력해주세요.");
    }

    if (!eventForm.selectionCriteria.trim()) {
      errors.push("선정 기준을 입력해주세요.");
    }

    if (!eventForm.precautions.trim()) {
      errors.push("주의사항을 입력해주세요.");
    }

    if (eventForm.maxParticipants < 1) {
      errors.push("최대 참가자 수는 1명 이상이어야 합니다.");
    }

    // 보상 데이터 검증
    if (eventForm.rewards.length === 0) {
      errors.push("최소 1개의 보상이 필요합니다.");
    } else {
      for (let i = 0; i < eventForm.rewards.length; i++) {
        const reward = eventForm.rewards[i];
        if (!reward.conditionValue || !reward.conditionValue.trim()) {
          errors.push(`${i + 1}번째 보상의 조건값을 입력해주세요.`);
        }
        if (!reward.rewardValue || !reward.rewardValue.trim()) {
          errors.push(`${i + 1}번째 보상의 내용을 입력해주세요.`);
        }
      }
    }

    // 날짜 유효성 검사
    const purchaseStart = new Date(eventForm.purchaseStartDate);
    const purchaseEnd = new Date(eventForm.purchaseEndDate);
    const eventStart = new Date(eventForm.eventStartDate);
    const eventEnd = new Date(eventForm.eventEndDate);
    const announcement = new Date(eventForm.announcementDate);

    if (purchaseEnd <= purchaseStart) {
      errors.push("구매 종료일은 시작일보다 늦어야 합니다.");
    }

    if (eventEnd <= eventStart) {
      errors.push("이벤트 종료일은 시작일보다 늦어야 합니다.");
    }

    if (eventStart < purchaseEnd) {
      errors.push("이벤트 시작일은 구매 종료일 이후여야 합니다.");
    }

    if (announcement < eventEnd) {
      errors.push("발표일은 이벤트 종료일 이후여야 합니다.");
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      showToastMessage(errors.join('\n'), 'error');
      return;
    }

    try {
      setIsLoading(true);

      // FormData로 전송 (백엔드가 multipart/form-data를 지원하므로)
      const formData = new FormData();
      formData.append("title", eventForm.title);
      formData.append("type", eventForm.type);
      formData.append("purchaseStartDate", toLocalDateString(eventForm.purchaseStartDate));
      formData.append("purchaseEndDate", toLocalDateString(eventForm.purchaseEndDate));
      formData.append("eventStartDate", toLocalDateString(eventForm.eventStartDate));
      formData.append("eventEndDate", toLocalDateString(eventForm.eventEndDate));
      formData.append("announcement", toLocalDateString(eventForm.announcementDate));
      formData.append("description", eventForm.description);
      formData.append("participationMethod", eventForm.participationMethod);
      formData.append("selectionCriteria", eventForm.selectionCriteria);
      formData.append("precautions", eventForm.precautions);
      formData.append("maxParticipants", eventForm.maxParticipants.toString());
      
      // rewards를 JSON 문자열로 변환 (백엔드 형식에 맞춤)
      const rewardsForBackend = eventForm.rewards.map(reward => ({
        conditionValue: reward.conditionValue,
        rewardValue: reward.rewardValue
      }));
      formData.append("rewards", JSON.stringify(rewardsForBackend));
      
      if (eventForm.imageFile) {
        formData.append("image", eventForm.imageFile);
      }

      const response = await axiosInstance.post("/api/events", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/events");
      }, 2000);

    } catch (error: any) {
      console.error("이벤트 생성 실패:", error);
      
      let errorMessage = "이벤트 생성에 실패했습니다.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = "입력 데이터가 올바르지 않습니다. 모든 필수 항목을 확인해주세요.";
      } else if (error.response?.status === 401) {
        errorMessage = "로그인이 필요하거나 권한이 없습니다.";
      } else if (error.response?.status === 403) {
        errorMessage = "관리자 권한이 필요합니다.";
      } else if (error.response?.status >= 500) {
        errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      }
      
      showToastMessage(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeText = (type: EventType) => {
    switch (type) {
      case "BATTLE":
        return "배틀";
      case "MISSION":
        return "미션";
      case "MULTIPLE":
        return "랭킹";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            이벤트 생성
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            새로운 이벤트를 생성하여 사용자들과 특별한 경험을 만들어보세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                기본 정보
              </h2>
            </div>
            
            {/* 이벤트 제목 */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                이벤트 제목 *
              </label>
              <input
                type="text"
                name="title"
                value={eventForm.title}
                onChange={handleChange}
                placeholder="매력적인 이벤트 제목을 입력하세요"
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white"
                maxLength={100}
              />
            </div>

            {/* 이벤트 타입 */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></span>
                이벤트 유형 *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(["BATTLE", "MISSION", "MULTIPLE"] as EventType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTypeSelect(type)}
                    className={`group relative p-8 border-2 rounded-2xl text-center transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95 ${
                      eventForm.type === type
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg ring-4 ring-blue-500/20'
                        : 'border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/50'
                    }`}
                  >
                    <div className="mb-4">
                      {type === "BATTLE" && (
                        <div className="w-16 h-16 mx-auto bg-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                      {type === "MISSION" && (
                        <div className="w-16 h-16 mx-auto bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                      )}
                      {type === "MULTIPLE" && (
                        <div className="w-16 h-16 mx-auto bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-xl mb-3">{getTypeText(type)}</div>
                    <div className="text-sm text-gray-600 leading-relaxed">
                      {type === "BATTLE" && "1:1 스타일 대결로 승부를 가려요"}
                      {type === "MISSION" && "주어진 미션을 수행하여 보상을 받아요"}
                      {type === "MULTIPLE" && "다수 참여로 더 큰 보상을 경쟁해요"}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 이벤트 설명 */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                이벤트 설명 *
              </label>
              <textarea
                name="description"
                value={eventForm.description}
                onChange={handleChange}
                placeholder="이벤트의 매력과 참여 방법을 상세히 설명해주세요"
                rows={5}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white resize-none"
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">참여자들이 이벤트에 관심을 가질 수 있도록 매력적으로 작성해주세요</span>
                <span className="text-sm font-medium text-gray-600">
                  {eventForm.description.length}/1000
                </span>
              </div>
            </div>
          </div>

          {/* 날짜 정보 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                날짜 정보
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 구매 기간 */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  구매 시작일 *
                </label>
                <div className="relative group">
                  <input
                    type="datetime-local"
                    name="purchaseStartDate"
                    value={eventForm.purchaseStartDate}
                    onChange={handleChange}
                    className="w-full px-6 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all duration-300 bg-white group-hover:border-green-300"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-gray-400 group-hover:text-green-500 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  구매 종료일 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="purchaseEndDate"
                    value={eventForm.purchaseEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 이벤트 기간 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이벤트 시작일 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="eventStartDate"
                    value={eventForm.eventStartDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이벤트 종료일 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="eventEndDate"
                    value={eventForm.eventEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* 발표일 */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  발표일 *
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    name="announcementDate"
                    value={eventForm.announcementDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">상세 정보</h2>
            
            {/* 참여 방법 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  참여 방법 *
                </label>
                                 <button
                   type="button"
                   onClick={() => setShowHelp(prev => ({ ...prev, participationMethod: !prev.participationMethod }))}
                   className="text-blue-500 text-sm hover:text-blue-700 active:text-blue-800 transition-colors duration-200 active:scale-95 transform"
                 >
                   도움말
                 </button>
              </div>
              {showHelp.participationMethod && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  이벤트 참여 방법을 상세히 설명해주세요. 예: "상품을 구매하고 리뷰를 작성하면 참여 완료"
                </div>
              )}
              <textarea
                name="participationMethod"
                value={eventForm.participationMethod}
                onChange={handleChange}
                placeholder="이벤트 참여 방법을 상세히 설명하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* 선정 기준 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  선정 기준 *
                </label>
                                 <button
                   type="button"
                   onClick={() => setShowHelp(prev => ({ ...prev, selectionCriteria: !prev.selectionCriteria }))}
                   className="text-blue-500 text-sm hover:text-blue-700 active:text-blue-800 transition-colors duration-200 active:scale-95 transform"
                 >
                   도움말
                 </button>
              </div>
              {showHelp.selectionCriteria && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  당선자 선정 기준을 명확히 설명해주세요. 예: "리뷰 품질, 사진 퀄리티, 창의성 등을 종합 평가"
                </div>
              )}
              <textarea
                name="selectionCriteria"
                value={eventForm.selectionCriteria}
                onChange={handleChange}
                placeholder="당선자 선정 기준을 설명하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* 주의사항 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  주의사항 *
                </label>
                                 <button
                   type="button"
                   onClick={() => setShowHelp(prev => ({ ...prev, precautions: !prev.precautions }))}
                   className="text-blue-500 text-sm hover:text-blue-700 active:text-blue-800 transition-colors duration-200 active:scale-95 transform"
                 >
                   도움말
                 </button>
              </div>
              {showHelp.precautions && (
                <div className="mb-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                  이벤트 참여 시 주의사항을 안내해주세요. 예: "중복 참여 불가, 부정 참여 시 제재"
                </div>
              )}
              <textarea
                name="precautions"
                value={eventForm.precautions}
                onChange={handleChange}
                placeholder="이벤트 참여 시 주의사항을 입력하세요"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* 최대 참가자 수 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 참가자 수 *
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={eventForm.maxParticipants}
                onChange={handleChange}
                min="1"
                max="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 보상 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">보상 정보</h2>
            
            {eventForm.rewards.map((reward, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {index + 1}등 보상
                  </h3>
                                     {eventForm.rewards.length > 1 && (
                     <button
                       type="button"
                       onClick={() => removeReward(index)}
                       className="text-red-500 hover:text-red-700 active:text-red-800 transition-colors duration-200 active:scale-95 transform"
                     >
                       삭제
                     </button>
                   )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      선정 조건
                    </label>
                    <input
                      type="text"
                      value={reward.conditionValue}
                      onChange={(e) => handleRewardChange(index, 'conditionValue', e.target.value)}
                      placeholder="예: 1등, 최우수상"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      보상 내용
                    </label>
                    <input
                      type="text"
                      value={reward.rewardValue}
                      onChange={(e) => handleRewardChange(index, 'rewardValue', e.target.value)}
                      placeholder="예: 프리미엄 스니커즈"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            ))}
            
                         <button
               type="button"
               onClick={addReward}
               className="w-full py-4 border-2 border-dashed border-blue-300 rounded-xl text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 active:bg-blue-100 active:scale-95 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
             >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              보상 추가
            </button>
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">이벤트 이미지</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="event-image"
              />
                             <label
                 htmlFor="event-image"
                 className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 active:bg-blue-700 active:scale-95 transition-all duration-200 cursor-pointer transform"
               >
                 이미지 선택
               </label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, GIF 파일만 업로드 가능합니다.
              </p>
            </div>
            
            {/* 이미지 미리보기 */}
            {eventForm.imagePreview && (
              <div className="mt-4">
                <div className="relative inline-block">
                  <img
                    src={eventForm.imagePreview}
                    alt="이벤트 이미지 미리보기"
                    className="w-64 h-48 object-cover rounded-lg"
                  />
                                     <button
                     type="button"
                     onClick={handleImageRemove}
                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 active:bg-red-700 active:scale-95 transition-all duration-200 transform"
                   >
                     ×
                   </button>
                </div>
              </div>
            )}
          </div>

                     {/* 제출 버튼 */}
           <div className="flex justify-center gap-4 pt-8">
             <button
               type="button"
               onClick={() => navigate('/events')}
               className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-all duration-200 font-medium active:scale-95 transform hover:shadow-md rounded-lg border border-gray-300 hover:border-gray-400 active:bg-gray-100"
             >
               취소
             </button>
             <button
               type="submit"
               disabled={isLoading}
               className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium active:scale-95 transform hover:shadow-lg active:shadow-xl"
             >
               {isLoading ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                   생성 중...
                 </>
               ) : (
                 <>
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                   </svg>
                   이벤트 생성
                 </>
               )}
             </button>
           </div>
        </form>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div className={`fixed top-6 right-6 z-50 p-6 rounded-2xl shadow-2xl animate-fade-in-out ${
          toastType === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-3">
            {toastType === 'success' ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-semibold">{toastMessage}</span>
          </div>
                 </div>
       )}

       {/* 플로팅 액션 버튼 */}
       <div className="fixed bottom-8 right-8 z-40">
         <button
           onClick={() => navigate('/events')}
           className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 transform group cursor-pointer flex items-center justify-center"
           title="이벤트 목록으로 이동"
         >
           <svg className="w-8 h-8 text-white group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 12H5m7 7l-7-7 7-7" />
           </svg>
         </button>
       </div>

       {/* 성공 팝업창 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">이벤트 생성 완료!</h3>
              <p className="text-gray-600 mb-6">
                새로운 이벤트가 성공적으로 생성되었습니다.
              </p>
              <div className="flex justify-center">
                                 <button
                   onClick={() => {
                     setShowSuccessModal(false);
                     navigate('/events');
                   }}
                   className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 active:scale-95 transition-all duration-200 font-medium transform"
                 >
                   이벤트 목록으로 이동
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventCreatePage;

