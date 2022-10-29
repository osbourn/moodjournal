

export type Entry = {
    activity: string,
    beforeEmotion: string,
    afterEmotion: string,
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

export function Analyze(entries: Entry[]): string {
    const emotionEntries = GroupEntries(entries);
    let scoreChanges: Map<string, number[]> = new Map();
    for (const emotion of emotionEntries.keys()) {
        scoreChanges.set(emotion, GetScoreChanges(emotionEntries.get(emotion)!));
    }
    console.log(scoreChanges);
    return "" + scoreChanges;
}

function GroupEntries(entries: Entry[]): Map<string, ScoreList> {
    let m: Map<string, ScoreList> = new Map();
    for (const entry of entries) {
        if (m.get(entry.activity) == undefined) {
            m.set(entry.activity, []);
        }
        m.get(entry.activity)!.push({ beforeEmotion: entry.beforeEmotion, afterEmotion: entry.afterEmotion});
    }
    return m;
}

function GetScoreChanges(list: ScoreList): number[] {
    return list.map(pair => emotionScore.get(pair.afterEmotion)! - emotionScore.get(pair.beforeEmotion)!);
}