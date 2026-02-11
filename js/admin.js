// 管理者画面JavaScript（Supabase版）
document.addEventListener('DOMContentLoaded', function () {

    const loginScreen = document.getElementById('loginScreen');
    const adminScreen = document.getElementById('adminScreen');
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');

    const ADMIN_PASSWORD = 'admin123';

    // ログイン状態チェック
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminScreen();
    }

    loginForm.addEventListener('submit', function (e) {
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

    document.getElementById('logoutBtn').addEventListener('click', function () {
        sessionStorage.removeItem('adminLoggedIn');
        adminScreen.style.display = 'none';
        loginScreen.style.display = 'block';
    });

    document.getElementById('resetBtn').addEventListener('click', async function () {

        if (!confirm('本当に全データをリセットしますか？')) return;

        this.disabled = true;
        this.innerHTML = '削除中...';

        try {

            await supabase.from('matches').delete().neq('id', 0);
            await supabase.from('participants').delete().neq('id', 0);

            showSuccess('全データを削除しました');
            await loadData();

        } catch (error) {
            showError('削除失敗');
            console.error(error);
        } finally {
            this.disabled = false;
            this.innerHTML = '全データリセット';
        }
    });

    async function showAdminScreen() {
        loginScreen.style.display = 'none';
        adminScreen.style.display = 'block';
        await loadData();
    }

    async function loadData() {
        await Promise.all([
            loadParticipants(),
            loadMatches(),
            updateStats()
        ]);
    }

    async function loadParticipants() {

        const { data, error } = await supabase
            .from('participants')
            .select('*')
            .order('reception_number', { ascending: true });

        const tbody = document.getElementById('participantsBody');

        if (error || !data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">参加者データがありません</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data.map(p => `
            <tr>
                <td>${p.reception_number}</td>
                <td>${p.name || '-'}</td>
                <td>${p.gender === 'male' ? '男性' : '女性'}</td>
                <td>${p.first_choice}</td>
                <td>${p.second_choice}</td>
            </tr>
        `).join('');
    }

    async function loadMatches() {

        const { data: matches } = await supabase
            .from('matches')
            .select('*')
            .order('match_priority', { ascending: true });

        const { data: participants } = await supabase
            .from('participants')
            .select('*');

        const tbody = document.getElementById('matchesBody');

        if (!matches || matches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">マッチングがありません</td>
                </tr>
            `;
            return;
        }

        const map = {};
        participants.forEach(p => {
            map[p.reception_number] = p;
        });

        tbody.innerHTML = matches.map(m => `
            <tr>
                <td>${m.participant1_number}</td>
                <td>${map[m.participant1_number]?.name || '-'}</td>
                <td>❤</td>
                <td>${m.participant2_number}</td>
                <td>${map[m.participant2_number]?.name || '-'}</td>
                <td>${m.match_type}</td>
            </tr>
        `).join('');
    }

    async function updateStats() {

        const { data: participants } = await supabase
            .from('participants')
            .select('*');

        const { data: matches } = await supabase
            .from('matches')
            .select('*');

        const male = participants.filter(p => p.gender === 'male').length;
        const female = participants.filter(p => p.gender === 'female').length;

        document.getElementById('maleCount').textContent = male;
        document.getElementById('femaleCount').textContent = female;
        document.getElementById('matchCount').textContent = matches.length;
    }

    function showSuccess(msg) {
        const el = document.getElementById('successMessage');
        const text = document.getElementById('successText');
        text.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    function showError(msg) {
        const el = document.getElementById('errorMessage');
        const text = document.getElementById('errorText');
        text.textContent = msg;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 4000);
    }

});
