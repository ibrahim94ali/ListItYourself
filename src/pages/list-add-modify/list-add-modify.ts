import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { EventModalPage } from '../event-modal/event-modal';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-list-add-modify',
  templateUrl: 'list-add-modify.html',
})
export class ListAddModifyPage {

  list = {header : "", items : [], deadline: false, number: -1};
  oldlist = {header : "", items : [], deadline: false, number: -1};
  update: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    private afAuth: AngularFireAuth,  private afDatabase: AngularFireDatabase, private cdr: ChangeDetectorRef) {
    if(navParams.get('change')=== true){
      this.oldlist = navParams.get('list');
      this.update = true;
      this.list.deadline = this.oldlist.deadline;
      this.list.header = this.oldlist.header;
      this.list.number = this.oldlist.number;
      this.list.items = this.oldlist.items.map(x => Object.assign({}, x));
      this.customTrackBy(this.list.number, this.list.items);
    }
    else
    {
      this.update = false;
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  addItem()
  {
    this.list.items.push({item: "", checked: false});
    this.cdr.detectChanges();
  }
  save(){
    this.list.items = this.list.items.filter(obj => obj.item !== "");
    this.list.number = this.list.items.length;

    if(this.list.header==="")
    {
    this.errorTitleAlert();
    return;
    }
    if(this.list.number < 1)
    {
    this.errorItemAlert();
    return;
    }

    const user = this.afAuth.auth.currentUser;
    //create references  
    let dbRefList = this.afDatabase.database.ref().child(`Lists/${user.uid}`);

    if(this.update) //modify old list
     {
       if(this.oldlist.header === this.list.header && this.oldlist.number === this.list.number && this.oldlist.deadline === this.list.deadline)
       {
         let change = false;
         for(let i in this.list.items)
        {
          if(this.list.items[i].item != this.oldlist.items[i].item){
          change = true;
          }
        }

        if(!change)
        {
          this.navCtrl.pop();
          return;
        }
         

       }
      let del:any;
      dbRefList.on('child_added', snap => {
        let ev = snap.val();
        if (ev.header === this.oldlist.header && ev.deadline === this.oldlist.deadline && ev.number === this.oldlist.number){
          del = snap.key;
        }
      });
      dbRefList.on('child_changed', snap => {
        let ev = snap.val();    
        if (ev.header === this.oldlist.header && ev.deadline === this.oldlist.deadline && ev.number === this.oldlist.number){
          del = snap.key;
        }
      });

      dbRefList =  dbRefList.child(`${del}`);
      dbRefList.update(this.list);

      if(!this.list.deadline)
      {
        this.navCtrl.pop();
      }
      else{
        let event = {startTime: new Date(Date.now()).toISOString(), endTime: new Date(Date.now()).toISOString(), allDay: true, title: this.list.header, alarm: "no", note:"", location:""}
              this.navCtrl.push(EventModalPage, {
                event: event,
                change: true,
                list: "person"
              });
      }
    }
    else{ //new list
      try{
      this.afDatabase.list(`/Lists/${user.uid}`).push(this.list)
          .then(() =>  {
            if(this.list.deadline === true)
            {
              let event = {startTime: new Date(Date.now()).toISOString(), endTime: new Date(Date.now()).toISOString(), allDay: true, title: this.list.header, alarm: "no", note:"", location:""}
              this.navCtrl.push(EventModalPage, {
                event: event,
                change: true,
                list: "person"
              });
            }
            else{
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
        message: "Your list must have a header",
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
  errorItemAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Error',
        message: "Your list must have at least one item",
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
