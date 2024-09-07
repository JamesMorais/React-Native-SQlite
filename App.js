import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, FlatList } from 'react-native';
import * as SQLite from 'expo-sqlite';


export default function App() {

  const [listaDeProdutos, setListaDeProdutos] = useState([]);
  const [textInputName, setTextInputName] = useState("");
  const [textInputQtd, setTextInputQtd] = useState("");
  const [updateActive, setUpdateActive] = useState(false);

  // Função para adicionar novo produto no banco de dados
  async function addNew() {

    if (!textInputName || !textInputQtd) {
      console.log('Campo vazio');
    } else {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      // Insere novo produto no banco de dados
      await db.runAsync(
        "INSERT INTO produtos (value, intValue) VALUES (?, ?)",
        textInputName,
        textInputQtd
      );
      // Atualiza a lista de produtos
      getList();
      // Limpa os campos de input
      setTextInputName("");
      setTextInputQtd("");
    }
  }

  async function removeList(item) {
    const db = await SQLite.openDatabaseAsync("databaseApp");

    // Deleta o item do banco de dados
    await db.runAsync('DELETE FROM produtos WHERE value = $value', { $value: item });

    // Atualiza a lista
    getList();
  }

  // Função para carregar os dados do item a ser atualizado
  async function update(item, qtd) {
    setUpdateActive(true); 
    setTextInputName(item); 
    setTextInputQtd(qtd.toString());
  }

  // Função para executar a atualização no banco de dados
  async function actionUpdate() {
    if (!textInputName || !textInputQtd) {
      console.log('Campo vazio');
    } else {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      await db.runAsync(
        'UPDATE produtos SET intValue = ? WHERE value = ?',
        textInputQtd,
        textInputName
      );

      // Atualiza a lista e limpa os campos para voltarem a ser vazios
      getList();
      setTextInputName("");
      setTextInputQtd("");
      setUpdateActive(false); // Desativa o modo de atualização e volta a ter o botão add
    }
  }

  // Função para buscar a lista de produtos do banco de dados
  async function getList() {
    const db = await SQLite.openDatabaseAsync("databaseApp");

    // Busca todos os produtos no banco de dados
    const allRows = await db.getAllAsync("SELECT * FROM produtos");
    let newArray = [];

    // Popula o array com os dados da tabela
    for (const row of allRows) {
      console.log(row.id, row.value, row.intValue);
      // criei o objeto que contém os campos productName e productQtd
      newArray.push({ prodcutName: row.value, productQtd: row.intValue });
    }

    // Atualiza a lista de produtos no estado
    setListaDeProdutos(newArray);
  }

  // useEffect para configurar o banco de dados ao inicializar o app
  useEffect(() => {
    async function setUp() {
      const db = await SQLite.openDatabaseAsync("databaseApp");

      // Configura o banco de dados e cria a tabela, caso não exista
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS produtos (
          id INTEGER PRIMARY KEY NOT NULL, 
          value TEXT NOT NULL, 
          intValue INTEGER
        );
      `);

      // Carrega a lista inicial de produtos
      getList();
    }

    setUp();
  }, []);

  return (
    <View style={styles.container}>
      {/* Entrada de nome do produto */}
      <Text>Adicione seu Produto:</Text>
      <TextInput
        value={textInputName}
        style={styles.input}
        placeholder="Digite o nome do produto..."
        onChangeText={setTextInputName}
      />
  
      {/* Entrada de quantidade */}
      <Text>Adicione a quantidade:</Text>
      <TextInput
        value={textInputQtd}
        style={styles.input}
        placeholder="Digite a quantidade..."
        onChangeText={setTextInputQtd}
      />
  
      {/* Botão de adicionar ou atualizar */}
      {updateActive ? (
        <TouchableOpacity onPress={actionUpdate} style={[styles.buttons, { backgroundColor: '#007bff' }]}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={addNew} style={[styles.buttons, { backgroundColor: '#28a745' }]}>
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      )}
  
      {/* Renderização da lista de produtos com FlatList */}
      <FlatList
        data={listaDeProdutos}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.containerList}>
            <View style={{gap: 5}}>
              <Text style={{fontWeight: 'bold'}}>Produto:</Text>
              <Text>{item.prodcutName}</Text>
              <Text style={{fontWeight: 'bold'}}>Quantidade:</Text>
              <Text>{item.productQtd}</Text>
            </View>
            <View>
              <TouchableOpacity onPress={() => removeList(item.prodcutName)} style={[styles.buttons, { backgroundColor: '#dc3545' }]}>
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => update(item.prodcutName, item.productQtd)} style={[styles.buttons, { backgroundColor: '#007bff' }]}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center' }} // Faz a lista ocupar todo o espaço disponível
      />
  
      <StatusBar style="auto" />
    </View>
  );
  
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: '50%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e0e0e0'
  },
  input: {
    textAlign: 'center',
    height: 40,
    width: '80%',
    borderWidth: 1,
    padding: 10,
    margin: 10,
  },
  containerList: {
    borderWidth: 1,
    width: '80%',
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  buttons: {
    borderWidth: 1,
    width: '80%',
    padding: 10,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
  },
});
