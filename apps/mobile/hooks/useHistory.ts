import { useState, useCallback, useEffect } from 'react';
import { Conversation } from '@omnia/shared-types';
import { openDatabase, createConversationRepo, createMessageRepo } from '@omnia/storage';
import { logger } from '@omnia/logger';
import * as Haptics from 'expo-haptics';

export function useHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Lazy instantiate repositories to avoid heavy startup
  const getRepos = useCallback(() => {
    try {
      const db = openDatabase();
      return {
        convRepo: createConversationRepo(db),
        msgRepo: createMessageRepo(db),
      };
    } catch (error) {
      logger.error('useHistory', 'Failed to initialize database repositories', error);
      throw error;
    }
  }, []);

  const loadHistory = useCallback(() => {
    logger.debug('useHistory', 'Loading conversations from database');
    try {
      const { convRepo } = getRepos();
      const all = convRepo.listAll();
      setConversations(all);
      logger.debug('useHistory', `Loaded ${all.length} conversations successfully`);
    } catch (error) {
      logger.error('useHistory', 'Failed to load conversations', error);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [getRepos]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const pinConversation = useCallback((id: string, isPinned: boolean) => {
    logger.debug('useHistory', `Toggling pin status for conversation: ${id} -> ${isPinned}`);
    try {
      const { convRepo } = getRepos();
      convRepo.update(id, { isPinned });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, isPinned } : c));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      logger.error('useHistory', `Failed to pin conversation ${id}`, error);
    }
  }, [getRepos]);

  const deleteConversation = useCallback((id: string) => {
    logger.debug('useHistory', `Deleting conversation and its messages: ${id}`);
    try {
      const { convRepo, msgRepo } = getRepos();
      msgRepo.deleteByConversation(id);
      convRepo.delete(id);
      setConversations(prev => prev.filter(c => c.id !== id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.debug('useHistory', `Successfully deleted conversation ${id}`);
    } catch (error) {
      logger.error('useHistory', `Failed to delete conversation ${id}`, error);
    }
  }, [getRepos]);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    logger.debug('useHistory', `Renaming conversation: ${id} -> ${newTitle}`);
    try {
      const { convRepo } = getRepos();
      convRepo.update(id, { title: newTitle });
      setConversations(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    } catch (error) {
      logger.error('useHistory', `Failed to rename conversation ${id}`, error);
    }
  }, [getRepos]);

  return {
    conversations,
    isLoading,
    pinConversation,
    deleteConversation,
    renameConversation,
    refreshHistory: loadHistory,
  };
}
