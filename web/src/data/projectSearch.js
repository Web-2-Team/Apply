import { getProjectCategories, getProjectRoles } from './workspace.js';

export function matchesProjectSearch(project, query, applicantNames = []) {
  const terms = query.trim().normalize().toLowerCase();
  if (!terms) return true;

  const searchableText = [
    project.title,
    project.description,
    project.overview,
    ...getProjectCategories(project),
    ...getProjectRoles(project).map(({ title }) => title),
    ...applicantNames,
  ].join(' ').normalize().toLowerCase();

  return terms.split(/\s+/).every((term) => searchableText.includes(term));
}
