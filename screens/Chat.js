import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';
import Chatlist from '../components/Chatlist';

const Chat = () => {
  return (
    <SafeAreaView style={tw.style("flex-1")}>
      <Header title={"Chat"} />
      <View style={tw.style("flex-1")}>
        <Chatlist />
      </View>
    </SafeAreaView>
  );
}

export default Chat;