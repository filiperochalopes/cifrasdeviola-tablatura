$().ready(function(){
    $.getJSON( "data.json", function( data ) {
    $("#text").html(data["text"]);
  });
});