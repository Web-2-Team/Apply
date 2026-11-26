import { useLayoutEffect, useRef, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import BadgeChoices from "../../components/BadgeChoices/BadgeChoices";
import CommonButton from "../../components/Button/Button";
import CommonInput from "../../components/Input/Input";
import WorkspaceDialog from "../../components/WorkspaceDialog/WorkspaceDialog";
import { toProjectPayload } from "../../data/projectContract";
import useProjectDetail from "../../data/useProjectDetail";
import {
  categories,
  createLocalId,
  getProjectCategories,
  getProjectRoles,
  localDate,
  savePosting,
} from "../../data/workspace";
import { routes } from "../../router/routes";
import "./PostingEditorPage.styles.css";

const fields = [
  "title",
  "description",
  "overview",
  "duration",
  "deadline",
  "applicationGuide",
];
const deadlineHours = Array.from({ length: 24 }, (_, hour) =>
  String(hour).padStart(2, "0"),
);

function readPosting(form, roleRows) {
  const data = new FormData(form);
  const titles = data.getAll("roleTitle");
  const counts = data.getAll("roleMembers");
  const deadlineHour = data.get("deadlineHour");

  return {
    ...Object.fromEntries(
      fields.map((field) => [field, String(data.get(field) ?? "").trim()]),
    ),
    ...(deadlineHour !== null && { deadlineHour }),
    categories: data.getAll("categories"),
    roles: roleRows.map(({ id }, index) => ({
      id,
      title: String(titles[index] ?? "").trim(),
      members: String(counts[index] ?? "").trim(),
    })),
  };
}

function PostingEditor({
  project,
  workspace,
  setWorkspace,
  savePostingDraft,
  projectApi,
  projectList,
}) {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const submitting = useRef(false);
  const editorActive = useRef(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const draftKey = project?.id ?? "new";
  const initial = workspace.postingDrafts?.[draftKey] ?? project ?? {};
  const [roleRows, setRoleRows] = useState(() => {
    const savedRoles = getProjectRoles(initial);
    return savedRoles.length
      ? savedRoles
      : [
          {
            id: createLocalId(),
            title: initial.roleTitle ?? "",
            members: initial.members ?? 1,
          },
        ];
  });
  const selectedCategories = getProjectCategories(initial);
  const categoryOptions = [...new Set([...categories, ...selectedCategories])];
  const today = localDate();
  const minimumDeadline =
    project?.deadline && project.deadline < today ? project.deadline : today;
  const action = project ? "공고 수정" : "공고 등록";

  useLayoutEffect(() => {
    editorActive.current = true;
    return () => {
      editorActive.current = false;
    };
  }, []);

  function clearFeedback() {
    setNotice("");
    setError("");
  }

  function addRole() {
    const role = { id: createLocalId(), title: "", members: 1 };
    setRoleRows((rows) => [...rows, role]);
    clearFeedback();
  }

  function removeRole(id) {
    setRoleRows((rows) => rows.filter((role) => role.id !== id));
    clearFeedback();
  }

  function saveDraft() {
    clearFeedback();
    const draft = readPosting(formRef.current, roleRows);
    if (!savePostingDraft(draftKey, draft)) {
      setError("브라우저에 초안을 저장하지 못했어요.");
      return;
    }
    setNotice("임시 저장했어요.");
  }

  async function submitPosting(event) {
    event.preventDefault();
    if (submitting.current) return;
    clearFeedback();
    const values = readPosting(event.currentTarget, roleRows);
    if (!values.title || !values.description || !values.overview) {
      setError("프로젝트명, 한 줄 소개, 상세 내용을 입력해 주세요.");
      return;
    }
    const roles = values.roles.map((role) => ({
      ...role,
      members: Number(role.members),
    }));
    if (
      !roles.length ||
      roles.some(
        ({ title, members }) =>
          !title || !Number.isInteger(members) || members < 1 || members > 100,
      )
    ) {
      setError(
        "모집 역할을 하나 이상 추가하고 역할명과 인원(1~100명)을 입력해 주세요.",
      );
      return;
    }
    if (!projectApi && !values.categories.length) {
      setError("모집 분야를 하나 이상 선택해 주세요.");
      return;
    }

    const posting = {
      ...values,
      roles,
    };
    const submittedDraft = workspace.postingDrafts?.[draftKey];
    if (projectApi) {
      submitting.current = true;
      setSaving(true);
      try {
        const payload = toProjectPayload(posting);
        if (project) await projectApi.update(project.id, payload);
        else await projectApi.create(payload);
      } catch (requestError) {
        if (editorActive.current) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "공고를 저장하지 못했어요. 다시 시도해 주세요.",
          );
        }
        return;
      } finally {
        submitting.current = false;
        if (editorActive.current) setSaving(false);
      }
      projectList.reload();
    }

    const postingId = projectApi ? null : (project?.id ?? createLocalId());
    setWorkspace((current) => {
      const updated = projectApi
        ? current
        : savePosting(current, { ...posting, id: postingId });
      if (!projectApi && updated === current) return current;
      if (
        !submittedDraft ||
        updated.postingDrafts?.[draftKey] !== submittedDraft
      ) {
        return updated;
      }
      const postingDrafts = { ...current.postingDrafts };
      delete postingDrafts[draftKey];
      return { ...updated, postingDrafts };
    });
    if (editorActive.current) navigate(routes.postings);
  }

  return (
    <>
      <form
        ref={formRef}
        className="posting-editor-form"
        onSubmit={submitPosting}
        onChange={clearFeedback}
      >
        <fieldset
          className="posting-editor-fields"
          aria-label="공고 정보"
          disabled={saving}
        >
          <CommonInput
            label="프로젝트명 *"
            name="title"
            defaultValue={initial.title}
            placeholder="예: AI 기반 동네 상권 분석 대시보드"
            maxLength={100}
            required
          />
          <CommonInput
            label="한 줄 소개 *"
            name="description"
            defaultValue={initial.description}
            placeholder="프로젝트의 목표와 함께할 이유를 적어 주세요."
            maxLength={180}
            required
          />
          <label className="common-input">
            <span className="common-input-label">프로젝트 상세 *</span>
            <textarea
              className="common-input-field"
              name="overview"
              defaultValue={initial.overview ?? initial.description}
              placeholder="프로젝트 목표, 진행 방식, 기대 결과를 소개해 주세요."
              maxLength={2000}
              required
            />
          </label>
          <fieldset className="posting-role-list">
            <legend className="common-input-label">모집 역할 *</legend>
            {roleRows.map((role, index) => (
              <div className="posting-role-row" key={role.id}>
                <CommonInput
                  label={projectApi ? "역할 코드" : "역할명"}
                  aria-label={`역할 ${index + 1} ${projectApi ? "코드" : "이름"}`}
                  name="roleTitle"
                  defaultValue={
                    projectApi ? (role.spec ?? role.title) : role.title
                  }
                  placeholder={
                    projectApi ? "예: FE, BE" : "예: 프론트엔드 개발자"
                  }
                  maxLength={80}
                  required
                />
                <CommonInput
                  label="모집 인원"
                  aria-label={`역할 ${index + 1} 모집 인원`}
                  name="roleMembers"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue={role.members}
                  required
                />
                <CommonButton
                  className="creator-secondary posting-role-remove"
                  variant="secondary"
                  disabled={roleRows.length === 1}
                  aria-label={`역할 ${index + 1} 삭제`}
                  onClick={() => removeRole(role.id)}
                >
                  <FiTrash2 aria-hidden="true" />
                </CommonButton>
              </div>
            ))}
            <CommonButton
              className="creator-secondary posting-role-add"
              variant="secondary"
              onClick={addRole}
            >
              <FiPlus aria-hidden="true" /> 역할 추가
            </CommonButton>
          </fieldset>
          {!projectApi && (
            <BadgeChoices
              label="모집 분야 *"
              name="categories"
              options={categoryOptions}
              defaultValues={selectedCategories}
            />
          )}
          <div className="posting-editor-pair">
            {!projectApi && (
              <CommonInput
                label="프로젝트 기간"
                name="duration"
                defaultValue={initial.duration}
                placeholder="예: 8주"
                maxLength={60}
              />
            )}
            <CommonInput
              label="지원 마감일 *"
              name="deadline"
              type="date"
              min={minimumDeadline}
              defaultValue={initial.deadline}
              required
            />
            {projectApi && (
              <label className="common-input">
                <span className="common-input-label">지원 마감 시각 *</span>
                <select
                  className="common-input-field"
                  name="deadlineHour"
                  defaultValue={initial.deadlineHour || "23"}
                  required
                >
                  {deadlineHours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}:00
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
          {!projectApi && (
            <label className="common-input">
              <span className="common-input-label">지원 안내</span>
              <textarea
                className="common-input-field posting-editor-guide"
                name="applicationGuide"
                defaultValue={initial.applicationGuide}
                placeholder="지원자가 알아야 할 내용과 결과 안내 일정을 입력하세요."
                maxLength={1000}
              />
            </label>
          )}
        </fieldset>
        {error && (
          <p className="workspace-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="posting-editor-actions">
          <CommonButton
            variant="secondary"
            className="creator-secondary"
            disabled={saving}
            onClick={() => setPreview(readPosting(formRef.current, roleRows))}
          >
            미리보기
          </CommonButton>
          <CommonButton
            variant="secondary"
            className="creator-secondary"
            disabled={saving}
            onClick={saveDraft}
          >
            임시 저장
          </CommonButton>
          <CommonButton
            type="submit"
            className="creator-primary"
            loading={saving}
          >
            {action}
          </CommonButton>
          <span role="status">{notice}</span>
        </div>
      </form>
      {preview && (
        <WorkspaceDialog
          title="공고 미리보기"
          onDismiss={() => setPreview(null)}
        >
          <div className="posting-editor-preview">
            <h3>{preview.title || "프로젝트명 미입력"}</h3>
            {preview.description && <p>{preview.description}</p>}
            {preview.overview && <p>{preview.overview}</p>}
            <dl>
              <dt>모집 역할</dt>
              <dd>
                <ul className="posting-preview-roles">
                  {preview.roles.map(({ id, title, members }) => (
                    <li key={id}>
                      {title || "미입력"} ·{" "}
                      {members ? `${members}명` : "인원 미입력"}
                    </li>
                  ))}
                </ul>
              </dd>
              {!projectApi && (
                <>
                  <dt>모집 분야</dt>
                  <dd>{preview.categories.join(", ") || "미선택"}</dd>
                </>
              )}
              {!projectApi && (
                <>
                  <dt>프로젝트 기간</dt>
                  <dd>{preview.duration || "미입력"}</dd>
                </>
              )}
              <dt>지원 마감</dt>
              <dd>
                {preview.deadline
                  ? `${preview.deadline}${projectApi ? ` ${preview.deadlineHour}:00` : ""}`
                  : "미선택"}
              </dd>
              {preview.applicationGuide && (
                <>
                  <dt>지원 안내</dt>
                  <dd>{preview.applicationGuide}</dd>
                </>
              )}
            </dl>
          </div>
          <div className="workspace-dialog-actions">
            <CommonButton variant="secondary" onClick={() => setPreview(null)}>
              닫기
            </CommonButton>
          </div>
        </WorkspaceDialog>
      )}
    </>
  );
}

function PostingEditorPage() {
  const { workspace, setWorkspace, savePostingDraft, projectApi, projectList } =
    useOutletContext();
  const { projectId } = useParams();
  const { project, loading, error, reload } = useProjectDetail(projectId);

  if (projectId && (loading || error || !project?.managed)) {
    return (
      <main className="creator-page posting-editor-page">
        <h1>프로젝트 공고 수정</h1>
        {loading && <p role="status">공고를 불러오는 중이에요.</p>}
        {error && (
          <p className="workspace-form-error" role="alert">
            {error}
          </p>
        )}
        {error && (
          <CommonButton variant="secondary" onClick={reload}>
            다시 불러오기
          </CommonButton>
        )}
        {!loading && !error && <p>수정할 수 있는 공고를 찾지 못했어요.</p>}
        <Link className="creator-back" to={routes.postings}>
          공고 관리로 돌아가기
        </Link>
      </main>
    );
  }

  return (
    <main className="creator-page posting-editor-page">
      <nav className="posting-editor-breadcrumb" aria-label="현재 위치">
        <Link className="creator-back" to={routes.postings}>
          공고 관리
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{project ? "공고 수정" : "새 공고"}</span>
      </nav>
      <h1>{project ? "프로젝트 공고 수정" : "프로젝트 공고 등록"}</h1>
      <p className="posting-editor-description">
        필수 정보를 작성해 팀에 함께할 사람을 모집하세요.
      </p>
      <PostingEditor
        key={projectId ?? "new"}
        project={project}
        workspace={workspace}
        setWorkspace={setWorkspace}
        savePostingDraft={savePostingDraft}
        projectApi={projectApi}
        projectList={projectList}
      />
    </main>
  );
}

export default PostingEditorPage;
