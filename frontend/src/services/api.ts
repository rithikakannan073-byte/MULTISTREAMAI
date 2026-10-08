import { 
  Camera, Person, Event, EvidenceItem, Alert, 
  InvestigationResponse, Report, AuditLogEntry, UserProfile 
} from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

class ApiService {
  private getHeaders(token?: string): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const storedToken = token || localStorage.getItem('multistream_session_token');
    if (storedToken) {
      headers['Authorization'] = `Bearer ${storedToken}`;
    }
    return headers;
  }

  // Auth
  async sendOtp(phone_number: string): Promise<{ success: boolean; cooldown_seconds: number; demo_hint?: string; message: string }> {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phone_number }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to send OTP' }));
      throw new Error(err.detail || 'Failed to send OTP');
    }
    return res.json();
  }

  async verifyOtp(phone_number: string, otp: string): Promise<{ session_token: string; user: UserProfile; message: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ phone_number, otp }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Invalid OTP' }));
      throw new Error(err.detail || 'Invalid OTP. Please try again.');
    }
    const data = await res.json();
    localStorage.setItem('multistream_session_token', data.session_token);
    return data;
  }

  async getCurrentUser(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to retrieve user session');
    return res.json();
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } finally {
      localStorage.removeItem('multistream_session_token');
    }
  }

  // Cameras
  async getCameras(): Promise<Camera[]> {
    const res = await fetch(`${API_BASE}/cameras`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load cameras');
    return res.json();
  }

  async updateCamera(camera: Camera): Promise<Camera> {
    const res = await fetch(`${API_BASE}/cameras`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(camera),
    });
    if (!res.ok) throw new Error('Failed to update camera');
    return res.json();
  }

  // Investigation
  async queryInvestigation(query: string, context_person_id?: string, session_id?: string): Promise<InvestigationResponse> {
    const res = await fetch(`${API_BASE}/investigation/query`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query, context_person_id, session_id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Investigation query failed' }));
      throw new Error(err.detail || 'Investigation query failed');
    }
    return res.json();
  }

  async getEvidence(evidence_id: string): Promise<EvidenceItem> {
    const res = await fetch(`${API_BASE}/investigation/evidence/${evidence_id}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load evidence');
    return res.json();
  }

  // Persons & Journey
  async getPersons(): Promise<Person[]> {
    const res = await fetch(`${API_BASE}/persons`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load persons');
    return res.json();
  }

  async getPersonJourney(person_id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/persons/${person_id}/journey`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load person journey');
    return res.json();
  }

  // Events & Search
  async getEvents(filters?: { camera_id?: string; person_id?: string; event_type?: string; min_confidence?: number }): Promise<Event[]> {
    const params = new URLSearchParams();
    if (filters?.camera_id) params.set('camera_id', filters.camera_id);
    if (filters?.person_id) params.set('person_id', filters.person_id);
    if (filters?.event_type) params.set('event_type', filters.event_type);
    if (filters?.min_confidence) params.set('min_confidence', filters.min_confidence.toString());

    const res = await fetch(`${API_BASE}/events?${params.toString()}`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load events');
    return res.json();
  }

  async searchEvents(query: string): Promise<any> {
    const res = await fetch(`${API_BASE}/events/search`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  }

  // Alerts
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/alerts`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load alerts');
    return res.json();
  }

  async acknowledgeAlert(alert_id: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${alert_id}/acknowledge`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const res = await fetch(`${API_BASE}/analytics`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  }

  // Reports
  async getReports(): Promise<Report[]> {
    const res = await fetch(`${API_BASE}/reports`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  }

  async createReport(report: Partial<Report>): Promise<Report> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(report),
    });
    if (!res.ok) throw new Error('Failed to create report');
    return res.json();
  }

  async exportReport(report_id: string): Promise<{ report_id: string; format: string; content: string; filename: string }> {
    const res = await fetch(`${API_BASE}/reports/${report_id}/export`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to export report');
    return res.json();
  }

  // Audit Logs
  async getAuditLogs(): Promise<AuditLogEntry[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, { headers: this.getHeaders() });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  }
}

export const api = new ApiService();
