import React, { useEffect, useState, useCallback } from "react"
import { typeFornecedor } from "../model/Fornecedor"
import { FornecedorView } from "../views/FornecedorView";
import { FornecedorService } from "../services/FornecedoresService";
import { UserService } from "../services/UserService";
import { useGetToken } from "../hooks/useGetToken";
import { User } from "../model/User";

export const FornecedorController = () => {
    const [fornecedoresPorCategoria, setFornecedoresPorCategoria] = useState<typeFornecedor[]>([]);
    const [fornecedoresMelhoresPreco, setFornecedoresMelhoresPreco] = useState<typeFornecedor[]>([]);
    const [fornecedoresMelhoresAvaliados, setFornecedoresMelhoresAvaliados] = useState<typeFornecedor[]>([]);
    const [usuario, setUsuario] = useState<User | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(false);
    const [categoria, setCategoria] = useState('Controle');
    const token = useGetToken();
    const userId = token?.id;

    const handleGetFornecedores = useCallback(async (categoria: string, ordenarPor?: 'avaliacao' | 'preco', ordem?: 'asc' | 'desc') => {
        const fornecedores = await FornecedorService.getFornecedoresPorCategoria(categoria, ordenarPor, ordem);
        return fornecedores || [];
    }, []);

    const handleGetUser = useCallback(async () => {
        setLoading(true);
        try {
            if (!userId) {
                console.log('Aguardando token...');
                return;
            }
            const user = await UserService.getUsers(userId);
            setUsuario(user);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const fetchFornecedores = useCallback(async () => {
        setLoading(true);
        try {
            const porCategoria = await handleGetFornecedores(categoria);
            setFornecedoresPorCategoria(porCategoria);

            const melhoresPreco = await handleGetFornecedores(categoria, 'preco', 'asc');
            setFornecedoresMelhoresPreco(melhoresPreco);

            const melhoresAvaliados = await handleGetFornecedores(categoria, 'avaliacao', 'desc');
            setFornecedoresMelhoresAvaliados(melhoresAvaliados);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [categoria, handleGetFornecedores]);

    useEffect(() => {
        fetchFornecedores();
    }, [fetchFornecedores]);

    useEffect(() => {
        if (userId) {
            handleGetUser();
        }
    }, [userId, handleGetUser]);

    return (
        <>
            <FornecedorView
                usuario={usuario}
                fornecedoresPorCategoria={fornecedoresPorCategoria}
                fornecedoresMelhoresPreco={fornecedoresMelhoresPreco}
                fornecedoresMelhoresAvaliados={fornecedoresMelhoresAvaliados}
                setCategoria={setCategoria}
                loading={loading}
                onDestaqueAtualizado={fetchFornecedores}
            />
        </>
    )
}