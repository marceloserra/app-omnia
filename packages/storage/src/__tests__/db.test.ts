import { openDatabase, createConversationRepo, createMessageRepo } from '../index';
import * as SQLite from 'expo-sqlite';

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => null)
  }))
}));

describe('Storage Package', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should open database and run migrations', () => {
    const db = openDatabase();
    expect(SQLite.openDatabaseSync).toHaveBeenCalledWith('omnia.db');
    expect(db).toBeDefined();
  });

  it('should create conversation repo successfully', () => {
    const db = openDatabase();
    const repo = createConversationRepo(db);
    expect(repo.listAll).toBeDefined();
    expect(repo.getById).toBeDefined();
    expect(repo.create).toBeDefined();
    expect(repo.delete).toBeDefined();
  });

  it('should create message repo successfully', () => {
    const db = openDatabase();
    const repo = createMessageRepo(db);
    expect(repo.listByConversation).toBeDefined();
    expect(repo.create).toBeDefined();
    expect(repo.updateContent).toBeDefined();
  });
});
