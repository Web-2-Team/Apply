import assert from 'node:assert/strict';
import test from 'node:test';
import { createProjectApi, ProjectApiError } from '../src/data/projectApi.js';

const baseUrl = 'https://api.example.test/v1';
const posting = {
  title: '제목',
  subtitle: '한 줄 소개',
  desc: '내용',
  spec: { FE: 2, BE: 1 },
  deadline: '2026-11-30-18',
};
const project = { 'project-id': 1, 'user-id': 7, title: posting.title };
const detail = {
  project: [project],
  spec: [{ id: 1, 'project-id': 1, 'spec-name': 'FE', 'spec-size': 2 }],
};

test('명세의 공고 요청 7개를 전송한다', async (t) => {
  const { signal } = new AbortController();
  const cases = [
    { call: (api) => api.list({ signal }), method: 'GET', path: '/read', signal, result: [project] },
    { call: (api) => api.read(1, { signal }), method: 'GET', path: '/read/1', signal, result: detail },
    { call: (api) => api.create(posting), method: 'POST', path: '/create', body: posting },
    { call: (api) => api.update(1, posting), method: 'PATCH', path: '/update/1', body: posting },
    { call: (api) => api.remove(1), method: 'DELETE', path: '/delete/1' },
    { call: (api) => api.apply(1, 'UI/UX +'), method: 'POST', path: '/apply/1?spec=UI%2FUX+%2B' },
    { call: (api) => api.decide(1, '9223372036854775807', false), method: 'PATCH', path: '/pass/1/9223372036854775807?pass=false' },
    { call: (api) => api.decide(1, 7, true), method: 'PATCH', path: '/pass/1/7?pass=true' },
  ];

  for (const row of cases) {
    await t.test(`${row.method} ${row.path}`, async () => {
      const fetcher = t.mock.fn(() => row.result
        ? Response.json(row.result, { status: row.path === '/read' ? 200 : 201 })
        : new Response(null, { status: 201 })
      );
      const api = createProjectApi({
        baseUrl: `${baseUrl}/`,
        getAccessToken: () => 'test-token',
        fetcher,
      });

      assert.deepEqual(await row.call(api), row.result);
      assert.equal(fetcher.mock.callCount(), 1);

      const [url, request] = fetcher.mock.calls[0].arguments;
      assert.equal(url, `${baseUrl}/project${row.path}`);
      assert.equal(request.method, row.method);
      assert.equal(request.headers.Authorization, 'Bearer test-token');
      assert.equal(request.headers.Accept, 'application/json');
      assert.equal(request.signal, row.signal);
      if (row.body) {
        assert.equal(request.headers['Content-Type'], 'application/json');
        assert.deepEqual(JSON.parse(request.body), row.body);
      } else {
        assert.equal(request.headers['Content-Type'], undefined);
        assert.equal(request.body, undefined);
      }
    });
  }
});

test('요청마다 현재 토큰을 확인하고 토큰이 없으면 전송하지 않는다', async (t) => {
  let token;
  const fetcher = t.mock.fn(() => Response.json([]));
  const api = createProjectApi({ getAccessToken: () => token, fetcher });

  await assert.rejects(api.list(), { name: 'ProjectApiError', status: 401, code: 'AUTH_REQUIRED' });
  assert.equal(fetcher.mock.callCount(), 0);

  token = 'first';
  await api.list();
  token = 'renewed';
  await api.list();

  assert.equal(fetcher.mock.calls[0].arguments[0], '/project/read');
  assert.equal(fetcher.mock.calls[0].arguments[1].headers.Authorization, 'Bearer first');
  assert.equal(fetcher.mock.calls[1].arguments[1].headers.Authorization, 'Bearer renewed');
});

test('서버 실패 상태와 업무별 안내를 전달한다', async () => {
  let status = 400;
  const api = createProjectApi({
    getAccessToken: () => 'test',
    fetcher: () => new Response(null, { status }),
  });
  const cases = [
    [400, () => api.apply(1, 'FE'), /본인이 작성한 공고에는 지원/],
    [400, () => api.update(1, posting), /본인이 작성한 공고의 수정/],
    [401, () => api.list(), /로그인/],
    [404, () => api.decide(1, 7, false), /공고 또는 지원자/],
    [500, () => api.remove(1), /서버 오류/],
  ];
  for (const [responseStatus, call, pattern] of cases) {
    status = responseStatus;
    await assert.rejects(call, { name: 'ProjectApiError', status, message: pattern });
  }
});

test('요청 취소와 통신·응답 오류를 구별한다', async () => {
  const abort = new DOMException('Aborted', 'AbortError');
  const apiFor = (fetcher) => createProjectApi({ getAccessToken: () => 'test', fetcher });

  await assert.rejects(apiFor(() => { throw abort; }).list(), (error) => error === abort);
  await assert.rejects(
    apiFor(() => { throw new TypeError('Failed to fetch'); }).list(),
    (error) => error instanceof ProjectApiError && error.code === 'NETWORK_ERROR'
  );
  await assert.rejects(apiFor(() => new Response('wrong')).list(), { code: 'INVALID_RESPONSE' });
});

test('로컬 데이터 ID가 서버 요청에 들어가는 것을 막는다', async (t) => {
  const fetcher = t.mock.fn();
  const api = createProjectApi({ getAccessToken: () => 'test', fetcher });
  await assert.rejects(api.remove('demo-project'), { code: 'INVALID_ID' });
  await assert.rejects(api.decide(1, Number.MAX_SAFE_INTEGER + 1, true), { code: 'INVALID_ID' });
  assert.equal(fetcher.mock.callCount(), 0);
});
