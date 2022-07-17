console.log('modules/hosting.js loaded');

doc.querySelector('.hosts').addEventListener("click", event => {
    const element = event.target.closest('.item');
    if(!element) return;

})
doc.querySelector('.hosts').addEventListener("dblclick", event => {
    const element = event.target.closest('.item');
    if(!element) return;
    const uuid = element.getAttribute('host');
    doc.querySelector('.loader stop').style.display = "inline-flex";
    doc.querySelector('.loader').style.display = "flex";
    doc.querySelector('#loader-status').innerText = `Connexion à ${hosts[uuid].host}...`
})

doc.querySelector('[action="connect-cancel"]').addEventListener('click', async () => {
    doc.querySelector('#loader-status').innerText = `Tentative d'annulation...`;
    doc.querySelector('.loader').style.display = "none";
    doc.querySelector('.loader stop').style.display = "none";
})
