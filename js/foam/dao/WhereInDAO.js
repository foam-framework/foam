CLASS ({
    package: 'foam.dao',
    name: 'WhereInDAO',
    extendsModel: 'foam.dao.ProxyDAO',
    documentation: {/*As a DAO changes, load referenced (foreign-key) data.  Useful when a selectAll on foreign table would bring in too much data. Only that which is referenced, and not already loaded, is retrieved.*/},

    properties: [
        {
            help: 'Changes to this DAO will trigger a query from sourceDAO into the sinkDAO',
            model_: 'foam.core.types.DAOProperty',
            name: 'listenDAO',
            required: true,
            onDAOUpdate: 'onDAOUpdate',
        },
        {
            help: 'DAO where data will be queried from',
            model_: 'foam.core.types.DAOProperty',
            name: 'sourceDAO',
            required: true,
        },
        {
            help: 'Alias for delegate. DAO where source data will be read into',
            name: 'sinkDAO',
            required: true,
            setter: function(arg) { this.delegate = arg; },
            getter: function() { return this.delegate; }
        },
        {
            help: 'MAP function used to build IN value list from listenDAO entries',
            model_: 'FunctionProperty',
            name: 'mapFn',
            defaultValue: IDENTITY,
        },
        {
            help: 'Property matched against IN values. For example: IN(match, [...])',
            model_: 'Property',
            name: 'match',
            required: true,
        },
        {
            help: 'Post process the values of the mapFn',
            model_: 'FunctionProperty',
            name: 'valuesFn',
            defaultValue: IDENTITY
        }
    ],
    methods: {
        select: function(sink, options) {
            var future = afuture();
            this.listenDAO.select(MAP(this.mapFn))(function(keys) {
                if (keys && keys.arg2 && keys.arg2.length > 0) {
                    var requested = this.valuesFn(keys.arg2);
                    //console.log('WhereInDAO '+this.sinkDAO.model.name+' requested: '+requested.length);
                    this.sinkDAO.where(IN(this.match, requested)).select(MAP(this.match))(function(existing) {
                        var missing = requested;
                        if (existing && existing.arg2 && existing.arg2.length > 0) {
                            //console.log('WhereInDAO '+this.sinkDAO.model.name+' existing: '+existing.arg2.length);
                            missing = requested.filter(function(e) {
                                return existing.arg2.indexOf(e) < 0;
                            });
                        }
                        //console.log('WhereInDAO '+this.sinkDAO.model.name+' missing: '+missing.length);
                        if (missing.length > 0) {
                            this.sourceDAO.where(IN(this.match, missing)).select(this.sinkDAO)(function() {
                                this.sinkDAO.select(sink, options)(future.set);
                            }.bind(this));
                        } else {
                            sink && sink.eof && sink.eof();
                            future.set(sink);
                        }
                    }.bind(this));
                } else {
                    sink && sink.eof && sink.eof();
                    future.set(sink);
                }
            }.bind(this));
            return future.get;
        },
    },
    listeners: [
        {
            name: 'onDAOUpdate',
            isFramed: true,
            code: function() {
                this.select([].sink);
            }
        }
    ]
});
