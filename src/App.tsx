import { lazy, FC, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import Layout from "./components/layout/Layout";
import ScrollToTop from "./components/rollback/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import theme from "./theme";

// 보호 라우트 컴포넌트 임포트
import SellerProtectedRoute from "./components/SellerProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import UserProtectedRoute from "./components/UserProtectedRoute";
import MyPosts from "pages/auth/MyPosts";
import CouponsPage from "pages/auth/CouponsPage";

// 페이지 컴포넌트들
const HomePage = lazy(() => import("./pages/common/HomePage"));
const ProductsPage = lazy(() => import("./pages/products/Lists"));
const ProductDetailPage = lazy(() => import("./pages/products/DetailPage"));
const CategoriesPage = lazy(() => import("./pages/products/CategoriesPage"));
const MyPage = lazy(() => import("./pages/auth/MyPage"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignUp = lazy(() => import("./pages/auth/SignUp"));
const FindAccountPage = lazy(() => import("./pages/auth/FindAccountPage"));
const FindPasswordPage = lazy(() => import("./pages/auth/FindPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const PrivacyPolicy = lazy(() => import("./pages/common/PrivacyPolicy"));
const ProductUploadPage = lazy(
  () => import("./pages/products/registerProduct/RegisterProductPage")
);
const ProductEditPage = lazy(
  () => import("./pages/products/editProduct/EditProductsPage")
);
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ProfilePage = lazy(() => import("./pages/auth/ProfilePage"));
const ReviewsPage = lazy(() => import("./pages/reviews/ReviewsPage"));
const UserManagePage = lazy(() => import("./pages/admin/UserManagePage"));
const ReportManagePage = lazy(() => import("./pages/admin/ReportManagePage"));
const AdminDashboardPage = lazy(
  () => import("./pages/admin/AdminDashboardPage")
);
const StatsDashboardPage = lazy(
  () => import("./pages/admin/StatsDashboardPage")
);
const StoreHomePage = lazy(() => import("./pages/stores/StoreHomePage"));
const CartPage = lazy(() => import("./pages/cart/CartPage"));
const PaymentPage = lazy(() => import("./pages/order/PaymentPage"));
const SellerOrdersPage = lazy(() => import("./pages/order/SellerOrdersPage"));
const UserOrdersPage = lazy(() => import("./pages/order/UserOrdersPage"));
const CheckoutPage = lazy(() => import("./pages/order/CheckoutPage"));
const WishListPage = lazy(() => import("./pages/cart/WishListPage"));
const RecentViewPage = lazy(() => import("./pages/cart/RecentViewPage"));
const ReviewEditPage = lazy(() => import("./pages/reviews/ReviewEditPage"));
const ProfileSettingsPage = lazy(
  () => import("./pages/auth/ProfileSettingsPage")
);
const FeedListPage = lazy(() => import("./pages/feed/FeedListPage"));
const FeedDetailPage = lazy(() => import("./pages/feed/FeedDetailPage"));
const FeedCreatePage = lazy(() => import("./pages/feed/FeedCreatePage"));
const FeedEditPage = lazy(() => import("./pages/feed/FeedEditPage"));
const MyFeedPage = lazy(() => import("./pages/feed/MyFeedPage"));
const EventListPage = lazy(() => import("./pages/event/EventListPage"));
const EventCreatePage = lazy(() => import("./pages/event/EventCreatePage"));
const EventEditPage = lazy(() => import("./pages/event/EventEditPage"));
const EventResultPage = lazy(() => import("./pages/event/EventResultPage"));
const BecomeSellerPage = lazy(() => import("./pages/seller/BecomeSellerPage"));
const SellerMyPage = lazy(() => import("./pages/seller/SellerMyPage"));

const RECAPTCHA_SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY || "";

// reCAPTCHA 키가 설정되었는지 확인
if (!RECAPTCHA_SITE_KEY) {
  // 개발 환경에서만 경고를 띄웁니다.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "reCAPTCHA site key is not defined. Please check your .env file."
    );
  }
}

const App: FC = () => {
  return (
    <GoogleReCaptchaProvider reCaptchaKey={RECAPTCHA_SITE_KEY}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <ScrollToTop />
          <Suspense fallback={<div>로딩중...</div>}>
            <Routes>
              {/* Layout이 필요한 페이지들 */}
              <Route element={<Layout />}>
                {/* 공개 페이지들 (권한 불필요) */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                {/* 최근 본 상품 (모든 사용자 접근 가능) */}
                <Route path="/recentview" element={<RecentViewPage />} />
                {/* USER 권한 필요 페이지들 */}
                <Route path="/cart" element={<CartPage />} />
                <Route path="/payment" element={<PaymentPage />} />
                <Route
                  path="/checkout"
                  element={
                    <UserProtectedRoute requireUserRole={true}>
                      <CheckoutPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <UserProtectedRoute requireUserRole={true}>
                      <SellerOrdersPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <UserProtectedRoute requireUserRole={true}>
                      <UserOrdersPage />
                    </UserProtectedRoute>
                  }
                />
                <Route path="/wishlist" element={<WishListPage />} />

                {/* 마이페이지 관련 라우트들 */}
                <Route
                  path="/mypage/*"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <MyPage />
                    </UserProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <ProfilePage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/profile-settings"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <ProfileSettingsPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/reviews"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <ReviewsPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/reviews/edit"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <ReviewEditPage />
                    </UserProtectedRoute>
                  }
                />
                {/* 피드 관련 페이지들 */}
                <Route path="/feed-list" element={<FeedListPage />} />
                <Route path="/feed/:id" element={<FeedDetailPage />} />
                <Route
                  path="/feed-create"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <FeedCreatePage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/feed-edit"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <FeedEditPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/my-feed"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <MyFeedPage />
                    </UserProtectedRoute>
                  }
                />
                {/* 이벤트 관련 페이지들 */}
                <Route path="/event-list" element={<EventListPage />} />
                <Route
                  path="/events/create"
                  element={
                    <AdminProtectedRoute>
                      <EventCreatePage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/events/edit/:id"
                  element={
                    <AdminProtectedRoute>
                      <EventEditPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/events/result"
                  element={
                    <AdminProtectedRoute>
                      <EventResultPage />
                    </AdminProtectedRoute>
                  }
                />

                {/* 판매자 관련 페이지들 */}
                <Route
                  path="/become-seller"
                  element={
                    <UserProtectedRoute requireLogin={true}>
                      <BecomeSellerPage />
                    </UserProtectedRoute>
                  }
                />
                <Route
                  path="/seller-mypage"
                  element={
                    <SellerProtectedRoute
                      allowedUserType="seller"
                      redirectPath="/"
                    >
                      <SellerMyPage />
                    </SellerProtectedRoute>
                  }
                />

                {/* 가게 페이지 (판매자 전용) */}
                <Route path="/store" element={<StoreHomePage />} />

                {/* 관리자 전용 페이지들 */}
                <Route
                  path="/user-manage"
                  element={
                    <AdminProtectedRoute>
                      <UserManagePage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/report-manage"
                  element={
                    <AdminProtectedRoute>
                      <ReportManagePage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminProtectedRoute>
                      <AdminDashboardPage />
                    </AdminProtectedRoute>
                  }
                />
                <Route
                  path="/stats-dashboard"
                  element={
                    <AdminProtectedRoute>
                      <StatsDashboardPage />
                    </AdminProtectedRoute>
                  }
                />

                {/* 기존 상품 등록/수정 페이지 (제거 예정 - 가게 페이지에서 처리) */}
                <Route
                  path="/products/upload"
                  element={
                    <SellerProtectedRoute
                      allowedUserType="seller"
                      redirectPath="/store"
                    >
                      <ProductUploadPage />
                    </SellerProtectedRoute>
                  }
                />
                <Route
                  path="/products/edit/:id"
                  element={
                    <SellerProtectedRoute
                      allowedUserType="seller"
                      redirectPath="/store"
                    >
                      <ProductEditPage />
                    </SellerProtectedRoute>
                  }
                />
              </Route>
              {/* Layout 없이 보여야 하는 페이지들 */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/find-account" element={<FindAccountPage />} />
              <Route path="/find-password" element={<FindPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </GoogleReCaptchaProvider>
  );
};

export default App;
