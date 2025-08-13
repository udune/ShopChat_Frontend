import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ProductService } from "../../api/productService";
import { ProductListItem } from "types/products";

/**
 * 상품 목록 관리 훅
 *
 * 상품 목록 페이지에서 상품 데이터를 페이지네이션과 정렬 기능과 함께 관리합니다.
 * 로딩, 에러 상태를 포함하여 안전하게 데이터를 처리하고,
 * 페이지 변경, 정렬 변경 및 재시도 기능을 제공합니다.
 *
 * @param pageSize 페이지당 표시할 상품 수 (기본값: 9)
 */
export const useProductList = (pageSize: number = 9) => {
  const location = useLocation();

  // 상품 목록 데이터
  const [products, setProducts] = useState<ProductListItem[]>([]);
  // 로딩 상태 (초기값은 true로 설정)
  const [loading, setLoading] = useState(true);
  // 에러 상태
  const [error, setError] = useState<string | null>(null);
  // 현재 페이지 번호 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);
  // 전체 페이지 수
  const [totalPages, setTotalPages] = useState(0);
  // 현재 정렬 방식
  const [currentSort, setCurrentSort] = useState("latest");

  // URL에서 필터 파라미터 추출
  const getFilterParamsFromUrl = () => {
    const searchParams = new URLSearchParams(location.search);
    return {
      categoryId: searchParams.get("categoryId")
        ? Number(searchParams.get("categoryId"))
        : undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      storeId: searchParams.get("storeId")
        ? Number(searchParams.get("storeId"))
        : undefined,
      sort: searchParams.get("sort") || "latest",
    };
  };

  /**
   * 서버에서 상품 목록을 불러오는 비동기 함수
   * @param page 불러올 페이지 번호 (0부터 시작, 기본값: 0)
   * @param sort 정렬 방식 (기본값: currentSort)
   */
  const loadProducts = async (page: number = 0, sort?: string) => {
    try {
      setLoading(true); // 로딩 시작
      setError(null); // 이전 에러 초기화

      const filterParams = getFilterParamsFromUrl();
      const sortParam = sort || filterParams.sort || currentSort;
      
      // API 명세서에 따라 모든 요청은 /api/products 엔드포인트로 처리
      const requestParams = Object.fromEntries(
        Object.entries({ 
          ...filterParams, 
          page, 
          size: pageSize, 
          sort: sortParam 
        }).filter(([_, value]) => value !== undefined && value !== null)
      );
      
      const response = await ProductService.getFilteredProducts(requestParams);

      // 성공시 데이터 설정 (빈 배열로 기본값 설정)
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(page);
      setCurrentSort(sortParam);
    } catch (err: any) {
      console.error("상품 목록 로딩 실패:", err);
      // 에러 발생 시 에러 메시지 설정
      setError("상품 목록을 불러오는데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false); // 성공/실패 관계없이 로딩 종료
    }
  };

  /**
   * 페이지 변경을 처리하는 함수
   * 유효한 페이지 범위 내에서만 페이지 변경을 허용
   * @param page 이동할 페이지 번호
   */
  const handlePageChange = (page: number) => {
    // 페이지 범위 유효성 검사 (0 이상, totalPages 미만)
    if (page >= 0 && page < totalPages) {
      loadProducts(page);
    }
  };

  /**
   * 정렬 변경을 처리하는 함수
   * @param sort 새로운 정렬 방식
   */
  const handleSortChange = (sort: string) => {
    loadProducts(0, sort); // 정렬 변경 시 첫 페이지부터 로드
  };

  /**
   * 에러 발생 시 현재 페이지를 다시 로드하는 재시도 함수
   */
  const retry = () => {
    loadProducts(currentPage);
  };

  // 컴포넌트 마운트 시 초기 데이터 로드 (첫 번째 페이지)
  useEffect(() => {
    loadProducts(0);
  }, []);

  // URL이 변경될 때마다 상품 목록 다시 로드
  useEffect(() => {
    loadProducts(0);
  }, [location.search]);

  // 상품 목록 관련 모든 상태와 함수를 반환
  return {
    products, // 상품 목록 데이터
    loading, // 로딩 상태
    error, // 에러 메시지
    currentPage, // 현재 페이지 번호
    totalPages, // 전체 페이지 수
    currentSort, // 현재 정렬 방식
    loadProducts, // 상품 로드 함수
    handlePageChange, // 페이지 변경 처리 함수
    handleSortChange, // 정렬 변경 처리 함수
    retry, // 재시도 함수
  };
};
