import { fetchUtils } from 'react-admin';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const httpClient = (url: string, options: any = {}) => {
  const token = localStorage.getItem('admin_token');
  if (!options.headers) {
    options.headers = new Headers();
  }
  if (token) {
    options.headers.set('Authorization', `Bearer ${token}`);
  }
  options.headers.set('Content-Type', 'application/json');
  return fetchUtils.fetchJson(url, options);
};

export const dataProvider = {
  getList: async (resource, params) => {
    const { page, perPage } = params.pagination;

    if (resource === 'restaurant') {
      const { json } = await httpClient(`${API_URL}/restaurant`);
      return {
        data: json ? [json] : [],
        total: json ? 1 : 0,
      };
    }

    const query: Record<string, string> = {
      page: page.toString(),
      pageSize: perPage.toString(),
    };

    if (resource === 'news') {
      query.all = 'true';
    }

    const url = `${API_URL}/${resource}?${new URLSearchParams(query).toString()}`;
    const { json } = await httpClient(url);

    return {
      data: json.items || json,
      total: json.total || (Array.isArray(json) ? json.length : 0),
    };
  },

  getOne: async (resource, params) => {
    if (resource === 'restaurant') {
      const { json } = await httpClient(`${API_URL}/restaurant`);
      return { data: json };
    }

    const url = `${API_URL}/${resource}/${params.id}`;
    const { json } = await httpClient(url);
    return { data: json };
  },

  getMany: async (resource, params) => {
    if (resource === 'restaurant') {
      const { json } = await httpClient(`${API_URL}/restaurant`);
      return { data: json ? [json] : [] };
    }

    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`)
    );
    const responses = await Promise.all(promises);
    return {
      data: responses.map(({ json }) => json),
    };
  },

  getManyReference: async (resource, params) => {
    const { page, perPage } = params.pagination;
    const query = {
      page: page.toString(),
      pageSize: perPage.toString(),
    };
    const url = `${API_URL}/${resource}?${new URLSearchParams(query).toString()}`;
    const { json } = await httpClient(url);
    return {
      data: json.items || json,
      total: json.total || (Array.isArray(json) ? json.length : 0),
    };
  },

  create: async (resource, params) => {
    const url = `${API_URL}/${resource}`;
    const { json } = await httpClient(url, {
      method: 'POST',
      body: JSON.stringify(params.data),
    });

    if (!json) {
      throw new Error('Empty response from server');
    }

    if (json.ID !== undefined && json.id === undefined) {
      json.id = json.ID;
    }

    if (json.id !== undefined) {
      json.id = typeof json.id === 'string' ? parseInt(json.id, 10) : json.id;
    } else {
      throw new Error('Response missing id field');
    }

    return { data: json };
  },

  update: async (resource, params) => {
    let url = `${API_URL}/${resource}/${params.id}`;
    if (resource === 'restaurant') {
      url = `${API_URL}/admin/restaurant`;
    }

    const { json } = await httpClient(url, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      })
    );
    const responses = await Promise.all(promises);
    return {
      data: responses.map(({ json }) => json.id),
    };
  },

  delete: async (resource, params) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    await httpClient(url, { method: 'DELETE' });
    return { data: { id: params.id } };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${API_URL}/${resource}/${id}`, { method: 'DELETE' })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};
