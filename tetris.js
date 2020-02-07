let ultimoTiempo = 0;
let caidaPieazas = 1000;
let dropCounter = 0;
let pausa = false;

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
    switch(tipo){
        case 'T':
            return [
                [0,0,0],
                [1,1,1],
                [0,1,0]
            ];
        ;
        break;
    case 'O':
            return [
                [2,2],
                [2,2],
            ];
            break;
    case 'L':
        return [
            [0,3,0],
            [0,3,0],
            [0,3,3]
        ]
        break;
    case 'J':
            return [
                [0,4,0],
                [0,4,0],
                [4,4,0]
            ];
            break;
    case 'I':
        return [
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0],
            [0,5,0,0]
        ]
        break;
    case 'S':
        return [
            [0,6,6],
            [6,6,0],
            [0,0,0]
        ];
        break;
        case 'Z':
            return [
                [7,7,0],
                [0,7,7],
                [0,0,0]
            ];
            break;
    }
}
function crearMatriz(width, height){
    const matriz = []
    while(height--){
        matriz.push(new Array(width). fill(0));
    }
    return matriz
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

function dibujarProximaPieza(pieza, offset){
    contextProxima.fillStyle = '#000'
    contextProxima.fillRect(0,0, proximaPieza.width, proximaPieza.height);

    pieza.forEach((row, y) => {
        row.forEach((value, x)=>{
            if(value !== 0){
                contextProxima.fillStyle = colores[value]
                contextProxima.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        })
    })

}

function dibujarCanvas(){
    context.fillStyle = '#000';
    context.strokeStyle = 'black';
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
    if(pausa) return;
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
    dropInterval = 1000 - (jugador.nivel*100);
    if(jugador.proxima===null){
        jugador.pieza = crearPieza(piezas[piezas.length * Math.random()| 0])
    } else {
        jugador.pieza = jugador.proxima;
    }
    jugador.proxima = crearPieza(piezas[piezas.length * Math.random()| 0])
    jugador.posicion.x=(grilla[0].length / 2 | 0) - (jugador.pieza[0].length /2 | 0);
    jugador.posicion.y=0;
    if(colision(grilla, jugador)){
        //Derrota
        gameOver()
        grilla.forEach(row=> row.fill(0));
        jugador.puntaje = 0;
        jugador.nivel = 0;
        jugador.lineas = 0;
        actualizarPuntaje()
    }
}

function pausar(pauser){
    pausa = pauser;
    if(pausa){
        document.getElementById('background_tetris').style.display='block'
        document.getElementById('UI-Pausa').style.display='block'
    } else {
        document.getElementById('background_tetris').style.display='none'
        document.getElementById('UI-Pausa').style.display='none'
        actualizar()
    }
}

function gameOver(){
    var r = parseInt((Math.random() * (4 - 1 + 1) + 1).toFixed(0));
    var i = r;

    switch(i) {
        case 0:
            alert('Suerte la proxima');
            break;

        case 1:
            alert('MALARDO');
            break;

        case 2:
            alert('Gg');
            break;

        case 3:
            alert('No era por aca');
            break;

    case 4:
        alert('Bien jugado')
        break

        case 5:
            alert('Mmm vos decis?')
            break

            case 6:
                alert('No me culpes, solo soy un juego')
                break

                case 7:
                    alert('En otra vida sera')
                    break
    }
}

function iniciarJuego(){
    document.getElementById('background_tetris').style.display = 'block';
    document.getElementById('body').style.display = 'none';
    document.getElementById('UI-Menu').style.display = 'block';
    pausa = false;
    actualizarPuntaje()
    reiniciarPieza()
    actualizar()
}

function terminarJuego(){
    document.getElementById('body').style.display = 'none';
    document.getElementById('UI-Menu').style.display = 'block';
    document.getElementById('UI-Pausa').style.display = 'none';
    document.getElementById('background_tetris').style.display = 'block';
}

function actualizarPuntaje(){
    document.getElementById('background_tetris').style.display = 'none';
    document.getElementById('UI-Menu').style.display = 'none'
    document.getElementById('body').style.display = 'flex'
    document.getElementById('puntaje').innerHTML = jugador.puntaje;
    document.getElementById('nivel').innerHTML = jugador.nivel;
    document.getElementById('lineas').innerHTML = jugador.lineas;
}

document.addEventListener('keydown', event => {
    switch(event.keyCode){
        case 40:
            descenderPieza();
            break;
        case 37:
            lateralesPieza(-1);
            break;
            case 39:
                lateralesPieza(1);
                break;
                case 32:
                    rotarPieza()
                    break;
                case 27:
                    closeFullscreen()
                    break;
    }
})

/* View in fullscreen */

var elem = document.documentElement;

function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
    document.getElementById('tetris').style.marginLeft = '130%'
    document.getElementById('pausa').style.left = '333%'
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
    document.getElementById('tetris').style.marginLeft = '130%'
    document.getElementById('pausa').style.left = '333%'
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
    document.getElementById('tetris').style.marginLeft = '130%'
    document.getElementById('pausa').style.left = '333%'
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
    document.getElementById('tetris').style.marginLeft = '130%'
    document.getElementById('pausa').style.left = '333%'
  }
}

/* Close fullscreen */
function closeFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
    document.getElementById('tetris').style.marginLeft = '145%'
    document.getElementById('pausa').style.left = '354.6%'
  } else if (document.mozCancelFullScreen) { /* Firefox */
    document.mozCancelFullScreen();
    document.getElementById('tetris').style.marginLeft = '145%'
    document.getElementById('pausa').style.left = '354.6%'
  } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
    document.webkitExitFullscreen();
    document.getElementById('tetris').style.marginLeft = '145%'
    document.getElementById('pausa').style.left = '354.6%'
  } else if (document.msExitFullscreen) { /* IE/Edge */
    document.msExitFullscreen();
    document.getElementById('tetris').style.marginLeft = '145%'
    document.getElementById('pausa').style.left = '354.6%'
  }
}