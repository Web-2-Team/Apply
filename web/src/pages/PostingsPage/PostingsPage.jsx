import { useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import CommonInput from "../../components/Input/Input";
import WorkspaceDialog from "../../components/WorkspaceDialog/WorkspaceDialog";
import {
  applicationStatuses,
  categories,
  closePosting,
  isRecruiting,
  localDate,
  reviewApplication,
  savePosting,
} from "../../data/workspace";
import { routes } from "../../router/routes";
import "./PostingsPage.styles.css";

function PostingEditor({ project, onDismiss, onSave }) {
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = form.get("title").trim();
    const description = form.get("description").trim();
    if (!title || !description) {
      setError("공고 제목과 소개를 입력해 주세요.");
      return;
    }

    onSave({
      id: project?.id ?? crypto.randomUUID(),
      title,
      description,
      overview: description,
      category: form.get("category"),
      members: Number(form.get("members")),
      deadline: form.get("deadline"),
    });
  }

  return (
    <WorkspaceDialog
      title={project ? "공고 수정" : "새 공고 작성"}
      onDismiss={onDismiss}
    >
      <form className="workspace-dialog-form" onSubmit={handleSubmit}>
        <CommonInput
          label="공고 제목"
          name="title"
          defaultValue={project?.title}
          maxLength={100}
          required
        />
        <label className="workspace-dialog-field">
          공고 소개
          <textarea
            name="description"
            defaultValue={project?.overview ?? project?.description}
            maxLength={2000}
            required
          />
        </label>
        <label className="workspace-dialog-field">
          모집 분야
          <select name="category" defaultValue={project?.category} required>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <CommonInput
          label="모집 인원"
          name="members"
          type="number"
          min="1"
          max="100"
          defaultValue={project?.members ?? 1}
          required
        />
        <CommonInput
          label="지원 마감일"
          name="deadline"
          type="date"
          min={
            project?.deadline && project.deadline < localDate()
              ? project.deadline
              : localDate()
          }
          defaultValue={project?.deadline}
          required
        />
        {error && (
          <p className="workspace-form-error" role="alert">
            {error}
          </p>
        )}
        <div className="workspace-dialog-actions">
          <CommonButton variant="secondary" onClick={onDismiss}>
            취소
          </CommonButton>
          <CommonButton type="submit">저장</CommonButton>
        </div>
      </form>
    </WorkspaceDialog>
  );
}

function PostingsPage() {
  const { workspace, setWorkspace, requestPublisherMode } = useOutletContext();
  const [editor, setEditor] = useState(null);
  const [closing, setClosing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const postings = workspace.projects.filter(({ managed }) => managed);
  const selected = postings.find(({ id }) => id === selectedId);
  const received = workspace.applications.filter(
    ({ projectId }) => projectId === selected?.id,
  );

  if (workspace.mode !== "publisher") {
    return (
      <main className="postings-page">
        <h1>공고 관리</h1>
        <p>공고자 모드에서 공고를 작성하고 지원자를 검토할 수 있어요.</p>
        <CommonButton onClick={requestPublisherMode}>
          공고자 모드로 전환
        </CommonButton>
      </main>
    );
  }

  return (
    <main className="postings-page">
      <div className="postings-heading">
        <div>
          <h1>공고 관리</h1>
          <p>내 공고를 관리하고 받은 지원서를 확인하세요.</p>
        </div>
        <CommonButton onClick={() => setEditor({})}>새 공고 작성</CommonButton>
      </div>

      <section className="postings-section" aria-labelledby="my-postings">
        <h2 id="my-postings">내 공고</h2>
        {postings.map((project) => (
          <article className="postings-card" key={project.id}>
            <h3>
              <Link to={routes.projectDetail(project.id)}>{project.title}</Link>
            </h3>
            <p>
              {project.category} ·{" "}
              {isRecruiting(project) ? "모집 중" : "모집 마감"} · 마감{" "}
              {project.deadline}
            </p>
            <div className="postings-actions">
              <CommonButton
                variant="secondary"
                aria-expanded={selectedId === project.id}
                onClick={() =>
                  setSelectedId(selectedId === project.id ? null : project.id)
                }
              >
                지원서 보기 (
                {
                  workspace.applications.filter(
                    ({ projectId }) => projectId === project.id,
                  ).length
                }
                )
              </CommonButton>
              <CommonButton
                variant="secondary"
                onClick={() => setEditor({ project })}
              >
                수정
              </CommonButton>
              {isRecruiting(project) && (
                <CommonButton
                  variant="secondary"
                  onClick={() => setClosing(project)}
                >
                  모집 마감
                </CommonButton>
              )}
            </div>
          </article>
        ))}
      </section>

      {selected && (
        <section
          className="postings-section"
          aria-labelledby="received-applications"
        >
          <h2 id="received-applications">받은 지원서 · {selected.title}</h2>
          {received.length === 0 && <p>아직 받은 지원서가 없어요.</p>}
          {received.map((application) => (
            <article className="postings-card" key={application.id}>
              <h3>{application.applicant}</h3>
              <p>
                {application.date} ·{" "}
                {applicationStatuses[application.status].label}
              </p>
              <dl className="postings-application-copy">
                <dt>자기소개</dt>
                <dd>{application.introduction}</dd>
                <dt>지원 동기</dt>
                <dd>{application.motivation}</dd>
              </dl>
              {application.status === "review" && (
                <div className="postings-actions">
                  <CommonButton
                    onClick={() =>
                      setWorkspace((current) =>
                        reviewApplication(current, application.id, "accepted"),
                      )
                    }
                  >
                    합격
                  </CommonButton>
                  <CommonButton
                    variant="secondary"
                    onClick={() =>
                      setWorkspace((current) =>
                        reviewApplication(current, application.id, "rejected"),
                      )
                    }
                  >
                    불합격
                  </CommonButton>
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {editor && (
        <PostingEditor
          project={editor.project}
          onDismiss={() => setEditor(null)}
          onSave={(posting) => {
            setWorkspace((current) => savePosting(current, posting));
            setEditor(null);
          }}
        />
      )}
      {closing && (
        <WorkspaceDialog
          title="모집을 마감하시겠습니까?"
          onDismiss={() => setClosing(null)}
        >
          <p>
            {closing.title}의 새 지원을 받지 않아요. 받은 지원서는 계속 검토할
            수 있어요.
          </p>
          <div className="workspace-dialog-actions">
            <CommonButton
              variant="secondary"
              autoFocus
              onClick={() => setClosing(null)}
            >
              취소
            </CommonButton>
            <CommonButton
              onClick={() => {
                setWorkspace((current) => closePosting(current, closing.id));
                setClosing(null);
              }}
            >
              마감하기
            </CommonButton>
          </div>
        </WorkspaceDialog>
      )}
    </main>
  );
}

export default PostingsPage;
