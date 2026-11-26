const authMessage = "로그인이 필요합니다. 다시 로그인해 주세요.";

const badRequestMessages = {
  create: "제목, 한 줄 소개, 내용과 모집 정보를 확인해 주세요.",
  update: "본인이 작성한 공고의 수정 내용을 확인해 주세요.",
  remove: "본인이 작성한 공고만 삭제할 수 있습니다.",
  apply: "본인이 작성한 공고에는 지원할 수 없습니다.",
  decide: "본인이 작성한 공고의 지원자만 심사할 수 있습니다.",
};

export class ProjectApiError extends Error {
  constructor(message, { status = null, code, cause } = {}) {
    super(message, { cause });
    this.name = "ProjectApiError";
    this.status = status;
    this.code = code;
  }
}

function getResponseError(status, action) {
  if (status === 401)
    return new ProjectApiError(authMessage, { status, code: "AUTH_REQUIRED" });
  if (status === 400) {
    return new ProjectApiError(
      badRequestMessages[action] ?? "공고 요청 내용을 확인해 주세요.",
      { status },
    );
  }
  if (status === 404) {
    const target = action === "decide" ? "공고 또는 지원자" : "공고";
    return new ProjectApiError(`${target}를 찾을 수 없습니다.`, { status });
  }
  if (status >= 500) {
    return new ProjectApiError(
      "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
      { status },
    );
  }
  return new ProjectApiError(`공고 요청에 실패했습니다. (HTTP ${status})`, {
    status,
  });
}

function idSegment(value) {
  const id = String(value);
  if (
    (typeof value === "number" && !Number.isSafeInteger(value)) ||
    !/^[1-9]\d*$/.test(id)
  ) {
    throw new ProjectApiError("공고 또는 사용자 번호를 확인해 주세요.", {
      code: "INVALID_ID",
    });
  }
  return id;
}

export function createProjectApi({
  baseUrl = "",
  getAccessToken,
  fetcher = globalThis.fetch,
}) {
  const projectUrl = `${baseUrl.trim().replace(/\/+$/, "")}/project`;

  async function request(
    action,
    method,
    path,
    { payload, query, signal } = {},
  ) {
    const token = await getAccessToken();
    if (!token?.trim()) {
      throw new ProjectApiError(authMessage, {
        status: 401,
        code: "AUTH_REQUIRED",
      });
    }

    const headers = {
      Accept: "application/json",
      Authorization: `Bearer ${token.trim()}`,
    };
    const options = { method, headers, signal };
    if (payload !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(payload);
    }

    const search = query ? `?${new URLSearchParams(query)}` : "";
    let response;
    try {
      response = await fetcher(`${projectUrl}${path}${search}`, options);
    } catch (cause) {
      if (signal?.aborted || cause?.name === "AbortError") throw cause;
      throw new ProjectApiError(
        "공고 서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.",
        {
          code: "NETWORK_ERROR",
          cause,
        },
      );
    }

    if (!response.ok) throw getResponseError(response.status, action);
    if (method !== "GET") return;

    try {
      return await response.json();
    } catch (cause) {
      if (signal?.aborted || cause?.name === "AbortError") throw cause;
      throw new ProjectApiError("서버의 공고 응답을 읽을 수 없습니다.", {
        status: response.status,
        code: "INVALID_RESPONSE",
        cause,
      });
    }
  }

  return {
    list: ({ signal } = {}) => request("list", "GET", "/read", { signal }),
    read: async (id, { signal } = {}) =>
      request("read", "GET", `/read/${idSegment(id)}`, { signal }),
    create: (payload) => request("create", "POST", "/create", { payload }),
    update: async (id, payload) =>
      request("update", "PATCH", `/update/${idSegment(id)}`, { payload }),
    remove: async (id) =>
      request("remove", "DELETE", `/delete/${idSegment(id)}`),
    apply: async (id, spec) =>
      request("apply", "POST", `/apply/${idSegment(id)}`, { query: { spec } }),
    decide: async (id, userId, passed) =>
      request(
        "decide",
        "PATCH",
        `/pass/${idSegment(id)}/${idSegment(userId)}`,
        {
          query: { pass: passed },
        },
      ),
  };
}
