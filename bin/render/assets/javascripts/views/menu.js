console.log('views/hosts.js loaded');

const menu = {
    open: () => doc.querySelector('.main').classList.add('open-menu'),
    close: () => doc.querySelector('.main').classList.remove('open-menu')
}