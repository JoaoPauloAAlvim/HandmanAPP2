import { useEffect, useRef } from 'react';
import { Socket, io } from 'socket.io-client';
import { API_URL } from '../constants/ApiUrl';
import { HistoricoAgendamento } from '../model/Agendamento';

interface UseSocketConnectionProps {
    tokenId: string | undefined;
    agendamentoId: string;
    setHistorico?: React.Dispatch<React.SetStateAction<HistoricoAgendamento[] | null>>;
    onValorAtualizado?: (novoValor: number) => void;
    onDestaqueAtualizado?: () => void;
}

export const useSocketConnection = ({
    tokenId,
    agendamentoId,
    setHistorico,
    onValorAtualizado,
    onDestaqueAtualizado
}: UseSocketConnectionProps) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!tokenId) return;

        // Inicializa o socket
        const socket = io(API_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socketRef.current = socket;

        // Eventos de conexão do socket
        socket.on('connect', () => {
            console.log('Socket conectado');
            socket.emit('join', tokenId);
        });

        socket.on('disconnect', () => {
            console.log('Socket desconectado');
        });

        socket.on('connect_error', (error) => {
            console.error('Erro na conexão do socket:', error);
        });

        // Escuta o evento de valor atualizado
        socket.on('valor_atualizado', (update) => {
            console.log('Recebido evento valor_atualizado:', update);
            if (update && update.id_servico === agendamentoId) {
                // Atualiza o histórico se disponível
                if (setHistorico) {
                    setHistorico(prevHistorico => {
                        if (!prevHistorico) return prevHistorico;
                        return prevHistorico.map(servico => {
                            if (servico.id_servico === update.id_servico) {
                                return {
                                    ...servico,
                                    valor: update.novo_valor,
                                    status: update.novo_status
                                };
                            }
                            return servico;
                        });
                    });
                }

                // Chama o callback de atualização de valor
                if (onValorAtualizado) {
                    onValorAtualizado(update.novo_valor);
                }
            }
        });

        // Escuta o evento de atualização de status
        socket.on('atualizacao_status', (update) => {
            console.log('Recebido evento atualizacao_status:', update);
            if (update && update.id_servico === agendamentoId && setHistorico) {
                setHistorico(prevHistorico => {
                    if (!prevHistorico) return prevHistorico;
                    return prevHistorico.map(servico => {
                        if (servico.id_servico === update.id_servico) {
                            return {
                                ...servico,
                                status: update.novo_status
                            };
                        }
                        return servico;
                    });
                });
            }
        });

        // Escuta o evento de destaque atualizado
        socket.on('destaqueAtualizado', (update) => {
            console.log('Recebido evento destaqueAtualizado:', update);
            if (onDestaqueAtualizado) {
                onDestaqueAtualizado();
            }
        });

        // Escuta o evento de fornecedores resetados
        socket.on('fornecedoresResetados', (update) => {
            console.log('Recebido evento fornecedoresResetados:', update);
            if (onDestaqueAtualizado) {
                onDestaqueAtualizado();
            }
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [tokenId, agendamentoId, setHistorico, onValorAtualizado, onDestaqueAtualizado]);

    return {
        socket: socketRef.current
    };
};

// Hook específico para eventos de destaque dos fornecedores
export const useDestaqueSocket = (onDestaqueAtualizado?: () => void) => {
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        console.log('Inicializando hook useDestaqueSocket...');
        
        // Inicializa o socket
        const socket = io(API_URL, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        // Eventos de conexão do socket
        socket.on('connect', () => {
            console.log('✅ Socket de destaque conectado (App) - ID:', socket.id);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket de destaque desconectado (App)');
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Erro na conexão do socket de destaque (App):', error);
        });

        // Escuta o evento de destaque atualizado
        socket.on('destaqueAtualizado', (update) => {
            console.log('🎯 Recebido evento destaqueAtualizado (App):', update);
            if (onDestaqueAtualizado) {
                console.log('Chamando callback onDestaqueAtualizado...');
                onDestaqueAtualizado();
            }
        });

        // Escuta o evento de fornecedores resetados
        socket.on('fornecedoresResetados', (update) => {
            console.log('🔄 Recebido evento fornecedoresResetados (App):', update);
            if (onDestaqueAtualizado) {
                console.log('Chamando callback onDestaqueAtualizado...');
                onDestaqueAtualizado();
            }
        });

        return () => {
            console.log('Desconectando socket de destaque...');
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [onDestaqueAtualizado]);

    return {
        socket: socketRef.current
    };
}; 