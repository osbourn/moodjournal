

export type Entry = {
    activity: string,
    beforeEmotion: string,
    afterEmotion: string,
  }

const emotionScore = {
    'Joy': 100,
    'Excitement': 80,
    'Happy': 60,
    'Content': 40,
    'Relief': 20,
    'Indifferent': 0,
    'Sad': -20,
    'Stressed': -40,
    'Annoyed': -60,
    'Anger': -80,
    'Depressed': -100,
}

type ScoreList = { beforeEmotion: string; afterEmotion: string }[];

export function Analyze(entries: Entry[]): string {
    console.log(GroupEntries(entries));
    return "";
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
