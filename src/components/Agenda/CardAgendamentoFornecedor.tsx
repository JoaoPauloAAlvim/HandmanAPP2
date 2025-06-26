import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FornecedorStackParamList } from '../../navigation/FornecedorStackNavigation';
import { Solicitacao, StatusType } from '../../model/Agendamento';
import { getStatusConfig } from '../../utils/statusConfig';
import { RootTabParamList } from '../../navigation/TabNavigation';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import axios from 'axios';
import { API_URL } from '../../constants/ApiUrl';

type NavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<RootTabParamList>,
    BottomTabNavigationProp<FornecedorStackParamList>
>;

interface CardAgendamentoFornecedorProps {
    solicitacao: Solicitacao;
    onPressEntrarContato: (idUsuario: string) => void;
    onPressAtualizarStatus: (novoStatus: StatusType) => void;
}

export const CardAgendamentoFornecedor: React.FC<CardAgendamentoFornecedorProps> = ({
    solicitacao,
    onPressEntrarContato,
    onPressAtualizarStatus
}) => {
    const navigation = useNavigation<NavigationProp>();
    const placeholderImage = require('../../assets/agenda.png');
    const statusConfig = getStatusConfig(solicitacao.servico.status);
    const [showNegociacaoModal, setShowNegociacaoModal] = useState(false);
    const [novoValor, setNovoValor] = useState('');

    const handleCardPress = () => {
        navigation.navigate('FornecedorStack', {
            screen: 'ExibirAgendamentoScreen',
            params: {
                fornecedorId: solicitacao.servico.id_servico
            }
        });
    };

    const handleNegociarPreco = async () => {
        try {
            if (!novoValor || isNaN(Number(novoValor)) || Number(novoValor) <= 0) {
                Alert.alert('Erro', 'Por favor, insira um valor válido');
                return;
            }

            const data = {
                id_servico: solicitacao.servico.id_servico,
                valor: Number(novoValor)
            };

            await axios.put(`${API_URL}/servicos/valor`, data);
            onPressAtualizarStatus('confirmar valor');

            Alert.alert('Sucesso', 'Valor atualizado com sucesso!');

            setShowNegociacaoModal(false);
            setNovoValor('');
        } catch (error) {
            console.error('Erro ao atualizar valor:', error);
            Alert.alert('Erro', 'Erro ao atualizar valor');
        }
    };

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={handleCardPress}>
            <View style={styles.headerContainer}>
                <Image
                    source={solicitacao.usuario?.picture ? { uri: solicitacao.usuario.picture } : placeholderImage}
                    style={styles.userImage}
                />
                <View style={styles.userInfo}>
                    <Text style={styles.userName}>{solicitacao.usuario?.nome || 'Cliente'}</Text>
                    {solicitacao.usuario?.media_avaliacoes !== undefined && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                            {[1,2,3,4,5].map((star) => (
                                <MaterialCommunityIcons
                                    key={star}
                                    name={star <= Math.round(solicitacao.usuario?.media_avaliacoes || 0) ? 'star' : 'star-outline'}
                                    size={16}
                                    color={star <= Math.round(solicitacao.usuario?.media_avaliacoes || 0) ? '#FFD700' : '#CCC'}
                                />
                            ))}
                            <Text style={{ marginLeft: 4, fontSize: 12, color: '#666' }}>
                                {Number(solicitacao.usuario?.media_avaliacoes || 0).toFixed(1)}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.serviceCategory}>{solicitacao.servico.categoria}</Text>
                </View>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Data:</Text>
                    <Text style={styles.detailValue}>
                        {new Date(solicitacao.servico.data).toLocaleDateString()}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Horário:</Text>
                    <Text style={styles.detailValue}>
                        {new Date(solicitacao.servico.horario).toLocaleTimeString()}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Descrição:</Text>
                    <Text style={styles.detailValue}>{solicitacao.servico.descricao}</Text>
                </View>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}20` }]}>
                        <MaterialCommunityIcons
                            name={statusConfig.icon}
                            size={16}
                            color={statusConfig.color}
                        />
                        <Text style={[styles.statusText, { color: statusConfig.color }]}>
                            {statusConfig.text}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                {solicitacao.servico.status.toLowerCase() === 'pendente' && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => onPressAtualizarStatus('negociar valor')}
                        >
                            <Text style={styles.buttonText}>Aceitar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => onPressAtualizarStatus('Recusado')}
                        >
                            <Text style={styles.buttonText}>Recusar</Text>
                        </TouchableOpacity>
                    </>
                )}
                {solicitacao.servico.status.toLowerCase() === 'negociar valor' && (
                    <>
                        <TouchableOpacity
                            style={[styles.button, styles.acceptButton]}
                            onPress={() => setShowNegociacaoModal(true)}
                        >
                            <Text style={styles.buttonText}>Negociar Valor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.rejectButton]}
                            onPress={() => onPressAtualizarStatus('Recusado')}
                        >
                            <Text style={styles.buttonText}>Recusar</Text>
                        </TouchableOpacity>
                    </>
                )}

                {solicitacao.servico.status.toLowerCase() === 'em andamento' && (
                    <View style={styles.actionButtonsContainer}>
                        <View style={styles.mainButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => onPressAtualizarStatus('cancelado')}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.completeButton]}
                                onPress={() => onPressAtualizarStatus('Aguardando pagamento')}
                            >
                                <Text style={styles.buttonText}>Finalizar Serviço</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.button, styles.contactButton, styles.fullWidthButton]}
                            onPress={() => onPressEntrarContato(solicitacao.usuario?.id_usuario as string)}
                        >
                            <Text style={styles.buttonText}>Contato</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {solicitacao.servico.status.toLowerCase() === 'confirmado' && (
                    <View style={styles.actionButtonsContainer}>
                        <View style={styles.mainButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.button, styles.cancelButton]}
                                onPress={() => onPressAtualizarStatus('cancelado')}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, styles.completeButton]}
                                onPress={() => onPressAtualizarStatus('Em Andamento')}
                            >
                                <Text style={styles.buttonText}>Iniciar serviço</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={[styles.button, styles.contactButton, styles.fullWidthButton]}
                            onPress={() => onPressEntrarContato(solicitacao.usuario?.id_usuario as string)}
                        >
                            <Text style={styles.buttonText}>Contato</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Modal de Negociação */}
            <Modal
                visible={showNegociacaoModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowNegociacaoModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Negociar Preço</Text>
                        
                        <TextInput
                            style={styles.input}
                            value={novoValor}
                            onChangeText={setNovoValor}
                            placeholder="Digite o novo valor"
                            keyboardType="numeric"
                            placeholderTextColor="#666"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setShowNegociacaoModal(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleNegociarPreco}
                            >
                                <Text style={styles.modalButtonText}>Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#AC5906',
        padding: 15,
        marginVertical: 8,
        marginHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    userImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    serviceCategory: {
        fontSize: 14,
        color: '#666',
    },
    detailsContainer: {
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
        flex: 1,
        textAlign: 'right',
    },
    statusContainer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
    },
    actionButtonsContainer: {
        width: '100%',
        gap: 8,
    },
    mainButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
    },
    button: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: '#AC5906',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fullWidthButton: {
        width: '100%',
        marginTop: 8,
    },
    buttonText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '600',
        textAlign: 'center',
    },
    acceptButton: {
        backgroundColor: '#4CAF50',
    },
    rejectButton: {
        backgroundColor: '#F44336',
    },
    completeButton: {
        backgroundColor: '#2196F3',
    },
    cancelButton: {
        backgroundColor: '#F44336',
    },
    contactButton: {
        backgroundColor: '#9C27B0',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
    },
    modalButton: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 5,
    },
    confirmButton: {
        backgroundColor: '#AC5906',
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
}); 