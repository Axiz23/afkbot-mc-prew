const socket = io();

function sendCommand() {
    const command = document.getElementById("commandInput").value;
    socket.emit("command", command);
}

function moveBot() {
    const x = parseInt(document.getElementById("x").value);
    const y = parseInt(document.getElementById("y").value);
    const z = parseInt(document.getElementById("z").value);
    socket.emit("moveTo", { x, y, z });
}