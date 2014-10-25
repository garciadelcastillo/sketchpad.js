/*
* Copyright (c) 2013 Panagiotis Michalatos [www.sawapan.eu]
*
* This software is provided 'as-is', without any express or implied
* warranty. In no event will the authors be held liable for any damages
* arising from the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
*    1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
*
*    2. Altered source versions must be plainly marked as such, and must not
*    be misrepresented as being the original software.
*
*    3. This notice may not be removed or altered from any source
*    distribution.
*/
/** @module cooplib */

/**
 * CO namespace. It contains all coop functionality and classes
 * @namespace
 */
var CO=CO || {};

/**
 * me holds the object that describes the currently logged in user from this client. The main properties of this object is its _id and uname
 * CO.me._id is the database unique identifier of the user
 * CO.me.uname is the unique user name 
 * @public
 */
CO.me=null;


/**
 * command tags attached to messages to and from the server to indicate the desired action with regards to an object
 * @enum {number}
 * @const
 * @private
 */
CO.COMMANDS={
	NA:0, 
	CREATE:1,
	DELETE:2,
	MODIFY:3,
	FAILED:4
};


/**
 * these are internally used return codes when packing objects and variables for transmission that indivcate whether they should be removed from the syncQ or not
 * @enum {number}
 * @const
 * @private
 */
CO.RESULTS={
	DISCARD:0,
	KEEP:1
};

//....................................Main

/**
 * call this function to start calling cycle at regular intervals. cycle will upload all changes that have occured since the last time it was called to the server as a single batch
 * this avoids overwhelming the socket, somehting that could happen for example when synchronizing on mousemove or other rapid firing events 
 * @param {number} _dtmillis - number of milliseconds between synchronization cycles, see {@link module:cooplib~CO.cycle CO.cycle()}
 * @param {io.socket} [_socket] - if this parameter is not given then the function will initialize socket.io
 * @public
 */
 CO.init=function(_dtmillis, _socket) {
	if (!_socket) {
		CO.socket = io.connect();
		CO.socket.on('connect', function (){
		  setInterval(CO.cycle, _dtmillis);
		  console.info('successfully established a working connection');
		});
	}
	else {
		CO.socket = _socket;
		setInterval(CO.cycle, _dtmillis);
	}
	CO.setupSocketEvents();
}

/**
 * pause the synchronization cycle, see {@link module:cooplib~CO.cycle CO.cycle()} 
 * @public
 */
CO.pause=function() {
	CO.pauseCycle=true;
}

/**
 * start the synchronization cycle, see {@link module:cooplib~CO.cycle CO.cycle()} 
 * @public
 */
CO.start=function() {
	CO.pauseCycle=false;
}

/**
 *flag that determnines whether the synchronization cycle is active or not. see {@link module:cooplib~CO.start CO.start()} , {@link module:cooplib~CO.pause CO.pause()} and {@link module:cooplib~CO.cycle CO.cycle()} 
 * @private
 * @type {boolean}
 */
CO.pauseCycle=true;


/**
 * function called at regular interval to batch server synchronization. see {@link module:cooplib~CO.init CO.init()} , {@link module:cooplib~CO.pause CO.pause()} and {@link module:cooplib~CO.start CO.start()} 
 * this function cycles through al lthe active apps and requests from each one of them to pack any pendig objects and variables for server synchronization
 * @private
 */
CO.cycle=function() {
	if (CO.pauseCycle) return;
	for (var j in CO.apps) {
		var scopedata=CO.apps[j].pack();
		if (scopedata && scopedata.packet) {
			CO.socket.emit("COSYNC", {"app":j, "scopedata": scopedata.packet});
		}
	}
}

//............................................................Sync
/**
 * array of functions that handle incoming packets from the server organized by command code 
 * @private
 */
CO.onSync=[];

/**
 * this function handles an object creation request from the server
 * @function onSync[CO.COMMANDS.CREATE]
 * @memberof module:cooplib~CO
 * @param {object} _data of the form [app, v, _id, scopeid...]
 * @param {module:cooplib~CO.App} [_app] - if this parameter is not passed then it will be found through _data.app
 * @private
 */
CO.onSync[CO.COMMANDS.CREATE]=function(_data, _app) {
	//console.log("creating::");
	//console.log(_data);
	var app=_app||CO.apps[_data.app];
	if (!app) return;

	CO.fixVarNames(_data);

	var oldid=0;
	var coco=null;
	if (_data.tempid) { //this is a reflection confirming creation of the object
		//console.log("replace tmepid");
		oldid=_data.tempid;
		if (!app.objectIndex[_data.tempid]) return;
		coco=app.objectIndex[_data.tempid];
		coco.replaceId(_data._id);
		CO.applyVariables(coco, _data.v);

	}
	else {
		

		if (!app.objectIndex[_data._id]) {
			var scope=app.scopeIndex[_data.scopeid];
			if (!scope) return;

			if (_data.uname  && scope.namedObjects[_data.uname]) {
			//	console.log("replace named object");
				coco=scope.namedObjects[_data.uname].__CODATA;
				oldid=coco._id;
				if (coco._id[0]=="t") {
					coco.replaceId(_data._id);
				}
				else if (coco._id!=_data._id) {
					coco.replaceId(_data._id);
					//TODO: delete one of the two something went wrong here
				}
			}
			else {
				//TODO: check for unique name mechanics
				var vobj=CO.buildVarObject(_data.v);
				var codata={"scope":scope, "_id":_data._id, "skipsync":true, "uname":_data.uname};

				//console.log("create new type:"+_data.cotype);
				if (!_data.cotype || _data.cotype=="O" || !app.objectTypes[_data.cotype]) {					
					app.synced(vobj, _data.v, _data.cotype||"O", codata);
					coco=CO.CO(vobj);
				}
				else {
					var newobj=app.objectTypes[_data.cotype].constructorfunction(vobj, codata);
					app.synced(newobj, _data.v, _data.cotype, codata);
					coco=CO.CO(newobj);
				}
			}

			CO.applyVariables(coco, _data.v);
			if (app.onNewObject) app.onNewObject(coco.object);
		}
		else { //object already exists, simply modify
			coco=app.objectIndex[_data._id];
			CO.applyVariables(coco, _data.v);
		}		


	}

	//console.log("coco::");
	//console.log(coco);
	if (coco)
		app.fixReferences(coco, oldid)
	
}

/**
 * server variable names have "-" instead of "." because of mongoDB limitations. This function does the converssion from server norm to client norm
 * it basically rebuilds the v memeber of the _Data that contains the variables organized by name
 * @param {object} _data of the form [app, v, _id, scopeid...]
 * @private
 */
CO.fixVarNames=function(_data) {
	if (!_data || !_data.v) return;

	var v={};
	for(var i in _data.v) {
		v[i.replace("-",".")]=_data.v[i];
	}

	_data.v=v;
}

/**
 * create an object by looking at the names of the variables. for example a variable named "a.x" will cause this function to produce the object {a:{x:val}}
 * we need to do this when we don't know the type of an object that is sent from the server but we can assess its structure by the variables
 * because covariables are stored as a single list under each object the nested strucutre is only reflected by their names and it is not maintained in the database
 * @param {object} _v this is the list of variables as sent from the server something lke {"x":{val:0.5, mode:1}, "a.b":{val:"hi", mode:2}}
 * @returns {object} the object with the variables in _v placed at their proper nesting levels
 * @private
 */
CO.buildVarObject=function(_v) {
	if (!_v) return {};
	var vobj={};

	for (var i in _v) {
		CO.addProp(vobj, i, _v[i].val);
	}

	return vobj;
}

/**
 * looks at the name of a variable and splits at dots in order to recover the nesting structure. This is used in order to place the value of this variable at the correct nesting level of a newly constructed object
 * @param {object} _obj the object that is incrementally augmented in order to reproduce the original object's structure from the variables
 * @param {string} _prop the variable name to be added to _obj could be something like "x" but also something more complex like "a.b.xd.e"
 * @param {*} _val the value of the variable that is been inserted, if for example _prop="a.x". this function will guarantee that _obj.a.x==_val
 * @private
 */
CO.addProp=function(_obj, _prop, _val) {
	var sp=_prop.split("-");
	if (sp.length==1) _obj[sp]=_val;
	else {
		var s=_obj;
		for (var k=0; k<sp.length; ++k) {
			if (k==sp.length-1) s[sp[k]]=_val;
			else {
				if (!s[sp[k]]) s[sp[k]]={};
				s=s[sp[k]];
			}
		}
	}
}

/**
 * retrieve the property keys of an object as an array.
 * @param {object} _v the object whos
 * @returns {Array.<string>} the array of property names in _v
 * @private
 */
CO.getProperties=function(_v) {
	if (!_v) return [];
	var props=[];

	for (var i in _v) {
		props.push(i);
	}

	return props;
}

/**
 * process each variable in _v and add it or modify it in _cobj.
 * @param {module:cooplib~CO.CoObject} _cobj the client coobject to be modified
 * @param {object} _v the data received form server describing which variables need to be updated on the client side
 * @private
 */
CO.applyVariables=function(_cobj, _v) {
	if (!_cobj || !_v) return;
	for(var i in _v) {
		var vv=_cobj.variable(i, _v[i], true);
	}
}

/**
 * this function handles an object deletion request from the server
 * @function onSync[CO.COMMANDS.DELETE]
 * @memberof module:cooplib~CO
 * @param {object} _data of the form [app, v, _id, scopeid...]. If the object with _id _Data._id exists it will be deleted
 * @private
 */
CO.onSync[CO.COMMANDS.DELETE]=function(_data) {
	var app=CO.apps[_data.app];
	if (!app) return;

	coco=app.objectIndex[_data._id];
	if (!coco) return;

	coco.destroy();

	if (app.onObjectDeleted) app.onObjectDeleted(coco.object);	
}

/**
 * this function handles an object modification request from the server
 * @function onSync[CO.COMMANDS.MODIFY]
 * @memberof module:cooplib~CO
 * @param {object} _data of the form [app, v, _id, scopeid...]. If the object with _id _Data._id exists it will be modified according to the variable data in _data.v
 * @private
 */
CO.onSync[CO.COMMANDS.MODIFY]=function(_data) {
	var app=CO.apps[_data.app];
	if (!app) return;
	coco=app.objectIndex[_data._id];
	if (!coco) {
		app.reportMissing(_data._id)
		return;
	}
	CO.fixVarNames(_data);
	CO.applyVariables(coco, _data.v);
}

/**
 * this function handles a server "failed to execute command" response
 * this function will branch to the appropriate onFailed handler
 * @function onSync[CO.COMMANDS.FAILED]
 * @memberof module:cooplib~CO
 * @param {object} _data _data.failedcmd contains the id of the command that failed. For example _data.failedcmd==CO.COMMANDS.DELETE could mean that the client tried to delete an object without the propper permissions
 * @private
 */
CO.onSync[CO.COMMANDS.FAILED]=function(_data) {
	CO.onFailed[_data.failedcmd](_data);	
}

CO.onFailed=[];

/**
 * this handler is called when a creation request is denied by the server. As a response the client needs to destroy the corresponding object.
 * @function onFailed[CO.COMMANDS.CREATE]
 * @memberof module:cooplib~CO
 * @param {object} _data server packet that contains the app, scope and _id of the failed operation
 * @private
 */
CO.onFailed[CO.COMMANDS.CREATE]=function(_data) {
	console.log(_data.error);
	var app=CO.apps[_data.app];
	if (!app) return;

	coco=app.objectIndex[_data._id];
	if (!coco) return;

	coco.destroy();
}

/**
 * this handler is called when a deletion request is denied by the server. As a response the client needs to undelete the corresponding object.
 * @function onFailed[CO.COMMANDS.DELETE]
 * @memberof module:cooplib~CO
 * @param {object} _data server packet that contains the app, scope and _id of the failed operation
 * @private
 */
CO.onFailed[CO.COMMANDS.DELETE]=function(_data) {
	console.log(_data.error);	
	var app=CO.apps[_data.app];
	if (!app) return;

	coco=app.objectIndex[_data._id];
	if (!coco) return;

	coco.undelete();
}

/**
 * this handler is called when a modification request is denied by the server. As a response the client needs to revert the variables of the object to their server state
 * @function onFailed[CO.COMMANDS.MODIFY]
 * @memberof module:cooplib~CO
 * @param {object} _data server packet that contains the app, scope and _id of the failed operation
 * @private
 */
CO.onFailed[CO.COMMANDS.MODIFY]=function(_data) {
	console.log(_data.error);
	var app=CO.apps[_data.app];
	if (!app) return;
	coco=app.objectIndex[_data._id];
	if (!coco) return;

	CO.applyVariables(coco, _data.error.v);
}


/**
 * this function is called right after socket.io has beem initialized in order to establish the event handlers for the client - server communication
 * @function
 * @private
 */
CO.setupSocketEvents=function() {
	if (!CO.socket) return;

	CO.socket.on('error', function (_reason){
	  console.error('Unable to connect Socket.IO', _reason);
	});

	CO.socket.on('connect', function (){
	  console.info('successfully established a working connection');
	});

	CO.socket.on("COSYNC", function(_data) {

		//console.log("onCOSYNC");
		//console.log(_data);
		CO.onSync[_data.cmd](_data);

	});

	CO.socket.on("USERCONNECTED", function(data){
		if (!CO.apps[data.app]) return;
		var ap=CO.apps[data.app];
		var newcomer=new CO.User(data.userdata);
		ap.users[newcomer._id]=newcomer;
		ap.userNames[newcomer.uname]=newcomer;
		if (ap.onUserEnter) ap.onUserEnter(newcomer);
	});

	CO.socket.on("USERDISCONNECTED", function(data){
		if (!CO.apps[data.app]) return;
		var ap=CO.apps[data.app];

		var dead=ap.users[data.userdata._id];
		
		delete ap.users[data.userdata._id];
		delete ap.userNames[data.userdata.uname];

		if (ap.onUserLeave) ap.onUserLeave(dead);
	});

	CO.socket.on("USERMESSAGE", function(data){
		if (!CO.apps[data.app]) return;
		var ap=CO.apps[data.app];
		if (ap.onUserMessage) {
			if (ap.users[data.sourceid])
				ap.onUserMessage(ap.users[data.sourceid], data.message);
			else 
				ap.onUserMessage(data.sourceid, data.message);
		}
	});

	CO.socket.on("USER2USERMESSAGE", function(data){
		if (!CO.apps[data.app]) return;
		var ap=CO.apps[data.app];
		if (ap.onUser2UserMessage) {
			if (ap.users[data.sourceid])
				ap.onUser2UserMessage(ap.users[data.sourceid], data.message);
			else 
				ap.onUser2UserMessage(data.sourceid, data.message);
		}
	});


	//TODO:
	CO.socket.on("NEWSCOPE", function(data){ //when some other user created a scope i should know about

	});

	//TODO:
	CO.socket.on("USERENTEREDSCOPE", function(data){  //scopes cna be abstractions of cooperative files, or rooms or other types of spaces

	});

	//TODO:
	CO.socket.on("USERLEFTSCOPE", function(data){ 

	});
}

//.........................................Utility functions
/**
 * check if object is an array
 * @param {*} _obj the object to check
 * @public 
 * @returns {boolean}
 */
CO.isArray=function(_obj) {
	return (Object.prototype.toString.call(_obj) === '[object Array]');
}

/**
 * check if object is a string
 * @param {*} _obj the object to check
 * @public 
 * @returns {boolean}
 */
CO.isString=function(_obj) {
	return (typeof _obj == 'string' || _obj instanceof String);
}

/**
 * check if object is an Object (has prototype [object Object])
 * @param {*} _obj the object to check
 * @public 
 * @returns {boolean}
 */
CO.isObject=function(_obj) {
	return (Object.prototype.toString.call(_obj) === '[object Object]');
}

/**
 * deep clone all the properties of an object
 * @param {*} _obj the object to clone
 * @public 
 * @returns {object} the newly created clone
 */
CO.clone=function(_obj) {
	if (_obj==null) return null;
	if (CO.isArray(_obj)) {
		var nob=[];
		for(var i=0; i<_obj.length; ++i) {
			nob.push(CO.clone(_obj[i]));
		}
		return nob;
	}
	if (CO.isObject(_obj)) {
		var nob={};
		for(var i in _obj) {
			nob[i]=CO.clone(_obj[i]);
		}
		return nob;
	}
	return _obj;
}

/**
 * generate a pseudo GUID, not really used anymore
 * @public 
 * @returns {String}
 */
CO.generateGUID=function () {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}

/**
 * a client side counter used for sequencial _id generation
 * @private 
 * @type {number}
 */
CO.idcounter=1;
/**
 * generate a temporary ID, all newly created coobjects get a temporary client _id until their first sync with the server at which point the database unique _id is acquired
 * @public 
 * @returns {String} the new _id
 */
CO.generateTempId=function () {
	//return CO.generateGUID(); //might use a simpler counter later.
	CO.idcounter++;
	return "t"+CO.idcounter; //by checking the first letter we know that an object has a temp id and has not yet been registered on the server.
}


/**
 * apply function to all properties of an object 
 * @param {object} _obj the object to map the function to
 * @param {function} _func the function to apply
 * @public 
 */
CO.forEach=function(_obj, _func) {
	for(var i in _obj) {
		_func(_obj[i]);
	}
}

/**
 * check if an array contains a value
 * @param {Array.<*>} array to test for object inclusion
 * @param {*} value to seek within the array
 * @public 
 * @returns {boolean}
 */
CO.contains = function(_array, _obj) {
	var i = _array.length;
	while (i--) {
		if (_array[i] === _obj) {
			return true;
		}
	}
	return false;
}

//..................................................Type

/**
 * the class at the moment is a simple pairing of a name and a constructor but may be enriched in the future
 * @class
 * @classdesc this helper class is used in order to organize constructors. Synced coobjects can have a set type which is a string stored in the database.
 * when a new object is created on the server the client will receive the object data including its type. If there is a CO.Type registeredd with this name the 
 * constructor will be called otherwise the object will be reconstructed as a typical JS object with the same structure as implied by its covariables
 * the constructor is useful because if for example a type represents some graphical object then you need the constructor to create the appropriate client side entities
 * @param {module:cooplib~CO.App} _app the app to register the constructor with
 * @param {string} _typename the name of the type
 * @param {function} _constructor _constructor(_data, _codata) the constructor function
 * @param {object} _constructor()._data an object that is passed to the constructor and contains the values of all the coVariables that are stored on the server
 * @param {module:cooplib~CO.App~syncedOptions} _constructor()._codata an object that contains information that should be passed to any app.synced() call within the constructor. this contains properties such as the _id, the unique name or the scope of the incoming object that the constructor is caled upon to initialize
 * @returns {module:cooplib~CO.Type}
 * @public
 */
CO.Type=function(_app, _typename, _constructor) {
	/** @public 
		*@type {string}*/
	this.typename=_typename;
	/** @public 
		@type {function}*/
	this.constructorfunction=_constructor;

	_app.objectTypes[this.typename]=this;
}

//........................................................ObjecReference
/**
 * this class organizes cross referencing of coObject through coVariables. every time a covariable is set to a reference to a CoObject it is registered in the corresponding ObjectReference within this Coobject
 * @class
 * @classdesc this class organizes cross variable reference. every time a covariable is set to a reference to a CoObject it is registered in the corresponding ObjectReference within this Coobject
 * this class also helps keeping track of references that are needed but the corresponding objects have not arrived yet from the server. As soon as the object with the given _id arrives
 * and it is created all covariables registered with the temporary reference will point to the new object
 * the constructor accepts a coObject or an id depending on the information known at the time of creation
 * @param {module:cooplib~CO.CoObject} [_cobj] the coocbject to reference if known
 * @param {string} [_id] the _id if known
 * @private
 */
 CO.ObjectReference=function(_cobj, _id) {
	/** coObject that is referenced by this reference
		* @public 
		* @type {module:cooplib~CO.CoObject}*/
	this.cobj=_cobj;
	/** @public 
	  * @type {string}*/
	this._id=0;
	/** array of coVariables registered with this object
		* @private 
		* @type {Array.<module:cooplib~CO.Variable>}*/
	this.vars=[];

	if (this.cobj) {
		this._id=this.cobj._id;
	}
	else {
		if (!_id || _id[0]!="t") this._id=_id;
		else {
			var sp=_id.split("-");
			if (sp.length==1) {
				this._id=_id;
			}
			else {
				this._id=sp[0];
				this.uid=sp[1];
			}
		}
	}	
}

/**
 * mark all referencing covariables for reSync with the server
 * @private
 */
CO.ObjectReference.prototype.needSync=function() {
	for (var i=0; i<this.vars.length; ++i) {
		this.vars[i].needSync();
	}
}

/**
 * make sure that all registered vars are properly pointing towards this reference and are marked as reference type vars
 * @public 
 */
CO.ObjectReference.prototype.resetVars=function() {
	for (var i=0; i<this.vars.length; ++i) {
		this.vars[i].resetReference(this);
		this.vars[i].needSync();
	}
}

/**
 * check if th eid associated with this reference is a temporary (still pointing to an object waiting for server sync)
 * @public 
 * @returns {boolean}
 */
CO.ObjectReference.prototype.isTemp=function() {
	return (this._id && this._id[0]=="t");
}

/**
 * when an object is deleted all variables that referenced this object should point to n
 * @public 
 */
CO.ObjectReference.prototype.objectDeleted=function() {
	this.cobj=null;
	this._id=0;
	this.needSync();
}

/**
 * register a coVariable to point to this reference
 * @param {module:cooplib~CO.Variable} _covar the covariable to register
 * @public 
 */
CO.ObjectReference.prototype.registerVar=function(_covar) {
	if (!_covar) return;
	if (CO.contains(this.vars, _covar)) return;
	this.vars.push(_covar);
}

/**
 * remove a coVariable from this reference
 * @param {module:cooplib~CO.Variable} _covar the covariable to unregister
 * @public 
 */
CO.ObjectReference.prototype.removeVar=function(_covar) {
	for(var i=0; i<this.vars.length; ++i) {
		if (this.vars[i]==_covar) {
			this.vars.splice(i,1);
			return;
		}
	}
}

/**
 * this utility function is used when fusing references as a result of temp object resync etc... This reference will absorb and redirect all the covariables registered with _otherref
 * @param {module:cooplib~CO.ObjectReference} _otherref the reference to absorb
 * @private 
 */
CO.ObjectReference.prototype.absorbVars=function(_otherref) {
	if (!_otherref || _otherref==this) return;
	for(var i=0; i<_otherref.vars.length; ++i) {
		this.registerVar(_otherref.vars[i]);
	}
}

/**
 * set the coobject that this reference corresponds to. 
 * @param {module:cooplib~CO.CoObject} _cobj
 * @private 
 */
CO.ObjectReference.prototype.setObject=function(_cobj) {
	this.cobj=_cobj;
	this.setId(this.cobj._id);
}

/**
 * set the _id of this reference
 * @param {string} _id
 * @private 
 */
CO.ObjectReference.prototype.setId=function(_id) {
	if (this._id==_id) return;
	this._id=_id;
	if (this.isTemp()) return;
	this.needSync();
}

/**
 * pack this reference for server sync. a covariable that points to a reference will serialize its value through this function. This will either transmit the proper object server _id if known or a temporary _id if the object is not known at the time
 * @private 
 * @returns {string} the _id of this reference
 */
CO.ObjectReference.prototype.pack=function() {
	if (this.isTemp()) return this._id+"-"+(this.uid || CO.me._id);
	//if (!this.cobj) return 0;
	return this._id;
}

/**
 * gets the coObject corresponding to this reference. just an accessor function.
 * @public  
 * @returns {module:cooplib~CO.CoObject}
 */
CO.ObjectReference.prototype.getObject=function() {
	if (!this.cobj) return null;
	return this.cobj.object;
}


//...................................App
/**
 * list of active coApps by name. usually it contains just one member
 * @public
 * @type {Array.<module:cooplib~CO.App>}
 */
CO.apps={};

/**
 * the constructor of the app initializes the data structure and requests an app connection from the server
 * @class
 * @classdesc a coApp is the top level in the organization of coVariables. An App contains a tree of nested scopes which contain coObjects which encapsulate coVariables. In general there will be only one instance of the App for a client side script
 * @public
 * @param {string} _uname the unique name of the app. this should match an app name on the server. All server communication will contain this string as the value of the app property
 * @param {function} _onConnect _onConnect(_app), the callback function to be called as soon as the app has been confirmed by the server
 * @param {module:cooplib~CO.App} _onConnect()._app the newly created app if the connection were successful
 */
CO.App=function(_uname, _onConnect) {
	/** onUserEnter({@link module:cooplib~CO.User CO.User}) called each time a new user joins this app
		* @public 
		* @type {function}*/
	this.onUserEnter=null;
	/** onUserLeave({@link module:cooplib~CO.User CO.User}) called each time a user leaves the app
		* @public 
		* @type {function}*/
	this.onUserLeave=null;
	/** onUserMessage({@link module:cooplib~CO.User CO.User}, _message) called each time a user broadcasts a message
		* @public 
		* @type {function}*/
	this.onUserMessage=null; 
	/** onUser2UserMessage({@link module:cooplib~CO.User CO.User}, _message) called each time a user sends me a private message
		* @public 
		* @type {function}*/
	this.onUser2UserMessage=null;
	/** onNewObject(_object) called each time a new object has been received from the server and created here
		* @public 
		* @type {function}*/
	this.onNewObject=null;
	/** onNewObject(_object) called each time a an object has been deleted
		* @public 
		* @type {function}*/
	this.onObjectDeleted=null;

	/** named list of registered types. see {@link module:cooplib~CO.Type CO.Type}. this is for typed objects that require special constructor when received from the server
		* @private 
		* @type {Array.<module:cooplib~CO.Type>}*/
	this.objectTypes={};	
	/** queue of scopes that contain objects that need to be synced on the next cycle see {@link module:cooplib~CO.cycle CO.cycle()}. Every time a variable changes the scope of its container coobject is added to this queue
		* @private 
		* @type {Array.<module:cooplib~CO.Scope>}*/
	this.syncQ={};			

	/** unique name of app
		* @public 
		* @type {string}*/
	this.uname=_uname;
	/** the current scope. All coobjects created are registered in this scope unless a different scope is specified explicitely with synced method
		* @public 
		* @type {module:cooplib~CO.Scope}*/
	this.currentScope=null;
	/** the root scope is the top level scope for this app
		* @public 
		* @type {module:cooplib~CO.Scope}*/
	this.rootScope=null;
	/** index of scopes stored by _id for quick retrieval
		* @public 
		* @type {Array.<module:cooplib~CO.Scope>}*/
	this.scopeIndex={}; 	
	/** index of users online stored by _id for quick retrieval
		* @public 
		* @type {Array.<module:cooplib~CO.User>}*/
	this.users={};			
	/** index of users online stored by user name for quick retrieval
		* @public 
		* @type {Array.<module:cooplib~CO.User>}*/
	this.userNames={};	
	/** index of all coobjects online stored by _id for quick retrieval
		* @public 
		* @type {Array.<module:cooplib~CO.CoObject>}*/	
	this.objectIndex={};

	/** index of all references to objects that have not been synced yet. When a new object arrives we check this list to see if any variables are expecting this object as a reference. 
		* @private
		* @type {Array.<module:cooplib~CO.ObjectReference>}*/	
	this.pendingRefs={};

	var that=this;

	//register with global list of apps
	CO.apps[this.uname]=this; 

	//request app connection form server and retrieve app data (app data are application parameters stored on the server)
	//_appdata is a generic json object it may be empty
	CO.socket.emit("CONNECTAPP", {app: this.uname}, function(_err, _appdata) {
		if (_err) console.log(_err);
		else {
			console.log("app connected: ");

			that.data=_appdata;

			console.log(that);

			if (_onConnect) _onConnect(that);
		}
	});
}

/**
 * if the app encounters an object _id (e.g. in a reference) and can't find the object it requests it from the server. this function is asynchronous and the server will send an object at some point later if it can find it and you have permission to see it
 * @private  
 * @param {string} _id
 */
CO.App.prototype.reportMissing=function(_id) {
	CO.socket.emit("MISSING", {"app":this.uname, "_id":_id});
}

/**
 * this function is used by reference variables. it will return an existing object reference if it can find or create a pending one in case the object with the given _id has not yet arrived from the server
 * @private  
 * @param {string} _id
 * @returns {module:cooplib~CO.ObjectReference}
 */
CO.App.prototype.getReference=function(_id) {
	console.log("getReference for "+_id);
	if (!_id) return null;

	if (this.objectIndex[_id]) return this.objectIndex[_id].getReference();
	if (this.pendingRefs[_id]) return this.pendingRefs[_id];

	var sp=_id.split("-");
	if (sp.length==1) {
		this.pendingRefs[_id]=new CO.ObjectReference(null, _id);
		return this.pendingRefs[_id];
	}
	else {
		if (sp[1]==CO.me._id) {
			if (this.objectIndex[sp[0]]) return this.objectIndex[sp[0]].getReference();
			if (!this.pendingRefs[sp[0]]) this.pendingRefs[sp[0]]=new CO.ObjectReference(null, sp[0]);
			return this.pendingRefs[sp[0]];
		}
		else {
			this.pendingRefs[_id]=new CO.ObjectReference(null, _id);
			return this.pendingRefs[_id];
		}
	}
}

/**
 * sometimes an object _id might change, for example with objects that got a temporary _id and the server has returned their proper _id. This function will take care to fix any inconsistencies that may arise
 * @private  
 * @param {module:cooplib~CO.CoObject} _cobj the coObject whose references need to be fixed
 * @param {string} _oldid the old id of the object if this is an _id replacement operation
 */
CO.App.prototype.fixReferences=function(_cobj, _oldid) {
	if (!_cobj) return;


	if (!_cobj.ref && !this.pendingRefs[_oldid] && !this.pendingRefs[_cobj._id]) return;


	var ref=_cobj.getReference();

	if (this.pendingRefs[_oldid]) {
		ref.absorbVars(this.pendingRefs[_oldid]);
		delete this.pendingRefs[_oldid];
	}

	if (this.pendingRefs[_cobj._id]) { //this might happen in case of named objects with colliding _id
		ref.absorbVars(this.pendingRefs[_cobj._id]);
		delete this.pendingRefs[_cobj._id];
	}

	ref.setId(_cobj._id);
	ref.resetVars();
}


/**
 * given a typename and a constructor function, it will create a new Type object and register it with app.objectTypes list.
 * @public  
 * @param {string} _typename the unique name for this type
 * @param {function} _constructor  _constructor(_data, _codata) the constructor that the app should call every time it receives an object of this type
 * @param {object} _constructor()._data an object that is passed to the constructor and contains the values of all the coVariables that are stored on the server
 * @param {module:cooplib~CO.App~syncedOptions} _constructor()._codata an object that contains information that should be passed to any app.synced() call within the constructor. this contains properties such as the _id, the unique name or the scope of the incoming object that the constructor is caled upon to initialize
 * @returns {module:cooplib~CO.Type}
 */
CO.App.prototype.registerType=function(_typename, _constructor) {
	return new CO.Type(this, _typename, _constructor);
}


/**
 * options for the CO.App.synced method. All options are optional.
 * @typedef {Object} module:cooplib~CO.App~syncedOptions
 * @property {module:cooplib~CO.Scope} scope - the scope to which the object will be inserted. If this option is ommited then the object's scope (if it already exists) or the app's current scope will be used instead
 * @property {string} uname - the unique name for the synced object if it is going to be a named object for its scope. A unique literal name is used to identify objects that play a unique role in a scope. The bulk of the objects created will not need to have such a name but will be identified through their _id
 * @property {boolean} skipsync - if set to true newly created covariables will not be automatically added to the syncQ (this is for example the case when synced is called as a response to an object newly constructer from server data)
 * @property {string} _id - this property is set automatically when synced is called as a response to server side object creation
 */

/**
 * a list of properties to be converted to coVariables. This can be something like {"x":1, "y":1} that would mark the properties x and y of the synced object for synchronization
 * or something more complex like {"a.x":{mode:"CO.VMODES.SEPARATE"}, "r":{mode:"CO.VMODES.INSTANT", "isref": true}}. see {@link module:cooplib~CO.App~syncedProperty CO.App~syncedProperty} for possible options for each property
 * @typedef {Object} module:cooplib~CO.App~syncedPropertyList
 * @property {module:cooplib~CO.App~syncedProperty} varname1 - varname1 is the name of the first property of the synced object to be converted to a covariable. Its value contains the covariable definition options see {@link module:cooplib~CO.App~syncedProperty CO.App~syncedProperty}
 * @property {module:cooplib~CO.App~syncedProperty} varname2 -
 * @property {module:cooplib~CO.App~syncedProperty} varname3 - 
 * @property {module:cooplib~CO.App~syncedProperty} varnamen - 
 */

 /**
 * options for property conversion to coVariables. This options determine the behaviour of the covariables. Whether they reflect an indtantaneous value to all users or a user average, whether they correspond to a reference or an array etc...
 * some of these options apply to only certain variable modes.
 * @typedef {Object} module:cooplib~CO.App~syncedProperty
 * @property {module:cooplib~CO.VMODES} mode - one of the enumerated variable modes {CO.VMODES.NA=0, CO.VMODES.INSTANT=1, CO.VMODES.USERAVERAGE=2, CO.VMODES.ALLTIMEAVERAGE=3, CO.VMODES.ROLLINGAVERAGE=4, CO.VMODES.SEPARATE=5, CO.VMODES.INSTANTARRAY=6}
 * @property {object} val - an intialization value for the newly created covariable. If this property is not defined the covaribale will maintain the value of whatever property it replaces as its starting value
 * @property {number} maxhistorycount - number of past values to store in the database for the given variable. for example if this is set to 10 thn the covariable always carries a history array contianing the 10 latest values it has gone through along with the user who set them and the time it was set
 * @property {boolean} isref - [applies only to INSTANT and SEPARATE] If true the variable represents a reference to another coObject. For example if we were describing a graph structure the nodes of an edge object could be of this type
 * @property {number} factor - [applies onlt to ROLLINGAVERAGE] this is the blending factor. When you set the value of the variable to somehting the actual value on the server is nudged according to the formula val=val*factor+newval*(1-factor)
 * @property {number} maxcount - [applies only to ALLTIMEAVERAGE] this is the maximum numebr of values to store on the database in order to calculate the average over a period of time. 
 * @property {boolean} syncdata - the default value for this is true and it instructs the server to sync some extra data (like for example the list of past values of an ALLTIMEAVERAGE variable) that might not always be needed
 */

/**
 * this is one of the most important functions. It determines which properties of an objects should be turned into synced covariables
 * the object will acquire a corresponding coObject and all the properties 
 * this function can be called repeatedly on the same oobject to sync more properties or change synchronization settings
 * @public  
 * @param {object} _obj the object to be converted into a synchronized coObject
 * @param {module:cooplib~CO.App~syncedPropertyList} _properties the properties to be synchronized. this is a json object of the form {"property1":property1Options, "property2":property2Options}. property names of the form "a.x" are allowed in order to define covariables that are not directly under the synchronized object. propertyoptions are either the number 1 meaning default synchronization behaviour or can be another object with data such as mode, historycount or other properties depending on the type of variable
 * @param {string} [_type] the type of the object, it can be null for default type, This is only needed if the obect requires some special intitiallization when it is received from the server
 * @param {module:cooplib~CO.App~syncedOptions} [_options] an object that contains information such as the unique name or the scope that this object should be assigned to
 * @returns {object} returns the original object _obj which now has been augmented with a CoObject or an existing object if the requested unique name already exists in the requested scope.
 * @example <caption>Example usage the synced() method for typed object.</caption>
 * // constructs an object and then requests the x property ot be synchronized among clients with CO.VMODES.INSTANT mode (the default->1) 
 * // and the y variable to look different to each user and keep a history of its last 10 values on the server. 
 * // It also assigns a unique scope name to this object
 * var a=new Ball();
 * app.synced(a, {"x":1, "y":{"mode":CO.VMODES.SEPARATE, "maxhistorycount":10}}, "Ball", {uname:"theBall"});
 * @example <caption>Example usage the synced() method for generic object.</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * app.synced(a, {"x":1, "y":{"mode":CO.VMODES.SEPARATE, "maxhistorycount":10}, "text":1});
 */
CO.App.prototype.synced=function(_obj, _properties, _type, _options) {
	var coco;

	//find which is the explicit or implied scope for this coobject
	var scope=this.currentScope || this.rootScope;
	if (_options && _options.scope) scope=_options.scope;
	else if (_obj.__CODATA && _obj.__CODATA.scope) scope=_obj.__CODATA.scope;

	//if an object with the same name already exists in the scope then return the existing object
	if (_options && _options.uname && scope.namedObjects[_options.uname]) return scope.namedObjects[_options.uname];
	

	//make sure options contains the correct scope information
	if (_options) {
		_options.scope=scope;
		coco=CO.CO(_obj, _options);
	}
	else {
		coco=CO.CO(_obj, {"scope": scope});
	}

	//resolve the type
	coco.cotype=(_type || coco.cotype || "O"); 

	//apply the appropriate synchronization behaviour to each requested property, turning it into a covariable
	for(var i in _properties) {
		if (_properties[i]==1) _properties[i]={mode:CO.VMODES.INSTANT};
		else if (!_properties[i].mode) _properties[i].mode=CO.VMODES.INSTANT;
		var vi=CO.getVariable(_obj, i, _properties[i]);
		if (vi && !(_options && _options.skipsync)) 
			vi.needSync();
	}

	return _obj; //this is so that constructors can use this function to override their newly created object with an already existing object from the server
}

/**
 * serialize all the scopes that contian objects that need synchronization. This is called regularly at every cycle in order to package and transmit changes to the server
 * @private  
 * @returns {object} an object that contains all the coObjects and coVariables that need synchronization 
 */
CO.App.prototype.pack=function() {
	if (!this.syncQ) return null;

	var scopepack={}; 	//package of serialized scopes
	var count=0;		//number of serialized scopes
	var countleft=0;	//number of scopes that deferred serialization

	//loop through all the scopes in the syncQ and ask them to serialize themselves
	for (var i in this.syncQ) {
		var packet=this.syncQ[i].pack();
		if (!packet) {
			delete this.syncQ[i];
		}
		else if (packet==CO.RESULTS.KEEP) {
			countleft++;
		}
		else {
			scopepack[i]=packet.packet;
			count++;			
			if (packet.result==CO.RESULTS.KEEP) {
				countleft++;
			}
			else {
				delete this.syncQ[i];
			}
		}
	}

	if (countleft) {//sometimes scopes might retain some objects that cannot be synchronized right now but will definitely need to be synchronized in the near future. In that case we don't destroy the syncQ
		if (count) return {result:CO.RESULTS.KEEP, packet:scopepack};
		else return CO.RESULTS.KEEP;
	}
	else {
		this.syncQ=null;
		if (count) return {result:CO.RESULTS.DISCARD, packet:scopepack};
		else return null;
	}
}

/**
 * check if an object with a certain name exists in the current scope
 * @public  
 * @returns {object} the object with the given name if it exists or null 
 */
CO.App.prototype.exists=function(_uname) {
	return this.currentScope.namedObjects[_uname];
}

/**
 * broadcast a message to all connected users in this app
 * @public  
 * @param {object} _msg an object to be broadcasted to all online users in this app
 */
CO.App.prototype.broadcastMessage=function(_msg) {
	if (!CO.me) return;
	CO.socket.emit("USERMESSAGE", {sourceid:CO.me._id, app:this.uname, message:_msg});
}

/**
 * send a message to a specific user
 * @public  
 * @param {string} _targetid the _id of the user to target
 * @param {object} _msg an object to be sent
 */
CO.App.prototype.broadcastMessageToUser=function(_targetid, _msg) {
	if (!CO.me) return;
	CO.socket.emit("USER2USERMESSAGE", {sourceid:CO.me._id, targetid:_targetid, app:this.uname, message:_msg});
}


/**
 * join this app on the server. you can join an app after you have logged in
 * @public
 * @param {function} _callback  _callback(_err, _scope) a callback functioned to be called when the user has succesfuly joined the app on the server and entered its root scope
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.Scope} _callback()._scope the root scope of the newly joined app
 * @param {module:cooplib~CO.Scope~NewScopeOptions} [_options] scope creation options used on the root scope as soon as the user joins the app
 */
CO.App.prototype.join=function(_callback, _options) { //CO.me will join the app 
	if (!CO.socket || !CO.me) return;

	var that=this;
	CO.socket.emit("JOINAPP", {app: this.uname, userid: CO.me._id}, function(_error, _response) {
		if (_error) {
			console.log(_error);
			if (_callback) _callback(_error, null);
		}
		else {
			that.users[CO.me._id]=CO.me;
			that.userNames[CO.me.uname]=CO.me;
			that.pushScope("Root", null, null, _options, _callback);
		}
	});
}

/**
 * get the scope given its path. Scopes exist in a hierarchy like nested folders a scope's path. e.g. "Root/scope0/scope1/.../scopen" the path entered here can be  absolute starting with Root or relative to the current app scope. 
 * for exmaple the path "room1/a" will look for a scope "room1" within the app.currentScope and then the scope "a" within the result
 * two dots go up one level. e.g. "../data" will go one scope up from the current scope and then enter the scope anmed data from there.
 * @public
 * @param {string} _path the path of the scope to look for
 * @returns {module:cooplib~CO.Scope} the scope if found or null
 */
CO.App.prototype.getScope=function(_path) { //if the name exist under the current scope return it otherwise treat as path

	var parts=_path.split('/');

	var scope0=null;

	if (this.currentScope.scopes[parts[0]]) scope0=this.currentScope.scopes[parts[0]];
	else if (parts[0]=="..") scope0=this.currentScope.parent;
	else if (parts[0]==".") scope0=this.currentScope;
	else if (parts[0]=="Root") scope0=this.rootScope;
	else return null;

	for(var i=1; i<parts.length; ++i) {
		if (scope0.scopes[parts[i]]) scope0=scope0.scopes[parts[i]];
		else if (parts[i]=="..") scope0=scope0.parent;
		else if (parts[i]==".") scope0=scope0;
		else return null;
	}
	
	return scope0;
}

/**
 * set the app's current scope by its path. The app's current scope determines the default container for newly created objects on the client side
 * @public
 * @param {string} _path the path of the scope to look for
 * @returns {module:cooplib~CO.Scope} the scope if found or null
 */
CO.App.prototype.setCurrentScope=function(_path) { //TODO.
	if (_path.app) {
		this.currentScope=_path;
		return _path;
	}

	var scope=this.getScope(_path);
	if (!scope) return null;

	this.currentScope=scope;

	return scope;
}

/**
 * create a new scope. the new scope is created as a child of the scope at _parentpath or the app.currentScope if _parentpath is null
 * if the scope already exists the existing scope is returned and the permissions are altered nly if the user has access.
 * this function also sets the pushed scope as the currentScope for the app
 * @public
 * @param {string} _uname the name of the scope to create
 * @param {module:cooplib~CO.Scope~ScopePermissions} _permissions determne who can view and modify the new scope {createobjects:"all", modifyobjects:"all", read:"all", createscopes:"all", deleteobjects:"all", modifypermissions:"none" ,deletethis:"none"}. 
 * @param {string} [_parentpath] the path to the paent of the scope to create. If null the app.currentScope is used as a parent
 * @param {module:cooplib~CO.Scope~NewScopeOptions} [_options] scope creation options
 * @param {function} [_callback]  _callback(_err, _scope) a callback function to be called when the scope has been created and possibly synced (depends on _options.waitforsync)
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.Scope} _callback()._scope the newly created scope
 * @returns {module:cooplib~CO.Scope} the new scope or null
 */
CO.App.prototype.pushScope=function(_uname, _permissions, _parentpath, _options, _callback) { //adds a scope to a given scope [if no parent the current scope is used]
	if (!CO.socket || !CO.me) {
		if (_callback) _callback("no socket conneciton", null);
		return null;
	}


	var newscope=null;

	//the first scope to be create dis the Root
	if (!this.rootScope) {
		var perm=CO.Scope.normalizeServerPermissions(_permissions, null);

		newscope=new CO.Scope(_uname, this, null, perm, _options, _callback);
		this.rootScope=newscope;
	}
	else {
		var parent=null;
		if (_parentpath) {
			if (_parentpath.app) parent=_parentpath;
			else parent=this.getScope(_parentpath);

			if (!parent) {
				if (_callback) _callback("parent path not found", null);
				return null;
			}
		}
		else parent=this.currentScope;

		if (parent.error) {
			if (_callback) _callback("parent scope invalid", null);
			return null;
		}

		if (parent.scopes[_uname]) {
			newscope=parent.scopes[_uname];
			if (_callback) _callback(null, newscope);
		}
		else {	
			if (!parent.mypermissions.createscopes) {
				if (_callback) _callback("you don't have permission to create a new scope", null);
				return null;
			}
			var perm=CO.Scope.normalizeServerPermissions(_permissions, parent.serverpermissions);
			
			newscope=new CO.Scope(_uname, this, parent, perm, _options, _callback);
		}
	}

	this.currentScope=newscope;	
	return newscope;
}


/**
 * closing a scope means closing all its subscopes and deleting all their objects
 * @public
 * @todo implement
 * @param {string} _path the path of the scope to close
 */
CO.App.prototype.closeScope=function(_path) {
	var k=this.getScope(_path);
	if (!k) return null;

	k.close();
}

/**
 * to delte a scope the user must have proper permissions
 * @public
 * @todo implement
 * @param {string} _path the path of the scope to delete
 */
CO.App.prototype.deleteScope=function(_path) { //this destroys the scope on the server and all clients
	var k=this.getScope(_path);
	if (!k) return null;

	k.destroy();
}

//...................................Scope
/**
 * options for scope creation
 * @typedef {Object} module:cooplib~CO.Scope~NewScopeOptions
 * @property {boolean} waitforsync - if true the scope waits for all objects to sync for the first time before it calls the creation callaback
 */

 /**
 * permissions for scope. this is a set of flag that determine who can do what in each scope
 * a typical one looks like : {createobjects:"all", modifyobjects:[userid0, userid1], read:"public", createscopes:"all", deleteobjects:"all", modifypermissions:"none" ,deletethis:"none"}
 * the flags can have the following values: 
 * "public" : everybody even if not logged in or registered have access
 * "all" : all registered users
 * "none" : no one 
 * [id0, id1, ..., idn] : an array of user ids
 * "me" : this will be mapped to CO.me._id
 *
 * @typedef {Object} module:cooplib~CO.Scope~ScopePermissions
 * @property {object} createobjects - object creation permission
 * @property {object} modifyobjects - object modification permission
 * @property {object} read - permission to view contents of scope
 * @property {object} createscopes - permission to create child scopes
 * @property {object} deleteobjects - object deletion permission
 * @property {object} modifypermissions - permission to modify permissions for this scope
 * @property {object} deletethis - permission to delete this scope
 */

/**
 * the constructor of the Scope initializes the data structure and requests a full sync from the server downloading all the objects in the scope
 * @class
 * @classdesc Scopes can be thought as namespaces or folders that organize objects so that users can see or modify only parts of the app database. The main purpose of scopes is to determine permissions for group of objects
 * that define what each user is allowed to do. A scope can be used to represent a chatroom, or model or any other abstract collection of synchronized objects
 * @public
 * @param {string} _uname the unique name of the scope
 * @param {module:cooplib~CO.App} _app the app that this scope will belong to
 * @param {module:cooplib~CO.Scope} _parent the parent scope for this scope. Can be null if this is the Root scope
 * @param {module:cooplib~CO.Scope~ScopePermissions} _permissions determine who can view and modify the new scope e.g. {createobjects:"all", modifyobjects:"all", read:"all", createscopes:"all", deleteobjects:"all", modifypermissions:"none" ,deletethis:"none"}. 
 * @param {module:cooplib~CO.Scope~NewScopeOptions} [_options] scope creation options
 * @param {function} [_callback]  _callback(_err, _scope) a callback function to be called when the scope has been created and possibly synced (depends on _options.waitforsync)
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.Scope} _callback()._scope the newly created scope
 */
CO.Scope=function(_uname, _app, _parent, _serverpermissions, _options, _callback) {
	/** the parent of this scope. can be null for this==Root
		* @public 
		* @type {module:cooplib~CO.Scope}*/
	this.parent=_parent;
	/** the app this scope belongs to
		* @public 
		* @type {module:cooplib~CO.App}*/
	this.app=_app;
	/** the name of this scope
		* @public 
		* @type {string}*/
	this.uname=_uname;

	/** onUserEnter({@link module:cooplib~CO.User CO.User}) called each time a new user enters this scope
		* @public 
		* @todo implement
		* @type {function}*/
	this.onUserEnter=null;
	/** onUserLeave({@link module:cooplib~CO.User CO.User}) called each time a user leaves this scope
		* @public 
		* @todo implement
		* @type {function}*/
	this.onUserLeave=null;

	/** the scope permissions as stored on the server
		* @public 
		* @type {module:cooplib~CO.Scope~ScopePermissions}*/
	this.serverpermissions=CO.clone(CO.NOPERMISSIONS); //default to no permissions until server allows it
	/** permissions as they apply to CO.me. the permission flags here have just boolean values for quick determination of the local user's access rights
		* @public 
		* @type {module:cooplib~CO.Scope~ScopePermissions}*/
	this.mypermissions=CO.clone(CO.NOPERMISSIONSME);

	/** the full path of the scope
		* @public 
		* @type {string}*/
	this.path="";
	if (this.parent) {
		this.parent.scopes[_uname]=this;
		this.path=this.parent.path+"/"+this.uname;
	}
	else {
		this.path=this.uname;
	}

	/** the queue where objects that need to be synced are added. this queue is packaged at each cycle and sent to the server
		* @private 
		* @type {Array.<module:cooplib~CO.CoObject>}*/
	this.syncQ=null;

	/** list of child scopes
		* @public 
		* @type {Array.<module:cooplib~CO.Scope>}*/
	this.scopes={};
	/** list of all objects in this scope stored by _id
		* @public 
		* @type {Array.<object>}*/
	this.objects={}; 
	/** list of named objects in this scope stored name
		* @public 
		* @type {Array.<object>}*/		
	this.namedObjects={}; 

	/** the unique _id of the scope to be determined by the server later
		* @public 
		* @type {string}*/	
	this._id=CO.generateTempId();

	var that=this;

	if (CO.me) { //if we are logged in
		CO.socket.emit("NEWSCOPE", {uname:this.uname, path:this.path, app:this.app.uname, userid:CO.me._id, permissions:_serverpermissions}, function(_err, _response) {
			if (!_response) {
				console.log(_err); //maybe no permission etc...

				//destroy that
				that.error=_err; //just a flag to mark this scope as invalid
				if (_callback) _callback(_err, null);
			}
			else {
				that.replaceId(_response._id); //replace temporary _id with server _id

				that.serverpermissions=_response.permissions;//the server might assign different permissions
				that.mypermissions=CO.Scope.permissionsToMe(_response.permissions); //the server might assign different permissions
				that.app.scopeIndex[_response._id]=that; //add scope to index

				if (_options && _options.waitforsync) {
					that.sync(_callback);
				}
				else {
					if (_callback) _callback(null, that);
					that.sync();
				}
			}
		});
	}
}


/**
 * check if a named object already exists in this scope
 * @public
 * @param {string} _uname the name of the object to find
 * @returns {object} the object named _uname if found
 */
CO.Scope.prototype.exists=function(_uname) {
	return this.namedObjects[_uname];
}

/**
 * create a new child scope for this scope.
 * if the scope already exists the existing scope is returned and the permissions are altered only if the user has access.
 * @public
 * @param {string} _uname the name of the scope to create
 * @param {module:cooplib~CO.Scope~ScopePermissions} _permissions determne who can view and modify the new scope {createobjects:"all", modifyobjects:"all", read:"all", createscopes:"all", deleteobjects:"all", modifypermissions:"none" ,deletethis:"none"}. 
 * @param {module:cooplib~CO.Scope~NewScopeOptions} [_options] scope creation options
 * @param {function} [_callback]  _callback(_err, _scope) a callback function to be called when the scope has been created and possibly synced (depends on _options.waitforsync)
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.Scope} _callback()._scope the newly created scope
 * @returns {module:cooplib~CO.Scope} the new scope or null
 */
CO.Scope.prototype.pushScope=function(_uname, _permissions, _options, _callback) { //adds a scope to a given scope [if no parent the current scope is used]
	if (!CO.socket || !CO.me) {
		if (_callback) _callback("no socket conneciton", null);
		return null;
	}

	//validate name make sure it doesn't contian any "/"

	var newscope=null;

	if (this.error) {
		if (_callback) _callback("parent scope invalid", null);
		return null;
	}

	if (this.scopes[_uname]) {
		newscope=this.scopes[_uname];
		if (_callback) _callback(null, newscope);
	}
	else {	
		if (!this.mypermissions.createscopes) {
			if (_callback) _callback("you don't have permission to create a new scope", null);
			return null;
		}
		var perm=CO.Scope.normalizeServerPermissions(_permissions, this.serverpermissions);
		
		newscope=new CO.Scope(_uname, this.app, this, perm, _options, _callback);
	}

	return newscope;
}

/**
 * replace the _id of this scope. Used when we receive the proper _id from the server
 * if the scope already exists the existing scope is returned and the permissions are altered only if the user has access.
 * @private
 * @param {string} _newid the new _id to apply to this scope
 */
CO.Scope.prototype.replaceId=function(_newid) {
	if (this._id && this._id[0]=="t") {
		if (this.app.syncQ && this.app.syncQ[this._id]) {
			delete this.app.syncQ[this._id];
			this.app.syncQ[_newid]=this;
		}
	}
	this._id=_newid;
}

/**
 * serialize all the objects in the scope's queue for transmission to server
 * @private
 * @returns {object} the packaged out of sync objects in this scope
 */
CO.Scope.prototype.pack=function() {
	if (!this.syncQ) return null;

	if (this._id[0]=="t") return CO.RESULTS.KEEP;

	var objpack={};
	var count=0;
	var countleft=0;

	for (var i in this.syncQ) {
		var packet=this.syncQ[i].pack();
		if (!packet) {
			delete this.syncQ[i];
		}
		else if (packet==CO.RESULTS.KEEP) {
			countleft++;
		}
		else {
			objpack[i]=packet.packet;
			count++;			
			if (packet.result==CO.RESULTS.KEEP) {
				countleft++;
			}
			else {
				delete this.syncQ[i];
			}
		}

	}

	if (countleft) {
		if (count) return {result:CO.RESULTS.KEEP, packet:objpack};
		else return CO.RESULTS.KEEP;
	}
	else {
		this.syncQ=null;
		if (count) return {result:CO.RESULTS.DISCARD, packet:objpack};
		else return null;
	}
}

/**
 * add the CoObject of an object to the synchronization queue
 * @public 
 * @param {object} _obj the object to be added to the queue (this object must already belong to this scope)
 */
CO.Scope.prototype.syncObject=function(_obj) {
	if (!_obj || !_obj.__CODATA || _obj.__CODATA.scope!=this) return;
	if (this.syncQ && this.syncQ[_obj.__CODATA._id]) return;
	

	this.syncCoObject(_obj.__CODATA);
}

/**
 * add a CoObject to the synchronization queue
 * @public 
 * @param {module:cooplib~CO.CoObject} _cobj the coobject to be added to the queue
 */
CO.Scope.prototype.syncCoObject=function(_cobj) {
	if (_cobj.__destroyed) return;
	if (!this.syncQ) { //this.synQ exists only for scopes with pending unsynced objects
		this.syncQ={};
		if (!this.app.syncQ) this.app.syncQ={};

		this.app.syncQ[this._id]=this;
	}

	this.syncQ[_cobj._id]=_cobj;
}

/**
 * do a full sync with the server retrieving all objects in the scope
 * @public
 * @param {function} [_callback]  _callback(_err, _scope) a callback function to be called when the scope has been synced
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.Scope} _callback()._scope this scope
 */
CO.Scope.prototype.sync=function(_callback) {
	if (!CO.me || this.error)  return;

	var that=this;

	CO.socket.emit("SYNCSCOPE", {scopeid:this._id, app:this.app.uname, userid:CO.me._id}, function(_err, _response) {
		if (!_response) {

			console.log(_err); //maybe no permission etc...
			that.error=_err; //just a flag to designate this scope as invalid
			if (_callback) _callback(_err, null);			
		}
		else {
			//TODO: the repsonse may contian other data or properties of the scope not wrapped in coObjects
			that.proccessObjectBatch(_response.objects);

			if (_callback) _callback(null, that);
		}
	});
}


/**
 * when the scope is first synchronized it receives a set of all the objects that have to be created
 * @private
 * @param {object} _objects set of name dvariables containing the objects that arrived from the server as a package
 */
CO.Scope.prototype.proccessObjectBatch=function(_objects) {
	if (!_objects) return;
	var i=_objects.length;
	while(i--) {
		CO.onSync[CO.COMMANDS.CREATE](_objects[i], this.app);
	}
}


/**
 * check if a scope is a descedant of this scope
 * @public
 * @todo implement
 * @param {module:cooplib~CO.Scope} _scope the scope to test
 * @returns {boolean}
 */
CO.Scope.prototype.hasDescendant=function(_scope) {

}

/**
 * destroy this scope
 * @todo implement
 */
CO.Scope.prototype.destroy=function() {

	//if (CO.app.CurrentScope==this || this.HasDescendant(CO.CurrentScope)) CO.CurrentScope=this.parent;
}

/**
 * convert permisions from server form to local form (true false values relative to CO.me)
 * @private
 * @param {module:cooplib~CO.Scope~ScopePermissions} _serverpermissions scope permissions as stored on the server
 * @returns {module:cooplib~CO.Scope~ScopePermissions} permissions as pplied to the local user
 */
CO.Scope.permissionsToMe=function(_serverpermissions) {
	var pme={};
	for(var i in _serverpermissions) {
		pme[i]=CO.Scope.permissionValueToMe(_serverpermissions[i]);
	}
	return pme;
}

/**
 * convert a single permission value to a true false boolean relative to the local CO.me user. A pemrission is always true if it has the value "all" or "public" and laways false if it has the value "none".
 * Otherwise it is an array that contains user _ids and we need to check if CO.me._id is included.
 * @private
 * @param {module:cooplib~CO.Scope~ScopePermissions} _permval scope permissions as stored on the server
 * @returns {boolean}
 */
CO.Scope.permissionValueToMe=function(_permval) {
	if (_permval=="all" || _permval=="public") return true;
	if (_permval=="none") return false;


	if (CO.isArray(_permval)) {
		for(var i=0; i<_permval.length; ++i) {
			if (_permval[i]==CO.me._id) return true;
		}
	}

	return false;
}

/**
 * ensures that the permissions object provided by the user contains all the required fields with valid values. If not it fills in from the parent scope permissions
 * @private
 * @param {module:cooplib~CO.Scope~ScopePermissions} [_usersetpermissions] the permissions that the user is trying to apply to a scope
 * @param {module:cooplib~CO.Scope~ScopePermissions} [_parentserverpermissions] the permissions of the parent of the scope that the user is trying to create or modify
 * @returns {module:cooplib~CO.Scope~ScopePermissions} a permissions object that is guaranteed to cntain all required fields
 */
CO.Scope.normalizeServerPermissions=function(_usersetpermissions, _parentserverpermissions) {
	if (!_usersetpermissions && !_parentserverpermissions) return CO.clone(CO.DEFAULTROOTPERMISSIONS);
	if (!_usersetpermissions) return CO.clone(_parentserverpermissions);

	var pp=_parentserverpermissions || CO.clone(CO.DEFAULTROOTPERMISSIONS);

	var p2={};

	for(var i in pp) {
		if (_usersetpermissions[i]) {
			var pv=_usersetpermissions[i];
			if (pv=="all") p2[i]="all";
			else if (pv=="public") p2[i]="public";
			else if (pv=="none") p2[i]="none";
			else if (pv=="me") p2[i]=[CO.me._id];
			else if (CO.isArray(pv)) {
				p2[i]=[];
				for(var j in pv) {
					if (pv[j]=="me") p2[i].push(CO.me._id);
					else p2[i].push(CO.clone(pv[j]));
				}
			}
			else p2[i]=CO.clone(pp[i]);
		}
		else p2[i]=CO.clone(pp[i]);
	}
	return p2;
}


/**
 * null permissions.
 * @private
 * @const
 */
CO.NOPERMISSIONS={createobjects:"none", modifyobjects:"none", read:"none", createscopes:"none", deleteobjects:"none", modifypermissions:"none" ,deletethis:"none"};
/**
 * null permissions to local user.
 * @private
 * @const
 */
CO.NOPERMISSIONSME={createobjects:false, modifyobjects:false, read:false, createscopes:false, deleteobjects:false, modifypermissions:false ,deletethis:false};
/**
 * default permissions for newly created scope if the user does not provide an alternative
 * @private
 * @const
 */
CO.DEFAULTROOTPERMISSIONS={createobjects:"all", modifyobjects:"all", read:"all", createscopes:"all", deleteobjects:"all", modifypermissions:"none" ,deletethis:"none"};

//.........................................User
/**
 * login funcion. This should eb called before attempting to join an app. The callback function wil lcontian the server user data and most importantly the unique _id of the user
 * @todo implement loging using httprequest instead of socket.io it will work better with the session manager on the server side
 * @public
 * @param {string} _uname user name
 * @param {string} _password password
 * @param {function} [_callback]  _callback(_err, _user) a callback function to be called when the user login has been confirmed or failed
 * @param {object} _callback()._err in case any error occures this will provide some feedback
 * @param {module:cooplib~CO.User} _callback()._user the newly created CO.me user object if the login was successful
 */
CO.login=function(_uname, _password, callBack) {
	if (CO.me) return;
	CO.socket.emit("LOGIN", {uname: _uname, password: _password}, function(_error, _userdata) {
		if (!_userdata) {
			console.log(_error);
			if (callBack) {
				callBack(_error, null);
			}
		}
		else {
			console.log("login successful:");

			CO.me=new CO.User(_userdata);
			if (callBack) {
				callBack(null, CO.me);
			}
			console.log(CO.me);
		}
	});
}

/**
 * Applies the user data received to the new user object
 * @class
 * @classdesc the user class primarily stores the user name and _id of a user, but it will also contain any server side properties assigned to the user.
 * @public
 * @param {object} _userdata _userdata is a json object coming from the server after a successful login of this or another user.
 */
CO.User=function(_userdata) {
	/** the unique server _id of the user
		* @public 
		* @type {string}*/
	this._id=0;
	/** the unique user name
		* @public 
		* @type {string}*/
	this._uname="name";
	for(var i in _userdata) {
		this[i]=_userdata[i];
	}
}


//....................................................COobject

/**
 * the constructor attaches the newly created coobject to the object. You should never call this function directly. Instead use CO.CO(object) or app.synced(...) for synced objects
 * @class
 * @classdesc CoObject is a set of metadata attached to any object that contians covariables. It is attached to a property named "__CODATA". It takes care of synchronization and 
 * most importantly it contains the list of covariables that mirror the variables on the main object. An object obj references its coobject through its obj."__CODATA" property or alternatively using the CO.CO(obj) function which
 * attaches a coobject to obj if it doesn't already have one. A coobject cobj has a reference to the original object through the cobj.object property. 
 * every time you attempt to convert a property of an objec to a covariable this coobject is automatically created and attached
 * @public
 * @param {object} _obj the object to be augmented
 * @param {module:cooplib~CO.App~syncedOptions} [_options] options passed to the initialization funcion of the coobject. Only the _id, scope and uname fields are used if they exist. 
 */
CO.CoObject=function(_obj, _options) {
	//attach the coobject to the object
	_obj.__CODATA=this; 
	/** the shadow of the object is a collection of the covariables in the coobject tha tmirrors the structure of the original object. It is only used for convenience and makes some syntax a bit more clear.
		* e.g. for an object {a:{b:1}, x:"g"} its coobject will hold covars as shadow: {a:{b:someCoVar}, x:someCoVar} 
		* this allows the chaining of certain operations
		* @public 
		* @type {Array.<module:cooplib~CO.Variable>*/
	this.shadow={}; 
	/** this is the object that this coobject is shadowing
		* @public 
		* @type {object}*/
	this.object=_obj;	
	/** this is a list that contains all the covariables of this object by name in a flat data structure. e.g. for an object {a:{b:1}, x:"g"} its coobject will hold covars as vars: {"a.b":someCoVar, "x":someCoVar}
		* @public 
		* @type {Array.<module:cooplib~CO.Variable>}*/
	this.vars={}; 		

	/** the unique _id of the object. Initially is set to a locally unique id and as soon as the object is synchronized with the server it gets a globally unique id (for this app at least but for all users)
		* @public 
		* @type {string}*/
	this._id=0;				

	//members that may be undefined if not needed

	/** the scope of this coobject. This property does not exist for coobjects that do not contain synced covariables
		* @public 	
		* @member {module:cooplib~CO.Scope} scope
		* @instance
		* @memberof module:cooplib~CO.CoObject*/


	 /** the unique scope name of this coobject if given. Otherwise the _id uniquely identifies the object.
		* @public 	
		* @member {string} uname
		* @instance
		* @memberof module:cooplib~CO.CoObject*/

	/** if true the object is waiting to be created on the server and get assigned an _id. during this time the object does not try to re upload itself
		* @private 	
		* @member {boolean} pending
		* @instance
		* @memberof module:cooplib~CO.CoObject*/

	/** the queue of covariables that need to be synced to the server during the next cycle
		* @private 	
		* @member {module:cooplib~CO.Variable} syncVarQ
		* @instance
		* @memberof module:cooplib~CO.CoObject*/

	 /** if any covariable references this object, then this value is set to an objectreference that is used to store and manage referencing variables
		* @private 	
		* @member {module:cooplib~CO.ObjectReference} ref
		* @instance
		* @memberof module:cooplib~CO.CoObject*/

	 

	this.setOptions(_options);
}


/**
 * used internally when creating new coobjects. Takes care of scope, _id and unique name assignment
 * @private
 * @param {module:cooplib~CO.App~syncedOptions} _options options passed to the initialization funcion of the coobject. Only the _id, scope and uname fields are used if they exist. 
 */
CO.CoObject.prototype.setOptions=function(_options) {
	if (!_options) return;

	this._id=(this._id)||(_options._id)||(CO.generateTempId());


	if (!this.scope && _options.scope) { //attach this coobject to a scope. Coobjects that are not synchrnized don't need a scope. they smply exist on the client side in order to organize covariables
		this.scope=_options.scope;
		this.scope.objects[this._id]=this.object;

		this.scope.app.objectIndex[this._id]=this;

		if (this.uname) {
			this.scope.namedObjects[this.uname]=this.object;
		}
	}

	if (!this.uname && _options.uname) {
		this.uname=_options.uname;
		if (this.scope) this.scope.namedObjects[this.uname]=this.object;
	}
}

/**
 * used during onChange event propagation to make sure we don't visit the same event generator twice
 * @private
 * @param {module:cooplib~CO.ContextStack} _contextstack the context stack of the current event propagation
 */
CO.CoObject.prototype.pushToContextStack=function(_contextstack) {
	return (_contextstack?_contextstack.push(this):(_contextstack=new CO.ContextStack(this)));
}



/**
 * add an event listener for any change to any of the covariables in this object. This saves you from assigning an event listener to every single variable of an object when it is not needed
 * @public
 * @param {object} _targetobject an object attached to the event object as it propagates. Can be null
 * @param {module:cooplib~CO.EventDispatcher~eventCallback} _callbak the event handler function
 */
CO.CoObject.prototype.onChange=function(_targetobject, _callbak) {
	CO.addEventListener(this, "change", _targetobject, _callbak)
	return this;
}

/**
 * dispatch the change event to all listeners for this object
 * @public
 * @param {module:cooplib~CO.ContextStack} _contextstack the context stack of the current event propagation
 * @param {object} _changedata contians information about the variable that triggered the change
 */
CO.CoObject.prototype.dispatchChange=function(_contextstack, _changedata) {
	if (!this.__EVENTS) return;
	CO.dispatchEvent(this, "change", _changedata, this.pushToContextStack(_contextstack));
}


/**
 * a projection is an object that has the same covariables and structure as this object but when you try to get the values of variables you see the values that other users see.
 * this only makes sense for variables with the SEPARATE mode set for now. All other types of covariables look the same to all the users
 * for example if there is a userviewpoint object but all its members {x,y,z} are separate mode covariables then we can use the projection to see where other users are located.
 * when a projection has been created it can be used repeatedly as its values always track the variables as set by the other user.
 * @public
 * @param {string} _userid the _id of the user whose version of the values o fthe variables we want to see
 * @returns {object} the projection of the coobject, that is an object with the same properties but those properties' values now track another user's changes.
 * @example <caption>Example usage of the projection operator</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * app.synced(a, {"x":1, "y":{"mode":CO.VMODES.SEPARATE}, "text":{"mode":CO.VMODES.SEPARATE}});
 * //....wait for sync and after other users have modified the same object...
 * var pa=CO.CO(a).projection(Wu._id);
 * // now pa will always reflect the "y" and "text" properties as seen by Wu. so pa.x==a.x but pa.y!=a.y and pa.text!=a.text
 */
CO.CoObject.prototype.projection=function(_userid) {
	var p0={};
	for(var i in this.vars) {
		var vi=this.vars[i];
		var n=vi.property.split(".");
		if (n.length==1) {
			Object.defineProperty(p0, vi.property, {
							get : function(){ return vi.project(_userid); },
							//set : function(_newValue){ that.set(_newValue); },
							enumerable : true,
							configurable : true}
						   );
		}
		else {
			var sv2=p0;
			for(var j=0; j<n.length-1; ++j) {

				if (!sv2.hasOwnProperty(n[j]) || !CO.isObject(sv2[n[j]])) sv2[n[j]]={};
				sv2=sv2[n[j]];
			}

			Object.defineProperty(sv2, n[n.length-1], {
							get : function(){ return vi.project(_userid); },
							//set : function(_newValue){ that.set(_newValue); },
							enumerable : true,
							configurable : true}
						   );

		}
	}
	return p0;
		
}


/**
 * this function is called by the cycle method every time this object has variables that need to be synchronized
 * its purpose is to serialize the changes in the variables for transmission to the server
 * @private
 * @returns {object} this object is made of two properties. The result property instructs the app to either discard this object from the queue (if it serialized succesfully) or keep it there (if it cannot be serialized at the moment because it is waiting for data from the server). The second property "packet" contains the set of all covariables that have been modified 
 */
CO.CoObject.prototype.pack=function() {

	if (this.__destroyed) {
		return null;
	}

	if (this._id[0]=="t") { //the object still has a temporary _id and has not yet received confirmation form the server that it was created, so it cannot transmit variable modifications
		if (this.pending) {
			//object has sent a create request to the server and is waiting
			return CO.RESULTS.KEEP; 
		}
		else {
			//object has not contacted the server yet so ths is the first time that the server will encounter this object. We send a create package that contains the full information of this object to the server
			this.pending=true;//set this flag to true so we don't keep sending creation requests to the server
			var pck={cmd:CO.COMMANDS.CREATE ,uname:this.uname, cotype:this.cotype, v:this.packAllSyncVariables()};
			if (this.uname) pck.uname=this.uname;

			this.syncVarQ=null;

			return {result:CO.RESULTS.KEEP, packet: pck}; //send the packet but also keep the object in the queue 	
		}		
	}

	if (this.__deleted) { //if object has been deleted (and not yet confirmed as destroyed) send a delete request to the server
		return {result:CO.RESULTS.DISCARD, packet:{cmd:CO.COMMANDS.DELETE}};
	}

	if (!this.syncVarQ) return null; //no variables that need synchronization

	//start packaging the covariables that are out of sync
	var varpack={};
	var count=0;
	var countleft=0;
	for (var i in this.syncVarQ) {
		var packet=this.syncVarQ[i].pack();
		if (!packet) {
			delete this.syncVarQ[i];
		}
		else if (packet==CO.RESULTS.KEEP) 
		{
			countleft++;
		}
		else{
			varpack[this.syncVarQ[i].propertyservername]=packet.packet;
			count++;
			if (packet.result==CO.RESULTS.KEEP) {
				countleft++;
			}
			else {
				delete this.syncVarQ[i];
			}
		}
	}

	var objpack={cmd:CO.COMMANDS.MODIFY, v:varpack};
	if (this.uname) 
		objpack.uname=this.uname;

	if (countleft) {
		if (count) return {result:CO.RESULTS.KEEP, packet:objpack};
		else return CO.RESULTS.KEEP;
	}
	else {
		this.syncVarQ=null;
		if (count) return {result:CO.RESULTS.DISCARD, packet:objpack};
		else return null;
	}
}

/**
 * forces all covariables ot serialize themselves regardless of whether any changes have occured. Usually called when a new object is created and sent to the server for the first time
 * @private
 * @returns {object} contains the set of all covariables with their properties and values
 */
CO.CoObject.prototype.packAllSyncVariables=function() {
	var varpack={};
	for (var i in this.vars) {
		var packet=this.vars[i].flatPack();
		if (packet) {
			varpack[this.vars[i].propertyservername]=packet;
		}
	}
	return varpack;
}

/**
 * when a coobject is created it receives a temporary _id from the client. When it is first synchronized with the server it receives a proper _id. this helper function replaces the temp _id and makes sure that the object is reregistered with the scope and app using the right key
 * @private
 */
CO.CoObject.prototype.replaceId=function(_newid) {
	if (this._id==_newid) return;
	_oldid=this._id;

	if (this.scope) {
		delete this.scope.app.objectIndex[_oldid];
		delete this.scope.objects[_oldid];


		if (this.scope.syncQ && this.scope.syncQ[_oldid]) {
			delete this.scope.syncQ[_oldid];
			this.scope.syncQ[_newid]=this;
		}

		this.scope.objects[_newid]=this.object;
		this.scope.app.objectIndex[_newid]=this;
	}
	this._id=_newid;
}
/*
CO.CoObject.prototype.setUName=function(_uname) {
	if (this.uname) { //TODO make sure it is not referenced anywhere by name if this is a rename operation

	}
	//TODO. if object already exists [it arrived during scope synchronization we need to merge the two]
	//TODO. if it hasn'e yet been synced then it is fine. otherwise notify server and synchronize 
	this.uname=_uname;
	if (this.scope) this.scope.namedObjects[this.uname]=this.object;
}*/

/**
 * this method creates or modifies a covariable that corresponds to a property of the object related to this coobject.
 * this method can also be used in order to access an already existing covariable (!! notice it will create it if it doesn't exist)
 * @public
 * @param {string} _property the name of the property to add, change or augment with a covariable
 * @param {module:cooplib~CO.App~syncedProperty} [_propertyoptions] the metadata (mode, history, isref etc...) associated with this variable. if this is null then the covariable will have the default behaviour CO.VMODES.NA
 * @param {boolean} [_skipsync] if true it won't automatically try to resync this covariable. This is usefull when a covariable changes as a response to server input (in which case we don't want to reflect it back, just apply the changes)
 * @returns {module:cooplib~CO.Variable} the covariable corresponding to the property
 * @example <caption>Example usage of the variable methid</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * CO.CO(a).variable("y").onChange(function(e){console.log("changed");}); //y a is augmented with a coobject "__CDATA" and the property y is replaced by a covariable with the default mode CO.VMODES.NA (no server sync). 
 * a.y=0.5; //will fire the "change" event 
 * @example <caption>Example usage of the variable methid</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * app.synced(a); //in order to use synced mode covariables on a we need to assign it to an app and a scope
 * CO.CO(a).variable("x", {"mode":CO.VMODES.INSTANT}); // x is now a synced covariable. All users in the scope can see it and change its value. 
 * a.x=4.5; 	//this will be reflected to all connected users and stored in the database
 * CO.CO(a).shadow.x.setHistory(100); //we can modify the covaribale through the shadow. this is equivalent to CO.CO(a).variable("x").setHistory(100). The shadow access allow chaining of variable modifications and easier access to nested variables
 */
CO.CoObject.prototype.variable=function(_property, _propertyoptions, _skipsync) {
	if (!_property) return;

	if (this.vars[_property]) {
		if (_propertyoptions && _propertyoptions!=1) this.vars[_property].unpack(_propertyoptions, _skipsync);
		return this.vars[_property];
	}
	else {
		return new CO.Variable(this, _property, _propertyoptions);
	}
}

/**
 * gets the reference object to this coobject which manages covariables that reference this coobject. If a ref object does not exist it is created. when a ref type variable is set to point to a coobject it uses this funciton to get the reference manager of this object 
 * @private
 * @returns {module:cooplib~CO.ObjectReference} the object reference manager
 */
CO.CoObject.prototype.getReference=function() {
	if (!this.ref) {
		this.ref=new CO.ObjectReference(this);
		if (this.ref.isTemp()) this.scope.app.pendingRefs[this._id]=this.ref;
	}
	return this.ref;
}

/**
 * destroy this object. This is called after the server has confirmed the deletion of the object from the database
 * @private
 */
CO.CoObject.prototype.destroy=function() {
	this.__destroyed=true;

	if (this.scope) {
		delete this.scope.objects[this._id];
		if (this.scope.syncQ) delete this.scope.syncQ[this._id];
		if (this.uname) delete scope.namedObjects[this.uname];


		delete this.scope.app.objectIndex[this._id];	
	}
}

/**
 * set the deleted flag of the object and request the deletion of the object from the server. This might be denied if the CO.me user does not have the right permissions
 * @private
 */
CO.CoObject.prototype.delete=function() {
	this.needSync();
	this.__deleted=true;
	//TODO: if object is not synced then simply destroy		
}

/**
 * this is used when permission to delete an object was denied by the server
 * @private
 */
CO.CoObject.prototype.undelete=function() {
	delete this.__deleted;
}

/**
 * register this object for synchronization in the next cycle. Each time a covariable is maltered it calls this function on its container coobject
 * @private
 */
CO.CoObject.prototype.needSync=function() {
	if (this.__deleted) return;
	if (this.scope) {
		this.scope.syncCoObject(this);
	}
}

/**
 * safe way to return the shadow of an object or an empty object. CO.shadow(obj).x is equivalent to CO.CO(obj).shadow.x
 * @public
 * @returns {object} the shadow of the object if it has one, that is all its covariables organized in a strucutre that mirrors the original object
 */
CO.shadow=function(_obj) {
	return (_obj.__CODATA)?_obj.__CODATA.shadow:{};
}

/**
 * alias for CO.prepareObject(_obj, _options)
 * it returns the existing (possibly modifying some of its properties) or creates a new coObject for a given object
 * @public
 * @param {object} _obj the object whose coobject we need to access
 * @param {module:cooplib~CO.App~syncedOptions} [_options] options passed to the initialization funcion of the coobject. Only the _id, scope and uname fields are used if they exist. 
 * @returns {module:cooplib~CO.CoObject} the coobject associated with this object
 */
CO.CO=function(_obj, _options) { //that's just cosmetic
	return CO.prepareObject(_obj, _options);
}

/**
 * same as CO.CO(_obj, _options);
 * it returns the existing (possibly modifying some of its properties) or creates a new coObject for a given object
 * @public
 * @param {object} _obj the object whose coobject we need to access
 * @param {module:cooplib~CO.App~syncedOptions} [_options] options passed to the initialization funcion of the coobject. Only the _id, scope and uname fields are used if they exist. 
 * @returns {module:cooplib~CO.CoObject} the coobject associated with this object
 */
CO.prepareObject=function(_obj, _options) {	
	if(_obj.__CODATA) {
		if (_options) _obj.__CODATA.setOptions(_options);
		return _obj.__CODATA;
	}
	return new CO.CoObject(_obj, _options);
}

/**
 * destroy the coobject associated with an object
 * this is called when a delete is terminal and confirmed by the server it dismantles all references to the object
 * @private
 * @param {object} _obj the object whose coobject we want to destroy
 */
CO.destroyObject=function(_obj) {
	if(!_obj.__CODATA) return;
	_obj.__CODATA.destroy();
}

/**
 * delete object from database and notify all clients. If succesfull the object will be destroyed
 * @public
 * @param {object} _obj the object to be delted
 */
CO.deleteObject=function(_obj) {
	if(!_obj.__CODATA) return;
	_obj.__CODATA.delete();
}

/**
 * undelete object after unsuccessfull request to the server
 * @private
 * @param {object} _obj the object to be undeleted
 */
CO.undeleteObject=function(_obj) {
	if(!_obj.__CODATA) return;
	delete _obj.__CODATA.undelete();
}


//...................................................Event generator
//TODO: the event mechanism is independent of the COVariable mechanics so it could have its own file

/**
 * initializes the stack
 * @class
 * @classdesc a context stack manages an array of object and is passed along the event propagation chain in order to avoid cyclical events (set variable a that sets b that sets a)
 * each object dispatching an event registers itself in this stack so if the event happens to come around the object terminates the propagation
 * @public
 * @param {*} _first the first element in the stack
 */
CO.ContextStack=function(_first) {
	/** the list of objects that the event has gone through
		* @private 
		* @type {Array.<object>}*/
	this.stack=[_first];
}

/**
 * cretae a context stack for an event chain initiated from a server packet
 * @private
 * @returns {module:cooplib~CO.ContextStack} the newly created contextstack
 */
CO.ContextStack.fromServer=function() {
	return new CO.ContextStack("SERVER");
}

/**
 * check if this stack represents the first encounter after a server initiated event. A covariable that has its value changed by an event with this stack it won't try to synchronize back to the server
 * @private
 * @returns {boolean} 
 */
CO.ContextStack.prototype.isServerRequest=function() {
	return this.stack.length==1 && this.stack[0]=="SERVER";	
}

/**
 * check if this stack represents the culmination of an event that was intitiated by a server event.
 * @private
 * @returns {boolean} 
 */
CO.ContextStack.prototype.begunFromServerRequest=function() {
	return  this.stack[0]=="SERVER";	
}

/**
 * check if an object exist in this stack
 * @private
 * @param {*} _object
 * @returns {boolean} 
 */
CO.ContextStack.prototype.contains=function(_object) {
	for (var i=0; i<this.stack.length; ++i) {
		if (this.stack[i] === this.stack) {
			return true;
		}
	}
	return false;
}

/**
 * push an object o nthe stack
 * @private
 * @param {*} _object
 * @returns {module:cooplib~CO.ContextStack}  the altered context stack, useful for chaining functions or pasing it as an argument
 */
CO.ContextStack.prototype.push=function(_object) {
	this.stack.push(_object);
	return this;
}

/**
 * clear the stack
 * @private
 */
CO.ContextStack.prototype.clear=function() {
	this.stack.length=0;
}




/**
 * the event handler for typical events
 * @public
 * @callback module:cooplib~CO.EventDispatcher~eventCallback
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} _e the event object
 */

 /**
 * generic event object
 * @public
 * @event module:cooplib~CO.EventDispatcher#eventObject
 * @type {object}
 * @property  {object} target the target object identifies a listener. Each time you add a listener you need to provide a target object with it. it can be null
 * @property  {object} source the object that dispatched the event (e.g. when a covariable changes and dispatches the "change" event it attaches itself as the source to the event)
 * @property  {module:cooplib~CO.ContextStack} contextstack keeps track of event propagation in order to avoid cyclical events
 * @property  {object} data contains the information that changes each time the event fires. e.g. the value of a covariable, or the array index for an array covariable that recently changed
 */

/**
 * intializes the listeners array
 * @class
 * @fires module:cooplib~CO.EventDispatcher#eventObject
 * @classdesc an event dispatcher represents an event atahced to a particular object's event manager plus the collection of listeners for this event.
 * @public
 * @param {module:cooplib~CO.EventManager} _eventman each object that emits events has an eventmanager attahce dot it. This event manager will be the parent of this event
 * @param {string} _eventName the name of the event
 */
CO.EventDispatcher=function(_eventman, _eventName) {
	/** the array of listeners registered for this event
		* @private 
		* @type {Array.<object>}*/
	this.listeners=[];
	/** the event amanger associated with the source object of this event
		* @private 
		* @type {module:cooplib~CO.EventManager}*/
	this.eventman=_eventman;
	/** the name of this event
		* @private 
		* @type {string}*/
	this.eventName=_eventName;
}

/**
 * dispatch the event associated with this dispatcher to all listeners
 * @private
 * @param {object} _data the data attached to the event object 
 * @param {module:cooplib~CO.ContextStack} _contextstack keeps track of event propagation in order to avoid cyclical events
 */
CO.EventDispatcher.prototype.dispatch=function(_data, _contextstack) {
	for(var i in this.listeners) {
		this.listeners[i].fn({eventName:this.eventName, target:this.listeners[i].target, source:this.eventman.sourceObject, contextstack:_contextstack, data:_data}); //TODO: block ping pong or circular events, at the mooment covariables automatically take care of this but it should be handled at this level
	}
}

/**
 * add a new event listener to this event
 * @public
 * @param {object} _targetObject the object to be associated with this listener. 
 * @param {module:cooplib~CO.EventDispatcher~eventCallback} _eventcallback the handler function when this event occurs
 */
CO.EventDispatcher.prototype.addEventListener=function(_targetObject, _eventcallback) {
	this.listeners.push({target:_targetObject, fn:_eventcallback});
}

/**
 * attaches the event manager as the "__EVENTS" property of the given object. If the object already has an event manager it returns that one.
 * @class
 * @classdesc an event manager is attached to an object that emits events. It's purpose is to keep track of the events and their listeners registered with an object. The covariables' onChange mechanism is implemented using this class
 * @public
 * @param {object} _obj this object will be augmented with an event manager "__EVENTS" if it doesn't already have one
 * @returns {module:cooplib~CO.EventManager} the event manager of the object if it already exists or the newly created one
 */
CO.EventManager=function(_obj) {
	if (_obj.__EVENTS) return _obj.__EVENTS;
	_obj.__EVENTS=this;

	/** the source object associated with this manger
		* @public 
		* @type {object}*/
	this.sourceObject=_obj;
	/** the set of events indexed by event name
		* @private 
		* @type {Array.<module:cooplib~CO.EventDispatcher>}*/
	this.events={};

	return this;
}

/**
 * get the event dispatcher for a given event name or create a new one
 * @public
 * @param {string} _event the name of the event to look for
 * @returns {module:cooplib~CO.EventDispatcher} the dispatcher registered under the given name
 */
CO.EventManager.prototype.event=function(_event) {
	if (!this.events[_event])  this.events[_event]=new CO.EventDispatcher(this, _event);//{listeners:[]};
	return this.events[_event];
}

/**
 * dispatch an event, just selects the right dispatcher and calls its own dispatch function
 * @public
 * @param {string} _event the name of the event to look for
 * @param {object} _data the data attached to the event object 
 * @param {module:cooplib~CO.ContextStack} _contextstack keeps track of event propagation in order to avoid cyclical events
 */
CO.EventManager.prototype.dispatch=function(_event, _data, _contextstack) {
	if (!this.events[_event])  return;
	this.events[_event].dispatch(_data, _contextstack);
}

/**
 * create for or return the event manager of an object
 * @public
 * @param {object} _obj the object to attach an event manager to
 * @returns module:cooplib~CO.EventManager} the event manager of object _obj
 */
CO.eventGenerator=function(_obj) {
	if (_obj.__EVENTS) return _obj.__EVENTS;
	return new CO.EventManager(_obj);
}

/**
 * delete the vent manager form an object
 * @public
 * @param {object} _obj the object to delete the event manager from
 */
CO.eventGeneratorDestroy=function(_obj) {
	if (!_obj.__EVENTS) return;
	delete _obj.__EVENTS;
}

/**
 * dispatch an event, maps to _obj."__EVENTS".dispatch(_event, _data, _contextstack);
 * @public
 * @param {object} _obj the object to dispatch the event from
 * @param {string} _event the name of the event to look for
 * @param {object} _data the data attached to the event object 
 * @param {module:cooplib~CO.ContextStack} _contextstack keeps track of event propagation in order to avoid cyclical events
 */
CO.dispatchEvent=function(_obj, _event, _data, _contextstack) {
	if (!_obj.__EVENTS) return;
	_obj.__EVENTS.dispatch(_event, _data, _contextstack);
}

/**
 * add a new event listener to this event, maps to CO.eventGenerator(_objSource).event(_event).addEventListener(_targetObject, _eventcallback);
 * @public
 * @param {object} _obj the object to dispatch the event from
 * @param {string} _event the name of the event to look for
 * @param {object} _targetObject the object to be associated with this listener. 
 * @param {module:cooplib~CO.EventDispatcher~eventCallback} _eventcallback the handler function when this event occurs
 */
CO.addEventListener=function(_objSource, _event, _targetObject, _eventcallback) {
	CO.eventGenerator(_objSource).event(_event).addEventListener(_targetObject, _eventcallback);
}



//TODO:
/*CO.removeEventListenerByTarget=function(_objSource, _objTarget) {
	if (!_objSource || !_objSource.__EVENTS || !_objSource.__EVENTS[_event]) return;

	var ls=_objSource.__EVENTS[_event].listeners;

	for(var i=0; i<ls.length; ++i) {
		if (ls[i].target==_objTarget) {
			ls.splice(i,1);
			return;
		}
	}
}

CO.removeEventListener=function(_objSource, _event, _objTarget) {
	if (!_objSource || !_objSource.__EVENTS || !_objSource.__EVENTS[_event]) return;

	var ls=_objSource.__EVENTS[_event].listeners;

	for(var i=0; i<ls.length; ++i) {
		if (ls[i].target==_objTarget) {
			ls.splice(i,1);
			return;
		}
	}
}

CO.removeEvent=function(_objSource, _event) {
	if (!_objSource || !_objSource.__EVENTS || !_objSource.__EVENTS[_event]) return;

	var ls=_objSource.__EVENTS[_event].listeners;

	for(var i=0; i<ls.length; ++i) {
		if (ls[i].target==_objTarget) {
			ls.splice(i,1);
			return;
		}
	}
}*/

//...................................................Variables

/**
 * a covariable can have any of these modes which determine whether it is synced ot the server and what setting and getting its vlaue means. These constants map to functions that determine the behaviour of the variable. 
 * the reason we are not subclassing the covariables to achieve the same effetc is that the mode can change dynamically easier in this way.
 * @enum {number}
 * @const
 * @public
 */
CO.VMODES={
	/** default behaviour, not synced to the server but emits onchange events etc... */
	NA:0, 
	/** this is a synced type. When a user sets its value all the other users see the same new value */
	INSTANT:1,
	/** this is a synced type. When a user sets its value an entry is added to its users property for that user. when a user reads its value she sees the average of all the users. This variable type only works with numebrs*/
	USERAVERAGE:2,
	/** this is a synced type. When a user sets its value an entry is added to its vlaues[] property. this variable keeps a history of the last n values and always reflect the average of the history*/
	ALLTIMEAVERAGE:3,
	/** this is a synced type. When a user sets its value on the server side a new value is calculated as val=val*factor+newval*(1.0-factor). S othe user can only nudge its value instead of set it directly*/
	ROLLINGAVERAGE:4,
	/** this is a synced type. this variable type will keep track of all the values that have been set by different users. It maintains a users array with one entry per user that has tried to modify this variable. Each user sees a different value when trying to read this variable. It is also the type that works with the projeciton operator*/
	SEPARATE:5,
	/** this is a synced type. this behaves similarly to the INSTANT type but its value is an array and is optimized for partial syncing only the parts of the array that changed. this is usefull for describing complex objects, e.g. a dynamic terrain model*/
	INSTANTARRAY:6
};

/**
 * a collection of allowable metadata attached to a covariable. used for security reasons
 * @const
 * @private
 */
CO.VALIDEXTRADATA={"isref":1, "maxhistorycount":1, "factor":1, "maxcount":1, "extradata":1, "syncdata":1};


/**
 * utility function that retrieves the value of a property given its path
 * @private
 * @param {object} _obj object that contains the property we are looking for
 * @param {string} _property the property path to look for
 * @param {string} [_separator] the path separating character , defaults to "." if not given
 * @returns {*} the vlaue of the property or null
 */
CO.getValue=function(_obj, _property, _separator) {
	if (_property in _obj) return _obj[_property];

	var n=_property.split(_separator||".");

	if (n.length>1) {
		var vv=_obj;
		for(var i=0; i<n.length; ++i) {
			vv=vv[n[i]];
		}
		return vv;
	}

	return null;
}

/**
 * utility function that sets the value of a property given its path
 * @private
 * @param {object} _obj object that contains the property we are looking for
 * @param {string} _property the property path to look for
 * @param {*} _value the new value for the property
 * @param {string} [_separator] the path separating character , defaults to "." if not given
 */
CO.setValue=function(_obj, _property, _value, _separator) {
	if (_obj.hasOwnProperty(_property)) {
		_obj[_property]=_value;
		return;
	}

	var n=_property.split(_separator||".");

	if (n.length>1) {
		var vv=_obj;
		for(var i=0; i<n.length-1; ++i) {
			vv=vv[n[i]];
		}
		vv[n[n.length-1]]=_value;
	}
}

/**
 * check if an object cotnains a given covariable
 * @private
 * @param {object} _obj object that contains the property we are looking for
 * @param {string} _property the property path to look for
 * @returns {module:cooplib~CO.Variable} the covariable if found or null
 */
CO.hasVariable=function(_obj, _property) {
	if (_obj && _obj.__CODATA && _obj.__CODATA.vars[_property]) return _obj.__CODATA.vars[_property];
	return null;
}


/**
 * this is an alias for CO.CO(_obj).variable(_property, _propertyoptions)
 * it retrieves, creates or modifies a covaribale associated with a given object
 * @public
 * @param {object} _obj the object to attach the covariable to
 * @param {string} _property the name of the property to add, change or augment with a covariable
 * @param {module:cooplib~CO.App~syncedProperty} [_propertyoptions] the metadata (mode, history, isref etc...) associated with this variable. if this is null then the covariable will have the default behaviour CO.VMODES.NA
 * @returns {module:cooplib~CO.Variable} the covariable corresponding to the property
 */
CO.getVariable=function(_obj, _property, _propertyoptions) {
	if (!_obj || !_property) return null;
	return CO.CO(_obj).variable(_property, _propertyoptions);
}

//..............................................................Variable class

 /**
 * a history entry as stored on the server
 * @typedef {Object} module:cooplib~CO.Variable~Historyentry
 * @property {string} userid - the _id of the user who set this value
 * @property {Date} time - the time this happened
 * @property {*} setval - the value that the user attempted to set
 * @property {*} val - the value that was set (for some types of covariables the value of the covariable is not the same as the value that the user tries to set it to)
 */


/**
 * this cosntructor creates hte covariable object and overrides the property of the object with hidden getter/setter functions that forward all value changes to the covariable
 * @class
 * @classdesc the covariable class describes an object that is associated with a property of an object. the covariable takes care of synchronizing the object every time the 
 * associated property changes, as well as dispatch events, log past values and wire properties accross objects. 
 * @public
 * @param {module:cooplib~CO.CoObject} _cobj the coobject to attach this covariable to
 * @param {string} _property the name of the property ot be augmented with this covariable
 * @param {module:cooplib~CO.App~syncedProperty} [_propertyoptions] options used to initialize the covariable.
 */
CO.Variable=function(_cobj, _property, _propertyoptions) {
	/** the coobject that contains this covariable
		* @public 
		* @type {module:cooplib~CO.CoObject}*/
	this.cobj=_cobj;
	/** the path of the property that is associated with this covariable can be as simple as "x" or a nested variable "a.b.x"
		* @public 
		* @type {string}*/
	this.property=_property;
	/** shorthand for this.cobj.shadow. It allows compact covariable modification e.g. CO.CO(a).shadow.x.setMode(2)._.y.setMode(3).set(0.5);
		* @public 
		* @type {obj}*/
	this._=this.cobj.shadow;

	/** if this flag is set then during the next synchronization this covariable will transmit all its properties (mode, isref etc...) along with its value
		* @private 
		* @type {boolean}*/
	this.repackEverything=true;

	/** the array of links of this covariable to others. Links allow bidirectional wiring of covariables with possible transformations
		* @public 
		* @type {Array.<module:cooplib~CO.VariableLink>}*/
	this.links=[];

	 /** [may be undefined] this property exist if the covariable keeps a log of its values, see {@link module:cooplib~CO.Variable#createLog  createLog()}
	  * @public 	
	  * @member {Array.<object>} log
	  * @instance
	  * @memberof module:cooplib~CO.Variable*/

	 /** [may be undefined] this property exist if the covariable keeps a log of its values, see {@link module:cooplib~CO.Variable#createLog  createLog()}
	  * @public 	
	  * @member {Array.<object>} log
	  * @instance
	  * @memberof module:cooplib~CO.Variable*/

	 /** [may be undefined] this property is set if the variable is of reference type and it points to a valid reference
	  * @public 	
	  * @member {module:cooplib~CO.ObjecReference} ref
	  * @instance
	  * @memberof module:cooplib~CO.Variable*/

	   /** [may be undefined] this objects packs extra data that are relevent to the covariable and are synchronized as a package with the server. see {@link module:cooplib~CO.VALIDEXTRADATA VALIDEXTRADATA}
	  * @public 	
	  * @member {object} extradata
	  * @instance
	  * @memberof module:cooplib~CO.Variable*/

	   /** [may be undefined] if the server keeps track of past values of this covariable then history contains those values. see {@link module:cooplib~CO.Variable#setHistory  setHistory()}
	  * @public 	
	  * @member {Array.<module:cooplib~CO.Variable~Historyentry>} history
	  * @instance
	  * @memberof module:cooplib~CO.Variable*/

	   /** [may be undefined] this only applies to CoVariables of type CO.VMODES.INSTANTARRAY. it contains the elements i nthe array that need to be synchronized
		* if this is set to "all" then the complete array will be sent to the server
		* @private 	
		* @member {Array.<*>} syncElements
		* @instance
		* @memberof module:cooplib~CO.Variable*/

		 /** [may be undefined] this only applies to CoVariables of type CO.VMODES.ALLTIMEAVERAGE, CO.VMODES.USERAVERAGE, CO.VMODES.ROLLINGAVERAGE. this is the value that is sent to the server
		 but is not the actual value of the variable
		* @private 	
		* @member {number} localValue
		* @instance
		* @memberof module:cooplib~CO.Variable*/

		/** [may be undefined] this only applies to CoVariables of type CO.VMODES.SEPARATE and  CO.VMODES.USERAVERAGE. It contains the values set by the other users for the same covariable
		* @private 	
		* @member {Array.<object>} users
		* @instance
		* @memberof module:cooplib~CO.Variable*/

		/** [may be undefined] this only applies to CoVariables of type CO.VMODES.ALLTIMEAVERAGE. It contains the last extradata.maxcount values set for this covariable and stored on the server
		* @private 	
		* @member {Array.<number>} values
		* @instance
		* @memberof module:cooplib~CO.Variable*/

		/** [may be undefined] this only applies to CoVariables of type CO.VMODES.INSTANTARRAY. this returns the length of the array associated with this covariable
		* @private 	
		* @member {number} length
		* @instance
		* @memberof module:cooplib~CO.Variable*/


	/** the mode that determines the covariable's behaviour, never set it directly, use {@link module:cooplib~CO.Variable#setMode setMode()}
		* @public 
		* @type {module:cooplib~CO.VMODES}*/
	this.mode=CO.VMODES.NA;

	this.setMode((_propertyoptions && _propertyoptions.hasOwnProperty("mode"))?_propertyoptions.mode:CO.VMODES.NA);

	this.propertyservername=this.property.replace(".", "-"); //this is needed because mongodb doesn't like keys with dots

	
	var n=this.property.split(".");
	var that=this;

	var obj=this.cobj.object;

	if (n.length==1) {

		if (obj[this.property]!=undefined) {
			this.val=obj[this.property]; //null is ok
		}
		else {
			this.val=0;
		}
			this.cobj.shadow[this.property]=this;

		Object.defineProperty(obj, this.property, {
								get : function(){ return that.val; },
								set : function(_newValue){ that.set(_newValue); },
								enumerable : true,
								configurable : true}
							   );

	}
	else {
		var v2=obj;
		var sv2=this.cobj.shadow;
		for(var i=0; i<n.length-1; ++i) {
			if (!v2.hasOwnProperty(n[i]) || !CO.isObject(v2[n[i]])) v2[n[i]]={};
			v2=v2[n[i]]; //TODO: check and handle the possibility of wrong variable tree [requested variable not present in object]

			if (!sv2.hasOwnProperty(n[i]) || !CO.isObject(sv2[n[i]])) sv2[n[i]]={};
			sv2=sv2[n[i]];
		}

		if (v2[n[n.length-1]]!=undefined) {
			this.val=v2[n[n.length-1]]; //null is ok
		}
		else {
			this.val=0;
		}

		sv2[n[n.length-1]]=this;


		Object.defineProperty(v2, n[n.length-1], {
								get : function(){ return that.val; },
								set : function(_newValue){ that.set(_newValue); },
								enumerable : true,
								configurable : true}
							   );

		//v2["_"+n[n.length-1]]=this;
	}


	CO.CO(obj).vars[this.property]=this;

	CO.eventGenerator(this).event("change");

	this.unpack(_propertyoptions, true);
}

/**
 * attach a client side log to the variable. the log is an array attached to the covariable that holds the last _maxcount values. It exists only on the client side (unlike a history which is synced to the server)
 * because of this it is much faster and more lighweight and applies to covariables of any type even non synced ones
 * @public
 * @param {number} _maxcount the maximum number of values ot hold
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.createLog=function(_maxcount) {
	if (!this.log) {
		this.log=[this.val];
		this.log.maxcount=_maxcount;
	}
	else {
		if (this.log.length>this.log.maxcount) this.log.splice(0, this.log.length-this.log.maxcount);
	}
	return this;
}

/**
 * remove the log array from this covariable
 * @public
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.destroyLog=function() {
	delete this.log;
	return this;
}

/**
 * pushes the current vlaue of the covariable to the log. This happens automatically when the value changes so you shouldn't need ot call this method explicitely
 * @public
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.logValue=function() {
	if (!this.log) return;
	this.log.push(this.val);
	if (this.log.length>this.log.maxcount) this.log.splice(0, this.log.length-this.log.maxcount);
	return this;
}

/**
 * this is for internal use only. It sets the value of the variable without any checks or event dispatching
 * @private
 * @param {*} _value the new value of the covariable
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.definiteSetValue=function(_value) {
	this.val=_value;
	this.logValue();
	return this;
}

/**
 * serialize the value of the variable. This is used because it needs to handle differently a regular value from a ref value. In the latter case hte serialized form contians the _id of the referenced object rather than the whole object
 * @private
 * @returns {*} the serialization friendly form of the actual value of the variable
 */
CO.Variable.prototype.packValue=function() {
	//return CO.variablepack[this.mode].call(this, _propertyoptions, _skipsync);
	if (this.isReference()) {
		//console.log("pack "+this.property+"="+(this.ref?this.ref.pack():0)+" from " + this.cobj.uname);
		return (this.ref?this.ref.pack():0);
	}
	else {
		return this.val;
	}
}

/**
 * check if the covariable has the reference flag. Reference type covariables have different synchronization behaviour than all other types
 * @private
 * @returns {boolean}
 */
CO.Variable.prototype.isReference=function() {
	return this.extradata && this.extradata.isref;
}

/**
 * makes sure that a ref type variable is correclty referencing the newref object reference , is registered and its value points to the referenced object. only used internally
 * @param
 * @param {module:cooplib~CO.ObjectReference} _newref the new reference to be assigned ot the variable
 * @returns {boolean} true if it had to rewire the reference
 */
CO.Variable.prototype.fixReference=function(_newref) {
	if (_newref==this.ref && this.val==(_newref?_newref.cobj.object:null)) return false;

	if (this.ref) {		
		this.ref.removeVar(this);
	}

	this.ref=_newref;

	if (this.ref) {
		this.ref.registerVar(this);	

		if (this.ref.cobj) this.definiteSetValue(this.ref.cobj.object);
		else this.definiteSetValue(null);
	}
	else {
		this.definiteSetValue(null);
	}


	return true;
}

/**
 * this is called only through client side assignment. This function is called automatically when the value of the covariable is assinged a new object.
 * this method makes sure the referenced object has a coobject and an objectReference manager and then calls FixReference with the new reference
 * @private
 * @param {object} _obj the object to point this reference variable to
 * @returns {boolean} false if no sync is required, this is called only through client side assignment
 */
CO.Variable.prototype.setReferenceByObject=function(_obj) {
	var newref=null;
	if (CO.isObject(_obj)) newref=CO.CO(_obj).getReference();

	return this.fixReference(newref);
}

/**
 * this is called only when a covariable has been received from the server. The serialized form of a reference type covariable contains just an object _id
 * this function will try to find the object the _id belongs to or if this object is not yet here, it will create a pending reference
 * @private
 * @param {string} _id the _id of the object this covariable should point to
 */
CO.Variable.prototype.setReferenceById=function(_id) { //this only happens with variables that come from the server
	console.log("setReferenceById "+this.property+"<-"+_id+" from " + this.cobj.uname);
	if (!this.isReference()) return;

	if (_id==0) {
		this.set(null, CO.ContextStack.fromServer());
	}
	else {
		var newref=this.cobj.scope.app.getReference(_id);

		if (this.ref) {
			if (this.ref==newref) return;				
			this.ref.removeVar(this);
		}

		this.ref=newref;
		
		this.ref.registerVar(this);

		if (this.ref.cobj) {
			this.set(this.ref.cobj.object, CO.ContextStack.fromServer());
		}
		else this.set(null, CO.ContextStack.fromServer());
	}
}

/**
 * this is called only when a covariable has been received from the server, when they need ot pe pointed to a different object or a pending reference has been superceded by an actual object reference
 * @private
 * @param {module:cooplib~CO.ObjectReference} _newref the new reference to redirect this covariable to
 */
CO.Variable.prototype.resetReference=function(_newref) {
	if (!this.isReference()) return;
	if (this.ref && this.ref!=_newref) this.ref.removeVar(this);
	this.ref=null;
	this.val=null;

	this.set(_newref.cobj.object, CO.ContextStack.fromServer());
}

/**
 * this is called only when a covariable is deserialized in order to specifically handle the val field of the data. Depending on whether the variable is a reference  or not it will branch to the appropriate function
 * @private
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions these are either coming from the server or provided by the client on covariable creation
 */
CO.Variable.prototype.unpackValue=function(_propertyoptions) { 
	if (!_propertyoptions.hasOwnProperty("val")) return;
	if (this.isReference()) {
		//console.log("unpack "+this.property+"="+_propertyoptions.val+" from " + this.cobj.uname);
		this.setReferenceById(_propertyoptions.val);
	}
	else {
		this.set(_propertyoptions.val, CO.ContextStack.fromServer());
	}
}

/**
 * this is an alias for unpack. It is used to change covariable properties such as mode, isref, etc... 
 * @public
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.features=function(_propertyoptions, _skipsync) { //just an alias for now
	return this.unpack(_propertyoptions, _skipsync);
}

/**
 * It is used to change covariable properties such as mode, isref, etc... 
 * @public
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.unpack=function(_propertyoptions, _skipsync) {
	if (!_propertyoptions || _propertyoptions==1) return this;

	if (_propertyoptions.hasOwnProperty("mode")) this.setMode(Number(_propertyoptions.mode)); //ugly but it has to be set first as it impacts all other properties
	for(var i in _propertyoptions) {
		if (i=="mode" || i=="val") continue;
		this.setExtraDatum(i, _propertyoptions[i], _skipsync);  //this wil ltake care of mode change, value change, is ref and history
	}
	//if (_propertyoptions.hasOwnProperty("val")) 
	this.unpackValue(_propertyoptions); //ugly but it has to be set last 

	this.unpackfunc(_propertyoptions, _skipsync); //special logic for remaining variables
	return this;
}

/**
 * Set the mode of the covariable 
 * @public
 * @param {module:cooplib~CO.VMODES} _newmode the new mode to apply to the covariable
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.setMode=function(_newmode, _skipsync) {
	if (this.mode==_newmode) return this;

	this.mode=_newmode;

	//this.pack=CO.variablePack[this.mode];
	//this.flatPack=CO.variableFlatPack[this.mode];
	//this.set=CO.variableSet[this.mode];
	//this.unpackfunc=CO.variableUnpack[this.mode];

	CO.Variable._Init[this.mode].call(this);

	this.repackEverything=true;

	if (!_skipsync) this.needSync();
	return this;
}


/**
 * serialize the covariable for server transmission
 * this is a dummy mehtod that redirects to CO.Variable._Pack[this.mode].call(this);
 * @public
 * @returns {object} the serialized form of the covariable
 */
CO.Variable.prototype.pack=function() {
	return CO.Variable._Pack[this.mode].call(this);
}

/**
 * serialize the contents of the covariable for server transmission
 * this is a dummy mehtod that redirects to CO.Variable._FlatPack[this.mode].call(this);
 * @public
 * @returns {object} the serialized form of the covariable
 */
CO.Variable.prototype.flatPack=function() {
	return CO.Variable._FlatPack[this.mode].call(this);
}

/**
 * set the value of the covariable. This is the setter function that is called when you write something like: a.x=0.5; which would be equivalent to CO.CO(a).variable("x").set(0.5); or CO.CO(a).shadow.x.set(0.5)
 * this is a dummy mehtod that redirects to CO.Variable._Set[this.mode].call(this, _value, _contextstack);
 * @public
 * @param {*} _value the new mode to apply to the covariable
 * @param {module:cooplib~CO.ContextStack} [_contextstack] used when this happens in an event chain to avoid cyclical connections
 */
CO.Variable.prototype.set=function(_value, _contextstack) {
	return CO.Variable._Set[this.mode].call(this, _value, _contextstack);
}

/**
 * this function is called by the unpack method in order to handle properties that are different for different covariable modes
 * this is a dummy mehtod that redirects to CO.Variable._Unpack[this.mode].call(this, _propertyoptions, _skipsync);
 * @private
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable.prototype.unpackfunc=function(_propertyoptions, _skipsync) {
	return CO.Variable._Unpack[this.mode].call(this, _propertyoptions, _skipsync);
}

/**
 * this function return the value of the covariable as seen by another user whose _id is given. This only makes sense for CO.VMODES.SEPARATE variables which maintain different values for different users. all other variables will simply return their current value
 * this is a dummy mehtod that redirects to CO.Variable._Project[this.mode].call(this, _userid);
 * @private
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable.prototype.project=function(_userid) {
	return CO.Variable._Project[this.mode].call(this, _userid);
}

/**
 * covariables carry extra data such as maxhistorycount etc... this is the generic handler when changing one of this data
 * this function specializes to CO.Variable.extraDataSetFunc[_datum].call(this, _value, _skipsync); if a handler is registered for _datum
 * @private
 * @param {string} _datum the name of the property in the extra data to modify
 * @param {*} _value the new value for the datum
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.prototype.setExtraDatum=function(_datum, _value, _skipsync) {
	if (CO.Variable.extraDataSetFunc[_datum]) return CO.Variable.extraDataSetFunc[_datum].call(this, _value, _skipsync);

	if (!CO.VALIDEXTRADATA[_datum]) return;
	
	this.extraDatumChanged(_datum, _value, _skipsync);
}

/**
 * the default handler for extra data modifications when there are no specialized handlers in CO.Variable.extraDataSetFunc[]
 * @private
 * @param {string} _datum the name of the property in the extra data to modify
 * @param {*} _value the new value for the datum
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.prototype.extraDatumChanged=function(_datum, _value, _skipsync) {
	if (!this.extradata) this.extradata={};
	if (this.extradata[_datum]==_value) return false;

	this.extradata[_datum]=_value;

	this.repackEverything=true;
	if (!_skipsync) this.needSync();

	return true;
}

/** 
 * it sets the maxhistorycount property of the covariable which results in the covariable tracking its value change history and saving it on the server
 * shorthand for this.setExtraDatum("maxhistorycount", _maxhistorycount, false);
 * @public
 * @param {number} _maxhistorycount the number of entries to maintain in the history array
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.setHistory=function(_maxhistorycount) {
	this.setExtraDatum("maxhistorycount", _maxhistorycount, false);
	return this;
}

/**
 * set of functions that handle extraDatumChanged requests
 * @private
 */
CO.Variable.extraDataSetFunc={};

/**
 * process the extra data porion of the covariable (actual name CO.Variable.extraDataSetFunc["extradata"])
 * it will simply call setExtraDatum to each property in the _value
 * @function extraDataSetFunc.extradata
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {object} _value the object tha tcontains the extra data properties for this covariable
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.extraDataSetFunc["extradata"]=function(_value, _skipsync) { //this allows handling of extra data in flat and nested mode
	if (!_value) return false;
	for(var i in _value) {
		this.setExtraDatum(i, _value[i], _skipsync);
	}
	return true;
}

/**
 * set the maxhistorycount property (actual name CO.Variable.extraDataSetFunc["maxhistorycount"])
 * makes sure that _value is a non negative number and initializes the history storage array of the covariable if it doesn't exist already
 * @function extraDataSetFunc.maxhistorycount
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {number} _value the numebr of values to maintain in the history array at any time
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.extraDataSetFunc["maxhistorycount"]=function(_value, _skipsync) {
	if (isNaN(_value)) return false;
	if (_value<0) return false;
	if (_value>5000) _value=5000; //use a separate collection to store this object's history if you want to go over this limit
	if (!this.extraDatumChanged("maxhistorycount", _value, _skipsync)) return false;
	if (this.extradata.maxhistorycount) {
		if (!this.history) this.history=[];
		if (this.history.length>_value) this.history.splice(0, this.history.length-_value);
	}
	else {
		if (this.history) this.history.length=0;
	}
	return true;
}

/**
 * set the isref property (actual name CO.Variable.extraDataSetFunc["isref"])
 * sets the isref property of the covariable and makes sure the value of the covariable points to an object and its ref property to the object's reference Object
 * @function extraDataSetFunc.isref
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {boolean} _value if true this covariable should be converted into a reference type covariable
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.extraDataSetFunc["isref"]=function(_value, _skipsync) {
	if (!this.extraDatumChanged("isref", _value, _skipsync)) return false;

	if (_value) {
		if (this.val && CO.isObject(this.val)) {
			this.ref=CO.CO(this.val).getReference();
			this.ref.registerVar(this);
		}
		else {
			this.val=null;
			this.ref=null;
		}
	}
	else {
		if (this.ref) {
			this.ref.removeVar(this);
			delete this.ref;
		}
	}
	return true;
}

/**
 * set the history property (actual name CO.Variable.extraDataSetFunc["history"])
 * pushes all the objects in _values to the history stack of the covariable
 * @function extraDataSetFunc.history
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {Array.<*>} _value this array contains 1 or more of the most recent values for the covariable to be stored within its history array
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 * @returns {boolean} if true it means that the data were altered
 */
CO.Variable.extraDataSetFunc["history"]=function(_value, _skipsync) {
	if (!this.extradata || this.extradata.maxhistorycount<1) return false;
	if (!this.history) this.history=[];
	for(var i in _value) {
		this.history.push(_value[i]);
	}

	if (this.history.length>this.extradata.maxhistorycount) this.history.splice(0, this.history.length-this.extradata.maxhistorycount);

	return true;
}

/**
 * used primarily during intitialization of a covariable that has changed mode when we want to set some extra data to their default values only if they don't already exist
 * @private
 * @param {string} _datum the name of the property in the extra data to modify
 * @param {*} _value the new value for the datum
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.attachExtraDatumIfNotThere=function(_datum, _value) {
	if (!this.extradata) this.extradata={};
	if (!this.extradata.hasOwnProperty(_datum)) this.extradata[_datum]=_value;
	return this;
}

//TODO:
/*CO.Variable.prototype.toString=function() {
}

CO.Variable.prototype.toPath=function() {
}*/



/**
 * set of functions that handle Pack() for different variable modes
 * @private
 */
CO.Variable._Pack=[];
/**
 * set of functions that handle flatPack() for different variable modes
 * @private
 */
CO.Variable._FlatPack=[];
/**
 * set of functions that handle set() for different variable modes
 * @private
 */
CO.Variable._Set=[];
/**
 * set of functions that handle unPack() for different variable modes
 * @private
 */
CO.Variable._Unpack=[];
/**
 * set of functions that handle init() for different variable modes
 * @private
 */
CO.Variable._Init=[];
/**
 * set of functions that handle project() for different variable modes
 * @private
 */
CO.Variable._Project=[];

/**
 * used during onChange event propagation to make sure we don't visit the same event generator twice
 * @private
 * @param {module:cooplib~CO.ContextStack} _contextstack the context stack of the current event propagation
 */
CO.Variable.prototype.pushToContextStack=function(_contextstack) {
	return (_contextstack?_contextstack.push(this):(_contextstack=new CO.ContextStack(this)));
}

/**
 * dispatch the change event to all listeners for this covariable as well as the coobject that contains this covariable
 * @public
 * @param {module:cooplib~CO.ContextStack} _contextstack the context stack of the current event propagation
 * @param {object} _changedata contians information about the variable that triggered the change or the index of the array tha tchanged (if the covariable is of mode INSTANTARRAY)
 */
CO.Variable.prototype.dispatchChange=function(_contextstack, _changedata) {
	CO.dispatchEvent(this, "change", _changedata||this.val, this.pushToContextStack(_contextstack));
	this.cobj.dispatchChange(_contextstack, {v:this, data:_changedata||this.val});
}


/**
 * this function does nothing as CO.VMODES.NA variables are not synchronized and they don't require serialization
 * @function _Pack[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {null}
 */
CO.Variable._Pack[CO.VMODES.NA]=function() {
	return null;
}
/**
 * this function does nothing as CO.VMODES.NA variables are not synchronized and they don't require serialization
 * @function _FlatPack[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {null}
 */
CO.Variable._FlatPack[CO.VMODES.NA]=function() {
	return null;
}
/**
 * this function assigns a value to a CO.VMODES.NA variable. It does not trigger synchronization
 * @function _Set[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {*} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.NA]=function(_value, _contextstack) {
	if (_value==this.val) return;	//little optimizaton here. no need to sync if the value has not really changed 
	if (_contextstack && _contextstack.contains(this)) return; //this breaks cyclical linking of variables and avoids infinite loops

	if (this.isReference()) {
		if (this.setReferenceByObject(_value)) this.dispatchChange(_contextstack);
	}
	else {
		this.definiteSetValue(_value);
		this.dispatchChange(_contextstack);
	}
}
/**
 * this function does nothing as CO.VMODES.NA variables are not synchronized and they don't require serialization
 * @function _Pack[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.NA]=function(_propertyoptions, _skipsync) {
}
/**
 * this function does nothing as CO.VMODES.NA variables don't require any special initialization
 * @function _Init[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.NA]=function() {	
}
/**
 * simply return the value of the covariable as projection does not make any sense for CO.VMODES.NA
 * @function _Project[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.NA]=function(_userid) {
	return 	this.val;
}


/**
 * this function serializes a CO.VMODES.INSTANT covariable
 * @function _Pack[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.INSTANT]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.INSTANT covariable
 * @function _FlatPack[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.INSTANT]=function() {
	if (this.repackEverything)	{
		this.repackEverything=false;
		if (this.extradata) return {val: this.packValue(), mode:this.mode, extradata:this.extradata};
		else return {val: this.packValue(), mode:this.mode};
	}
	return {val: this.packValue()};
}
/**
 * this function assigns a value to a CO.VMODES.INSTANT variable. it dispatches the change event if the new value is different and queues the covariable for synchronization
 * @function _Set[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {*} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.INSTANT]=function(_value, _contextstack) {
	if (_value==this.val) return;	//little optimizaton here. no need to sync if the value has not really changed 
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	

	if (this.isReference()) {
		if (this.setReferenceByObject(_value)) {
			if (_contextstack && _contextstack.begunFromServerRequest()) //TODO: this is too restrictive for linked variables 
				this.removeFromSyncQ();
			else 
				this.needSync();

			this.dispatchChange(_contextstack);
		}
	}
	else {
		this.definiteSetValue(_value);
	
		if (_contextstack && _contextstack.begunFromServerRequest()) //TODO: this is too restrictive for linked variables 
			this.removeFromSyncQ();
		else 
			this.needSync();


		this.dispatchChange(_contextstack);
	}
}
/**
 * this function does nothing as CO.VMODES.INSTANT has no extra data
 * @function _Pack[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.INSTANT]=function(_propertyoptions, _skipsync) {
}
/**
 * this function does nothing as CO.VMODES.INSTANT variables don't require any special initialization
 * @function _Init[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.INSTANT]=function() {	
}
/**
 * simply return the vlaue of the variable (this variable looks the same to all the users)
 * @function _Project[CO.VMODES.INSTANT]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.INSTANT]=function(_userid) {
	return 	this.val;
}

/**
 * this function serializes a CO.VMODES.SEPARATE covariable
 * @function _Pack[CO.VMODES.SEPARATE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.SEPARATE]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.SEPARATE covariable
 * @function _FlatPack[CO.VMODES.SEPARATE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.SEPARATE]=function() {
	if (this.repackEverything)	{
		this.repackEverything=false;
		return {val:this.packValue(), mode:this.mode, extradata:this.extradata};
	}
	return {val:this.packValue()};
}
/**
 * this function assigns a value to a CO.VMODES.SEPARATE variable. it dispatches the change event if the new value is different and queues the covariable for synchronization
 * @function _Set[CO.VMODES.SEPARATE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {*} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.SEPARATE]=function(_value, _contextstack) {
	if (_value==this.val) return;	//little optimizaton here. no need to sync if the value has not really changed 
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	

	if (this.isReference()) {
		if (this.setReferenceByObject(_value)) {
			if (!_contextstack || !_contextstack.begunFromServerRequest())
			this.needSync();
		
			this.dispatchChange(_contextstack);
		}
	}
	else {
		this.definiteSetValue(_value);	

		if (!_contextstack || !_contextstack.begunFromServerRequest())
		this.needSync();

		this.dispatchChange(_contextstack);
	}

}
/**
 * for this type of variables we need to go through the list of user values attached to the incoming packet from the server in order to find
 * the value that corresponds to CO.me and at the same time populate the users list of this covariable with the others' values
 * @function _Pack[CO.VMODES.SEPARATE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.SEPARATE]=function(_propertyoptions, _skipsync) {
	if (_propertyoptions.users) {
		for(var i in _propertyoptions.users) {
			this.users[i]=_propertyoptions.users[i];
			if (i==CO.me._id)  this.unpackValue(_propertyoptions.users[i]); //this.set(_propertyoptions.users[i].val, CO.ContextStack.fromServer());
		}
	}
}
/**
 * this function ensures the existence of the users list for this covaribale as well as the syncdata property for the extradata
 * @function _Init[CO.VMODES.SEPARATE]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.SEPARATE]=function() {
	this.attachExtraDatumIfNotThere("syncdata", true);
	this.users={};
}

/**
 * if the userid exists in the list of user values for this covariable then return the value from that list. Otherwise return the current value for CO.me
 * @function _Project[CO.VMODES.NA]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.SEPARATE]=function(_userid) {
	if (this.users && this.users[_userid]) return this.users[_userid].val;
	return this.val;
}



/**
 * this function serializes a CO.VMODES.INSTANTARRAY covariable
 * @function _Pack[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.INSTANTARRAY]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.INSTANTARRAY covariable
 * for this type of variable the returned object contains a length property with the total length of the array associated with this covariable
 * plus a list of syncElements that is the array entries that need to be resynced indexed by their indices. e.g. {"1":0.5, "35": 2.8, "67": "some other value"}
 * @function _FlatPack[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.INSTANTARRAY]=function() {
	var pack={};

	if (this.repackEverything)	{
		this.repackEverything=false;
		pack.mode=this.mode;
		if (this.extradata) pack.extradata=this.extradata;
	}

	pack.length=this.length;

	if (this.syncElements=="all") {
		pack.val=this.val;
		pack.syncAll=true;
	}
	else pack.val=this.syncElements;

	this.syncElements={};

	//console.log("pack:");
	//console.log(pack);
	return pack;
}
/**
 * this function assigns a value to a CO.VMODES.INSTANTARRAY variable. it dispatches the change event if the new value is different and queues the covariable for synchronization
 * this replaces the whole array referenced by this variable and will trigger a complete resync. Consider using setAt to modify only parts of the array reducing network traffic
 * @function _Set[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {Array.<*>} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.INSTANTARRAY]=function(_value, _contextstack) {
	if (_value==this.val) return;	//little optimizaton here. no need to sync if the value has not really changed 
	if (!_value || !CO.isArray(_value)) return;
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	

	this.definiteSetValue(_value);

	if (_contextstack && _contextstack.begunFromServerRequest()) //TODO: this is too restrictive for linked variables 
		this.removeFromSyncQ();
	else 
		this.resyncAll();// this.needSync();

	this.dispatchChange(_contextstack, {array:this.val, i:"all"});
}
/**
 * retrieve the length property to find out if the the length of the array should change. Also if the syncAll flag is set in the _propertyoptions then do an array replace otherwise use setMultiple() to
 * update only the values at seletced indices
 * @function _Pack[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.INSTANTARRAY]=function(_propertyoptions, _skipsync) {
	if (_propertyoptions.hasOwnProperty("length")) {
		this.length=_propertyoptions.length;
	}

	if (_propertyoptions.syncAll) {		
		this.set(_propertyoptions.val, CO.ContextStack.fromServer());
	}
	else {
		this.setMultiple(_propertyoptions.val, CO.ContextStack.fromServer());
	}
}

/**
 * this function ensures the existence of the syncElements list for this covaribale as well as augmenting the covariable with methods that are usefull to an array type covariable like setAt and setMultiple
 * which allow partial synchronization of the array's values
 * @function _Init[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.INSTANTARRAY]=function() {
	this.syncElements={};


	this.setAt=CO.Variable._setAt;
	this.setMultiple=CO.Variable._setMultiple;
	this.getAt=CO.Variable._getAt;
	this.resyncAll=CO.Variable._resyncAll;
	this.markForResync=CO.Variable._markForResync;


	if (!this.val || !CO.isArray(this.val)) this.val=[];

	var that=this;
	Object.defineProperty(this, "length", {
								get : function(){ return (that.val.length); },
								set : function(_newValue){ 
									that.val.length=_newValue; 
									that.resyncAll();
								},
								enumerable : true,
								configurable : true}
							   );
}
/**
 * simply return the vlaue of the variable (this variable looks the same to all the users)
 * @function _Project[CO.VMODES.INSTANTARRAY]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.INSTANTARRAY]=function(_userid) {
	return 	this.val;
}

/**
 * this method allows you to modify a single element in the array and takes care of dispatching the partial change event as well as setting the synchronization flags
 * so that only the altered elements are sent to the server. This should be the prefered method of altering specific elements in the array instead of using the [] poerator as setAt() will ensure event dispatching and synchronization
 * @function setAt
 * @public
 * @memberof module:cooplib~CO.Variable
 * @instance
 * @param {number} _i the index of the element to modify
 * @param {*} _val the new value
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
	 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable._setAt=function(_i, _val, _contextstack) {
	if (_i<0 || _i>this.length) return;
	if (this.val[_i]==_val) return;

	this.val[_i]=_val;
	if (this.syncElements!="all") this.syncElements[_i]=_val;
	this.needSync();
	this.dispatchChange(_contextstack, {array:this.val, val:_val, i:_i});

	return this;
}

/**
 * this method allows you to modify multiple elements in athe array and queue them for synchronization
 * @function setMultiple
 * @public
 * @memberof module:cooplib~CO.Variable
 * @instance
 * @param {object} _pairs an indexed list of new values of the form {"1":val1, "5":val2 ... } 
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
	 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable._setMultiple=function(_pairs, _contextstack) {
	if (!_pairs) return;

	var changed=false;

	for (var i in _pairs) {
		if (this.val[i]==undefined || this.val[i]==_pairs[i]) continue;
		this.val[i]=_pairs[i];
		changed=true;
		if (this.syncElements!="all") this.syncElements[i]=_pairs[i];
	}		

	if (changed) {
		this.needSync();
		this.dispatchChange(null, {array:this.val, val:_val, i:_i});
	}

	return this;
}

/**
 * get the value at a specific index. It is equivalent to using the [] operator on the actual variable
 * @function getAt
 * @public
 * @memberof module:cooplib~CO.Variable
 * @instance
 * @param {number} _i the index of the value to be retrieved
	 * @returns {*} the value at position _i
 */
CO.Variable._getAt=function(_i) {
	if (_i<0 || _i>this.length) return null;
	return this.val[_i];
}

/**
 * this method marks the whole array for resync setting the syncElements to "all" and calling the needSync function
 * @function resyncAll
 * @public
 * @memberof module:cooplib~CO.Variable
 * @instance
	 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable._resyncAll=function() {
	this.syncElements="all";
	this.needSync();
	return this;
}	

/**
 * mark a single element for resync
 * @function markForResync
 * @public
 * @memberof module:cooplib~CO.Variable
 * @instance
 * @param {number} _i the index of the element that needs resync
	 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable._markForResync=function(_i) {
	if (_i<0 || _i>this.length) return;
	this.syncElements[_i]=this.val[_i];
	this.needSync();
	return this;
}	

/**
 * this function serializes a CO.VMODES.USERAVERAGE covariable
 * @function _Pack[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.USERAVERAGE]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.USERAVERAGE covariable
 * the value that is packed is the localValue and not the actual value of the covariable which will be set from the server to the new user average
 * @function _FlatPack[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.USERAVERAGE]=function() {
	if (this.repackEverything)	{
		this.repackEverything=false;
		return {val:this.localValue, mode:this.mode, extradata:this.extradata};
	}
	return {val:this.localValue};
}
/**
 * this function assigns a value to a CO.VMODES.USERAVERAGE variable. if the incoming value came from the server then it replaces the val property of the covariable
 * otherwise it replaces the localCalue and triggers a resync so that the server should register the change and recalculate the average
 * @function _Set[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {number} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.USERAVERAGE]=function(_value, _contextstack) {	
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	if (isNaN(_value)) return;

	
	if (_contextstack && _contextstack.isServerRequest()) {
		if (_value==this.val) return;

		this.definiteSetValue(_value);
		this.dispatchChange(this.pushToContextStack(_contextstack));
	}
	else {
		if (this.localValue==_value) return;
		this.localValue=_value;
		this.needSync();
	}
}
/**
 * retrieve the list of user values and update the users property of this covariable
 * @function _Pack[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.USERAVERAGE]=function(_propertyoptions, _skipsync) {
	if (_propertyoptions.users) {
		for(var i in _propertyoptions.users) {
			this.users[i]=_propertyoptions.users[i];
		}
	}
}
/**
 * this function ensures the existence of the users and localValue properties as well as the syncdata in the extradata
 * which allow partial synchronization of the array's values
 * @function _Init[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.USERAVERAGE]=function() {
	this.attachExtraDatumIfNotThere("syncdata", true);
	this.users={};
	this.localValue=this.val;
}
/**
 * simply return the vlaue of the variable (this variable looks the same to all the users)
 * @function _Project[CO.VMODES.USERAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.USERAVERAGE]=function(_userid) {
	return this.val;
}


/**
 * this function serializes a CO.VMODES.ALLTIMEAVERAGE covariable
 * @function _Pack[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.ALLTIMEAVERAGE]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.ALLTIMEAVERAGE covariable
 * the value that is packed is the localValue and not the actual value of the covariable which will be set from the server to the new user average
 * @function _FlatPack[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.ALLTIMEAVERAGE]=function() {
	if (this.repackEverything)	{
		this.repackEverything=false;
		return {val:this.localValue, mode:this.mode, extradata:this.extradata};
	}
	return {val:this.localValue};
}
/**
 * this function assigns a value to a CO.VMODES.ALLTIMEAVERAGE variable. if the incoming value came from the server then it replaces the val property of the covariable
 * otherwise it replaces the localCalue and triggers a resync so that the server should register the change and recalculate the average
 * @function _Set[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {number} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.ALLTIMEAVERAGE]=function(_value, _contextstack) {
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	if (isNaN(_value)) return;
	
	if (_contextstack && _contextstack.isServerRequest()) {
		if (_value==this.val) return;

		this.definiteSetValue(_value);
		this.dispatchChange(_contextstack);
	}
	else {
		this.localValue=_value;
		this.needSync();
	}
}
/**
 * retrieve the list of past values used for the calculation of the average. Also make sure the list stays at a max length of maxcount
 * @function _Pack[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.ALLTIMEAVERAGE]=function(_propertyoptions, _skipsync) {
	if (_propertyoptions.values) {
		for(var i=0; i!==_propertyoptions.values.length; ++i) {
			this.values.push(_propertyoptions.values[i]);
		}
		if (this.values.length>this.extradata.maxcount) this.values.splice(0, this.values.length-this.extradata.maxcount);
	}
}
/**
 * this function ensures the existence of the vallues and localValue properties as well as the syncdata and maxcount in the extradata
 * which allow partial synchronization of the array's values
 * @function _Init[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.ALLTIMEAVERAGE]=function() {
	this.attachExtraDatumIfNotThere("syncdata", true);
	this.attachExtraDatumIfNotThere("maxcount", 10);

	this.values=[];
	this.localValue=this.val;
	this.repackEverything=true;
}

/**
 * simply return the vlaue of the variable (this variable looks the same to all the users)
 * @function _Project[CO.VMODES.ALLTIMEAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.ALLTIMEAVERAGE]=function(_userid) {
	return this.val;
}

/**
 * this function serializes a CO.VMODES.ROLLINGAVERAGE covariable
 * @function _Pack[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._Pack[CO.VMODES.ROLLINGAVERAGE]=function() {
	return {result:CO.RESULTS.DISCARD, packet:this.flatPack()};
}
/**
 * this function serializes the contents of a CO.VMODES.ROLLINGAVERAGE covariable
 * the value that is packed is the localValue and not the actual value of the covariable which will be set from the server to the new user average
 * @function _FlatPack[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @returns {object}
 */
CO.Variable._FlatPack[CO.VMODES.ROLLINGAVERAGE]=function() {
	if (this.repackEverything)	{
		this.repackEverything=false;
		return {val:this.localValue, mode:this.mode, extradata:this.extradata};
	}
	return {val:this.localValue};
}
/**
 * this function assigns a value to a CO.VMODES.ROLLINGAVERAGE variable. if the incoming value came from the server then it replaces the val property of the covariable
 * otherwise it replaces the localCalue and triggers a resync so that the server should register the change and recalculate the average
 * @function _Set[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {number} _value the new value to set
 * @param {module:cooplib~CO.ContextStack} [_contextstack] the context stack of the current event propagation
 */
CO.Variable._Set[CO.VMODES.ROLLINGAVERAGE]=function(_value, _contextstack) {	
	if (_contextstack && CO.contains(_contextstack, this)) return; //this breaks cyclical linking of variables and avoids infinite loops
	if (isNaN(_value)) return;

	if (_contextstack && _contextstack.isServerRequest()) {
		if (_value==this.val) return;

		this.definiteSetValue(_value);
		this.dispatchChange(_contextstack);
	}
	else {
		this.localValue=_value;
		this.needSync();
	}
}
/**
 * nothing to do
 * @function _Pack[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {module:cooplib~CO.App~syncedProperty} _propertyoptions the covariable options to change
 * @param {boolean} [_skipsync] if true the covariable will not be marked for server synchronization (this is used when covariable properties change as a result to a server package)
 */
CO.Variable._Unpack[CO.VMODES.ROLLINGAVERAGE]=function(_propertyoptions, _skipsync) {
}
/**
 * this function ensures the existence of the localValue property as well as the syncdata and factor in the extradata
 * which allow partial synchronization of the array's values
 * @function _Init[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 */
CO.Variable._Init[CO.VMODES.ROLLINGAVERAGE]=function() {
	this.attachExtraDatumIfNotThere("syncdata", true);
	this.attachExtraDatumIfNotThere("factor", 0.9);

	this.localValue=this.val;
	this.repackEverything=true;
}
/**
 * simply return the vlaue of the variable (this variable looks the same to all the users)
 * @function _Project[CO.VMODES.ROLLINGAVERAGE]
 * @private
 * @memberof module:cooplib~CO.Variable
 * @param {string} _userid the user _id for this covariable
 * @returns {*} the value of this covariable as seen by another user
 */
CO.Variable._Project[CO.VMODES.ROLLINGAVERAGE]=function(_userid) {
	return this.val;
}

/**
 * check if the covariable has a mode that requires synchrinuzation that is its mode is not CO.VMODES.NA
 * @public
 * @returns {boolean}
 */
CO.Variable.prototype.isSynced=function() {
	return (this.mode>CO.VMODES.NA);
}

/**
 * mark this covariable for synchronization on the next cycle, append it to the syncQ of its container Coobject and mark the coobject and its scope for resync too
 * @public
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.needSync=function() {
	if (!this.isSynced()) return this; 

	this.cobj.needSync();	
	if (!this.cobj.syncVarQ) this.cobj.syncVarQ={};
	this.cobj.syncVarQ[this.property]=this;

	return this;
}

/**
 * remove a covariable from the synchronization Queue. Covariables are automatically removed from that queue when they receive new values form the server or send their current values to the server
 * @public
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.removeFromSyncQ=function() {
	if (!this.isSynced()) return; 

	if (this.cobj.syncVarQ) 
		delete this.cobj.syncVarQ[this.property];

	return this;
}

/**
 * check if the value of the covariable has changed and if it does use the set method to update it. This is for volatile variables that do not use the getter setter mechanics and instead are checked 
 * at regular intervals for changes (this mechanism is not fully implemented yet)
 * @public
 */
CO.Variable.prototype.check=function() {
	var v=this.getValue();
	if (v==this.val) return; //Check composite vars?
	this.set(v);
}

/**
 * get the value of the covariable. Accessor method that returns this.val
 * @public
 * @returns {*}
 */
CO.Variable.prototype.get=function() {
	return this.val;
}

/**
 * attach a listener for the change event of this variable. the _callback function will be triggered any time the vlaue of the covariable changes
 * @public
 * @param {object} [_targetobject] an object attached to the event object as it propagates. Can be null
 * @param {module:cooplib~CO.EventDispatcher~eventCallback} _callbak the event handler function
 * @returns {module:cooplib~CO.Variable} the covariable "this" in order to be used in chained function calls
 */
CO.Variable.prototype.onChange=function(_targetobject, _callbak) {
	CO.addEventListener(this, "change", _targetobject, _callbak)
	return this;
}

/** releases a covaribale detaching it from its coobject and restoring the associated property removing the getter setter functions
 * @public
 * @todo not yet implemented
 */
CO.Variable.prototype.release=function() {

}


//.............................................Variable Linking mechanics

/**
 * create the property pointer and optimize its set and get funcotins depending on whether it is a top level property or a nested one
 * @class
 * @classdesc a property pointer is a class that contians an object and a property path within that object (e.g. "a.b.x"). Numbers are allowed in the path to designate array elements. (e.g. "a.b.5" would set the property _obj.a.b[5])
 * unlike covariables it does not need to convert the objetc into a coobject and the property itself is not replaced by getter setter methods.
 * therefore this property is much faster to set as it doesn't fire onChange events and it doesn't have all the overhead of a covariable
 * it is intended as a lightweight target for one way links from covariables
 * @public
 * @param {object} _obj the object within which the property lies
 * @param {string} _property the name or path to the property
 */
CO.PropertyPointer=function(_obj, _property) {
	this.object=_obj;
	this.property=_property;

	this.set=null;

	var n=_property.split(".");

	if (n.length>1)  {
		var vv=_obj;
		this.set=function(_value) {
			vv=_obj;
			for(var i=0; i<n.length-1; ++i) {
				if (vv===undefined) return;
				vv=vv[n[i]];
			}
			vv[n[n.length-1]]=_value;
		}


		this.get=function() {
			vv=_obj;
			for(var i=0; i<n.length-1; ++i) {
				if (vv===undefined) return null;
				vv=vv[n[i]];
			}
			return vv[n[n.length-1]];
		}
	}
	else {
		this.set=function(_value) {_obj[_property]=_value;};

		this.get=function() {return _obj[_property];};
	}

}


/**
 * register this link with both covariables and do the proper addition of event listeners for their "change" events
 * @class
 * @classdesc a link between two covariables allows their values to be coordinated when either of them changes.
 * the simplest link is a bidirectional link with no transforms which means that the two variables linked will always have the same value
 * the link can be one way in which case when varibale A changes variable B follows but when B changes A is unaffected
 * finally a link can have a transformation function in either direction. A transformation function modifies the value of the changed variable before applied to the receiving variable
 * any function that takes one argument as an input and returns another can be sued as a transform
 * @public
 * @param {module:cooplib~CO.Variable} _v1 the first covariable to link
 * @param {module:cooplib~CO.Variable} _v2 the second covariable to link
 * @param {boolean} [_oneway] if set to true the link goes only one way from A to B
 * @param {function} [_transformA2B] the transformaiton to apply to the value of A when it changes before assigning it to B
 * @param {function} [_transformB2A] the transformaiton to apply to the value of B when it changes before assigning it to A
 */
CO.VariableLink=function(_v1, _v2, _oneway, _transformA2B, _transformB2A) {
	/** the first covariable
		* @public 
		* @type {module:cooplib~CO.Variable}*/
	this.var1=_v1;
	/** the second covariable or property pointer (property pointers work only in one way connections)
		* @public 
		* @type {module:cooplib~CO.Variable | module:cooplib~CO.PropertyPointer}*/
	this.var2=_v2;


	/** if set this is a one way link
		* @private 	
		* @member {boolean} oneway
		* @instance
		* @memberof module:cooplib~CO.VariableLink*/

	/** if set this function is applied to the value of A before it is assigned to B
		* @private 	
		* @member {function} A2B
		* @instance
		* @memberof module:cooplib~CO.VariableLink*/

	/** if set this function is applied to the value of B before it is assigned to A
		* @private 	
		* @member {function} B2A
		* @instance
		* @memberof module:cooplib~CO.VariableLink*/

	if (_oneway) this.oneway=_oneway;
	if (_transformA2B)	this.A2B=_transformA2B;
	if (_transformB2A)	this.B2A=_transformB2A;
	

	if (this.oneway) {
		this.var1.links.push(this);

		if (this.var2.links) {//var2 is not property pointer
			if (this.A2B) {
				this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2BWithTransform);
				this.var2.set(this.A2B(this.var1.get()));
			}
			else {
				this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2B);
				this.var2.set(this.var1.get());
			}

			
		}
		else {
			if (this.A2B) {
				this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2BpropWithTransform);
				this.var2.set(this.A2B(this.var1.get()));
			}
			else {
				this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2Bprop);
				this.var2.set(this.var1.get());
			}
		}

	}
	else {
		if (this.A2B) {
			this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2BWithTransform);
			this.var2.set(this.A2B(this.var1.get()));
		}
		else {
			this.var1.onChange(this, CO.VariableLink.defaultLinkFunctionA2B);
			this.var2.set(this.var1.get());
		}

		if (this.B2A) this.var2.onChange(this, CO.VariableLink.defaultLinkFunctionB2AWithTransform);
		else this.var2.onChange(this, CO.VariableLink.defaultLinkFunctionB2A);

		this.var1.links.push(this);
		this.var2.links.push(this);

		
	}

	
}


/**
 * default behaviour when linking two covariables from A to B with no transform
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable A changes
 */
CO.VariableLink.defaultLinkFunctionA2B=function(e) {
	e.target.var2.set(e.target.var1.get(), e.contextstack);
}

/**
 * default behaviour when linking two covariables from B to A with no transform
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable B changes
 */
CO.VariableLink.defaultLinkFunctionB2A=function(e) {
	e.target.var1.set(e.target.var2.get(), e.contextstack);
}

/**
 * default behaviour when linking two covariables from A to B with transform
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable A changes
 */
CO.VariableLink.defaultLinkFunctionA2BWithTransform=function(e) {
	e.target.var2.set(e.target.A2B(e.target.var1.get()), e.contextstack);
}

/**
 * default behaviour when linking two covariables from B to A with transform
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable B changes
 */
CO.VariableLink.defaultLinkFunctionB2AWithTransform=function(e) {
	e.target.var1.set(e.target.B2A(e.target.var2.get()), e.contextstack);
}

/**
 * default behaviour when linking a covariable to a pointer property
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable A changes
 */
CO.VariableLink.defaultLinkFunctionA2Bprop=function(e) {
	e.target.var2.set(e.target.var1.get());
}


/**
 * default behaviour when linking a covariable to a pointer property with transform
 * @private
 * @param {module:cooplib~CO.EventDispatcher#event:eventObject} e the event object that has been emmitted after variable A changes
 */
CO.VariableLink.defaultLinkFunctionA2BpropWithTransform=function(e) {
	e.target.var2.set(e.target.A2B(e.target.var1.get()));
}


/**
 * create a bidirectional link between two properties of an object. This function will convert the object to a coobject and 
 * create the covariables corresponding to the properties to be linked if they dn't already exist
 * @public
 * @param {object} _obj1 the object that contains the first property
 * @param {string} _property1 the name of the first property
 * @param {object} _obj2 the object that contains the second property
 * @param {string} _property2 the name of the second property
 * @param {function} [_transformA2B] the transformaiton to apply to the value of A when it changes before assigning it to B
 * @param {function} [_transformB2A] the transformaiton to apply to the value of B when it changes before assigning it to A
 * @returns {module:cooplib~CO.VariableLink} the newly created link between the two variables
 * @example <caption>Example usage of variable linking</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * var b={f:2.3, g:4.5};
 * CO.linkVariables(a, "x", b, "f");
 * a.x=4.0; //it will also change b.f to 4.0
 * @example <caption>Example usage of variable linking with transform</caption>
 * var a={x:1.5, y:5.8, text:"hello"};
 * var b={f:2.3, g:4.5};
 * CO.linkVariables(a, "x", b, "f", function(_d){return 10*_d;}, , function(_d){return 0.1*_d;});
 * a.x=4.0; //b.f will become 40 because of the 10x trasnform
 */
CO.linkVariables=function(_obj1, _property1, _obj2, _property2, _transformA2B, _transformB2A) {
	var v1=CO.getVariable(_obj1, _property1);
	var v2=CO.getVariable(_obj2, _property2);

	if (!v1 || !v2) return null;
	if (v1==v2) return null;

	//!!!!!make sure we are not ading a duplicate link

	return new CO.VariableLink(v1, v2, false, _transformA2B, _transformB2A);
}

/**
 * create a unidirectional link between two properties of an object. This function will convert the object to a coobject and 
 * create the covariables corresponding to the properties to be linked if they dn't already exist
 * @public
 * @param {object} _obj1 the object that contains the first property
 * @param {string} _property1 the name of the first property
 * @param {object} _obj2 the object that contains the second property
 * @param {string} _property2 the name of the second property
 * @param {function} [_transformA2B] the transformaiton to apply to the value of A when it changes before assigning it to B
 * @returns {module:cooplib~CO.VariableLink} the newly created link between the two variables
 */
CO.linkVariablesOneWay=function(_obj1, _property1, _obj2, _property2, _transformA2B) {
	var v1=CO.getVariable(_obj1, _property1);
	var v2=CO.getVariable(_obj2, _property2);

	if (!v1 || !v2) return null;
	if (v1==v2) return null;

	return new CO.VariableLink(v1, v2, true, _transformA2B, null);
}



/**
 * create a unidirectional link between two properties of an object. This function will convert the object1 to a coobject and 
 * create the covariables corresponding to the properties to be linked if they don't already exist. object2 and property 2 won't be affected instead an indepedent propertyPointer will be created (see: {@link module:cooplib~CO.PropertyPointer CO.PropertyPointer})
 * @public
 * @param {object} _obj1 the object that contains the first property
 * @param {string} _property1 the name of the first property
 * @param {object} _obj2 the object that contains the second property
 * @param {string} _property2 the name of the second property
 * @param {function} [_transformA2B] the transformaiton to apply to the value of A when it changes before assigning it to B
 * @returns {module:cooplib~CO.VariableLink} the newly created link between the two variables
 */
CO.linkVariableToPropertyPointerOneWay=function(_obj1, _property1, _obj2, _property2, _transformA2B) {
	var v1=CO.getVariable(_obj1, _property1);
	var v2=new CO.PropertyPointer(_obj2, _property2);

	if (!v1 || !v2) return null;	

	return new CO.VariableLink(v1, v2, true, _transformA2B, null);
}



//.......................................................Login mechanics
CO.LoginBox=function() {

	this.div=CO.quickAddElement(document.body, "div", null, "loginbox");

	var that=this;

	this.signInDiv=CO.quickAddElement(this.div, "div", "signOpen", "signIn");

	this.signInDiv.onmousedown=function(_e) {
		that.signInDiv.className="signOpen";
		that.signUpDiv.className="signClosed";
	}

	this.signUpDiv=CO.quickAddElement(this.div, "div", "signClosed", "signUp");

	this.signUpDiv.onmousedown=function(_e) {
		that.signInDiv.className="signClosed";
		that.signUpDiv.className="signOpen";
	}
}



CO.LoginBox.prototype.show=function(_callback) {
	this.div.visibility="visible";
}

CO.LoginBox.prototype.hide=function() {
	this.div.visibility="hidden";
}

CO.loginDiv=null;

CO.openDefaultLoginBox=function(_callback) {
	if (!CO.loginDiv)
		CO.loginDiv=new CO.LoginBox();

	CO.loginDiv.show(_callback);
}