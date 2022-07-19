console.log('views/window.js loaded');

let chr = {timeout: 10, active: false};
doc.querySelector('[action="window-close"]').addEventListener('click', () => {
    if (Object.keys(connections).length === 0) return winAction('close', true);

    let text = "<span>une session</span> est toujours en cours";
    if (Object.keys(connections).length > 1) text = "<span>" + Object.keys(connections).length + " sessions</span> sont toujours en cours";

    doc.querySelector('#win-close-p').innerHTML = text;
    doc.querySelector('.win-close').classList.remove('hide');

    chr = {active: true, timeout: 10};
    chrono();
})

const chrono = async () => {
    if (!chr.active) return;
    if (chr.timeout === 0) return closeCancel();
    chr.timeout -= 1;
    doc.querySelector('#win-close-cancel').innerHTML = `Annuler <timer>${chr.timeout}s</timer>`;
    setTimeout(() => chrono(), 1000);
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
    sendData('window', {type: 'application', action: type});
}