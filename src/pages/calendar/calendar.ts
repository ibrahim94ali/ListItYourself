import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ViewController, AlertController, Events, ActionSheetController } from 'ionic-angular';
import * as moment from 'moment';
import {EventModalPage} from '../event-modal/event-modal';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { CalendarComponent } from "ionic2-calendar/calendar";
import { LocalNotifications } from '@ionic-native/local-notifications';


@Component({
  selector: 'page-calendar',
  templateUrl: 'calendar.html',
})
export class Calendar {

  @ViewChild(CalendarComponent) myCalendar:CalendarComponent;
  eventSource = [];
  myEvents = [];
  viewTitle:string;
  selectedDay = new Date();
  event_id = 0;

  event = { startTime: new Date(), endTime: new Date(), allDay: new Boolean(), title: new String()}

  ev = {startTime:"", endTime:"", title: ""}

  calendar = {
    mode: 'month',
    startingDayMonth: 1,
    currentDate: this.selectedDay,
    eventSource: []
  }

  seg : any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private viewCtrl: ViewController,
              private alertCtrl: AlertController, 
              private afAuth: AngularFireAuth,
              private cdr: ChangeDetectorRef,
              private afDatabase: AngularFireDatabase,
              public actionSheetCtrl: ActionSheetController,
              private localNotifications: LocalNotifications
) {
    this.seg = "month";
    if(navParams.get('up')=== true){
      this.navCtrl.setRoot(Calendar);
  }
}

  addEvent(){
    this.event_id++;
    this.navCtrl.push(EventModalPage, {
      day: this.selectedDay,
      change: false,
      event_id: this.event_id
    });
  }

    ionViewDidLoad()
    {
      let user = this.afAuth.auth.currentUser;
      //create references
      const dbRefObject = this.afDatabase.database.ref().child(`Events/${user.uid}`);
      
      const dbRefList = dbRefObject;

      dbRefList.on('child_added', snap => {
        let ev = snap.val();
      
        ev.startTime = new Date(ev.startTime);
        ev.endTime = new Date(ev.endTime);
        
        this.myEvents.push(ev);
        this.eventSource = [...this.myEvents];
        this.cdr.detectChanges();
      });

      dbRefList.on('child_changed', snap => {
        let ev = snap.val();
      
        ev.startTime = new Date(ev.startTime);
        ev.endTime = new Date(ev.endTime);
        this.eventSource.push(ev);
      });
    }

  onViewTitleChanged(title:any)
  {
    this.viewTitle = title;

  }
  onTimeSelected(ev:any){
    this.selectedDay = ev.selectedTime;

  }

  onEventSelected(event:any){
    this.presentActionSheet(event);
  }

  segmentChanged(seg:any)
  {
    this.calendar.mode = seg.value;
  }

  viewEvent(event:any)
  {
     if(event.allDay)
    {
      this.allDayAlert(event);
    }
    else
    {
      this.notAllDayAlert(event);
    }
  }

  allDayAlert(event:any)
  {
    let startTime = moment(event.startTime).format('ddd, LL');
    let endTime =  moment(event.endTime).format('ddd, LL');
    
   let alert = this.alertCtrl.create({
     title: '' + event.title,
     subTitle: 'From: ' + startTime + '<br>To: ' + endTime + '<br>Location: ' + event.location + '<br>Note: ' + event.note+ '<br>Alarm: ' + event.alarm,
     buttons: ['OK']
   });
   alert.present();
 }

 notAllDayAlert(event:any)
 {
    let startTime = moment(event.startTime).format('llll');
    let endTime = moment(event.endTime).format('llll');

   let alert = this.alertCtrl.create({
     title: '' + event.title,
     subTitle: 'From: ' + startTime + '<br>To: ' + endTime + '<br>Location: ' + event.location + '<br>Note: ' + event.note + '<br>Alarm: ' + event.alarm,
     buttons: ['OK']
   });
   alert.present();
 }

 deleteEvent(event:any)
 {
   event.startTime = moment(event.startTime).format();
   event.endTime = moment(event.endTime).format();
  let user = this.afAuth.auth.currentUser;
  //create references  
  let dbRefList = this.afDatabase.database.ref().child(`Events/${user.uid}`);

  let obj;

  dbRefList.on('child_added', snap => {
    let ev = snap.val();
   

    if (ev.startTime === event.startTime && ev.endTime === event.endTime && ev.title === event.title){
      obj = ev;
      let sil = snap.key;
      dbRefList =  dbRefList.child(`${sil}`);
      //remove from db
      dbRefList.remove();
    }
  });

  event.startTime = new Date(event.startTime);
  event.endTime = new Date(event.endTime);

    //remove from calendar
this.eventSource = this.eventSource.filter(obj => obj !== event);
    //remove the notification if exits
    if(event.alarm != "no")
    this.localNotifications.cancel(event.id).catch((err) => console.log(err));
 }

 editEvent(event: any)
 {
  this.navCtrl.push(EventModalPage, {
    event: event,
    change: true
  });
 }

 presentActionSheet(event: any) {
  const actionSheet = this.actionSheetCtrl.create({
    title: 'This event',
    buttons: [
      {
        text: 'View',
        icon: 'eye',
        handler: () => {
          this.viewEvent(event);
        }
      },{
        text: 'Edit',
        icon: 'clipboard',
        handler: () => {
          this.editEvent(event);
        }
      },
      {
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.deleteEvent(event);
        }
      },
      {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
        }
      }
    ]
  });
  actionSheet.present();
}

}
