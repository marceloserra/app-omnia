import { openDatabase, createConversationRepo, createMessageRepo } from '../index';
import * as SQLite from 'expo-sqlite';

const mockGetAllSync = jest.fn(() => []);

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getAllSync: mockGetAllSync,
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

  describe('Message Pagination Logic', () => {
    it('should query without limit and offset by default', () => {
      const db = openDatabase();
      const repo = createMessageRepo(db);
      
      repo.listByConversation('conv-1');
      expect(mockGetAllSync).toHaveBeenCalledWith(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC",
        ['conv-1']
      );
    });

    it('should query with limit if provided', () => {
      const db = openDatabase();
      const repo = createMessageRepo(db);
      
      repo.listByConversation('conv-1', 50);
      expect(mockGetAllSync).toHaveBeenCalledWith(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ?",
        ['conv-1', 50]
      );
    });

    it('should query with limit and offset if both are provided', () => {
      const db = openDatabase();
      const repo = createMessageRepo(db);
      
      repo.listByConversation('conv-1', 20, 40);
      expect(mockGetAllSync).toHaveBeenCalledWith(
        "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC LIMIT ? OFFSET ?",
        ['conv-1', 20, 40]
      );
    });
  });
});
