import React, { useState, useEffect } from 'react';
import {
    ScrollView,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useBiometric } from '../../hooks/useBiometric';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { API_URL } from '../../constants/ApiUrl';



interface InputWithLabelProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    editable?: boolean;
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
    label,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType = 'default',
    editable = true,
}) => {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                editable={editable}
            />
        </View>
    );
};

interface LoginScreenProps {
    onBack: () => void;
    onNavigate: (screen: string) => void;
    currentScreen: string;
    isFornecedor: boolean;
    setIsFornecedor: (isFornecedor: boolean) => void;
}

const Login: React.FC<LoginScreenProps> = ({ onBack, onNavigate, currentScreen, isFornecedor, setIsFornecedor }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [hasStoredCredentials, setHasStoredCredentials] = useState(false);
    const { login } = useAuth();
    const { isBiometricAvailable, authenticateWithBiometrics, checkBiometricAvailability } = useBiometric();
    console.log(hasStoredCredentials)
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                console.log('=== Iniciando verificação de autenticação ===');
                // Força uma nova verificação de biometria
                await checkBiometricAvailability();
                console.log('Status da biometria após verificação:', isBiometricAvailable);
                
                // Verifica credenciais salvas
                const savedEmail = await AsyncStorage.getItem('lastLoginEmail');
                const savedPassword = await AsyncStorage.getItem('lastLoginPassword');
                
                console.log('=== Status das credenciais ===');
                console.log('Email salvo:', savedEmail ? 'Sim' : 'Não');
                console.log('Senha salva:', savedPassword ? 'Sim' : 'Não');
                console.log('Biometria disponível:', isBiometricAvailable);

                // Apenas marca que existem credenciais, mas não as exibe
                setHasStoredCredentials(!!savedEmail && !!savedPassword);

                if (savedEmail && savedPassword && isBiometricAvailable) {
                    console.log('Iniciando autenticação biométrica...');
                    handleBiometricLogin();
                } else {
                    console.log('Condições para biometria não atendidas');
                    if (!isBiometricAvailable) console.log('Biometria não disponível');
                    if (!savedEmail || !savedPassword) console.log('Credenciais não encontradas');
                }
            } catch (error) {
                console.error('Erro durante a inicialização:', error);
            }
        };

        initializeAuth();
    }, [isBiometricAvailable]);

    const handleBiometricLogin = async () => {
        if (!isBiometricAvailable) {
            console.log('Tentativa de autenticação biométrica quando não disponível');
            return;
        }

        try {
            console.log('=== Iniciando login biométrico ===');
            setLoading(true);

            const success = await authenticateWithBiometrics();
            console.log('Resultado da autenticação biométrica:', success);
            
            if (success) {
                const savedEmail = await AsyncStorage.getItem('lastLoginEmail');
                const savedPassword = await AsyncStorage.getItem('lastLoginPassword');
                
                if (savedEmail && savedPassword) {
                    console.log('Tentando login com credenciais salvas');
                    const result = await login(savedEmail, savedPassword);
                    
                    if (result.success) {
                        // Obtenha o ID do usuário do token JWT
                        const token = result.data?.token;
                        let userId = null;
                        if (token) {
                            try {
                                const base64Url = token.split('.')[1];
                                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                                const jsonPayload = decodeURIComponent(
                                    atob(base64)
                                        .split('')
                                        .map(function (c) {
                                            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                        })
                                        .join('')
                                );
                                const decoded = JSON.parse(jsonPayload);
                                userId = decoded.id;
                            } catch (e) {
                                console.error('Erro ao decodificar token:', e);
                            }
                        }
                        if (!userId) {
                            Alert.alert('Erro', 'Não foi possível identificar o usuário.');
                            setLoading(false);
                            return;
                        }
                        // Busca o usuário pelo ID para pegar a média de avaliações
                        const userResp = await fetch(`${API_URL}/usuarios/buscar-id/${userId}`);
                        const userData = await userResp.json();
                        console.log('userData:', userData);
                        const media = userData.media_avaliacoes;
                        const totalAvaliacoes = userData.totalAvaliacoes || 0;
                        if (typeof media === 'number' && media <= 2 && totalAvaliacoes > 2) {
                            Alert.alert('Conta bloqueada', 'Sua conta foi bloqueada devido à baixa avaliação. Entre em contato com o suporte.');
                            setLoading(false);
                            return;
                        }
                        console.log('Login biométrico bem-sucedido!');
                        onNavigate('MainApp');
                    } else {
                        console.log('Falha no login com credenciais salvas:', result.message);
                        Alert.alert('Erro', 'Credenciais inválidas. Por favor, faça login manualmente.');
                        // Limpa as credenciais inválidas
                        await AsyncStorage.removeItem('lastLoginEmail');
                        await AsyncStorage.removeItem('lastLoginPassword');
                        setHasStoredCredentials(false);
                    }
                }
            } else {
                console.log('Autenticação biométrica cancelada ou falhou');
            }
        } catch (error) {
            console.error('Erro durante login biométrico:', error);
            Alert.alert('Erro', 'Ocorreu um erro na autenticação biométrica. Por favor, faça login manualmente.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setLoading(true);
        try {
            console.log('=== Iniciando login manual ===');
            const result = await login(email, senha);

            if (result.success) {
                // Obtenha o ID do usuário do token JWT
                const token = result.data?.token;
                let userId = null;
                if (token) {
                    try {
                        const base64Url = token.split('.')[1];
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const jsonPayload = decodeURIComponent(
                            atob(base64)
                                .split('')
                                .map(function (c) {
                                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                                })
                                .join('')
                        );
                        const decoded = JSON.parse(jsonPayload);
                        userId = decoded.id;
                    } catch (e) {
                        console.error('Erro ao decodificar token:', e);
                    }
                }
                if (!userId) {
                    Alert.alert('Erro', 'Não foi possível identificar o usuário.');
                    setLoading(false);
                    return;
                }
                // Busca o usuário pelo ID para pegar a média de avaliações
                const userResp = await fetch(`${API_URL}/usuarios/buscar-id/${userId}`);
                const userData = await userResp.json();
                console.log('userData:', userData);
                const media = userData.media_avaliacoes;
                const totalAvaliacoes = userData.totalAvaliacoes || 0;
                if (typeof media === 'number' && media <= 2 && totalAvaliacoes > 2) {
                    Alert.alert('Conta bloqueada', 'Sua conta foi bloqueada devido à baixa avaliação. Entre em contato com o suporte.');
                    setLoading(false);
                    return;
                }
                console.log('Login manual bem-sucedido, salvando credenciais');
                await AsyncStorage.setItem('lastLoginEmail', email);
                await AsyncStorage.setItem('lastLoginPassword', senha);
                setHasStoredCredentials(true);
                Alert.alert('Login realizado com sucesso!');
                onNavigate('MainApp');
            } else {
                console.log('Falha no login manual:', result.message);
                Alert.alert('Erro de login', result.message);
            }
        } catch (error) {
            console.error('Erro durante login manual:', error);
            Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView 
            contentContainerStyle={styles.container} 
            showsVerticalScrollIndicator={false}
        >
            <LinearGradient
                colors={['#FFFFFF', '#FFE1C5']}
                style={styles.gradientBackground}
            >
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>HANDYMAN</Text>
                    <Text style={styles.subtitle}>Não faça você mesmo,{'\n'}encontre um profissional!</Text>
                    <Text style={styles.description}>A sua plataforma confiável para serviços manuais!</Text>
                </View>

                <View style={styles.card}>
                    <InputWithLabel
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        editable={!loading}
                    />
                    
                    <View style={styles.passwordContainer}>
                        <InputWithLabel
                            label="Senha"
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.loginButtonText}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.optionsContainer}>
                        <TouchableOpacity 
                            style={styles.optionButton}
                            onPress={() => onNavigate('Cadastro')}
                        >
                            <Text style={styles.optionText}>Não tem uma conta? </Text>
                            <Text style={styles.optionLink}>Cadastre-se</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.optionButton}
                            onPress={() => setIsFornecedor(true)}
                        >
                            <Text style={styles.optionText}>É fornecedor? </Text>
                            <Text style={styles.optionLink}>Entrar como fornecedor</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
    },
    gradientBackground: {
        flex: 1,
        padding: 20,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    headerIcon: {
        marginBottom: 10,
        color: '#B54708',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#B54708',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 24,
        color: '#B54708',
        textAlign: 'center',
        marginBottom: 5,
    },
    description: {
        fontSize: 16,
        color: '#B54708',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#EEB16C',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#FFE1C5',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#FFD4A3',
    },
    passwordContainer: {
        marginBottom: 20,
    },
    loginButton: {
        backgroundColor: '#7A2D00',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: '600',
    },
    optionsContainer: {
        marginTop: 20,
        gap: 15,
    },
    optionButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8,
    },
    optionText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    optionLink: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 5,
    }
});

export default Login;