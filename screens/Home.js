import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { collection, getDocs, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuth from '../hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import Slider from '@react-native-community/slider';
import { serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import updateUserLocation from '../utils/locationUtils';
import { listenToFriendRequests, listenToChatMessages } from '../utils/apiUtils';

const Home = () => {
  const { user } = useAuth(); // Obtém o usuário autenticado
  const [users, setUsers] = useState([]); // Estado para armazenar a lista de usuários
  const [filteredUsers, setFilteredUsers] = useState([]); // Estado para armazenar usuários filtrados
  const [friends, setFriends] = useState([]); // Estado para armazenar amigos do usuário
  const [selectedYear, setSelectedYear] = useState(null); // Estado para armazenar ano de formação selecionado
  const [blockedUsers, setBlockedUsers] = useState([]); // Estado para armazenar lista de usuários bloqueados
  const [blockedByUsers, setBlockedByUsers] = useState([]); // Estado para armazenar lista de usuários que bloquearam o usuário atual
  const [distanceFilter, setDistanceFilter] = useState(200); // Estado para armazenar filtro de distância (em KM)
  const [searchText, setSearchText] = useState(''); // Estado para armazenar texto da busca
  const navigation = useNavigation(); // Hook para manipular a navegação
  const [pendingRequests, setPendingRequests] = useState([]); // Estado para armazenar pedidos de amizade pendentes
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento dos dados

  const haversineDistance = (coords1, coords2) => {
    const R = 6371; // Raio da terra
    // Converte as coordenadas de latitude de graus para radianos.
    const lat1 = coords1.latitude * Math.PI / 180;
    const lat2 = coords2.latitude * Math.PI / 180;
    // Calcula a diferença em latitude e longitude entre os dois pontos e converte para radianos.
    const deltaLat = (coords2.latitude - coords1.latitude) * Math.PI / 180;
    const deltaLon = (coords2.longitude - coords1.longitude) * Math.PI / 180;
    // Fórmula de Haversine: calcula a distância esférica entre dois pontos na Terra.
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia em km
  };

  /*
  - Esta função calcula a distância entre dois pontos geográficos (latitude e longitude) na superfície da Terra.
  - Utiliza a fórmula de Haversine, que é uma equação matemática usada para determinar distâncias em uma esfera.
  - A conversão de graus para radianos é necessária, pois as funções trigonométricas em JavaScript operam em radianos.
  - O resultado é a distância entre os dois pontos em quilômetros.
  - Essa função é usada, por exemplo, para calcular a proximidade entre usuários no aplicativo.
*/

  useEffect(() => {
    if (user) {
      const unsubscribeFriendRequests = listenToFriendRequests(user.uid, (friendRequests) => {
        setPendingRequests(friendRequests.map(request => request.requesterId));
      });
  
      const unsubscribeChatMessages = listenToChatMessages(user.uid, (chatMessages) => {
        console.log('Mensagens de chat:', chatMessages);
      });
  
      return () => {
        unsubscribeFriendRequests();
        unsubscribeChatMessages();
      };
    }
  }, [user]);
  
  /*
  - Este efeito executa quando o estado do `user` muda, ou seja, quando um usuário faz login, logout ou seus dados são atualizados.
  - Ele ativa dois listeners que monitoram em tempo real:
    1. `listenToFriendRequests`: Atualiza a lista de solicitações de amizade do usuário autenticado.
    2. `listenToChatMessages`: Monitora mensagens de chat recebidas e exibe no console para depuração.
  - Os listeners usam `onSnapshot`, garantindo que qualquer alteração no Firestore seja refletida imediatamente na interface do usuário.
  - O `return` dentro do `useEffect` garante que os listeners sejam removidos quando o componente for desmontado ou o usuário mudar, evitando vazamentos de memória.
  */

  useEffect(() => {
    if (user && user.uid) {
      const unsubscribeFriendRequests = listenToFriendRequests(user.uid, (friendRequests) => {
        setPendingRequests(friendRequests.map(request => request.requesterId));
        setIsLoading(false); // Dados carregados
      });
  
      const unsubscribeChatMessages = listenToChatMessages(user.uid, (chatMessages) => {
        console.log('Mensagens de chat atualizadas:', chatMessages);
        setIsLoading(false); // Dados carregados
      });
  
      return () => {
        unsubscribeFriendRequests();
        unsubscribeChatMessages();
      };
    }
  }, [user]);

  /*
  - Este efeito executa sempre que o estado do `user` muda.
  - Garante que o `user.uid` esteja disponível antes de ativar os listeners, evitando erros.
  - Ativa dois listeners para monitoramento em tempo real no Firestore:
    1. `listenToFriendRequests`: Atualiza a lista de solicitações de amizade em tempo real.
    2. `listenToChatMessages`: Captura mensagens de chat recebidas e as exibe no console.
  - O `setIsLoading(false)` é acionado após a atualização de dados, removendo qualquer estado de carregamento.
  - O `return` no final remove os listeners sempre que o usuário muda ou o componente é desmontado, prevenindo vazamentos de memória.
  */

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (doc) => {
      const userData = doc.data();
      if (userData.location && userData.location.latitude !== null && userData.location.longitude !== null) {
        fetchUsers(userData.location);
      } else {
        fetchUsers(null);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [user.uid, distanceFilter, blockedUsers, blockedByUsers]);

  /*
  - Este efeito é acionado sempre que `user.uid`, `distanceFilter`, `blockedUsers` ou `blockedByUsers` mudam.
  - Ativa um listener `onSnapshot` no Firestore para monitorar alterações no documento do usuário logado.
  - Quando os dados do usuário são atualizados:
    1. Verifica se o usuário tem uma localização válida (latitude e longitude não nulas).
    2. Se a localização for válida, chama `fetchUsers(userData.location)` para buscar usuários próximos.
    3. Se não houver localização válida, chama `fetchUsers(null)` para evitar erros na busca.
  - O `return` remove o listener ao desmontar o componente, prevenindo vazamentos de memória.
  - A dependência no array `[]` faz com que este efeito seja reexecutado sempre que os dados do usuário mudarem, garantindo que a lista de usuários próximos esteja sempre atualizada.
  */

  useEffect(() => {
    if (user) {
      const blockedRef = collection(db, "users", user.uid, "blockedUsers");
      const blockedByRef = collection(db, "users", user.uid, "blockedByUser");

      const unsubscribeBlocked = onSnapshot(blockedRef, (snapshot) => {
        const blocked = snapshot.docs.map(doc => doc.id);
        setBlockedUsers(blocked);
      });

      const unsubscribeBlockedBy = onSnapshot(blockedByRef, (snapshot) => {
        const blockedBy = snapshot.docs.map(doc => doc.id);
        setBlockedByUsers(blockedBy);
      });

      return () => {
        unsubscribeBlocked();
        unsubscribeBlockedBy();
      };
    }
  }, [user]);

  /*
  - Este efeito é acionado sempre que a variável `user` mudar.
  - Ele cria dois listeners `onSnapshot` para monitorar em tempo real:
    1. A lista de usuários bloqueados pelo usuário logado.
    2. A lista de usuários que bloquearam o usuário logado.
  - Quando os dados mudam no Firestore:
    1. `setBlockedUsers(blocked);` atualiza a lista de usuários bloqueados.
    2. `setBlockedByUsers(blockedBy);` atualiza a lista de usuários que bloquearam o usuário.
  - O `return` remove os listeners quando o componente é desmontado ou `user` muda, prevenindo vazamentos de memória.
  - Isso garante que a interface do aplicativo sempre exiba os dados mais atualizados sobre bloqueios.
  */

  const fetchUsers = async (location) => {
    if (user) {
       // Obtém todos os documentos da coleção "users" no Firestore
      const querySnapshot = await getDocs(collection(db, "users"));
      
       // Mapeia os documentos para um array de objetos contendo os dados dos usuários
      const fetchedUsers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Calcula a distância entre o usuário atual e os outros usuários se a localização for válida
        distance: doc.data().location && location ? haversineDistance(location, doc.data().location) : null
      }));
  
      let filteredUsers;
      // Se o filtro de distância for menor ou igual a 500 km, aplica um filtro adicional
      if (distanceFilter <= 500) {
        if (location && location.latitude !== null && location.longitude !== null) {
           // Filtra usuários baseando-se na localização e na distância, além de remover bloqueios
          filteredUsers = fetchedUsers.filter(u => 
            u.location !== null && 
            u.distance <= distanceFilter && 
            !blockedUsers.includes(u.id) && 
            !blockedByUsers.includes(u.id)
          );
        } else {
          filteredUsers = []; // Usuário sem localização não vê ninguém quando a distância é <= 500
        }
      } else {
        // Mostrar todos os usuários, independente da localização
        filteredUsers = fetchedUsers.filter(u => 
          !blockedUsers.includes(u.id) && 
          !blockedByUsers.includes(u.id)
        );
      }
      
      // Atualiza os estados de usuários filtrados
      setUsers(filteredUsers);
      setFilteredUsers(filteredUsers);
    } else {
      console.log("Usuário deslogado ou localização do usuário não informada");
       // Se não houver um usuário logado ou sem localização, limpa a lista de usuários
      setUsers([]);
      setFilteredUsers([]);
    }
  };
  
  /*
  Explicação da função fetchUsers:
  - Esta função busca todos os usuários do Firestore.
  - Se a localização do usuário estiver disponível, calcula a distância para os outros usuários usando a função `haversineDistance`.
  - Se a distância filtrada for menor ou igual a 500 km:
    1. Apenas usuários dentro dessa distância são exibidos.
    2. Usuários bloqueados e que bloquearam o usuário logado são removidos da lista.
  - Se o filtro for maior que 500 km:
    1. Todos os usuários são carregados, independentemente da distância.
    2. Usuários bloqueados e bloqueadores ainda são removidos.
  - Se o usuário não estiver logado ou não tiver localização registrada:
    1. O console exibe um aviso.
    2. A lista de usuários é esvaziada (`setUsers([])` e `setFilteredUsers([])`).
  - Essa abordagem garante que os usuários exibidos respeitem as regras de bloqueio e filtros de distância.
*/


//buscar amigos e solicitações pendentes
  useEffect(() => {
    if (user) {
      const friendsRef = collection(db, "friends", user.uid, "userFriends");
      const requestsRef = collection(db, "friendRequests", user.uid, "requests");
  
      getDocs(friendsRef).then(snapshot => {
        const friendList = snapshot.docs.map(doc => doc.id);
        setFriends(friendList);
      }).catch(error => {
        console.error("Erro ao buscar amigos:", error);
      });
  
      getDocs(requestsRef).then(snapshot => {
        const requestsList = snapshot.docs.map(doc => doc.id);
        setPendingRequests(requestsList);
      }).catch(error => {
        console.error("Erro ao buscar solicitações pendentes:", error);
      });
    }
  }, [user, blockedUsers, blockedByUsers]);

// Esse useEffect executa a busca de amigos e solicitações de amizade pendentes do usuário sempre que o user, blockedUsers ou blockedByUsers for atualizado.
// Ele acessa duas coleções no Firestore:
// friendsRef: Pega a lista de amigos do usuário logado.
// requestsRef: Pega a lista de solicitações de amizade pendentes do usuário.
// Para cada uma das coleções, usa getDocs() para obter os documentos e os transforma em arrays de IDs.
// Se houver erro ao buscar os dados, ele exibe uma mensagem no console.

// filtrar usuários com base em pesquisa e filtros
  useEffect(() => {
    const filtered = users.filter(u =>
      (!selectedYear || u.anoFormacao === selectedYear) &&
      (u.displayName.toLowerCase().includes(searchText.toLowerCase()) ||
      u.curso.toLowerCase().includes(searchText.toLowerCase()) ||
      u.campus.toLowerCase().includes(searchText.toLowerCase())) &&
      !blockedUsers.includes(u.id) &&
      !blockedByUsers.includes(u.id)
    );
    setFilteredUsers(filtered);
  }, [searchText, selectedYear, users, blockedUsers, blockedByUsers]);

  // Esse useEffect filtra os usuários com base em três critérios:
  // Ano de formação (selectedYear).
  // Texto de pesquisa (searchText), verificando se o nome, curso ou campus contém a palavra pesquisada.
  // Usuários bloqueados: Filtra os usuários que foram bloqueados pelo usuário ou que bloquearam o usuário.
  // Sempre que o estado de searchText, selectedYear, users, blockedUsers ou blockedByUsers mudar, a lista de usuários será filtrada e setFilteredUsers() será atualizado.

  //atualização de localização em tempo real
  useEffect(() => {
    let locationSubscription;
  
    const startLocationUpdates = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão de localização negada', 'Precisamos de permissão para acessar sua localização');
        return;
      }
  
      locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 50 },
        (newLocation) => {
          const { coords } = newLocation;
          if (coords && coords.latitude !== null && coords.longitude !== null && user.location !== null) {
            updateUserLocation(user.uid, coords);
          }
        }
      );
    };
  
    if (user.location && user.location.latitude !== null && user.location.longitude !== null) {
      startLocationUpdates();
    }
  
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [user.location]);

//   Esse useEffect gerencia a atualização da localização do usuário em tempo real.
// Ele faz uso de Location.watchPositionAsync(), que monitora a posição do usuário e atualiza os dados quando há mudança de pelo menos 50 metros.
// Caso a permissão de localização não tenha sido concedida, exibe um alerta informando que a permissão é necessária.
// Se a permissão foi concedida, inicia um watchPositionAsync para monitorar mudanças na posição.
// No retorno (return), garante que a assinatura de localização seja removida ao desmontar o componente

//Enviar solicitação de amizade
  const handleAddContact = async (targetUserId) => {
    if (friends.includes(targetUserId) || pendingRequests.includes(targetUserId)) {
      Alert.alert("Erro", "Você já é amigo deste usuário ou a solicitação já foi enviada.");
      return;
    }
    try {
      await setDoc(doc(db, "friendRequests", targetUserId, "requests", user.uid), {
        requesterId: user.uid,
        requesterName: user.displayName,
        requesterPhotoURL: user.photoURL,
        status: "pending",
        timestamp: serverTimestamp(),
      });
      setPendingRequests([...pendingRequests, targetUserId]);
      Alert.alert("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar solicitação de amizade:", error);
    }
  };  

// Essa função é acionada quando o usuário clica no botão de Adicionar contato.
// Antes de enviar a solicitação de amizade, verifica se o usuário:
// Já é amigo (friends.includes(targetUserId)).
// Já enviou um pedido de amizade (pendingRequests.includes(targetUserId)).
// Se qualquer uma das condições for verdadeira, exibe um alerta impedindo o envio.
// Caso contrário, envia um novo pedido de amizade para o Firestore e adiciona o ID do usuário à lista de pendingRequests, garantindo que 
// o botão fique desativado até a resposta do outro usuário.

//Limpar pesquisa e filtros
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedYear(null);
  };

  const yearData = [
    { label: '2009', value: 2009 },
    { label: '2010', value: 2010 },
    { label: '2011', value: 2011 },
    { label: '2012', value: 2012 },
    { label: '2013', value: 2013 },
    { label: '2014', value: 2014 },
    { label: '2015', value: 2015 },
    { label: '2016', value: 2016 },
    { label: '2017', value: 2017 },
    { label: '2018', value: 2018 },
    { label: '2019', value: 2019 },
    { label: '2020', value: 2020 },
    { label: '2021', value: 2021 },
    { label: '2022', value: 2022 },
    { label: '2023', value: 2023 },
    { label: '2024', value: 2024 },
  ];

  return (
    <SafeAreaView style={tw.style("flex-1 mt-6 bg-gray-100")}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
          <Ionicons name="home" size={34} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Ionicons name="happy" size={30} color={"#000000"}/>
        </TouchableOpacity>
          <Ionicons name="search-circle-outline" size={36} color="black"/>
        <TouchableOpacity onPress={() => navigation.navigate("Pedidos")}>
          <Ionicons name="people" size={30} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Bloqueios")}>
          <Ionicons name="person-remove" size={24} color="black"/>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Ionicons name="chatbubbles-sharp" size={30} color={"#000000"}/>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionTitle}>Todos os contatos no raio de {distanceFilter <= 500 ? `${distanceFilter} KM` : 'qualquer distância'}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Slider
          style={{width: 200, height: 40}}
          minimumValue={10}
          maximumValue={501}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
          step={10}
          value={distanceFilter}
          onValueChange={setDistanceFilter}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', margin: 10 }}>
        <TextInput
          style={[styles.searchInput, { flex: 1, marginRight: 5 }]}
          placeholder="Pesquisar..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <Dropdown
          style={[styles.dropdown, { flex: 1, marginLeft: 5 }]}
          data={yearData}
          labelField="label"
          valueField="value"
          placeholder="Selecione um ano"
          value={selectedYear}
          onChange={item => setSelectedYear(item.value)}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClearFilters}
        >
          <Text style={styles.buttonText}>Limpar Filtros</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filteredUsers.filter(u => user && u.id !== user.uid && !blockedUsers.includes(u.id) && !blockedByUsers.includes(u.id))}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image style={styles.avatar} source={{ uri: item.photoURL }} />
            <View style={styles.infoContainer}>
              <Text style={styles.name}>{item.displayName}</Text>
              <Text style={styles.details}>Curso: {item.curso}</Text>
              <Text style={styles.details}>Ano de Formação: {item.anoFormacao}</Text>
              <Text style={styles.details}>Universidade: {item.universidade}</Text>
              <Text style={styles.details}>Campus: {item.campus}</Text>
              <TouchableOpacity 
                style={[
                  styles.button,
                  friends.includes(item.id) || pendingRequests.includes(item.id)
                    ? styles.buttonDisabled
                    : styles.buttonEnabled,
                ]}
                onPress={() => handleAddContact(item.id)}
                disabled={friends.includes(item.id) || pendingRequests.includes(item.id)}
              >
                <Text style={styles.buttonText}>
                  {friends.includes(item.id)
                    ? 'Amigo'
                    : pendingRequests.includes(item.id)
                    ? 'Solicitação enviada'
                    : 'Adicionar contato'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 10,
    paddingHorizontal: 20,
    color: '#000',
    backgroundColor: 'white'
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 35,
    marginRight: 15,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  details: {
    fontSize: 16,
    color: 'gray',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: 'gray',
  },
  buttonEnabled: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
  dropdown: {
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
  },
  clearButton: {
    backgroundColor: '#ff6347',
    padding: 10,
    borderRadius: 5,
  }
});

export default Home;
