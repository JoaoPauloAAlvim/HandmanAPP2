import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExibirFornecedorScreen } from '../pages/ExibirFornecedorScreen';
import { AgendamentoScreen } from '../pages/AgendamentoScreen';
import { ConfirmacaoScreen } from '../pages/ConfirmacaoScreen';
import { ChatScreen } from '../pages/ChatScreen';
import { LocalizacaoScreen } from '../pages/LocalizacaoScreen';
import { ExibirAgendamentoScreen } from '../pages/ExibirAgendamentoScreen';

export type FornecedorStackParamList = {
    ExibirFornecedorScreen: { fornecedorId: string | undefined};
    AgendamentoScreen: { fornecedorId: string | undefined };
    
    ConfirmacaoScreen: { 
        fornecedorId: string | undefined ;
        data: string;
        horario: string;
        endereco: string;
        imagem?: {
            uri: string;
            type?: string;
            fileName?: string;
        };
        categoria:string
    };

    ExibirAgendamentoScreen:{ fornecedorId:string | undefined}
    
    ChatScreen:{fornecedorId: string | undefined}
    LocalizacaoScreen: { fornecedorId: string | undefined }
};

const Stack = createNativeStackNavigator<FornecedorStackParamList>();

export const FornecedorStackNavigation = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen name="ExibirFornecedorScreen" component={ExibirFornecedorScreen} />
            <Stack.Screen name="AgendamentoScreen" component={AgendamentoScreen} />
            <Stack.Screen name='LocalizacaoScreen' component={LocalizacaoScreen} />
            <Stack.Screen name="ConfirmacaoScreen" component={ConfirmacaoScreen} />
            <Stack.Screen name="ExibirAgendamentoScreen" component={ExibirAgendamentoScreen} />
            <Stack.Screen name="ChatScreen" component={ChatScreen}/>
        </Stack.Navigator>
    );
};
