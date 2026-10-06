import axios, { AxiosError, AxiosHeaders, type AxiosInstance } from 'axios';

import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import { ApiError, type ApiErrorKind } from './errors';
import { getToken, setToken } from './tokenProvider';
import { notifyUnauthorized } from './unauthorizedHandler';

/** The envelope every Levanda endpoint responds with. */
export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
  exception?: string;
}

interface ServerErrorBody {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  exception?: string;
}

export const http: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

/* -------------------------------------------------------------------------- */
/* Request: attach the bearer token                                            */
/* -------------------------------------------------------------------------- */

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    // Typed loosely to stay compatible with both Axios header implementations.
    const headers = config.headers as AxiosHeaders;
    if (typeof headers.set === 'function') headers.set('Authorization', `Bearer ${token}`);
    else (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------------------------------------------------------------------------- */
/* Response: unwrap `data` and normalise errors                                */
/* -------------------------------------------------------------------------- */

const FRIENDLY_MESSAGES: Record<ApiErrorKind, string> = {
  offline: 'No internet connection. Check your network and try again.',
  timeout: 'The server took too long to respond. Please try again.',
  cancelled: 'Request cancelled.',
  unauthorized: 'Your session has expired. Please sign in again.',
  forbidden: 'You do not have permission to do that.',
  notFound: 'That resource could not be found.',
  methodNotAllowed: 'That action is not supported by the server.',
  validation: 'Please correct the highlighted fields.',
  conflict: 'That record already exists.',
  server: 'The server ran into a problem. Please try again shortly.',
  client: 'That request could not be completed.',
  unknown: 'Something went wrong. Please try again.',
};

function kindForStatus(status: number): ApiErrorKind {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 405) return 'methodNotAllowed';
  if (status === 409) return 'conflict';
  if (status === 422) return 'validation';
  if (status >= 500) return 'server';
  if (status >= 400) return 'client';
  return 'unknown';
}

function parseBody(raw: unknown): ServerErrorBody | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as ServerErrorBody) : null;
  } catch {
    return null;
  }
}

/**
 * A 403 is only described generically by the platform, but this backend returns
 * a meaningful business message (for example the product-categories feature
 * flag). Prefer the server text when it adds information.
 */
function resolveMessage(kind: ApiErrorKind, body: ServerErrorBody | null, status?: number): string {
  const serverMessage = body?.message?.trim();
  if (serverMessage && serverMessage.length > 0) {
    const generic = FRIENDLY_MESSAGES[kind];
    if (serverMessage !== generic) return serverMessage;
  }
  if (kind === 'notFound' && status !== undefined) {
    return 'That resource could not be found on the server.';
  }
  return FRIENDLY_MESSAGES[kind];
}

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ServerErrorBody>) => {
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      return Promise.reject(new ApiError({ kind: 'cancelled', message: FRIENDLY_MESSAGES.cancelled }));
    }

    if (error.response === undefined) {
      const kind: ApiErrorKind = error.code === 'ECONNABORTED' ? 'timeout' : 'offline';
      return Promise.reject(
        new ApiError({
          kind,
          message: FRIENDLY_MESSAGES[kind],
          detail: error.message,
        }),
      );
    }

    const { status, data } = error.response;
    const body = (data as ServerErrorBody | undefined) ?? parseBody(error.message);
    const kind = kindForStatus(status);
    const apiError = new ApiError({
      kind,
      message: resolveMessage(kind, body ?? null, status),
      status,
      fieldErrors: body?.errors ?? {},
      detail: body?.exception ?? error.message,
    });

    if (kind === 'unauthorized') {
      setToken(null);
      void notifyUnauthorized();
    }

    return Promise.reject(apiError);
  },
);

/**
 * Issues a request and returns the unwrapped `data` payload.
 * `apiResponse.data` is guaranteed to be the inner payload by this helper.
 */
export async function request<T>(config: Parameters<AxiosInstance['request']>[0]): Promise<T> {
  const response = await http.request<ApiEnvelope<T>>(config);
  return response.data.data;
}

/** Same as {@link request} but returns the whole envelope (needs `message`). */
export async function requestEnvelope<T>(
  config: Parameters<AxiosInstance['request']>[0],
): Promise<ApiEnvelope<T>> {
  const response = await http.request<ApiEnvelope<T>>(config);
  return response.data;
}