import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { fromProjectDetail, projectIdString } from './projectContract.js';
import useProjectRequest from './useProjectRequest.js';

export default function useProjectDetail(projectId) {
  const { projectApi, apiUserId, workspace } = useOutletContext();
  const id = projectIdString(projectId);
  const request = useMemo(() => {
    if (!projectApi || !id) return null;
    return async (signal) => fromProjectDetail(await projectApi.read(id, { signal }), id, apiUserId);
  }, [projectApi, id, apiUserId]);
  const { data, ...state } = useProjectRequest(request);

  return {
    ...state,
    project: projectApi ? data : workspace.projects.find((project) => project.id === projectId),
  };
}
