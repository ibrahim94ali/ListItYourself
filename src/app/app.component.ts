import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { Login } from '../pages/login/login';
import { LoadingController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage : any;
  loader : any;

  constructor(
      platform: Platform,
      statusBar: StatusBar,
      splashScreen: SplashScreen, 
      private afAuth: AngularFireAuth,
      public loadingCtrl: LoadingController) {
    
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });

    this.presentLoading();

    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.rootPage = HomePage;
      } else {
        this.rootPage = Login;
      }
      this.loader.dismiss();
    })
  }

  presentLoading() {
    this.loader = this.loadingCtrl.create({
      content: "Loading..."
    });
    this.loader.present();
  }
}