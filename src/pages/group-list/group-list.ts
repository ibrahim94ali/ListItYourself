import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { GrouplistAddModifyPage} from '../grouplist-add-modify/grouplist-add-modify';

@Component({
  selector: 'page-group-list',
  templateUrl: 'group-list.html',
})
export class GroupListPage {

  lists = [];
  number = this.lists.length;
  updateitems : any;
  cameback : any;


  constructor(public navCtrl: NavController, public navParams: NavParams,private cdr: ChangeDetectorRef, public alertCtrl: AlertController,
    public actionSheetCtrl: ActionSheetController,  private afAuth: AngularFireAuth,  private afDatabase: AngularFireDatabase) {
      if(navParams.get('modify') === true)
      {
        if(navParams.get('nochange') === false)
        {
          let del = navParams.get('list');
          this.lists = this.lists.filter(obj => obj !== del);
          this.cdr.detectChanges();
        }
      }
      if(navParams.get('up')=== true){
        this.navCtrl.setRoot(GroupListPage);
    }
  }

  ionViewDidLoad()
  {
    let user = this.afAuth.auth.currentUser;
    let myEmail = user.email;
    //create references
    const dbRefObject = this.afDatabase.database.ref().child(`Lists/GroupLists`);

    let myGList = false;
    
    const dbRefList = dbRefObject;

    dbRefList.on('child_added', snap => {
      let ev = snap.val();
      for (let i of ev.people)
      {
        if(myEmail === i)
        myGList = true;
        else{
        myGList = false;
        }
      if(myGList){      
      this.lists.push(ev);
      this.number++;
      this.cdr.detectChanges();
      }
    }
    });

    dbRefList.on('child_changed', snap => {
      let ev = snap.val();
      for (let i of ev.people)
      {
        if(myEmail === i)
        myGList = true;
        else{
        myGList = false;
        }
      if(myGList){      
      this.lists.push(ev);
      this.cdr.detectChanges();
      }
    }
    });
  }

  viewList(list: any)
  {
    this.showCheckbox(list);
  }
  deleteList(list: any)
  {
    let user = this.afAuth.auth.currentUser;
    let myEmail = user.email;
  //create references  
  let dbRefList = this.afDatabase.database.ref().child(`Lists/GroupLists`);

  dbRefList.on('child_added', snap => {
    let ev = snap.val();
   

    if (ev.header === list.header && ev.number === list.number && ev.deadline === list.deadline && ev.people[0] === list.people[0]){
      let sil = snap.key;
      dbRefList =  dbRefList.child(`${sil}`);
      //remove from db
      dbRefList.remove();
    }
  });
    //remove from lists
this.lists = this.lists.filter(obj => obj !== list);
this.number -= 1;

}
  editList(list: any)
  {
    this.navCtrl.push(GrouplistAddModifyPage, {
      list: list,
      change: true
    });
    
  }

  addList()
  {
    this.navCtrl.push(GrouplistAddModifyPage);
  }

  presentActionSheet(list: any) {
    const actionSheet = this.actionSheetCtrl.create({
      title: 'This list',
      buttons: [
        {
          text: 'Check',
          icon: 'checkbox',
          handler: () => {
            this.viewList(list);
          }
        },{
          text: 'Edit',
          icon: 'clipboard',
          handler: () => {
            this.editList(list);
          }
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.deleteList(list);
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

  showCheckbox(list: any) {
    let temp = list.items.map(x => Object.assign({}, x));

    let alert = this.alertCtrl.create();
    alert.setTitle(list.header);

    let sub = list.people.join("<br>");

    alert.setSubTitle(sub);

    for (let it of list.items)
    {
      alert.addInput({
        type: 'checkbox',
        label: it.item,
        value: it.item,
        checked: it.checked
      });
    }
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        for (let j of list.items){
          j.checked = false;
          for (let k of data)
          {
            if(j.item === k)
            {
              j.checked = true;
            }
          }
        }

        this.updateitems = false;

        for(let i in temp)
        {
          if(temp[i].checked != list.items[i].checked){
          this.updateitems = true;
          }
        }

        if(this.updateitems === true)
        {
        this.updateChecks(list);
        }
      }
    });
    alert.present();
  }

  updateChecks(list: any)
  {
    const user = this.afAuth.auth.currentUser;
             //create references  
      let dbRefList = this.afDatabase.database.ref().child(`Lists/GroupLists`);
      let del;
      dbRefList.on('child_added', snap => {
        let ev = snap.val();    
        if (ev.header === list.header && ev.number === list.number && ev.deadline === list.deadline && ev.people[0] === list.people[0]){
          del = snap.key;
        }
      });
      dbRefList.on('child_changed', snap => {
        let ev = snap.val();    
        if (ev.header === list.header && ev.number === list.number && ev.deadline === list.deadline && ev.people[0] === list.people[0]){
          del = snap.key;
        }
      });

      dbRefList =  dbRefList.child(`${del}`);
      dbRefList.update(list);

      this.lists = this.lists.filter(obj => obj !== list);
      
  }
}
