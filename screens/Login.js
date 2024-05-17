import { View, Text, ImageBackground, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import tw from "tailwind-react-native-classnames";
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,updateProfile} from "firebase/auth"
import {auth} from "../firebase"
import useAuth from '../hooks/useAuth';

const Login = () => {
    const [type, setType] = useState(1) //1.para logado 2.para deslogado

    const {loading,setLoading} = useAuth()

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    useEffect(() => {
      setNome("");
      setEmail("");
      setSenha("");
    }, [type]);
    

    const singIn = () =>{
        if(email.trim()==="" || senha.trim()===""){
            return Alert.alert("Ei!!", "Você não inseriu todos os dados")
        }
        setLoading(true);
        signInWithEmailAndPassword(auth,email,senha).then(({user})=>{
            setLoading(false);
        }).catch((err)=>{
            setLoading(true);
        });
    };

    const singUp = () =>{
        if(nome.trim()==="" || email.trim()==="" || senha.trim()===""){
            return Alert.alert("Ei!!", "Você não inseriu todos os dados")
        }
        setLoading(true);
        createUserWithEmailAndPassword(auth,email,senha).then(({user})=>{
            updateProfile(user,{displayName:nome})
            setLoading(false);
        }).catch((err)=>{
            setLoading(false);
        });
    };

    if(loading){
        return(
            <View style={tw.style("flex-1 justify-center items-center")}>
                <Text style={tw.style("font-semibold text-red-400 text-2xl")}>Loading...</Text>
            </View>
        )
    }

  return (
    <ImageBackground style={tw.style("flex-1")}
        resizeMode="cover" source={require("../assets/BackgroundLogin.jpg")}
    >
            {
                type==1 ? (
                    <View style={tw.style("flex-1 justify-center items-center")}>
                        <Text style={tw.style("font-bold text-2xl")}>Sing In</Text>
                        <Text>Acesse sua conta</Text>
                        <View style={tw.style("w-full p-5")}>
                            <Text style={tw.style("font-semibold pb-2")}>E-mail</Text>
                            <TextInput 
                                keyboardType="email-address"
                                style={tw.style("bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-lg w-full p-2.5 mb-4")}
                                value={email}
                                onChangeText={(text)=>setEmail(text)}
                            />
                            <Text style={tw.style("font-semibold pb-2")}>Senha</Text>
                            <TextInput 
                                secureTextEntry={true}
                                style={tw.style("bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-lg w-full p-2.5 mb-4")}
                                value={senha}
                                onChangeText={(text)=>setSenha(text)}
                            />
                            <TouchableOpacity style={tw.style("w-full rounded-lg mt-8 bg-black py-3")} onPress={singIn}>
                                <Text style={tw.style("text-center text-white font-semibold")}>Sing In</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=>setType(2)}>
                                <Text style={tw.style("text-center text-white font-semibold pt-3")}>Não tem uma conta?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                <View style={tw.style("flex-1 justify-center items-center")}>
                    <Text style={tw.style("font-bold text-2xl")}>Sing Up</Text>
                    <Text>Criar sua conta</Text>
                    <View style={tw.style("w-full p-5")}>
                        <Text style={tw.style("font-semibold pb-2")}>Nome</Text>
                        <TextInput 
                            style={tw.style("bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-lg w-full p-2.5 mb-4")}
                            value={nome}
                            onChangeText={(text)=>setNome(text)}
                        />
                        <Text style={tw.style("font-semibold pb-2")}>E-mail</Text>
                        <TextInput 
                            keyboardType="email-address"
                            style={tw.style("bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-lg w-full p-2.5 mb-4")}
                            value={email}
                            onChangeText={(text)=>setEmail(text)}
                        />
                        <Text style={tw.style("font-semibold pb-2")}>Senha</Text>
                        <TextInput 
                            secureTextEntry={true}
                            style={tw.style("bg-gray-50 border border-gray-300 text-sm text-gray-900 rounded-lg w-full p-2.5 mb-4")}
                            value={senha}
                            onChangeText={(text)=>setSenha(text)}
                        />
                        <TouchableOpacity style={tw.style("w-full rounded-lg mt-8 bg-black py-3")} onPress={singUp}>
                            <Text style={tw.style("text-center text-white font-semibold")}>Sing Up</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={()=>setType(1)}>
                            <Text style={tw.style("text-center text-white font-semibold pt-3")}>Ja tem uma conta?</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
    </ImageBackground>
  )
}

export default Login