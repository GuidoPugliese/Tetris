let ultimoTiempo = 0;
let caidaPieazas = 1000;
let dropCounter = 0;

const canvas = document.getElementById('tetris');
const proximaPieza = document.getElementById('proximaPieza')
const context = canvas.getContext('2d');
const contextProxima = proximaPieza.getContext('2d');
const grilla = crearMatriz(10,20);
const colores = [
        null,
        'violet',
        'orange',
        'pink',
        'green',
        'red',
        'blue',
        'yellow'
]
const jugador = {
    posicion: {x:0 , y:0},
    pieza: null,
    proxima: null,
    puntaje:0,
    nivel:0,
    lineas:0
};

context.scale(20, 20);
contextProxima.scale(19, 19);

function crearPieza(tipo){
    if(tipo ==='T'){
        return [
            [0,0,0],
            [1,1,1],
            [0,1,0]
        ];
    } else if(tipo === 'O'){
        return [
            [2,2],
            [2,2],
        ]
    } else if (tipo === 'L'){
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3]
        ]
    } else if (tipo === 'J'){
        return [
            [0,4,0],
            [0,4,0],
            [4,4,0]
        ]
    } else if (tipo === 'I'){
        return [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0]
        ]
    } else if (tipo === 'S'){
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0]
        ]
    } else if (tipo === 'Z'){
    return [
        [7,7,0],
        [0,7,7],
        [0,0,0]
    ]
}
}

function crearMatriz(width, height){
    const matriz = []
    while(height--){
        matriz.push(new Array(width). fill(0));
    }
    return matriz
}

function dibujarPieza(pieza, offset){
    pieza.forEach((row, y) => {
        row.forEach((value, x)=>{
            if(value !== 0){
                context.fillStyle = colores[value]
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    })
}

function colision(grilla, jugador){
    const pieza = jugador.pieza;
    const offset = jugador.posicion;

    for(var y = 0; y < pieza.length; y++){
        for(var x=0; x < pieza[y].length; x++){
            if(pieza[y][x]!==0 && (grilla[y + offset.y] && grilla[y + offset.y][x + offset.x]) !== 0){
                return true
            }
        }
    }
    return false
}

function merge(grilla, jugador){
    jugador.pieza.forEach((row, y) =>{
        row.forEach((value, x) =>{
            if(value !== 0){
                grilla[y + jugador.posicion.y][x + jugador.posicion.x] = value;
            }
        })
    })
}

function dibujarProximaPieza(pieza, offset){
    contextProxima.fillStyle = '#000'
    contextProxima.fillRect(0,0, proximaPieza.width, proximaPieza.height);
}

function dibujarCanvas(){
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    dibujarPieza(grilla, { x:0 , y:0 })
    dibujarPieza(jugador.pieza, jugador.posicion);
    dibujarProximaPieza(jugador.proxima, {x:1,y:1}  );
}

function barrerGrilla(){
    let rowCounter = 1;
    outer: for(let y = grilla.length -1; y>0;--y){
        for(let x = 0; x < grilla[y].length; ++x){
            if(grilla[y][x]=== 0){
            continue outer;
            }
        }
        const row = grilla.splice(y,1) [0].fill(0)
        grilla.unshift(row);
        ++y

        jugador.puntaje += rowCounter *10;
        jugador.lineas++;
        rowCounter *= 2
        if(jugador.lineas%3===0){
            jugador.nivel++
        }
    }
}


function actualizar(tiempo = 0) {
    const deltaTime = tiempo - ultimoTiempo;
    ultimoTiempo = tiempo;
    dropCounter += deltaTime;
    if(dropCounter > caidaPieazas){
        descenderPieza()
    }
    dibujarCanvas()
    requestAnimationFrame(actualizar)
}

function descenderPieza(){
    jugador.posicion.y++;
    if(colision(grilla, jugador)){
        jugador.posicion.y--;
        merge(grilla, jugador);
        reiniciarPieza();
        barrerGrilla();
        actualizarPuntaje();
    }
    dropCounter = 0;
}

function lateralesPieza(direccion){
    jugador.posicion.x += direccion;
    if(colision(grilla, jugador)){
        jugador.posicion.x -= direccion;
    }
}

function rotarPieza(){
    const posicion = jugador.posicion.x;
    let offset = 1;
    rotacion(jugador.pieza);
    while(colision(grilla, jugador)) {
        jugador.posicion.x += offset;
        offset = - (offset + (offset>0 ? 1: -1));
        if(offset > jugador.pieza[0].length){
            rotacion(jugador.pieza);
            jugador.posicion.x = posicion;
            return
        }
    }
}

function rotacion(pieza){
    for(let y=0; y<pieza.length; ++y){
        for(let x=0; x<y; ++x){
            [pieza[x][y], pieza [y][x]]   =
            [pieza[y][x], pieza [x][y]];
        }
    }

    pieza.forEach(row => row.reverse());
}

function reiniciarPieza(){
    const piezas = 'ILJOTSZ';
    dropInterval = 1000 - (jugador.nivel*100)
    jugador.pieza = crearPieza(piezas[piezas.length * Math.random()| 0])
    jugador.posicion.x=(grilla[0].length / 2 | 0) - (jugador.pieza[0].length /2 | 0);
    jugador.posicion.y=0;
}

function actualizarPuntaje(){
    document.getElementById('puntaje').innerHTML = jugador.puntaje;
    document.getElementById('nivel').innerHTML = jugador.nivel;
    document.getElementById('lineas').innerHTML = jugador.lineas;
}

document.addEventListener('keydown', event => {
    if(event.keyCode===40){
        descenderPieza();
    } else if(event.keyCode===37){
        lateralesPieza(-1)
    } else if(event.keyCode===39){
        lateralesPieza(1)
    }else if(event.keyCode===32){
        rotarPieza()
    }
});

actualizarPuntaje()
reiniciarPieza()
actualizar()