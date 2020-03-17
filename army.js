const CIVILIZATIONS = ["chinese", "english", "byzantine"];
const UNITS = ["pikemen", "archers", "knights"];
const INITIAL_DATA = {};
const WINNERS_REWARD = 100;
const UNITS_TO_LOSE = 2;
const UNITS_TO_LOSE_TIE = 1;

INITIAL_DATA[UNITS[0]] = {
  quantity: {},
  trainingCost: 10,
  trainingPoints: 3,
  transformationLimit: 30,
  strength: 5
};

// Se configura la cantidad de piqueros por civilización
INITIAL_DATA[UNITS[0]].quantity[CIVILIZATIONS[0]] = 2;
INITIAL_DATA[UNITS[0]].quantity[CIVILIZATIONS[1]] = 10;
INITIAL_DATA[UNITS[0]].quantity[CIVILIZATIONS[2]] = 5;

INITIAL_DATA[UNITS[1]] = {
  quantity: {},
  trainingCost: 20,
  trainingPoints: 7,
  transformationLimit: 40,
  strength: 10
};

// Se configura la cantidad de arqueros por civilización
INITIAL_DATA[UNITS[1]].quantity[CIVILIZATIONS[0]] = 25;
INITIAL_DATA[UNITS[1]].quantity[CIVILIZATIONS[1]] = 10;
INITIAL_DATA[UNITS[1]].quantity[CIVILIZATIONS[2]] = 8;

INITIAL_DATA[UNITS[2]] = {
  quantity: {},
  trainingCost: 30,
  trainingPoints: 10,
  transformationLimit: -1,
  strength: 20
};

// Se configura la cantidad de caballeros por civilización
INITIAL_DATA[UNITS[2]].quantity[CIVILIZATIONS[0]] = 2;
INITIAL_DATA[UNITS[2]].quantity[CIVILIZATIONS[1]] = 10;
INITIAL_DATA[UNITS[2]].quantity[CIVILIZATIONS[2]] = 15;

class Civilization {
  constructor(name) {
    this.name = name;
    this.armys = [];
    this.createArmy();
  }

  /**
   * @desc Se agrega el ejercito a la civilización
   */
  createArmy() {
    let army = {
      record: 0,
      coins: 1000,
      units: {}
    };

    // Se agregan al ajercito la cantidad de unidades por civilización
    UNITS.forEach(unit => {
      army.units[unit] = {
        quantity: INITIAL_DATA[unit].quantity[this.name],
        strength: INITIAL_DATA[unit].strength
      };
    });
    this.armys.push(army);
  }

  /**
   * @desc Entrena al ejecito
   * @param {Number} army // Posicion del ejercito en el array ej: 0
   * @param {String} unit // La unit a entrenar ej: piqueros
   */
  trainArmy(army, unit) {
    // Se valida que el ejercito tenga las monedas necesarias para el entrenamiento
    if (this.armys[army].coins < INITIAL_DATA[unit].trainingCost) {
      console.log(
        `Se necesitan ${INITIAL_DATA[unit].trainingCost} monedas para entrenar a los ${unit}`
      );
      return;
    }

    // Se cobran las monedas del entrenamiento
    this.armys[army].coins -= INITIAL_DATA[unit].trainingCost;
    this.armys[army].units[unit].strength +=
      INITIAL_DATA[unit].trainingPoints;

    // Comparar el limite de transformacion con la fuerza de la unidad
    if (
      this.armys[army].units[unit].strength >=
      INITIAL_DATA[unit].transformationLimit
    ) {
      const nextUnit = UNITS[UNITS.indexOf(unit) + 1];
      this.armys[army].units[nextUnit].quantity += this.armys[army].units[
        unit
      ].quantity;
      this.armys[army].units[unit].quantity = 0;
      this.armys[army].units[unit].strength = 0;
    }
  }
}

class Battle {

  /**
   * @desc Inicia la batalla
   * @param {Object} civilization1
   * @param {Number} army1 // posicion del ejercito en el array ej: 0
   * @param {Object} civilization2
   * @param {Number} army1 // posicion del ejercito en el array ej: 1
   * @return void
   */
  startBattle(civilization1, army1, civilization2, army2) {
    civilization1.armys[army1].record++;
    civilization2.armys[army2].record++;
    const winner = this.getWinningArmy(
      civilization1.armys[army1],
      civilization2.armys[army2]
    );

    // Si no hay ganador se declara el empate para ambas civilizaciones
    if (winner === 0) {
      this.declareTie(civilization1, army1);
      this.declareTie(civilization2, army2);
    }

    const winningCivilization = winner === 1 ? civilization1 : civilization2;
    const winningArmy = winner === 1 ? army1 : army2;
    this.rewardWinner(winningCivilization, winningArmy);

    const losingCivilization = winner === 2 ? civilization1 : civilization2;
    const losingArmy = winner === 2 ? army1 : army2;
    this.punishLoser(losingCivilization, losingArmy);

    // Muestra el resultado de la batalla
    console.log('Civilización ganadora', winningCivilization);
    console.log('Ejerciro ganador', winningCivilization.armys[winningArmy]);
    console.log('Civilización perdedora', losingCivilization);
    console.log('Ejercito perdedor', losingCivilization.armys[losingArmy]);
  }

  /**
   * @desc Obetiene el resultado de la batalla
   * @param {Array} army1
   * @param {Array} army2
   * @return {Integer} / 0 si no hubo ganador 1 si ganó el ejercito 1 si ganó el ejercito 2
   */
  getWinningArmy(army1, army2) {
    const armyPoints1 = this.getArmyPoints(army1);
    const armyPoints2 = this.getArmyPoints(army2);

    if (armyPoints1 === armyPoints2) {
      return 0;
    }
    return armyPoints1 > armyPoints2 ? 1 : 2;
  }

  /**
   * @desc Calcula los puntos del ejercito
   * @param {Array} army
   * @return {Number}
   */
  getArmyPoints(army) {
    let armyPoints = 0;
    UNITS.forEach(unit => {
      armyPoints += army.units[unit].strength * army.units[unit].quantity;
    });
    return armyPoints;
  }

  /**
   * @desc Al declarar empate ambas civilizaciones pierden la unidad con mayor puntaje
   * @param {Object} civilization
   * @param {Array} army
   */
  declareTie(civilization, army) {
    const unitsOrder = this.orderUnits(civilization.armys[army].units);
    let cont = 0;
    unitsOrder.forEach(unit => {
      if (cont < UNITS_TO_LOSE_TIE) {
        civilization.armys[army].units[unit].quantity = 0;
      }
      cont++;
    });
  }

  /**
   * @desc El ejercito ganador recibe una recompensa en monedas
   * @param {Object} civilization
   * @param {Array} army
   */
  rewardWinner(civilization, army) {
    civilization.armys[army].coins += WINNERS_REWARD;
  }

  /**
   * @desc Se eliminan las 2 unidades con mayor puntaje
   * @param {Object} civilization
   * @param {Array} army
   */
  punishLoser(civilization, army) {
    const unitsOrder = this.orderUnits(civilization.armys[army].units);
    let cont = 0;
    unitsOrder.forEach(unit => {
      if (cont < UNITS_TO_LOSE) {
        civilization.armys[army].units[unit].quantity = 0;
      }
      cont++;
    });
  }

  /**
   * @desc Devuelve un array con el orden de las unidades segun la cantidad descendente
   * @param {Object} units
   * @return {Array}
   */
  orderUnits(units) {
    let unitsOrder = [...UNITS];
    unitsOrder.sort(
      (unitA, unitB) =>
        units[unitB].quantity * units[unitB].strength -
        units[unitA].quantity * units[unitA].strength
    );
    return unitsOrder;
  }
}

/************************************************ Pruebas **************************************************** */
let civilization1 = new Civilization(CIVILIZATIONS[0]);

civilization1.createArmy();
civilization1.createArmy();

let civilization2 = new Civilization(CIVILIZATIONS[1]);

civilization1.trainArmy(0, UNITS[1])

const battle = new Battle();
battle.startBattle(civilization1, 2, civilization2, 0);