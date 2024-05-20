
import { createStackNavigator } from "@react-navigation/stack";
import { ModalPresentationIOS, TransitionPresets } from "@react-navigation/stack";
import login from "../screens/Login";
import home from "../screens/Home";
import chat from "../screens/Chat";
import match from "../screens/Match";
import message from "../screens/Message";
import useAuth from "../hooks/useAuth";
import modal from "../screens/Modal";
import location from "../screens/Location";
import bloqueios from "../screens/Bloqueios";
import inicio from "../screens/Inicio";
import pedidos from "../screens/Pedidos";

const Stack = createStackNavigator();

const stacknavigator = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {user ? (
        <>
          <Stack.Screen name="Inicio" component={inicio} />
          <Stack.Screen name="Home" component={home} />
          <Stack.Screen name="Chat" component={chat} />
          <Stack.Screen name="Message" component={message} />
          <Stack.Screen name="Location" component={location} />
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

export default stacknavigator;
