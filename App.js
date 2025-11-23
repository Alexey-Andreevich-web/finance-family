import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';

// SecureStore — безопасное локальное хранилище
import * as SecureStore from 'expo-secure-store';

// Навигация по вкладкам
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Графики
import { PieChart, BarChart } from 'react-native-chart-kit';

// ---------------------------------------------------------------------
// НАСТРОЙКИ
// ---------------------------------------------------------------------
const Tab = createBottomTabNavigator();
const screenWidth = Dimensions.get('window').width;

// Генератор набора цветов для диаграмм
function getColors() {
  return ['#00FF00', '#0000FF', '#FF6347', '#FFD700', '#8A2BE2'];
}

// Ключи для локального хранилища
const INCOMES_KEY = 'incomes_v2';
const EXPENSES_KEY = 'expenses_v2';

// ---------------------------------------------------------------------
// ЭКРАН "ДОХОДЫ"
// ---------------------------------------------------------------------
function IncomeScreen({ incomes, addIncome }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Добавление новой записи о доходе
  const handleAdd = () => {
    if (!amount || !category) return;
    addIncome({
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
    });
    setAmount('');
    setCategory('');
  };

  // Группируем доходы по категориям
  const totals = incomes.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  // Данные для круговой диаграммы
  const chartData = Object.keys(totals).map((key, i) => ({
    name: key,
    population: totals[key],
    color: getColors()[i % getColors().length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💰 Доходы</Text>

      {/* Поля ввода суммы и категории */}
      <TextInput
        style={styles.input}
        placeholder="Сумма"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Категория"
        value={category}
        onChangeText={setCategory}
      />

      <Button title="Добавить" onPress={handleAdd} />

      {/* Круговая диаграмма доходов */}
      {chartData.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{
            color: () => '#000',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
          }}
        />
      ) : (
        <Text style={styles.summary}>Нет данных для отображения диаграммы</Text>
      )}

      {/* Итоговая сумма */}
      <Text style={styles.summary}>Всего доходов: {total.toFixed(2)} ₽</Text>

      {/* Список всех доходов */}
      {incomes.length > 0 ? (
        <FlatList
          data={incomes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>
              {item.category}: {item.amount} ₽
            </Text>
          )}
        />
      ) : (
        <Text style={styles.summary}>Нет доходов для отображения</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------
// ЭКРАН "РАСХОДЫ"
// ---------------------------------------------------------------------
function ExpenseScreen({ expenses, addExpense }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');

  // Добавление новой записи о расходе
  const handleAdd = () => {
    if (!amount || !category) return;
    addExpense({
      id: Date.now().toString(),
      amount: parseFloat(amount),
      category,
    });
    setAmount('');
    setCategory('');
  };

  // Группировка расходов по категориям
  const totals = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  // Данные для круговой диаграммы расходов
  const chartData = Object.keys(totals).map((key, i) => ({
    name: key,
    population: totals[key],
    color: getColors()[i % getColors().length],
    legendFontColor: '#333',
    legendFontSize: 12,
  }));

  const total = expenses.reduce((sum, i) => sum + i.amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💸 Расходы</Text>

      {/* Поля ввода */}
      <TextInput
        style={styles.input}
        placeholder="Сумма"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Категория"
        value={category}
        onChangeText={setCategory}
      />

      <Button title="Добавить" onPress={handleAdd} />

      {/* Круговая диаграмма расходов */}
      {chartData.length > 0 ? (
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          chartConfig={{
            color: () => '#000',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
          }}
        />
      ) : (
        <Text style={styles.summary}>Нет данных для отображения диаграммы</Text>
      )}

      {/* Итоговая сумма */}
      <Text style={styles.summary}>Всего расходов: {total.toFixed(2)} ₽</Text>

      {/* Список всех расходов */}
      {expenses.length > 0 ? (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Text>
              {item.category}: {item.amount} ₽
            </Text>
          )}
        />
      ) : (
        <Text style={styles.summary}>Нет расходов для отображения</Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------
// ЭКРАН "АНАЛИЗ"
// ---------------------------------------------------------------------
function AnalysisScreen({ incomes, expenses, clearAll }) {
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = expenses.reduce((sum, i) => sum + i.amount, 0);
  const balance = totalIncome - totalExpense;

  const data = {
    labels: ['Доходы', 'Расходы'],
    datasets: [{ data: [totalIncome, totalExpense] }],
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>📊 Анализ</Text>

      {totalIncome || totalExpense ? (
        <BarChart
          data={data}
          width={screenWidth - 40}
          height={220}
          fromZero
          chartConfig={{
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            labelColor: () => '#000',
          }}
        />
      ) : (
        <Text style={styles.summary}>Нет данных для анализа</Text>
      )}

      <Text style={styles.summary}>Доходы: {totalIncome.toFixed(2)} ₽</Text>
      <Text style={styles.summary}>Расходы: {totalExpense.toFixed(2)} ₽</Text>
      <Text style={[styles.summary, { color: balance >= 0 ? 'green' : 'red' }]}>
        Баланс: {balance.toFixed(2)} ₽
      </Text>

      <Button title="Очистить все данные" color="red" onPress={clearAll} />
    </View>
  );
}

// ---------------------------------------------------------------------
// ГЛАВНЫЙ КОМПОНЕНТ ПРИЛОЖЕНИЯ
// ---------------------------------------------------------------------
export default function App() {
  const [incomes, setIncomes] = useState([]); // Доходы
  const [expenses, setExpenses] = useState([]); // Расходы

  // Загрузка сохранённых данных при запуске
  useEffect(() => {
    async function loadData() {
      try {
        const savedIncomes = await SecureStore.getItemAsync(INCOMES_KEY);
        const savedExpenses = await SecureStore.getItemAsync(EXPENSES_KEY);
        if (savedIncomes) {
          setIncomes(JSON.parse(savedIncomes));
        } else {
          setIncomes([]);  // Если данных нет, установим пустой массив
        }
        if (savedExpenses) {
          setExpenses(JSON.parse(savedExpenses));
        } else {
          setExpenses([]);  // Если данных нет, установим пустой массив
        }
      } catch (err) {
        console.log('Ошибка загрузки', err);
        setIncomes([]);  // Если произошла ошибка, установим пустые массивы
        setExpenses([]);
      }
    }
    loadData();
  }, []);

  // Сохранение доходов
  const addIncome = async (income) => {
    const newIncomes = [...incomes, income];
    setIncomes(newIncomes);
    await SecureStore.setItemAsync(INCOMES_KEY, JSON.stringify(newIncomes));
  };

  // Сохранение расходов
  const addExpense = async (expense) => {
    const newExpenses = [...expenses, expense];
    setExpenses(newExpenses);
    await SecureStore.setItemAsync(EXPENSES_KEY, JSON.stringify(newExpenses));
  };

  // Очистка всех данных
  const clearAll = async () => {
    setIncomes([]);
    setExpenses([]);
    await SecureStore.deleteItemAsync(INCOMES_KEY);
    await SecureStore.deleteItemAsync(EXPENSES_KEY);
    Alert.alert('Данные очищены');
  };

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Доходы"
          children={() => <IncomeScreen incomes={incomes} addIncome={addIncome} />}
        />
        <Tab.Screen
          name="Расходы"
          children={() => <ExpenseScreen expenses={expenses} addExpense={addExpense} />}
        />
        <Tab.Screen
          name="Анализ"
          children={() => <AnalysisScreen incomes={incomes} expenses={expenses} clearAll={clearAll} />}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ---------------------------------------------------------------------
// СТИЛИ
// ---------------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  summary: {
    fontSize: 18,
    marginTop: 10,
  },
});
