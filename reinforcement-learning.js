let N = 10;
let r = 20;
let learningRate = 0.75;
let discountRate = 0.75;
let maze = {};
let currentState = {x: 0, y: 0};
let goalState = {x: 450, y:450};
let actionsList = ['right', 'left', 'up', 'down'];
let qTable = [];
let wallStates = [];


function createPoints(){
    let point = [];
    for(let i=0; i<N; i++){
        for(let j=0; j<N; j++){
            point.push({x: i*50, y: j*50, value: 1});
        }
    }
    return point;
}

function mazeGenerator(){
    let points = createPoints();
    for(let i=0; i<points.length; i++){
        if(points[i].x === 0 && points[i].y === 0){
            points[i].value = 1;
            continue;
        }
        if(points[i].x === N-1 && points[i].y === N-1){
            points[i].value = 1;
            continue;
        }
        if(Math.random()< 0.01 * r){
            points[i].value = 0;
            wallStates.push(points[i]);
        }
    }
    maze = points;
}

function initializeQTable(){
    for(let i=0;i<maze.length;i++){
        if(maze[i].x === 0 && maze[i].y > 0 && maze[i].y< (N-1)*50 ){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: undefined, up: 0, down: 0});
            continue;
        }
        if(maze[i].y === 0 && maze[i].x > 0 && maze[i].x < (N-1)*50){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: 0, up: undefined, down: 0});
            continue;
        }
        if(maze[i].x === 0 && maze[i].y === 0){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: undefined, up: undefined, down: 0});
            continue;
        }
        if(maze[i].x === (N-1)*50 && maze[i].y > 0 && maze[i].y < (N-1)*50){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: undefined, left: 0, up: 0, down: 0});
            continue;
        }
        if(maze[i].y === (N-1)*50 && maze[i].x > 0 && maze[i].x < (N-1)*50){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: 0, up: 0, down: undefined});
            continue;
        }
        if(maze[i].x === (N-1)*50 && maze[i].y === 0){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: undefined, left: 0, up: undefined, down: 0});
            continue;
        }
        if(maze[i].y === (N-1)*50 && maze[i].x === 0){
            qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: undefined, up: 0, down: undefined});
            continue;
        }
        qTable.push({state: {x: maze[i].x, y: maze[i].y}, right: 0, left: 0, up: 0, down: 0})
    }
}

function findPossibleActions(){
    let index = qTable.findIndex(element => element.state.x === currentState.x && element.state.y === currentState.y);
    let qValues = qTable[index];
    let possibleActions = [];
    for(let action in qValues){
        if(action === 'state') continue;
        if(qValues[action] === undefined) continue;
        possibleActions.push(action);
    }
    return possibleActions
}

function randomAction(){
    let possibleActions = findPossibleActions();
    let randomIndex = Math.floor(Math.random()* possibleActions.length);
    return possibleActions[randomIndex];
}

function bestAction(){
    let x = currentState.x;
    let y = currentState.y;
    let index = qTable.findIndex(element => element.state.x === x && element.state.y === y);
    let qValues = qTable[index];
    let possibleActions = findPossibleActions();
    let actionName = null;
    //console.log(possibleActions)
    for(let action of possibleActions){
        if(!actionName){
            actionName = action;
            //console.log("1 " + qValues[action])
        }else if((qValues[action] === qValues[actionName]) && (Math.random() > 0.5)){
            actionName = action;
            //console.log("2 " + qValues[action])
        }else if(qValues[action] > qValues[actionName]){
            //console.log("3 "+ qValues[action])
            actionName = action;
        }
    }
    return actionName;
}

function getQValue(state, currentAction){
    let index = qTable.findIndex(element => element.state.x === state.x && element.state.y === state.y);
    return qTable[index][currentAction];
}

function getQValueX(state, action){
    let index = qTable.findIndex(element => element.state.x === state.x && element.state.y === state.y);
    return qTable[index][action];
}

function setQValue(state,currentAction, reward){
    let x = state.x;
    let y = state.y;
    let index = qTable.findIndex(element => element.state.x === x && element.state.y === y);
    let maxQValue = findMaxQValue(currentState);
    let oldQValue = getQValue(state, currentAction);
    let newQValue = (1- learningRate) * oldQValue + learningRate * (reward + discountRate * maxQValue);
    if(qTable[index] === undefined) return;
    if(currentAction === "right") qTable[index] = {state: {x: x, y: y}, right: qTable[index].right + newQValue, left: qTable[index].left, up: qTable[index].up, down: qTable[index].down }
    if(currentAction === "left") qTable[index] = {state: {x: x, y: y}, right: qTable[index].right, left: qTable[index].left + newQValue, up: qTable[index].up, down: qTable[index].down }
    if(currentAction === "up") qTable[index] = {state: {x: x, y: y}, right: qTable[index].right, left: qTable[index].left , up: qTable[index].up + newQValue, down: qTable[index].down }
    if(currentAction === "down") qTable[index] = {state: {x: x, y: y}, right: qTable[index].right, left: qTable[index].left, up: qTable[index].up, down: qTable[index].down + newQValue }
}

function findMaxQValue(state){
    let qValues = [];
    let index = qTable.findIndex(element => element.state.x === state.x && element.state.y === state.y);
    qValues = qTable[index];
    let max = 0;
    let myvalues = [];
    for(let action in qValues){
        if(action === 'state') continue;
        else if(qValues[action] === undefined) continue;
        else myvalues.push(qValues[action]);
    }
    console.log(Math.max(...myvalues))
    return Math.max(...myvalues);
}

function moveState(){

    let actionName = bestAction();
    let tempState = {x: 0 , y: 0}
    if(actionName === 'right') tempState.x = tempState.x + 50
    if(actionName === 'left') tempState.x = tempState.x - 50
    if(actionName === 'up') tempState.y = tempState.y - 50
    if(actionName === 'down') tempState.y = tempState.y + 50
    return {action: tempState, actionName: actionName};
}


function main(){
    mazeGenerator(10,20);
    initializeQTable();
}
