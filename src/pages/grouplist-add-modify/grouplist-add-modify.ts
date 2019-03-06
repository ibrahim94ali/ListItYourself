import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { EventModalPage } from '../event-modal/event-modal';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { GroupListPage } from '../group-list/group-list';


@Component({
  selector: 'page-grouplist-add-modify',
  templateUrl: 'grouplist-add-modify.html',
})
export class GrouplistAddModifyPage {

  list = {header : "", items : [], deadline: false, number: -1, people: [], pplnumber: -1};
  oldlist = {header : "", items : [], deadline: false, number: -1, people: [], pplnumber: -1};
  update: any;


  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController,
    private afAuth: AngularFireAuth,  private afDatabase: AngularFireDatabase, private cdr: ChangeDetectorRef) {
    if(navParams.get('change')=== true){
      this.oldlist = navParams.get('list');
      this.update = true;

      const user = afAuth.auth.currentUser;
      const myemail = user.email;

      this.list.deadline = this.oldlist.deadline;
      this.list.header = this.oldlist.header;
      this.list.number = this.oldlist.number;
      this.list.pplnumber = this.oldlist.pplnumber;
      this.list.items = this.oldlist.items.map(x => Object.assign({}, x));
      for (let ppl of this.oldlist.people)
      {
        this.list.people.push(ppl);
      }

      this.list.people = this.list.people.filter(obj =>  obj !== myemail);
      this.list.pplnumber = this.list.people.length;
      this.customTrackBy(this.list.number, this.list.items);
      this.customTrackByPpl(this.list.pplnumber, this.list.people);

    }
    else
    {
      this.update = false;
    }
  }

  customTrackBy(index: number, obj: any): any {
    return index;
  }

  customTrackByPpl(index: number, obj: any): any {
    return index;
  }

  addItem()
  {
    this.list.items.push({item: "", checked: false});
    this.cdr.detectChanges();
  }
  addPerson()
  {
    this.list.people.push("");
    this.cdr.detectChanges();
  }
  save(){
    this.list.items = this.list.items.filter(obj => obj.item !== "");
    this.list.number = this.list.items.length;

    this.list.people = this.list.people.filter(obj => obj !== "");

    const user = this.afAuth.auth.currentUser;
    const myemail = user.email;
    this.list.people = this.list.people.filter(obj =>  obj !== myemail);
    this.list.pplnumber = this.list.people.length;

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
    if(this.list.pplnumber < 1)
    {
    this.errorPersonAlert();
    return;
    }
    this.list.people.push(myemail);
    this.list.pplnumber++;

     //create references  
     let dbRefList = this.afDatabase.database.ref().child(`Lists/GroupLists`);

    if(this.update) //modify old list
     {
        let change = false;
       if(this.oldlist.header === this.list.header && this.oldlist.number === this.list.number && this.oldlist.deadline === this.list.deadline && this.oldlist.pplnumber == this.list.pplnumber)
       {
         for(let i in this.list.items)
        {
          if(this.list.items[i].item != this.oldlist.items[i].item){
          change = true;
          }
        }
        for(let j in this.list.people)
        {
          if(this.list.people[j] != this.oldlist.people[j]){
          change = true;
          }
        }

        if(!change)
        {
          this.navCtrl.push(GroupListPage, {list: this.oldlist, nochange: true, modify: true});
          return;
        }
         

       }
      let del : any;
      dbRefList.on('child_added', snap => {
        let ev = snap.val();
        let skip = true;
        if(this.oldlist.header === ev.header && this.oldlist.number === ev.number && this.oldlist.deadline === ev.deadline && this.oldlist.pplnumber == ev.pplnumber){
          skip = true;
          for (let q in ev.people)
          {
            if(ev.people[q] != this.oldlist.people[q])
            {
              skip = false;
            }
          }
          if(skip)
          del = snap.key;
        }
      });
      dbRefList.on('child_changed', snap => {
        let ev = snap.val();
        let skip = true;
        if(this.oldlist.header === ev.header && this.oldlist.number === ev.number && this.oldlist.deadline === ev.deadline && this.oldlist.pplnumber == ev.pplnumber){
          skip = true;
          for (let q in ev.people)
          {
            if(ev.people[q] != this.oldlist.people[q])
            {
              skip = false;
            }
          }
          if(skip)
          del = snap.key;
        }
      });

      console.log(del);

      dbRefList =  dbRefList.child(`${del}`);
      dbRefList.update(this.list)
      .catch((err) => console.log("Error update", err));

      if(!this.list.deadline)
      {
        this.navCtrl.push(GroupListPage, {list: this.oldlist, nochange: true, modify: true});
      }
      else{
        let event = {startTime: new Date(Date.now()).toISOString(), endTime: new Date(Date.now()).toISOString(), allDay: true, title: this.list.header, alarm: "no", note:"", location:""}
              this.navCtrl.push(EventModalPage, {
                event: event,
                change: true,
                list: "group"
              }); //bug: come back to this page
      }
    }
    else{ //new list
      try{
      this.afDatabase.list(`/Lists/GroupLists`).push(this.list)
          .then(() =>  {
            if(this.list.deadline === true)
            {
              let event = {startTime: new Date(Date.now()).toISOString(), endTime: new Date(Date.now()).toISOString(), allDay: true, title: this.list.header, alarm: "no", note:"", location:""}
              this.navCtrl.push(EventModalPage, {
                event: event,
                change: true,
                list: "group"
              });
            }
            else{
              this.navCtrl.push(GroupListPage, {list: this.oldlist, nochange: true, modify: true});
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
  errorPersonAlert()
  {
      const prompt = this.alertCtrl.create({
        title: 'Error',
        message: "Your list must have at least one other person",
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
