import { useCallback } from 'react';
import { openDatabase, createConversationRepo, createMessageRepo } from '@omnia/storage';
import { logger } from '@omnia/logger';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export function useSettingsManager() {
  const clearAllData = useCallback(() => {
    logger.debug('useSettingsManager', 'User requested full database wipe');
    try {
      const db = openDatabase();
      createMessageRepo(db).deleteAll();
      createConversationRepo(db).deleteAll();
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      logger.info('useSettingsManager', 'All application data wiped successfully');
    } catch (error) {
      logger.error('useSettingsManager', 'Failed to clear application data', error);
      Alert.alert("Error", "Could not clear data. Check application logs.");
    }
  }, []);

  return {
    clearAllData,
  };
}
