import BackgroundService from 'react-native-background-actions';
import updateUserLocation from './locationUtils';
import { fetchFriendRequests, fetchChatMessages } from './apiUtils';
import * as Location from 'expo-location';
import { getAuth } from 'firebase/auth';

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

const veryIntensiveTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  const auth = getAuth();
  const user = auth.currentUser;

  await new Promise(async (resolve) => {
    for (let i = 0; BackgroundService.isRunning(); i++) {
      if (user) {
        // Atualizar localização
        const location = await getCurrentLocation();
        if (location) {
          await updateUserLocation(user.uid, location);
        }

        // Buscar pedidos de amizade e mensagens de chat
        await fetchFriendRequests(user.uid);
        await fetchChatMessages(user.uid);
      }

      await sleep(delay);
    }
  });
};

const options = {
  taskName: 'Egrechat',
  taskTitle: 'Egrechat Background Service',
  taskDesc: 'Atualizando localização, pedidos de amizade e mensagens de chat.',
  taskIcon: {
    name: 'ic_launcher',
    type: 'mipmap',
  },
  color: '#ff00ff',
  linkingURI: 'egrechat://home',
  parameters: {
    delay: 60000, // 1 minuto
  },
};

export const startBackgroundService = async () => {
  await BackgroundService.start(veryIntensiveTask, options);
};

export const stopBackgroundService = async () => {
  await BackgroundService.stop();
};

async function getCurrentLocation() {
  try {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permissão para acessar localização foi negada');
      return null;
    }
    let location = await Location.getCurrentPositionAsync({});
    return location.coords;
  } catch (error) {
    console.error(error);
    return null;
  }
}
