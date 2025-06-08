document.addEventListener('DOMContentLoaded', function() {
    
    
    // 비밀번호 실시간 일치 검사
    const password = document.querySelector('input[name="password"]');
    const confirm_password = document.querySelector('input[name="confirm-password"]');

    function checkPasswordMatch() {
        // 기존 경고 메시지 제거
        let msgDiv = confirm_password.parentNode.querySelector('.input-warning');
        if (msgDiv) msgDiv.remove();

        if (confirm_password.value && password.value !== confirm_password.value) {
            const warning = document.createElement('div');
            warning.className = 'input-warning';
            warning.style.color = 'rgb(233, 9, 9)';
            warning.style.fontSize = '0.8em';
            warning.textContent = '비밀번호가 일치하지 않습니다.';
            confirm_password.parentNode.appendChild(warning);
        }
    }

    password.addEventListener('input', checkPasswordMatch);
    confirm_password.addEventListener('input', checkPasswordMatch); 
        
        // 필수 체크박스 검증 및 경고 메시지 표시
        const signupForm = document.querySelector('form');
        signupForm.addEventListener('submit', function(e) {
            // 필수 체크박스들
            let valid = true;

            // 1. 필수 입력값 검증
        const requiredInputs = [
            { el: document.querySelector('input[name="userid"]'), msg: '아이디를 입력하세요.' },
            { el: document.querySelector('input[name="username"]'), msg: '이름을 입력하세요.' },
            { el: document.querySelector('input[name="password"]'), msg: '비밀번호를 입력하세요.' },
            { el: document.querySelector('input[name="userbirth-year"]'), msg: '생년을 입력하세요.' },
            { el: document.querySelector('input[name="userbirth-month"]'), msg: '생월을 입력하세요.' },
            { el: document.querySelector('input[name="userbirth-day"]'), msg: '생일을 입력하세요.' },
            { el: document.querySelector('input[name="phone"]'), msg: '휴대전화 번호를 입력하세요.' },
        ];

        requiredInputs.forEach(function(item) {
            // 기존 경고 메시지 제거
            let msgDiv = item.el.parentNode.querySelector('.input-warning');
            if (msgDiv) msgDiv.remove();

            if (!item.el.value.trim()) {
                valid = false;
                const warning = document.createElement('div');
                warning.className = 'input-warning';
                warning.style.color = 'rgb(233, 9, 9)';
                warning.style.fontSize = '0.8em';
                warning.textContent = item.msg;
                item.el.parentNode.appendChild(warning);
            }
        });

            

        // 약관 동의 체크박스 로직
    const masterCheckbox = document.getElementById("terms-checkbox");
    const dependentCheckboxes = [
        document.getElementById("privacy-checkbox-1"),
        document.getElementById("privacy-checkbox-2"),
        document.getElementById("privacy-checkbox-3"),
        document.getElementById("privacy-checkbox-4"), 
    ];

    
        masterCheckbox.addEventListener("change", function() {
            dependentCheckboxes.forEach(function(checkbox) {
                checkbox.checked = masterCheckbox.checked;
            });
        });
        
        const requiredCheckboxes = [
            document.getElementById("privacy-checkbox-1"),
            document.getElementById("privacy-checkbox-2"),
            document.getElementById("privacy-checkbox-3"),
        ];

        requiredCheckboxes.forEach(function(checkbox, idx) {
            // 기존 경고 메시지 제거
            let msg = checkbox.parentNode.querySelector('.checkbox-warning');
            if (msg) msg.remove();

            if (!checkbox.checked) {
                valid = false;
                // 경고 메시지 생성
                const warning = document.createElement('div');
                warning.className = 'checkbox-warning';
                warning.style.color = 'rgb(233, 9, 9)';
                warning.style.fontSize = '0.8em';
                warning.textContent = '필수 약관에 동의해야 합니다.';
                checkbox.parentNode.appendChild(warning);
            }
        });

        if (!valid) {
            e.preventDefault(); // 폼 제출 막기
        }
        });
});

function openModal(url) {
    const modal = document.getElementById("modal");
    const modalContent = document.querySelector(".modal-content");

    // 약관 내용을 AJAX로 불러오기
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.text();
        })
        .then(data => {
            modalContent.innerHTML = data + '<button class="close-button" onclick="closeModal()">닫기</button>';
            modal.style.display = "flex"; // 모달 창 표시
        })
        .catch(error => {
            console.error("Error fetching modal content:", error);
        });
}

function closeModal() {
    const modal = document.getElementById("modal");
    modal.style.display = "none"; // 모달 창 숨김
}