const roleLabels = new Map([
  ["FE", "프론트엔드"],
  ["BE", "백엔드"],
]);

export function projectIdString(value) {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0)
    return String(value);
  return typeof value === "string" && /^[1-9]\d*$/.test(value) ? value : null;
}

function invalidProjectData() {
  return new Error("서버에서 받은 공고 형식을 확인할 수 없어요.");
}

function readProject(project, userId) {
  const id = projectIdString(project?.["project-id"]);
  const ownerId = projectIdString(project?.["user-id"]);
  const deadlineParts =
    typeof project?.deadline === "string"
      ? /^(\d{4}-\d{2}-\d{2})-([01]\d|2[0-3])$/.exec(project.deadline)
      : null;
  if (
    !id ||
    !ownerId ||
    !deadlineParts ||
    typeof project.title !== "string" ||
    typeof project.subtitle !== "string" ||
    typeof project.desc !== "string"
  ) {
    throw invalidProjectData();
  }

  return {
    id,
    title: project.title,
    description: project.subtitle,
    overview: project.desc,
    deadline: deadlineParts[1],
    deadlineHour: deadlineParts[2],
    recruiting: true,
    managed: ownerId === userId,
  };
}

export function fromProjectList(data, userId) {
  if (!Array.isArray(data)) throw invalidProjectData();
  return data.map((project) => readProject(project, userId));
}

export function fromProjectDetail(data, id, userId) {
  if (!Array.isArray(data?.project) || !Array.isArray(data.spec))
    throw invalidProjectData();
  const entry = data.project.find(
    (project) => projectIdString(project?.["project-id"]) === id,
  );
  if (!entry) {
    if (data.project.length === 0) return undefined;
    throw invalidProjectData();
  }

  const project = readProject(entry, userId);
  const roles = data.spec.map((role) => {
    const id = projectIdString(role?.id);
    const spec = role?.["spec-name"];
    const members = role?.["spec-size"];
    if (
      !id ||
      projectIdString(role["project-id"]) !== project.id ||
      typeof spec !== "string" ||
      !spec.trim() ||
      !Number.isSafeInteger(members) ||
      members < 1
    ) {
      throw invalidProjectData();
    }
    return { id, title: roleLabels.get(spec) ?? spec, spec, members };
  });

  return {
    ...project,
    roles,
    categories: [
      ...new Set(roles.map(({ spec }) => roleLabels.get(spec)).filter(Boolean)),
    ],
    members: roles.reduce((total, role) => total + role.members, 0),
  };
}

export function toProjectPayload(posting) {
  const { title, description, overview, deadline, deadlineHour, roles } =
    posting;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(deadline) ||
    !/^([01]\d|2[0-3])$/.test(deadlineHour)
  ) {
    throw new Error("지원 마감 날짜와 시간을 선택해 주세요.");
  }
  const roleEntries = roles.map(({ title, members }) => [
    title.trim(),
    members,
  ]);
  if (new Set(roleEntries.map(([spec]) => spec)).size !== roleEntries.length) {
    throw new Error("같은 모집 역할을 한 번만 입력해 주세요.");
  }

  return {
    title,
    subtitle: description,
    desc: overview,
    spec: Object.fromEntries(roleEntries),
    deadline: `${deadline}-${deadlineHour}`,
  };
}
