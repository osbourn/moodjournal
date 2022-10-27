import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native'
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import { KeyValuePair } from '@react-native-async-storage/async-storage/lib/typescript/types';

const Stack = createNativeStackNavigator();

type Entry = {
  before: boolean,
  activity: string,
  emotion: string
}


function ValidSelection( timeSpecifier: string, taskId: string, emotionName: string ): boolean {
  return timeSpecifier != "" && taskId != "" && emotionName != "";
}

async function Submit( before: boolean, taskId: string, emotionName: string) {
  console.log("Before: " + before + ", taskId: " + taskId + " emotionName: " + emotionName);
  const newEntry: Entry = {
    before: before,
    activity: taskId,
    emotion: emotionName
  };
  try {
    const numEntriesAsString: string | null = await AsyncStorage.getItem('@numEntries');
    const numEntries: number = numEntriesAsString == null ? 0 : parseInt(numEntriesAsString);
    const key: string = '@entry' + numEntries;
    const valueToSave: string = JSON.stringify(newEntry);
    await AsyncStorage.setItem(key, valueToSave);
    
    // After adding entry so that this won't run if adding entry fails
    await AsyncStorage.setItem('@numEntries', "" + (numEntries + 1));
  } catch (e: any) {
    console.log(e);
  }
  GetEntries(); // TODO: Delete this line
}

async function GetEntries(): Promise<Entry[] | undefined> {
  try {
    const entryKeys = await AsyncStorage.getAllKeys();
    const entries: Entry[] = (await AsyncStorage.multiGet(entryKeys))
      .filter(p => p[0].match(/@entry/)) // Remove all non-entry keys
      .map(p => p[1]) // For each KeyValue pair, we only want the value
      .map(str => JSON.parse(str!)); // Unserialize and convert to Entry object
    return entries;
  } catch (e: any) {
    console.log(e);
    Promise.reject(e);
  }
}

function SelectionPage() {
  const [openone, setOpenOne] = useState<boolean>(false);
  const [opentwo, setOpenTwo] = useState<boolean>(false);
  const [openthree, setOpenThree] = useState<boolean>(false);
  const [valueOne, setValueOne] = useState<string>("");
  const [valueTwo, setValueTwo] = useState<string>("");
  const [valueThree, setValueThree] = useState<string>("");
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
    {label: 'Joy', value: 'joy'},
    {label: 'Excitement', value: 'excitement'},
    {label: 'Amusement', value: 'amusement'},
    {label: 'Happy', value: 'happy'},
    {label: 'Relief', value: 'relief'},
    {label: 'Normal', value: 'normal'},
    {label: 'Sadness', value: 'sadness'},
    {label: 'Disgust', value: 'disgust'},
    {label: 'Annoyed', value: 'annoyed'},
    {label: 'Anger', value: 'anger'},
    {label: 'Depressed', value: 'depressed'}
  ]);
  const [showingError, setShowingError] = useState<boolean>(false);
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
      
      <Button title="Submit" onPress={() => {
        if (ValidSelection(valueOne, valueTwo, valueThree)) {
          Submit(valueOne == 'IAmAboutTo', valueTwo, valueThree);
        } else {
          setShowingError(true);
        }
      }} />

      {showingError && <Text style={{
        color: 'red',
        fontWeight: 'bold',
        fontSize: 30,
        textAlign: 'center'
      }}>Please select all options</Text>}

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
