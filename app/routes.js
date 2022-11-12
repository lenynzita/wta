module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('attractions').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            attractions: result
          })
        })
        //
    });
    app.post('/chooseCountry',isLoggedIn, function(req, res) {
      console.log("body",req.body)
       const countryCount = {Congo:0, Senegal:0, Nigeria:0}
       const values = Object.values(req.body)
       let selectedCountry = ""
       for (let i=0; i< values.length; i++){
        console.log(values[i])
        if (values[i] == "Congo"){
          countryCount.Congo += 1
        }else if(values[i] == "Nigeria"){
          countryCount.Nigeria += 1
        }else if(values[i] == "Senegal"){
          countryCount.Senegal += 1

       }

       console.log("countryCount", countryCount);
      }
      if (countryCount.Congo >= countryCount.Nigeria && countryCount.Congo >= countryCount.Senegal){
        selectedCountry = "Congo"
      } else if ( countryCount.Nigeria > countryCount.Congo && countryCount.Nigeria >= countryCount.Senegal) {
        selectedCountry = "Nigeria"
      } else{
        selectedCountry = "Senegal"
      }
       console.log("values", values);
    //   console.log(req.body.reduce(function(sums,entry){
    //     sums[entry.city] = (sums[entry.city] || 0) + 1;
    //     return sums;
    //  },{}))

    db.collection('attractions').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('chooseCountry.ejs', {recommendedCountry:selectedCountry, attractions:result});
      // res.render('profile.ejs', {
      //   user : req.user, 
      //   attractions: result
      // })
    })
    //
     
      
  });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

    app.post('/messages', (req, res) => {
      db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
        if (err) return console.log(err)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })
    app.get('/attractions', function(req, res) {
      db.collection('attractions').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.send(result)
        // res.render('profile.ejs', {
        //   user : req.user,
        //   attractions: result
        // })
      })
      //
  });
//
    app.put('/messages', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp + 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.put('/animals', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbUp:req.body.thumbUp - 1
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
