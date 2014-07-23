var qs = require('qs');
function Apistub(){

    /**
     * Method for get requests
     * @param model
     * @param populate
     * @param select
     * @returns {Function}
     */
    this.get = function (model,populate,select) {
        return function (req, res, next) {
            var urlParts = qs.parse(req.query),
                find = buildFindObject(urlParts,model),
                pagination = new BuildPaginationObject(urlParts);

            if(populate == undefined){
                populate = '';
            }else if(populate == 'all'){
                populate = buildDefaultPopulateObject(model);
            }

            model.
                find(find).
                select(select).
                limit(pagination.perPage).
                skip(pagination.skip).
                sort('asc').
                populate(populate).
                lean().
                exec(function(error,data){
                    if(!error){
                        model.find(find).count().exec(function (error, count) {
                            if(!error){
                                req.apistub = {
                                    data: data,
                                    page: pagination.page,
                                    pages: pagination.getNumberOfPages(count),
                                    perPage:pagination.perPage,
                                    totalItems:count
                                };
                                next();
                            }
                        });
                    }
                });
        };
    };

    /**
     * Method for get/:id requests
     * @param model
     * @param populate
     * @param select
     * @returns {Function}
     */
    this.getById = function (model,populate,select) {
        return function(req,res,next){
            if(populate == undefined){
                populate = '';
            }
            model.
                findOne({_id:req.params.id}).
                select(select).
                populate(populate).
                lean().
                exec(function(error,data){
                    if(!error){
                        req.apistub = {
                            data:data
                        };
                        next();
                    }
                });
        };
    };

    /**
     * Method for creating via post requests
     * @param model
     * @returns {Function}
     */
    this.post = function(model){
        return function(req,res,next){
            new model(extractBodyObject(req.body,model)).
                save(function(error,area){
                    if(!error){
                        req.apistub = {created:true,data:area};
                    }else{
                        req.apistub = {created:false,data:area};
                    }
                    next();
                });
        };
    };

    /**
     * Method for updating a resource via put requests -> put/:id
     * @param model
     * @returns {Function}
     */
    this.put = function(model){
        return function(req,res,next){
            model.update(
                {_id:req.params.id},
                extractBodyObject(req.body,model),
                function(error){
                    if(!error){
                        req.apistub = {updated:true};
                    }else{
                        req.apistub = {updated:false};
                    }
                    next();
                }
            );
        };
    };

    /**
     * Method for deleting resources via delete requests -> delete/:id
     * @param model
     * @returns {Function}
     */
    this.delete = function(model){
        return function(req,res,next){
            model.remove(
                {_id:req.params.id},
                function(error){
                    if(!error){
                        req.apistub = {deleted:true};
                    }else{
                        req.apistub = {deleted:false,error:error};
                    }
                    next();
                }
            );
        };
    };

    /**
     * Helper function to flatten arrays
     * @param data
     * @param propertyToKeep
     * @returns {Array}
     */
    function flatenArrayOfObjects(data,propertyToKeep){
        var array = [];
        for(var o in data){
            array.push(o[propertyToKeep]);
        }
        return array;
    };

    /**
     * Helper function that builds the populate object in case of an 'All' arguement
     * @param model
     * @returns {Array}
     */
    function buildDefaultPopulateObject(model){
        var populate = [];
        for (var property in model.schema.paths) {
            if(property == '_id' || property == '__v') continue;
            if(model.schema.paths[property].instance == 'ObjectID'){
                var pop = {};
                pop.path = model.schema.paths[property].path;
                populate.push(pop);
            }
        }
        return populate;
    };

    /**
     * Helper function for building the pagination object
     * @param urlParts
     * @returns {{page: *, perPage: (*|params.perPage|number|$cookies.perPage), skip: number, getNumberOfPages: getNumberOfPages}}
     * @constructor
     */
    function BuildPaginationObject(urlParts){
        var page = urlParts.page,
            perPage = urlParts.perPage;

        if(page == undefined){
            page = 0;
        }

        if(perPage == undefined){
            perPage = 150;
        }

        var getNumberOfPages = function(count){
            var pages = 0;
            if((((count/perPage)%1)*perPage) >= 0.98){
                pages = Math.ceil(count / perPage);
            }else{
                pages = Math.floor(count/perPage)
            }
            return pages;
        };

        return {
            page :page,
            perPage : perPage,
            skip:perPage * page,
            getNumberOfPages : getNumberOfPages
        };
    };

    /**
     * Helper method for recomposing an object from a string to an object
     * @param obj
     * @param string
     * @returns {*}
     */
    function recompose(obj,string){
        var parts = string.split('.');
        var newObj = obj[parts[0]];
        if(parts[1]){
            parts.splice(0,1);
            var newString = parts.join('.');
            return recompose(newObj,newString);
        }
        return newObj;
    };

    /**
     * Helper method that checks if a given property exists in an object
     * @param obj
     * @param prop
     * @returns {boolean}
     */
    function checkIfPropertyExistsInObject(obj, prop) {
        var parts = prop.split('.');
        for(var i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if(obj !== null && typeof obj === "object" && part in obj) {
                obj = obj[part];
            }
            else {
                return false;
            }
        }
        return true;
    };

    /**
     * Helper method that extracts the body objects from post and put requests, picks up only the model properties
     * @param bodyParts
     * @param model
     * @returns {{}}
     */
    function extractBodyObject(bodyParts,model) {

        var body = {};

        for (var property in model.schema.paths) {
            if(property == '_id' || property == '__v') continue;
            if(property.indexOf(".") > -1){
                if(checkIfPropertyExistsInObject(bodyParts,property)){
                    body[property] = recompose(bodyParts,property);
                }
            }else{
                if(bodyParts[property] !== undefined){
                    body[property] = bodyParts[property];
                }
            }
        }
        return body;
    };

    /**
     * Helper method that builds the find object that is getting passed to mongoose
     * @param urlParts
     * @param model
     * @returns {{}}
     */
    function buildFindObject(urlParts,model){
        var find = {};
        find.$or = [];
        for (var property in model.schema.paths) {
            if(property == '_id' || property == '__v') continue;
            if(urlParts[property] !== undefined){
                if(urlParts.strict === 'false' || urlParts.strict === undefined){
                    if(model.schema.paths[property].instance !== 'String'){
                        if(Object.prototype.toString.call( urlParts[property] ) === '[object Array]' && urlParts[property].length==1 ){
                            var or = {};
                            or[property] = urlParts[property][0];
                            find.$or.push(or);
                        }else if(Object.prototype.toString.call( urlParts[property] ) === '[object Array]' && urlParts[property].length>1 ){
                            for (var i = 0; i < urlParts[property].length; i++) {
                                var or = {};
                                or[property] = urlParts[property][i];
                                find.$or.push(or);
                            }
                        }
                    }else{
                        var or = {};
                        or[property] = new RegExp(urlParts[property], 'i');
                        find.$or.push(or);
                    }
                }else{
                    if(Object.prototype.toString.call( urlParts[property] ) === '[object Array]' && urlParts[property].length==1 ){
                        find[property] = [];
                        find[property].push(urlParts[property][0]);
                    }else{
                        find[property] = urlParts[property];
                    }
                }
            }
        }

        if(urlParts.strict === 'true' || find.$or.length == 0){
            delete find.$or;
        }
        return find;
    };
};

module.exports = new Apistub();
