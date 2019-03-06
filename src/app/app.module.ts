import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from "angularfire2/auth";
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { Login } from '../pages/login/login';
import { SignUp } from '../pages/signUp/signup';
import { Settings } from '../pages/settings/settings';
import { Calendar } from '../pages/calendar/calendar';
import {ListAddModifyPage} from '../pages/list-add-modify/list-add-modify';
import { PersonalListPage} from '../pages/personal-list/personal-list';
import { GroupListPage} from '../pages/group-list/group-list';
import { GrouplistAddModifyPage} from '../pages/grouplist-add-modify/grouplist-add-modify';
import {FIREBASE_CONFIG} from "./app.firebase.config";
import { HttpClientModule } from '@angular/common/http';
import { NgCalendarModule } from 'ionic2-calendar';
import { EventModalPage } from '../pages/event-modal/event-modal';
import { LocalNotifications } from '@ionic-native/local-notifications';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    Login,
    SignUp,
    Settings,
    Calendar,
    EventModalPage,
    PersonalListPage,
    GroupListPage,
    ListAddModifyPage,
    GrouplistAddModifyPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(FIREBASE_CONFIG),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HttpClientModule,
    NgCalendarModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    Login,
    SignUp,
    Settings,
    Calendar,
    EventModalPage,
    PersonalListPage,
    GroupListPage,
    ListAddModifyPage,
    GrouplistAddModifyPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocalNotifications
  ]
})
export class AppModule {}
