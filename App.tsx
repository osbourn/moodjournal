import { NavigationContainer, Link, DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useState, Component, useEffect, ReactElement } from 'react';
import { StyleSheet, Text, View, Button, FlatList, TextInput } from 'react-native'
import { Provider as PaperProvider, MD3DarkTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import merge from 'deepmerge';

import { Activity, NewActivity, GetActivities, SetActivities } from './Activities'
import { Entry, Analyze } from './Analysis'

const Stack = createNativeStackNavigator();

type PatrialEntry = {
  activity: string,
  beforeEmotion: string,
  startTime: Date,
}

async function Submit( entry : Entry ) {
  try {
    const numEntriesAsString: string | null = await AsyncStorage.getItem('@numEntries');
    const numEntries: number = numEntriesAsString === null ? 0 : parseInt(numEntriesAsString);
    const key: string = '@entry' + numEntries;
    const valueToSave: string = JSON.stringify(entry);
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

function TextSetting(props: { text: string, onSave: (s: string) => void, onDelete: (_: void) => void, startEditing: boolean }) {
  const [text, setText] = useState<string>(props.text);
  const [isEditing, setIsEditing] = useState<boolean>(props.startEditing);

  // JSX elements to display when editing
  const editingElements = [
    <TextInput style={styles.settingsPageNameDisplay} value={text} onChangeText={setText}/>,
    <View style={styles.settingsPageSmallButton}>
      <Button title="Save" color='green' onPress={() => {
        props.onSave(text);
        setIsEditing(false);
      }}/>
    </View>,
    <View style={styles.settingsPageSmallButton}>
      <Button title="Cancel" color='grey' onPress={() => {
        setIsEditing(false);
        // Reset to original text
        setText(props.text);
      }} />
    </View>
  ];
  // JSX elements to display when not editing
  const nonEditingElements = [
    <Text style={styles.settingsPageNameDisplay}>{text}</Text>,
    <View style={styles.settingsPageSmallButton}>
      <Button title="Edit" onPress={() => setIsEditing(true)}/>
    </View>,
    <View style={styles.settingsPageSmallButton}>
      <Button title="Delete" color='darkred' onPress={() => props.onDelete()} />
    </View>
  ];

  return (
    <View style={styles.settingsPageEntry}>
      { isEditing ? editingElements : nonEditingElements }
    </View>
  );
}


class SettingsPage extends Component<any, { currentSettings: Activity[] }> {
  constructor(props: any) {
    super(props);
    this.state = { currentSettings: [] };
  }

  componentDidMount(): void {
    GetActivities()
      .then(activities => this.setState({ currentSettings: activities! }));
  }

  removeActivity(id: string) {
    const newSettings = this.state.currentSettings.filter(activity => activity.id != id);
    this.setState({ currentSettings: newSettings });
    SetActivities(newSettings);
  }

  renameActivity(id: string, newName: string) {
    const newSettings = this.state.currentSettings.map(activity => {
      if (activity.id === id) {
        return {
          id: activity.id,
          displayName: newName,
        }
      } else {
        return activity;
      }
    });
    this.setState({ currentSettings: newSettings });
    SetActivities(newSettings);
  }

  newActivity() {
    const newActivity: Activity = NewActivity("Activity Name");
    let newSettings = this.state.currentSettings.slice(0);
    newSettings.push(newActivity);
    this.setState({ currentSettings: newSettings });
    SetActivities(newSettings);
  }

  render() {
    return ( 
    <View>
      <FlatList
        data={this.state.currentSettings}
        renderItem={({ item }) => (
          <View>
            <TextSetting text={item.displayName}
                         onSave={newName => this.renameActivity(item.id, newName)}
                         onDelete={() => this.removeActivity(item.id)}
                         startEditing={false}
            />
          </View>
        )}
        keyExtractor={item => item.id}
      />
      <Button title="New Activity" onPress={() => this.newActivity()}/> 
    </View>
    );
  }
}

function SelectionPage(props: any) {
  console.log(props);
  const isBefore: boolean = props.route.params.isBefore;
  const [activityMenuOpen, setActivityMenuOpen] = useState<boolean>(false);
  const [emotionMenuOpen, setEmotionMenuOpen] = useState<boolean>(false);
  const [activityValue, setActivityValue] = useState<string>("");
  const [emotionValue, setEmotionValue] = useState<string>("");

  const [activityList, setActivityList] = useState<Activity[]>([]);

  useEffect(() => {
    async function retrieveActivities() {
      const activitiesPromise: Promise<Activity[] | undefined> = GetActivities();
      setActivityList((await activitiesPromise)!);
    }
    retrieveActivities();
  }, []);

  const [feelings, setFeeling] = useState([
    {label: 'Joy', value: 'joy'},
    {label: 'Excitement', value: 'excitement'},
    {label: 'Happy', value: 'happy'},
    {label: 'Content', value: 'content'},
    {label: 'Relief', value: 'relief'},
    {label: 'Indifferent', value: 'indifferent'},
    {label: 'Sad', value: 'sad'},
    {label: 'Stressed', value: 'stressed'},
    {label: 'Annoyed', value: 'annoyed'},
    {label: 'Anger', value: 'anger'},
    {label: 'Lost', value: 'lost'}
  ]);
  const [showingError, setShowingError] = useState<boolean>(false);
  return (
    <View>
      <Text style={styles.pageLabel}>
        Enter in the Following Information!
      </Text>
      {
        isBefore ? <Text>
          Please enter the activity you are completing:
        </Text> : <Text>
          How are you doing after your activity?
        </Text>
      }

      {
        isBefore && <DropDownPicker
          zIndex={2000}
          zIndexInverse={2000}
          open={activityMenuOpen}
          value={activityValue}
          items={activityList.map(activity => ({
            label: activity.displayName,
            value: activity.id
          }))}
          setOpen={setActivityMenuOpen}
          setValue={setActivityValue}
          setItems={setActivityList}
        />
      }
      <Text style={styles.titleText}>
        Current Emotion:
        </Text>      
      <DropDownPicker 
        zIndex={1000}
        zIndexInverse={3000}
        open={emotionMenuOpen}
        value={emotionValue}
        items={feelings}
        setOpen={setEmotionMenuOpen}
        setValue={setEmotionValue}
        setItems={setFeeling}
      />
      
      <Button title="Submit" onPress={() => {
        if ((activityValue === "" && isBefore) || emotionValue === "") {
          setShowingError(true);
        } else if (isBefore) {
          const activeEntry : PatrialEntry = {
            activity: activityValue,
            beforeEmotion: emotionValue,
            startTime: new Date(),
          };
          props.navigation.navigate('Completing Entry', { activeEntry: activeEntry });
        } else {
          const activeEntry : PatrialEntry = props.route.params.activeEntry;
          const entry : Entry = {
            activity: activeEntry.activity,
            beforeEmotion: activeEntry.beforeEmotion,
            afterEmotion: emotionValue,
            startTime: activeEntry.startTime,
          };
          Submit(entry);
          props.navigation.navigate('Home');
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


function HomePage( props: any ) {
  return (
    <View>
        <View style={styles.button}>
          <Button title='Record Activity' onPress={
            () => props.navigation.navigate('Emotional Manager Entry')
          }
          />
        </View>
        <View style={styles.button}>
          <Button title='Activity Recommendation' onPress={
            () => props.navigation.navigate('Analysis')
          }
          />
        </View>
        <View style={styles.button}>
          <Button title='Settings' onPress={
            () => props.navigation.navigate('Settings')
          }
          />
        </View>
        <StatusBar style="auto" />
      </View>
  );
}

class AnalysisPage extends Component<any, { analysisResult: ReactElement }> {
  constructor(props: any) {
    super(props);
    this.state = { analysisResult: <Text></Text> };
  }

  componentDidMount(): void {
    GetEntries()
      .then(entries => Analyze(entries!))
      .then(analysis => this.setState({ analysisResult: analysis }));
    
  }

  render() {
    return ( 
    <View>
      {this.state.analysisResult}
    </View>
    );
  }
}

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false}}/>
          <Stack.Screen name="Settings" component={SettingsPage}/>
          <Stack.Screen name="Emotional Manager Entry" component={SelectionPage} initialParams={{ isBefore: true }} />
          <Stack.Screen name="Completing Entry" component={SelectionPage} initialParams={{ isBefore: false }} />
          <Stack.Screen name="Analysis" component={AnalysisPage} />
        </Stack.Navigator>  
      </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: 'royalblue',
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
  },
  button: {
    fontSize:30,
    fontWeight: "bold",
    color: 'royalblue',
    alignItems: 'center'
  },
  settingsPageEntry: {
    fontSize: 30,
    fontWeight: "bold",
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingsPageNameDisplay: {
    flex: 3
  },
  settingsPageSmallButton: {
    paddingLeft: '2%',
    flex: 1
  }
});
