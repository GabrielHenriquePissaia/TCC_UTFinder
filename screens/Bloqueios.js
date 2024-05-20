import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'tailwind-react-native-classnames';
import Header from '../components/Header';

const Bloqueios = () => {
  return (
    <SafeAreaView style={tw.style("flex-1")}>
      <Header title={"Contatos Bloqueados"} />
      <View style={tw.style("flex-1")}>
      </View>
    </SafeAreaView>
  );
}

export default Bloqueios;