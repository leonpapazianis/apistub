apistub
=======

Apistub is a small nodejs module which is used to quickly stub out restful api's based on monogosejs schemas that are persisted in a mongo DB.
##Features
* Pagination
* Filtering on all properties of return object
* get
* get/:id
* put/:id
* post
* delete/:id
 
**WARNING!** This is is not a production module, there are no tests and it is very dirty

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
Filter **data array** via  query string parameters ex. _http://localhost:8000/api/thing?**firstName=Leo&lastName=Bal**_. (This is a fuzzy search, pass a **strict** parameter to get back exact results)
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
###Example Controller
There are 5 callbacks, one for each rest method (GET, PUT, POST, DELETE and GET/:id). Choose the callback that fits your route and pass in the model. Pass the callback just before the anonymous function that will handle the response.

* get()
* getByID()
* put()
* post()
* delete()

```javascript
'use strict';

var modelName = 'client',
    model = require('models/api/'+modelName)
    apistub = require('apistub'),
    
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
