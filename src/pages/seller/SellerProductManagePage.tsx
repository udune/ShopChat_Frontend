import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ProductService } from "../../api/productService";
import {
  ProductListItem,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  ProductImageRequest,
  ProductOptionRequest,
  ColorType,
  SizeType,
  COLOR_LABELS,
  SIZE_LABELS,
} from "../../types/products";
import { Container, Header, Title } from "../products/Lists.styles";
import styled from "styled-components";
import { toUrl } from "utils/common/images";
import Warning from "../../components/modal/Warning";

// 스타일 컴포넌트들
const ManagementContainer = styled(Container)`
  padding-top: 80px; // Header 높이만큼 여백 추가
`;

const ActionButton = styled.button<{
  variant?: "primary" | "danger" | "secondary";
}>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid;
  font-weight: 500;

  ${(props) =>
    props.variant === "primary" &&
    `
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
    
    &:hover {
      background: #2563eb;
      border-color: #2563eb;
    }
  `}

  ${(props) =>
    props.variant === "danger" &&
    `
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    
    &:hover {
      background: #dc2626;
      border-color: #dc2626;
    }
  `}
  
  ${(props) =>
    props.variant === "secondary" &&
    `
    background: white;
    color: #374151;
    border-color: #d1d5db;
    
    &:hover {
      background: #f3f4f6;
      border-color: #9ca3af;
    }
  `}
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableContainer = styled(Card)`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8fafc;
`;

const TableHeaderCell = styled.th`
  padding: 12px 16px;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #f1f5f9;

  &:hover {
    background: #f8fafc;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  vertical-align: middle;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProductImage = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ProductDetails = styled.div`
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.25;
`;

const ProductId = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const PriceInfo = styled.div`
  text-align: right;
`;

const Price = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const DiscountPrice = styled.div`
  font-size: 0.75rem;
  color: #ef4444;
  margin-top: 2px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const Modal = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`;

const RequiredLabel = styled(Label)`
  &:after {
    content: " *";
    color: #ef4444;
  }
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

const ImageCard = styled.div<{ $isMain?: boolean }>`
  border: 2px solid ${(props) => (props.$isMain ? "#3b82f6" : "#e5e7eb")};
  border-radius: 8px;
  padding: 16px;
  background: ${(props) => (props.$isMain ? "#eff6ff" : "#f9fafb")};
  transition: border-color 0.2s ease;
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 120px;
  border: 2px dashed #d1d5db;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: white;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 8px;

  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const ImageTypeRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 8px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`;

const OptionCard = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
  margin-bottom: 12px;
`;

const OptionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const OptionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
`;

const RemoveButton = styled.button`
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    color: #dc2626;
    background: #fee2e2;
  }
`;

const AddButton = styled(ActionButton)`
  align-self: flex-start;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f1f5f9;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 16px;
  color: #6b7280;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  color: #d1d5db;
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  color: #6b7280;

  i {
    margin-right: 8px;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
`;

// 페이지네이션 스타일
const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 0 16px;
`;

const PaginationInfo = styled.div`
  color: #6b7280;
  font-size: 0.875rem;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const PaginationButton = styled.button<{
  $active?: boolean;
  $disabled?: boolean;
}>`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: ${(props) => (props.$active ? "#3b82f6" : "white")};
  color: ${(props) => (props.$active ? "white" : "#374151")};
  font-size: 0.875rem;
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? "#2563eb" : "#f3f4f6")};
    border-color: ${(props) => (props.$active ? "#2563eb" : "#9ca3af")};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const PageNumbers = styled.div`
  display: flex;
  gap: 4px;
`;

// 상품 등록/수정 모달 컴포넌트
interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: CreateProductRequest) => void;
  editProduct?: ProductListItem | null;
  categories: Category[];
  isSaving?: boolean;
}

const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editProduct,
  categories,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: "",
    price: 0,
    categoryId: categories[0]?.categoryId || 1,
    description: "",
    discountType: "NONE",
    discountValue: 0,
    images: [{ url: "", isMain: true, displayOrder: 1, type: "MAIN" }],
    options: [{ gender: "UNISEX", color: "BLACK", size: "SIZE_260", stock: 0 }],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 사용된 옵션 조합을 추적
  const getUsedCombinations = (): string[] => {
    return formData.options.map(
      (option) => `${option.gender}-${option.color}-${option.size}`
    );
  };

  // 옵션이 이미 사용되었는지 확인
  const isOptionUsed = (
    gender: string,
    color: ColorType,
    size: SizeType,
    excludeIndex?: number
  ): boolean => {
    const combination = `${gender}-${color}-${size}`;
    return formData.options.some(
      (option, index) =>
        index !== excludeIndex &&
        `${option.gender}-${option.color}-${option.size}` === combination
    );
  };

  // 수정 모드일 때 폼 데이터 초기화
  useEffect(() => {
    const loadProductDetail = async () => {
      if (editProduct) {
        try {
          // 상품 상세 정보 로드
          const productDetail = await ProductService.getProduct(editProduct.productId);
          
          // 이미지 정보 구성
          const images: ProductImageRequest[] = productDetail.images.map((img, index) => ({
            url: img.url,
            isMain: index === 0 || img.type === "MAIN",
            displayOrder: index + 1,
            type: img.type as "MAIN" | "DETAIL",
            imageId: img.imageId
          }));

          // 첫 번째 이미지가 없으면 기본 이미지 추가
          if (images.length === 0) {
            images.push({
              url: productDetail.images.length > 0 ? productDetail.images[0].url : "",
              isMain: true,
              displayOrder: 1,
              type: "MAIN" as "MAIN" | "DETAIL",
              imageId: productDetail.images.length > 0 ? productDetail.images[0].imageId : undefined
            });
          }

          // 옵션 정보 구성 - 사이즈 값을 SIZE_ 접두어 형태로 변환
          const options: ProductOptionRequest[] = productDetail.options.map(option => ({
            optionId: option.optionId,
            gender: option.gender,
            color: option.color as ColorType,
            size: `SIZE_${option.size}` as SizeType,
            stock: option.stock
          }));

          // 할인 타입 변환
          let discountType: "RATE_DISCOUNT" | "FIXED_DISCOUNT" | "NONE" = "NONE";
          if (productDetail.discountType === "RATE_DISCOUNT") {
            discountType = "RATE_DISCOUNT";
          } else if (productDetail.discountType === "FIXED_DISCOUNT") {
            discountType = "FIXED_DISCOUNT";
          }

          setFormData({
            name: productDetail.name,
            price: productDetail.price,
            categoryId: productDetail.categoryType ? 
              categories.find(cat => cat.type === productDetail.categoryType)?.categoryId || categories[0]?.categoryId || 1 :
              categories[0]?.categoryId || 1,
            description: productDetail.description,
            discountType: discountType,
            discountValue: productDetail.discountValue || 0,
            images: images,
            options: options.length > 0 ? options : [
              { gender: "UNISEX", color: "BLACK", size: "SIZE_260", stock: 0 }
            ],
          });
        } catch (error) {
          console.error("상품 상세 정보 로드 실패:", error);
          // 오류 시 기본값으로 설정
          setFormData({
            name: editProduct.name,
            price: editProduct.price,
            categoryId: categories[0]?.categoryId || 1,
            description: "",
            discountType: "NONE",
            discountValue: 0,
            images: [
              {
                url: editProduct.mainImageUrl,
                isMain: true,
                displayOrder: 1,
                type: "MAIN",
              },
            ],
            options: [
              { gender: "UNISEX", color: "BLACK", size: "SIZE_260", stock: 10 },
            ],
          });
        }
      } else {
        // 새 상품 등록 모드
        setFormData({
          name: "",
          price: 0,
          categoryId: categories[0]?.categoryId || 1,
          description: "",
          discountType: "NONE",
          discountValue: 0,
          images: [{ url: "", isMain: true, displayOrder: 1, type: "MAIN" }],
          options: [
            { gender: "UNISEX", color: "BLACK", size: "SIZE_260", stock: 0 },
          ],
        });
      }
      setErrors({});
    };

    loadProductDetail();
  }, [editProduct, categories]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "상품명을 입력해주세요.";
    if (formData.price < 1000)
      newErrors.price = "가격은 1000원 이상이어야 합니다.";
    if (!formData.description.trim())
      newErrors.description = "상품 설명을 입력해주세요.";

    // 이미지 검증 로직 수정
    const validImages = formData.images.filter(img => img.file || img.url);
    if (validImages.length === 0) {
      newErrors.images = "최소 1개의 이미지가 필요합니다.";
    } else {
      // 유효한 이미지 중에서 메인 이미지 체크
      if (!validImages.some((img) => img.isMain)) {
        newErrors.mainImage = "메인 이미지를 선택해주세요.";
      }
    }

    if (formData.options.length === 0)
      newErrors.options = "최소 1개의 옵션이 필요합니다.";

    // 옵션 검증
    formData.options.forEach((option, index) => {
      if (option.stock < 0)
        newErrors[`option-${index}-stock`] = "재고는 0 이상이어야 합니다.";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleFileSelect = (index: number, file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const updatedImages = [...formData.images];
        updatedImages[index] = {
          ...updatedImages[index],
          url: e.target?.result as string,
          file: file,
        };
        setFormData({ ...formData, images: updatedImages });
      };
      reader.readAsDataURL(file);
    }
  };

  const addImage = () => {
    const newDisplayOrder =
      Math.max(...formData.images.map((img) => img.displayOrder)) + 1;
    const newImages: ProductImageRequest[] = [
      ...formData.images,
      {
        url: "",
        isMain: false,
        displayOrder: newDisplayOrder,
        type: "DETAIL" as "MAIN" | "DETAIL",
      },
    ];
    
    // 첫 번째 이미지는 항상 메인으로 설정
    if (newImages.length > 0) {
      newImages[0].isMain = true;
      newImages.slice(1).forEach(img => img.isMain = false);
    }
    
    setFormData({ ...formData, images: newImages });
  };

  const updateImage = (
    index: number,
    field: keyof ProductImageRequest,
    value: any
  ) => {
    const updatedImages = [...formData.images];

    // 메인 이미지 설정 시 다른 이미지들의 메인 상태 해제
    if (field === "isMain" && value === true) {
      updatedImages.forEach((img, i) => {
        if (i !== index) img.isMain = false;
      });
    }

    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setFormData({ ...formData, images: updatedImages });
  };

  const removeImage = (index: number) => {
    if (formData.images.length > 1) {
      const updatedImages = formData.images.filter((_, i) => i !== index);

      // 첫 번째 이미지는 항상 메인으로 설정
      if (updatedImages.length > 0) {
        updatedImages[0].isMain = true;
        updatedImages.slice(1).forEach(img => img.isMain = false);
      }

      setFormData({ ...formData, images: updatedImages });
    }
  };

  const addOption = () => {
    // 사용 가능한 조합 찾기
    const usedCombinations = getUsedCombinations();
    const genders: ("MEN" | "WOMEN" | "UNISEX")[] = ["MEN", "WOMEN", "UNISEX"];
    const colors = Object.keys(COLOR_LABELS) as ColorType[];
    const sizes = Object.keys(SIZE_LABELS) as SizeType[];

    let availableOption = null;

    for (const gender of genders) {
      for (const color of colors) {
        for (const size of sizes) {
          const combination = `${gender}-${color}-${size}`;
          if (!usedCombinations.includes(combination)) {
            availableOption = { gender, color, size, stock: 0 };
            break;
          }
        }
        if (availableOption) break;
      }
      if (availableOption) break;
    }

    if (availableOption) {
      setFormData({
        ...formData,
        options: [...formData.options, availableOption],
      });
    } else {
      setWarningMessage("더 이상 추가할 수 있는 옵션 조합이 없습니다.");
      setWarningOpen(true);
    }
  };

  // 실시간 옵션 중복 검증
  const validateOptionCombination = useCallback((newOption: ProductOptionRequest, excludeIndex?: number) => {
    const duplicateExists = formData.options.some((option, index) =>
      index !== excludeIndex &&
      option.gender === newOption.gender &&
      option.size === newOption.size &&
      option.color === newOption.color
    );

    if (duplicateExists) {
      setWarningMessage("이미 존재하는 옵션 조합입니다.");
      setWarningOpen(true);
      return false;
    }
    return true;
  }, [formData.options]);

  const updateOption = (
    index: number,
    field: keyof ProductOptionRequest,
    value: any
  ) => {
    const updatedOptions = [...formData.options];
    const newOption = { ...updatedOptions[index], [field]: value };
    
    // 실시간 중복 검증
    if (!validateOptionCombination(newOption, index)) {
      return; // 중복이면 업데이트하지 않음
    }
    
    updatedOptions[index] = newOption;
    setFormData({ ...formData, options: updatedOptions });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 1) {
      const updatedOptions = formData.options.filter((_, i) => i !== index);
      setFormData({ ...formData, options: updatedOptions });
    }
  };

  // 사용 가능한 옵션 필터링
  const getAvailableOptions = (
    currentIndex: number,
    field: "gender" | "color" | "size"
  ) => {
    const currentOption = formData.options[currentIndex];

    if (field === "gender") {
      return ["MEN", "WOMEN", "UNISEX"].filter(
        (gender) =>
          !isOptionUsed(
            gender,
            currentOption.color,
            currentOption.size,
            currentIndex
          )
      );
    } else if (field === "color") {
      return Object.keys(COLOR_LABELS).filter(
        (color) =>
          !isOptionUsed(
            currentOption.gender,
            color as ColorType,
            currentOption.size,
            currentIndex
          )
      );
    } else {
      // size
      return Object.keys(SIZE_LABELS).filter(
        (size) =>
          !isOptionUsed(
            currentOption.gender,
            currentOption.color,
            size as SizeType,
            currentIndex
          )
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>{editProduct ? "상품 수정" : "상품 등록"}</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <Form onSubmit={handleSubmit}>
            {/* 기본 정보 */}
            <FormSection>
              <SectionTitle>기본 정보</SectionTitle>
              <FormRow>
                <FormGroup>
                  <RequiredLabel>상품명</RequiredLabel>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="상품명을 입력하세요"
                  />
                  {errors.name && <ErrorText>{errors.name}</ErrorText>}
                </FormGroup>

                <FormGroup>
                  <RequiredLabel>가격 (원)</RequiredLabel>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    min="1000"
                    placeholder="1000"
                  />
                  {errors.price && <ErrorText>{errors.price}</ErrorText>}
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <RequiredLabel>카테고리</RequiredLabel>
                  <Select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        categoryId: Number(e.target.value),
                      })
                    }
                  >
                    {categories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryId}
                      >
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </FormGroup>

                <FormGroup>
                  <Label>할인 타입</Label>
                  <Select
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as
                          | "RATE_DISCOUNT"
                          | "FIXED_DISCOUNT"
                          | "NONE",
                      })
                    }
                  >
                    <option value="NONE">없음</option>
                    <option value="RATE_DISCOUNT">퍼센트 할인</option>
                    <option value="FIXED_DISCOUNT">금액 할인</option>
                  </Select>
                </FormGroup>
              </FormRow>

              {formData.discountType !== "NONE" && (
                <FormGroup>
                  <Label>할인 값</Label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountValue: Number(e.target.value),
                      })
                    }
                    min="0"
                    placeholder={
                      formData.discountType === "RATE_DISCOUNT" ? "10" : "5000"
                    }
                  />
                </FormGroup>
              )}

              <FormGroup>
                <RequiredLabel>상품 설명</RequiredLabel>
                <TextArea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                />
                {errors.description && (
                  <ErrorText>{errors.description}</ErrorText>
                )}
              </FormGroup>
            </FormSection>

            {/* 이미지 관리 */}
            <FormSection>
              <SectionTitle>상품 이미지</SectionTitle>
              <ImageGrid>
                {formData.images.map((image, index) => (
                  <ImageCard key={index} $isMain={image.isMain}>
                    <ImagePreview>
                      {image.url ? (
                        <img
                          src={toUrl(image.url)}
                          alt={`상품 이미지 ${index + 1}`}
                        />
                      ) : (
                        <div style={{ color: "#9ca3af", textAlign: "center" }}>
                          <i
                            className="fas fa-image"
                            style={{ fontSize: "2rem", marginBottom: "8px" }}
                          ></i>
                          <div>이미지를 선택하세요</div>
                        </div>
                      )}
                    </ImagePreview>

                    <FileInput
                      ref={(el) => {
                        fileInputRefs.current[index] = el;
                      }}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(index, file);
                      }}
                    />

                    <FileButton
                      type="button"
                      onClick={() => fileInputRefs.current[index]?.click()}
                    >
                      <i
                        className="fas fa-upload"
                        style={{ marginRight: "8px" }}
                      ></i>
                      이미지 선택
                    </FileButton>

                    <ImageTypeRow>
                      <RadioGroup>
                        <RadioLabel>
                          <input
                            type="radio"
                            name={`image-type-${index}`}
                            checked={image.type === "MAIN"}
                            onChange={() => updateImage(index, "type", "MAIN")}
                          />
                          메인 이미지
                        </RadioLabel>
                        <RadioLabel>
                          <input
                            type="radio"
                            name={`image-type-${index}`}
                            checked={image.type === "DETAIL"}
                            onChange={() =>
                              updateImage(index, "type", "DETAIL")
                            }
                          />
                          디테일 이미지
                        </RadioLabel>
                      </RadioGroup>

                      {formData.images.length > 1 && (
                        <RemoveButton
                          type="button"
                          onClick={() => removeImage(index)}
                        >
                          <i className="fas fa-times"></i>
                        </RemoveButton>
                      )}
                    </ImageTypeRow>

                  </ImageCard>
                ))}
              </ImageGrid>

              <AddButton type="button" variant="secondary" onClick={addImage}>
                <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>
                이미지 추가
              </AddButton>
              {errors.images && <ErrorText>{errors.images}</ErrorText>}
              {errors.mainImage && <ErrorText>{errors.mainImage}</ErrorText>}
            </FormSection>

            {/* 옵션 관리 */}
            <FormSection>
              <SectionTitle>상품 옵션</SectionTitle>
              {formData.options.map((option, index) => (
                <OptionCard key={index}>
                  <OptionHeader>
                    <Label>옵션 {index + 1}</Label>
                    {formData.options.length > 1 && (
                      <RemoveButton
                        type="button"
                        onClick={() => removeOption(index)}
                      >
                        <i className="fas fa-times"></i>
                      </RemoveButton>
                    )}
                  </OptionHeader>

                  <OptionGrid>
                    <FormGroup>
                      <Label>성별</Label>
                      <Select
                        value={option.gender}
                        onChange={(e) =>
                          updateOption(index, "gender", e.target.value)
                        }
                      >
                        {getAvailableOptions(index, "gender").map((gender) => (
                          <option key={gender} value={gender}>
                            {gender === "MEN"
                              ? "남성"
                              : gender === "WOMEN"
                              ? "여성"
                              : "공용"}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>색상</Label>
                      <Select
                        value={option.color}
                        onChange={(e) =>
                          updateOption(index, "color", e.target.value)
                        }
                      >
                        {getAvailableOptions(index, "color").map((color) => (
                          <option key={color} value={color}>
                            {COLOR_LABELS[color as ColorType]}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>사이즈</Label>
                      <Select
                        value={option.size}
                        onChange={(e) =>
                          updateOption(index, "size", e.target.value)
                        }
                      >
                        {getAvailableOptions(index, "size").map((size) => (
                          <option key={size} value={size}>
                            {SIZE_LABELS[size as SizeType]}
                          </option>
                        ))}
                      </Select>
                    </FormGroup>

                    <FormGroup>
                      <Label>재고 수량</Label>
                      <Input
                        type="number"
                        value={option.stock}
                        onChange={(e) =>
                          updateOption(index, "stock", Number(e.target.value))
                        }
                        min="0"
                        placeholder="0"
                      />
                      {errors[`option-${index}-stock`] && (
                        <ErrorText>{errors[`option-${index}-stock`]}</ErrorText>
                      )}
                    </FormGroup>
                  </OptionGrid>
                </OptionCard>
              ))}

              <AddButton type="button" variant="secondary" onClick={addOption}>
                <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>
                옵션 추가
              </AddButton>
              {errors.options && <ErrorText>{errors.options}</ErrorText>}
            </FormSection>
          </Form>
        </ModalBody>

        <ModalFooter>
          <ActionButton type="button" variant="secondary" onClick={onClose}>
            취소
          </ActionButton>
          <ActionButton 
            type="submit" 
            variant="primary" 
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner" style={{ marginRight: "8px" }}></i>
                {editProduct ? "수정 중..." : "등록 중..."}
              </>
            ) : (
              editProduct ? "수정" : "등록"
            )}
          </ActionButton>
        </ModalFooter>
      </ModalContent>
      
      {/* Warning Modal */}
      <Warning
        open={warningOpen}
        title="알림"
        message={warningMessage}
        onConfirm={() => setWarningOpen(false)}
        onCancel={() => setWarningOpen(false)}
      />
    </Modal>
  );
};

// 메인 상품 관리 페이지 컴포넌트
const SellerProductManagePage: React.FC = () => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductListItem | null>(null);
  const [deleteWarningOpen, setDeleteWarningOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 20;

  // 상품 목록 로드
  const loadProducts = useCallback(async (page: number = 0) => {
    try {
      console.log("상품 목록 로드 시작:", { page, pageSize });
      setLoading(true);
      const response = await ProductService.getSellerProducts(page, pageSize);
      console.log("상품 목록 로드 성공:", response);
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("상품 목록 로드 실패:", error);
      console.error("에러 상세:", error.response?.data);
      
      // 인증 에러인 경우
      if (error.response?.status === 401) {
        setErrorMessage("로그인이 필요합니다. 다시 로그인해주세요.");
      } else if (error.response?.status === 403) {
        setErrorMessage("판매자 권한이 필요합니다.");
      } else {
        setErrorMessage("상품 목록을 불러오는데 실패했습니다. 다시 시도해주세요.");
      }
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  // 카테고리 목록 로드
  const loadCategories = useCallback(async () => {
    try {
      console.log("카테고리 로드 시작");
      const categoryList = await ProductService.getCategories();
      console.log("카테고리 로드 성공:", categoryList);
      setCategories(categoryList);
    } catch (error: any) {
      console.error("카테고리 로드 실패:", error);
      console.error("에러 상세:", error.response?.data);
      setErrorMessage("카테고리를 불러오는데 실패했습니다.");
      setShowErrorModal(true);
      // 기본 카테고리 설정
      setCategories([
        { categoryId: 1, type: "FASHION", name: "패션" },
        { categoryId: 2, type: "ELECTRONICS", name: "전자제품" },
        { categoryId: 3, type: "SPORTS", name: "스포츠" },
      ]);
    }
  }, []);

  useEffect(() => {
    // 인증 상태 확인
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    
    console.log("인증 상태 확인:", { 
      hasToken: !!token, 
      userType,
      token: token ? token.substring(0, 20) + "..." : null 
    });
    
    if (!token) {
      setErrorMessage("로그인이 필요합니다. 다시 로그인해주세요.");
      setShowErrorModal(true);
      return;
    }
    
    if (userType !== "seller") {
      setErrorMessage("판매자 권한이 필요합니다.");
      setShowErrorModal(true);
      return;
    }
    
    loadProducts();
    loadCategories();
  }, [loadProducts, loadCategories]);

  // 페이지네이션 핸들러
  const handlePageChange = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      loadProducts(page);
    }
  }, [totalPages, loadProducts]);

  // 페이지 번호 생성 (메모이제이션)
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;

    let start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages - 1, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(0, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  // 상품 등록/수정 (저장 상태 관리 및 알림)
  const handleSaveProduct = useCallback(async (productData: CreateProductRequest) => {
    if (isSaving) return; // 중복 클릭 방지
    try {
      setIsSaving(true);

      if (editProduct) {
        // 수정
        const updateData: UpdateProductRequest = {
          name: productData.name,
          price: productData.price,
          categoryId: productData.categoryId,
          description: productData.description,
          discountType: productData.discountType,
          discountValue: productData.discountValue,
          images: productData.images,
          options: productData.options,
        };
        await ProductService.updateProduct(editProduct.productId, updateData);
        setSuccessMessage("상품이 성공적으로 수정되었습니다.");
      } else {
        // 등록
        await ProductService.createProduct(productData);
        setSuccessMessage("상품이 성공적으로 등록되었습니다.");
      }

      setIsModalOpen(false);
      setEditProduct(null);
      loadProducts(currentPage); // 현재 페이지 유지하며 목록 새로고침
      setShowSuccessModal(true);
    } catch (error) {
      console.error("상품 저장 실패:", error);
      setErrorMessage("상품 저장에 실패했습니다. 다시 시도해주세요.");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  }, [editProduct, currentPage, loadProducts, isSaving]);

  // 상품 삭제 확인 다이얼로그 열기
  const handleDeleteProduct = useCallback((productId: number) => {
    setProductToDelete(productId);
    setDeleteWarningOpen(true);
  }, []);

  // 상품 삭제 실행
  const confirmDeleteProduct = useCallback(async () => {
    if (productToDelete) {
      try {
        await ProductService.deleteProduct(productToDelete);
        setSuccessMessage("상품이 성공적으로 삭제되었습니다.");
        loadProducts(currentPage); // 현재 페이지 유지하며 목록 새로고침
        setDeleteWarningOpen(false);
        setProductToDelete(null);
        setShowSuccessModal(true);
      } catch (error) {
        console.error("상품 삭제 실패:", error);
        setErrorMessage("상품 삭제에 실패했습니다. 다시 시도해주세요.");
        setShowErrorModal(true);
      }
    }
  }, [productToDelete, currentPage, loadProducts]);

  // 상품 삭제 취소
  const cancelDeleteProduct = useCallback(() => {
    setDeleteWarningOpen(false);
    setProductToDelete(null);
  }, []);

  // 상품 수정 모달 열기
  const handleEditProduct = useCallback((product: ProductListItem) => {
    setEditProduct(product);
    setIsModalOpen(true);
  }, []);

  // 새 상품 등록 모달 열기
  const handleNewProduct = useCallback(() => {
    setEditProduct(null);
    setIsModalOpen(true);
  }, []);

  return (
    <ManagementContainer>
      {/* 헤더 */}
      <Header>
        <div>
          <Title>상품 관리</Title>
          <p style={{ color: "#6b7280", marginTop: "8px" }}>
            등록된 상품을 관리하고 새로운 상품을 추가하세요
          </p>
        </div>
        <ActionButton variant="primary" onClick={handleNewProduct}>
          <i className="fas fa-plus" style={{ marginRight: "8px" }}></i>
          상품 등록
        </ActionButton>
      </Header>

      {/* 상품 목록 */}
      {loading ? (
        <LoadingState>
          <i className="fas fa-spinner fa-spin"></i>
          상품 목록을 불러오는 중...
        </LoadingState>
      ) : (
        <>
          <TableContainer>
            {products.length === 0 ? (
              <EmptyState>
                <EmptyIcon>
                  <i className="fas fa-box-open"></i>
                </EmptyIcon>
                <div
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: 600,
                    marginBottom: "8px",
                  }}
                >
                  등록된 상품이 없습니다
                </div>
                <div style={{ marginBottom: "16px" }}>
                  첫 번째 상품을 등록해보세요
                </div>
              </EmptyState>
            ) : (
              <Table>
                <TableHeader>
                  <tr>
                    <TableHeaderCell>상품 정보</TableHeaderCell>
                    <TableHeaderCell>가격</TableHeaderCell>
                    <TableHeaderCell>스토어</TableHeaderCell>
                    <TableHeaderCell>관심</TableHeaderCell>
                    <TableHeaderCell style={{ textAlign: "right" }}>
                      관리
                    </TableHeaderCell>
                  </tr>
                </TableHeader>
                <tbody>
                  {products.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell>
                        <ProductInfo>
                          <ProductImage
                            src={toUrl(product.mainImageUrl)}
                            alt={product.name}
                            onError={(e) => {
                              e.currentTarget.src = toUrl(
                                "images/common/no-image.png"
                              );
                            }}
                          />
                          <ProductDetails>
                            <ProductName>{product.name}</ProductName>
                            <ProductId>ID: {product.productId}</ProductId>
                          </ProductDetails>
                        </ProductInfo>
                      </TableCell>
                      <TableCell>
                        <PriceInfo>
                          <Price>₩{product.price.toLocaleString()}</Price>
                          {product.discountPrice !== product.price && (
                            <DiscountPrice>
                              할인: ₩{product.discountPrice.toLocaleString()}
                            </DiscountPrice>
                          )}
                        </PriceInfo>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div
                            style={{ fontSize: "0.875rem", color: "#1f2937" }}
                          >
                            {product.storeName}
                          </div>
                          <div
                            style={{ fontSize: "0.75rem", color: "#6b7280" }}
                          >
                            ID: {product.storeId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <i
                            className="fas fa-heart"
                            style={{ color: "#ef4444", fontSize: "0.875rem" }}
                          ></i>
                          <span style={{ fontSize: "0.875rem" }}>
                            {product.wishNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionButtons>
                          <ActionButton
                            variant="secondary"
                            onClick={() => handleEditProduct(product)}
                          >
                            <i className="fas fa-edit"></i>
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() => handleDeleteProduct(product.productId)}
                          >
                            <i className="fas fa-trash"></i>
                          </ActionButton>
                        </ActionButtons>
                      </TableCell>
                    </TableRow>
                  ))}
                </tbody>
              </Table>
            )}
          </TableContainer>

          {/* 페이지네이션 */}
          {products.length > 0 && totalPages > 1 && (
            <PaginationContainer>
              <PaginationInfo>
                총 {totalElements}개 상품 중 {currentPage * pageSize + 1}-
                {Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
              </PaginationInfo>
              <PaginationButtons>
                <PaginationButton
                  $disabled={currentPage === 0}
                  onClick={() => handlePageChange(0)}
                  disabled={currentPage === 0}
                >
                  <i className="fas fa-angle-double-left"></i>
                </PaginationButton>
                <PaginationButton
                  $disabled={currentPage === 0}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                >
                  <i className="fas fa-angle-left"></i>
                </PaginationButton>

                <PageNumbers>
                  {pageNumbers.map((page) => (
                    <PaginationButton
                      key={page}
                      $active={page === currentPage}
                      onClick={() => handlePageChange(page)}
                    >
                      {page + 1}
                    </PaginationButton>
                  ))}
                </PageNumbers>

                <PaginationButton
                  $disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  <i className="fas fa-angle-right"></i>
                </PaginationButton>
                <PaginationButton
                  $disabled={currentPage === totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  <i className="fas fa-angle-double-right"></i>
                </PaginationButton>
              </PaginationButtons>
            </PaginationContainer>
          )}
        </>
      )}

      {/* 상품 등록/수정 모달 */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditProduct(null);
        }}
        onSave={handleSaveProduct}
        editProduct={editProduct}
        categories={categories}
      />

      {/* 상품 삭제 확인 모달 */}
      <Warning
        open={deleteWarningOpen}
        title="상품 삭제"
        message="정말로 이 상품을 삭제하시겠습니까? 삭제된 상품은 복구할 수 없습니다."
        onConfirm={confirmDeleteProduct}
        onCancel={cancelDeleteProduct}
      />

      {/* 성공 알림 모달 */}
      <Warning
        open={showSuccessModal}
        title="성공"
        message={successMessage}
        onConfirm={() => setShowSuccessModal(false)}
        onCancel={() => setShowSuccessModal(false)}
      />

      {/* 오류 알림 모달 */}
      <Warning
        open={showErrorModal}
        title="오류"
        message={errorMessage}
        onConfirm={() => setShowErrorModal(false)}
        onCancel={() => setShowErrorModal(false)}
      />
    </ManagementContainer>
  );
};

export default SellerProductManagePage;
