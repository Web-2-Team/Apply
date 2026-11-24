const storageKey = 'apply-workspace-v1';

export const categories = ['프론트엔드', 'UI/UX', '리서치', '백엔드'];
const defaultProfile = { name: '김지우', studentId: '', email: '', major: '' };

export const applicationStatuses = {
  review: { label: '검토 중', tone: 'review' },
  accepted: { label: '합격', tone: 'accepted' },
  rejected: { label: '불합격', tone: 'rejected' },
};

export function localDate(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysUntil(deadline) {
  return Math.round((Date.parse(deadline) - Date.parse(localDate())) / 86400000);
}

export function isRecruiting(project) {
  return project.recruiting && daysUntil(project.deadline) >= 0;
}

export function deadlineLabel(project) {
  if (!isRecruiting(project)) return '모집 마감';
  const days = daysUntil(project.deadline);
  return days === 0 ? 'D-Day' : `D-${days}`;
}

function initialWorkspace() {
  return {
    mode: 'applicant',
    profile: { ...defaultProfile },
    savedProjectIds: [],
    projects: [
      {
        id: '1',
        title: 'AI 기반 동네 상권 분석 대시보드',
        description: '지역 데이터를 시각화할 데이터 분석가와 프론트엔드 개발자를 찾아요.',
        overview: '동네 상권의 흐름을 데이터로 살펴보고, 소상공인과 주민이 활용할 수 있는 대시보드를 만드는 팀 프로젝트입니다. 데이터 분석과 제품 경험을 함께 고민해요.',
        category: '프론트엔드', members: 3, recruiting: true, deadline: localDate(5), managed: true,
        organizer: '로컬랩', logistics: ['기간 8주', '주 1회 온라인', '원격 참여'],
        roleDetails: 'React 경험 · 주 4시간',
      },
      {
        id: '2', title: '청년 커뮤니티 앱 리뉴얼',
        description: '더 가깝게 연결되는 지역 커뮤니티 경험을 함께 설계합니다.',
        category: 'UI/UX', members: 2, recruiting: true, deadline: localDate(8),
      },
      {
        id: '3', title: '지속가능한 소비 리포트 제작',
        description: '소비 트렌드를 분석하고 읽기 쉬운 리포트로 만들어요.',
        category: '리서치', members: 5, recruiting: false, deadline: localDate(11),
      },
      {
        id: '4', title: '반려동물 돌봄 매칭 서비스',
        description: '믿을 수 있는 펫시터와 보호자를 연결하는 서비스를 만들어요.',
        category: '백엔드', members: 4, recruiting: true, deadline: localDate(14),
      },
    ],
    applications: [
      { projectId: '2', date: '2025-04-08', status: 'accepted' },
      { projectId: '3', date: '2025-04-05', status: 'review' },
      { projectId: '4', date: '2025-03-28', status: 'rejected' },
    ].map((application) => ({
      ...application,
      id: `sample-${application.projectId}`,
      applicant: defaultProfile.name,
    })),
  };
}

export function loadWorkspace() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(stored?.projects) && Array.isArray(stored?.applications)) {
      return {
        ...stored,
        mode: stored.mode === 'publisher' ? 'publisher' : 'applicant',
        profile: { ...defaultProfile, ...stored.profile },
        savedProjectIds: Array.isArray(stored.savedProjectIds) ? stored.savedProjectIds : [],
      };
    }
  } catch {
    // Start with sample data when browser storage cannot be read.
  }
  return initialWorkspace();
}

export function saveWorkspace(workspace) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}

export function toggleSavedProject(workspace, projectId) {
  const { savedProjectIds } = workspace;
  if (savedProjectIds.includes(projectId)) {
    return { ...workspace, savedProjectIds: savedProjectIds.filter((id) => id !== projectId) };
  }

  if (!workspace.projects.some(({ id }) => id === projectId)) return workspace;
  return { ...workspace, savedProjectIds: [projectId, ...savedProjectIds] };
}

export function addApplication(workspace, application) {
  const project = workspace.projects.find(({ id }) => id === application.projectId);
  const duplicate = workspace.applications.some(({ projectId }) => projectId === application.projectId);
  if (workspace.mode !== 'applicant' || !project || !isRecruiting(project) || duplicate) {
    return workspace;
  }

  return {
    ...workspace,
    applications: [{ ...application, applicant: workspace.profile.name }, ...workspace.applications],
  };
}

export function savePosting(workspace, posting) {
  if (workspace.mode !== 'publisher') return workspace;
  const existing = workspace.projects.find(({ id }) => id === posting.id);
  if (existing && !existing.managed) return workspace;

  const projects = existing
    ? workspace.projects.map((project) => project.id === posting.id ? { ...project, ...posting } : project)
    : [{ ...posting, organizer: workspace.profile.name, managed: true, recruiting: true }, ...workspace.projects];
  return { ...workspace, projects };
}

export function closePosting(workspace, projectId) {
  if (workspace.mode !== 'publisher') return workspace;
  return {
    ...workspace,
    projects: workspace.projects.map((project) => (
      project.id === projectId && project.managed ? { ...project, recruiting: false } : project
    )),
  };
}

export function reviewApplication(workspace, applicationId, status) {
  if (workspace.mode !== 'publisher' || !['accepted', 'rejected'].includes(status)) return workspace;
  const application = workspace.applications.find(({ id }) => id === applicationId);
  const managed = workspace.projects.some((project) => project.id === application?.projectId && project.managed);
  if (!managed || application?.status !== 'review') return workspace;

  return {
    ...workspace,
    applications: workspace.applications.map((item) => item.id === applicationId ? { ...item, status } : item),
  };
}
