for ( var i = 0 ; i < files.length ; i++ ) {
   console.log('loading: ', files[i]);
   document.writeln('<script language="javascript" src="' + (FOAM_BOOT_DIR || "") + files[i] + '.js"></script>\n');
}
