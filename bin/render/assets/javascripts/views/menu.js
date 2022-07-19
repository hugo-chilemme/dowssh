console.log('views/menu.js loaded');

const menu = {
    open: () => {
        doc.querySelector('.main').classList.add('open-menu')
        doc.querySelector('.main .menu').style.left = "0";
    },
    close: () => {
        doc.querySelector('.main').classList.remove('open-menu');
        doc.querySelector('.main .menu').style.left = "-450px";
    },
    displayConnection: (uuid) => {
        console.log(uuid);
        doc.querySelectorAll('.connections .conn-id').forEach((e) => e.classList.add('hide'));
        doc.querySelectorAll('#onglets .item').forEach((e) => e.classList.remove('active'));
        doc.querySelector('.home').classList.add('hide');
        doc.querySelector('.main .menu').style.left = "-460px";
        doc.querySelector('.connections').classList.remove('hide');
        doc.querySelector('.connections').setAttribute('active', uuid);
        doc.querySelector('.connections #conn-'+uuid).classList.remove('hide');
        doc.querySelector('#tab-'+uuid).classList.add('active');
        doc.querySelector('#onglet-disconnect').classList.remove('hide');
    },
    home: () => {
        doc.querySelector('.main').classList.remove('open-menu');
        doc.querySelector('.main .menu').style.left = "-450px";
        doc.querySelectorAll('#onglets .item').forEach((e) => e.classList.remove('active'));
        doc.querySelector('.connections').setAttribute('active', "default");
        doc.querySelector('.home').classList.remove('hide');
        doc.querySelector('#onglet-disconnect').classList.add('hide');
        doc.querySelector('.connections').classList.add('hide');
    }
}

doc.querySelector('[action="menu-close"]').addEventListener('click', () => menu.close());
doc.querySelector('[action="onglet-home"]').addEventListener('click', () => menu.home());