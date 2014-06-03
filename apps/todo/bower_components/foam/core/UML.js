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
function drawUML(ctx, x, y, model, opt_width, opt_background) {
    var background = opt_background || 'white';
    var width = opt_width || 150;
    var i = 0;
    var outputText = function(txt) {
        ctx.fillText(txt, x+10, y+i*18+15);
        i++;
    };

    i = model.properties.length+1;
    ctx.fillStyle   = background;
    ctx.fillRect(x, y, width, (i+1)*18);
    i = 0;

    ctx.fillStyle   = '#000';
    ctx.strokeStyle = '#000';

    ctx.font = "13px sans-serif";
    outputText(model.name);
    ctx.font = "11px sans-serif";

    for ( var key in model.properties ) {
        var prop = model.properties[key];

        outputText(prop.name);
    }

    ctx.strokeRect(x, y, width, (i+1)*18);

    ctx.beginPath();
    ctx.moveTo(x,y+20);
    ctx.lineTo(x+width,y+20);
    ctx.stroke();
}


function copy(src, dest, model) {
    for ( var i = 0 ; i < model.properties.length ; i++ ) {
        var prop = model.properties[i];

        if ( prop.name in src ) dest[prop.name] = src[prop.name];
    }

    return dest;
}
