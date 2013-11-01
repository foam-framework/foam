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



