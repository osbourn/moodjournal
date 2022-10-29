

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
    const activityEntries = GroupEntries(entries);
    let scoreChanges: { activity: string; scores: number[] }[] = [];
    for (const activity of activityEntries.keys()) {
        scoreChanges.push({activity: activity, scores: GetScoreChanges(activityEntries.get(activity)!)});
    }
    const scoreAverages: { activity: string; score: number }[] = scoreChanges.map(e => {
        return { activity: e.activity, score: median(e.scores) } });
    console.log(scoreChanges);
    console.log(scoreAverages);
    return "" + scoreChanges;
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
