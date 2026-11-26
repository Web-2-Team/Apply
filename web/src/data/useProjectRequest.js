import { useEffect, useState } from 'react';

export default function useProjectRequest(request) {
  const [completed, setCompleted] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await request(controller.signal);
        if (!controller.signal.aborted) setCompleted({ request, version, data });
      } catch (error) {
        if (!controller.signal.aborted) {
          setCompleted({ request, version, error: error instanceof Error ? error.message : '공고 정보를 불러오지 못했어요.' });
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [request, version]);

  const result = completed?.request === request && completed.version === version ? completed : null;
  return {
    data: result?.data,
    error: result?.error ?? '',
    loading: Boolean(request && !result),
    reload: () => setVersion((current) => current + 1),
  };
}
