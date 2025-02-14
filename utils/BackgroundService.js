import BackgroundService from 'react-native-background-actions';
import { listenToFriendRequests, listenToChatMessages } from './apiUtils';
import updateUserLocation from './locationUtils';
import { getAuth } from 'firebase/auth';
import { showNotification } from './notificationUtils';

//Definição da função sleep
const sleep = time => new Promise(resolve => setTimeout(resolve, time));

// Objetivo: Criar uma função sleep assíncrona que aguarda um tempo determinado antes de continuar a execução do código.
// Parâmetro time: Representa o tempo em milissegundos que a execução deve aguardar antes de continuar.
// Uso do setTimeout: Resolve a Promise após o tempo especificado, permitindo pausas dentro do loop assíncrono.


const veryIntensiveTask = async (taskDataArguments) => {
  const { delay } = taskDataArguments;
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    console.log('Usuário não autenticado. Serviço encerrado.');
    return;
  }

//   Objetivo: Executar tarefas de segundo plano para atualizar localização, buscar pedidos de amizade e mensagens de chat.
// taskDataArguments.delay: Obtém o valor de atraso configurado na execução do serviço.
// getAuth(): Obtém a instância da autenticação do Firebase.
// Verificação do usuário:
// Caso auth.currentUser seja null, significa que o usuário não está autenticado e o serviço é encerrado.

//Configuração dos Listeners para Amizades e Chat
  const friendRequestsListener = listenToFriendRequests(user.uid, (friendRequests) => {
    console.log('Pedidos de amizade:', friendRequests);
    if (friendRequests.length > 0) {
      showNotification('Novo Pedido de Amizade', 'Você tem novos pedidos de amizade!');
    }
  });

  const chatMessagesListener = listenToChatMessages(user.uid, (chatMessages) => {
    console.log('Mensagens de chat:', chatMessages);
  });

//   Escuta de solicitações de amizade:
// Usa listenToFriendRequests() para monitorar mudanças nos pedidos de amizade do usuário.
// Se houver novos pedidos, exibe uma notificação via showNotification().
// Escuta de mensagens de chat:
// Usa listenToChatMessages() para monitorar novas mensagens recebidas pelo usuário.
// Registra as mensagens no console.

//execução contínua no Background
  await new Promise(async (resolve) => {
    while (BackgroundService.isRunning()) {
      console.log('Serviço de segundo plano em execução...');
      await sleep(delay);
    }

    friendRequestsListener();
    chatMessagesListener();
    resolve();
  });
};

// Loop infinito enquanto o serviço estiver ativo:
// A função BackgroundService.isRunning() verifica se o serviço está ativo.
// Enquanto o serviço estiver rodando, o código continua a executar e aguarda (sleep(delay)) entre cada ciclo.
// Encerramento do serviço:
// Quando o serviço é interrompido, os listeners friendRequestsListener e chatMessagesListener são chamados para cancelar a escuta de eventos em tempo real.

//Configuração das opções do serviço
const options = {
  taskName: 'Egrechat',
  taskTitle: 'Egrechat Background Service',
  taskDesc: 'Atualizando dados em tempo real.',
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
