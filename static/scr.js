var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

// Output:
var synth = window.speechSynthesis;

//TIMETABLES FOR MONDAY AND TUESDAY RESPECTIVELY
var timetable1 = `<table class="content-table">
<thead>
  <tr>
    <th>Time</th>
    <th>Session</th>
    <th>Room if applicable</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="hours">10:00 - 11:00</td>
    <td>Computer Graphics Lesson</td>
    <td>R102</td>
  </tr>
  <tr>
    <td class="hours">13:00 - 15:00</td>
    <td>Algorithms lesson</td>
    <td>R208</td>
  </tr>
</tbody>
</table>`

var timetable2 = `<table class="content-table">
<thead>
  <tr>
    <th>Time</th>
    <th>Session</th>
    <th>Room if applicable</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td class="hours">10:00 - 11:00</td>
    <td>Java Programming Lesson</td>
    <td>R101</td>
  </tr>
  <tr>
    <td class="hours">14:00 - 16:00</td>
    <td>Computer Graphics lesson</td>
    <td>R208</td>
  </tr>
</tbody>
</table>`

var todayTable = `
<table class="content-table" style="text-align: center;">
<thead>
  <tr>
    <th style="text-align: center;"><u>Reminders for today</u></th>
  </tr>
</thead>
<tbody>
  <tr><td>Pay rent</td></tr>
  <tr><td>Java test at 3pm</td></tr>
  <tr><td>Attend algorithms drop in session at 5pm</td></tr>
  <tr><td>Buy groceries</td></tr>
</tbody>
</table>
`

var grammar = "#JSGF V1.0; grammar taxi; public <taxi> =  ...;";

//Regular expressions for the different reminders utterances
var u1=/.*(?:remind me|set a reminder|make a reminder)$/i;
var u2=/.*(?:remind me|set a reminder|make a reminder) (?:of|for|about) (.*)$/i;
var u3=/.*(?:remind me|set a reminder|make a reminder) (?:of|for|about) (.*) (?:on|at) (.*)$/i;

var u4=/(?:of|for|about)?\s*(.*)/i;
var u5=/(?:on|at)?\s*(.*)/i;

//Regexs for the show classes utterances
var u6 =/.*(?:show|display|see|view) (.*) (timetable|schedule)$/i //"...Show...timetable"
var u7 =/.*(?:show|display|see|view) (.*) (timetable|schedule) (?:on|for) (.*)$/i
var u10 =/(?:timetable on|schedule on|timetable for|schedule for|on|for)?\s*(.*)/i

//Regex for the show deadlines
var u8 =/.*(?:show|display|see|view)(.*)(?:deadline|deadlines|events|reminder|reminders|event)$/i //"..Show my deadlines"
var u9 =/.*(?:show|display|see|view)(.*) (?:deadline|deadlines|events|reminder|reminders|event) (?:for|on) (.*)$/i //"Show my reminders on..."

//To delete an event entry
var u11 =/.*delete(.*) (?:reminder|deadline|event)$/i //"I want to delete a reminder.."
var u12 =/.*delete (?:reminder|event) (?:number) (.*)$/i //"I want to delete reminder 1"
var u13 =/(?:reminder|reminder number)?\s*(.*)/i

var recognition = new SpeechRecognition();
var speechGramList = new SpeechGrammarList();

// Parameters of the recognition:
recognition.continuous = false;
recognition.lang = 'en-GB';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');
var resp = document.querySelector('.response');


document.body.onclick = function() {
  resp.textContent="...";
  console.log('Ready to receive voice command.');
  enterState(0);
}

var state = 0;
var startPlace=null;
var endPlace=null;

var reminders = [{"key":1,"Reminder":"Algorithms exam","Date":"Friday 26th of March"},
    {"key":2,"Reminder":"Computer graphics coursework due", "Date":"Monday 29th of March"},

]

//Key for reminder starts from 3 as there is two pre defined ones
var key = 3
function enterState(s){
  console.log("Entering state:", s);
  // set new state
  state=s;
  
  sayState(state, function(){if(isFinal(state)){
    //If events clash
    if (reminders.some(item => item.Date === endPlace)){
      var alertt = "Event clash: You also have another reminder for this time."
      utterThis = new SpeechSynthesisUtterance(alertt);
      synth.speak(utterThis);      
      var msg="You've set a reminder for "+startPlace+ " on "+endPlace;
      var message = "Event clash: You also have another reminder for this time ! You've set a reminder for "+startPlace+ " on "+endPlace
      diagnostic.innerHTML = message
      utterThis = new SpeechSynthesisUtterance(msg);
      synth.speak(utterThis);
      //Puts reminder into JSON array
      reminders.push({key:key,Reminder:startPlace,Date:endPlace})
      key++
      //Will add reminder anyway but this time no need to alert user of clashing events
    } else{
      var msg="You've set a reminder for "+startPlace+ " on "+endPlace;
      diagnostic.innerHTML = msg
      utterThis = new SpeechSynthesisUtterance(msg);
      synth.speak(utterThis);
      //Puts reminder into JSON array
      reminders.push({key:key,Reminder:startPlace,Date:endPlace})
      key++
    }
  } else if (stateEight(state)){
    var msg="Showing timetable for"+ " " +tableDate;
    diagnostic.innerHTML = msg
    utterThis = new SpeechSynthesisUtterance(msg)
    synth.speak(utterThis)
    if (tableDate=="today"){diagnostic.innerHTML=timetable2}
    //MAKE TIMETABLE 2 A TOMORROW ONE
    else{diagnostic.innerHTML = timetable1}
  } else if (stateNine(state)){
    var i = 0 ;
    //Reminder table 
    var row = `
    <table class='content-table'>
    <thead>
    <tr>
      <th>Reminder Number</th>
      <th>Reminder</th>
      <th>Date of reminder</th>
    </tr>
  </thead>
  <tbody>
    `
    reminders.forEach((u)=>{
      row += "<tr>"
      row += "<td>" + u.key + "</td>"
      row += "<td>" + u.Reminder + "</td>"
      row += "<td>" + u.Date + "</tr>" 
    })

    row += `
    </tbody>
    </table>
    `
    diagnostic.innerHTML = row
    while (i < reminders.length){
      w = JSON.stringify(reminders[i]["key"])
      x = JSON.stringify(reminders[i]["Reminder"])
      y = JSON.stringify(reminders[i]["Date"])
      var msg="You have"+ x+ "on the date" + y;
      if (i>0){
        msg="and you have"+ x+ "on the date" + y;
      }
      utterThis = new SpeechSynthesisUtterance(msg)
      synth.speak(utterThis)
      i++
    }
  } else if (stateEleven(state)){
      var result = reminders.filter(x => x.Date == reminderDate)
      //Reminder table 
      var row = `<table class='content-table'><thead><tr><th>Reminder Number</th><th>Reminder</th><th>Date of reminder</th></tr></thead><tbody>`
      result.forEach((u)=>{
        row += `<tr>`
        row += `<td>` + u.key + `</td>`
        row += `<td>` + u.Reminder + `</td>`
        row += `<td>` + u.Date + `</tr>`
      })
      row += `</tbody></table>`
      diagnostic.innerHTML = JSON.stringify(row)
        if (reminderDate=="today"){diagnostic.innerHTML = todayTable}
    var msg="Showing events for"+ " " +reminderDate;
    utterThis = new SpeechSynthesisUtterance(msg)
    synth.speak(utterThis)
  } else if (stateThirteen(state)){
        if (reminders.some(item => item.key === parseInt(deleteKey))){
          var msg="Ok deleting reminder number " +deleteKey;
          deleteField(deleteKey)
          diagnostic.innerHTML = msg
          utterThis = new SpeechSynthesisUtterance(msg)
          synth.speak(utterThis)
        } else {
          var row = `
          <table class='content-table'>
          <thead>
          <tr>
            <th>Reminder Number</th>
            <th>Reminder</th>
            <th>Date of reminder</th>
          </tr>
        </thead>
        <tbody>
          `
          reminders.forEach((u)=>{
            row += "<tr>"
            row += "<td>" + u.key + "</td>"
            row += "<td>" + u.Reminder + "</td>"
            row += "<td>" + u.Date + "</tr>" 
          })
      
          row += `
          </tbody>
          </table>
          `
          diagnostic.innerHTML = row

          var msg="I did not find the reminder, with reminder numer" + deleteKey + " check reminder list for the correct reminder number";
          utterThis = new SpeechSynthesisUtterance(msg)
          synth.speak(utterThis)

        } 
  }
  else { recognition.start(); }});
}
var tableDate
var reminderDate
var deleteKey
// Final states:
function isFinal(s){ return s==5;}
function stateEight(s){return s== 8}
function stateNine(s){return s==9}
function stateEleven(s){return s==11}
function stateThirteen(s){return s==13}
function stateFourteen(s){return s==14}

// Things it can say in the different states.
var sayings = {
  0: "Virtual planner, How can I help?",
  1:"What is the reminder for?",
  3:"On what date?",
  5:"Done!",
  7:"What day do you want to view your timetable for?",
  8:"Okay",
  9:"Showing all reminders",
  11:"Showing your reminders for date",
  12:"What reminder do you want to delete? Say the NUMBER ONLY. If you dont know the reminder number, say \' I dont know \' to view the reminders"
}

function sayState(s, afterSpeechCallback){
  var textOut=sayings[s];
  resp.textContent = textOut

  var utterThis = new SpeechSynthesisUtterance(textOut);
  utterThis.onend = function (event) {
    console.log('SpeechSynthesisUtterance.onend');
  }
  utterThis.onerror = function (event) {
    console.error('SpeechSynthesisUtterance.onerror');
  }
  utterThis.onend = afterSpeechCallback;

  synth.speak(utterThis);
}

//To delete events/reminders
function deleteField(index){
  for (let [i, reminder] of reminders.entries()) {
    if (reminder.key == index) {
        reminders.splice(i, 1);
    }
 }
}

recognition.onresult = function(event) {
  console.log('onresult');
  
  var text = event.results[0][0].transcript;
  diagnostic.textContent = 'I heard: ' + text + '.';

  console.log("State:", state);
  // Switch statement based on what has been uttered
  switch(state){
    case 0:
    if(text.match(u1)){ enterState(1);}
    else if (m=text.match(u3)){ startPlace = m[1]; endPlace=m[2]; enterState(5);} // "...from .... to ..."
    else if (m=text.match(u2)){ startPlace = m[1]; enterState(3);} // "...from ...."
    else if (m=text.match(u6)){enterState(7)}
    else if (m=text.match(u7)){tableDate=m[3]; enterState(8)}
    else if (m=text.match(u8)){enterState(9)}//Reminders
    else if (m=text.match(u9)){reminderDate=m[2]; enterState(11)}
    else if (m=text.match(u11)){enterState(12)}
    else if (m=text.match(u12)){deleteKey=m[1]; enterState(13)}
    else {
      //If user requests something not in function or the system does not understand the user properly
      var msg="|Sorry, I did not get that command. Please try again"
      var msgg="I heard: "+text+" |Sorry, I did not get that command. Please try again"
      diagnostic.innerHTML = msgg
      utterThis = new SpeechSynthesisUtterance(msg);
      synth.speak(utterThis);
      enterState(state)      
    }
    break;
    case 1:
    if(m = text.match(u4)){ // "...from ...."
      console.log("Matched - reminder"); startPlace = m[1]; enterState(3);
    } else {
      enterState(state);
    }
    break;

    case 3:
    if(m=text.match(u5)){
      console.log("Matched - date");
      endPlace = m[1]; enterState(5);
    } else {
      enterState(state)
    }
    break;

    case 5:
    break;

    //Showing the timetable
    case 7:
    if(m=text.match(u10)){
      tableDate = m[1];
      var msg="Okay, Showing your timetable for"+tableDate;
      utterThis = new SpeechSynthesisUtterance(msg);
      synth.speak(utterThis);
      diagnostic.innerHTML = timetable1
      resp.innerHTML = "Showing your timetable for" + " " +tableDate
    }
    break
    
    case 11:
    break

    //For deleting
    case 12:
      if(text.match(u13)){
        console.log(text)
        var row = `
        <table class='content-table'><thead><tr><th>Reminder Number</th><th>Reminder</th><th>Date of reminder</th></tr></thead><tbody>
        `
        reminders.forEach((u)=>{
          row += "<tr>"
          row += "<td>" + u.key + "</td>"
          row += "<td>" + u.Reminder + "</td>"
          row += "<td>" + u.Date + "</tr>" 
        })
    
        row += `</tbody></table>
        `
        diagnostic.innerHTML = row
        if (reminders.some(item => item.key === parseInt(text))){
          var msg="Ok i'm deleting reminder number " +text;
          deleteField(text)
          diagnostic.innerHTML = msg
          utterThis = new SpeechSynthesisUtterance(msg)
          synth.speak(utterThis)
        } else {
          var row = `
          <table class='content-table'>
          <thead>
          <tr>
            <th>Reminder Number</th>
            <th>Reminder</th>
            <th>Date of reminder</th>
          </tr>
        </thead>
        <tbody>
          `
          reminders.forEach((u)=>{
            row += "<tr>"
            row += "<td>" + u.key + "</td>"
            row += "<td>" + u.Reminder + "</td>"
            row += "<td>" + u.Date + "</tr>" 
          })
      
          row += `
          </tbody>
          </table>
          `
          diagnostic.innerHTML = row

          var msg="I did not find the reminder, check reminder list for the reminder number";
          utterThis = new SpeechSynthesisUtterance(msg)
          synth.speak(utterThis)

        }
      }
  }

}

//Stops listening when user stops talking
recognition.onspeechend = function() {
  recognition.stop();
}

//If there is an error in recognition
recognition.onerror = function(event) {  
  diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}