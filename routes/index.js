var express = require('express');
var router = express.Router();

//stripe
const Stripe = require('stripe');
const stripe = Stripe('sk_test_51I9ovoDbuLE9NE4sDlIm2tSDLkEvyuIg8EJc4e6SuWnpbq0bvJCHHwX3OMXfvKKY2aVFqZdtaznWSvh6LH3JJYCb00QbUkbOsL');

// Catalogue de vélos
var dataBike = [
  {nom: 'Hercules - BK045', descr: `Vélo de route simple et pratique dans tout types de situation, pour les
  amateurs de vélos c'est un régale !`, url: src='/images/bike-1.jpg', prix: 679}, 
  {nom: 'Hero Sprint - HS0K7', descr : `Le modèle HS0K7 de la marque Hero Sprint. Léger,  joueur, endurant, en alu ou en acier, montés en roues de 700.`, url : src='/images/bike-2.jpg', prix : 799},
  {nom: 'KROSS - KR089', descr : `Vélo de tout térrain endurant et pratique dans tout types de situation, pour les
  amateurs de vélos.`, url : src='/images/bike-3.jpg', prix : 839}, 
  {nom: 'Hero Sprint - HS0W8', descr : `Le modèle HS0W8 de la marque Hero Sprint. Léger,  joueur, endurant, en alu ou en acier, monté en roues de 650.`, url : src='/images/bike-4.jpg', prix : 1249}, 
  {nom: 'Ampère - AMP045', descr : `Nous avons sélectionné le modèle Ampère - AMP045, doté de freins hydrauliques et d'un moteur centrale.`, url : src='/images/bike-5.jpg', prix : 899},
  {nom: 'Hero Sprint - DYX9 VX', descr : `Le modèle DYX9 VX de la marque Hero Sprint. Léger,  puissant, endurant, en alu, monté en roues de 700.`, url : src='/images/bike-6.jpg', prix : 1399},
];


// GET home page.
router.get('/', function(req, res, next) {
  if(req.session.panier == undefined) {
    req.session.panier = [];
  };
  res.render('index', { title: 'Bikeshop Home', dataBike, panier : req.session.panier });
});

// Panier
router.get('/shop', function(req, res) {
  var alreadyExist = false;

  for(var i=0; i<req.session.panier.length; i++) {
    if(req.session.panier[i].nom == req.query.nom){
      req.session.panier[i].quantity = parseInt(req.session.panier[i].quantity) + 1;
      alreadyExist = true;
    }
  }

  if(alreadyExist == false){
    req.session.panier.push({nom: req.query.nom, prix: req.query.prix, url: req.query.url, quantity: 1});
  }

  res.render('shop', { title: 'Panier', dataBike, panier : req.session.panier})
})


// Delete
router.get('/deleteshop', function(req, res) {
  req.session.panier.splice(req.query.delete, 1);
  res.render('shop', { panier : req.session.panier})
})


// Quantity
router.post('/update-shop', (req, res)=> {
  req.session.panier[req.body.choixVelo].quantity =  req.body.quantity;
  res.render('shop', { panier : req.session.panier })
})

//stripe route
router.post('/create-checkout-session', async (req, res) => {
  var panierStripe = [];
  for(var i=0; i<req.session.panier.length; i++) {
    panierStripe.push(  {
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.panier[i].nom,
        },
        unit_amount: req.session.panier[i].prix * 100,
      },
      quantity: req.session.panier[i].quantity,
    },)
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: panierStripe,
    mode: 'payment',
    success_url: 'https://myamawingwonderfulbikeshop.herokuapp.com/:3000',
    cancel_url: 'https://myamawingwonderfulbikeshop.herokuapp.com/:3000',
  });

  res.json({ id: session.id });
});

module.exports = router;
