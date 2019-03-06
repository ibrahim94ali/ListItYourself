import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams, ActionSheetController, AlertController } from 'ionic-angular';
import { ListAddModifyPage } from '../list-add-modify/list-add-modify';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  selector: 'page-personal-list',
  templateUrl: 'personal-list.html',
})
export class PersonalListPage {

  lists = [];
  number = this.lists.length;
  updateitems : any;


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
        this.navCtrl.setRoot(PersonalListPage);
    }
  }

  ionViewDidLoad()
  {
    let user = this.afAuth.auth.currentUser;
    //create references
    const dbRefObject = this.afDatabase.database.ref().child(`Lists/${user.uid}`);
    
    const dbRefList = dbRefObject;

    dbRefList.on('child_added', snap => {
      let ev = snap.val();      
      this.lists.push(ev);
      this.number++;
      this.cdr.detectChanges();
    });

    dbRefList.on('child_changed', snap => {
      let ev = snap.val();
      this.lists.push(ev);
      this.cdr.detectChanges();
    });
  }

  viewList(list: any)
  {
    this.showCheckbox(list);
  }
  deleteList(list: any)
  {
    let user = this.afAuth.auth.currentUser;
  //create references  
  let dbRefList = this.afDatabase.database.ref().child(`Lists/${user.uid}`);

  dbRefList.on('child_added', snap => {
    let ev = snap.val();
   

    if (ev.header === list.header && ev.number === list.number && ev.deadline === list.deadline){
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
    this.navCtrl.push(ListAddModifyPage, {
      list: list,
      change: true
    }).then(() => {
      this.lists = this.lists.filter(obj => obj !== list); //bug: check if changes happens
    });
    
  }

  addList()
  {
    this.navCtrl.push(ListAddModifyPage);
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
      let dbRefList = this.afDatabase.database.ref().child(`Lists/${user.uid}`);
      let del;
      dbRefList.on('child_added', snap => {
        let ev = snap.val();    
        if (ev.header === list.header && ev.deadline === list.deadline && ev.number === list.number){
          del = snap.key;
        }
      });
      dbRefList.on('child_changed', snap => {
        let ev = snap.val();    
        if (ev.header === list.header && ev.deadline === list.deadline && ev.number === list.number){
          del = snap.key;
        }
      });

      dbRefList =  dbRefList.child(`${del}`);
      dbRefList.update(list);

      this.lists = this.lists.filter(obj => obj !== list);
      
  }
}
