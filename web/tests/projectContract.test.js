import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fromProjectDetail,
  fromProjectList,
  toProjectPayload,
} from "../src/data/projectContract.js";
import {
  addApplication,
  createLocalId,
  isRecruiting,
  localDate,
} from "../src/data/workspace.js";

const project = {
  "project-id": 1,
  "user-id": 2,
  title: "제목",
  subtitle: "한 줄 소개",
  desc: "내용",
  deadline: "2030-11-26-08",
};

test("목록 조회는 로그인한 사용자와 공고 소유자를 구분한다", () => {
  const [owned] = fromProjectList([project], "2");
  const [unowned] = fromProjectList([project], "3");
  assert.equal(owned.id, "1");
  assert.equal(owned.description, project.subtitle);
  assert.equal(owned.deadline, "2030-11-26");
  assert.equal(owned.deadlineHour, "08");
  assert.equal(owned.managed, true);
  assert.equal(unowned.managed, false);
  assert.equal(owned.members, undefined);
});

test("상세에서 내려온 역할 코드를 공개된 요청 형태로 다시 보낸다", () => {
  const detail = fromProjectDetail(
    {
      project: [project],
      spec: [
        { id: 1, "project-id": 1, "spec-name": "FE", "spec-size": 2 },
        { id: 2, "project-id": 1, "spec-name": "UI/UX", "spec-size": 1 },
      ],
    },
    "1",
    "2",
  );
  assert.equal(detail.members, 3);
  assert.equal(detail.roles[0].title, "프론트엔드");
  assert.equal(detail.roles[0].spec, "FE");
  assert.deepEqual(
    toProjectPayload({
      ...detail,
      roles: detail.roles.map((role) => ({ ...role, title: role.spec })),
    }),
    {
      title: "제목",
      subtitle: "한 줄 소개",
      desc: "내용",
      spec: { FE: 2, "UI/UX": 1 },
      deadline: "2030-11-26-08",
    },
  );
});

test("중복 역할이 다른 역할의 인원을 덮어쓰지 못하게 한다", () => {
  assert.throws(
    () =>
      toProjectPayload({
        deadline: "2030-11-26",
        deadlineHour: "23",
        roles: [
          { title: "BE", members: 1 },
          { title: "BE", members: 4 },
        ],
      }),
    /같은 모집 역할/,
  );
});

test("응답에 요청과 다른 공고의 역할이 포함되면 표시하지 않는다", () => {
  assert.throws(
    () =>
      fromProjectDetail(
        {
          project: [project],
          spec: [{ id: 1, "project-id": 3, "spec-name": "BE", "spec-size": 2 }],
        },
        "1",
        "2",
      ),
    /공고 형식/,
  );
  assert.equal(
    fromProjectDetail({ project: [], spec: [] }, "1", "2"),
    undefined,
  );
});

test("서버 공고는 마감 시간부터 닫히고 데모 공고는 날짜 기준으로 유지한다", (context) => {
  context.mock.timers.enable({
    apis: ["Date"],
    now: new Date(2030, 10, 26, 8, 0),
  });
  const posting = { recruiting: true, deadline: localDate() };
  assert.equal(isRecruiting({ ...posting, deadlineHour: "08" }), false);
  assert.equal(isRecruiting({ ...posting, deadlineHour: "09" }), true);
  assert.equal(isRecruiting(posting), true);
});

test("마감 전에 작성한 데모 지원서는 마감 후 상태에 추가되지 않는다", (context) => {
  context.mock.timers.enable({
    apis: ["Date"],
    now: new Date(2030, 10, 26, 23, 59),
  });
  const posting = {
    id: "1",
    category: "AI",
    recruiting: true,
    deadline: localDate(),
  };
  const workspace = {
    mode: "applicant",
    projects: [posting],
    applications: [],
    profile: { name: "테스트 사용자" },
  };
  const application = {
    projectId: posting.id,
    roleId: "default",
    introduction: "작성한 내용",
  };

  assert.equal(addApplication(workspace, application).applications.length, 1);
  context.mock.timers.setTime(Date.now() + 60_000);
  assert.equal(addApplication(workspace, application), workspace);
  assert.equal(application.introduction, "작성한 내용");
});

test("로컬 식별자는 randomUUID가 없는 환경에서도 생성할 수 있다", (context) => {
  context.mock.method(globalThis.crypto, "randomUUID", () => {
    throw new Error("HTTP에서 사용할 수 없는 기능");
  });
  const id = createLocalId();
  assert.match(id, /^local-[0-9a-f]{32}$/);
  assert.notEqual(createLocalId(), id);
});
