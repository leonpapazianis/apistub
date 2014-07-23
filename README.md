apistub
=======

Apistub is a small nodejs module which is used to quickly stub out restful api's based on monogosejs schemas that are persisted in a mongo DB.
#Features
* Pagination
* Filtering on all properties of return object
* get
* get/:id
* put/:id
* post
* delete/:id
 
**WARNING!** This is is not a production module, there are no tests and it is very dirty

#Dependencies
 * [qs](https://www.npmjs.org/package/qs "qs") version: 0.6.6
 * [mongoosejs](http://mongoosejs.com/) version 3.8.3 (Non Direct)

#Usage
###Pagination
Change **perPage** and **page** via  query string parameter ex. _http://localhost:8000/api/thing?**page=0&perPage=3**_
```javascript
{
  page: 0,
  pages: 1,
  perPage: 3,
  totalItems: 3
}
```
###Filtering
Filter **data array** via  query string parameters ex. _http://localhost:8000/api/user?**firstName=Leo&lastName=Bal**_. (This is a fuzzy search, pass a **strict** parameter to get back exact results)
```Javascript
{
  data:[
    {
      firstName:"Leon",
      lastName:"Papazianis",
      age:25
    },
    {
      firstName:"Siyana",
      lastName:"Baleva",
      age:25
    }
  ],
  page: 0,
  pages: 1,
  perPage: 3,
  totalItems: 3
}
```
###Example Model
The following is an example mongoosejs model.
```javascript
'use strict';
var mongoose = require('mongoose');
var Model = function () {
        var Schema = mongoose.Schema({
            firstName: String,
            lastName: String,
            age: Number
        });
        return mongoose.model('User', Schema);
    };
module.exports = new Model();
```
###Example Controller
There are 5 callbacks, one for each rest method (GET, PUT, POST, DELETE and GET/:id). Choose the callback that fits your route and pass in the model. Pass the callback just before the anonymous function that will handle the response.

* get()
* getByID()
* put()
* post()
* delete()

```javascript
'use strict';

var modelName = 'user',
    model = require('models/api/'+modelName),
    apistub = require('apistub');
    
module.exports = function (app) {

    app.get('/api/'+modelName,apistub.get(model), function (req, res) {
        res.json(req.apistub);
    });

    app.get('/api/'+modelName+'/:id',apistub.getById(model), function(req, res){
        res.json(req.apistub);
    });

    app.post('/api/'+modelName,apistub.post(model), function(req, res){
        res.json(req.apistub);
    });

    app.put('/api/'+modelName+'/:id',apistub.put(model), function(req, res){
        res.json(req.apistub);
    });

    app.delete('/api/'+modelName+'/:id',apistub.delete(model), function(req, res){
        res.json(req.apistub);
    });
};
```
#Advanced Usage
Using mongoose models enables referencing to different schemas creating relations. In order to populate the paths of a model that are related to different schemas can be achieved either passing a standard mongoosejs populate object, or just passing 'all'.
###Example Student Model
The following is an example of a mongoosejs model for students that relate to a classroom.
```javascript
'use strict';
var mongoose = require('mongoose');
var Model = function () {
        var Schema = mongoose.Schema({
            firstName: String,
            lastName: String,
            age: Number,
            classroom: {
                type:mongoose.Schema.ObjectId,
                ref:'Classroom'
            }
        });
        return mongoose.model('Student', Schema);
    };
module.exports = new Model();
```
###Example Classroom Model
The following is an example of a mongoosejs model for the classroom.
```javascript
'use strict';
var mongoose = require('mongoose');
var Model = function () {
        var Schema = mongoose.Schema({
            subject: String,
            capacity:Number
        });
        return mongoose.model('Classroom', Schema);
    };
module.exports = new Model();
```
###Example Controller 
The following controller is showcasing the usage of a population of a related path.

```javascript
'use strict';

var modelName = 'student',
    model = require('models/api/'+modelName),
    apistub = require('apistub'),
    populate = [
        {
            path:'classroom',
            select:'subject capacity'
        }
    ];
module.exports = function (app) {
    app.get('/api/'+modelName,apistub.get(model,populate), function (req, res) {
        res.json(req.apistub);
    });
    app.get('/api/'+modelName+'/:id',apistub.getById(model,'all'), function(req, res){
        res.json(req.apistub);
    });
};
```
Response for the **_get/_** and the **_get/:id_** routes. (**Tip:**try removing the capacity from the populate object)
```javascript
{
  data:[
   {
    firstName:"Leon",
    lastName:"Papazianis",
    age:27,
    classroom:{
     _id: "53590b87607c3015bd9b0ebe",
     name: "Geography",
     capacity:30,
     __v: 0
    },
   }
  ],
}
```
Filter by classroom via query string parameter ex. _http://localhost:8000/api/student?**classroom=53590b87607c3015bd9b0ebe**_.
