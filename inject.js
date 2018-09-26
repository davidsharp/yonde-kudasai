var selection = ''
var time = undefined
var throttle = 300

 document.onselectionchange=function(){
   if(time)clearTimeout(time)
   time=setTimeout(messageExtension,throttle)
 }


function messageExtension(){
  console.log(window.getSelection())
  if(window.getSelection().toString()!==selection)chrome.extension.sendMessage(window.getSelection().toString(), function(response) {
     //callback

  });
}
