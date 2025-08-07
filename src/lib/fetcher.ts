export type FetcherOptions = {
  method?: 'GET' | 'POST';
  searchParams?: Record<string, string | number | boolean>;
  body?: Record<string, any> | FormData;
  headers?: Record<string, string>;
  responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer';
};

export function fetcher(base: string) {
  return async <T>(endpoint: string, options: FetcherOptions = { method: 'GET' }): Promise<T> => {
    const url = new URL(endpoint, base);
    const { method = 'GET', searchParams, body, headers = {}, responseType = 'json' } = options;

    if (searchParams) {
      Object.entries(searchParams).forEach(([k, v]) => {
        if (v !== null && v !== undefined) {
          url.searchParams.append(k, String(v));
        }
      });
    }

    const fetchHeaders: Record<string, string> = {
      ...headers,
    };

    const isFormData = body instanceof FormData;
    if (!isFormData && method === 'POST') {
      fetchHeaders['Content-Type'] = 'application/json';
    }
  
    const res = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    });

    let data: any;
    switch (responseType) {
      case 'blob':
        data = await res.blob();
        break;
      case 'text':
        data = await res.text();
        break;
      case 'arrayBuffer':
        data = await res.arrayBuffer();
        break;
      default:
        if (res.ok) {
          data = await res.json();
        } else {
          try {
            data = await res.json();
          } catch {
            try {
              data = await res.text();
            } catch {
              data = { message: 'Unknown error' };
            }
          }
          throw new Error('API Error');
        }
    }

    if (typeof data === 'object' && data !== null) {
      data.status = res.status;
    }

    return data as T;
  };
}