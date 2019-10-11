const fs = require('fs')
const mustache = require('mustache')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')
const express = require('express')
const app = express()

const dbConfigs = require('./knexfile.js')
const db = require('knex')(dbConfigs.development)

const port = 3000



const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

app.get('/success', (req, res) => res.send("You have successfully logged in"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


/*  FACEBOOK AUTH  */

const FacebookStrategy = require('passport-facebook').Strategy;

const FACEBOOK_APP_ID = '2929134507115225';
const FACEBOOK_APP_SECRET = '81de12028968760bb6c564a9f7897c1b';

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/homepage');
  });


  /*  GITHUB AUTH  */

const GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = "Iv1.9268d1048cb628b9"
const GITHUB_CLIENT_SECRET = "b20472c738fd16777cd3591521e4a9e5adbc4957";

passport.use(new GitHubStrategy({
    clientID: GITHUB_CLIENT_ID,
    clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "/auth/github/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
      return cb(null, profile);
  }
));

app.get('/auth/github',
  passport.authenticate('github'));

app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/homepage');
  });



// -----------------------------------------------------------------------------
// Express.js Endpoints

const homepageTemplate = fs.readFileSync('./templates/homepage.mustache', 'utf8')
const cohortsTemplate = fs.readFileSync('./templates/cohorts.mustache', 'utf8')
const successTemplate = fs.readFileSync('./templates/success.mustache', 'utf8')

app.get('/', (req, res) => res.sendFile('auth.html', { root : __dirname}));
// app.use(session({ ... }))
// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors());
// app.use(bodyParser.urlencoded({ extended: false })); 
app.use(express.urlencoded())




app.get('/homepage', function (req, res) {
  getAllCohorts()
    .then(function (allCohorts) {
      res.send(mustache.render(homepageTemplate, { cohortsListHTML: renderAllCohorts(allCohorts) }))
    })
})

app.post('/cohorts', function (req, res) {
  createCohort(req.body)
    .then(function () {
      res.send(mustache.render(successTemplate, { successHTML: renderSuccessInfo() }))
    })
    .catch(function () {
      res.status(500).send('something went wrong. waaah, waaah')
    })
})

app.get('/cohorts/:slug', function (req, res) {
  console.log('yuhhhhh', req.params.slug)
  getOneCohort(req.params.slug)
    .then(function (cohort) {
      res.send(mustache.render(cohortsTemplate, { cohortsInfoHTML: renderCohortInfo(cohort) }))
    })
    .catch(function (err) {
      res.status(404).send('cohort not found :(')
    })
})

app.delete('/cohorts/:slug', function (req, res) {
  deleteCohort(req.params.slug) 
    .then(function (cohort) {
      res.send(req.params.slug)
    })
})

app.listen(port, function () {
  console.log('Listening on port ' + port + ' 👍')
})

// -----------------------------------------------------------------------------
// HTML Rendering

function renderCohort (cohort) {
  return `<li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>`
}

// function renderCohortData (cohort) {
//   return `<li><a href="/cohorts/${cohort.slug}">${cohort.title}</a></li>`
// }

function renderAllCohorts (allCohorts) {
  return '<ul>' + allCohorts.map(renderCohort).join('') + '</ul>'
}

function renderCohortInfo (cohort) {
  return `
    <ul>
      <li><b>Cohort title:</b> ${cohort.title}</li>
      <li><b>Start Date:</b> ${cohort.startDate}</li>
      <li><b>Start Date:</b> ${cohort.endDate}</li>
    </ul>
  `
}

function renderSuccessInfo () {
  return `
    <p>Yay u did it.</p>
    <p><a href="/">Go Back to Homepage</a></p>
  `
}

// -----------------------------------------------------------------------------
// Database Queries

const getAllCohortsQuery = `
  SELECT *
  FROM Cohorts
`

function getAllCohorts () {
  return db.raw(getAllCohortsQuery)
}

function getOneCohort (slug) {
  return db.raw('SELECT * FROM Cohorts WHERE slug = ?', [slug])
    .then(function (results) {
      if (results.length !== 1) {
        throw null
      } else {
        return results[0]
      }
    })
}

function deleteCohort (slug) {
  return db.raw('DELETE FROM Cohorts WHERE slug = ?', [slug])
  .then(function (results) {
    if (results.length !== 0) {
      throw null
    } else {
      return results[0]
    }
  })
}

function createCohort (cohort) {
  return db.raw('INSERT INTO Cohorts (title, slug, isActive) VALUES (?, ?, true)', [cohort.title, cohort.slug])
}

// -----------------------------------------------------------------------------
// Misc

function prettyPrintJSON (x) {
  return JSON.stringify(x, null, 2)
}
