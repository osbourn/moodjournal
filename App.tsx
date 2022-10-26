import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native'
import DropDownPicker from 'react-native-dropdown-picker';

const Stack = createNativeStackNavigator();



function SelectionPage() {
  const [openone, setOpenOne] = useState(false);
  const [opentwo, setOpenTwo] = useState(false);
  const [openthree, setOpenThree] = useState(false);
  const [valueOne, setValueOne] = useState(null);
  const [valueTwo, setValueTwo] = useState(null);
  const [valueThree, setValueThree] = useState(null);
  const [items, setItems] = useState([
    {label: 'I Am About To', value: 'IAmAboutTo'},
    {label: 'I Have Just Completed', value: 'IHaveJustCompleted'}
  ]);
  const [tasks, setTasks] = useState([
    {label: 'Work', value: 'work'},
    {label: 'Relax', value: 'relax'},
    {label: 'Game', value: 'game'},
    {label: 'Study', value: 'study'},
    {label: 'Go Out', value: 'go out'},
    {label: 'Work-out', value: 'work out'},
    {label: 'Read', value: 'read'},
    {label: 'Cook', value: 'cook'},
  ]);
  const [feelings, setFeeling] = useState([
    {label: 'Joy', value: '100'},
    {label: 'Excitement', value: '80'},
    {label: 'Amusement', value: '60'},
    {label: 'Happy', value: '40'},
    {label: 'Relief', value: '20'},
    {label: 'Normal', value: '0'},
    {label: 'Sadness', value: '-20'},
    {label: 'Disgust', value: '-40'},
    {label: 'Annoyed', value: '-60'},
    {label: 'Anger', value: '-80'},
    {label: 'Depressed', value: '-100'}
  ]);
  return (
    <View>
      <Text style={styles.pageLabel}>
        Enter in the Following Information!
      </Text>
      <Text style={styles.titleText}>
        Time Frame:
        </Text>
      <DropDownPicker
        zIndex={3000}
        zIndexInverse={1000}
        open={openone}
        value={valueOne}
        items={items}
        setOpen={setOpenOne}
        setValue={setValueOne}
        setItems={setItems}
      />
      <Text style={styles.titleText}>
        Activity:
        </Text>
      <DropDownPicker
        zIndex={2000}
        zIndexInverse={2000}
        open={opentwo}
        value={valueTwo}
        items={tasks}
        setOpen={setOpenTwo}
        setValue={setValueTwo}
        setItems={setTasks}
      />
      <Text style={styles.titleText}>
        Current Emotion:
        </Text>      
      <DropDownPicker 
        zIndex={1000}
        zIndexInverse={3000}
        open={openthree}
        value={valueThree}
        items={feelings}
        setOpen={setOpenThree}
        setValue={setValueThree}
        setItems={setFeeling}
      />
      
      <StatusBar style="auto"/>
    </View>
  )
}


function HomePage() {
  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to  start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Emotional Manager Entry" component={SelectionPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  DropDown: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column'
  },
  titleText: {
    fontSize: 30,
  },
  pageLabel: {
    fontSize: 45,
    textAlignVertical: 'top',
    textAlign: 'center',
    fontWeight: "bold"
  }
});
