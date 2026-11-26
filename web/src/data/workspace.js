const storageKey = "apply-workspace-v1";

export const majorChoices = [
  "프론트엔드",
  "백엔드",
  "UI/UX",
  "AI",
  "정보보안",
  "Flutter",
  "안드로이드",
  "iOS",
  "DevOps",
];
export const categories = [...majorChoices, "리서치"];
const defaultProfile = { name: "김지우", studentId: "", email: "", majors: [] };

export const applicationStatuses = {
  review: { label: "검토 중", tone: "review" },
  accepted: { label: "합격", tone: "accepted" },
  rejected: { label: "불합격", tone: "rejected" },
};

export function createLocalId() {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `local-${hex.join("")}`;
}

export function localDate(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function daysUntil(deadline) {
  return Math.round(
    (Date.parse(deadline) - Date.parse(localDate())) / 86400000,
  );
}

export function isRecruiting(project) {
  if (!project.recruiting) return false;
  const days = daysUntil(project.deadline);
  return (
    days > 0 ||
    (days === 0 &&
      (project.deadlineHour == null ||
        new Date().getHours() < Number(project.deadlineHour)))
  );
}

export function deadlineLabel(project) {
  if (!isRecruiting(project)) return "모집 마감";
  const days = daysUntil(project.deadline);
  return days === 0 ? "D-Day" : `D-${days}`;
}

function sampleReviewApplications() {
  const samples = [
    {
      applicant: "박서연",
      role: "프론트엔드 개발자",
      experience: "React · TypeScript · 3년",
      status: "review",
      introduction: "React와 TypeScript로 대시보드를 만들어 왔어요.",
      motivation: "지역 데이터를 이해하기 쉽게 보여주는 화면을 만들고 싶어요.",
    },
    {
      applicant: "최민준",
      role: "데이터 분석가",
      experience: "SQL · Python · 데이터 시각화",
      status: "accepted",
      introduction: "공공 데이터를 분석하고 시각화한 경험이 있어요.",
      motivation: "동네 상권의 변화와 원인을 찾아보고 싶어요.",
    },
    {
      applicant: "한유진",
      role: "프론트엔드 개발자",
      experience: "React · Figma · 2년",
      status: "review",
      introduction: "디자이너와 협업하며 웹 서비스를 구현했어요.",
      motivation: "소상공인이 쉽게 사용하는 도구를 함께 만들고 싶어요.",
    },
    {
      applicant: "정다운",
      role: "서비스 기획자",
      experience: "서비스 기획 · MVP 3회",
      status: "rejected",
      introduction: "사용자 조사와 서비스 기획을 해 왔어요.",
      motivation: "지역 상권을 위한 제품의 문제를 정의하고 싶어요.",
    },
  ];

  return samples.map((sample, index) => ({
    ...sample,
    id: `review-sample-${index + 1}`,
    projectId: "1",
    date: localDate(-index),
    isReviewSample: true,
  }));
}

export function getOwnApplications(workspace) {
  return workspace.applications.filter(
    (application) => !application.isReviewSample,
  );
}

export function getProjectCategories(project) {
  if (Array.isArray(project.categories)) return project.categories;
  return project.category ? [project.category] : [];
}

export function getProjectRoles(project) {
  if (Array.isArray(project.roles)) return project.roles;
  const title = project.roleTitle ?? project.category;
  if (title === undefined && project.members === undefined) return [];
  return [{ id: "default", title: title ?? "", members: project.members ?? 1 }];
}

function initialWorkspace() {
  return {
    mode: "applicant",
    profile: { ...defaultProfile },
    savedProjectIds: [],
    projects: [
      {
        id: "1",
        title: "AI 기반 동네 상권 분석 대시보드",
        description:
          "지역 데이터를 시각화할 데이터 분석가와 프론트엔드 개발자를 찾아요.",
        overview:
          "동네 상권의 흐름을 데이터로 살펴보고, 소상공인과 주민이 활용할 수 있는 대시보드를 만드는 팀 프로젝트입니다. 데이터 분석과 제품 경험을 함께 고민해요.",
        category: "프론트엔드",
        members: 3,
        recruiting: true,
        deadline: localDate(5),
        managed: true,
        organizer: "로컬랩",
        logistics: ["기간 8주", "주 1회 온라인", "원격 참여"],
        roleDetails: "React 경험 · 주 4시간",
      },
      {
        id: "2",
        title: "청년 커뮤니티 앱 리뉴얼",
        description: "더 가깝게 연결되는 지역 커뮤니티 경험을 함께 설계합니다.",
        category: "UI/UX",
        members: 2,
        recruiting: true,
        deadline: localDate(8),
      },
      {
        id: "3",
        title: "지속가능한 소비 리포트 제작",
        description: "소비 트렌드를 분석하고 읽기 쉬운 리포트로 만들어요.",
        category: "리서치",
        members: 5,
        recruiting: false,
        deadline: localDate(11),
      },
      {
        id: "4",
        title: "반려동물 돌봄 매칭 서비스",
        description:
          "믿을 수 있는 펫시터와 보호자를 연결하는 서비스를 만들어요.",
        category: "백엔드",
        members: 4,
        recruiting: true,
        deadline: localDate(14),
      },
    ],
    applications: [
      ...sampleReviewApplications(),
      ...[
        { projectId: "2", date: "2025-04-08", status: "accepted" },
        { projectId: "3", date: "2025-04-05", status: "review" },
        { projectId: "4", date: "2025-03-28", status: "rejected" },
      ].map((application) => ({
        ...application,
        id: `sample-${application.projectId}`,
        applicant: defaultProfile.name,
      })),
    ],
  };
}

export function loadWorkspace(scope) {
  try {
    const stored = JSON.parse(localStorage.getItem(scope ?? storageKey));
    if (
      Array.isArray(stored?.projects) &&
      Array.isArray(stored?.applications)
    ) {
      const { major, ...profile } = stored.profile ?? {};
      const majors = Array.isArray(profile.majors) ? profile.majors : [major];
      const hasDemoPosting = stored.projects.some(
        ({ id, managed }) => id === "1" && managed,
      );
      const hasOldDemoData =
        stored.applications.some(({ id }) => id === "sample-2") &&
        !stored.applications.some(({ isReviewSample }) => isReviewSample);
      return {
        ...stored,
        mode: stored.mode === "publisher" ? "publisher" : "applicant",
        applications:
          hasDemoPosting && hasOldDemoData
            ? [...sampleReviewApplications(), ...stored.applications]
            : stored.applications,
        profile: {
          ...defaultProfile,
          ...profile,
          majors: [
            ...new Set(
              majors
                .filter((value) => typeof value === "string")
                .map((value) => value.trim())
                .filter(Boolean),
            ),
          ],
        },
        savedProjectIds: Array.isArray(stored.savedProjectIds)
          ? stored.savedProjectIds
          : [],
      };
    }
  } catch {
    // Start with sample data when browser storage cannot be read.
  }
  if (!scope) return initialWorkspace();
  return {
    mode: "applicant",
    profile: { ...defaultProfile, name: "사용자" },
    savedProjectIds: [],
    projects: [],
    applications: [],
  };
}

export function saveWorkspace(workspace, scope) {
  try {
    localStorage.setItem(scope ?? storageKey, JSON.stringify(workspace));
    return true;
  } catch {
    return false;
  }
}

export function toggleSavedProject(workspace, projectId, knownProject = false) {
  const { savedProjectIds } = workspace;
  if (savedProjectIds.includes(projectId)) {
    return {
      ...workspace,
      savedProjectIds: savedProjectIds.filter((id) => id !== projectId),
    };
  }

  if (!knownProject && !workspace.projects.some(({ id }) => id === projectId))
    return workspace;
  return { ...workspace, savedProjectIds: [projectId, ...savedProjectIds] };
}

export function addApplication(workspace, application) {
  const project = workspace.projects.find(
    ({ id }) => id === application.projectId,
  );
  const duplicate = getOwnApplications(workspace).some(
    ({ projectId }) => projectId === application.projectId,
  );
  if (
    workspace.mode !== "applicant" ||
    !project ||
    !isRecruiting(project) ||
    duplicate
  ) {
    return workspace;
  }
  const roles = getProjectRoles(project);
  const role = application.roleId
    ? roles.find(({ id }) => id === application.roleId)
    : roles[0];
  if (!role) return workspace;

  return {
    ...workspace,
    applications: [
      {
        ...application,
        applicant: workspace.profile.name,
        roleId: role.id,
        role: role.title,
        experience: (workspace.profile.majors ?? []).join(" · "),
      },
      ...workspace.applications,
    ],
  };
}

export function savePosting(workspace, posting) {
  if (workspace.mode !== "publisher") return workspace;
  const existing = workspace.projects.find(({ id }) => id === posting.id);
  if (existing && !existing.managed) return workspace;
  if (Array.isArray(posting.categories) && posting.categories.length === 0)
    return workspace;
  if (
    posting.roles &&
    (posting.roles.length === 0 ||
      new Set(posting.roles.map(({ id }) => id)).size !==
        posting.roles.length ||
      posting.roles.some(
        ({ id, title, members }) =>
          !id ||
          !title.trim() ||
          !Number.isInteger(members) ||
          members < 1 ||
          members > 100,
      ))
  )
    return workspace;

  const updated = {
    ...posting,
    ...(posting.roles && {
      members: posting.roles.reduce((total, role) => total + role.members, 0),
    }),
    updatedAt: new Date().toISOString(),
  };
  const projects = existing
    ? workspace.projects.map((project) =>
        project.id === posting.id ? { ...project, ...updated } : project,
      )
    : [
        {
          ...updated,
          organizer: workspace.profile.name,
          managed: true,
          recruiting: true,
        },
        ...workspace.projects,
      ];
  return { ...workspace, projects };
}

export function closePosting(workspace, projectId) {
  if (workspace.mode !== "publisher") return workspace;
  return {
    ...workspace,
    projects: workspace.projects.map((project) =>
      project.id === projectId && project.managed
        ? { ...project, recruiting: false }
        : project,
    ),
  };
}

export function reviewApplication(workspace, applicationId, status) {
  if (
    workspace.mode !== "publisher" ||
    !["accepted", "rejected"].includes(status)
  )
    return workspace;
  const application = workspace.applications.find(
    ({ id }) => id === applicationId,
  );
  const managed = workspace.projects.some(
    (project) => project.id === application?.projectId && project.managed,
  );
  if (!managed || application?.status !== "review") return workspace;

  return {
    ...workspace,
    applications: workspace.applications.map((item) =>
      item.id === applicationId ? { ...item, status } : item,
    ),
  };
}
