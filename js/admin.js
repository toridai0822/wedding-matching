// 管理者画面JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const loginScreen = document.getElementById('loginScreen');
    const adminScreen = document.getElementById('adminScreen');
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    
    // 管理者パスワード（本番環境では適切に管理してください）
    const ADMIN_PASSWORD = 'admin123';
    
    // セッションチェック
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminScreen();
    }
    
    // ログインフォーム送信
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (passwordInput.value === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminScreen();
            showSuccess('ログインしました');
        } else {
            showError('パスワードが正しくありません');
            passwordInput.value = '';
        }
    });
    
    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', function() {
        sessionStorage.removeItem('adminLoggedIn');
        adminScreen.style.display = 'none';
        loginScreen.style.display = 'block';
        showSuccess('ログアウトしました');
    });
    
    // マッチング実行
    document.getElementById('matchBtn').addEventListener('click', async function() {
        if (!confirm('マッチング処理を実行しますか？\n既存のマッチング結果は上書きされます。')) {
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 処理中...';
        
        try {
            const result = await executeMatching();
            
            if (result.success) {
                showSuccess(`マッチング完了！ ${result.matchCount}組のマッチングが成立しました`);
                await loadData();
            } else {
                showError('マッチング処理に失敗しました: ' + result.error);
            }
        } catch (error) {
            showError('エラーが発生しました: ' + error.message);
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-heart"></i> マッチング実行';
        }
    });
    
    // 全データリセット
    document.getElementById('resetBtn').addEventListener('click', async function() {
        if (!confirm('本当に全データをリセットしますか？\nこの操作は取り消せません。')) {
            return;
        }
        
        if (!confirm('確認: 参加者データとマッチング結果が全て削除されます。')) {
            return;
        }
        
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 削除中...';
        
        try {
            let deletedParticipants = 0;
            let deletedMatches = 0;
            
            // マッチングデータ削除（先に削除）
            try {
                const matchesResponse = await fetch('tables/matches?limit=1000');
                const matchesData = await matchesResponse.json();
                
                console.log(`削除するマッチングデータ: ${matchesData.data.length}件`);
                
                for (const match of matchesData.data) {
                    try {
                        await fetch(`tables/matches/${match.id}`, {
                            method: 'DELETE'
                        });
                        deletedMatches++;
                    } catch (err) {
                        console.error('マッチング削除エラー:', err);
                    }
                }
            } catch (error) {
                console.error('マッチング取得エラー:', error);
            }
            
            // 参加者データ削除
            try {
                const participantsResponse = await fetch('tables/participants?limit=1000');
                const participantsData = await participantsResponse.json();
                
                console.log(`削除する参加者データ: ${participantsData.data.length}件`);
                
                for (const participant of participantsData.data) {
                    try {
                        await fetch(`tables/participants/${participant.id}`, {
                            method: 'DELETE'
                        });
                        deletedParticipants++;
                    } catch (err) {
                        console.error('参加者削除エラー:', err);
                    }
                }
            } catch (error) {
                console.error('参加者取得エラー:', error);
            }
            
            showSuccess(`全データをリセットしました（参加者: ${deletedParticipants}件、マッチング: ${deletedMatches}件）`);
            await loadData();
        } catch (error) {
            showError('リセット処理に失敗しました: ' + error.message);
            console.error(error);
        } finally {
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-trash-alt"></i> 全データリセット';
        }
    });
    
    // 管理画面表示
    function showAdminScreen() {
        loginScreen.style.display = 'none';
        adminScreen.style.display = 'block';
        loadData();
    }
    
    // データ読み込み
    async function loadData() {
        await Promise.all([
            loadParticipants(),
            loadMatches(),
            updateStats()
        ]);
    }
    
    // 参加者データ読み込み
    async function loadParticipants() {
        try {
            const response = await fetch('tables/participants?limit=100&sort=reception_number');
            const data = await response.json();
            const participants = data.data;
            
            const tbody = document.getElementById('participantsBody');
            
            if (participants.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="no-data">
                            <i class="fas fa-inbox"></i>
                            <div>参加者データがありません</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = participants.map(p => `
                <tr>
                    <td><strong>${p.reception_number}</strong></td>
                    <td>${p.name || '-'}</td>
                    <td><span class="badge badge-${p.gender}">${p.gender === 'male' ? '男性' : '女性'}</span></td>
                    <td>${p.first_choice}</td>
                    <td>${p.second_choice}</td>
                </tr>
            `).join('');
        } catch (error) {
            console.error('参加者データ読み込みエラー:', error);
        }
    }
    
    // マッチング結果読み込み
    async function loadMatches() {
        try {
            const [matchesResponse, participantsResponse] = await Promise.all([
                fetch('tables/matches?limit=100&sort=match_priority'),
                fetch('tables/participants?limit=100')
            ]);
            
            const matchesData = await matchesResponse.json();
            const participantsData = await participantsResponse.json();
            
            const matches = matchesData.data;
            const participants = participantsData.data;
            
            const tbody = document.getElementById('matchesBody');
            
            if (matches.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="no-data">
                            <i class="fas fa-inbox"></i>
                            <div>マッチングが実行されていません</div>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // 参加者情報を受付番号で検索できるようにマップ化
            const participantMap = {};
            participants.forEach(p => {
                participantMap[p.reception_number] = p;
            });
            
            tbody.innerHTML = matches.map(m => {
                const p1 = participantMap[m.participant1_number] || {};
                const p2 = participantMap[m.participant2_number] || {};
                
                let matchTypeText = '';
                let badgeClass = '';
                
                switch(m.match_type) {
                    case 'mutual_first':
                        matchTypeText = '第一希望同士';
                        badgeClass = 'badge-priority-1';
                        break;
                    case 'first_second':
                        matchTypeText = '第一×第二希望';
                        badgeClass = 'badge-priority-2';
                        break;
                    case 'mutual_second':
                        matchTypeText = '第二希望同士';
                        badgeClass = 'badge-priority-3';
                        break;
                }
                
                return `
                    <tr>
                        <td><strong>${m.participant1_number}</strong></td>
                        <td>${p1.name || '-'}</td>
                        <td style="text-align: center; color: var(--primary-color);"><i class="fas fa-heart"></i></td>
                        <td><strong>${m.participant2_number}</strong></td>
                        <td>${p2.name || '-'}</td>
                        <td><span class="badge ${badgeClass}">${matchTypeText}</span></td>
                    </tr>
                `;
            }).join('');
        } catch (error) {
            console.error('マッチングデータ読み込みエラー:', error);
        }
    }
    
    // 統計情報更新
    async function updateStats() {
        try {
            const [participantsResponse, matchesResponse] = await Promise.all([
                fetch('tables/participants?limit=100'),
                fetch('tables/matches?limit=100')
            ]);
            
            const participantsData = await participantsResponse.json();
            const matchesData = await matchesResponse.json();
            
            const participants = participantsData.data;
            const matches = matchesData.data;
            
            const maleCount = participants.filter(p => p.gender === 'male').length;
            const femaleCount = participants.filter(p => p.gender === 'female').length;
            
            document.getElementById('maleCount').textContent = maleCount;
            document.getElementById('femaleCount').textContent = femaleCount;
            document.getElementById('matchCount').textContent = matches.length;
        } catch (error) {
            console.error('統計情報更新エラー:', error);
        }
    }
    
    // 成功メッセージ表示
    function showSuccess(message) {
        const successMsg = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        successText.textContent = message;
        successMsg.classList.add('show');
        setTimeout(() => {
            successMsg.classList.remove('show');
        }, 3000);
    }
    
    // エラーメッセージ表示
    function showError(message) {
        const errorMsg = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        errorText.textContent = message;
        errorMsg.classList.add('show');
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 4000);
    }
});