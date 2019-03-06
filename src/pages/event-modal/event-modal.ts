import { Component } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController} from 'ionic-angular';
import * as moment from 'moment';
import { AngularFireAuth }  from 'angularfire2/auth';
import { AngularFireDatabase }  from 'angularfire2/database';
import { Calendar } from '../calendar/calendar';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { GroupListPage } from '../group-list/group-list';
import { PersonalListPage } from '../personal-list/personal-list';


@Component({
  selector: 'page-event-modal',
  templateUrl: 'event-modal.html',
})
export class EventModalPage {
  event = {id : 0, startTime: "", endTime: "", allDay: false, title: "", alarm: "no", note:"", location:""}
  oldEvent = {id : 0, startTime: "", endTime: "", allDay: false, title: "", alarm: "no", note:"", location:""}
  now = new Date(Date.now());
  minDate = new Date(this.now.valueOf() - this.now.getTimezoneOffset()* 60000).toISOString();
  maxDate = new Date("2099-12-31").toISOString();
  update : any;
  list : any;
  eventN = 0;
  eventids = [];
  
  constructor(private localNotifications: LocalNotifications, public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, private afAuth: AngularFireAuth,  private afDatabase: AngularFireDatabase, public alertCtrl: AlertController) {
    const user = this.afAuth.auth.currentUser;
            //create references  
    let dbRefList = this.afDatabase.database.ref().child(`Events/${user.uid}`);
    dbRefList.on('child_added', snap => {
            this.eventids.push(snap.val().id);
              });

    let j = 0;
    while( j != undefined)
    {
      j = this.eventids.find(x => x == this.eventN);
      this.eventN++;
    }
    this.eventN--;

    if(navParams.get('change')=== false){
    let preselectedDate = moment(navParams.get('day')).format();
    this.event.startTime = preselectedDate;
    this.event.endTime = preselectedDate;
    this.event.id = this.eventN;
    this.update = false;
    this.list = false;
  }
  else{
    this.oldEvent = navParams.get('event');
    this.oldEvent.startTime = moment(this.oldEvent.startTime).format();
    this.oldEvent.endTime = moment(this.oldEvent.endTime).format();
    this.event.startTime =  this.oldEvent.startTime;
    this.event.endTime =  this.oldEvent.endTime;
    this.event.title = this.oldEvent.title;
    this.event.note = this.oldEvent.note;
    this.event.location = this.oldEvent.location;
    this.event.allDay = this.oldEvent.allDay;
    this.event.alarm = this.oldEvent.alarm;
    this.event.id = this.oldEvent.id;

    if(navParams.get('list') === "group")
    {
      this.update = false;
      this.list = "group";
      this.event.id = this.eventN;
    }
    else if(navParams.get('list') === "person")
    {
      this.update = false;
      this.list = "person";
      this.event.id = this.eventN;
    }
    else{
      this.update = true;
      this.list = "false";    
    }
    }
}

  save()
  {
    if(this.event.title==="")
    {
    this.errorTitleAlert();
    return;
    }
    let datest = this.event.startTime;
    let dateend = this.event.endTime;

     if (datest.toString() > dateend.toString()) {
         this.errorDateAlert();
         return;
     }

     const user = this.afAuth.auth.currentUser;

     if(this.update) //update old event
     {
      this.oldEvent.startTime = moment(this.oldEvent.startTime).format();
      this.oldEvent.endTime = moment(this.oldEvent.endTime).format();

      //create references  
      let dbRefList = this.afDatabase.database.ref().child(`Events/${user.uid}`);
      let del: any;
      dbRefList.on('child_added', snap => {
        let ev = snap.val();    
        if (ev.startTime === this.oldEvent.startTime && ev.endTime === this.oldEvent.endTime && ev.title === this.oldEvent.title){
          del = snap.key;
        }
      });

      dbRefList =  dbRefList.child(`${del}`);
      dbRefList.update(this.event);
      this.editNotification();
      this.navCtrl.push(Calendar, {
        up: true
      });

     }
     else{  // new event
      this.addNotification();
    try{//create new event
      
      const result = this.afDatabase.list(`/Events/${user.uid}`).push(this.event)
          .then(() =>  {
            if(this.list === "person"){
              this.navCtrl.push(PersonalListPage, {up: true});
            }
            else if(this.list === "group")
            {
            this.navCtrl.push(GroupListPage, {up: true});
            }
            else
            {
              this.navCtrl.pop();
            }
          });
    }
    catch(e)
    {
      console.log(e);
    }
  }
}

  errorTitleAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Error',
        message: "Your event must have a title",
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      prompt.present();
  }


showRadio() {
  let alert = this.alertCtrl.create();
  alert.setTitle('Set Alarm');

  alert.addInput({
    type: 'radio',
    value: 'no',
    label: 'no Alarm',
    checked: true
  });

  alert.addInput({
    type: 'radio',
    value: 'on Time',
    label: 'on Time',
  });

  alert.addInput({
    type: 'radio',
    value: '15 minutes before',
    label: '15 minutes before',
  });

  alert.addInput({
    type: 'radio',
    value: '30 minutes before',
    label: '30 minutes before',
  });

  alert.addInput({
    type: 'radio',
    value: '1 hour before',
    label: '1 hour before',
  });

  alert.addButton({
    text: 'OK',
    handler: data => {
      this.event.alarm = data;
    }
  });
  alert.present();
  }
  addNotification(){
    let notification_time: any, not: any;
    if(this.event.alarm === "no")
    {
      return;
    }
    else if(this.event.alarm === "on Time"){
      notification_time = new Date(this.event.startTime.valueOf());
      not = this.event.title  + " is starting now..."
    }
    else if (this.event.alarm === "15 minutes before"){
      notification_time = new Date(new Date(this.event.startTime).valueOf() - 900000);
      not = this.event.title + " is staring in 15 minutes...";
    }
    else if (this.event.alarm === "30 minutes before"){
      notification_time = new Date(new Date(this.event.startTime).valueOf() - 1800000);
      not = this.event.title + " is staring in 30 minutes...";
    }
    else if (this.event.alarm === "1 hour before"){
      notification_time = new Date(new Date(this.event.startTime).valueOf() - 3600000);
      not = this.event.title + " is staring in 1 hour...";
    }

    this.localNotifications.schedule({
      id: this.event.id,
      text: not,
      trigger: {at: notification_time},
    });
  }

  editNotification()
  {
    this.localNotifications.cancel(this.event.id).then(() => this.addNotification());
  }

  errorDateAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Error',
        message: "Ending time cannot be before than Starting time",
        buttons: [
          {
            text: 'OK',
            handler: data => {
            }
          }
        ]
      });
      prompt.present();
  }
}
