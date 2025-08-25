import { useState, useRef, useEffect, FC } from "react";
import * as echarts from "echarts";
import { useNavigate } from "react-router-dom";

interface UserType {
  id: number;
  profileImage: string;
  name: string;
  email: string;
  phone: string;
  memberType: "일반" | "판매자";
  joinDate: string;
  lastLogin: string;
  status: "활성" | "정지";
  memo?: string;
}

const UserManagePage: FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("전체");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [memoText, setMemoText] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  // 더미 사용자 데이터
  const users: UserType[] = [
    {
      id: 1,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20Asian%20woman%20with%20short%20black%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=1&orientation=squarish",
      name: "김민지",
      email: "minji.kim@example.com",
      phone: "010-1234-5678",
      memberType: "일반",
      joinDate: "2025-01-15",
      lastLogin: "2025-06-05",
      status: "활성",
      memo: "신규 가입자, 문의가 많음",
    },
    {
      id: 2,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20Asian%20man%20with%20glasses%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=2&orientation=squarish",
      name: "이준호",
      email: "junho.lee@example.com",
      phone: "010-2345-6789",
      memberType: "판매자",
      joinDate: "2024-11-20",
      lastLogin: "2025-06-06",
      status: "활성",
      memo: "신뢰할 수 있는 판매자",
    },
    {
      id: 3,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20middle-aged%20Asian%20woman%20with%20long%20black%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=3&orientation=squarish",
      name: "박수진",
      email: "sujin.park@example.com",
      phone: "010-3456-7890",
      memberType: "일반",
      joinDate: "2025-03-05",
      lastLogin: "2025-06-01",
      status: "정지",
      memo: "부적절한 행위로 인한 정지",
    },
    {
      id: 4,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20Asian%20man%20with%20styled%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=4&orientation=squarish",
      name: "최동현",
      email: "donghyun.choi@example.com",
      phone: "010-4567-8901",
      memberType: "판매자",
      joinDate: "2024-09-10",
      lastLogin: "2025-06-07",
      status: "활성",
    },
    {
      id: 5,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20Asian%20woman%20with%20long%20brown%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=5&orientation=squarish",
      name: "정유진",
      email: "yujin.jung@example.com",
      phone: "010-5678-9012",
      memberType: "일반",
      joinDate: "2025-02-18",
      lastLogin: "2025-05-25",
      status: "활성",
    },
    {
      id: 6,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20middle-aged%20Asian%20man%20with%20short%20gray%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=6&orientation=squarish",
      name: "강현우",
      email: "hyunwoo.kang@example.com",
      phone: "010-6789-0123",
      memberType: "일반",
      joinDate: "2024-12-05",
      lastLogin: "2025-06-04",
      status: "정지",
      memo: "스팸 메시지 전송으로 인한 정지",
    },
    {
      id: 7,
      profileImage:
        "https://readdy.ai/api/search-image?query=professional%20portrait%20photo%20of%20a%20young%20Asian%20woman%20with%20tied%20back%20hair%2C%20simple%20background%2C%20high%20quality%20professional%20headshot%2C%20minimalist%20style%2C%20soft%20lighting%2C%20neutral%20expression&width=60&height=60&seq=7&orientation=squarish",
      name: "윤서연",
      email: "seoyeon.yoon@example.com",
      phone: "010-7890-1234",
      memberType: "판매자",
      joinDate: "2025-04-12",
      lastLogin: "2025-06-07",
      status: "활성",
    },
  ];
  // 필터링된 사용자 목록
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesMemberType =
      memberTypeFilter === "전체" || user.memberType === memberTypeFilter;
    const matchesStatus =
      statusFilter === "전체" || user.status === statusFilter;
    // 날짜 필터링 로직
    let matchesDate = true;
    if (dateRange.start && dateRange.end) {
      const joinDate = new Date(user.joinDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDate = joinDate >= startDate && joinDate <= endDate;
    }
    return matchesSearch && matchesMemberType && matchesStatus && matchesDate;
  });
  // 페이지네이션 로직
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // 전체 선택 토글
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(displayedUsers.map((user) => user.id));
    }
    setAllSelected(!allSelected);
  };
  // 개별 사용자 선택 토글
  const toggleSelectUser = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
      setAllSelected(false);
    } else {
      setSelectedUsers([...selectedUsers, userId]);
      if (selectedUsers.length + 1 === displayedUsers.length) {
        setAllSelected(true);
      }
    }
  };
  // 사용자 상세 정보 모달 열기
  const openDetailModal = (user: UserType) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };
  // 메모 모달 열기
  const openMemoModal = (user: UserType) => {
    setSelectedUser(user);
    setMemoText(user.memo || "");
    setShowMemoModal(true);
  };
  // 메모 저장
  const saveMemo = () => {
    if (selectedUser) {
      // 실제 구현에서는 API 호출
      console.log(`사용자 ${selectedUser.name}의 메모를 "${memoText}"로 저장`);
      setShowMemoModal(false);
      setMemoText("");
    }
  };
  // 사용자 상태 변경 핸들러
  const handleStatusChange = (userId: number, newStatus: "활성" | "정지") => {
    // 실제 구현에서는 API 호출로 상태 변경
    console.log(`사용자 ID ${userId}의 상태를 ${newStatus}로 변경`);
  };
  // 엑셀 다운로드 핸들러
  const handleExcelDownload = () => {
    // 실제 구현에서는 엑셀 파일 생성 및 다운로드 로직
    console.log("사용자 목록 엑셀 다운로드");
  };
  // 사이드바 토글
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  // 사이드바 메뉴 클릭 핸들러들
  const handleDashboardClick = () => navigate("/admin-dashboard");
  const handleUserManageClick = () => navigate("/user-manage");
  const handleProductManageClick = () => navigate("/products");
  const handleStoreManageClick = () => navigate("/store-home");
  const handleReviewManageClick = () => navigate("/admin-dashboard");
  const handleReportManageClick = () => navigate("/report-manage");
  const handleStatsClick = () => navigate("/stats-dashboard");
  const handleSettingsClick = () => navigate("/admin/settings");
  // 관리자 드롭다운 토글
  const toggleAdminDropdown = () => {
    setShowAdminDropdown(!showAdminDropdown);
  };
  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowAdminDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  // 차트 초기화 (회원 유형 분포)
  useEffect(() => {
    if (showDetailModal && selectedUser) {
      const chartDom = document.getElementById("memberTypeChart");
      if (chartDom) {
        const myChart = echarts.init(chartDom);
        const option = {
          animation: false,
          tooltip: {
            trigger: "item",
          },
          legend: {
            top: "5%",
            left: "center",
          },
          series: [
            {
              name: "회원 유형",
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2,
              },
              label: {
                show: false,
                position: "center",
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold",
                },
              },
              labelLine: {
                show: false,
              },
              data: [
                { value: 65, name: "일반 회원" },
                { value: 35, name: "판매자 회원" },
              ],
            },
          ],
        };
        myChart.setOption(option);
      }
    }
  }, [showDetailModal, selectedUser]);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* 메인 콘텐츠 */}
      <div className="flex flex-1 pt-4">
        {/* 사이드바 */}
        <aside
          className={`bg-white shadow-sm fixed left-0 top-16 h-full z-10 transition-all duration-300 ${
            sidebarCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div className="p-4">
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i
                className={`fas ${
                  sidebarCollapsed ? "fa-chevron-right" : "fa-chevron-left"
                }`}
              ></i>
            </button>
          </div>
          <div className="h-full overflow-y-auto py-4">
            <nav className="px-2 space-y-1">
              <button
                onClick={handleDashboardClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-home text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>대시보드</span>}
              </button>
              <button
                onClick={handleUserManageClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md bg-blue-50 text-blue-700 cursor-pointer"
              >
                <i className="fas fa-users text-blue-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>사용자 관리</span>}
              </button>
              <button
                onClick={handleProductManageClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-shopping-bag text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>상품 관리</span>}
              </button>
              <button
                onClick={handleStoreManageClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-store text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>가게 관리</span>}
              </button>
              <button
                onClick={handleReviewManageClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-star text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>리뷰 관리</span>}
              </button>
              <button
                onClick={handleReportManageClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-flag text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>신고 관리</span>}
              </button>
              <button
                onClick={handleStatsClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-chart-bar text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>통계 분석</span>}
              </button>
              <button
                onClick={handleSettingsClick}
                className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
              >
                <i className="fas fa-cog text-gray-400 group-hover:text-gray-500 mr-3 text-lg"></i>
                {!sidebarCollapsed && <span>설정</span>}
              </button>
            </nav>
          </div>
        </aside>
        {/* 메인 콘텐츠 영역 */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {/* 페이지 헤더 */}
            <div className="mb-6">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  사용자 관리
                </h1>
                <button
                  onClick={handleExcelDownload}
                  className="ml-auto bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm flex items-center !rounded-button whitespace-nowrap cursor-pointer"
                >
                  <i className="fas fa-file-excel mr-2"></i>
                  엑셀 다운로드
                </button>
              </div>
              <nav className="flex mt-2" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-1 text-sm text-gray-500">
                  <li>
                    <a href="#" className="hover:text-gray-700">
                      홈
                    </a>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-chevron-right text-xs mx-1"></i>
                    <span className="text-gray-700">사용자 관리</span>
                  </li>
                </ol>
              </nav>
            </div>
            {/* 검색 및 필터 영역 */}
            <div className="bg-white shadow rounded-lg mb-6 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                      placeholder="이름, 이메일, 연락처 검색"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="fas fa-search text-gray-400"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <select
                    className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                    value={memberTypeFilter}
                    onChange={(e) => setMemberTypeFilter(e.target.value)}
                  >
                    <option value="전체">회원 유형 (전체)</option>
                    <option value="일반">일반</option>
                    <option value="판매자">판매자</option>
                  </select>
                </div>
                <div>
                  <select
                    className="w-full py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="전체">상태 (전체)</option>
                    <option value="활성">활성</option>
                    <option value="정지">정지</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">가입일자:</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                  <span className="text-sm text-gray-600">~</span>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent text-sm"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-md text-sm font-medium !rounded-button whitespace-nowrap cursor-pointer"
                    onClick={() => {
                      setSearchTerm("");
                      setMemberTypeFilter("전체");
                      setStatusFilter("전체");
                      setDateRange({ start: "", end: "" });
                    }}
                  >
                    필터 초기화
                  </button>
                </div>
              </div>
            </div>
            {/* 사용자 테이블 */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-blue-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                          />
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        회원 정보
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        연락처
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        회원 유형
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        가입일
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        최근 접속일
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        상태
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => toggleSelectUser(user.id)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.profileImage}
                                alt={user.name}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.memberType === "판매자"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {user.memberType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.joinDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.status === "활성"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => openDetailModal(user)}
                              className="text-blue-600 hover:text-blue-900 cursor-pointer"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <div className="relative inline-block text-left">
                              <button
                                className={`text-${
                                  user.status === "활성" ? "red" : "green"
                                }-600 hover:text-${
                                  user.status === "활성" ? "red" : "green"
                                }-900 cursor-pointer`}
                                onClick={() =>
                                  handleStatusChange(
                                    user.id,
                                    user.status === "활성" ? "정지" : "활성"
                                  )
                                }
                              >
                                <i
                                  className={`fas fa-${
                                    user.status === "활성"
                                      ? "ban"
                                      : "check-circle"
                                  }`}
                                ></i>
                              </button>
                            </div>
                            <button
                              onClick={() => openMemoModal(user)}
                              className="text-gray-600 hover:text-gray-900 cursor-pointer"
                            >
                              <i className="fas fa-sticky-note"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 페이지네이션 */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      전체{" "}
                      <span className="font-medium">
                        {filteredUsers.length}
                      </span>{" "}
                      명 중{" "}
                      <span className="font-medium">
                        {(currentPage - 1) * itemsPerPage + 1}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium">
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredUsers.length
                        )}
                      </span>{" "}
                      명 표시
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <i className="fas fa-chevron-left text-xs"></i>
                      </button>
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === index + 1
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          } cursor-pointer`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-500 hover:bg-gray-50 cursor-pointer"
                        }`}
                      >
                        <i className="fas fa-chevron-right text-xs"></i>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* 사용자 상세 정보 모달 */}
      {showDetailModal && selectedUser && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        사용자 상세 정보
                      </h3>
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 기본 정보 */}
                      <div className="bg-white rounded-lg shadow p-4 col-span-1">
                        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
                          기본 정보
                        </h4>
                        <div className="flex flex-col items-center mb-4">
                          <img
                            src={selectedUser.profileImage}
                            alt={selectedUser.name}
                            className="h-24 w-24 rounded-full object-cover"
                          />
                          <div className="mt-2 text-center">
                            <h5 className="text-lg font-medium text-gray-900">
                              {selectedUser.name}
                            </h5>
                            <p className="text-sm text-gray-500">
                              {selectedUser.memberType} 회원
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              이메일:
                            </span>
                            <span className="text-sm text-gray-900">
                              {selectedUser.email}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              연락처:
                            </span>
                            <span className="text-sm text-gray-900">
                              {selectedUser.phone}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              가입일:
                            </span>
                            <span className="text-sm text-gray-900">
                              {selectedUser.joinDate}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">
                              최근 접속일:
                            </span>
                            <span className="text-sm text-gray-900">
                              {selectedUser.lastLogin}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">상태:</span>
                            <span
                              className={`text-sm ${
                                selectedUser.status === "활성"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {selectedUser.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* 주문 내역 */}
                      <div className="bg-white rounded-lg shadow p-4 col-span-1">
                        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
                          주문 내역
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              총 주문 건수
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              12건
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              총 주문 금액
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              ₩1,245,000
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">
                              최근 주문일
                            </span>
                            <span className="text-sm text-gray-600">
                              2025-06-01
                            </span>
                          </div>
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">
                              최근 주문 상품
                            </h5>
                            <div className="space-y-2">
                              <div className="flex items-center p-2 bg-gray-50 rounded">
                                <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                                <div className="ml-2 flex-1">
                                  <p className="text-xs font-medium">
                                    프리미엄 헤드폰
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ₩250,000 | 2025-06-01
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center p-2 bg-gray-50 rounded">
                                <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                                <div className="ml-2 flex-1">
                                  <p className="text-xs font-medium">
                                    스마트 워치
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ₩180,000 | 2025-05-15
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* 커뮤니티 활동 */}
                      <div className="bg-white rounded-lg shadow p-4 col-span-1">
                        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
                          커뮤니티 활동
                        </h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">게시글</span>
                            <span className="text-lg font-bold text-blue-600">
                              8개
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">댓글</span>
                            <span className="text-lg font-bold text-blue-600">
                              24개
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">채팅방</span>
                            <span className="text-lg font-bold text-blue-600">
                              5개
                            </span>
                          </div>
                          <div className="mt-4">
                            <h5 className="text-sm font-medium mb-2">
                              최근 게시글
                            </h5>
                            <div className="space-y-2">
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium truncate">
                                  새로 구매한 헤드폰 사용 후기
                                </p>
                                <p className="text-xs text-gray-500">
                                  2025-06-02 | 조회 56
                                </p>
                              </div>
                              <div className="p-2 bg-gray-50 rounded">
                                <p className="text-xs font-medium truncate">
                                  스마트 워치 추천 부탁드려요
                                </p>
                                <p className="text-xs text-gray-500">
                                  2025-05-10 | 조회 112
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* 통계 차트 */}
                      <div className="bg-white rounded-lg shadow p-4 col-span-1 md:col-span-3">
                        <h4 className="text-md font-medium text-gray-900 mb-4 border-b pb-2">
                          활동 통계
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="text-sm font-medium mb-2 text-center">
                              회원 유형 분포
                            </h5>
                            <div id="memberTypeChart" className="h-64"></div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">
                              최근 접속 기록
                            </h5>
                            <div className="space-y-2 mt-4">
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-xs">2025-06-07</span>
                                <span className="text-xs">10:25:36</span>
                                <span className="text-xs">모바일 앱</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-xs">2025-06-06</span>
                                <span className="text-xs">18:12:05</span>
                                <span className="text-xs">웹 브라우저</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-xs">2025-06-05</span>
                                <span className="text-xs">09:45:22</span>
                                <span className="text-xs">모바일 앱</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-xs">2025-06-04</span>
                                <span className="text-xs">14:33:17</span>
                                <span className="text-xs">웹 브라우저</span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="text-xs">2025-06-03</span>
                                <span className="text-xs">20:18:49</span>
                                <span className="text-xs">모바일 앱</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
                  onClick={() => setShowDetailModal(false)}
                >
                  닫기
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
                  onClick={() => openMemoModal(selectedUser)}
                >
                  메모 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 메모 추가 모달 */}
      {showMemoModal && selectedUser && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        메모 추가 - {selectedUser.name}
                      </h3>
                      <button
                        onClick={() => setShowMemoModal(false)}
                        className="text-gray-400 hover:text-gray-500 cursor-pointer"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="mb-4">
                      <label
                        htmlFor="memo"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        메모 내용
                      </label>
                      <textarea
                        id="memo"
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="사용자에 대한 메모를 입력하세요..."
                        value={memoText}
                        onChange={(e) => setMemoText(e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        이전 메모 기록
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">관리자</span>
                            <span className="text-xs text-gray-500">
                              2025-06-01 14:30
                            </span>
                          </div>
                          <p className="text-sm">
                            최근 문의가 많아 확인 필요함. 주문 관련 이슈 발생.
                          </p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">시스템</span>
                            <span className="text-xs text-gray-500">
                              2025-05-15 09:20
                            </span>
                          </div>
                          <p className="text-sm">
                            비밀번호 재설정 요청 처리 완료.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
                  onClick={saveMemo}
                >
                  저장
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm !rounded-button whitespace-nowrap cursor-pointer"
                  onClick={() => setShowMemoModal(false)}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 푸터 */}
      <footer className="bg-white shadow-inner mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                © 2025 E-Commerce + 커뮤니티 채팅 서비스. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                이용약관
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                개인정보처리방침
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                고객센터
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserManagePage;
