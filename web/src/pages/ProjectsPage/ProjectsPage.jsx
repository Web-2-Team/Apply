import { useState } from "react";
import { FiRotateCcw, FiSliders } from "react-icons/fi";
import { useOutletContext, useSearchParams } from "react-router-dom";
import CommonButton from "../../components/Button/Button";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { matchesProjectSearch } from "../../data/projectSearch";
import {
  categories,
  getProjectCategories,
  isRecruiting,
} from "../../data/workspace";
import ProjectFilter from "./ProjectFilter";
import "./ProjectsPage.styles.css";

const categoryOptions = ["전체 분야", ...categories];

function ProjectsPage() {
  const {
    workspace: { projects },
    projectApi,
    projectList,
  } = useOutletContext();
  const [category, setCategory] = useState("전체 분야");
  const [status, setStatus] = useState(null);
  const [sort, setSort] = useState("마감 임박순");
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const activeStatus = status ?? (query ? "전체 상태" : "모집 중");

  const visibleProjects = projects
    .filter((project) => matchesProjectSearch(project, query))
    .filter(
      (project) =>
        projectApi ||
        category === "전체 분야" ||
        getProjectCategories(project).includes(category),
    )
    .filter(
      (project) =>
        activeStatus === "전체 상태" ||
        (activeStatus === "모집 중") === isRecruiting(project),
    )
    .sort((a, b) =>
      sort === "마감 임박순" ? compareDeadlines(a, b) : compareDeadlines(b, a),
    );

  const resetFilters = () => {
    setCategory("전체 분야");
    setStatus(null);
    setSort("마감 임박순");
    if (searchParams.has("q")) {
      const next = new URLSearchParams(searchParams);
      next.delete("q");
      setSearchParams(next, { replace: true });
    }
  };

  return (
    <main className="projects-content">
      <div className="projects-title-block">
        <h1>프로젝트 찾기</h1>
        <p>관심 있는 팀의 공고를 둘러보고, 다음 프로젝트를 시작해 보세요.</p>
      </div>

      <section
        className="projects-filters"
        aria-labelledby="projects-filter-heading"
      >
        <div className="projects-filters-header">
          <h2 id="projects-filter-heading">
            <span className="projects-filters-icon">
              <FiSliders aria-hidden="true" />
            </span>
            필터
          </h2>
          <CommonButton
            className="projects-reset"
            variant="secondary"
            onClick={resetFilters}
          >
            <FiRotateCcw aria-hidden="true" /> 초기화
          </CommonButton>
        </div>
        <div className="projects-filters-fields">
          {!projectApi && (
            <ProjectFilter
              label="분야"
              value={category}
              options={categoryOptions}
              onChange={setCategory}
            />
          )}
          <ProjectFilter
            label="모집 상태"
            value={activeStatus}
            options={["모집 중", "전체 상태", "모집 마감"]}
            onChange={setStatus}
          />
          <ProjectFilter
            label="정렬 방식"
            value={sort}
            options={["마감 임박순", "마감 여유순"]}
            onChange={setSort}
          />
        </div>
      </section>

      <div className="projects-section-heading">
        <h2>{query ? "검색 결과" : "추천 프로젝트"}</h2>
        {!projectList.loading && !projectList.error && (
          <span role="status">
            {query
              ? `“${query}” · ${visibleProjects.length}개`
              : `조건에 맞는 공고 ${visibleProjects.length}개`}
          </span>
        )}
      </div>
      <section
        className="project-card-grid"
        aria-label={query ? "프로젝트 검색 결과" : "추천 프로젝트"}
      >
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {projectList.loading && (
          <p className="projects-empty" role="status">
            공고를 불러오는 중이에요.
          </p>
        )}
        {projectList.error && (
          <div className="projects-empty">
            <p role="alert">{projectList.error}</p>
            <CommonButton variant="secondary" onClick={projectList.reload}>
              다시 불러오기
            </CommonButton>
          </div>
        )}
        {!projectList.loading &&
          !projectList.error &&
          visibleProjects.length === 0 && (
            <p className="projects-empty">
              {query
                ? "검색 결과가 없어요. 검색어나 필터를 바꿔 보세요."
                : "조건에 맞는 프로젝트가 없습니다."}
            </p>
          )}
      </section>
    </main>
  );
}

function compareDeadlines(first, second) {
  return (
    first.deadline.localeCompare(second.deadline) ||
    Number(first.deadlineHour ?? 24) - Number(second.deadlineHour ?? 24)
  );
}

export default ProjectsPage;
