// マッチングアルゴリズム（Supabase版）
class MatchingEngine {
    constructor(participants) {
        this.participants = participants;
        this.matches = [];
        this.matched = new Set();
    }
    
    async performMatching() {
        this.matches = [];
        this.matched = new Set();
        
        console.log('優先度1: 第一希望同士のマッチング');
        await this.matchMutualFirstChoice();
        
        console.log('優先度2: 第一希望と第二希望のマッチング');
        await this.matchFirstWithSecond();
        
        console.log('優先度3: 第二希望同士のマッチング');
        await this.matchMutualSecondChoice();
        
        return this.matches;
    }
    
    matchMutualFirstChoice() {
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            const personB = this.participants.find(p => 
                p.reception_number === personA.first_choice
            );
            
            if (!personB) continue;
            if (this.matched.has(personB.reception_number)) {
                continue;
            }
            
            if (personB.first_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'mutual_first', 1);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第一希望同士)`);
            }
        }
    }
    
    matchFirstWithSecond() {
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            const personB = this.participants.find(p => 
                p.reception_number === personA.first_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            if (personB.second_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'first_second', 2);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第一希望×第二希望)`);
            }
        }
        
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            const personB = this.participants.find(p => 
                p.reception_number === personA.second_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            if (personB.first_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'first_second', 2);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第二希望×第一希望)`);
            }
        }
    }
    
    matchMutualSecondChoice() {
        for (const personA of this.participants) {
            if (this.matched.has(personA.reception_number)) {
                continue;
            }
            
            const personB = this.participants.find(p => 
                p.reception_number === personA.second_choice
            );
            
            if (!personB || this.matched.has(personB.reception_number)) {
                continue;
            }
            
            if (personB.second_choice === personA.reception_number) {
                this.addMatch(personA.reception_number, personB.reception_number, 'mutual_second', 3);
                console.log(`マッチング成立: ${personA.reception_number} ⇔ ${personB.reception_number} (第二希望同士)`);
            }
        }
    }
    
    addMatch(number1, number2, matchType, priority) {
        this.matched.add(number1);
        this.matched.add(number2);
        
        this.matches.push({
            participant1_number: Math.min(number1, number2),
            participant2_number: Math.max(number1, number2),
            match_type: matchType,
            match_priority: priority
        });
    }
    
    async saveMatches() {
        // 既存のマッチングデータを削除
        try {
            const { error: deleteError } = await supabase
                .from('matches')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // すべて削除
            
            if (deleteError) {
                console.error('既存マッチング削除エラー:', deleteError);
            }
        } catch (error) {
            console.error('既存マッチング削除エラー:', error);
        }
        
        // 新しいマッチング結果を保存
        if (this.matches.length > 0) {
            const { data, error } = await supabase
                .from('matches')
                .insert(this.matches)
                .select();
            
            if (error) {
                console.error('マッチング保存エラー:', error);
                throw error;
            }
        }
    }
}

async function executeMatching() {
    try {
        // 全参加者データを取得（Supabase）
        const { data: participants, error } = await supabase
            .from('participants')
            .select('*')
            .order('reception_number');
        
        if (error) {
            throw new Error('参加者データの取得に失敗しました: ' + error.message);
        }
        
        if (!participants || participants.length === 0) {
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

if (typeof window !== 'undefined') {
    window.executeMatching = executeMatching;
}