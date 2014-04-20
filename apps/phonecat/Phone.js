FOAModel({
  name: 'Phone',
  properties: [
    { name: 'id' },
    { name: 'age' },
    { name: 'imageUrl', view: 'ImageView' },
    { name: 'name' },
    { name: 'snippet' },
    { name: 'additionalFeatures' },
    { name: 'android' },
    { name: 'availability' },
    { name: 'battery' },
    { name: 'camera' },
    { name: 'connectivity' },
    { name: 'description' },
    { name: 'display' },
    { name: 'hardware' },
    { name: 'images', model_: 'StringArrayProperty' },
    { name: 'sizeAndWeight' },
    { name: 'storage' },
    { name: 'details' }
  ]
});

