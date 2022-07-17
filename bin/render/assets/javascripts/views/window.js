
let chr = { timeout: 10, active: false};
doc.querySelector('[action="window-close"]').addEventListener('click', () => {
    if(Object.keys(connections).length > 0) {
        if(Object.keys(connections).length === 1) doc.querySelector('#win-close-p').innerHTML = "<span>une session</span> est toujours en cours";
        else doc.querySelector('#win-close-p').innerHTML = "<span>"+Object.keys(connections).length+" sessions</span> sont toujours en cours";

        doc.querySelector('.win-close').classList.remove('hide');
        chr.active = true;
        chr.timeout = 10;
        chrono();
    } else {
        winAction('close', true);
    }

})
const chrono = async() => {
    if(chr.active) {
        if(chr.timeout > 0) {
            chr.timeout-=1;
            doc.querySelector('#win-close-cancel').innerHTML = `Annuler <timer>${chr.timeout}s</timer>`;
            setTimeout(() => chrono(), 1000);
        } else {
            closeCancel()
        }

    }

}
doc.querySelector('#win-close-cancel').addEventListener('click', () => closeCancel());
doc.querySelector('#win-close-confirm').addEventListener('click', () => winAction('close', true));

const closeCancel = () => {
    doc.querySelector('.win-close').classList.add('hide');
    chr = {timeout: 5, active: false}
}



doc.querySelector('[action="window-reduce"]').addEventListener('click', () => {
    winAction('reduce', true);
})

const winAction = (type, force = false) => {
    sendData('window', type);
}