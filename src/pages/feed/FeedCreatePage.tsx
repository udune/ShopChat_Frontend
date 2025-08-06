// The exported code uses Tailwind CSS. Install Tailwind CSS in your dev environment to ensure all styles work.
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import FeedService from "../../api/feedService";
import OrderService from "../../api/orderService";
import EventService, { FeedEventDto } from "../../api/eventService";
import { CreateFeedRequest, FeedPost } from "../../types/feed";
import {
  uploadBase64Images,
  validateImageFile,
  createImagePreview,
  compressImage,
} from "../../utils/common/imageUpload";
import { OrderItem, PurchasedProduct } from "types/order";

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

// 🔧 백엔드 연동 버전: 피드 생성 시 이미지 업로드 상태 타입
interface ImageUploadState {
  file: File;
  preview: string;
  uploaded: boolean;
  uploading: boolean;
  url?: string;
}

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
  const navigate = useNavigate();
  const { user } = useAuth();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
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
        const response = await OrderService.getPurchasedProducts();
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
           return;
         }
        
                 setEventsLoading(true);
         const events = await EventService.getFeedAvailableEvents();
         setAvailableEvents(events);
        setEventsCacheTime(now);
      } catch (error: any) {
                 console.error("이벤트 목록 조회 실패:", error);
        setAvailableEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchAvailableEvents();
  }, []);

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
      showToastMessage("구매 상품을 선택해주세요.", "error");
      return;
    }

    try {
      setIsLoading(true);

      // 🔧 백엔드 연동: 이미지 업로드 (선택사항)
      const imageUrls = uploadedImages.length > 0 
        ? await uploadBase64Images(uploadedImages)
        : [];

      // 🔧 백엔드 API 구조에 맞춰 수정
      const feedData: CreateFeedRequest = {
        title: title.trim(),
        content: content.trim(),
        orderItemId: parseInt(selectedProductId), // 필수 필드
        imageUrls: imageUrls,
        hashtags: hashtags,
        eventId: selectedEventId ? parseInt(selectedEventId) : undefined,
        instagramId: instagramLinked ? instagramId : undefined,
      };

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {editId ? "피드 수정" : "새 피드 작성"}
          </h1>
          <p className="text-gray-600">
            {editId
              ? "피드 내용을 수정해주세요."
              : "새로운 피드를 작성해주세요."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 기본 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              이벤트 참여 (선택사항)
            </h2>

            {eventsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">이벤트를 불러오는 중...</p>
              </div>
            ) : (
              <div className="space-y-4">
                
                
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
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
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/feeds")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? editId
                  ? "수정 중..."
                  : "생성 중..."
                : editId
                ? "피드 수정"
                : "피드 생성"}
            </button>
          </div>
        </form>
      </div>

      {/* 토스트 메시지 */}
      {showToast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg animate-fade-in-out ${
            toastType === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default FeedCreatePage;
