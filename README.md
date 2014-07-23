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
