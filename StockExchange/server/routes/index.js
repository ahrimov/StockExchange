var express = require('express');
var router = express.Router();
const path = require("path");
var brokers = require(path.join(__dirname, "../public/storage/broker.json"));
var shares = require(path.join(__dirname, "../public/storage/shares.json"));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/brokers', function(req, res, next) {
  res.send(brokers);
});

router.get('/broker/:id', function(req, res, next) {
  let broker = findById(req.params.id, brokers)
  res.send({cash: broker.cash, shares: broker.shares});
});

router.get('/shares', function(req, res, next) {
  res.send(shares);
});

const io = require('socket.io')();


io.on('connection', function(socket){
  console.log('User connected');
  socket.on('sell', (data) => {
    console.log(data.share + "  " + data.sellAmount)
  })
  socket.on('disconnect', function(){
    console.log('User disconnected')
  })
})

io.listen(3040)

router.post("/sellShares", (req, res) =>{
  let share = findShareByName(req.body.name, shares);
  share.auction_amount += parseInt(req.body.amount);
  let broker = findByName(req.body.owner, brokers);
  let brokerShare = findByName(share.data.name, broker.shares);
  brokerShare.amount -= parseInt(req.body.amount);
  brokerShare.auction_amount += parseInt(req.body.amount);
  res.send({shares: shares, brokerShares: broker.shares})
  io.sockets.emit('updateShares', {shares: shares})
})


router.post("/buyShares", (req, res) =>{
  let brokerShare = null;
  let broker = null;
  let share = findShareByName(req.body.name, shares)
  for(let i = 0; i < brokers.length; i++){
    if(brokers[i].name === req.body.customer) continue;
    brokerShare = findByName(req.body.name, brokers[i].shares)
    if(brokerShare){
      if(brokerShare.auction_amount < req.body.amount) {brokerShare = null; continue; }
      broker = brokers[i];
      broker.shares[brokerShare.id].auction_amount -= req.body.amount;
      broker.cash += (share.price * req.body.amount)
      io.sockets.emit('updateBroker', {name: broker.name, broker: broker})
      break;
    }
  }
  share.auction_amount -= req.body.amount;
  let customer = findByName(req.body.customer, brokers);
  let customerShares = findByName(req.body.name, customer.shares)
  if(!customerShares){
    let id = customer.shares.length;
    customer.shares.push({id: id, name: req.body.name, amount: parseInt(req.body.amount), auction_amount: 0})
  }
  else{
    customerShares.amount += parseInt(req.body.amount);
  }
  customer.cash -= (share.price * req.body.amount);
  res.send({shares: shares, brokerShares: customer.shares, cash: customer.cash})
  io.sockets.emit('updateShares', {shares: shares})
})

let timerId;

router.post('/start',  (req, res)=>{
  io.sockets.emit('startTrading');
  timerId = setInterval(() => setPrice(), 2000)
  res.send('ok')
})

router.post('/close', (req, res)=>{
  io.sockets.emit('closeTrading');
  clearInterval(timerId);
  res.send('ok')
})


function findShareByName(name, array){
  for (let i = 0; i < array.length; i++) {
    if (name === array[i].data.name) {
      return array[i];
    }
  }
  return null;
}

function findByName(name, array){
  for (let i = 0; i < array.length; i++) {
    if (name === array[i].name) {
      return array[i];
    }
  }
  return null;
}


function findById(id, array){
  for (let i = 0; i < array.length; i++) {
    if (id == array[i].id) {
      return array[i];
    }
  }
  return null;
}

function setPrice(){
  for(let i = 0; i < shares.length; i++) {
    if (shares[i].data.probability_distrib === "Равномерное") {
      shares[i].price = uniform(shares[i].data.start_price, shares[i].data.start_price + shares[i].data.max_number)
    }
    if (shares[i].data.probability_distrib === "Нормальное") {
      shares[i].price = normal(shares[i].data.start_price, shares[i].data.start_price + shares[i].data.max_number)
    }
  }
  io.sockets.emit('updateShares', {shares: shares})
}

function uniform(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function randn_bm() {
  var u = 0, v = 0;
  while(u === 0) u = Math.random();
  return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function normal(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(randn_bm() * (max - min)) + min;
}



module.exports = router;
