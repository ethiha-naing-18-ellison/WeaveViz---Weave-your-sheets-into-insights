import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface Dataset {
  id: string;
  ownerId: string;
  name: string;
  originalName: string;
  storagePath: string;
  rowCount: number;
  fieldProfiles: string; // JSON string
  rowsSample: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface Dashboard {
  id: string;
  ownerId: string;
  name: string;
  config: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

interface Database {
  users: User[];
  datasets: Dataset[];
  dashboards: Dashboard[];
}

class JSONDatabase {
  private dbPath: string;
  private data: Database = {
    users: [],
    datasets: [],
    dashboards: []
  };

  constructor() {
    this.dbPath = path.join(process.cwd(), 'data', 'database.json');
    this.ensureDataDirectory();
    this.loadData();
  }

  private async ensureDataDirectory() {
    const dataDir = path.dirname(this.dbPath);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  private async loadData() {
    try {
      const fileContent = await fs.readFile(this.dbPath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // File doesn't exist or is empty, start with empty database
      await this.saveData();
    }
  }

  private async saveData() {
    await fs.writeFile(this.dbPath, JSON.stringify(this.data, null, 2));
  }

  // User operations
  async findUserByEmail(email: string): Promise<User | null> {
    const user = this.data.users.find(u => u.email === email);
    return user || null;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = this.data.users.find(u => u.id === id);
    return user || null;
  }

  async createUser(email: string, passwordHash: string): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now
    };
    
    this.data.users.push(user);
    await this.saveData();
    return user;
  }

  // Dataset operations
  async findDatasetsByOwnerId(ownerId: string): Promise<Dataset[]> {
    return this.data.datasets.filter(d => d.ownerId === ownerId);
  }

  async findDatasetById(id: string): Promise<Dataset | null> {
    const dataset = this.data.datasets.find(d => d.id === id);
    return dataset || null;
  }

  async createDataset(data: Omit<Dataset, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dataset> {
    const now = new Date().toISOString();
    const dataset: Dataset = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.datasets.push(dataset);
    await this.saveData();
    return dataset;
  }

  async deleteDataset(id: string): Promise<boolean> {
    const index = this.data.datasets.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.data.datasets.splice(index, 1);
    await this.saveData();
    return true;
  }

  // Dashboard operations
  async findDashboardsByOwnerId(ownerId: string): Promise<Dashboard[]> {
    return this.data.dashboards.filter(d => d.ownerId === ownerId);
  }

  async findDashboardById(id: string): Promise<Dashboard | null> {
    const dashboard = this.data.dashboards.find(d => d.id === id);
    return dashboard || null;
  }

  async createDashboard(data: Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    const now = new Date().toISOString();
    const dashboard: Dashboard = {
      ...data,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    
    this.data.dashboards.push(dashboard);
    await this.saveData();
    return dashboard;
  }

  async updateDashboard(id: string, updates: Partial<Omit<Dashboard, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Dashboard | null> {
    const index = this.data.dashboards.findIndex(d => d.id === id);
    if (index === -1) return null;
    
    const now = new Date().toISOString();
    this.data.dashboards[index] = {
      ...this.data.dashboards[index],
      ...updates,
      updatedAt: now
    };
    
    await this.saveData();
    return this.data.dashboards[index];
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const index = this.data.dashboards.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.data.dashboards.splice(index, 1);
    await this.saveData();
    return true;
  }
}

// Export singleton instance
export const db = new JSONDatabase();
