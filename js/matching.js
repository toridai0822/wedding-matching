// マッチングアルゴリズム
class MatchingEngine {
    constructor(participants) {
        this.participants = participants;
        this.matches = [];
        this.matched = new Set(); // 既にマッチングされた参加者の受付番号
    }
    
    // メインのマッチング処理
    async performMatching() {
        this.matches = [];
        this.matched = new Set();
        
        // 優先度1: 第一希望同士のマッチング
        console.log('優先度1: 第一希望同士のマッチング');
        await this.matchMutualFirstChoice();
        
        // 優先度2: 第一希望と第二希望のマッチング
        console.log('優先度2: 第一希望と第二希望のマッチング');
        await this.matchFirstWithSecond();
        
        // 優先度3: 第二希望同士のマッチング
        console.log('優先度3: 第二希望同士のマッチング');
        await this.matchMutualSecondChoice();
        
        return this.matches;
    }
    
    // 優先度1: 第一希望同士のマッチング
    matchMutualFirstChoice() {
        for (const personA of this.participants) {
            // 既にマッチング済みならスキップ
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            // AさんがBさんを第一希望として選んでいる
            const personB = this.participants.find(p => 
                p.reception_number === personA.first_choice
            );
            
            if (!personB) continue;
            
            // Bさんも既にマッチング済みならスキップ
            if (this.matched.has(personB.reception_number)) {
                continue;
            }
            
            // BさんもAさんを第一希望として選んでいる（相互第一希望）
            if (personB.first_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'mutual_first', 1);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第一希望同士)`);
            }
        }
    }
    
    // 優先度2: 第一希望と第二希望のマッチング
    matchFirstWithSecond() {
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            // Aさんの第一希望の相手
            const personB = this.participants.find(p => 
                p.reception_number === personA.first_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            // BさんがAさんを第二希望として選んでいる
            if (personB.second_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'first_second', 2);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第一希望×第二希望)`);
            }
        }
        
        // 逆パターン: Aさんの第二希望がBさんの第一希望
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            // Aさんの第二希望の相手
            const personB = this.participants.find(p => 
                p.reception_number === personA.second_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            // BさんがAさんを第一希望として選んでいる
            if (personB.first_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'first_second', 2);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第二希望×第一希望)`);
            }
        }
    }
    
    // 優先度3: 第二希望同士のマッチング
    matchMutualSecondChoice() {
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            // Aさんの第二希望の相手
            const personB = this.participants.find(p => 
                p.reception_number === personA.second_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            // BさんもAさんを第二希望として選んでいる（相互第二希望）
            if (personB.second_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'mutual_second', 3);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第二希望同士)`);
            }
        }
    }
    
    // マッチングを追加
    addMatch(number1, number2, matchType, priority) {
        this.matched.add(number1);
        this.matched.add(number2);
        
        this.matches.push({
            participant1_number: Math.min(number1, number2),
            participant2_number: Math.max(number1, number2),
            match_type: matchType,
            match_priority: priority,
            created_date: new Date().toISOString()
        });
    }
    
    // マッチング結果をデータベースに保存
    async saveMatches() {
        // 既存のマッチングデータを削除
        try {
            const existingMatches = await fetch('tables/matches?limit=1000');
            const existingData = await existingMatches.json();
            
            for (const match of existingData.data) {
                await fetch(`tables/matches/${match.id}`, {
                    method: 'DELETE'
                });
            }
        } catch (error) {
            console.error('既存マッチング削除エラー:', error);
        }
        
        // 新しいマッチング結果を保存
        for (const match of this.matches) {
            try {
                await fetch('tables/matches', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(match)
                });
            } catch (error) {
                console.error('マッチング保存エラー:', error);
            }
        }
    }
}

// マッチング実行関数（管理画面から呼び出される）
async function executeMatching() {
    try {
        // 全参加者データを取得
        const response = await fetch('tables/participants?limit=100');
        const data = await response.json();
        const participants = data.data;
        
        if (participants.length === 0) {
            throw new Error('参加者が登録されていません');
        }
        
        // マッチングエンジン実行
        const engine = new MatchingEngine(participants);
        const matches = await engine.performMatching();
        
        // データベースに保存
        await engine.saveMatches();
        
        return {
            success: true,
            matchCount: matches.length,
            matches: matches
        };
    } catch (error) {
        console.error('マッチング実行エラー:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.executeMatching = executeMatching;
}