// 参加者登録フォーム処理（Supabase版）
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('participantForm');
    const receptionNumberInput = document.getElementById('receptionNumber');
    const firstChoiceInput = document.getElementById('firstChoice');
    const secondChoiceInput = document.getElementById('secondChoice');
    
    // 受付番号から性別を判定
    function getGenderFromNumber(number) {
        if (number >= 1 && number <= 20) {
            return 'male';
        } else if (number >= 21 && number <= 40) {
            return 'female';
        }
        return null;
    }
    
    // 受付番号の妥当性チェック
    function validateReceptionNumber() {
        const receptionNumber = parseInt(receptionNumberInput.value);
        
        if (receptionNumber && (receptionNumber < 1 || receptionNumber > 40)) {
            showError('受付番号は1〜40番の範囲で入力してください');
            return false;
        }
        
        return true;
    }
    
    // 希望番号のヒント表示を更新
    function updateChoiceHints() {
        const receptionNumber = parseInt(receptionNumberInput.value);
        const firstChoiceHint = document.getElementById('firstChoiceHint');
        const secondChoiceHint = document.getElementById('secondChoiceHint');
        
        if (!receptionNumber || receptionNumber < 1 || receptionNumber > 40) {
            firstChoiceHint.textContent = '';
            secondChoiceHint.textContent = '';
            return;
        }
        
        const gender = getGenderFromNumber(receptionNumber);
        
        if (gender === 'male') {
            firstChoiceHint.textContent = '※ 女性（21〜40番）を選択してください';
            secondChoiceHint.textContent = '※ 女性（21〜40番）を選択してください';
        } else if (gender === 'female') {
            firstChoiceHint.textContent = '※ 男性（1〜20番）を選択してください';
            secondChoiceHint.textContent = '※ 男性（1〜20番）を選択してください';
        }
    }
    
    // 希望番号の妥当性チェック
    function validateChoices() {
        const receptionNumber = parseInt(receptionNumberInput.value);
        const firstChoice = parseInt(firstChoiceInput.value);
        const secondChoice = parseInt(secondChoiceInput.value);
        
        // 自分自身を選択していないかチェック
        if (firstChoice === receptionNumber || secondChoice === receptionNumber) {
            showError('自分自身を希望に選択することはできません');
            return false;
        }
        
        // 第一希望と第二希望が同じでないかチェック
        if (firstChoice === secondChoice) {
            showError('第一希望と第二希望は異なる番号を選択してください');
            return false;
        }
        
        // 範囲チェック
        if (firstChoice < 1 || firstChoice > 40) {
            showError('第一希望は1〜40番の範囲で入力してください');
            return false;
        }
        if (secondChoice < 1 || secondChoice > 40) {
            showError('第二希望は1〜40番の範囲で入力してください');
            return false;
        }
        
        const gender = getGenderFromNumber(receptionNumber);
        
        // 性別に応じた範囲チェック
        if (gender === 'male') {
            if (firstChoice < 21 || firstChoice > 40) {
                showError('男性は女性（21〜40番）を選択してください');
                return false;
            }
            if (secondChoice < 21 || secondChoice > 40) {
                showError('男性は女性（21〜40番）を選択してください');
                return false;
            }
        } else if (gender === 'female') {
            if (firstChoice < 1 || firstChoice > 20) {
                showError('女性は男性（1〜20番）を選択してください');
                return false;
            }
            if (secondChoice < 1 || secondChoice > 20) {
                showError('女性は男性（1〜20番）を選択してください');
                return false;
            }
        }
        
        return true;
    }
    
    // イベントリスナー
    receptionNumberInput.addEventListener('blur', validateReceptionNumber);
    receptionNumberInput.addEventListener('input', updateChoiceHints);
    
    // フォーム送信
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!validateReceptionNumber() || !validateChoices()) {
            return;
        }
        
        const receptionNumber = parseInt(receptionNumberInput.value);
        const gender = getGenderFromNumber(receptionNumber);
        
        const formData = {
            name: document.getElementById('name').value || '',
            reception_number: receptionNumber,
            gender: gender,
            first_choice: parseInt(firstChoiceInput.value),
            second_choice: parseInt(secondChoiceInput.value)
        };
        
        try {
            // 既存の参加者チェック（Supabase）
            const { data: existingData, error: checkError } = await supabase
                .from('participants')
                .select('*')
                .eq('reception_number', formData.reception_number);
            
            if (checkError) {
                console.error('チェックエラー:', checkError);
                showError('データの確認中にエラーが発生しました');
                return;
            }
            
            if (existingData && existingData.length > 0) {
                showError(`受付番号${formData.reception_number}番は既に登録されています`);
                return;
            }
            
            // 参加者登録（Supabase）
            const { data, error } = await supabase
                .from('participants')
                .insert([formData])
                .select();
            
            if (error) {
                console.error('登録エラー:', error);
                showError('登録に失敗しました。もう一度お試しください。');
                return;
            }
            
            showSuccess('登録が完了しました！');
            form.reset();
            updateChoiceHints();
            
        } catch (error) {
            console.error('Error:', error);
            showError('通信エラーが発生しました。');
        }
    });
    
    // 成功メッセージ表示
    function showSuccess(message) {
        const successMsg = document.getElementById('successMessage');
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