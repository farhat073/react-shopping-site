const strapiUrl = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337';

class StrapiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  async get(endpoint: string, params?: Record<string, any>) {
    const url = new URL(`${this.baseURL}/api${endpoint}`);
    if (params) {
      Object.keys(params).forEach(key => {
        url.searchParams.append(key, params[key]);
      });
    }
    const response = await fetch(url.toString(), {
      headers: this.getHeaders(),
    });
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async put(endpoint: string, data: any) {
    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseURL}/api${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return response.json();
  }
}

export const strapi = new StrapiClient(strapiUrl);