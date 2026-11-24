import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import ProjectCard from "../../components/ProjectCard/ProjectCard";
import { categories, isRecruiting } from "../../data/workspace";
import "./ProjectsPage.styles.css";

function ProjectsPage() {
  const {
    workspace: { projects },
  } = useOutletContext();
  const [category, setCategory] = useState("전체 분야");
  const [status, setStatus] = useState("모집 중");
  const [sort, setSort] = useState("마감 임박순");

  const visibleProjects = projects
    .filter(
      (project) => category === "전체 분야" || project.category === category,
    )
    .filter(
      (project) =>
        status === "전체 상태" ||
        (status === "모집 중") === isRecruiting(project),
    )
    .sort((a, b) =>
      sort === "마감 임박순"
        ? a.deadline.localeCompare(b.deadline)
        : b.deadline.localeCompare(a.deadline),
    );

  const resetFilters = () => {
    setCategory("전체 분야");
    setStatus("모집 중");
    setSort("마감 임박순");
  };

  return (
    <main className="projects-content">
      <div className="projects-title-block">
        <h1>프로젝트 찾기</h1>
        <p>관심 있는 팀의 공고를 둘러보고, 다음 프로젝트를 시작해 보세요.</p>
      </div>

      <section className="projects-filters" aria-label="프로젝트 필터">
        <span>분야</span>
        <select
          aria-label="분야 선택"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option>전체 분야</option>
          {categories.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <select
          aria-label="모집 상태 선택"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option>모집 중</option>
          <option>전체 상태</option>
          <option>모집 마감</option>
        </select>
        <select
          aria-label="정렬 방식 선택"
          value={sort}
          onChange={(event) => setSort(event.target.value)}
        >
          <option>마감 임박순</option>
          <option>마감 여유순</option>
        </select>
        <button className="projects-reset" type="button" onClick={resetFilters}>
          필터 초기화
        </button>
      </section>

      <div className="projects-section-heading">
        <h2>추천 프로젝트</h2>
        <span>조건에 맞는 공고 {visibleProjects.length}개</span>
      </div>
      <section className="project-card-grid" aria-label="추천 프로젝트">
        {visibleProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
        {visibleProjects.length === 0 && (
          <p className="projects-empty">조건에 맞는 프로젝트가 없습니다.</p>
        )}
      </section>
    </main>
  );
}

export default ProjectsPage;
