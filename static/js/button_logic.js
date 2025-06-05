document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('login-button');
    if (button) {
        button.addEventListener('click', function() {
            window.location.href = '/accounts/login';
        });
    }

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