import { Component } from '@angular/core';
import { NavController, AlertController, ToastController } from 'ionic-angular';
import { Settings } from '../settings/settings';
import { Calendar } from '../calendar/calendar';
import {PersonalListPage} from '../personal-list/personal-list';
import {GroupListPage} from '../group-list/group-list';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  tab1 = PersonalListPage;
  tab2 = GroupListPage;
  tab3 = Calendar;
  tab4 = Settings;

  constructor(public toastCtrl: ToastController, public navCtrl: NavController, public alertCtrl: AlertController) {

  }

}
