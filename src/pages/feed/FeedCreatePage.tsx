// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import FeedService from "../../api/feedService";
import OrderService from "../../api/orderService";
import EventService from "../../api/eventService";
import { FeedEventDto } from "../../types/event";
import { CreateFeedRequest } from "../../types/feed";
import {
  uploadBase64Images,
  validateImageFile,
  createImagePreview,
} from "../../utils/common/imageUpload";
import { PurchasedProduct } from "types/order";

// Add global styles for animation
const style = document.createElement("style");
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



// 임시 구매 상품 데이터 (백엔드 연결 실패시 fallback용)
const fallbackProducts = [
  {
    orderItemId: 1,
    productId: 1,
    productName: "나이키 에어맥스 97",
    imageUrl:
      "https://static.nike.com/a/images/t_PDP_864_v1/f_auto,q_auto:eco/air-max-97-shoe.jpg",
    purchaseDate: new Date().toISOString(),
  },
  {
    orderItemId: 2,
    productId: 2,
    productName: "아디다스 울트라부스트 21",
    imageUrl: "https://assets.adidas.com/images/ultraboost-21.jpg",
    purchaseDate: new Date().toISOString(),
  },
  {
    orderItemId: 3,
    productId: 3,
    productName: "뉴발란스 990v5",
    imageUrl:
      "https://nb.scene7.com/is/image/NB/m990gl5_nb_02_i?$pdpflexf2$&wid=440&hei=440",
    purchaseDate: new Date().toISOString(),
  },
];

const FeedCreatePage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const editId = searchParams.get("id");
  const eventIdFromUrl = searchParams.get("eventId"); // URL 파라미터에서 이벤트 ID 가져오기
  const navigate = useNavigate();


  // 이벤트 목록에서 전달받은 이벤트 정보
  const incomingEventId = location.state?.selectedEventId;
  const fromEventList = location.state?.fromEventList;

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [instagramLinked, setInstagramLinked] = useState(false);
  const [instagramId, setInstagramId] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // 🔧 백엔드 연동: 구매 상품 목록
  const [purchasedProducts, setPurchasedProducts] = useState<
    PurchasedProduct[]
  >([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // 🔧 백엔드 연동: 이벤트 목록 (캐싱 최적화)
  const [availableEvents, setAvailableEvents] = useState<FeedEventDto[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsCacheTime, setEventsCacheTime] = useState<number>(0);

  // UI 상태
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const MAX_IMAGES = 5;

  // 🔧 백엔드 연동: 사용자의 구매 상품 목록 가져오기
  useEffect(() => {
    const fetchPurchasedProducts = async () => {
      try {
        setProductsLoading(true);
        console.log('구매 상품 목록 조회 시작');
        const response = await OrderService.getPurchasedProducts();
        console.log('구매 상품 목록 조회 성공:', response);
        setPurchasedProducts(response);
      } catch (error: any) {
        console.error("구매 상품 목록 조회 실패:", error);
        // 백엔드 연결 실패시 fallback 데이터 사용
        console.warn("백엔드 연결 실패 - fallback 데이터 사용");
        setPurchasedProducts(fallbackProducts as any);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchPurchasedProducts();
  }, []);

  // 🔧 백엔드 연동: 피드 생성 가능한 이벤트 목록 가져오기
  useEffect(() => {
    const fetchAvailableEvents = async () => {
      try {
        // 캐시 시간 확인 (5분 = 300초)
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5분
        
        // 캐시가 유효한 경우 재사용
        if (eventsCacheTime > 0 && (now - eventsCacheTime) < cacheExpiry && availableEvents.length > 0) {
          setEventsLoading(false);
          return;
        }
        
        setEventsLoading(true);
        const response = await EventService.getFeedAvailableEvents();
        
        // 백엔드 응답 구조에 맞게 처리
        const events = Array.isArray(response) ? response : [];
        setAvailableEvents(events);
        setEventsCacheTime(now);
        
        console.log('이벤트 목록 조회 성공:', events);
        
        // 이벤트가 없는 경우 로그 출력
        if (events.length === 0) {
          console.log('진행중인 이벤트가 없습니다.');
        }
        
      } catch (error: any) {
        console.error("이벤트 목록 조회 실패:", error);
        // 에러가 발생해도 빈 배열로 설정하여 페이지는 정상 표시
        setAvailableEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchAvailableEvents();
  }, []);

  // 이벤트 목록에서 전달받은 이벤트 정보 처리
  useEffect(() => {
    // URL 파라미터에서 이벤트 ID가 있으면 우선 처리
    if (eventIdFromUrl) {
      const eventIdNumber = parseInt(eventIdFromUrl);
      setSelectedEventId(eventIdNumber.toString());
      
      // 이벤트 정보를 가져와서 제목과 내용에 자동 설정
      const selectedEvent = availableEvents.find(event => event.eventId === eventIdNumber);
      if (selectedEvent) {
        setTitle(`${selectedEvent.title} 참여 피드`);
        setContent(`${selectedEvent.title} 이벤트에 참여합니다!`);
        
        // 이벤트 관련 해시태그 자동 추가
        const eventHashtags = ["이벤트참여", selectedEvent.title.replace(/\s+/g, ""), "피드챌린지"];
        setHashtags(eventHashtags);
        
        console.log('URL 파라미터로 이벤트 자동 선택 완료:', selectedEvent);
      }
    } else if (incomingEventId && fromEventList) {
      // 선택된 이벤트 ID를 상태에 설정 (숫자로 변환)
      const eventIdNumber = parseInt(incomingEventId.toString());
      setSelectedEventId(eventIdNumber.toString());
      
      // 이벤트 정보를 가져와서 제목과 내용에 자동 설정
      const selectedEvent = availableEvents.find(event => event.eventId === eventIdNumber);
      if (selectedEvent) {
        setTitle(`${selectedEvent.title} 참여 피드`);
        setContent(`${selectedEvent.title} 이벤트에 참여합니다!`);
        
        // 이벤트 관련 해시태그 자동 추가
        const eventHashtags = ["이벤트참여", selectedEvent.title.replace(/\s+/g, ""), "피드챌린지"];
        setHashtags(eventHashtags);
        
        console.log('이벤트 자동 선택 완료:', selectedEvent);
      } else {
        console.warn('선택된 이벤트를 찾을 수 없음:', eventIdNumber, availableEvents);
      }
    }
  }, [incomingEventId, fromEventList, availableEvents, eventIdFromUrl]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (uploadedImages.length + files.length > MAX_IMAGES) {
      showToastMessage(
        `이미지는 최대 ${MAX_IMAGES}개까지 업로드 가능합니다.`,
        "error"
      );
      return;
    }

    files.forEach(async (file) => {
      if (validateImageFile(file)) {
        const preview = await createImagePreview(file);
        setUploadedImages((prev) => [...prev, preview]);
      }
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags((prev) => [...prev, hashtagInput.trim()]);
      setHashtagInput("");
    }
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddHashtag();
    }
  };

  const removeHashtag = (tag: string) => {
    setHashtags((prev) => prev.filter((t) => t !== tag));
  };

  const addRecommendedHashtag = (tag: string) => {
    if (!hashtags.includes(tag)) {
      setHashtags((prev) => [...prev, tag]);
    }
  };

  const showToastMessage = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('피드 생성 시도:', {
      title: title.trim(),
      content: content.trim(),
      selectedProductId,
      selectedEventId,
      purchasedProducts: purchasedProducts.length,
      availableEvents: availableEvents.length
    });

    if (!title.trim()) {
      showToastMessage("제목을 입력해주세요.", "error");
      return;
    }

    if (!content.trim()) {
      showToastMessage("내용을 입력해주세요.", "error");
      return;
    }

    // 🔧 백엔드 연동: orderItemId는 필수 필드
    if (!selectedProductId) {
      console.error('구매 상품이 선택되지 않음');
      showToastMessage("구매 상품을 선택해주세요.", "error");
      return;
    }

    try {
      setIsLoading(true);

      // 🔧 백엔드 연동: 이미지 업로드 (선택사항)
      const imageUrls = uploadedImages.length > 0 
        ? await uploadBase64Images(uploadedImages)
        : undefined; // 빈 배열 대신 undefined로 설정하여 이미지 없음을 명확히 표시

      // 🔧 백엔드 API 구조에 맞춰 수정
      const feedData: CreateFeedRequest = {
        title: title.trim(),
        content: content.trim(),
        orderItemId: parseInt(selectedProductId), // 필수 필드
        imageUrls: imageUrls || [],
        hashtags: hashtags,
        eventId: selectedEventId ? parseInt(selectedEventId) : undefined,
        instagramId: instagramLinked ? instagramId : undefined,
      };

      // 디버깅: 이벤트 참여 정보 확인
      console.log('피드 생성 데이터:', {
        selectedEventId,
        eventId: feedData.eventId,
        title: feedData.title,
        content: feedData.content,
        hashtags: feedData.hashtags
      });

      if (editId) {
        // 수정 모드
        await FeedService.updateFeed(parseInt(editId), feedData);
        showToastMessage("피드가 성공적으로 수정되었습니다!", "success");
        // 수정 후 피드 목록 페이지로 이동
        setTimeout(() => {
          navigate("/feeds");
        }, 1000);
      } else {
        // 생성 모드
        await FeedService.createFeed(feedData);
        showToastMessage("피드가 성공적으로 생성되었습니다!", "success");
        // 생성 후 피드 목록 페이지로 이동
        setTimeout(() => {
          navigate("/feeds");
        }, 1000);
      }
    } catch (error: any) {
      console.error("피드 생성 실패:", error);
      const errorMessage =
        error.response?.data?.message || "피드 생성에 실패했습니다.";
      showToastMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {editId ? "피드 수정" : "새 피드 작성"}
          </h1>
          <p className="text-gray-600 text-lg">
            {editId
              ? "피드 내용을 수정해주세요."
              : "새로운 피드를 작성해주세요."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-info-circle text-blue-600 mr-3"></i>
              기본 정보
            </h2>

            {/* 제목 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="피드 제목을 입력하세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={100}
              />
            </div>

            {/* 내용 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="피드 내용을 입력하세요"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length}/2000
              </div>
            </div>
          </div>

          {/* 구매 상품 선택 - 필수 필드로 변경 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-shopping-bag text-green-600 mr-3"></i>
              구매 상품 선택 *
            </h2>

            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">구매 상품을 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">구매 상품을 선택하세요 *</option>
                  {purchasedProducts.map((product) => (
                    // 🔧 백엔드 연동: orderItemId 사용
                    <option key={product.orderItemId} value={product.orderItemId}>
                      {product.productName}
                    </option>
                  ))}
                </select>

                {purchasedProducts.length === 0 && (
                  <p className="text-gray-500 text-sm">
                    구매한 상품이 없습니다. 상품을 구매한 후 피드를 작성할 수 있습니다.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 이미지 업로드 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-image text-purple-600 mr-3"></i>
              이미지 업로드 (선택사항)
            </h2>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                이미지 선택
              </button>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG, GIF 파일만 업로드 가능합니다. (최대 {MAX_IMAGES}개) - 선택사항
              </p>
            </div>

            {/* 이미지 미리보기 */}
            {uploadedImages.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  업로드된 이미지
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {uploadedImages.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`업로드된 이미지 ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 이벤트 선택 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-calendar-alt text-orange-600 mr-3"></i>
              이벤트 참여 (선택사항)
            </h2>

            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">이벤트를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 이벤트 목록에서 넘어온 경우 안내 메시지 */}
                {fromEventList && incomingEventId && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center">
                      <i className="fas fa-info-circle text-blue-500 mr-2"></i>
                      <span className="text-blue-700 font-medium">
                        이벤트 참여를 위해 자동으로 이벤트가 선택되었습니다.
                      </span>
                    </div>
                  </div>
                )} 
                <select
                  value={selectedEventId || ""}
                  onChange={(e) => setSelectedEventId(e.target.value || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">이벤트를 선택하세요 (선택사항)</option>
                  {availableEvents.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.title}
                    </option>
                  ))}
                </select>

                {availableEvents.length === 0 && (
                  <div className="text-gray-500 text-sm">
                    <p>현재 참여 가능한 이벤트가 없습니다.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 해시태그 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fas fa-hashtag text-pink-600 mr-3"></i>
              해시태그 (선택사항)
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  placeholder="해시태그를 입력하세요"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={handleAddHashtag}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  추가
                </button>
              </div>

              {/* 추천 해시태그 */}
              <div>
                <p className="text-sm text-gray-600 mb-2">추천 해시태그:</p>
                <div className="flex flex-wrap gap-2">
                  {["#스니커즈", "#운동화", "#패션", "#스타일", "#코디"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => addRecommendedHashtag(tag)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* 추가된 해시태그 */}
              {hashtags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">추가된 해시태그:</p>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeHashtag(tag)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 인스타그램 연동 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <i className="fab fa-instagram text-pink-500 mr-3"></i>
              인스타그램 연동 (선택사항)
            </h2>

            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={instagramLinked}
                  onChange={(e) => setInstagramLinked(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">
                  인스타그램과 연동하기
                </span>
              </label>

              {instagramLinked && (
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => setInstagramId(e.target.value)}
                  placeholder="인스타그램 아이디를 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          {/* 제출 버튼 */}
          <div className="flex justify-end gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/feeds")}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <i className="fas fa-times mr-2"></i>
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {editId ? "수정 중..." : "생성 중..."}
                </div>
              ) : (
                <div className="flex items-center">
                  <i className="fas fa-paper-plane mr-2"></i>
                  {editId ? "피드 수정" : "피드 생성"}
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-6 rounded-2xl shadow-2xl animate-fade-in-out backdrop-blur-sm ${
            toastType === "success"
              ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border border-green-400"
              : "bg-gradient-to-r from-red-500 to-pink-500 text-white border border-red-400"
          }`}
        >
          <div className="flex items-center">
            <i className={`fas ${toastType === "success" ? "fa-check-circle" : "fa-exclamation-circle"} mr-3 text-xl`}></i>
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedCreatePage;
