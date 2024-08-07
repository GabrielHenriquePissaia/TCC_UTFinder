import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

export const showNotification = async (title, body) => {
  const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
  if (status !== 'granted') {
    console.log('Permissão para enviar notificações foi negada');
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null,
  });
};