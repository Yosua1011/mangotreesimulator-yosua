'use strict'

const cron = require('node-cron')
const firebase = require('firebase')

let config = {
  databaseURL: "https://mangotree-yosua.firebaseio.com",
  projectId: "mangotree-yosua"
}
let firebaseApp = firebase.initializeApp(config)
let db = firebaseApp.database()

class FruitTree {
  // New Tree Init
  constructor (age = 0, height = 0, fruits = [], healthystatus = true) {
    this._age = age;
    this._height = height;
    this._fruits = fruits;
    this._healthystatus = healthystatus;
    this._harvested = 0;
    this._good = 0;
    this._bad = 0;
  }

  get age () {
    return this._age;
  }

  get height () {
    return this._height;
  }

  get fruits () {
    return this._fruits;
  }

  get healthystatus () {
    return this._healthystatus;
  }

  // Current States

  // Grow State
  grow () {
    if (this._age < 15) {
      if (this._age < 10) this._height = this._height + parseFloat((Math.random() * 5).toFixed(2));
      this._age = this._age + 1;
    }
    if (this._age >= 15) {
      this._healthystatus = false;
    }
  }

  // Produced Mango State
  produceFruit () {
    let randomize = Math.floor(Math.random() * 10 + 1);
    for (let i = 0; i < randomize; i++) {
      this._fruits.push(new Fruit);
    }
  }

  // Harvest some fruits
  harvest () {
    this._good = 0;
    this._bad = 0;
    for (let i = 0; i < this._fruits.length; i++) {
      if (this._fruits[i]._quality === 'good') this._good++;
      else this._bad++;
    }
    this._harvested = this._fruits.length;
    return `${this._harvested} (${this._good} good, ${this._bad} bad)`;
  }

  endOfHarvest () {
    this._fruits = [];
    this._harvested = 0;
    this._good = 0;
    this._bad = 0;
  }
}

class Fruit {
  constructor () {
    this._quality = this.qualityCheck();
  }

  qualityCheck () {
    let randomize = Math.floor(Math.random()*2)
    if (randomize === 0) return 'good';
    else return 'bad';
  }
}

// This is how the mango tree lifecyle get produced
class MangoTree extends FruitTree {
  constructor (age = 0, height = 0, fruits = [], healthyStatus = 0) {
    super(age, height, fruits, healthyStatus);
  }
}

class Mango extends Fruit {
  constructor () {
    super();
  }
}

console.log('---------- Mango Tree Life Cycle ----------');
let mangoTree = new MangoTree()
db.ref('mangoTree').set(mangoTree)

let mangoTreeLifeTime = cron.schedule('*/2 * * * * *', () => {
  if (mangoTree._healthystatus !== false) {
    mangoTree.grow();
    mangoTree.produceFruit();
    console.log(`[Year ${mangoTree._age} Report] Height = ${mangoTree._height} m| Fruits harvested = ${mangoTree.harvest()}`)
    console.log('-=-=-=-=-=-=-=-=-');
    console.log('harvested: ' + mangoTree._harvested, 'Good: ' + mangoTree._good, "Bad: " + mangoTree._bad);
    console.log('-=-=-=-=-=-=-=-=-');
    db.ref('mangoTree').set(mangoTree);
    mangoTree.endOfHarvest();
  } else {
    mangoTreeLifeTime.stop()
    console.log(`The mango tree die`);
  }
})
