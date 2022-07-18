console.log('views/menu.js loaded');

const menu = {
    open: () => {
        doc.querySelector('.main').classList.add('open-menu')
    },
    close: () => {
        doc.querySelector('.main').classList.remove('open-menu');
    },
    switchConnection: () => {

    },
    home: () => {
        doc.querySelector('.home').classList.remove('hide');
        doc.querySelector('.connections').classList.add('hide');
    }
}

doc.querySelector('[action="menu-close"]').addEventListener('click', () => menu.close());
doc.querySelector('[action="switchConnection-home"]').addEventListener('click', () => menu.home());