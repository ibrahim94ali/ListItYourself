import {Component, ErrorHandler} from '@angular/core';
import { NavController } from 'ionic-angular';
import { HomePage } from '../home/home';
import { Userinfo } from '../../models/userinfo';
import { User } from '../../models/user';
import { AlertController } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase }  from 'angularfire2/database';
import { Settings } from '../settings/settings';



@Component({
  selector: 'signup',
  templateUrl: 'signup.html'
})
export class SignUp {

  userinfo ={} as Userinfo; //personal information

  user = {} as User; //to authenticate user

  passwordcheck = {
    pass1 : "",
    pass2 : ""
  }

  constructor(private afAuth : AngularFireAuth, private afDatabase: AngularFireDatabase,
    public navCtrl: NavController, public alertCtrl: AlertController) {

  }

  async signUp()
  {
    if(this.userinfo.name === undefined ||  this.userinfo.surname === undefined || this.user.email === undefined || this.passwordcheck.pass1 === "" || this.passwordcheck.pass2 === "")
      {
        const prompt = this.alertCtrl.create({
          title: 'Please fill required blanks.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })
        prompt.present();
      }
    else if(this.passwordcheck.pass1 != this.passwordcheck.pass2)
      {
        const prompt = this.alertCtrl.create({
          title: 'Passwords do not match.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })
        prompt.present();
        this.passwordcheck.pass1 = "";
        this.passwordcheck.pass2 = "";
      }
      else if (this.passwordcheck.pass1.length < 6) {
    
        const prompt = this.alertCtrl.create({
          title: 'Password should be at least 6 characters.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })

        prompt.present();
        this.passwordcheck.pass1 = "";
        this.passwordcheck.pass2 = "";
      }

      else {
        this.user.password = this.passwordcheck.pass1;
        this.AuthenticateUser(this.user);
      }


  }

  async AuthenticateUser(user : User){
    try{
    const result = await this.afAuth.auth.createUserWithEmailAndPassword(user.email,
            user.password);
            this.createProfile();
    }
    catch(e){
      if(e.code === "auth/email-already-in-use")
      {
        this.emailInUseError();
      }
      else if(e.code === "auth/invalid-email")
      {
        this.emailNotValidError();
      }
      else{
        console.log(e);
      }
    }
  }

  createProfile()
  {
    try{
      const result = this.afAuth.authState.take(1).subscribe(auth=> {
          this.afDatabase.object(`/UserProfile/${auth.uid}`).set(this.userinfo)
          .then(() =>  {
            auth.sendEmailVerification();
            this.navCtrl.setRoot(HomePage)});
      });
    }
    catch(e)
    {
      console.log(e);
    }
  }

  emailInUseError()
      {
        const prompt = this.alertCtrl.create({
          title: 'E-mail is already used for another user.',
          buttons: [
            {
              text: 'OK',
              handler: data => {
              }
            },
          ]
        })

        prompt.present();

      }
  emailNotValidError()
  {
    const prompt = this.alertCtrl.create({
      title: 'Invalid e-mail.',
      buttons: [
        {
          text: 'OK',
          handler: data => {
          }
        },
      ]
    })

    prompt.present();
  }

}
