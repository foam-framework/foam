/**
 * @license
 * Copyright 2012 Google Inc. All Rights Reserved.
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

aseq(
  arequire('foam.dao.IDBDAO'),
  arequire('foam.dao.CachingDAO')
)(function() {

var NUM_ALBUMS = 1000;
var NUM_PHOTOS = 10000;

var DEBUG = false;

if ( DEBUG ) {
  NUM_ALBUMS = 5;
  NUM_PHOTOS = 25;
  Function.prototype.put = function() {
    console.log.apply(console, arguments);
    this.apply(this, arguments);
  };
}

function randomBoolean() { return Math.random() > 0.5; }

function randomDate() { return new Date(Date.now() - Math.random()*1000*60*60*24*365*3); }

function randomAlbum(i) {
  return Album.create({
    id: i.toString(),
    timestamp: randomDate(),
    isLocal: randomBoolean()
  });
}

function randomPhoto(albumId, i) {
  return Photo.create({
     id:      i.toString(),
     albumId: albumId.toString(),
     hash:    Math.floor(Math.random()*10000),
     timestamp: randomDate(),
     isLocal: randomBoolean()
   });
}

function atest(name, test) {
  return atime(name, aseq(test, function(ret, arg) {
     if ( DEBUG ) console.log('result: ', arg);
     ret();
  }));
}

function CachedIDB(dao) {
  var name = dao.model.name;
  var idb = foam.dao.IDBDAO.create({model: dao.model});
return idb;
  dao = foam.dao.CachingDAO.create({cache: dao, src: idb});
  // if ( DEBUG ) dao = TimingDAO.create(name, dao);
  return dao;
}

var Photo = Model.create({
  model_: 'Model',
  name: 'Photo',
  properties: [
    { name: 'id' },
    { name: 'hash' },
    { type: 'Boolean', name: 'isLocal' },
    { type: 'Boolean', name: 'byAction' },
    { type: 'DateTime', name: 'timestamp' },
    { name: 'albumId' },
    { type: 'Boolean', name: 'isCoverPhoto' },
    { name: 'jspb', hidden: true }
  ]
});

var Album = Model.create({
  model_: 'Model',
  name: 'Album',
  properties: [
    { name: 'id', name: 'id' },
    { type: 'Boolean', name: 'isLocal' },
    { type: 'Boolean', name: 'byAction' },
    { type: 'DateTime', name: 'timestamp' },
    { name: 'jspb', hidden: true }
  ],
  relationships: [
    { model_: 'Relationship', relatedModel: 'Photo', relatedProperty: 'albumId' }
  ]
});

// Note: The 'relationships' feature is not used in these benchmarks, but to use this feature, you would do:
// albums[0].Photos.select(console.log)

var PhotoDetail = FOAM({
  model_: 'Model',
  name: 'PhotoDetail',
  properties: [
    { type: 'Int', name: 'id' },
    { name: 'photoId' },
    { name: 'albumId' },
    { name: 'hash' },
    { type: 'Int', name: 'totalComments' }
  ]
});

var AlbumDAO, PhotoDAO, PhotoDetailDAO;
var albums = [].sink, photos = [].sink;

function makeMultiPartKeys(n) {
  var a = [];
  for ( var i = 0 ; i < n ; i++ ) {
    a.push((Math.floor(NUM_PHOTOS/n)*i).toString());
  }
  return a;
}

var KEYS_10 = makeMultiPartKeys(10);
var KEYS_100 = makeMultiPartKeys(100);
var KEYS_1000 = makeMultiPartKeys(1000);
var KEYS_5000 = makeMultiPartKeys(5000);

var SUM_PHOTO_COUNT = SUM({f:function(photo) { return photo.jspb[9] || 0; }});

PhotoDetailDAO = CachedIDB(MDAO.create({model: PhotoDetail})
  .addIndex(PhotoDetail.PHOTO_ID)
  .addIndex(PhotoDetail.ALBUM_ID));
PhotoDAO = CachedIDB(MDAO.create({model: Photo})
//  This index isn't worthwhile with only 10 photos / album
//  .addRawIndex(TreeIndex.create(Photo.ALBUM_ID, mLangIndex.create(SUM_PHOTO_COUNT)))
  .addIndex(Photo.ALBUM_ID)
  .addIndex(Photo.TIMESTAMP)
  .addIndex(Photo.IS_LOCAL));
AlbumDAO = CachedIDB(MDAO.create({model: Album})
 .addIndex(Album.IS_LOCAL)
 .addIndex(Album.TIMESTAMP)
);

/*
AlbumDAO = CascadingRemoveDAO.create({
  delegate: AlbumDAO,
  childDAO: PhotoDAO,
  property: Photo.ALBUM_ID});
*/
var avgKey = Math.floor(NUM_PHOTOS/2).toString();
var avgAlbumKey = Math.floor(NUM_ALBUMS/2).toString();

function runPhotoBenchmarks() {
aseq(
  atest('CreateTestAlbums' + NUM_ALBUMS, arepeat(NUM_ALBUMS, function (ret, i) {
    testData.albums[i].isLocal = !!testData.albums[i].isLocal;
    albums.push(Album.create(testData.albums[i]));
    ret();
  })),
  atest('CreateTestPhotos' + NUM_PHOTOS, arepeat(NUM_PHOTOS, function (ret, i) {
    testData.photos[i].isLocal = !!testData.photos[i].isLocal;
    photos.push(Photo.create(testData.photos[i]));
    ret();
  })),
  function(ret) { console.clear(); testData = undefined; ret(); },
  arepeat(DEBUG ? 1 : 7, aseq(
  alog('Benchmark...'),
  atest('1aCreateAlbums' + NUM_ALBUMS, arepeatpar(NUM_ALBUMS, function (ret, i) {
    AlbumDAO.put(albums[i], ret);
  })),
  asleep(2000),
  atest('1bCreatePhotos' + NUM_PHOTOS, arepeatpar(NUM_PHOTOS, function (ret, i) {
    PhotoDAO.put(photos[i], ret);
  })),
  asleep(5000),
  atest('2aSelectAllAlbumsQuery', function(ret) { AlbumDAO.select()(ret); }),
  atest('2aSelectAllPhotosQuery', function(ret) { PhotoDAO.select()(ret); }),
  atest('2bSingleKeyQuery',       function(ret) { PhotoDAO.find(avgKey,ret); }),
  atest('2bSingleKeyQuery(X10)',  arepeat(10, function(ret) { PhotoDAO.find(avgKey,ret); })),
  atest('2cMultiKeyQuery10',      function(ret) { PhotoDAO.where(IN(Photo.ID, KEYS_10)).select()(ret); }),
  aif(!DEBUG, aseq(
  atest('2cMultiKeyQuery100',     function(ret) { PhotoDAO.where(IN(Photo.ID, KEYS_100)).select()(ret); }),
  atest('2cMultiKeyQuery1000',    function(ret) { PhotoDAO.where(IN(Photo.ID, KEYS_1000)).select()(ret); }),
  atest('2cMultiKeyQuery5000',    function(ret) { PhotoDAO.where(IN(Photo.ID, KEYS_5000)).select()(ret); })
  )),
  atest('2dIndexedFieldQuery',    function(ret) {
    PhotoDAO.where(EQ(Photo.ALBUM_ID, avgKey)).select(MAP(Photo.ALBUM_ID))(ret);
  }),
  atest('2dIndexedFieldQuery(X10)', arepeat(10,function(ret) {
    PhotoDAO.where(EQ(Photo.ALBUM_ID, avgKey)).select(MAP(Photo.ALBUM_ID))(ret);
  })),
  atest('2eAdHocFieldQuery',      function(ret) {
    PhotoDAO.where(EQ(Photo.IS_LOCAL, true)).select(MAP(Photo.HASH))(ret);
  }),
  atest('2fSimpleInnerJoinQuery', function(ret) {
    AlbumDAO.where(EQ(Album.IS_LOCAL, false)).select(MAP(Album.ID))(function (ids) {
      PhotoDAO.where(IN(Photo.ALBUM_ID, ids.arg2)).select()(ret);
  })}),
//  atest('2fSimpleInnerJoinQuery(Simpler+Slower Version)', function(ret) {
//    AlbumDAO.where(EQ(Album.IS_LOCAL, true)).select(MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, []), []))(ret);
//  }),
  atest('2gSimpleInnerJoinAggregationQuery', function(ret) {
    AlbumDAO.where(EQ(Album.IS_LOCAL, false)).select(MAP(Album.ID))(function (ids) {
      PhotoDAO.where(IN(Photo.ALBUM_ID, ids.arg2)).select(GROUP_BY(Photo.ALBUM_ID, SUM_PHOTO_COUNT))(ret);
  })}),
//  atest('2gSimpleInnerJoinAggregationQuery(Simpler+Slower Version', function(ret) {
//    AlbumDAO.where(EQ(Album.IS_LOCAL, false)).select(
//        MAP(JOIN(PhotoDAO, Photo.ALBUM_ID, SUM_PHOTO_COUNT), []))(ret);
//  }),
  atest('2hSimpleOrderByQuery', function(ret) {
    PhotoDAO.where(EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(DESC(Photo.TIMESTAMP)).select()(ret);
  }),
  atest('2hSimpleOrderByQuery(X10)', arepeat(10, function(ret) {
    PhotoDAO.where(EQ(Photo.ALBUM_ID, avgAlbumKey)).orderBy(DESC(Photo.TIMESTAMP)).select()(ret);
  })),
  atest('2iSimpleOrderAndGroupByQuery', function(ret) {
    PhotoDAO
      .where(AND(GTE(Photo.TIMESTAMP, new Date(96, 0, 1)), LT(Photo.TIMESTAMP, new Date(96, 2, 1))))
      .orderBy(DESC(Photo.TIMESTAMP))
      .select(GROUP_BY(MONTH(Photo.TIMESTAMP)))(ret);
  }),
  atest('2jSimpleAggregationQuery', function(ret) { PhotoDAO.select(GROUP_BY(Photo.ALBUM_ID))(ret); }),
/*
  atest('3aCreateAndUpdate', atxn(arepeat(DEBUG ? 10 : 1000, function (ret, i) { AlbumDAO.put(randomAlbum(i*2), ret); }))),
  atest('3bSetup', atxn(function(ret) {
    AlbumDAO.put(randomAlbum('test')),
    arepeat(DEBUG ? 10 : 1000, function(ret, i) { PhotoDAO.put(randomPhoto('test', i), ret); })(ret);
  })),
  atest('3bCascadingDelete', atxn(function(ret) { AlbumDAO.remove('3', ret); })),
  */
  atest('Cleanup', function(ret) {
    AlbumDAO.removeAll();
    PhotoDAO.removeAll();
    ret();
  }),
  asleep(10000)
)))(alog('Done.'));
}

runPhotoBenchmarks();

});
