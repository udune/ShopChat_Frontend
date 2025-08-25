import { useState, useEffect, FC } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

interface Report {
  id: number;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  reportedUserName?: string;
  reportedProductId?: number;
  reportedProductName?: string;
  reportType: "USER" | "PRODUCT" | "REVIEW" | "CHAT";
  reason: string;
  description: string;
  status: "PENDING" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  adminComment?: string;
}

const ReportManagePage: FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [adminComment, setAdminComment] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 샘플 데이터
  const sampleReports: Report[] = [
    {
      id: 1,
      reporterId: "user1",
      reporterName: "김철수",
      reportedUserId: "user2",
      reportedUserName: "이영희",
      reportType: "USER",
      reason: "부적절한 언어 사용",
      description:
        "채팅방에서 부적절한 언어를 사용하여 다른 사용자들에게 불편을 주고 있습니다.",
      status: "PENDING",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      reporterId: "user3",
      reporterName: "박민수",
      reportedProductId: 12345,
      reportedProductName: "나이키 운동화",
      reportType: "PRODUCT",
      reason: "허위 정보",
      description: "제품 설명과 실제 제품이 다릅니다. 가짜 제품인 것 같습니다.",
      status: "IN_REVIEW",
      createdAt: "2024-01-14T15:20:00Z",
      updatedAt: "2024-01-14T16:45:00Z",
      adminComment: "제품 검증 중입니다.",
    },
    {
      id: 3,
      reporterId: "user4",
      reporterName: "최지영",
      reportedUserId: "user5",
      reportedUserName: "정수민",
      reportType: "CHAT",
      reason: "스팸 메시지",
      description: "지속적으로 스팸 메시지를 보내고 있습니다.",
      status: "RESOLVED",
      createdAt: "2024-01-13T09:15:00Z",
      updatedAt: "2024-01-13T14:30:00Z",
      adminComment: "사용자에게 경고 조치를 취했습니다.",
    },
    {
      id: 4,
      reporterId: "user6",
      reporterName: "강동원",
      reportedProductId: 67890,
      reportedProductName: "아디다스 티셔츠",
      reportType: "PRODUCT",
      reason: "저작권 침해",
      description: "브랜드 로고를 무단으로 사용한 것 같습니다.",
      status: "REJECTED",
      createdAt: "2024-01-12T11:45:00Z",
      updatedAt: "2024-01-12T13:20:00Z",
      adminComment: "정식 라이센스 제품으로 확인되었습니다.",
    },
  ];

  useEffect(() => {
    // 실제 API 호출 대신 샘플 데이터 사용
    setReports(sampleReports);
    setLoading(false);
  }, []);

  const handleViewDetail = (report: Report) => {
    setSelectedReport(report);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (report: Report) => {
    setSelectedReport(report);
    setNewStatus(report.status);
    setAdminComment(report.adminComment || "");
    setStatusDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport) return;

    try {
      // 실제 API 호출
      // await updateReportStatus(selectedReport.id, newStatus, adminComment);

      // 로컬 상태 업데이트
      setReports((prev) =>
        prev.map((report) =>
          report.id === selectedReport.id
            ? {
                ...report,
                status: newStatus as any,
                adminComment,
                updatedAt: new Date().toISOString(),
              }
            : report
        )
      );

      setStatusDialogOpen(false);
      setSelectedReport(null);
      setNewStatus("");
      setAdminComment("");
    } catch (error) {
      console.error("신고 상태 업데이트 실패:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "IN_REVIEW":
        return "info";
      case "RESOLVED":
        return "success";
      case "REJECTED":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기중";
      case "IN_REVIEW":
        return "검토중";
      case "RESOLVED":
        return "해결됨";
      case "REJECTED":
        return "거부됨";
      default:
        return status;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "USER":
        return "사용자";
      case "PRODUCT":
        return "상품";
      case "REVIEW":
        return "리뷰";
      case "CHAT":
        return "채팅";
      default:
        return type;
    }
  };

  const filteredReports = reports.filter((report) => {
    const statusMatch =
      filterStatus === "ALL" || report.status === filterStatus;
    const typeMatch = filterType === "ALL" || report.reportType === filterType;
    return statusMatch && typeMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR");
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
  const handleStatsClick = () => navigate("/stats-dashboard");
  const handleSettingsClick = () => navigate("/admin/settings");

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <h1
              className="text-2xl font-bold text-blue-400 cursor-pointer"
              onClick={() => navigate("/")}
            >
              FeedShop
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-blue-400">
              <i className="fas fa-bell text-xl"></i>
            </button>
            <div className="relative">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-400">
                <i className="fas fa-user-circle text-xl"></i>
                <span className="hidden md:block">관리자</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 사이드바 */}
      <div
        className={`fixed left-0 top-16 h-full bg-white shadow-lg transition-all duration-300 ${
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

        <nav className="mt-4">
          <div className="px-4 space-y-2">
            <button
              onClick={handleDashboardClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-home text-lg"></i>
              {!sidebarCollapsed && <span>대시보드</span>}
            </button>

            <button
              onClick={handleUserManageClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-user text-lg"></i>
              {!sidebarCollapsed && <span>사용자 관리</span>}
            </button>

            <button
              onClick={handleProductManageClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-box text-lg"></i>
              {!sidebarCollapsed && <span>상품 관리</span>}
            </button>

            <button
              onClick={handleStoreManageClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-store text-lg"></i>
              {!sidebarCollapsed && <span>가게 관리</span>}
            </button>

            <button
              onClick={handleReviewManageClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-star text-lg"></i>
              {!sidebarCollapsed && <span>리뷰 관리</span>}
            </button>

            <button
              onClick={() => navigate("/report-manage")}
              className="w-full flex items-center space-x-3 p-3 text-blue-400 bg-blue-50 rounded-lg"
            >
              <i className="fas fa-flag text-lg"></i>
              {!sidebarCollapsed && <span>신고 관리</span>}
            </button>

            <button
              onClick={handleStatsClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-chart-bar text-lg"></i>
              {!sidebarCollapsed && <span>통계 분석</span>}
            </button>

            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-3 p-3 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <i className="fas fa-cog text-lg"></i>
              {!sidebarCollapsed && <span>설정</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* 메인 콘텐츠 */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <div className="p-6 pt-24">
          <Box sx={{ p: 3 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h4" component="h1">
                신고 관리
              </Typography>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
              >
                새로고침
              </Button>
            </Box>

            {/* 필터 */}
            <Box display="flex" gap={2} mb={3}>
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>상태</InputLabel>
                <Select
                  value={filterStatus}
                  label="상태"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="ALL">전체</MenuItem>
                  <MenuItem value="PENDING">대기중</MenuItem>
                  <MenuItem value="IN_REVIEW">검토중</MenuItem>
                  <MenuItem value="RESOLVED">해결됨</MenuItem>
                  <MenuItem value="REJECTED">거부됨</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>유형</InputLabel>
                <Select
                  value={filterType}
                  label="유형"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">전체</MenuItem>
                  <MenuItem value="USER">사용자</MenuItem>
                  <MenuItem value="PRODUCT">상품</MenuItem>
                  <MenuItem value="REVIEW">리뷰</MenuItem>
                  <MenuItem value="CHAT">채팅</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 신고 목록 테이블 */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>신고자</TableCell>
                    <TableCell>신고 대상</TableCell>
                    <TableCell>유형</TableCell>
                    <TableCell>사유</TableCell>
                    <TableCell>상태</TableCell>
                    <TableCell>신고일</TableCell>
                    <TableCell>작업</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>{report.id}</TableCell>
                      <TableCell>{report.reporterName}</TableCell>
                      <TableCell>
                        {report.reportedUserName ||
                          report.reportedProductName ||
                          "-"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getTypeText(report.reportType)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{report.reason}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(report.status)}
                          color={getStatusColor(report.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{formatDate(report.createdAt)}</TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="상세보기">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetail(report)}
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="상태 변경">
                            <IconButton
                              size="small"
                              onClick={() => handleStatusChange(report)}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 상세보기 다이얼로그 */}
            <Dialog
              open={detailDialogOpen}
              onClose={() => setDetailDialogOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>신고 상세 정보</DialogTitle>
              <DialogContent>
                {selectedReport && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      기본 정보
                    </Typography>
                    <Box
                      display="grid"
                      gridTemplateColumns="1fr 1fr"
                      gap={2}
                      mb={3}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고 ID
                        </Typography>
                        <Typography>{selectedReport.id}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고 유형
                        </Typography>
                        <Typography>
                          {getTypeText(selectedReport.reportType)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고자
                        </Typography>
                        <Typography>{selectedReport.reporterName}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고 대상
                        </Typography>
                        <Typography>
                          {selectedReport.reportedUserName ||
                            selectedReport.reportedProductName ||
                            "-"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고 사유
                        </Typography>
                        <Typography>{selectedReport.reason}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          현재 상태
                        </Typography>
                        <Chip
                          label={getStatusText(selectedReport.status)}
                          color={getStatusColor(selectedReport.status) as any}
                        />
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      신고 내용
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3, bgcolor: "grey.50" }}>
                      <Typography>{selectedReport.description}</Typography>
                    </Paper>

                    <Typography variant="h6" gutterBottom>
                      시간 정보
                    </Typography>
                    <Box
                      display="grid"
                      gridTemplateColumns="1fr 1fr"
                      gap={2}
                      mb={3}
                    >
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          신고일
                        </Typography>
                        <Typography>
                          {formatDate(selectedReport.createdAt)}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="textSecondary">
                          최종 수정일
                        </Typography>
                        <Typography>
                          {formatDate(selectedReport.updatedAt)}
                        </Typography>
                      </Box>
                    </Box>

                    {selectedReport.adminComment && (
                      <>
                        <Typography variant="h6" gutterBottom>
                          관리자 코멘트
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: "blue.50" }}>
                          <Typography>{selectedReport.adminComment}</Typography>
                        </Paper>
                      </>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailDialogOpen(false)}>닫기</Button>
                <Button
                  variant="contained"
                  onClick={() => {
                    setDetailDialogOpen(false);
                    handleStatusChange(selectedReport!);
                  }}
                >
                  상태 변경
                </Button>
              </DialogActions>
            </Dialog>

            {/* 상태 변경 다이얼로그 */}
            <Dialog
              open={statusDialogOpen}
              onClose={() => setStatusDialogOpen(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>신고 상태 변경</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>새로운 상태</InputLabel>
                    <Select
                      value={newStatus}
                      label="새로운 상태"
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <MenuItem value="PENDING">대기중</MenuItem>
                      <MenuItem value="IN_REVIEW">검토중</MenuItem>
                      <MenuItem value="RESOLVED">해결됨</MenuItem>
                      <MenuItem value="REJECTED">거부됨</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="관리자 코멘트"
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="상태 변경 사유나 추가 조치 사항을 입력하세요"
                  />
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setStatusDialogOpen(false)}>취소</Button>
                <Button variant="contained" onClick={handleUpdateStatus}>
                  상태 변경
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </div>
      </div>
    </div>
  );
};

export default ReportManagePage;
