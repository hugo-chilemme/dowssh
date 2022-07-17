console.log('modules/notification.js loaded');

const element = doc.querySelector('.notification');

const notification = {
    success: (message) => {
        element.classList.remove('error');
        notification.display(message);
    },
    error: (message) => {
        element.classList.add('error')
        notification.display(message);
    },
    display: (message) => {
        element.innerText = message;
        element.classList.add('show');
        setTimeout(async () => element.classList.remove('show'), 3000);
    }
}
