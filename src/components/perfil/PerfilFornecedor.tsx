import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import axios from 'axios';
import { typeFornecedor } from '../../model/Fornecedor';
import { API_URL } from '../../constants/ApiUrl';
import { useGetToken } from '../../hooks/useGetToken';
import { Loading } from '../Loading';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthContext, useAuth } from '../../context/AuthContext';

type RootStackParamList = {
    Login: undefined;
    // ... outros tipos de rotas
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PerfilFornecedor: React.FC = () => {
    const [perfil, setPerfil] = useState<typeFornecedor | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = useGetToken();
    const userId = token?.id;
    const navigation = useNavigation<NavigationProp>();

    const {logout} = useAuth();

    useEffect(() => {
        if(userId){
            carregarPerfil();
            verificarPermissoes();
        }
    }, [userId]);

    // Forçar atualização ao focar na tela (React Navigation)
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            if(userId){
                carregarPerfil();
            }
        });
        return unsubscribe;
    }, [navigation, userId]);

    useEffect(() => {
        carregarPerfil(); // Atualiza automaticamente ao abrir
    }, []);

    const verificarPermissoes = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permissão Necessária',
                'Precisamos de permissão para acessar suas fotos.',
                [{ text: 'OK' }]
            );
        }
    };

    const carregarPerfil = async () => {
        try {
            setLoading(true);
            if (!userId) {
                console.log('Aguardando token...');
                return;  
            }
            const response = await axios.get(`${API_URL}/fornecedor/${userId}`);
            setPerfil(response.data);
            setError(null);
            // Log para depuração
            console.log('perfil recebido em PerfilFornecedor:', response.data);
        } catch (err) {
            setError('Erro ao carregar perfil. Tente novamente mais tarde.');
            console.error('Erro ao carregar perfil:', err);
        } finally {
            setLoading(false);
        }
    };

    const pickImagePerfil = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const formData = new FormData();
                formData.append('imagem', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'perfil.jpg',
                } as any);

                console.log('Enviando imagem de perfil:', formData);

                const response = await axios.post(
                    `${API_URL}/fornecedor/salvar-imagem-perfil/${userId}`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                        },
                    }
                );

                console.log('Resposta do servidor:', response.data);

                if (response.data) {
                    await carregarPerfil();
                    Alert.alert("Sucesso", "Imagem de perfil atualizada com sucesso!");
                } 
            }
        } catch (error: any) {
            console.error("Erro ao atualizar imagem de perfil:", error);
            Alert.alert(
                "Erro", 
                `Não foi possível atualizar a imagem de perfil: ${error.message || 'Erro desconhecido'}`
            );
        }
    };

    const pickImageIlustrativa = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const formData = new FormData();
                formData.append('imagem', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'ilustrativa.jpg',
                } as any);

                console.log('Enviando imagem ilustrativa:', formData);

                const response = await axios.post(
                    `${API_URL}/fornecedor/salvar-imagem-ilustrativa/${userId}`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                        },
                    }
                );

                console.log('Resposta do servidor:', response.data);

                if (response.data) {
                    await carregarPerfil();
                    Alert.alert("Sucesso", "Imagem ilustrativa atualizada com sucesso!");
                } else {
                    throw new Error('URL da imagem não recebida do servidor');
                }
            }
        } catch (error: any) {
            console.error("Erro ao atualizar imagem ilustrativa:", error);
            Alert.alert(
                "Erro", 
                `Não foi possível atualizar a imagem ilustrativa: ${error.message || 'Erro desconhecido'}`
            );
        }
    };

    const pickImageServico = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                const formData = new FormData();
                formData.append('imagem', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'servico.jpg',
                } as any);

                console.log('Enviando imagem de serviço:', formData);

                const response = await axios.post(
                    `${API_URL}/fornecedor/salvar-imagem-servico/${userId}`, 
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json',
                        },
                    }
                );

                console.log('Resposta do servidor:', response.data);

                if (response.data) {
                    await carregarPerfil();
                    Alert.alert("Sucesso", "Imagem de serviço adicionada com sucesso!");
                } else {
                    throw new Error('URL da imagem não recebida do servidor');
                }
            }
        } catch (error: any) {
            console.error("Erro ao adicionar imagem de serviço:", error);
            Alert.alert(
                "Erro", 
                `Não foi possível adicionar a imagem de serviço: ${error.message || 'Erro desconhecido'}`
            );
        }
    };

    

    const handleLogout = async () => {
        try {
            await logout();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            Alert.alert('Erro', 'Não foi possível fazer logout.');
                }
    };

    if (loading) {
        return (
            <Loading/>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={carregarPerfil}>
                    <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!perfil) {
        return (
            <View style={styles.errorContainer}>
                <Text>Nenhum dado de perfil encontrado.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Perfil</Text>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Barra de Progresso de Destaque Semanal */}
            {perfil && perfil.servicosConcluidosSemana != null && perfil.metaSemana != null && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progressTitle}>Progresso para Destaque da Semana</Text>
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${perfil.servicosConcluidosSemana >= perfil.metaSemana ? 100 : Math.min(100, Math.round((perfil.servicosConcluidosSemana / perfil.metaSemana) * 100))}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        Você concluiu <Text style={styles.bold}>{perfil.servicosConcluidosSemana}</Text> de <Text style={styles.bold}>{perfil.metaSemana}</Text> serviços nesta semana.
                        {perfil.servicosConcluidosSemana >= perfil.metaSemana && (
                            <Text style={styles.congrats}>  Parabéns! Você ganhou o destaque da semana!</Text>
                        )}
                    </Text>
                </View>
            )}

            {/* Imagem de Perfil */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Foto de Perfil</Text>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: perfil.imagemPerfil }} style={styles.profileImage} />
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={pickImagePerfil}
                    >
                        <MaterialIcons name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Dados Pessoais */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dados Pessoais</Text>
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="person-outline" size={20} color="#666" style={styles.labelIcon} />
                            <Text style={styles.label}>Nome:</Text>
                        </View>
                        <Text style={styles.infoText}>{perfil.nome}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="mail-outline" size={20} color="#666" style={styles.labelIcon} />
                            <Text style={styles.label}>E-mail:</Text>
                        </View>
                        <Text style={styles.infoText}>{perfil.email}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="call-outline" size={20} color="#666" style={styles.labelIcon} />
                            <Text style={styles.label}>Telefone:</Text>
                        </View>
                        <Text style={styles.infoText}>{perfil.telefone}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.labelIcon} />
                            <Text style={styles.label}>Sobre:</Text>
                        </View>
                        <Text style={styles.infoText}>{perfil.sobre}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="location-outline" size={20} color="#666" style={styles.labelIcon} />
                            <Text style={styles.label}>Endereço:</Text>
                        </View>
                        <Text style={styles.infoText}>
                            {`${perfil.endereco.rua}, ${perfil.endereco.cidade} - ${perfil.endereco.estado}, ${perfil.endereco.cep}`}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Imagem Ilustrativa */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Imagem Ilustrativa</Text>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: perfil.imagemIlustrativa }} style={styles.illustrativeImage} />
                    <TouchableOpacity
                        style={styles.editIcon}
                        onPress={pickImageIlustrativa}
                    >
                        <MaterialIcons name="edit" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Imagens do Serviço */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Galeria de Serviços</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={pickImageServico}
                >
                    <FontAwesome5 name="plus" size={16} color="#fff" style={styles.addButtonIcon} />
                    <Text style={styles.addButtonText}>Adicionar Imagem</Text>
                </TouchableOpacity>
                <View style={styles.serviceImagesContainer}>
                    {perfil.imagemServicos.map((imgSrc, index) => (
                        <View key={index} style={styles.serviceImageWrapper}>
                            <Image source={{ uri: imgSrc }} style={styles.serviceImage} />
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    headerContainer: {
        backgroundColor: '#d48a00',
        padding: 10,
        paddingTop: 20,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
    },
    logoutButton: {
        position: 'absolute',
        right: 15,
        padding: 5,
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        margin: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    imageContainer: {
        alignItems: 'center',
        position: 'relative',
        marginBottom: 10,
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 3,
        borderColor: '#d48a00',
    },
    illustrativeImage: {
        width: '100%',
        height: 200,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#d48a00',
        resizeMode: 'cover',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#d48a00',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateX: 15 }, { translateY: 15 }],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    infoContainer: {
        padding: 10,
    },
    infoRow: {
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 10,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    labelIcon: {
        marginRight: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    addButton: {
        backgroundColor: '#d48a00',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    addButtonIcon: {
        marginRight: 8,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    serviceImagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    serviceImageWrapper: {
        width: '48%',
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    serviceImage: {
        width: '100%',
        height: 150,
        borderRadius: 10,
        resizeMode: 'cover',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#d48a00',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
    progressContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    progressTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
        marginBottom: 10,
    },
    progressBarBackground: {
        backgroundColor: '#eee',
        borderRadius: 5,
        height: 20,
        marginBottom: 10,
    },
    progressBarFill: {
        backgroundColor: '#d48a00',
        borderRadius: 5,
        height: '100%',
    },
    progressText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    bold: {
        fontWeight: 'bold',
    },
    congrats: {
        fontWeight: 'bold',
        color: 'green',
    },
});

