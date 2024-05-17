import { NavigationContainer } from "@react-navigation/native";
import StackNavigator from "./navigation/stacknavigator";
import { AuthProvider } from "./hooks/useAuth";


export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <StackNavigator/>
      </AuthProvider>
    </NavigationContainer>
  );
}

