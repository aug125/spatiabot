var http = require('http');
var fs = require('fs');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var authenticationService = require('./services/authenticationService');
module.exports = class Api {

    constructor(app) {
        this.app = app;
    };

    start (){
        //Message de bienvenue sur l'api
        console.log(' o___o '.green);
        console.log(' (^o^)    Bonjour, je suis l\'Api, prêt à vous servir !'.green);
        console.log('o/( )\\o'.green);
        console.log('O_.^._O\n'.green);


        //Le body parser permettra de récupérer les paramètre du corp de la requete
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        //On aura besoin d'un service d'authentification qui vérifiera les droits
        this.app.set('jwt',jwt);
        authenticationService.init(this.app);
        this.app.set('authenticationService',authenticationService);
        
        //On fera du cross domain donc il faut autoriser les requetes d'un autre domaine
        this.acceptCrossDomain();

        //On déclare les controllers de l'api
        this.loadControllers();

        //Tout est pret, on peut demarrer le serveur avec le bon port
        this.app.set('port', process.env.PORT || this.app.get('envConfig').apiPort || 3000);
        var server = http.createServer(this.app);
        var app = this.app;
        server.listen( this.app.get('port'), function()
        {
            console.log(('Api écoute sur le port ' + app.get('port')).blue);
        });

        return this;
    };
    
    acceptCrossDomain (){
        var app = this.app;
        this.app.use(function(req, res, next) 
        {   
            res.header("Access-Control-Allow-Origin", app.get('envConfig').apiOriginAllowed);
            res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
            res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
            //res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            //res.header("Access-Control-Allow-Credentials", "false");
            next();
        });
    };

    loadControllers (){
        var app = this.app;
        fs.readdirSync('./api/controllers/').forEach(function (file) 
        {
          if(file.substr(-3) == '.js') {
              var route = require('./controllers/' + file);
              route.controller(app);
          }
        });
    };

};