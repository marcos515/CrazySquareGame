var socket = io();
var table = document.getElementById("tabela");
var tableSize = {
    height: 10,
    width: 10
}
table.appendChild(criarTabela(tableSize.height, tableSize.width));

var messages = document.getElementById('messages');


socket.on('tableSize', function (msg) {
    tableSize = msg;
});


socket.on('analytics', function (msg) {
    console.log(msg)
    document.getElementById("ranking").innerHTML = '';
    document.getElementById("ranking").appendChild(createRankingList(msg.things));
    document.getElementById("title").innerHTML = `${msg.connectionsCount}  monitors open.</br>${getUsersSize(new Map(Object.entries(msg.things)))} Usuarios conectados.`;
});

socket.on('moveUpdate', function (msg) {
    let things = new Map(Object.entries(msg));
    table.innerHTML = '';
    table.appendChild(criarTabela(tableSize.height, tableSize.width));
    things.forEach((value, key, map) => {
        let id = `${value.coordinate.height}:${value.coordinate.width}`
        let target = document.getElementById(id);
        if(key.startsWith("fruit_")){
            target.name = "fruit";
        } else {
            target.innerHTML = value.username[0];
            target.name = key;
        }
        target.style.backgroundColor = value.color;
    });
});


function criarTabela(height, width) {
    var table = document.createElement("table");
    for (let h = 0; h < height; h++) {
        var row = document.createElement("tr")
        for (let w = 0; w < width; w++) {
            var coordinate = document.createElement("td");
            coordinate.id = `${h}:${w}`;
            row.appendChild(coordinate);
        }
        table.appendChild(row);
    }
    return table;
}

function createRankingList(things) {
    let ol = document.createElement("ol");
    let u = new Map(Object.entries(things));
    u.forEach((value, key, map) => {
        if (!key.startsWith("fruit_")) {
            let li = document.createElement("li");
            li.innerHTML = `${value.username} - ${value.score} points.`;
            ol.appendChild(li);
        }
    });
    return ol;
}

function getUsersSize(things){
    let size = 0;
    things.forEach((value, key, map)=>{
        if(!key.startsWith('fruit_')){
            size++;
        }
    });
    return size;
}