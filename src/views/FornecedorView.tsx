import { ActivityIndicator, ListRenderItemInfo, ScrollView, StyleSheet, Text, View,FlatList } from "react-native"
import { CardFornecedor } from "../components/CardFornecedor"
import { typeFornecedor } from "../model/Fornecedor";
import { BannerCarousel } from "../components/PromoCard";
import { HeaderUsuario } from "../components/HeaderUsuario";
import { User } from "../model/User";
import { SearchBar } from "../components/SearchBar";
import { CategoryButtons } from "../components/CategoryButtons";
import React, { useState, useEffect } from "react";
import { useDestaqueSocket } from "../hooks/useSocketConnection";

interface FornecedorViewProps {
    usuario: User | undefined,
    fornecedoresPorCategoria: typeFornecedor[] | undefined,
    fornecedoresMelhoresPreco: typeFornecedor[] | undefined,
    fornecedoresMelhoresAvaliados: typeFornecedor[] | undefined,
    setCategoria: React.Dispatch<React.SetStateAction<string>>
    loading:boolean
    onDestaqueAtualizado?: () => void;
}

export const FornecedorView = ({
    usuario, 
    fornecedoresPorCategoria, 
    fornecedoresMelhoresPreco, 
    fornecedoresMelhoresAvaliados, 
    setCategoria,
    loading,
    onDestaqueAtualizado
}: FornecedorViewProps) => {
    const [searchText, setSearchText] = useState('');
    const [filteredFornecedores, setFilteredFornecedores] = useState<typeFornecedor[] | undefined>(fornecedoresPorCategoria);

    // Hook para escutar eventos de destaque
    useDestaqueSocket(() => {
        console.log('Evento de destaque recebido em FornecedorView');
        if (onDestaqueAtualizado) {
            onDestaqueAtualizado();
        }
    });

    useEffect(() => {
        if (!searchText.trim()) {
            // Se a busca estiver vazia, mostre a lista por categoria completa
            setFilteredFornecedores(fornecedoresPorCategoria);
            return;
        }

        // Filtra a lista por categoria baseada no texto de busca
        const filtered = fornecedoresPorCategoria?.filter(prof => {
            const searchLower = searchText.toLowerCase();
            return (
                prof.nome?.toLowerCase().includes(searchLower) ||
                prof.categoria_servico?.some(cat => 
                    cat.toLowerCase().includes(searchLower)
                ) ||
                prof.sub_descricao?.toLowerCase().includes(searchLower)
            );
        });

        setFilteredFornecedores(filtered);
    }, [searchText, fornecedoresPorCategoria]);

    const handleSearch = (text: string) => {
        setSearchText(text);
    };

    const renderFornecedor = ({ item }: ListRenderItemInfo<typeFornecedor>) => {
        return (
            <CardFornecedor
                fornecedor={item}
                onDestaqueAtualizado={onDestaqueAtualizado}
            />
        )
    }

    // Lista de categorias de exemplo (você pode buscar isso de uma API ou estado)
    const categorias = ['Encanamento', 'Mudança', 'Carpintaria', 'Elétricista', 'Jardinagem', 'Limpeza'];

    return (
        <ScrollView style={styles.container}>
           <HeaderUsuario imagem={{uri: usuario?.picture}} name={usuario?.nome}/>
            <SearchBar onSearch={handleSearch}/>
            <BannerCarousel/>
            <CategoryButtons 
                categories={categorias} 
                onSelectCategory={(categoria) => {
                    setCategoria(categoria)
                }}
                loading={loading}
            />
            
            {loading ? (
                <View style={[styles.loadingContainer, { marginTop: 50 }]}>
                    <ActivityIndicator size="large" color="#AC5906" />
                </View>
            ) : (
                <>
                    <Text style={styles.title}>Fornecedores por Categoria</Text>
                    <FlatList
                        data={filteredFornecedores}
                        renderItem={renderFornecedor}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    />

                    <Text style={styles.title}>Melhores preços</Text>
                    <FlatList
                        data={fornecedoresMelhoresPreco}
                        renderItem={renderFornecedor}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    />
                    
                    <Text style={styles.title}>Melhores Profissionais</Text>
                    <FlatList
                        data={fornecedoresMelhoresAvaliados}
                        renderItem={renderFornecedor}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.contentContainer}
                    />
                </>
            )}
        </ScrollView>
    )
}


const styles = StyleSheet.create({
    container: {
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        alignSelf: 'flex-start',
        width: '100%'
    },
    title:{
        margin:20,
        fontSize: 18,
        color:'#A75C00'
    },
    loadingContainer: {
        flex: 1,
        padding:5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 10,
        marginBottom:10
    }
}); 