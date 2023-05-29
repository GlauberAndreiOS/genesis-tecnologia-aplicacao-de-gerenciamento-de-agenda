import { useCallback, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList, TextInput } from 'react-native'
import { StatusBar } from 'expo-status-bar'

import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

const Stack = createNativeStackNavigator()

import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import { EvilIcons } from '@expo/vector-icons';

import { pt, registerTranslation, DatePickerInput } from 'react-native-paper-dates'
import { SafeAreaProvider } from "react-native-safe-area-context";

import MaskInput, { createNumberMask } from 'react-native-mask-input'

import { Picker } from '@react-native-picker/picker'
import { ScrollView } from 'react-native-web'

registerTranslation('pt', pt)//Alterando o Idioma do Calendario

//Todo essa aplicação pode ser exportada em 3 aplicações, 
//que podem ou não ser publicadas na playstore (.APK) e na applestore (.IPA)
//além de uma build web (.HTML)

//Uma boa pratica é criar a aplicação baseada em componentes ou em classes, as quais são consumidas pela classe App no final
//mas, devido ao tempo curto, essas boas praticas seriam custosas e exederiam o prazo proposto
//portanto, simplifiquei tudo e coloquei tudo na classe principal

//As aplicações escritas em React Native servem apenas o Front-End ao usuário, toda a parte de Back-end é servida através de Socket
//Ou API's, no caso, eu utilizarei API's para me comunicar com o Back-End, o qual será escrito em NodeJs

SplashScreen.preventAutoHideAsync() //Este trecho serve para previnir que a Splash Screen seja automaticamente escondida, nós queremos que isso aconteça só depois do carregamento do component

export default function App() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    item: {
      flex: 1,
    },
    text:{
      color: 'white',
      fontSize: 16,
      fontFamily: 'Montserrat-Bold'
    },
    button: {
      height: 40,
      width: 200,
      borderRadius: 5,
      alignSelf: 'center',
      margin: 20,
      backgroundColor: 'rgba(0,0,0,1)',
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
  
  //Na primeira parte são carregados as principais funções da aplicação,
  //sendo assim aqui eu coloco a base da página e as fontes que serão usadas
  const [fontsLoaded] = useFonts({
    'Montserrat-Bold': require('./assets/fonts/Montserrat-Bold.ttf'),
  });

  //Ao carregar a página serão verificados se as fontes estão carregadas, enquanto não estiverem a splash screen não será escondida
  //Isso só funciona no Android e IOS, na WEB não temos a Splash Screen, por isso o trecho simplesmente será ignorado
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }else{
    return ( 
    //O uso da FlatList serve por que ela renderiza a lista de Itens de forma assincrona, 
    //o que é necessário pois iremos receber os dados de um servidor remoto,
    //onde podem ocorrer atrasos ou perda de pacotes
      <ScrollView contentContainerStyle={styles.container}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={'Home'} screenOptions={() => ({ headerShown:false })}>
            <Stack.Screen name={'Home'} component={Home}/>
            <Stack.Screen name={'Agendamento'} component={Agendar}/>
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto"/>{/*Isso serve para ajustar as cores da StatusBar (Barra de Notificação do Android e do IOS onde ficam os icones de rede, data, hora, etc) conforme as cores da aplicação*/}
      </ScrollView>
    );
  }
}

function Agendar({navigation, route}) {//Essa rota da aplicação vai cuidar tanto do agendamento quanto do reagendamento
  const [id, setId] = useState(route.params === undefined ? null : route.params.item.id)
  const [nome, setNome] = useState(route.params === undefined ? null : route.params.item.nome)
  const [CPF, setCPF] = useState(route.params === undefined ? null : route.params.item.cpf)
  const [cartaoSus, setCartaoSus] = useState(route.params === undefined ? null : route.params.item.cartaoSus)
  const [motivo, setMotivo] = useState(route.params === undefined ? null : route.params.item.motivo)
  const [dataAtendimento, setDataAtendimento] = useState(new Date())
  const [horario, setHorario] = useState()
  const [urgencia, setUrgencia] = useState(route.params === undefined ? null : route.params.item.urgencia)
  const [medico, setMedico] = useState(route.params === undefined ? null : route.params.item.medico)
  const [profissional, setProfissional] = useState(route.params === undefined ? null : route.params.item.profissional)
  const [tipo, setTipo] = useState(route.params === undefined ? null : route.params.tipo)

  async function onPressEnviar(){//Essa função faz o POST na roda agendamento do nosso backend, e quando o Tipo for editar, ela faz um update das informações conforme o id enviado
    fetch('http://127.0.0.1:3000/agendamento', {
      method: 'POST',
      body: JSON.stringify({
        id: id,
        nome: nome,
        cpf: CPF,
        cartaoSus: cartaoSus,
        motivo: motivo,
        data_agendamento: new Date(dataAtendimento.getFullYear(), dataAtendimento.getMonth(), dataAtendimento.getDate(), parseInt(horario.slice(0, 2))-4, parseInt(horario.slice(2,4)), parseInt('000')),//Formetei assim para que o mysql entendesse a data e hora
        urgencia: urgencia,
        medico: medico,
        profissional: profissional,
        tipo: tipo
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    }).then((result)=>{
      result.json().then((body)=>{
        if(body === 'Horário Indisponível para esse médico'){//Isso informa o motivo pelo qual não foi possivel cadastrar o atendimento em tal horário, porém isso pode falhar por que não existe uma classe médico, e a verificação é feita só pelo nome e horário
          alert(body)
        }
      })
    }).catch((err)=>{
      console.log(err)
    }).finally(()=>{
      navigation.navigate('Home')//Pra finalizar, quando a função terminar, a aplicação será redirecionada para a Home
    })
  }

  const styles = StyleSheet.create({
    containerView: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    logoText: {
      color: 'black',
      fontSize: 40,
      fontWeight: '800',
      textAlign: 'center',
      fontFamily: 'Montserrat-Bold',
    },
    formInscView: {
      flex: 1,
      paddingHorizontal: 30,
      paddingVertical: 10,
    },
    textApr: {
      fontSize: 28,
      alignSelf: 'center',
      marginVertical: 10,
      color: 'black',
      fontFamily: 'Montserrat-Bold',
    },
    textPer: {
      fontSize: 18,
      color: 'black',
      fontFamily: 'Montserrat-Bold',
      marginVertical: 5,
    },
    formIsncTextInput: {
      width: 300,
      height: 50,
      color: 'black',
      fontSize: 14,
      borderRadius: 5,
      borderWidth: 1,
      paddingLeft: 10,
      marginVertical: 5,
      fontFamily: 'Montserrat-Bold',
    },
    formIsncPickerInput: {
      color: 'black',
      width: 300,
      height: 50,
      fontSize: 14,
      borderRadius: 5,
      paddingLeft: 5,
      marginVertical: 5,
      fontFamily: 'Montserrat-Bold',
    },
    inscButton: {
      backgroundColor: 'black',
      borderRadius: 50,
      height: 50,
      marginTop: 10,
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inscButtonText: {
      fontSize: 18,
      color: 'white',
      fontFamily: 'Montserrat-Bold',
    },
  });

  return (
    <SafeAreaProvider style={styles.containerView}>
      <View style={styles.formInscView}>
        <Text style={styles.textApr}>Agendar</Text>
        <TextInput
          placeholder='Nome do Paciênte'
          value={nome}
          maxLength={100}
          style={styles.formIsncTextInput}
          onChangeText={(value) => {
            setNome(value);
          }}
        />
        <MaskInput
          value={CPF}
          style={styles.formIsncTextInput}
          keyboardType='numeric'
          onChangeText={(masked) => {
            setCPF(masked)
          }}
          mask={[/\d/,/\d/,/\d/,'.',/\d/,/\d/,/\d/,'.',/\d/,/\d/,/\d/,'-',/\d/,/\d/,]}//Gosto de usar mascaras em certos inputs para não precisar filtrar os dados no backend e evitar entrada de dados incorretas
        />
        <TextInput
          placeholder="Cartao do SUS"
          value={cartaoSus}
          keyboardType='numeric'
          style={styles.formIsncTextInput}
          onChangeText={(value) => {
            setCartaoSus(value);
          }}
        />
        <TextInput
          placeholder="Motivo do Atendimento (255 caracteres)"
          value={motivo}
          multiline={true}
          maxLength={255}//Conforme o banco de dados
          textAlignVertical={'top'}
          style={styles.formIsncTextInput}
          onChangeText={(value) => {
            setMotivo(value);
          }}
        />
        <DatePickerInput
          locale="pt"
          style={{backgroundColor: 'white', borderRadius: 5, borderWidth: 1, height: 40}}
          label="Data do Agendamento"
          value={dataAtendimento}
          onChange={(d) => setDataAtendimento(d)}
          inputMode="start"
        />
        <MaskInput
          value={horario}
          style={styles.formIsncTextInput}
          keyboardType='numeric'
          onChangeText={(masked, unmasked) => {
            setHorario(unmasked)
          }}
          mask={[/\d/,/\d/,':',/\d/,/\d/]}
        />
        <Picker
          selectedValue={urgencia}
          style={styles.formIsncPickerInput}
          onValueChange={(itemValue, itemIndex) => setUrgencia(itemValue)}>
          <Picker.Item label="Baixa" value="baixa"/>
          <Picker.Item label="Média" value="media"/>
          <Picker.Item label="Alta" value="alta"/>
          <Picker.Item label="Urgente" value="urgente"/>
        </Picker>
        <TextInput //O cenário ideal aqui seria um Picker com todos os médicos e filtros de funções, por exemplo, Filtro de Ortopedistas, nomes dos ortopedistas cadastrados... Mas de novo, não existe uma classe médico, se o sistema for escalado veriamos muitos bugs
          placeholder='Nome do Médico'
          value={medico}
          maxLength={100}
          style={styles.formIsncTextInput}
          onChangeText={(value) => {
            setMedico(value);
          }}
        />
        <TextInput //Aqui o cenário ideal seria que o usuário cadastrado fosse apontado como profissional, mas pela falta de um fluxo de autenticação não é possivel...
          placeholder='Nome do Profissional que Realizou o Agendamento'
          value={profissional}
          maxLength={100}
          style={styles.formIsncTextInput}
          onChangeText={(value) => {
            setProfissional(value);
          }}
        />
        <TouchableOpacity
          style={styles.inscButton}
          onPress={() => onPressEnviar()}>
          <Text style={styles.inscButtonText}>Cadastrar Atendimento</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaProvider>
  )
}

function Home({navigation}) {
  const [data, setData] = useState([])
  const [inputDate, setInputDate] = useState(new Date())
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    },
    item: {
      flex: 1,
    },
    text:{
      color: 'white',
      fontSize: 16,
      fontFamily: 'Montserrat-Bold'
    },
    button: {
      height: 40,
      width: 200,
      borderRadius: 5,
      alignSelf: 'center',
      margin: 20,
      backgroundColor: 'rgba(0,0,0,1)',
      justifyContent: 'center',
      alignItems: 'center',
    }
  });
  

  useFocusEffect(
    useCallback(()=>{
      //Essa função é disparada toda vez que a rota é requisitada, ou seja, quando eu vou para a tela de agendamento e volto pra cá, essa função é disparada
      //fazendo com que as informações estejam sempre atualizadas
      fetch('http://127.0.0.1:3000/agendamentos?' + new URLSearchParams({filtro: inputDate.toJSON().slice(0,10)}), {
        method: 'GET',
      })
      .then((response)=>response.json().then((body)=>setData(body)))//Recebe o response, tranforma em JSON, depois coloca ele na variavel data, que vai ser usada na flatlist
    }, [inputDate])
  )

  return (
    <View style={styles.container}>
      <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={()=>{//Isso vem antes do conteudo da FlatList
            return(
              <SafeAreaProvider style={{flexDirecton: 'row', padding: 10, maxHeight: 200}}>
                <DatePickerInput
                  locale="pt"
                  dateFormat="yyyy/MM/dd"
                  style={{backgroundColor: 'white', borderRadius: 5, borderWidth: 1, height: 40}}
                  label="Filtrar Agendamentos a partir de: "
                  value={inputDate}
                  onChange={(d) => setInputDate(d)}
                  inputMode="start"
                />
              </SafeAreaProvider>
            )
          }}
          ListFooterComponent={()=>{//Isso vem depois do conteudo da FlatList
            return(
              <TouchableOpacity style={styles.button} onPress={()=>{navigation.navigate('Agendamento')}}>
                <Text style={{color: 'white', fontFamily: 'Montserrat-Bold'}}>Adicionar Agendamento</Text>
              </TouchableOpacity>
            )
          }}
          renderItem={({item})=>{//Isso é o conteudo da FlatList
            return(
              //Pensei em fazer tabelas com os Itens, mas isso restringiria a quantidade de Caracteres, então resolvi usar Card coloridos com a Urgencia de Acordo com SUS, azul, verde, amarelo e vermelho, respectivamente do menos urgente até o mais urgente
              //Reduzi a Opacidade das cores para que ficassem mais agradaveis aos olhos e visualmente mais bonitas
              <View style={{backgroundColor: item.urgencia.toLowerCase() === 'baixa' ? 'rgba(0,0,255,0.8)' : item.urgencia.toLowerCase() === 'media' ? 'rgba(0,255,0,0.8)' : item.urgencia.toLowerCase() === 'alta' ? 'rgba(255,215,0,0.8)' : item.urgencia.toLowerCase() === 'urgente' ? 'rgba(255,0,0,0.8)' : null, height: 200, width: 500, borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, margin: 5, justifyContent: 'space-around'}}>
                <Text style={{color: 'white', fontSize: 16, fontFamily: 'Montserrat-Bold', alignSelf: 'center', justifyContent: 'center', paddingBottom: 5, textTransform: 'capitalize'}}>Urgencia: {item.urgencia}</Text>
                <TouchableOpacity style={{position: 'absolute', alignSelf: 'flex-end'}} onPress={()=>{navigation.navigate('Agendamento', {item, tipo: 'editar'})}}>
                  <EvilIcons name="pencil" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.text}>Nome do Paciente: {item.nome}</Text>
                <Text style={styles.text}>CPF do Paciente: {item.cpf}</Text>
                <Text style={styles.text}>Cartão do SUS do Paciente: {item.cartaoSus}</Text>
                <Text style={styles.text}>Motivo do Atendimento: {item.motivo}</Text>
                <Text style={styles.text}>Data: {new Date(item.data_agendamento).toLocaleString()}</Text>
                <Text style={styles.text}>Médico: {item.medico}</Text>
                <Text style={styles.text}>Profissional que realizou o agendamento: {item.profissional}</Text>
              </View>
            )
          }}
        />
    </View>
  )
}