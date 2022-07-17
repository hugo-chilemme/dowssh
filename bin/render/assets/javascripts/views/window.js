
let chr = { timeout: 10, active: false};
doc.querySelector('[action="window-close"]').addEventListener('click', () => {
    if(Object.keys(connections).length > 0) {
        if(Object.keys(connections).length === 1) doc.querySelector('#win-close-count').innerText = "1 session";
        else doc.querySelector('#win-close-count').innerText = Object.keys(connections).length+" sessions";

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
            doc.querySelector('#win-close-cancel').innerText = `Annuler (${chr.timeout}s)`;
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