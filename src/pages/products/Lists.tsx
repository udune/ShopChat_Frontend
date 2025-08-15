import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// 공통 컴포넌트
import PreparationNotice from "../../components/PreparationNotice"; // 준비중 안내 컴포넌트
// 상품 관련 커스텀 훅
import { useProductList } from "../../hooks/products/useProductList"; // 상품 목록 관리 훅
// 상품 목록 UI 컴포넌트들
import { FilterButtons } from "../../components/products/FilterButtons"; // 필터 버튼 그룹
import { ProductGrid } from "../../components/products/ProductGrid"; // 상품 그리드 레이아웃
import { PaginationControls } from "../../components/products/PaginationControls"; // 페이지네이션 컨트롤
import { EmptyState } from "../../components/products/EmptyState"; // 빈 상태 표시
import { ErrorState } from "../../components/products/ErrorState"; // 에러 상태 표시
import { LoadingState } from "../../components/products/LoadingState"; // 로딩 상태 표시
// 유틸리티 함수
import { formatPrice } from "../../utils/products/listUtils"; // 가격 포맷팅 함수
// 스타일 컴포넌트
import { Container, Header, Title } from "./Lists.styles";
// 카테고리 서비스
import { CategoryService } from "../../api/categoryService";

/**
 * 상품 목록 페이지 컴포넌트
 *
 * 기능:
 * - 전체 상품 목록을 페이지네이션으로 표시
 * - 카테고리별 필터링 지원 (URL 쿼리 파라미터 기반)
 * - 가격 범위 필터링 지원
 * - 최신순, 인기순 정렬 기능
 * - 로딩, 에러, 빈 상태 처리
 *
 * 사용되는 커스텀 훅:
 * - useProductList: 상품 데이터 패칭, 페이지네이션, 정렬, 필터링 관리
 */
const Lists: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 상품 목록 데이터와 페이지네이션 관련 상태 및 함수들
  const {
    products, // 현재 페이지의 상품 목록
    loading, // 로딩 상태
    error, // 에러 메시지
    currentPage, // 현재 페이지 번호 (0부터 시작)
    totalPages, // 전체 페이지 수
    currentSort, // 현재 정렬 방식 (훅에서 파생)
    loadProducts, // 상품 목록을 다시 로드하는 함수
    handlePageChange, // 페이지 변경 핸들러
    handleSortChange: changeSortFromHook, // 이름 충돌 방지를 위해 별칭
    retry, // 에러 발생 시 재시도 함수
  } = useProductList();

  // 정렬 변경 핸들러 (URL 주도)
  const handleSortChange = (sort: string) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("sort", sort);
    // 페이지를 0으로 초기화하고 싶다면 아래 줄 추가:
    // searchParams.set("page", "0");
    navigate(`/products?${searchParams.toString()}`);
    // 즉시 반영을 원하면 아래 주석 해제(선택):
    // changeSortFromHook(sort);
  };

  // URL에서 현재 적용된 필터 정보 추출 및 페이지 제목 생성
  // - 검색어가 있으면: `"검색어" 검색 결과`
  // - 없고 카테고리가 있으면: `{카테고리명} 상품`
  // - 둘 다 없으면: `전체 상품`
  const pageTitle = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const q = searchParams.get("q");
    const categoryId = searchParams.get("categoryId");

    if (q && q.trim().length > 0) {
      // 필요시 카테고리도 함께 표시하려면 다음과 같이 확장 가능:
      // if (categoryId) { ... }
      return `"${q}" 검색 결과`;
    }

    if (categoryId) {
      const category = CategoryService.DEFAULT_CATEGORIES.find(
        (cat) => cat.categoryId === Number(categoryId)
      );
      return category ? `${category.name} 상품` : "카테고리 상품";
    }

    return "전체 상품";
  }, [location.search]);

  // 데이터 로딩 중일 때 로딩 스피너 표시
  if (loading) {
    return (
      <Container>
        <LoadingState />
      </Container>
    );
  }

  // API 호출 실패 등 에러 발생 시 에러 메시지와 재시도 버튼 표시
  if (error) {
    return (
      <Container>
        <ErrorState error={error} onRetry={retry} />
      </Container>
    );
  }

  // 메인 렌더링: 상품 목록과 관련 UI 요소들
  return (
    <Container>
      {/* 페이지 제목 */}
      <Header>
        <Title>{pageTitle}</Title>
      </Header>
      
      {/* 정렬 버튼들 (최신순/인기순) */}
      <FilterButtons activeSort={currentSort} onSortChange={handleSortChange} />

      {/* 상품 목록 또는 빈 상태 표시 */}
      {products.length === 0 ? (
        // 상품이 없을 때 빈 상태 메시지 표시
        <EmptyState />
      ) : (
        <>
          {/* 상품 그리드 레이아웃으로 상품들 표시 */}
          <ProductGrid products={products} formatPrice={formatPrice} />

          {/* 페이지네이션 컨트롤 (이전/다음 페이지 버튼) */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </Container>
  );
};

export default Lists;
