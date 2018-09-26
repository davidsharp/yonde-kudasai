// https://developer.chrome.com/extensions/commands
// chrome.commands.onCommand.addListener(function(command) {});
// https://developer.chrome.com/extensions/omnibox
// chrome.omnibox.onInputStarted.addListener(function callback)
// chrome.omnibox.onInputChanged.addListener(function(e){console.log(e)})
chrome.omnibox.onInputEntered.addListener(yonde)

// http://jisho.org/forum/54fefc1f6e73340b1f160000-is-there-any-kind-of-search-api
// https://app.kanjialive.com/api/docs

const Jisho = 'http://jisho.org/api/v1/search/words?keyword='

var text = '';
chrome.extension.onMessage.addListener(function(myMessage, sender, sendResponse){
    console.log('Selection Message :::',myMessage)
    text=myMessage
    //do something that only the extension has privileges here
    return true;
 });

chrome.commands.onCommand.addListener(function(command){
  console.log('Trigger Command :::',command)
  if(text.length>0 && command === 'yonde-kudasai'){
    yonde(text);
  }

});


function jishoMe(text){ //maybe I can split at spaces to search for individual words? //or encode the URI
  fetch(Jisho+encodeURIComponent(text)).then(function(response) {
    response.json().then(function(o){//alert(JSON.stringify(o.data))
      var d = o.data.map(c=>{if(true||c.is_common){
        return (
          {
            title: (c.japanese.map(
              _c=>([_c.word,_c.reading].filter(f=>!!f).join(' – '))
            ).join(', ')
              + `• ${c.senses.map(_c=>_c.parts_of_speech).join(', ')}${!c.is_common?' (uncommon)':''}`
            ),
            message:`${c.senses.map(
              _c=>(_c.english_definitions).map(_c=>('"'+_c+'"')).join(', '))}`,
            //contextMessage: (`• ${c.senses.map(_c=>_c.parts_of_speech).join(', ')}${!c.is_common?' (uncommon)':''}`)
          }
        )
      }})
      var myID = 'jisho'+Date.now();
      var openTab = (id,index)=>{
        if(id===myID)chrome.tabs.create({url:`http://jisho.org/search/${text}`},()=>chrome.notifications.clear(myID))
      }
      chrome.notifications.onClicked.addListener(openTab)
      chrome.notifications.onButtonClicked.addListener(openTab)
      chrome.notifications.create(
        myID,
        {
          type:'basic',
          message:d[0].message,
          iconUrl:'https://avatars2.githubusercontent.com/u/5731838?v=4&s=40',
          title:d[0].title,
          requireInteraction:true,
          //contextMessage:d[0].contextMessage
          buttons: [{title:'open search'}]
        },
        ()=>{}
      )
    })
  })
}

speechSynthesis.getVoices()
function yonde(words){
  const voice = speechSynthesis.getVoices().filter(voice=>voice&&/ja[-_]JP/.test(voice.lang)).reverse()[0];
  const utterance = new SpeechSynthesisUtterance(words);
  utterance.voice = voice;
  utterance.lang = 'ja-JP';
  // Listeners are for dealing with a Chrome garbage collection thing
  // https://stackoverflow.com/a/34844998/1104036
  utterance.addEventListener('start', () => {
     console.log('saying "'+words+'"');
  })
  utterance.addEventListener('end', () => {
     console.log('said "'+words+'"');
  })
  utterance.addEventListener('error', e => {
    console.error('Failed to say "'+words+'" :',e)
  })
  speechSynthesis.speak(utterance);
  return utterance;
};