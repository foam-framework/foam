/*
 * Copyright 2013 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

withFOAM(function() {
    var header = $('header');
    var footer = $('footer');
    var search = $('search');
    var browse = $('browse');
    var edit   = $('edit');

    var reversed = false;

    function pos(e, top, left, width, height) {
        var s = e.style;
        left = left || 0;

        if ( reversed ) left = (window.innerWidth - 15) - left - (width || toNum(e.style.width));

        top != null && (e.style.top = toNum(top) + 'px');
        left != null && (e.style.left = toNum(left) + 'px');
        width != null && (e.style.width = toNum(width) + 'px');
        height != null && (e.style.height = toNum(height) + 'px');
    }

    var MIN_THREE_COLUMN_W = 1600;
    var table;

    function layout() {
        var W         = window.innerWidth - 15;
        var H         = window.innerHeight-5;
        var HEADER_H  = 60;
        var FOOTER_H  = 23;
        var SEARCH_W  = 400;
        var SEARCH_H  = H - HEADER_H - FOOTER_H;
        var RIGHT_W   = W - SEARCH_W - 5;

        pos(header,null,null,W,HEADER_H-10);
        pos(search, HEADER_H, null, SEARCH_W, SEARCH_H);

        if ( W > MIN_THREE_COLUMN_W ) {
            pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W * 0.6, SEARCH_H);
            pos(edit, HEADER_H, SEARCH_W + 10 + RIGHT_W * 0.6, RIGHT_W * 0.4-10, SEARCH_H-15);
        } else {
            pos(browse, HEADER_H, SEARCH_W + 10, RIGHT_W, SEARCH_H/2);
            pos(edit,
                toNum(browse.style.top) + toNum(browse.style.height) + 5,
                SEARCH_W + 10,
                RIGHT_W-10,
                SEARCH_H / 2 -20);
        }
        pos(footer, H-FOOTER_H, null, W, FOOTER_H);

        table && table.layout();
    }

    window.onresize = layout;
    layout();

    //    var dao = StorageDAO.create({model: EMail});

    emails = IDBDAO.create({model: EMail});

    $('loadmbox').onchange = function (event) {
        emails.removeAll(); // this only works with storagedao2 because its synchronous
        var file = event.target.files[0];
        var reader =
            FullReader.create(
                LineBasedReader.create(
                    TextReader.create(
                        BlobReader.create(file))));
        MBOXLoader.dao = emails;
        reader.read(MBOXLoader);
    };

    $('socketload').onclick = function(event) {
        emails.removeAll();
        var sockets = SocketManager.create();
        var withSocket = sockets.get('tcp:localhost:1234');
        withSocket(function(socket) {
            var reader =
                FullReader.create(
                    LineBasedReader.create(
                        TextReader.create(
                            AsBlobReader.create(
                                SocketReader.create(socket)))));
            MBOXLoader.dao = emails;
            reader.read(MBOXLoader);
        });
    };

    var emailarray = [];
    emailarray.eof = function() {
       var dao = MDAO.create({model: EMail});

        dao.bulkLoad(emailarray);
        dao.addIndex(EMail.TO);
        dao.addIndex(EMail.FROM);
        dao.addIndex(EMail.SUBJECT);

        table = ScrollBorder.create({
            view: TableView.create({
                model: EMail,
                dao: dao,
                rows: 20
            }),
            dao: dao
        });

        var searchSubject = TextSearchView.create({width:57, label: 'Search', property: CONCAT(EMail.SUBJECT, EMail.BODY)});
        var byTo = GroupBySearchView.create({size: 9, dao: dao, property: EMail.TO});
        var byFrom = GroupBySearchView.create({size: 11, dao: dao, property: EMail.FROM});
        var byLabel = GroupBySearchView.create({size: 6, dao: dao, property: EMail.LABELS});

        browse.innerHTML = table.toHTML();
        searchSubject.insertInElement('subjectSearch');
        byTo.insertInElement('toSearch');
        byFrom.insertInElement('fromSearch');
        byLabel.insertInElement('labelSearch');

        table.initHTML();

        table.view.selection.addListener(function (src, property, oldValue, newValue) {
            if ( ! newValue ) return;
            var editView = SummaryView.create({value: table.view.selection});
            editView.model = EMail;
            edit.innerHTML = editView.toHTML();
            editView.initHTML();
        });

        table.view.selection.set(table.view.objs[0]);

        layout();

        function updateQuery() {
            var predicate = AND(
                searchSubject.predicate,
                byFrom.predicate,
                byTo.predicate,
                byLabel.predicate).partialEval();

            console.log('query: ', predicate.toSQL());

            table.scrollbar.value = 0;
            table.dao = dao.where(predicate);

            byFrom.filter  = AND(searchSubject.predicate, byTo.predicate,   byLabel.predicate).partialEval();
            byTo.filter    = AND(searchSubject.predicate, byFrom.predicate, byLabel.predicate).partialEval();
            byLabel.filter = AND(searchSubject.predicate, byTo.predicate,   byFrom.predicate).partialEval();
        }

        Events.dynamicFn(function() {
            searchSubject.predicate;
            byFrom.predicate;
            byTo.predicate;
            byLabel.predicate;
        },
                       updateQuery);

        $("resetSearch").onclick = function() {
            byFrom.view.value.set(''); byTo.view.value.set(''); byLabel.view.value.set('');
            byFrom.filter = byTo.filter = byLabel.filter = TRUE;
            table.dao = dao;
        };
    };
    emails.select(emailarray);
});
