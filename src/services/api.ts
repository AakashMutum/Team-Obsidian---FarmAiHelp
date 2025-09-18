// API Service for Auth and Data operations
const API_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

// Type definitions
export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface FarmData {
  id: number;
  user_id: number;
  total_land: number;
  crop_types: string[];
  expected_revenue: number;
  active_crops: string[];
  soil_type: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  location?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardData {
  user: User;
  farmData: FarmData;
}

// Helper for handling API errors
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    } catch (e) {
      // If parsing JSON fails
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
  }
  return response.json();
};

// API functions
export const authService = {
  // Register a new user
  async register(data: RegisterData): Promise<{ message: string }> {
    try {
      console.log("Making registration request to:", `${API_URL}/register`);
      console.log("Request data:", JSON.stringify(data, null, 2));
      
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      console.log("Registration response status:", response.status);
      
      return handleResponse(response);
    } catch (error) {
      console.error("Registration network error:", error);
      throw error;
    }
  },

  // Login user and get token
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get current user token
  getToken(): string | null {
    return localStorage.getItem('token');
  },

  // Save user token
  setToken(token: string): void {
    localStorage.setItem('token', token);
  },

  // Remove token on logout
  removeToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Save user data
  setUserData(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get saved user data
  getUserData(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken();
  },
};

export const userService = {
  // Get dashboard data
  async getDashboardData(): Promise<DashboardData> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/user/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Update farm data
  async updateFarmData(data: Partial<FarmData>): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${API_URL}/user/farm-data`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        totalLand: data.total_land,
        cropTypes: data.crop_types,
        expectedRevenue: data.expected_revenue,
        activeCrops: data.active_crops,
        soilType: data.soil_type,
      }),
    });
    return handleResponse(response);
  },
};