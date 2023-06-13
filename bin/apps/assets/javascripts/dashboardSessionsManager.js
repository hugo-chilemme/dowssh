document.querySelector('section[page-name="dashboard"]').addEventListener("onshow", (event) => {
    if (event.detail && event.detail.error) {
        document.querySelector('.dashboard .error').classList.remove('hide');
        document.querySelector('.dashboard .error p').innerText = event.detail.error;
    }
});
