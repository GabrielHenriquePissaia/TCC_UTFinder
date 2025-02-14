
import { createStackNavigator } from "@react-navigation/stack";
import { ModalPresentationIOS, TransitionPresets } from "@react-navigation/stack";
import login from "../screens/Login";
import home from "../screens/Home";
import chat from "../screens/Chat";
import match from "../screens/Match";
import message from "../screens/Message";
import useAuth from "../hooks/useAuth"; // Importação do hook de autenticação
import modal from "../screens/Modal";
import location from "../screens/Location";
import bloqueios from "../screens/Bloqueios";
import inicio from "../screens/Inicio";
import pedidos from "../screens/Pedidos";

const Stack = createStackNavigator();

const stacknavigator = () => {
  const { user } = useAuth(); // Obtém o usuário autenticado do contexto de autenticação

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Location" component={location} />
          <Stack.Screen name="Inicio" component={inicio} />
          <Stack.Screen name="Home" component={home} />
          <Stack.Screen name="Chat" component={chat} />
          <Stack.Screen name="Message" component={message} />
          <Stack.Screen name="Bloqueios" component={bloqueios} />
          <Stack.Screen name="Pedidos" component={pedidos} />

          <Stack.Screen
            name="Match"
            component={match}
            options={{
              presentation: "transparentModal",
              ...TransitionPresets.ModalPresentationIOS,
            }}
          />

          <Stack.Screen
            name="Modal"
            component={modal}
            options={{
              presentation: "Modal",
              ...TransitionPresets.ModalPresentationIOS,
            }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={login} />
      )}
    </Stack.Navigator>
  );
};

// stacknavigator:
// 1. Define a navegação da aplicação utilizando o `createStackNavigator`.
// 2. Verifica se o usuário está autenticado através do `useAuth()`.
// 3. Se o usuário estiver autenticado, exibe as telas do aplicativo.
// 4. Caso contrário, exibe apenas a tela de login.
// 5. Algumas telas (como `Match` e `Modal`) utilizam transições especiais para parecerem pop-ups no iOS.

export default stacknavigator;
