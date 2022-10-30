import React, { Component, ReactElement } from "react";
import { View, Text, SectionList, StyleSheet } from "react-native";
import { Card, Paragraph, Title } from "react-native-paper";

import { GetActivityDisplayName } from "./Activities";

export type Entry = {
    activity: string,
    beforeEmotion: string,
    afterEmotion: string,
    startTime: Date,
  }

const emotionScore: Map<string, number> = new Map([
    ['joy', 100],
    ['excitement', 80],
    ['happy', 60],
    ['content', 40],
    ['relief', 20],
    ['indifferent', 0],
    ['sad', -20],
    ['stressed', -40],
    ['annoyed', -60],
    ['anger', -80],
    ['lost', -100]
]);

type ScoreList = { beforeEmotion: string; afterEmotion: string }[];

export async function Analyze(entries: Entry[]): Promise<ReactElement> {
    const activityEntries = GroupEntries(entries);
    let scoreChanges: { activity: string; scores: number[] }[] = [];
    for (const activity of activityEntries.keys()) {
        scoreChanges.push({activity: activity, scores: GetScoreChanges(activityEntries.get(activity)!)});
    }
    const scoreAverages: { activity: string; score: number }[] = scoreChanges.map(e => {
        return { activity: e.activity, score: median(e.scores) } });
    let NegAct: string[] = [];
    let PosAct = [];
    let Act = "";
    let GenAct = [];
    let EmS = 0;
    for(let index = 0; index < scoreAverages.length; index++) {
        EmS = EmS + scoreAverages[index].score;
        if(scoreAverages[index].score < 0) {
            Act = scoreAverages[index].activity;
            Act = Act.charAt(0).toUpperCase() + Act.slice(1);
            const actDisplayName : string | null | undefined = await GetActivityDisplayName(Act);
            if (actDisplayName) {
                NegAct.push(actDisplayName);
            }
        }
        if(scoreAverages[index].score > 0) {
            Act = scoreAverages[index].activity;
            Act = Act.charAt(0).toUpperCase() + Act.slice(1);
            const actDisplayName : string | null | undefined = await GetActivityDisplayName(Act);
            if (actDisplayName) {
                PosAct.push(actDisplayName);
            }
        }
    }

    if(EmS/scoreAverages.length >= 0) {
        GenAct.push('Meditation', 'Watching a Movie', 'Hobbies');
    }
    else {
        GenAct.push('Talking to Friends', 'Sleeping', 'Eating');
    }

    //Think About Giving Suggestions in Paragraph Format
    return ( 
    <View style={Styles.container}>
        <SectionList 
            sections={[
                {title: 'Somethings You Should Do:', data: PosAct},
                {title: 'Activities that Worsen Your Mood:', data: NegAct},
                {title: 'General Acts You Should Do:', data: GenAct}
            ]}
            renderSectionHeader={({section}) => <Text style={Styles.sectionHeader}>{section.title}</Text>}
            renderItem={({item}) => <Text style={Styles.item}>{item}</Text>}
        />
    </View> );
}



function median(nums: number[]): number {
    const sorted = nums.sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function GroupEntries(entries: Entry[]): Map<string, ScoreList> {
    let m: Map<string, ScoreList> = new Map();
    for (const entry of entries) {
        if (m.get(entry.activity) === undefined) {
            m.set(entry.activity, []);
        }
        m.get(entry.activity)!.push({ beforeEmotion: entry.beforeEmotion, afterEmotion: entry.afterEmotion});
    }
    return m;
}

function GetScoreChanges(list: ScoreList): number[] {
    return list.map(pair => emotionScore.get(pair.afterEmotion)! - emotionScore.get(pair.beforeEmotion)!);
}

const Styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        flexDirection: 'row'
      },
    sectionHeader: {
        paddingTop: 3,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 3,
        fontSize: 30,
        fontWeight: 'bold',
        backgroundColor: 'lightgray'
    },
    item: {
        padding: 15,
        fontSize: 20,
        height: 50,
    }
})
