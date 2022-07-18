console.log('views/menu.js loaded');

const menu = {
    open: () => {
        doc.querySelector('.main').classList.add('open-menu')
    },
    close: () => {
        doc.querySelector('.main').classList.remove('open-menu');
    },
    displayConnection: (uuid) => {
        console.log(uuid);
        doc.querySelectorAll('.connections .conn-id').forEach((e) => e.classList.add('hide'));
        doc.querySelector('.home').classList.add('hide');
        doc.querySelector('.connections').classList.remove('hide');
        doc.querySelector('.connections #conn-'+uuid).classList.remove('hide');
    },
    home: () => {
        doc.querySelector('.home').classList.remove('hide');
        doc.querySelector('.connections').classList.add('hide');
    }
}

doc.querySelector('[action="menu-close"]').addEventListener('click', () => menu.close());
doc.querySelector('[action="onglet-home"]').addEventListener('click', () => menu.home());